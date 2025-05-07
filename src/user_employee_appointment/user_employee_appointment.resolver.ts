import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Company } from 'src/company_auth/company_auth.decorator';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { UserEmployeeAppointmentService } from './user_employee_appointment.service';
import { BookAppointmentInput } from './dto/book-appointment.input';

@Resolver()
export class UserEmployeeAppointmentResolver {
  constructor(
    private readonly appointmentService: UserEmployeeAppointmentService,
  ) {
    console.log('EmployeeAvailabilityService initialized');
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async Appointment_book(
    @Company() company: { id: string },
    @Args('payload') payload: BookAppointmentInput,
  ): Promise<boolean> {
    const res = await this.appointmentService.book(payload);
    return true;
  }
}
