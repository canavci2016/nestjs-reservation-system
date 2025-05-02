import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Company } from 'src/company_auth/company_auth.decorator';
import { CompanyAuthGuard } from 'src/company_auth/company_auth.guard';
import { UserLoginArgs } from './dto/user-login.args';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { User } from './auth.decorator';
import { AuthUser } from './models/auth-user.model';
import { UserSignUpInput } from './dto/user-signup.input';

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

    return user?.access_token;
  }

  @UseGuards(CompanyAuthGuard)
  @Mutation(() => String)
  async User_signUp(
    @Company() company: any,
    @Args('payload') payload: UserSignUpInput,
  ): Promise<string> {
    const user = await this.authService.singUp({
      ...payload,
      companyId: company.id,
    });
    return user.access_token;
  }

  @UseGuards(AuthGuard)
  @Query(() => AuthUser)
  async User_profile(@User() authUser: any): Promise<AuthUser> {
    const user = await this.authService.findUserById(authUser.sub as string);
    const authUserIns = new AuthUser();
    authUserIns.id = user.id;
    authUserIns.name = user.name;
    authUserIns.lastName = user.lastName;
    authUserIns.email = user.email;
    authUserIns.phone = user.phone;

    return authUserIns;
  }
}
