import { applyDecorators, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GqlRateLimitingGuard } from '../guards/gql-rate-limiting.guard';

interface RateLimitOptions {
  limit?: number;
  expInMinutes?: number;
  blockDuration?: number;
}

export function RateLimiting(options: RateLimitOptions) {
  const ttl = options.expInMinutes ? options.expInMinutes * 60 * 1000 : 60000;
  return applyDecorators(
    Throttle({
      default: { limit: options.limit || 5, ttl: ttl },
    }),
    UseGuards(GqlRateLimitingGuard),
  );
}
