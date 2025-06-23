import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInByEmailAndPassword } from './interfaces/sign-by-email-password.interface';
import { CompanyService } from 'src/company/company.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Signup } from './interfaces/sign-up.interface';

@Injectable()
export class CompanyAuthService {
  constructor(
    private readonly companyService: CompanyService,
    private readonly jwtService: JwtService,
  ) { }
  async signInByEmailAndPassword(
    field: SignInByEmailAndPassword,
  ): Promise<{ access_token: string }> {
    const user = await this.companyService.findOne({
      userName: field.userName,
    });
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
    const user = await this.companyService.save(field);

    const payload = { sub: user.id, username: user.userName };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async findByUserNameOrEmail(userNameOrEmail: string) {
    const company = await this.companyService.findAll({
      where: [{ userName: userNameOrEmail }],
    });

    return company;
  }

  async findById(id: string) {
    const company = await this.companyService.findOne({ id: id });

    return company;
  }

  async updatePassword(id: string, password: string) {
    const company = await this.companyService.updateById(id, { password });

    return company;
  }
}
