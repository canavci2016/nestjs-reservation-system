import { Module } from '@nestjs/common';
import { UserPackageService } from './user_package.service';
import { UserModule } from 'src/user/user.module';
import { AdminAppUserPackageResolver } from './admin-app.user-package.resolver';
import { ClientAppUserPackageResolver } from './client-app.user-package.resolver';

@Module({
  imports: [UserModule],
  providers: [
    UserPackageService,
    AdminAppUserPackageResolver,
    ClientAppUserPackageResolver,
  ],
  exports: [UserPackageService],
})
export class UserPackageModule { }
