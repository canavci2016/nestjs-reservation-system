import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import * as moment from 'moment';
import { EmployeeService } from 'src/employee/employee.service';
import { EmployeeAvailability } from 'src/database/entities/employee-availability.entity';

@Injectable()
export class EmployeeAvailabilityService {
  constructor(
    @InjectRepository(EmployeeAvailability)
    private repository: Repository<EmployeeAvailability>,
    private readonly employeeService: EmployeeService,
  ) {
    console.log('EmployeeAvailabilityService initialized');
  }

  async getAvailableTimeSlots(payload: {
    employeeId: string;
    startDate?: string;
    endDate?: string;
  }) {
    const employee = await this.employeeService.findOne({
      id: payload.employeeId,
    });
    if (!employee) {
      throw new NotFoundException('Employee doesnt exist');
    }

    const whereQuery = {
      employeeId: payload.employeeId,
    };

    const startDate = payload.startDate
      ? moment(payload.startDate).format('YYYY-MM-DD')
      : moment().format('YYYY-MM-DD');

    const endDate = payload.endDate
      ? moment(payload.endDate).format('YYYY-MM-DD')
      : moment(startDate).format('YYYY-MM-DD');

    whereQuery['availableDate'] = Between(startDate, endDate);

    const availableSlots = await this.repository.find({
      where: whereQuery,
      relations: { appointments: true },
      order: { availableDate: 'ASC', startTime: 'ASC' },
    });

    const updatedTimeSlots = availableSlots.map((slot) => {
      const target = moment(
        `${slot.availableDate} ${slot.startTime}`,
        'YYYY-MM-DD HH:mm',
      );

      for (const slotItem of availableSlots) {
        const start = moment(
          `${slotItem.availableDate} ${slotItem.startTime}`,
          'YYYY-MM-DD HH:mm',
        );
        const end = moment(
          `${slotItem.availableDate} ${slotItem.endTime}`,
          'YYYY-MM-DD HH:mm',
        );

        const isBetween = target.isBetween(start, end);

        if (
          isBetween &&
          slotItem.id != slot.id &&
          slotItem.appointments.length > 0
        ) {
          slot.appointments.push(...slotItem.appointments);
        }
      }

      return slot;
    });

    return updatedTimeSlots;
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
    payload: FindOptionsWhere<EmployeeAvailability>,
  ): Promise<EmployeeAvailability | null> {
    return this.repository.findOneBy(payload);
  }

  async deleteBy(payload: Partial<EmployeeAvailability>) {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .from(EmployeeAvailability)
      .where(payload)
      .execute();

    return result;
  }
}
