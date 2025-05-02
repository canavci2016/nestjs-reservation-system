import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Company } from 'src/company_auth/company_auth.decorator';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { UserLoginArgs } from './dto/user-login.args';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => String)
  async User_login(
    @Company() company: any,
    @Args() loginArgs: UserLoginArgs,
  ): Promise<string> {
    const user = await this.authService.signInByEmailAndPassword({
      userName: loginArgs.userName,
      password: loginArgs.password,
      companyId: company!.id as string,
    });

    return user?.name || 'unknown';
  }
}
