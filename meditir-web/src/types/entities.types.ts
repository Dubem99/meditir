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
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    medicalRecordNo?: string;
    dateOfBirth?: string | null;
    gender?: Gender | null;
    bloodGroup?: string | null;
    genotype?: string | null;
    allergies?: string[];
    chronicConditions?: string[];
  };
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

export type ProblemStatus = 'ACTIVE' | 'RESOLVED' | 'CHRONIC' | 'RULE_OUT';
export type OrderType = 'MEDICATION' | 'LAB' | 'IMAGING' | 'PROCEDURE' | 'REFERRAL';
export type OrderStatus = 'PENDING' | 'ORDERED' | 'COMPLETED' | 'CANCELLED';
export type ExtractionSource = 'AI_EXTRACTED' | 'DOCTOR_ADDED' | 'DOCTOR_EDITED';

export interface Problem {
  id: string;
  soapNoteId: string;
  name: string;
  icd10Code?: string | null;
  status: ProblemStatus;
  notes?: string | null;
  source: ExtractionSource;
  createdAt: string;
}

export interface Order {
  id: string;
  soapNoteId: string;
  type: OrderType;
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  instructions?: string | null;
  status: OrderStatus;
  source: ExtractionSource;
  createdAt: string;
}

export interface BillingCode {
  id: string;
  soapNoteId: string;
  codeType: 'ICD10' | 'CPT';
  code: string;
  description: string;
  source: ExtractionSource;
  createdAt: string;
}

export interface EhrExtractions {
  soapNoteId: string;
  problems: Problem[];
  orders: Order[];
  billingCodes: BillingCode[];
}

export type SummaryLanguage = 'ENGLISH' | 'PIDGIN' | 'YORUBA' | 'HAUSA' | 'IGBO';
export type DeliveryChannel = 'EMAIL' | 'WHATSAPP' | 'SMS' | 'PRINT';

export interface PatientSummary {
  id: string;
  soapNoteId: string;
  hospitalId: string;
  patientId: string;
  language: SummaryLanguage;
  content: string;
  edited: boolean;
  sentVia: string[];
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SendSummaryResult {
  summary: PatientSummary;
  results: Record<string, { ok: boolean; detail?: string; link?: string }>;
}
