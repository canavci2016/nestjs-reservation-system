import { Global, Module } from '@nestjs/common';
import { CompanyResolver } from './company.resolver';
import { CompanyService } from './company.service';

@Global()
@Module({
  imports: [],
  providers: [CompanyResolver, CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
