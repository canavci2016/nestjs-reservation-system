import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyAuthService } from 'src/application/modules/company_auth/company_auth.service';
import { EmployeeAuthService } from 'src/employee_auth/employee_auth.service';
import { SignInByEmailAndPassword } from './interfaces/sign-by-email-password.interface';
import { AdminAuthRole } from './admin-auth-role.enum';
import { AdminAppAuthRegisterInput } from './dto/adminapp-auth-register.input';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly companyService: CompanyAuthService,
    private readonly employeeService: EmployeeAuthService,
  ) { }

  async signInByEmailAndPassword(
    field: SignInByEmailAndPassword,
  ): Promise<{ access_token: string; role: AdminAuthRole }> {
    try {
      const company = await this.companyService.signInByEmailAndPassword(field);

      if (company) {
        return {
          role: AdminAuthRole.COMPANY,
          access_token: company.access_token,
        };
      }
    } catch {
      /* empty */
    }

    const employee = await this.employeeService.signInByEmailAndPassword(field);

    return {
      role: AdminAuthRole.EMPLOYEE,
      access_token: employee.access_token,
    };
  }

  async findByUsernameOrEmail(
    userNameOrEmail: string,
  ): Promise<{ role: AdminAuthRole; model: { id: string } }> {
    const company =
      await this.companyService.findByUserNameOrEmail(userNameOrEmail);

    if (company.length > 0) {
      return {
        role: AdminAuthRole.COMPANY,
        model: company[0],
      };
    }

    const employee =
      await this.employeeService.findByUserNameOrEmail(userNameOrEmail);

    if (employee.length > 0) {
      return {
        role: AdminAuthRole.EMPLOYEE,
        model: employee[0],
      };
    }

    throw new NotFoundException(
      'there is no account associated with given credentials',
    );
  }

  async findById(id: string) {
    const company = await this.companyService.findById(id);

    if (company) {
      return {
        role: AdminAuthRole.COMPANY,
        model: company,
      };
    }

    const employee = await this.employeeService.findUserById(id);

    if (employee) {
      return {
        role: AdminAuthRole.EMPLOYEE,
        model: employee,
      };
    }

    throw new NotFoundException(
      'there is no account associated with given credentials',
    );
  }

  async updatePassword(id: string, password: string) {
    return this.companyService.updateById(id, { password });
  }

  async updateById(
    id: string,
    payload: { password?: string; deviceToken?: string },
  ) {
    const company = await this.companyService.updateById(id, payload);

    const employee = await this.employeeService.updateById(id, payload);

    return true;
  }

  async registerCompany(dto: AdminAppAuthRegisterInput) {
    const company = await this.companyService.register(dto);

    return {
      role: AdminAuthRole.COMPANY,
      access_token: company.access_token,
    };
  }
}
