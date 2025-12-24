import { Resolver, Query, Args } from '@nestjs/graphql';
import { StatisticsService } from './statistics.service';
import { UserService } from '../user/user.service';
import { UserEmployeeAppointmentService } from '../user_employee_appointment/user_employee_appointment.service';
import { AdminAuth } from '../admin_auth/admin-auth-with-role.decorator';
import { Admin } from '../admin_auth/admin-auth.decorator';
import { AuthAdminDecoratorInterface } from '../admin_auth/interfaces/auth-admin-decorator.interface';
import * as moment from 'moment';
import { SearchAppointmentArgs } from './dto/search-appointment.args';
import { PaginationInput } from 'src/core/modules/pagination/dto/pagination.input';
import { PaginationPipe } from 'src/core/modules/pagination/pagination.pipe';

@Resolver()
export class AdminAppStatisticsResolver {
  constructor(
    private readonly statisticsService: StatisticsService,
    private readonly userService: UserService,
    private readonly appointmentService: UserEmployeeAppointmentService,
  ) { }

  @AdminAuth()
  @Query(() => Number)
  async AdminApp_Statistics_userCount(
    @Admin() admin: AuthAdminDecoratorInterface,
  ): Promise<number> {
    return Number(await this.userService.count({ companyId: admin.companyId }));
  }

  @AdminAuth()
  @Query(() => Number)
  async AdminApp_Statistics_appointmentCount(
    @Admin() admin: AuthAdminDecoratorInterface,
    @Args() args: SearchAppointmentArgs,
  ): Promise<number> {
    const params = {
      companyId: admin.companyId,
      startDate: args.startDate || moment().format('YYYY-MM-DD'),
      endDate: args.endDate || moment().add(1, 'M').format('YYYY-MM-DD'),
      status: args.status,
      userId: args.userId,
    };

    const count = await this.appointmentService.count(params);

    return Number(count);
  }
}
