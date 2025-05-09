import { Module } from '@nestjs/common';
import { EmployeeAuthService } from './employee_auth.service';
import { EmployeeAuthResolver } from './employee_auth.resolver';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { EmployeeModule } from 'src/employee/employee.module';

@Module({
  imports: [
    EmployeeModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '10d' },
    }),
  ],
  providers: [EmployeeAuthService, EmployeeAuthResolver],
})
export class EmployeeAuthModule {}
