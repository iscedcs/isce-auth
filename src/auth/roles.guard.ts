import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UserType } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    console.log('Request:', request);
    console.log('User in request:', request.user);

    // Extract the roles required for the handler (route) from metadata
    const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are defined for the route, allow access
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // If user doesn't exist, deny access
    if (!user) {
      throw new ForbiddenException('Unauthorized access');
    }

    // Super admin has access to everything
    if (user.userType === UserType.SUPER_ADMIN) {
      return true;
    }

    // Check if user has required role
    if (!requiredRoles.includes(user.userType)) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    return true;
  }
}