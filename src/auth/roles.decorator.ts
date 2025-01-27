import { SetMetadata } from '@nestjs/common';
import { UserType } from '@prisma/client';  // Adjust the path to where your Role enum is defined

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserType[]) => SetMetadata(ROLES_KEY, roles);
