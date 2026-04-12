import { z } from 'zod';
import { Gender } from '../../types/enums';

// Accepts Nigerian mobile formats: 08012345678, +2348012345678, 2348012345678,
// with optional spaces, dashes, or parentheses. 10 or 13 digits after stripping.
const nigerianPhone = z
  .string()
  .optional()
  .refine(
    (v) => {
      if (!v || v.trim() === '') return true;
      const digits = v.replace(/\D/g, '');
      // Local format starts with 0 (11 digits) or international starts with 234 (13 digits)
      return /^0\d{10}$/.test(digits) || /^234\d{10}$/.test(digits);
    },
    { message: 'Phone must be a valid Nigerian number (e.g. 08012345678 or +2348012345678)' }
  );

export const RegisterPatientSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  dateOfBirth: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  gender: z.nativeEnum(Gender).optional(),
  bloodGroup: z.string().max(5).optional(),
  genotype: z.string().max(5).optional(),
  phone: nigerianPhone,
  address: z.string().max(200).optional(),
  nextOfKin: z.string().max(100).optional(),
  nextOfKinPhone: nigerianPhone,
  medicalRecordNo: z.string().max(50).optional(),
  allergies: z.array(z.string()).optional().default([]),
  chronicConditions: z.array(z.string()).optional().default([]),
  preferTTS: z.boolean().optional().default(false),
  // Set to true to bypass soft duplicate warnings (e.g. shared phone numbers).
  forceCreate: z.boolean().optional().default(false),
});

export const UpdatePatientSchema = RegisterPatientSchema.partial().omit({
  email: true,
  password: true,
});

export type RegisterPatientInput = z.infer<typeof RegisterPatientSchema>;
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>;
