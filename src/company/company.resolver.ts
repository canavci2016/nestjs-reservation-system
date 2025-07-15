import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CompanyService } from './company.service';
import { CompanyAddInput } from './dto/company-add.input';
import { CompanyUpdateInput } from './dto/company-update.input';
import { SuperAdminCompany } from './models/super-admin-company.model';
import { SuperAdminAuthGuard } from 'src/superadmin_auth/superadmin_auth.guard';
import { UseGuards } from '@nestjs/common';
import { CompanyAppGuard } from 'src/company_auth/company_app.guard';
import { CompanyApp } from 'src/company_auth/company_app.decorator';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { CompanySelfUpdateInput } from './dto/company-self-update.input';
import { Company } from 'src/company_auth/company_auth.decorator';
import { AuthCompanyDecoratorInterface } from 'src/company_auth/interfaces/auth-company-decorator.interface';

@Resolver()
export class CompanyResolver {
  constructor(private readonly service: CompanyService) { }

  @UseGuards(SuperAdminAuthGuard)
  @Mutation(() => Boolean)
  async SuperAdmin_Company_add(
    @Args('payload') payload: CompanyAddInput,
  ): Promise<boolean> {
    const company = await this.service.save(payload);
    return true;
  }

  @UseGuards(SuperAdminAuthGuard)
  @Mutation(() => Boolean)
  async SuperAdmin_Company_update(
    @Args('id') id: string,
    @Args('payload') payload: CompanyUpdateInput,
  ): Promise<boolean> {
    const company = await this.service.updateById(id, payload);
    return true;
  }

  @UseGuards(SuperAdminAuthGuard)
  @Query(() => [SuperAdminCompany])
  async SuperAdmin_Company_list() {
    const companies = await this.service.findAll();
    return companies;
  }

  @UseGuards(SuperAdminAuthGuard)
  @Mutation(() => Boolean)
  async SuperAdmin_Company_delete(@Args('id') id: string) {
    const company = await this.service.deleteById(id);
    return Boolean(company.affected);
  }

  @UseGuards(CompanyAppGuard)
  @Query(() => SuperAdminCompany)
  ClienyApp_Company_detail(@CompanyApp() company: SuperAdminCompany) {
    return company;
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_updateProfile(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('payload') payload: CompanySelfUpdateInput,
  ): Promise<boolean> {
    const res = await this.service.updateById(company.sub, payload);
    return true;
  }

  @UseGuards(CompanyAuthGuard)
  @Query(() => SuperAdminCompany)
  AdminApp_Company_getProfile(
    @Company() company: AuthCompanyDecoratorInterface,
  ) {
    return company.company;
  }
}
