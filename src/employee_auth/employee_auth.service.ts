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
  ) { }

  async signInByEmailAndPassword(
    field: SignInByEmailAndPassword,
  ): Promise<{ access_token: string }> {
    const employee = await this.employeeService.findOne({
      userName: field.userName,
    });

    if (!employee) {
      throw new NotFoundException('employee is not found');
    }

    const result = await this.employeeService.verifyPassword(employee, field.password);

    if (!result) {
      throw new UnauthorizedException('employee password is wrong');
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
    return Boolean(result?.affected);
  }

  async findByUserNameOrEmail(userNameOrEmail: string) {
    const company = await this.employeeService.find({
      where: [{ email: userNameOrEmail }, { userName: userNameOrEmail }],
    });

    return company;
  }

  getEmployeeService() {
    return this.employeeService;
  }

  async updatePassword(id: string, password: string) {
    const employee = await this.employeeService.updatePassword(id, password);
    return employee;
  }
}
