import { Injectable } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { SignInByEmailAndPassword } from './interfaces/sign-by-email-password.interface';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async signInByEmailAndPassword(
    payload: SignInByEmailAndPassword,
  ): Promise<User | null> {
    const user = await this.userService.findOne(payload);
    return user;
  }
}
