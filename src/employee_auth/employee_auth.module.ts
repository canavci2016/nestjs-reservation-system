import { Module } from '@nestjs/common';
import { EmployeeAuthService } from './employee_auth.service';
import { EmployeeAuthResolver } from './employee_auth.resolver';
import { EmployeeModule } from 'src/employee/employee.module';

@Module({
  imports: [EmployeeModule],
  providers: [EmployeeAuthService, EmployeeAuthResolver],
  exports: [EmployeeAuthService],
})
export class EmployeeAuthModule {}
