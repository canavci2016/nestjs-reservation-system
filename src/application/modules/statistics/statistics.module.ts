import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { UserEmployeeAppointmentModule } from '../user_employee_appointment/user_employee_appointment.module';
import { AdminAppStatisticsResolver } from './admin-app.statistics.resolver';
import { StatisticsService } from './statistics.service';

@Module({
  imports: [UserModule, UserEmployeeAppointmentModule],
  providers: [StatisticsService, AdminAppStatisticsResolver],
  exports: [StatisticsService],
})
export class StatisticsModule {}
