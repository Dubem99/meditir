import { z } from 'zod';
import { Gender, Dialect } from '../../types/enums';

export const OnboardDoctorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  specialization: z.string().min(1).max(100),
  licenseNumber: z.string().min(1).max(50),
  gender: z.nativeEnum(Gender).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  preferredDialect: z.nativeEnum(Dialect).optional(),
});

export const UpdateDoctorSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  specialization: z.string().min(1).max(100).optional(),
  gender: z.nativeEnum(Gender).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  preferredDialect: z.nativeEnum(Dialect).optional(),
  isAvailable: z.boolean().optional(),
});

export const ScheduleSlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
  isActive: z.boolean().optional().default(true),
});

export const UpdateScheduleSchema = z.object({
  slots: z.array(ScheduleSlotSchema).min(1),
});

export type OnboardDoctorInput = z.infer<typeof OnboardDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof UpdateDoctorSchema>;
export type UpdateScheduleInput = z.infer<typeof UpdateScheduleSchema>;
