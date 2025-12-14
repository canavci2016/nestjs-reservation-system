import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { EmployeeAvailabilityService } from '../employee_availability/employee-availability.service';
import { UserService } from 'src/application/modules/user/user.service';
import {
  UserEmployeeAppointment,
  UserEmployeeAppointmentStatus,
} from 'src/database/entities/user-employee-appointment.entity';
import { Pagination } from 'src/core/modules/pagination/interfaces/pagination.interface';
import { UserPackageService } from 'src/application/modules/user_package/user_package.service';
import { User } from 'src/database/entities/user.entity';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class UserEmployeeAppointmentService {
  constructor(
    @InjectRepository(UserEmployeeAppointment)
    private repository: Repository<UserEmployeeAppointment>,
    private readonly employeeAvailabilityService: EmployeeAvailabilityService,
    private readonly userService: UserService,
    private readonly userPackageService: UserPackageService,
    private readonly i18n: I18nService,
  ) { }

  async book(
    params: Pick<
      UserEmployeeAppointment,
      'employeeAvailabilityId' | 'userId'
    > & {
      companyId: string;
      userCompanyPackageId?: string;
      creatorId?: string;
      creatorType?: 'user' | 'company' | 'employee';
    },
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
          this.i18n.translate('user_employee_appointment.CAPACITY_EXCEEDED', {
            args: { value: availability.capacity },
            lang: 'tr',
          }),
        );
      }

      const usersBookings = validAppointments.filter(
        (app) => app.userId == userId,
      );

      if (usersBookings.length > 0) {
        throw new UnauthorizedException(
          this.i18n.translate('user_employee_appointment.ALREADY_BOOKED', {
            args: { value: availability.capacity },
            lang: 'tr',
          }),
        );
      }

      const activePackage = await this.getActivePackageForUser(
        user,
        params.userCompanyPackageId,
      );

      const res = await this.save({
        employeeAvailabilityId: employeeAvailabilityId,
        userId: userId,
        userAndCompanyUserPackageId: activePackage?.id,
        creatorId: params.creatorId,
        creatorType: params.creatorType,
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
    const [rawHistories] = await this.findAll({
      ...params,
      relations: {
        employeeAvailability: { employee: true },
        user: true,
      },
    });

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

  async count(
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
    } = {},
  ) {
    const [, count] = await this.findAll(params);
    return count;
  }

  async findAll(
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
      relations?: Record<any, any>;
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

    whereQuery['employeeAvailability'] = {
      ...(whereQuery['employeeAvailability'] || {}),
      employee: { deletedAt: IsNull() },
    };

    const query: Record<any, any> = {};

    if (params.pagination) {
      const take = params?.pagination?.length || 10;
      const page = params?.pagination?.number || 1;
      const skip = (page - 1) * take;
      query['take'] = take;
      query['skip'] = skip;
    }

    query['order'] = { createdAt: 'desc' };
    if (params.relations) {
      query['relations'] = params.relations;
    }

    query['where'] = whereQuery;
    query['withDeleted'] = true;

    const result = await this.repository.findAndCount(query);
    return result;
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
        throw new UnauthorizedException(
          this.i18n.translate('user_employee_appointment.CAPACITY_EXCEEDED', {
            args: { value: availability.capacity },
            lang: 'tr',
          }),
        );
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
      throw new PreconditionFailedException(
        this.i18n.translate('user_employee_appointment.ALREADY_REJECTED', {
          lang: 'tr',
        }),
      );
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
      throw new NotFoundException(
        this.i18n.translate(
          'user_employee_appointment.ACTIVE_PACKAGE_NOT_FOUND',
          {
            lang: 'tr',
          },
        ),
      );
    }

    return packages[0];
  }
}
