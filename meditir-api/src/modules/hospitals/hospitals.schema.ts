import { z } from 'zod';

export const CreateHospitalSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().url().optional(),
});

export const UpdateHospitalSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().url().optional(),
});

export type CreateHospitalInput = z.infer<typeof CreateHospitalSchema>;
export type UpdateHospitalInput = z.infer<typeof UpdateHospitalSchema>;
