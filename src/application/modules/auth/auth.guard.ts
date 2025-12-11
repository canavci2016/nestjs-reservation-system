import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserService } from 'src/application/modules/user/user.service';
import { AuthUserDecoratorInterface } from './interfaces/auth-employee-decorator.interface';
import { JwtService } from 'src/core/modules/token/services/jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req as Request;
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload: Omit<AuthUserDecoratorInterface, 'user'> =
        await this.jwtService.decodeToken(token);

      const user = await this.userService.findOne({ id: payload.sub });

      if (!user) {
        throw new NotFoundException('user is not found');
      }

      request['user'] = { ...payload, user };
    } catch (e: any) {
      if (e instanceof NotFoundException) {
        throw e;
      }
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
