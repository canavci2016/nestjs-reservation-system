import { Module } from '@nestjs/common';
import { EmployeeAvailabilityService } from './employee-availability.service';
import { ClientAppEmployeeAvailabilityResolver } from './client-app.employee-availability.resolver';
import { AdminAppEmployeeAvailabilityResolver } from './admin-app.employee-availability.resolver';
import { AuthModule } from '../auth/auth.module';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  imports: [AuthModule, EmployeeModule],
  providers: [
    EmployeeAvailabilityService,
    ClientAppEmployeeAvailabilityResolver,
    AdminAppEmployeeAvailabilityResolver,
  ],
  exports: [EmployeeAvailabilityService],
})
export class EmployeeAvailabilityModule {}
