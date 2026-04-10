export type Role = 'SUPER_ADMIN' | 'HOSPITAL_ADMIN' | 'DOCTOR' | 'PATIENT';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type SessionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type NoteStatus = 'DRAFT' | 'AI_GENERATED' | 'DOCTOR_REVIEWED' | 'FINALIZED';
export type Dialect = 'NIGERIAN_ENGLISH' | 'YORUBA_ACCENTED' | 'HAUSA_ACCENTED' | 'IGBO_ACCENTED';

export interface Hospital {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  hospitalId: string | null;
  hospital?: { name: string; slug: string; isActive: boolean } | null;
}

export interface Doctor {
  id: string;
  userId: string;
  hospitalId: string;
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  gender?: Gender;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  preferredDialect: Dialect;
  isAvailable: boolean;
  user: { email: string; lastLoginAt?: string };
  schedules: DoctorSchedule[];
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface Patient {
  id: string;
  userId: string;
  hospitalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: Gender;
  bloodGroup?: string;
  genotype?: string;
  phone?: string;
  address?: string;
  nextOfKin?: string;
  nextOfKinPhone?: string;
  medicalRecordNo?: string;
  allergies: string[];
  chronicConditions: string[];
  preferTTS: boolean;
  user: { email: string };
}

export interface ConsultationSession {
  id: string;
  hospitalId: string;
  doctorId: string;
  patientId: string;
  status: SessionStatus;
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  dialect: Dialect;
  roomToken?: string;
  notes?: string;
  handoverNote?: string;
  originalDoctorId?: string;
  doctor: { id: string; firstName: string; lastName: string; specialization: string };
  patient: { id: string; firstName: string; lastName: string; medicalRecordNo?: string };
  soapNote?: { id: string; status: NoteStatus } | null;
  transcriptions?: Transcription[];
}

export interface Transcription {
  id: string;
  sessionId: string;
  text: string;
  confidence?: number;
  speakerTag?: string;
  startMs?: number;
  endMs?: number;
  dialect: Dialect;
  createdAt: string;
}

export interface SOAPNote {
  id: string;
  sessionId: string;
  hospitalId: string;
  patientId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  status: NoteStatus;
  aiModel?: string;
  ttsAudioUrl?: string;
  ttsGeneratedAt?: string;
  drugWarnings?: string | null;
  doctorSignedAt?: string;
  createdAt: string;
  updatedAt: string;
  session?: {
    doctor: { firstName: string; lastName: string };
  };
  patient?: { firstName: string; lastName: string; medicalRecordNo?: string };
}
