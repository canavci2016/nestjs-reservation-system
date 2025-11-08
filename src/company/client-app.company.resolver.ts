import { Query, Resolver } from '@nestjs/graphql';
import { SuperAdminCompany } from './models/super-admin-company.model';
import { CompanyAppGuard } from 'src/company_auth/company_app.guard';
import { CompanyApp } from 'src/company_auth/company_app.decorator';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class ClientAppCompanyResolver {
  @UseGuards(CompanyAppGuard)
  @Query(() => SuperAdminCompany)
  ClientApp_Company_detail(@CompanyApp() company: SuperAdminCompany) {
    return company;
  }
}