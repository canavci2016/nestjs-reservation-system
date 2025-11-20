import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EmployeeService } from 'src/application/modules/employee/employee.service';
import { SignInByEmailAndPassword } from './interfaces/sign-by-email-password.interface';
import { JwtService } from '@nestjs/jwt';
import { UpdateProfile } from './interfaces/update-profile';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class EmployeeAuthService {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
  ) { }

  async signInByEmailAndPassword(
    field: SignInByEmailAndPassword,
  ): Promise<{ access_token: string }> {
    const employee = await this.employeeService.findOne({
      userName: field.userName,
    });

    if (!employee) {
      throw new NotFoundException(
        this.i18n.translate('employee_auth.NOT_FOUND', {
          args: { value: field.userName },
        }),
      );
    }

    const result = await this.employeeService.verifyPassword(
      employee,
      field.password,
    );

    if (!result) {
      throw new UnauthorizedException(
        this.i18n.translate('employee_auth.PASSWORD_WRONG'),
      );
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
