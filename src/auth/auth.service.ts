import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SignInByEmailAndPassword } from './interfaces/sign-by-email-password.interface';
import { JwtService } from '@nestjs/jwt';
import { Signup } from './interfaces/sign-up.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signInByEmailAndPassword(
    field: SignInByEmailAndPassword,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.findOne({ userName: field.userName });
    if (!user) {
      throw new NotFoundException();
    }
    const result = await bcrypt.compare(field.password, user?.password);

    if (!result) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, username: user.userName };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async singUp(field: Signup): Promise<{ access_token: string }> {
    field.password = await this.generateToken(field.password);

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

  generateToken(password: string) {
    return bcrypt.hash(password, 10);
  }
}
