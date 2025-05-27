import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserPackageService } from './user_package.service';
import { UseGuards } from '@nestjs/common';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { Company } from 'src/company_auth/company_auth.decorator';
import { AuthCompanyDecoratorInterface } from 'src/company_auth/interfaces/auth-company-decorator.interface';
import { CompanyAddUserPackageInput } from './dto/company-add-user-package.input';

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
}
