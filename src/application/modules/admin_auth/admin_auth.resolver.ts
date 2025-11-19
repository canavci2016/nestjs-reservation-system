import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AdminAuthService } from './admin_auth.service';
import { AdminAppAuthLoginArgs } from './dto/adminapp-auth-login.args';
import { AuthAdminResponseDto } from './dto/auth-admin-response.dto';
import * as moment from 'moment';
import { AwsService } from 'src/core/modules/aws/aws.service';
import { AwsSqsMessageQueryBuilder } from 'src/core/modules/aws/aws-sqs-message-qb';
import { ConfigService } from 'src/core/modules/config/config.service';
import { TokenService } from 'src/core/modules/token/services/token.service';
import { TokenTypes } from 'src/shared/modules/app-token/token-types.enum';
import { RateLimiting } from 'src/shared/decorators/rate-limiting.decorator';
import { Admin } from './admin-auth.decorator';
import { AdminAuth } from './admin-auth-with-role.decorator';
import { AuthAdminDecoratorInterface } from './interfaces/auth-admin-decorator.interface';
import { AdminAppAuthRegisterInput } from './dto/adminapp-auth-register.input';

@Resolver()
export class AdminAuthResolver {
  constructor(
    private readonly authService: AdminAuthService,
    private readonly tokenService: TokenService,
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
  ) { }

  @Mutation(() => AuthAdminResponseDto)
  async AdminApp_Auth_login(
    @Args() loginArgs: AdminAppAuthLoginArgs,
  ): Promise<AuthAdminResponseDto> {
    const model = await this.authService.signInByEmailAndPassword({
      userName: loginArgs.userName,
      password: loginArgs.password,
    });

    return model;
  }

  @RateLimiting({ limit: 4, expInMinutes: 1 })
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
    return response.$metadata.httpStatusCode === 200;
  }

  @AdminAuth()
  @Mutation(() => Boolean)
  async AdminApp_Auth_SetDeviceToken(
    @Admin() adminDto: AuthAdminDecoratorInterface,
    @Args('token') token: string,
  ): Promise<boolean> {
    const id =
      adminDto?.employee?.employee?.id || adminDto?.company?.company?.id;
    if (!id) {
      throw new Error('Invalid admin data');
    }
    const res = await this.authService.updateById(id, { deviceToken: token });
    return res;
  }

  @Mutation(() => AuthAdminResponseDto)
  async AdminApp_Auth_Register(
    @Args('payload') payload: AdminAppAuthRegisterInput,
  ): Promise<AuthAdminResponseDto> {
    const company = await this.authService.registerCompany(payload);
    return company;
  }
}
