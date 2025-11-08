import { Module } from '@nestjs/common';
import { UserEmployeeAppointmentService } from './user_employee_appointment.service';
import { ClientAppUserEmployeeAppointmentResolver } from './client-app.user-employee-appointment.resolver';
import { AdminAppUserEmployeeAppointmentResolver } from './admin-app.user-employee-appointment.resolver';
import { EmployeeAvailabilityModule } from 'src/employee_availability/employee-availability.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { UserPackageModule } from 'src/user_package/user_package.module';

@Module({
  imports: [
    EmployeeAvailabilityModule,
    AuthModule,
    UserModule,
    UserPackageModule,
  ],
  providers: [
    UserEmployeeAppointmentService,
    ClientAppUserEmployeeAppointmentResolver,
    AdminAppUserEmployeeAppointmentResolver,
  ],
})
export class UserEmployeeAppointmentModule { }
