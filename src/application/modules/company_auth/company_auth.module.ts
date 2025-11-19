import { Module } from '@nestjs/common';
import { CompanyAuthService } from './company_auth.service';
import { CompanyAuthResolver } from './company_auth.resolver';

@Module({
  imports: [],
  providers: [CompanyAuthResolver, CompanyAuthService],
  exports: [CompanyAuthService],
})
export class CompanyAuthModule { }
