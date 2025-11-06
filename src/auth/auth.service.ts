import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SignInByEmailAndPassword } from './interfaces/sign-by-email-password.interface';
import { JwtService } from '@nestjs/jwt';
import { Signup } from './interfaces/sign-up.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

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
}
