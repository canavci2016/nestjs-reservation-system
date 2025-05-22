import { Global, Module } from '@nestjs/common';
import { CompanyResolver } from './company.resolver';
import { CompanyService } from './company.service';
import { SuperadminAuthModule } from 'src/superadmin_auth/superadmin_auth.module';

@Global()
@Module({
  imports: [SuperadminAuthModule],
  providers: [CompanyResolver, CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
