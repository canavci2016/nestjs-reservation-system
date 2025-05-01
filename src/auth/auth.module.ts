import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { AuthResolver } from './auth.resolver';
import { CompanyModule } from 'src/company/company.module';

@Module({
  imports: [UserModule, CompanyModule],
  providers: [AuthService, AuthResolver],
})
export class AuthModule {}
