import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserType } from '@prisma/client';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.userType !== UserType.SUPER_ADMIN) {
      throw new UnauthorizedException('Only Super Admin can perform this action');
    }

    return true;
  }
}