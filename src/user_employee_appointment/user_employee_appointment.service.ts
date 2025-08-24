import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { EmployeeAvailabilityService } from 'src/employee_availability/employee-availability.service';
import { UserService } from 'src/user/user.service';
import {
  UserEmployeeAppointment,
  UserEmployeeAppointmentStatus,
} from 'src/database/entities/user-employee-appointment.entity';
import { Pagination } from 'src/pagination/interfaces/pagination.interface';
import { UserPackageService } from 'src/user_package/user_package.service';
import { User } from 'src/database/entities/user.entity';

@Injectable()
export class UserEmployeeAppointmentService {
  constructor(
    @InjectRepository(UserEmployeeAppointment)
    private repository: Repository<UserEmployeeAppointment>,
    private readonly employeeAvailabilityService: EmployeeAvailabilityService,
    private readonly userService: UserService,
    private readonly userPackageService: UserPackageService,
  ) {
    console.log('EmployeeAvailabilityService initialized');
  }

  async book(
    params: Pick<
      UserEmployeeAppointment,
      'employeeAvailabilityId' | 'userId'
    > & { companyId: string; userCompanyPackageId?: string },
  ) {
    try {
      const { companyId, userId, employeeAvailabilityId } = params;
      const user = await this.userService.findOne({ id: userId });
      if (!user) {
        throw new NotFoundException('user doesnt exists');
      }

      const availability = await this.employeeAvailabilityService.findOne({
        id: employeeAvailabilityId,
      });

      if (!availability) {
        throw new NotFoundException('there is no such time slot');
      }

      const employee = await availability.employee;

      if (user.companyId != companyId || employee.companyId != companyId) {
        throw new NotFoundException('userid and availability is inconsistent');
      }

      const histories = await this.history({
        employeeAvailabilityId: availability.id,
      });

      const validAppointments = histories.filter(
        (hst) => hst.status != UserEmployeeAppointmentStatus.REJECTED,
      );

      if (validAppointments.length >= availability.capacity) {
        throw new UnauthorizedException(
          `the capacity ${availability.capacity} can not be exceeded`,
        );
      }

      const usersBookings = validAppointments.filter(
        (app) => app.userId == userId,
      );

      if (usersBookings.length > 0) {
        throw new ConflictException('user has already booked this time slot');
      }

      const activePackage = await this.getActivePackageForUser(
        user,
        params.userCompanyPackageId,
      );

      const res = await this.save({
        employeeAvailabilityId: employeeAvailabilityId,
        userId: userId,
        userAndCompanyUserPackageId: activePackage?.id,
      });

      return res;
    } catch (e: any) {
      if (e instanceof NotFoundException) {
        throw e;
      }

      if (e instanceof ConflictException) {
        throw e;
      }

      throw new BadRequestException(e.message);
    }
  }

  async history(
    params: Partial<
      Pick<
        UserEmployeeAppointment,
        'id' | 'userId' | 'status' | 'employeeAvailabilityId'
      >
    > & {
      employeeId?: string;
      companyId?: string;
      startDate?: string;
      endDate?: string;
      pagination?: Pagination;
    } = {},
  ) {
    const whereQuery: Record<any, any> & {
      employeeAvailability?: Record<any, any>;
    } = {};

    if (params.id) {
      whereQuery['id'] = params.id;
    }

    if (params?.userId) {
      whereQuery['userId'] = params.userId;
    }

    if (params?.employeeAvailabilityId) {
      whereQuery['employeeAvailabilityId'] = params.employeeAvailabilityId;
    }

    if (params.status) {
      whereQuery['status'] = params.status;
    }

    if (params?.employeeId) {
      whereQuery['employeeAvailability'] = {
        ...(whereQuery['employeeAvailability'] || {}),
        employeeId: params.employeeId,
      };
    }

    if (params?.companyId) {
      whereQuery['employeeAvailability'] = {
        ...(whereQuery['employeeAvailability'] || {}),
        companyId: params.companyId,
      };
    }

    if (params.startDate && params.endDate) {
      whereQuery['employeeAvailability'] = {
        ...(whereQuery['employeeAvailability'] || {}),
        availableDate: Between(params.startDate, params.endDate),
      };
    } else if (params?.startDate) {
      whereQuery['employeeAvailability'] = {
        ...(whereQuery['employeeAvailability'] || {}),
        availableDate: params.startDate,
      };
    }

    const query: Record<any, any> = {};

    const take = params?.pagination?.length || 10;
    const page = params?.pagination?.number || 1;
    const skip = (page - 1) * take;
    query['take'] = take;
    query['skip'] = skip;
    query['order'] = { createdAt: 'desc' };
    query['relations'] = {
      employeeAvailability: { employee: true },
      user: true,
    };
    query['where'] = whereQuery;

    const rawHistories = await this.repository.find(query);

    const histories = rawHistories.map((item) => {
      const obj = {
        ...item,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        employeeAvailability: item['__employeeAvailability__'],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        user: item['__user__'],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        employee: item['__employeeAvailability__'].employee,
      };

      return obj;
    });

    return histories;
  }

  async save(
    payload: Partial<UserEmployeeAppointment>,
  ): Promise<UserEmployeeAppointment> {
    return this.repository.save(payload);
  }

  async accept(
    condition: { id: string; employeeId?: string; companyId?: string },
    comment: string = '',
  ) {
    const historyQuery = {
      id: condition.id,
    };

    if (condition.employeeId) {
      historyQuery['employeeId'] = condition.employeeId;
    }

    if (condition.companyId) {
      historyQuery['companyId'] = condition.companyId;
    }

    const appointments = await this.history(historyQuery);

    if (appointments.length === 0) {
      throw new NotFoundException('there is no pending appointment available');
    }

    const appointment = appointments[0];

    if (appointment.status == UserEmployeeAppointmentStatus.ACCEPTED) {
      throw new PreconditionFailedException('appointment is already accepted');
    }

    const availability = await this.employeeAvailabilityService.findOne({
      id: appointment.employeeAvailabilityId,
    });

    if (!availability) {
      throw new NotFoundException('availibilty must be have been deleted');
    }

    if (appointment.status == UserEmployeeAppointmentStatus.REJECTED) {
      const histories = await this.history({
        employeeAvailabilityId: appointment.employeeAvailabilityId,
      });

      const validAppointments = histories.filter(
        (hst) => hst.status != UserEmployeeAppointmentStatus.REJECTED,
      );

      if (validAppointments.length >= availability.capacity) {
        throw new UnauthorizedException('capacity of the session is exceeded');
      }
    }

    const result = await this.updateById(condition.id, {
      status: UserEmployeeAppointmentStatus.ACCEPTED,
      comment,
    });

    if (appointment.userAndCompanyUserPackageId) {
      const userPackage =
        await this.userPackageService.findOneForUserAndCompanyUserPackagePivot({
          id: appointment.userAndCompanyUserPackageId,
        });

      if (!userPackage) {
        throw new NotFoundException('user package not found');
      }

      const increaseUsage =
        await this.userPackageService.updateUserAndCompanyPackage(
          userPackage.id,
          {
            numberOfUsage: userPackage.numberOfUsage + 1,
          },
        );
    }

    return true;
  }

  async reject(
    condition: { id: string; employeeId?: string; companyId?: string },
    comment: string = '',
  ) {
    const historyQuery = {
      id: condition.id,
    };

    if (condition.employeeId) {
      historyQuery['employeeId'] = condition.employeeId;
    }

    if (condition.companyId) {
      historyQuery['companyId'] = condition.companyId;
    }

    const appointments = await this.history(historyQuery);

    if (appointments.length === 0) {
      throw new NotFoundException('there is no pending appointment available');
    }

    const appointment = appointments[0];

    if (appointment.status == UserEmployeeAppointmentStatus.REJECTED) {
      throw new PreconditionFailedException('appointment is already rejected');
    }

    if (appointment.userAndCompanyUserPackageId) {
      const userPackage =
        await this.userPackageService.findOneForUserAndCompanyUserPackagePivot({
          id: appointment.userAndCompanyUserPackageId,
        });

      if (!userPackage) {
        throw new NotFoundException('user package not found');
      }

      const increaseUsage =
        await this.userPackageService.updateUserAndCompanyPackage(
          userPackage.id,
          {
            numberOfUsage: userPackage.numberOfUsage - 1,
          },
        );
    }

    const result = await this.updateById(condition.id, {
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
    payload: FindOptionsWhere<UserEmployeeAppointment>,
  ): Promise<UserEmployeeAppointment | null> {
    return this.repository.findOneBy(payload);
  }

  async getActivePackageForUser(user: User, defaultPackageId?: string) {
    const company = await user.company;

    if (!company) {
      throw new NotFoundException('company doesnt exists');
    }

    if (!company.enableUserPackageSystem) {
      return null;
    }

    const packages = await this.userPackageService.getActivePackagesForUser(
      user.id,
      defaultPackageId,
    );

    if (packages.length == 0) {
      throw new NotFoundException('active package is not found for the user');
    }

    return packages[0];
  }
}
