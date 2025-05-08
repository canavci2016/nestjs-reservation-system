import { Global, Module } from '@nestjs/common';
import { CompanyResolver } from './company.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { CompanyService } from './company.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  providers: [CompanyResolver, CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
