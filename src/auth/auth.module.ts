import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { TokenModule } from 'src/token/token.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [TokenModule],
  providers: [AuthService, AuthResolver],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule { }
