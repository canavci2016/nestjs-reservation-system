import { UseGuards } from '@nestjs/common';
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
import { UserEmployeeAppointmentStatus } from 'src/database/entities/user-employee-appointment.entity';
import { AuthEmployeeDecoratorInterface } from 'src/employee_auth/interfaces/auth-employee-decorator.interface';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { AuthCompanyDecoratorInterface } from 'src/company_auth/interfaces/auth-company-decorator.interface';
import { Company } from 'src/company_auth/company_auth.decorator';
import { CompanyBookAppointmentInput } from './dto/company-book-appointment.input';

@Resolver()
export class UserEmployeeAppointmentResolver {
  constructor(
    private readonly appointmentService: UserEmployeeAppointmentService,
  ) {
    console.log('EmployeeAvailabilityService initialized');
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async Appointment_book(
    @User() user: { sub: string },
    @Args('payload') payload: BookAppointmentInput,
  ): Promise<boolean> {
    const res = await this.appointmentService.book({
      userId: user.sub,
      ...payload,
    });
    return true;
  }

  @UseGuards(AuthGuard)
  @Query(() => [UserEmployeeAppointment])
  async Appointment_history(
    @User() user: { sub: string },
  ): Promise<UserEmployeeAppointment[]> {
    const list = await this.appointmentService.history();
    return list;
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_Appointment_add(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('payload') payload: CompanyBookAppointmentInput,
  ): Promise<boolean> {
    const res = await this.appointmentService.book({
      ...payload,
    });
    return true;
  }

  @UseGuards(CompanyAuthGuard)
  @Query(() => [UserEmployeeAppointment])
  async AdminApp_Company_Appointment_list(
    @Company() companyDto: AuthCompanyDecoratorInterface,
    @Args() args: SearchAppointmentArgs,
  ): Promise<UserEmployeeAppointment[]> {
    const startDate = args.startDate || moment().format('YYYY-MM-DD');
    const endDate = args.endDate || moment().format('YYYY-MM-DD');
    const list = await this.appointmentService.history({
      companyId: companyDto.sub,
      startDate,
      endDate,
      status: args.status,
      userId: args.userId,
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
    const status = args.status || UserEmployeeAppointmentStatus.PENDING;

    const list = await this.appointmentService.history({
      employeeId: employeeDto.sub,
      startDate,
      endDate,
      status,
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
    const list = await this.appointmentService.accept(
      id,
      employeeDto.sub,
      comment || '',
    );

    return true;
  }

  @UseGuards(EmployeeAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Employee_Appointment_reject(
    @Employee() employeeDto: AuthEmployeeDecoratorInterface,
    @Args('id') id: string,
    @Args('comment', { nullable: true }) comment: string,
  ): Promise<boolean> {
    const list = await this.appointmentService.reject(
      id,
      employeeDto.sub,
      comment || '',
    );

    return true;
  }
}
