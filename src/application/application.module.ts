import { Module } from '@nestjs/common';
import { BlogModule } from './modules/blog/blog.module';
import { AnnouncementModule } from './modules/announcement/announcement.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { UserModule } from './modules/user/user.module';
import { CompanyModule } from './modules/company/company.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { CompanyAuthModule } from './modules/company_auth/company_auth.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserPackageModule } from './modules/user_package/user_package.module';
import { UserEmployeeAppointmentModule } from './modules/user_employee_appointment/user_employee_appointment.module';
import { SuperadminAuthModule } from './modules/superadmin_auth/superadmin_auth.module';
import { AdminAuthModule } from './modules/admin_auth/admin_auth.module';
import { EmployeeAuthModule } from './modules/employee_auth/employee_auth.module';
import { EmployeeAvailabilityModule } from './modules/employee_availability/employee-availability.module';
import { UploadModule } from './modules/upload/upload.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from 'src/core/modules/config/config.module';
import { ConfigService } from 'src/core/modules/config/config.service';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [
    BlogModule,
    AnnouncementModule,
    ReportingModule,
    StatisticsModule,
    UserModule,
    CompanyModule,
    EmployeeModule,
    CompanyAuthModule,
    AuthModule,
    UserPackageModule,
    SuperadminAuthModule,
    UserEmployeeAppointmentModule,
    AdminAuthModule,
    EmployeeAuthModule,
    EmployeeAvailabilityModule,
    UploadModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Time window in milliseconds (1 minute)
        limit: 10, // Number of requests per time window
      },
    ]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        return {
          ttl: 60000, // Time to live in milliseconds (1 minute)
          stores: [new KeyvRedis(configService.get('REDIS_HOST'))],
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [
    BlogModule,
    AnnouncementModule,
    ReportingModule,
    StatisticsModule,
    UserModule,
    CompanyModule,
    EmployeeModule,
    CompanyAuthModule,
    AuthModule,
    UserPackageModule,
    SuperadminAuthModule,
    UserEmployeeAppointmentModule,
    AdminAuthModule,
    EmployeeAuthModule,
    EmployeeAvailabilityModule,
    UploadModule,
  ],
})
export class ApplicationModule { }
