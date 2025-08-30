import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { ConflictException, UseGuards } from '@nestjs/common';
import { CompanyApp } from 'src/company_auth/company_app.decorator';
import { CompanyAppGuard } from 'src/company_auth/company_app.guard';
import { UserLoginArgs } from './dto/user-login.args';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { User } from './auth.decorator';
import { AuthUser } from './models/auth-user.model';
import { UserSignUpInput } from './dto/user-signup.input';
import { UserUpdateProfileInput } from './dto/user-update-profile.input';
import { AuthUserDecoratorInterface } from './interfaces/auth-employee-decorator.interface';
import { UserService } from 'src/user/user.service';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) { }

  @UseGuards(CompanyAppGuard)
  @Mutation(() => String)
  async ClientApp_User_login(
    @CompanyApp() company: { id: string },
    @Args() loginArgs: UserLoginArgs,
  ): Promise<string> {
    const user = await this.authService.signInByEmailAndPassword({
      userName: loginArgs.userName,
      password: loginArgs.password,
      companyId: company.id,
    });

    return user?.access_token;
  }

  @UseGuards(CompanyAppGuard)
  @Mutation(() => String)
  async ClientApp_User_signUp(
    @CompanyApp() company: { id: string },
    @Args('payload') payload: UserSignUpInput,
  ): Promise<string> {

    const isUserExists = await this.userService.findOne({
      userName: payload.userName,
      companyId: company.id,
    });

    if (isUserExists) {
      throw new ConflictException('user is already available');
    }

    const user = await this.authService.singUp({
      ...payload,
      companyId: company.id,
    });
    return user.access_token;
  }

  @UseGuards(AuthGuard)
  @Query(() => AuthUser)
  async ClientApp_User_profile(@User() authUser: AuthUserDecoratorInterface) {
    const user = await this.authService.findUserById(authUser.sub);
    const authUserIns = new AuthUser();
    authUserIns.id = user.id;
    authUserIns.name = user.name;
    authUserIns.lastName = user.lastName;
    authUserIns.email = user.email;
    authUserIns.phone = user.phone;

    return authUserIns;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async ClientApp_User_update(
    @User() authUser: AuthUserDecoratorInterface,
    @Args('payload') payload: UserUpdateProfileInput,
  ): Promise<boolean> {
    const res = await this.authService.updateById(authUser.sub, payload);
    return Boolean(res.affected);
  }
}
