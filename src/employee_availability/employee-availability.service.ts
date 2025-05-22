import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as moment from 'moment';
import { EmployeeService } from 'src/employee/employee.service';
import { EmployeeAvailability } from 'src/database/entities/employee-availability.entity';
import { UserEmployeeAppointmentStatus } from 'src/database/entities/user-employee-appointment.entity';

@Injectable()
export class EmployeeAvailabilityService {
  constructor(
    @InjectRepository(EmployeeAvailability)
    private repository: Repository<EmployeeAvailability>,
    private readonly employeeService: EmployeeService,
  ) {
    console.log('EmployeeAvailabilityService initialized');
  }

  async getAvailableTimeSlots(payload: { employeeId: string; date: string }) {
    const employee = await this.employeeService.findOne({
      id: payload.employeeId,
    });
    if (!employee) {
      throw new NotFoundException('Employee doesnt exist');
    }

    const date = moment(payload.date).format('YYYY-MM-DD');
    const availableSlots = await this.repository.find({
      where: {
        availableDate: date,
        employeeId: payload.employeeId,
        appointments: [
          {
            userId: IsNull(),
          },
          {
            status: UserEmployeeAppointmentStatus.REJECTED,
          },
        ],
      },
      relations: { appointments: true },
    });

    return availableSlots;
  }

  async save(payload: Partial<EmployeeAvailability>[]) {
    const companyId = payload[0].companyId;
    const employeeId = payload[0].employeeId;
    const employee = await this.employeeService.findOne({
      companyId,
      id: employeeId,
    });
    if (!employee) {
      throw new NotFoundException('Employee doesnt exist');
    }

    const availabilities = await this.repository.find({
      where: payload.map((emp) => ({
        companyId: emp.companyId,
        employeeId: emp.employeeId,
        availableDate: emp.availableDate,
        startTime: emp.startTime,
      })),
    });

    if (availabilities.length > 0) {
      throw new ConflictException('duplicate records');
    }

    return this.repository.save(payload);
  }

  findOne(
    payload: Partial<EmployeeAvailability>,
  ): Promise<EmployeeAvailability | null> {
    return this.repository.findOneBy(payload);
  }
}
