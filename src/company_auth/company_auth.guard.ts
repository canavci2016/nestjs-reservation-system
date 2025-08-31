import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthCompanyDecoratorInterface } from './interfaces/auth-company-decorator.interface';
import { CompanyService } from 'src/company/company.service';

@Injectable()
export class CompanyAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private companyService: CompanyService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req as Request;
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload: Omit<AuthCompanyDecoratorInterface, 'company'> =
        await this.jwtService.verifyAsync(token, {
          secret: process.env.APP_SECRET,
        });

      const company = await this.companyService.findOne({ id: payload.sub });

      if (!company) {
        throw new UnauthorizedException();
      }

      request['company'] = { ...payload, company };
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
