import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CompanyService } from './company.service';
import { CompanyAddInput } from './dto/company-add.input';
import { CompanyUpdateInput } from './dto/company-update.input';
import { SuperAdminCompany } from './models/super-admin-company.model';
import { SuperAdminAuthGuard } from 'src/application/modules/superadmin_auth/superadmin_auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class SuperAdminCompanyResolver {
  constructor(private readonly service: CompanyService) {}

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
}