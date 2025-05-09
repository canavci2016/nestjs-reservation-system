import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeAvailability } from './entities/employee-availability.entity';
import { UserEmployeeAppointment } from './entities/user-employee-appointment.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeAvailability, UserEmployeeAppointment]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
