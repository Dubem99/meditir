import { z } from 'zod';
import { Dialect } from '../../types/enums';

export const CreateSessionSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  dialect: z.nativeEnum(Dialect).optional().default(Dialect.NIGERIAN_ENGLISH),
  notes: z.string().max(1000).optional(),
});

export const UpdateSessionSchema = z.object({
  notes: z.string().max(1000).optional(),
  dialect: z.nativeEnum(Dialect).optional(),
});

export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;
export type UpdateSessionInput = z.infer<typeof UpdateSessionSchema>;
