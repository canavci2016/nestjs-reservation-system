import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminAuthRole } from './admin-auth-role.enum';

export function AdminAuth(...roles: AdminAuthRole[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AdminAuthGuard),
  );
}
