import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CompanyService } from 'src/application/modules/company/company.service';
import { EmployeeService } from 'src/application/modules/employee/employee.service';
import { AuthAdminDecoratorInterface } from './interfaces/auth-admin-decorator.interface';
import { Reflector } from '@nestjs/core';
import { AdminAuthRole } from './admin-auth-role.enum';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private companyService: CompanyService,
    private employeeService: EmployeeService,
    private reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req as Request;
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload: Omit<AuthAdminDecoratorInterface, 'company' | 'employee'> =
        await this.jwtService.verifyAsync(token, {
          secret: process.env.APP_SECRET,
        });

      const company = await this.companyService.findOne({ id: payload.sub });
      const employee = await this.employeeService.findOne({ id: payload.sub });

      if (
        roles.length > 0 &&
        !roles.includes[AdminAuthRole.EMPLOYEE] &&
        employee
      ) {
        throw new UnauthorizedException();
      }

      if (company || employee) {
        request['admin'] = {
          company: { ...payload, company },
          employee: { ...payload, employee },
        };
      } else {
        throw new UnauthorizedException();
      }
    } catch (e: any) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader: string = request.headers?.authorization as string;

    const [type, token] = authHeader?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
