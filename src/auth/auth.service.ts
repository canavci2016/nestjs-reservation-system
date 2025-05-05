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
  ) {}

  async signInByEmailAndPassword(
    field: SignInByEmailAndPassword,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.findOne(field);

    if (user?.password !== field.password) {
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
  async decrytToken(token: string) {
    const payload: Record<any, any> = await this.jwtService.verifyAsync(token);

    return payload;
  }
}
