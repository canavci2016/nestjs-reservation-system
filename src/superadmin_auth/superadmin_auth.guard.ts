import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CompanyService } from 'src/company/company.service';
import { jwtConstants } from './constants';

@Injectable()
export class SuperAdminAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private companyService: CompanyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req as Request;
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload: { sub: string } = await this.jwtService.verifyAsync(
        token,
        {
          secret: jwtConstants.secret,
        },
      );

      const admin = await this.companyService.findOne({ id: payload.sub });

      if (!admin) {
        throw new UnauthorizedException();
      }

      request['super_admin'] = { ...payload, admin };
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
