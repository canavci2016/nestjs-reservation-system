import { Module } from '@nestjs/common';
import { UserPackageService } from './user_package.service';
import { UserPackageResolver } from './user_package.resolver';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  providers: [UserPackageService, UserPackageResolver],
  exports: [UserPackageService],
})
export class UserPackageModule {}
