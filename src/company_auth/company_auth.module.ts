import { Module } from '@nestjs/common';
import { CompanyAuthService } from './company_auth.service';
import { CompanyModule } from 'src/company/company.module';
import { CompanyAuthResolver } from './company_auth.resolver';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    CompanyModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [CompanyAuthResolver, CompanyAuthService],
})
export class CompanyAuthModule {}
