import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CompanyService } from 'src/application/modules/company/company.service';
import { JwtService } from 'src/core/modules/token/services/jwt.service';

@Injectable()
export class CompanyAuthService {
  constructor(
    private readonly companyService: CompanyService,
    private readonly jwtService: JwtService,
  ) { }
  async signInByEmailAndPassword(field: {
    userName: string;
    password: string;
  }): Promise<{ access_token: string }> {
    const user = await this.companyService.findOne({
      userName: field.userName,
    });
    if (!user) {
      throw new NotFoundException();
    }
    const result = await this.companyService.verifyPassword(
      user,
      field.password,
    );

    if (!result) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, username: user.userName };
    return {
      access_token: await this.jwtService.getToken(payload),
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

  async updateById(id: string, payload: { password?: string; token?: string }) {
    const company = await this.companyService.updateById(id, payload);

    return company;
  }

  async register(field: {
    name: string;
    userName: string;
    password: string;
    email?: string;
  }): Promise<{ access_token: string }> {
    const user = await this.companyService.save(field);
    const loginResponse = await this.signInByEmailAndPassword({
      userName: field.userName,
      password: field.password,
    });
    return loginResponse;
  }
}
