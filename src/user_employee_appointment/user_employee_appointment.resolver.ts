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

  @UseGuards(EmployeeAuthGuard)
  @Query(() => [UserEmployeeAppointment])
  async EmployeeApp_appointment_list(
    @Employee() employeeDto: { sub: string },
    @Args() args: SearchAppointmentArgs,
  ): Promise<UserEmployeeAppointment[]> {
    const startDate = args.startDate || moment().format('YYYY-MM-DD');
    const endDate = args.endDate || moment().format('YYYY-MM-DD');
    const status = args.status || 'PENDING';
    const list = await this.appointmentService.history({
      employeeId: employeeDto.sub,
      startDate,
      endDate,
      status,
    });
    return list;
  }
}
