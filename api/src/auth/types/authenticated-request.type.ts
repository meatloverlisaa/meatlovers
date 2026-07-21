import { Request } from 'express';
import { Role } from '@prisma/client';

export type AuthenticatedUser = {
  id: bigint;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
};

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};
