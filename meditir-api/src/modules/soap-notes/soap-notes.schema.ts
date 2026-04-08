import { z } from 'zod';

export const GenerateSOAPSchema = z.object({
  sessionId: z.string().uuid(),
});

export const UpdateSOAPSchema = z.object({
  subjective: z.string().min(1).optional(),
  objective: z.string().min(1).optional(),
  assessment: z.string().min(1).optional(),
  plan: z.string().min(1).optional(),
});

export type UpdateSOAPInput = z.infer<typeof UpdateSOAPSchema>;
