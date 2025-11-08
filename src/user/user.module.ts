import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TokenModule } from 'src/token/token.module';
import { UserController } from './user.controller';
import { AdminAppUserResolver } from './admin-app.user.resolver';
import { ClientAppUserResolver } from './client-app.user.resolver';

@Global()
@Module({
  imports: [TokenModule],
  providers: [UserService, AdminAppUserResolver, ClientAppUserResolver],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule { }
