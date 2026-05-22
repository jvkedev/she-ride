import { UserRole } from '@prisma/client';

export type JwtUser = {
  id: string;
  email: string;
  role: UserRole;
  phoneNumber: string;
};
