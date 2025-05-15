import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CompanyAppGuard } from 'src/company_auth/company_app.guard';
import { AdminAuthService } from './admin_auth.service';
import { UseGuards } from '@nestjs/common';
import { Company } from 'src/company_auth/company_auth.decorator';
import { AdminAppAuthLoginArgs } from './dto/adminapp-auth-login.args';
import { AuthAdmin } from './model/auth-admin.model';

@Resolver()
export class AdminAuthResolver {
  constructor(private readonly authService: AdminAuthService) {}

  @UseGuards(CompanyAppGuard)
  @Mutation(() => AuthAdmin)
  async AdminApp_Auth_login(
    @Company() company: any,
    @Args() loginArgs: AdminAppAuthLoginArgs,
  ): Promise<AuthAdmin> {
    const model = await this.authService.signInByEmailAndPassword({
      userName: loginArgs.userName,
      password: loginArgs.password,
      companyId: company!.id as string,
    });

    return model;
  }
}
