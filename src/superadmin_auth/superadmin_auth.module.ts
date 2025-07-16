import { Module } from '@nestjs/common';
import { SuperadminAuthResolver } from './superadmin_auth.resolver';
import { SuperAdminAuthService } from './superadmin_auth.service';

@Module({
  imports: [],
  providers: [SuperAdminAuthService, SuperadminAuthResolver],
  exports: [SuperAdminAuthService],
})
export class SuperadminAuthModule {}
