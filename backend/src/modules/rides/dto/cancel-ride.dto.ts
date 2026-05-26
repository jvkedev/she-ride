// modules/rides/dto/cancel-ride.dto.ts
import { z } from 'zod';

export const CancelRideSchema = z.object({
  reason: z.string().min(1).max(200).optional(),
});

export type CancelRideDto = z.infer<typeof CancelRideSchema>;
