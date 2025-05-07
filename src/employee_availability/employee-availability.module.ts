import { Module } from '@nestjs/common';
import { EmployeeAvailabilityService } from './employee-availability.service';
import { EmployeeAvailabilityResolver } from './employee-availability.resolver';
import { EmployeeAvailability } from './employee-availability.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CompanyModule } from 'src/company/company.module';
import { EmployeeModule } from 'src/employee/employee.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeAvailability]),
    CompanyModule,
    AuthModule,
    EmployeeModule,
  ],
  providers: [EmployeeAvailabilityService, EmployeeAvailabilityResolver],
  exports: [EmployeeAvailabilityService],
})
export class EmployeeAvailabilityModule {}
