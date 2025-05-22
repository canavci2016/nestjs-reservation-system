import { Module } from '@nestjs/common';
import { SuperadminAuthResolver } from './superadmin_auth.resolver';
import { SuperAdminAuthService } from './superadmin_auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '40d' },
    }),
  ],
  providers: [SuperAdminAuthService, SuperadminAuthResolver],
  exports: [SuperAdminAuthService],
})
export class SuperadminAuthModule {}
