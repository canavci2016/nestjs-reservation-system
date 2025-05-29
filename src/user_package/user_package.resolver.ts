import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserPackageService } from './user_package.service';
import { UseGuards } from '@nestjs/common';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { Company } from 'src/company_auth/company_auth.decorator';
import { AuthCompanyDecoratorInterface } from 'src/company_auth/interfaces/auth-company-decorator.interface';
import { CompanyUpdateUserPackageInput } from './dto/company-update-user-package.input';
import { CompanyAddUserPackageInput } from './dto/company-add-user-package.input';
import { PaginationInput } from 'src/pagination/dto/pagination.input';
import { CompanyUserPackage } from './models/company-user-package.model';

@Resolver()
export class UserPackageResolver {
  constructor(private readonly packageService: UserPackageService) {}

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_UserPackage_add(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('payload') payload: CompanyAddUserPackageInput,
  ): Promise<boolean> {
    const model = await this.packageService.save({
      ...payload,
      companyId: company.sub,
    });
    return Boolean(model);
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_UserPackage_update(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('id') id: string,
    @Args('payload') payload: CompanyUpdateUserPackageInput,
  ): Promise<boolean> {
    const model = await this.packageService.updateById(
      {
        id,
        companyId: company.sub,
      },
      {
        ...payload,
        companyId: company.sub,
      },
    );
    return Boolean(model.affected);
  }

  @UseGuards(CompanyAuthGuard)
  @Query(() => [CompanyUserPackage])
  async AdminApp_Company_UserPackage_list(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
  ): Promise<CompanyUserPackage[]> {
    const paginationObj = {
      number: pagination?.number || 1,
      length: pagination?.length || 10,
    };
    const models = await this.packageService.findAll({
      companyId: company.sub,
      pagination: paginationObj,
    });
    return models;
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_UserPackage_delete(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('id') id: string,
  ): Promise<boolean> {
    const model = await this.packageService.deleteById({
      id,
      companyId: company.sub,
    });
    return Boolean(model.affected);
  }
}
