// roles-guard.decorator.ts
import { SetRoles } from './role-mediator.decorator';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { Role } from './role.enum';

export const Roles = (...roles: Role[]) => {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    SetRoles(...roles)(target, key, descriptor);
    UseGuards(RolesGuard)(target, key, descriptor);
  };
};
