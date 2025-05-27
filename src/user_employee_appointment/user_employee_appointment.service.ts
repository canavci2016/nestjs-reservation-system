import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { EmployeeAvailabilityService } from 'src/employee_availability/employee-availability.service';
import { UserService } from 'src/user/user.service';
import {
  UserEmployeeAppointment,
  UserEmployeeAppointmentStatus,
} from 'src/database/entities/user-employee-appointment.entity';

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

  async history(
    params: {
      id?: string;
      employeeId?: string;
      companyId?: string;
      startDate?: string;
      endDate?: string;
      status?: UserEmployeeAppointmentStatus;
      userId?: string;
    } = {},
  ) {
    const whereQuery: Record<any, any> = {};

    if (params.id) {
      whereQuery['id'] = params.id;
    }

    if (params?.userId) {
      whereQuery['userId'] = params.userId;
    }

    if (params.status) {
      whereQuery['status'] = params.status;
    }

    if (params?.employeeId) {
      whereQuery['employeeAvailability'] = {
        employeeId: params.employeeId,
      };
    }

    if (params?.companyId) {
      whereQuery['employeeAvailability'] = {
        companyId: params.companyId,
      };
    }

    if (params.startDate && params.endDate) {
      whereQuery['employeeAvailability'] = {
        availableDate: Between(params.startDate, params.endDate),
      };
    } else if (params?.startDate) {
      whereQuery['employeeAvailability'] = {
        availableDate: params.startDate,
      };
    }

    const histories = await this.repository.find({
      relations: { employeeAvailability: { employee: true }, user: true },
      where: whereQuery,
    });

    return histories;
  }

  async save(
    payload: Partial<UserEmployeeAppointment>,
  ): Promise<UserEmployeeAppointment> {
    return this.repository.save(payload);
  }

  async accept(id: string, employeeId: string, comment: string = '') {
    const appointment = await this.history({
      id: id,
      employeeId: employeeId,
      status: UserEmployeeAppointmentStatus.PENDING,
    });

    if (appointment.length === 0) {
      throw new NotFoundException('there is no pending appointment available');
    }

    const result = await this.updateById(id, {
      status: UserEmployeeAppointmentStatus.ACCEPTED,
      comment,
    });

    return true;
  }

  async reject(id: string, employeeId: string, comment: string = '') {
    const appointment = await this.history({
      id: id,
      employeeId: employeeId,
      status: UserEmployeeAppointmentStatus.PENDING,
    });

    if (appointment.length === 0) {
      throw new NotFoundException('there is no pending appointment available');
    }

    const result = await this.updateById(id, {
      status: UserEmployeeAppointmentStatus.REJECTED,
      comment,
    });

    return true;
  }

  async updateById(id: string, payload: Partial<UserEmployeeAppointment>) {
    const result = await this.repository
      .createQueryBuilder()
      .update(UserEmployeeAppointment)
      .set(payload)
      .where('id = :id', { id: id })
      .execute();
    return result;
  }

  findOne(
    payload: Partial<UserEmployeeAppointment>,
  ): Promise<UserEmployeeAppointment | null> {
    return this.repository.findOneBy(payload);
  }
}
