import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { CompanyAppGuard } from './company_app.guard';
import { CompanyApp } from './company_app.decorator';
import { Company as CompanyModel } from './models/company.model';
import { CompanyAuthService } from './company_auth.service';

@Resolver()
export class CompanyAuthResolver {
  constructor(private readonly authService: CompanyAuthService) {}
  @UseGuards(CompanyAppGuard)
  @Query(() => CompanyModel)
  Company_profile(@CompanyApp() company: CompanyModel): CompanyModel {
    return company;
  }
}
