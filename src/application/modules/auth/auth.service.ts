import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/application/modules/user/user.service';
import { SignInByEmailAndPassword } from './interfaces/sign-by-email-password.interface';
import { JwtService } from '@nestjs/jwt';
import { Signup } from './interfaces/sign-up.interface';
import { TokenTypes } from 'src/shared/modules/app-token/token-types.enum';
import { TokenService } from 'src/core/modules/token/services/token.service';
import { ConfigService } from 'src/core/modules/config/config.service';
import * as moment from 'moment';
import { AwsSqsMessageQueryBuilder } from 'src/core/modules/aws/aws-sqs-message-qb';
import { AwsService } from 'src/core/modules/aws/aws.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly awsService: AwsService,
  ) {}

  async signInByEmailAndPassword(
    field: SignInByEmailAndPassword,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.findOne({
      userName: field.userName,
      companyId: field.companyId,
    });
    if (!user) {
      throw new NotFoundException();
    }
    const result = await this.userService.verifyPassword(user, field.password);

    if (!result) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, username: user.userName };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async singUp(field: Signup): Promise<{ access_token: string }> {
    const user = await this.userService.save(field);

    const payload = { sub: user.id, username: user.userName };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async findUserById(id: string) {
    const user = await this.userService.findOne({ id });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async findByUsernameOrEmail(payload: {
    userNameOrEmail: string;
    companyId: string;
  }) {
    let user = await this.userService.findOne({
      userName: payload.userNameOrEmail,
      companyId: payload.companyId,
    });

    if (user) {
      return user;
    }
    user = await this.userService.findOne({
      email: payload.userNameOrEmail,
      companyId: payload.companyId,
    });

    if (user) {
      return user;
    }

    throw new NotFoundException(
      'there is no account associated with given credentials',
    );
  }

  async decrytToken(token: string) {
    const payload: Record<any, any> = await this.jwtService.verifyAsync(token);

    return payload;
  }

  async updatePassword(id: string, password: string) {
    const user = await this.userService.updatePassword(id, password);
    return user;
  }

  async forgetPassword(payload: {
    userNameOrEmail: string;
    companyId: string;
  }) {
    const res = await this.findByUsernameOrEmail({
      userNameOrEmail: payload.userNameOrEmail,
      companyId: payload.companyId,
    });

    if (!res) {
      throw new NotFoundException('user is not found');
    }

    const token = await this.tokenService.save({
      owner_type: 'user',
      owner_id: res.id,
      action: TokenTypes.FORGET_PASSWORD,
      expiresAt: moment().add(2, 'days').toDate(),
    });
    const companyModel = await res.company;

    const appUrl = this.configService.get('APP_URL');
    const forgetPasswordUrl = `${appUrl}/auth/set-password?token=${token.content}`;

    const attrs = new AwsSqsMessageQueryBuilder()
      .setStr('action', 'CLIENTAPP_USER_FORGETPASSWORD')
      .setStr('userModel', res)
      .setStr('companyModel', companyModel)
      .setStr('forgetPasswordUrl', forgetPasswordUrl);

    const response = await this.awsService.pushIntoQueue(attrs.getObj());
    return response.MessageId ? true : false;
  }
}
