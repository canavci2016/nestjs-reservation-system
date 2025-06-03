import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeAvailability } from './entities/employee-availability.entity';
import { UserEmployeeAppointment } from './entities/user-employee-appointment.entity';
import { Company } from './entities/company.entity';
import { User } from './entities/user.entity';
import { Announcement } from './entities/announcement.entity';
import { Blog } from './entities/blog.entity';
import { Device } from './entities/device.entity';
import { Employee } from './entities/employee.entity';
import { SuperAdmin } from './entities/super-admin.entity';
import { CompanyUserPackage } from './entities/company-user-package.entity';
import { UserAndCompanyUserPackage } from './entities/user-and-company-user-package.entity';
import { Token } from './entities/token.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeeAvailability,
      UserEmployeeAppointment,
      Company,
      User,
      Announcement,
      Blog,
      Device,
      Employee,
      SuperAdmin,
      CompanyUserPackage,
      UserAndCompanyUserPackage,
      Token,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
