import { Global, Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { AuthModule } from 'src/auth/auth.module';
import { AdminAppEmployeeResolver } from './admin-app.employee.resolver';
import { ClientAppEmployeeResolver } from './client-app.employee.resolver';

@Global()
@Module({
  imports: [AuthModule],
  providers: [EmployeeService, AdminAppEmployeeResolver, ClientAppEmployeeResolver],
  exports: [EmployeeService],
})
export class EmployeeModule {}
