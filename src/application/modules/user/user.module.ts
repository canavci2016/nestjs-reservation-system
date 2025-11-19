import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AdminAppUserResolver } from './admin-app.user.resolver';
import { ClientAppUserResolver } from './client-app.user.resolver';
import { AppTokenModule } from '../../../shared/modules/app-token/app-token.module';

@Global()
@Module({
  imports: [AppTokenModule],
  providers: [UserService, AdminAppUserResolver, ClientAppUserResolver],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule { }
