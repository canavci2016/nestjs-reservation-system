import { Module } from '@nestjs/common';
import { EmployeeAuthService } from './employee_auth.service';
import { AdminAppEmployeeAuthResolver } from './admin-app.employee-auth.resolver';
import { EmployeeModule } from 'src/application/modules/employee/employee.module';

@Module({
  imports: [EmployeeModule],
  providers: [EmployeeAuthService, AdminAppEmployeeAuthResolver],
  exports: [EmployeeAuthService],
})
export class EmployeeAuthModule {}
