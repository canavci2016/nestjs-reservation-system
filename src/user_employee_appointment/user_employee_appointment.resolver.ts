import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserEmployeeAppointmentService } from './user_employee_appointment.service';
import { BookAppointmentInput } from './dto/book-appointment.input';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/auth.decorator';

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
}
