import { Module } from '@nestjs/common';
import { CompanyAuthService } from './company_auth.service';
import { CompanyModule } from 'src/company/company.module';
import { CompanyAuthResolver } from './company.resolver';

@Module({
  imports: [CompanyModule],
  providers: [CompanyAuthResolver, CompanyAuthService],
})
export class CompanyAuthModule {}
