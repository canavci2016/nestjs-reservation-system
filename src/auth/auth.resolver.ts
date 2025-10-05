import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { ConflictException, UseGuards, ValidationPipe } from '@nestjs/common';
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
import { TokenService } from 'src/token/token.service';
import { TokenTypes } from 'src/token/token-types.enum';
import * as moment from 'moment';
import { AwsSqsMessageQueryBuilder } from 'src/core/modules/aws/aws-sqs-message-qb';
import { AwsService } from 'src/core/modules/aws/aws.service';
import { ConfigService } from 'src/core/modules/config/config.service';
import { UserUpdatePasswordInput } from './dto/user-update-password';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
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
    const res = await this.userService.updateById(authUser.sub, payload);
    return Boolean(res.affected);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async ClientApp_User_updatePassword(
    @User() authUser: AuthUserDecoratorInterface,
    @Args('payload', new ValidationPipe()) payload: UserUpdatePasswordInput,
  ): Promise<boolean> {
    const res = await this.userService.updateById(authUser.sub, {
      password: payload.password,
    });
    return Boolean(res.affected);
  }

  @UseGuards(CompanyAppGuard)
  @Query(() => Boolean)
  async ClientApp_User_ForgetPassword(
    @Args('userNameOrEmail') userNameOrEmail: string,
    @CompanyApp() company: { id: string },
  ): Promise<boolean> {
    const res = await this.authService.findByUsernameOrEmail({
      userNameOrEmail: userNameOrEmail,
      companyId: company.id,
    });

    const token = await this.tokenService.save({
      owner_type: 'user',
      owner_id: res.id,
      action: TokenTypes.FORGET_PASSWORD,
      expiresAt: moment().add(2, 'days').toDate(),
    });

    const appUrl = this.configService.get('APP_URL');
    const forgetPasswordUrl = `${appUrl}/auth/set-password?token=${token.content}`;

    const attrs = new AwsSqsMessageQueryBuilder()
      .setStr('action', 'CLIENTAPP_USER_FORGETPASSWORD')
      .setStr('userModel', res)
      .setStr('forgetPasswordUrl', forgetPasswordUrl);

    const response = await this.awsService.pushIntoQueue(attrs.getObj());
    console.log(response);
    return true;
  }

  @UseGuards(AuthGuard)
  @Query(() => String)
  ClientApp_User_check(@User() authUser: AuthUserDecoratorInterface) {
    return authUser.sub;
  }
}
