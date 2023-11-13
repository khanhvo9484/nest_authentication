import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './role.enum';
import { ROLES_KEY } from './role-mediator.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();

    console.log('executed roles');
    const { user } = context.switchToHttp().getRequest();

    if (typeof user.role === 'string') {
      // If user.role is a string, convert it to an array for consistency
      user.role = [user.role];
    }
    return requiredRoles.some((role) => user.role?.includes(role));
  }
}
