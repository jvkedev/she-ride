// modules/rides/dto/history-ride.dto.ts
import { z } from 'zod';

export const HistoryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export type HistoryQueryDto = z.infer<typeof HistoryQuerySchema>;
