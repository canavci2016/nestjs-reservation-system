import { Module } from '@nestjs/common';
import { UserPackageService } from './user_package.service';
import { UserPackageResolver } from './user_package.resolver';

@Module({
  providers: [UserPackageService, UserPackageResolver]
})
export class UserPackageModule {}
