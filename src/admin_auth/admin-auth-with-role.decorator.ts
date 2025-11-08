import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from './admin-auth.guard';

export function AdminAuth(...roles: string[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AdminAuthGuard),
  );
}
