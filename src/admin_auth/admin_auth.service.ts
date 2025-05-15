import { Injectable } from '@nestjs/common';
import { CompanyAuthService } from 'src/company_auth/company_auth.service';
import { EmployeeAuthService } from 'src/employee_auth/employee_auth.service';
import { SignInByEmailAndPassword } from './interfaces/sign-by-email-password.interface';
import { AdminAuthRole } from './admin-auth-role.enum';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly companyService: CompanyAuthService,
    private readonly employeeService: EmployeeAuthService,
  ) {}

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
}
