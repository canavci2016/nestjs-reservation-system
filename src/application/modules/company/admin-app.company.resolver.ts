import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CompanyService } from './company.service';
import { SuperAdminCompany } from './models/super-admin-company.model';
import { CompanySelfUpdateInput } from './dto/company-self-update.input';
import { CompanyAuthGuard } from 'src/application/modules/company_auth/company_auth.guard';
import { Company } from 'src/application/modules/company_auth/company_auth.decorator';
import { AuthCompanyDecoratorInterface } from 'src/application/modules/company_auth/interfaces/auth-company-decorator.interface';
import { UseGuards } from '@nestjs/common';
import { CompanyAddInput } from './dto/company-add.input';

@Resolver()
export class AdminAppCompanyResolver {
  constructor(private readonly service: CompanyService) { }

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
