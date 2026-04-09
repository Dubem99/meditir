import { z } from 'zod';
import { Gender } from '../../types/enums';

export const RegisterPatientSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  dateOfBirth: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  gender: z.nativeEnum(Gender).optional(),
  bloodGroup: z.string().max(5).optional(),
  genotype: z.string().max(5).optional(),
  phone: z.string().optional(),
  address: z.string().max(200).optional(),
  nextOfKin: z.string().max(100).optional(),
  nextOfKinPhone: z.string().optional(),
  medicalRecordNo: z.string().max(50).optional(),
  allergies: z.array(z.string()).optional().default([]),
  chronicConditions: z.array(z.string()).optional().default([]),
  preferTTS: z.boolean().optional().default(false),
});

export const UpdatePatientSchema = RegisterPatientSchema.partial().omit({
  email: true,
  password: true,
});

export type RegisterPatientInput = z.infer<typeof RegisterPatientSchema>;
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>;
