import { Module } from '@nestjs/common';
import { UserEmployeeAppointmentService } from './user_employee_appointment.service';
import { UserEmployeeAppointmentResolver } from './user_employee_appointment.resolver';
import { EmployeeAvailabilityModule } from 'src/employee_availability/employee-availability.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [EmployeeAvailabilityModule, AuthModule, UserModule],
  providers: [UserEmployeeAppointmentService, UserEmployeeAppointmentResolver],
})
export class UserEmployeeAppointmentModule {}
