import { Module } from '@nestjs/common';
import { BlogModule } from './modules/blog/blog.module';
import { AnnouncementModule } from './modules/announcement/announcement.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { UserModule } from './modules/user/user.module';
import { CompanyModule } from './modules/company/company.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { CompanyAuthModule } from './modules/company_auth/company_auth.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserPackageModule } from './modules/user_package/user_package.module';
import { SuperadminAuthModule } from './modules/superadmin_auth/superadmin_auth.module';

@Module({
  imports: [
    BlogModule,
    AnnouncementModule,
    ReportingModule,
    UserModule,
    CompanyModule,
    EmployeeModule,
    CompanyAuthModule,
    AuthModule,
    UserPackageModule,
    SuperadminAuthModule,
  ],
  exports: [
    BlogModule,
    AnnouncementModule,
    ReportingModule,
    UserModule,
    CompanyModule,
    EmployeeModule,
    CompanyAuthModule,
    AuthModule,
    UserPackageModule,
    SuperadminAuthModule,
  ],
})
export class ApplicationModule {}
