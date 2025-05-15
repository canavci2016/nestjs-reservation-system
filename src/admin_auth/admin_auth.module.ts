import { Module } from '@nestjs/common';
import { AdminAuthService } from './admin_auth.service';
import { EmployeeAuthModule } from 'src/employee_auth/employee_auth.module';
import { CompanyAuthModule } from 'src/company_auth/company_auth.module';
import { AdminAuthResolver } from './admin_auth.resolver';

@Module({
  imports: [EmployeeAuthModule, CompanyAuthModule],
  providers: [AdminAuthService, AdminAuthResolver],
})
export class AdminAuthModule {}
