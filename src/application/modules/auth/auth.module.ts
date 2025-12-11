import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { AuthController } from './auth.controller';
import { AppTokenModule } from '../../shared/modules/app-token/app-token.module';

@Module({
  imports: [AppTokenModule],
  providers: [AuthService, AuthResolver],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule { }
