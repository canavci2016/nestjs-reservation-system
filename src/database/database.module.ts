import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeAvailability } from './entities/employee-availability.entity';
import { UserEmployeeAppointment } from './entities/user-employee-appointment.entity';
import { Company } from './entities/company.entity';
import { User } from './entities/user.entity';
import { Announcement } from './entities/announcement.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeeAvailability,
      UserEmployeeAppointment,
      Company,
      User,
      Announcement,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
