import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEmployeeAppointment } from './user-employee-appointment.entity';
import { Repository } from 'typeorm';
import { EmployeeAvailabilityService } from 'src/employee_availability/employee-availability.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UserEmployeeAppointmentService {
  constructor(
    @InjectRepository(UserEmployeeAppointment)
    private repository: Repository<UserEmployeeAppointment>,
    private readonly employeeAvailabilityService: EmployeeAvailabilityService,
    private readonly userService: UserService,
  ) {
    console.log('EmployeeAvailabilityService initialized');
  }

  async book(
    params: Pick<UserEmployeeAppointment, 'employeeAvailabilityId' | 'userId'>,
  ) {
    try {
      const user = await this.userService.findOne({ id: params.userId });
      if (!user) {
        throw new NotFoundException('user doesnt exists');
      }

      const availability = await this.employeeAvailabilityService.findOne({
        id: params.employeeAvailabilityId,
      });

      if (!availability) {
        throw new NotFoundException('there is no such time slot');
      }

      const booking = await this.findOne({
        employeeAvailabilityId: params.employeeAvailabilityId,
        userId: params.userId,
      });

      if (booking) {
        throw new ConflictException('user already has booked this time slot');
      }

      const res = await this.save({
        employeeAvailabilityId: params.employeeAvailabilityId,
        userId: params.userId,
      });
    } catch (e: any) {
      if (e instanceof NotFoundException) {
        throw e;
      }

      if (e instanceof ConflictException) {
        throw e;
      }

      throw new BadRequestException(e.message);
    }

    return true;
  }

  async save(
    payload: Partial<UserEmployeeAppointment>,
  ): Promise<UserEmployeeAppointment> {
    return this.repository.save(payload);
  }

  findOne(
    payload: Partial<UserEmployeeAppointment>,
  ): Promise<UserEmployeeAppointment | null> {
    return this.repository.findOneBy(payload);
  }
}
