import { AuthCompanyDecoratorInterface } from 'src/application/modules/company_auth/interfaces/auth-company-decorator.interface';
import { AuthEmployeeDecoratorInterface } from 'src/application/modules/employee_auth/interfaces/auth-employee-decorator.interface';

export interface AuthAdminDecoratorInterface {
  sub: string;
  username: string;
  companyId: string;
  company?: AuthCompanyDecoratorInterface;
  employee?: AuthEmployeeDecoratorInterface;
}
