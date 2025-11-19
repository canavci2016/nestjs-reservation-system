import { Module } from '@nestjs/common';
import { AdminAuthService } from './admin_auth.service';
import { EmployeeAuthModule } from 'src/application/modules/employee_auth/employee_auth.module';
import { CompanyAuthModule } from 'src/application/modules/company_auth/company_auth.module';
import { AdminAuthResolver } from './admin_auth.resolver';
import { AdminAuthController } from './admin-auth.controller';
import { AppTokenModule } from 'src/shared/modules/app-token/app-token.module';

@Module({
  imports: [EmployeeAuthModule, CompanyAuthModule, AppTokenModule],
  providers: [AdminAuthService, AdminAuthResolver],
  controllers: [AdminAuthController],
})
export class AdminAuthModule {}
