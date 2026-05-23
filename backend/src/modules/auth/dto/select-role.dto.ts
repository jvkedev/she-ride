import { z } from 'zod';

export const selectRoleSchema = z.object({
  role: z.enum(['RIDER', 'CAPTAIN'], {
    error: 'Role must be RIDER or CAPTAIN',
  }),
});

export type SelectRoleDto = z.infer<typeof selectRoleSchema>;
