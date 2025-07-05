import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
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
    params: Pick<UserEmployeeAppointment, 'employeeAvailabilityId' | 'userId'> &
      Partial<Pick<UserEmployeeAppointment, 'status'>> & { companyId: string },
  ) {
    try {
      const companyId = params.companyId;
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

      const employee = await availability.employee;

      if (user.companyId != companyId || employee.companyId != companyId) {
        throw new NotFoundException('userid and availability is inconsistent');
      }

      const activePackageId = await this.deductUsageFromThePackage(user);

      const booking = await this.findOne({
        employeeAvailabilityId: params.employeeAvailabilityId,
        userId: params.userId,
      });

      if (booking) {
        throw new ConflictException('user has already booked this time slot');
      }

      const res = await this.save({
        employeeAvailabilityId: params.employeeAvailabilityId,
        userId: params.userId,
        userAndCompanyUserPackageId: activePackageId,
        ...(params.status ? { status: params.status } : {}),
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
    params: {
      id?: string;
      employeeId?: string;
      companyId?: string;
      startDate?: string;
      endDate?: string;
      status?: UserEmployeeAppointmentStatus;
      userId?: string;
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
      status: UserEmployeeAppointmentStatus.PENDING,
    };

    if (condition.employeeId) {
      historyQuery['employeeId'] = condition.employeeId;
    }

    if (condition.companyId) {
      historyQuery['companyId'] = condition.companyId;
    }

    const appointment = await this.history(historyQuery);

    if (appointment.length === 0) {
      throw new NotFoundException('there is no pending appointment available');
    }

    const result = await this.updateById(condition.id, {
      status: UserEmployeeAppointmentStatus.ACCEPTED,
      comment,
    });

    return true;
  }

  async reject(
    condition: { id: string; employeeId?: string; companyId?: string },
    comment: string = '',
  ) {
    const historyQuery = {
      id: condition.id,
      status: UserEmployeeAppointmentStatus.PENDING,
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

  async deductUsageFromThePackage(user: User) {
    const company = await user.company;

    if (!company) {
      throw new NotFoundException('company doesnt exists');
    }

    if (company.enableUserPackageSystem) {
      const activePackage =
        await this.userPackageService.getActivePackageForUser(user.id);

      if (!activePackage) {
        throw new NotFoundException('active package not found for the user');
      }

      const updateRes =
        await this.userPackageService.updateUserAndCompanyPackage(
          activePackage.id,
          {
            numberOfUsage: activePackage.numberOfUsage + 1,
          },
        );

      return activePackage.id;
    }

    return null;
  }
}
