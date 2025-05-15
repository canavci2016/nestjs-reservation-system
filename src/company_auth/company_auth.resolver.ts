import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CompanyAppGuard } from './company_app.guard';
import { Company } from './company_auth.decorator';
import { Company as CompanyModel } from './models/company.model';
import { CompanyLoginArgs } from './dto/company-login.args';
import { CompanyAuthService } from './company_auth.service';
import { CompanyRegisterInput } from './dto/category-register.input';

@Resolver()
export class CompanyAuthResolver {
  constructor(private readonly authService: CompanyAuthService) {}
  @UseGuards(CompanyAppGuard)
  @Query(() => CompanyModel)
  Company_profile(@Company() company: CompanyModel): CompanyModel {
    return company;
  }

  @Mutation(() => String)
  async AdminApp_Company_login(
    @Args() loginArgs: CompanyLoginArgs,
  ): Promise<string> {
    const user = await this.authService.signInByEmailAndPassword({
      userName: loginArgs.userName,
      password: loginArgs.password,
    });

    return user?.access_token;
  }

  @Mutation(() => String)
  async AdminApp_Company_register(
    @Args('payload') payload: CompanyRegisterInput,
  ): Promise<string> {
    const company = await this.authService.singUp({
      name: payload.name,
      secretKey: payload.secretKey,
      isActive: payload.isActive || true,
      userName: payload.userName,
      password: payload.password,
    });

    return company.access_token;
  }
}
