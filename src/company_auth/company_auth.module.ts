import { Module } from '@nestjs/common';
import { CompanyAuthService } from './company_auth.service';
import { CompanyAuthResolver } from './company_auth.resolver';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '10d' },
    }),
  ],
  providers: [CompanyAuthResolver, CompanyAuthService],
  exports: [CompanyAuthService],
})
export class CompanyAuthModule {}
