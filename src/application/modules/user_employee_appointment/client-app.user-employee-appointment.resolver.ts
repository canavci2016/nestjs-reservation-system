import {
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserEmployeeAppointmentService } from './user_employee_appointment.service';
import { BookAppointmentInput } from './dto/book-appointment.input';
import { AuthGuard } from 'src/application/modules/auth/auth.guard';
import { User } from 'src/application/modules/auth/auth.decorator';
import { UserEmployeeAppointment } from './models/user-employee-appointment.model';
import * as moment from 'moment';
import { AuthUserDecoratorInterface } from 'src/application/modules/auth/interfaces/auth-employee-decorator.interface';
import { PaginationInput } from 'src/core/modules/pagination/dto/pagination.input';
import { ClientAppSearchAppointmentArgs } from './dto/clientapp-search-appointment.args';
import { AwsService } from 'src/core/modules/aws/aws.service';
import { EmployeeService } from 'src/application/modules/employee/employee.service';
import { PaginationPipe } from 'src/core/modules/pagination/pagination.pipe';
import { AwsSqsMessageQueryBuilder } from 'src/core/modules/aws/aws-sqs-message-qb';
import { I18nService } from 'nestjs-i18n';

@Resolver()
export class ClientAppUserEmployeeAppointmentResolver {
  constructor(
    private readonly appointmentService: UserEmployeeAppointmentService,
    private readonly awsService: AwsService,
    private readonly employeeService: EmployeeService,
    private readonly i18n: I18nService,
  ) { }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async ClientApp_Appointment_book(
    @User() user: AuthUserDecoratorInterface,
    @Args('payload') payload: BookAppointmentInput,
  ): Promise<boolean> {
    const res = await this.appointmentService.book({
      userId: user.sub,
      companyId: user.user.companyId,
      creatorId: user.sub,
      creatorType: 'user',
      ...payload,
    });

    const appointment = await this.appointmentService.findOne({ id: res.id });

    if (!appointment) {
      throw new NotFoundException('appointment is not present');
    }

    const userModel = await appointment.user;
    const availabilityModel = await appointment.employeeAvailability;
    const employee = await this.employeeService.findOne({
      id: availabilityModel.employeeId,
    });

    if (!employee) {
      throw new NotFoundException('employee is not present');
    }

    const company = await userModel.company;

    const attributes = new AwsSqsMessageQueryBuilder()
      .setStr('action', 'CLIENTAPP_APPOINTMENT_BOOK')
      .setStr('employeeModel', employee)
      .setStr('companyModel', company)
      .setStr('userModel', userModel)
      .setStr('availabilityModel', availabilityModel);

    const response = await this.awsService.pushIntoQueue(attributes.getObj());

    return true;
  }

  @UseGuards(AuthGuard)
  @Query(() => [UserEmployeeAppointment])
  async ClientApp_Appointment_history(
    @User() user: AuthUserDecoratorInterface,
    @Args('pagination', { nullable: true }, PaginationPipe)
    pagination: PaginationInput,
    @Args() args: ClientAppSearchAppointmentArgs,
  ): Promise<UserEmployeeAppointment[]> {
    const startDate = args.startDate || moment().format('YYYY-MM-DD');
    const endDate = args.endDate || moment().format('YYYY-MM-DD');

    const list = await this.appointmentService.history({
      userId: user.sub,
      pagination: pagination,
      startDate,
      endDate,
    });
    return list;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async ClientApp_Appointment_reject(
    @User() user: AuthUserDecoratorInterface,
    @Args('id') id: string,
    @Args('comment', { nullable: true }) comment: string,
  ): Promise<boolean> {
    const appointment = await this.appointmentService.findOne({ id: id });

    if (appointment?.creatorId != user.sub) {
      throw new ForbiddenException(
        this.i18n.translate('user_employee_appointment.WRONG_OWNER', {
          lang: 'tr',
        }),
      );
    }

    const res = await this.appointmentService.reject({ id }, comment || '');

    return res;
  }
}
