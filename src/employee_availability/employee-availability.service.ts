import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeAvailability } from './employee-availability.entity';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import { EmployeeService } from 'src/employee/employee.service';

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
    return this.repository.find({
      where: {
        availableDate: date,
        employeeId: payload.employeeId,
      },
    });
  }

  async save(
    payload: Partial<EmployeeAvailability>,
  ): Promise<EmployeeAvailability> {
    const employee = await this.employeeService.findOne({
      companyId: payload.companyId,
      id: payload.employeeId,
    });
    if (!employee) {
      throw new NotFoundException('Employee doesnt exist');
    }
    return this.repository.save(payload);
  }

  findOne(
    payload: Partial<EmployeeAvailability>,
  ): Promise<EmployeeAvailability | null> {
    return this.repository.findOneBy(payload);
  }
}
