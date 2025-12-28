import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const oneMinute = 1000 * 60;
    const request = this.getRequestObject(context);

    const handlerName = context.getHandler().name;
    const entityId = request?.admin?.companyId || request?.user?.sub || '';
    const cacheKey = [handlerName, entityId].filter(Boolean).join('_');

    const cachedResponse = await this.cacheManager.get(cacheKey);

    if (cachedResponse) {
      return of(cachedResponse);
    }

    return next.handle().pipe(
      map(async (data) => {
        await this.cacheManager.set(cacheKey, data, oneMinute); // cache for 1 minute

        return data;
      }),
    );
  }

  private getRequestObject(context: ExecutionContext) {
    let request:
      | (Request & {
          admin?: Record<string, string>;
          user?: Record<string, string>;
        })
      | null;

    if (context.getType() == 'http') {
      request = context.switchToHttp().getRequest() as Request;
    } else {
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext().req as Request;
    }
    return request;
  }
}
