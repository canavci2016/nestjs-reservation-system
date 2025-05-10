import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EmployeeService } from 'src/employee/employee.service';
import { SignInByEmailAndPassword } from './interfaces/sign-by-email-password.interface';
import { JwtService } from '@nestjs/jwt';
import { UpdateProfile } from './interfaces/update-profile';

@Injectable()
export class EmployeeAuthService {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly jwtService: JwtService,
  ) {}

  async signInByEmailAndPassword(
    field: SignInByEmailAndPassword,
  ): Promise<{ access_token: string }> {
    const employee = await this.employeeService.findOne(field);

    if (employee?.password !== field.password) {
      throw new UnauthorizedException();
    }

    const payload = { sub: employee.id, username: employee.userName };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async findUserById(id: string) {
    const user = await this.employeeService.findOne({ id });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async updateById(id: string, payload: Partial<UpdateProfile>) {
    const result = await this.employeeService.updateById(id, payload);
    const affected = result.affected || 0;
    return affected > 0 ? true : false;
  }
}
