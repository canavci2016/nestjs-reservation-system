import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { CompanyService } from 'src/company/company.service';
import { CompanyAuthGuard } from './company_auth.guard';
import { Company } from './company_auth.decorator';
import { Company as CompanyModel } from './models/company.model';

@Resolver()
export class CompanyAuthResolver {
  constructor(private readonly companyService: CompanyService) {}
  @UseGuards(CompanyAuthGuard)
  @Query(() => CompanyModel)
  Company_profile(@Company() company: CompanyModel): CompanyModel {
    return company;
  }
}
