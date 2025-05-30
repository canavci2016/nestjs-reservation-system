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
import { CompanyAttachUserPackageInput } from './dto/company-attach-user-package.input';
import { UserAndCompanyUserPackage } from './models/user-and-company-user-package.model';
import { CompanyDetachUserPackageInput } from './dto/company-detach-user-package.input';

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
  @Query(() => [UserAndCompanyUserPackage])
  async AdminApp_Company_UserPackage_listForAUser(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('userId') userId: string,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
  ): Promise<UserAndCompanyUserPackage[]> {
    const paginationObj = {
      number: pagination?.number || 1,
      length: pagination?.length || 10,
    };
    const models = await this.packageService.findAllForUserAndPackage({
      userId: userId,
      companyId: company.sub,
      pagination: paginationObj,
    });

    const result = models.map((m) => ({
      ...m,
      startDate: m.startDate.toString(),
      endDate: m.endDate.toString(),
    }));

    return result;
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

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_UserPackage_attach(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('payload') payload: CompanyAttachUserPackageInput,
  ): Promise<boolean> {
    const model = await this.packageService.attachACompanyUserPackageToUser({
      userId: payload.userId,
      id: payload.id,
      companyId: company.sub,
    });
    return Boolean(model);
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => Boolean)
  async AdminApp_Company_UserPackage_detach(
    @Company() company: AuthCompanyDecoratorInterface,
    @Args('payload') payload: CompanyDetachUserPackageInput,
  ): Promise<boolean> {
    const model = await this.packageService.detachACompanyUserPackageFromUser({
      id: payload.id,
    });
    return Boolean(model.affected);
  }
}
