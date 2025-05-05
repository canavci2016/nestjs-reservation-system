import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Injectable()
export class ExtractAuthUserInterceptor implements NestInterceptor {
  constructor(private authService: AuthService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const ctx = GqlExecutionContext.create(context);

    const request = ctx.getContext().req as Request;
    const token = this.extractTokenFromHeader(request);
    try {
      if (token) {
        const payload = await this.authService.decrytToken(token);
        request['user'] = payload;
      }
    } catch {
      /* empty */
    }

    return next.handle();
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const header = (request?.headers?.authorization as string) || '';
    const [type, token] = header?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
