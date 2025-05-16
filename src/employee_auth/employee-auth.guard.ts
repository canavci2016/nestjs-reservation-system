import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';
import { GqlExecutionContext } from '@nestjs/graphql';
import { EmployeeService } from 'src/employee/employee.service';
import { AuthEmployeeDecoratorInterface } from './interfaces/auth-employee-decorator.interface';

@Injectable()
export class EmployeeAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private employeeService: EmployeeService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req as Request;
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload: AuthEmployeeDecoratorInterface =
        await this.jwtService.verifyAsync(token, {
          secret: jwtConstants.secret,
        });

      const employee = await this.employeeService.findOne({ id: payload.sub });

      if (!employee) {
        throw new UnauthorizedException();
      }

      request['employee'] = { ...payload, employee };
    } catch {
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
