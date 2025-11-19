import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CompanyService } from 'src/application/modules/company/company.service';

@Injectable()
export class CompanyAppGuard implements CanActivate {
  constructor(private service: CompanyService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);

    const request = ctx.getContext().req as Request;
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.service.findOneBySecretKey(token);

      if (!payload) {
        throw new UnauthorizedException();
      }
      request['company_app'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const companyHeader: string = request.headers?.companysecretkey as string;
    return companyHeader;
  }
}
