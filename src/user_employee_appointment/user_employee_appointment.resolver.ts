import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserEmployeeAppointmentService } from './user_employee_appointment.service';
import { BookAppointmentInput } from './dto/book-appointment.input';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/auth.decorator';
import { UserEmployeeAppointment } from './models/user-employee-appointment.model';
import { EmployeeAuthGuard } from 'src/employee_auth/employee-auth.guard';
import { Employee } from 'src/employee_auth/employee.decorator';
import { SearchAppointmentArgs } from './dto/search-appointment.args';
import * as moment from 'moment';
import { AuthEmployeeDecoratorInterface } from 'src/employee_auth/interfaces/auth-employee-decorator.interface';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { AuthCompanyDecoratorInterface } from 'src/company_auth/interfaces/auth-company-decorator.interface';
import { Company } from 'src/company_auth/company_auth.decorator';
import { CompanyBookAppointmentInput } from './dto/company-book-appointment.input';
import { AuthUserDecoratorInterface } from 'src/auth/interfaces/auth-employee-decorator.interface';
import { PaginationInput } from 'src/core/modules/pagination/dto/pagination.input';
import { ClientAppSearchAppointmentArgs } from './dto/clientapp-search-appointment.args';
import { AwsService } from 'src/core/modules/aws/aws.service';
import { EmployeeService } from 'src/employee/employee.service';
import { PaginationPipe } from 'src/core/modules/pagination/pagination.pipe';
import { AwsSqsMessageQueryBuilder } from 'src/core/modules/aws/aws-sqs-message-qb';

@Resolver()
export class UserEmployeeAppointmentResolver {
  constructor(
    private readonly appointmentService: UserEmployeeAppointmentService,
    private readonly awsService: AwsService,
    private readonly employeeService: EmployeeService,
  ) {
    console.log('EmployeeAvailabilityService initialized');
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async ClientApp_Appointment_book(
    @User() user: AuthUserDecoratorInterface,
    @Args('payload') payload: BookAppointmentInput,
  ): Promise<boolean> {
    const res = await this.appointmentService.book({
      userId: user.sub,
      companyId: user.user.companyId,
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
    @Args('id') id: string,
    @Args('comment', { nullable: true }) comment: string,
  ): Promise<boolean> {
    const list = await this.appointmentService.reject({ id }, comment || '');

    return true;
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_Appointment_add(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('payload') payload: CompanyBookAppointmentInput,
  ): Promise<boolean> {
    const res = await this.appointmentService.book({
      ...payload,
      companyId: company.sub,
    });

    const accept = await this.appointmentService.accept({ id: res.id });

    const appointment = await this.appointmentService.findOne({ id: res.id });

    if (!appointment) {
      throw new NotFoundException('appointment is not present');
    }

    const userModel = await appointment.user;
    const availabilityModel = await appointment.employeeAvailability;
    const employeeModel = await availabilityModel.employee;

    const attributes = new AwsSqsMessageQueryBuilder()
      .setStr('action', 'ADMINAPP_COMPANY_APPOINTMENT_ADD')
      .setStr('companyModel', company.company)
      .setStr('userModel', userModel)
      .setStr('availabilityModel', availabilityModel)
      .setStr('employeeModel', employeeModel);

    const response = await this.awsService.pushIntoQueue(attributes.getObj());
    return true;
  }

  @UseGuards(EmployeeAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Employee_Appointment_add(
    @Employee() employee: AuthEmployeeDecoratorInterface,
    @Args('payload') payload: CompanyBookAppointmentInput,
  ): Promise<boolean> {
    const res = await this.appointmentService.book({
      ...payload,
      companyId: employee.employee.companyId,
    });

    const accept = await this.appointmentService.accept({ id: res.id });

    const appointment = await this.appointmentService.findOne({ id: res.id });

    if (!appointment) {
      throw new NotFoundException('appointment is not present');
    }

    const userModel = await appointment.user;
    const availabilityModel = await appointment.employeeAvailability;

    const attributes = new AwsSqsMessageQueryBuilder()
      .setStr('action', 'ADMINAPP_EMPLOYEE_APPOINTMENT_ADD')
      .setStr('employeeModel', employee.employee)
      .setStr('userModel', userModel)
      .setStr('availabilityModel', availabilityModel);

    const response = await this.awsService.pushIntoQueue(attributes.getObj());
    return true;
  }

  @UseGuards(CompanyAuthGuard)
  @Query(() => [UserEmployeeAppointment])
  async AdminApp_Company_Appointment_list(
    @Company() companyDto: AuthCompanyDecoratorInterface,
    @Args() args: SearchAppointmentArgs,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
  ): Promise<UserEmployeeAppointment[]> {
    const startDate = args.startDate || moment().format('YYYY-MM-DD');
    const endDate = args.endDate || moment().format('YYYY-MM-DD');
    const list = await this.appointmentService.history({
      companyId: companyDto.sub,
      startDate,
      endDate,
      status: args.status,
      userId: args.userId,
      employeeId: args.employeeId,
    });
    return list;
  }

  @UseGuards(EmployeeAuthGuard)
  @Query(() => [UserEmployeeAppointment])
  async AdminApp_Employee_Appointment_list(
    @Employee() employeeDto: AuthEmployeeDecoratorInterface,
    @Args() args: SearchAppointmentArgs,
  ): Promise<UserEmployeeAppointment[]> {
    const startDate = args.startDate || moment().format('YYYY-MM-DD');
    const endDate = args.endDate || moment().format('YYYY-MM-DD');

    const list = await this.appointmentService.history({
      employeeId: args.employeeId || employeeDto.sub,
      startDate,
      endDate,
      status: args.status,
    });

    return list;
  }

  @UseGuards(EmployeeAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Employee_Appointment_accept(
    @Employee() employeeDto: AuthEmployeeDecoratorInterface,
    @Args('id') id: string,
    @Args('comment', { nullable: true }) comment: string,
  ): Promise<boolean> {
    const res = await this.appointmentService.accept(
      { id, employeeId: employeeDto.sub },
      comment || '',
    );

    const appointment = await this.appointmentService.findOne({ id: id });

    if (!appointment) {
      throw new NotFoundException('there is no valid appointment');
    }

    const userModel = await appointment.user;

    if (!userModel) {
      throw new NotFoundException('there is no valid user');
    }

    const availabilityModel = await appointment.employeeAvailability;

    if (!availabilityModel) {
      throw new NotFoundException('there is no valid availibity');
    }

    const attrs = new AwsSqsMessageQueryBuilder()
      .setStr('action', 'ADMINAPP_EMPLOYEE_APPOINTMENT_ACCEPT')
      .setStr('employeeModel', employeeDto.employee)
      .setStr('userModel', userModel)
      .setStr('availabilityModel', availabilityModel);

    const response = await this.awsService.pushIntoQueue(attrs.getObj());

    return Boolean(response.MessageId);
  }

  @UseGuards(EmployeeAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Employee_Appointment_reject(
    @Employee() employeeDto: AuthEmployeeDecoratorInterface,
    @Args('id') id: string,
    @Args('comment', { nullable: true }) comment: string,
  ): Promise<boolean> {
    const list = await this.appointmentService.reject(
      { id, employeeId: employeeDto.sub },
      comment || '',
    );

    const appointment = await this.appointmentService.findOne({ id: id });

    if (!appointment) {
      throw new NotFoundException('there is no valid appointment');
    }

    const userModel = await appointment.user;

    if (!userModel) {
      throw new NotFoundException('there is no valid user');
    }

    const availabilityModel = await appointment.employeeAvailability;

    if (!availabilityModel) {
      throw new NotFoundException('there is no valid availibity');
    }

    const attributes = new AwsSqsMessageQueryBuilder()
      .setStr('action', 'ADMINAPP_EMPLOYEE_APPOINTMENT_REJECT')
      .setStr('employeeModel', employeeDto.employee)
      .setStr('userModel', userModel)
      .setStr('availabilityModel', availabilityModel);

    const response = await this.awsService.pushIntoQueue(attributes.getObj());

    return Boolean(response.MessageId);
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_Appointment_accept(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('id') id: string,
    @Args('comment', { nullable: true }) comment: string,
  ): Promise<boolean> {
    const list = await this.appointmentService.accept(
      { id, companyId: company.sub },
      comment || '',
    );

    const appointment = await this.appointmentService.findOne({ id: id });

    if (!appointment) {
      throw new NotFoundException('there is no valid appointment');
    }

    const userModel = await appointment.user;

    if (!userModel) {
      throw new NotFoundException('there is no valid user');
    }

    const availabilityModel = await appointment.employeeAvailability;

    if (!availabilityModel) {
      throw new NotFoundException('there is no valid availibity');
    }

    const attributes = new AwsSqsMessageQueryBuilder()
      .setStr('action', 'ADMINAPP_COMPANY_APPOINTMENT_ACCEPT')
      .setStr('companyModel', company.company)
      .setStr('userModel', userModel)
      .setStr('availabilityModel', availabilityModel);

    const response = await this.awsService.pushIntoQueue(attributes.getObj());

    return Boolean(response.MessageId);
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_Appointment_reject(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('id') id: string,
    @Args('comment', { nullable: true }) comment: string,
  ): Promise<boolean> {
    const list = await this.appointmentService.reject(
      { id, companyId: company.sub },
      comment || '',
    );

    const appointment = await this.appointmentService.findOne({ id: id });

    if (!appointment) {
      throw new NotFoundException('there is no valid appointment');
    }

    const userModel = await appointment.user;

    if (!userModel) {
      throw new NotFoundException('there is no valid user');
    }

    const availabilityModel = await appointment.employeeAvailability;

    if (!availabilityModel) {
      throw new NotFoundException('there is no valid availibity');
    }

    const attributes = new AwsSqsMessageQueryBuilder()
      .setStr('action', 'ADMINAPP_COMPANY_APPOINTMENT_REJECT')
      .setStr('companyModel', company.company)
      .setStr('userModel', userModel)
      .setStr('availabilityModel', availabilityModel);

    const response = await this.awsService.pushIntoQueue(attributes.getObj());

    return Boolean(response.MessageId);
  }
}
