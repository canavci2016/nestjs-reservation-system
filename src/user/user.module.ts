import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { TokenModule } from 'src/token/token.module';
import { UserController } from './user.controller';

@Global()
@Module({
  imports: [TokenModule],
  providers: [UserService, UserResolver],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule { }
