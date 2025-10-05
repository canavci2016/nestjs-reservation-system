import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AdminAuthService } from './admin_auth.service';
import { AdminAppAuthLoginArgs } from './dto/adminapp-auth-login.args';
import { AuthAdmin } from './model/auth-admin.model';
import { TokenService } from 'src/token/token.service';
import { TokenTypes } from 'src/token/token-types.enum';
import * as moment from 'moment';
import { AwsService } from 'src/core/modules/aws/aws.service';
import { AwsSqsMessageQueryBuilder } from 'src/core/modules/aws/aws-sqs-message-qb';
import { ConfigService } from 'src/core/modules/config/config.service';

@Resolver()
export class AdminAuthResolver {
  constructor(
    private readonly authService: AdminAuthService,
    private readonly tokenService: TokenService,
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
  ) { }

  @Mutation(() => AuthAdmin)
  async AdminApp_Auth_login(
    @Args() loginArgs: AdminAppAuthLoginArgs,
  ): Promise<AuthAdmin> {
    const model = await this.authService.signInByEmailAndPassword({
      userName: loginArgs.userName,
      password: loginArgs.password,
    });

    return model;
  }

  @Query(() => Boolean)
  async AdminApp_Auth_ForgetPassword(
    @Args('userNameOrEmail') userNameOrEmail: string,
  ): Promise<boolean> {
    const res = await this.authService.findByUsernameOrEmail(userNameOrEmail);

    const token = await this.tokenService.save({
      owner_type: res.role.toLowerCase(),
      owner_id: res.model.id,
      action: TokenTypes.FORGET_PASSWORD,
      expiresAt: moment().add(2, 'days').toDate(),
    });

    const appUrl = this.configService.get('APP_URL');
    const forgetPasswordUrl = `${appUrl}/admin-auth/set-password?token=${token.content}`;

    const attrs = new AwsSqsMessageQueryBuilder()
      .setStr('action', 'ADMINAPP_AUTH_FORGETPASSWORD')
      .setStr('adminModel', res.model)
      .setStr('forgetPasswordUrl', forgetPasswordUrl);

    const response = await this.awsService.pushIntoQueue(attrs.getObj());
    console.log(response);
    return true;
  }
}
