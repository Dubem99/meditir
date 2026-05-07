'use client';

// Self-service profile page. One route shared by all roles — fields render
// conditionally based on the role-specific shape returned by /me/profile.
//   DOCTOR        → name, specialization, gender, phone, bio, preferred dialect
//   PATIENT       → name, DOB, gender, blood group, genotype, phone, address,
//                   next-of-kin, allergies (chips), chronic conditions (chips)
//   *_ADMIN       → name, phone, department
// Email + role + hospital + (doctor) license + (patient) MRN are read-only.
//
// A second card on the same page handles password change with the
// current-password verification step.

import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
type Dialect =
  | 'NIGERIAN_ENGLISH' | 'YORUBA_ACCENTED' | 'HAUSA_ACCENTED' | 'IGBO_ACCENTED'
  | 'ENGLISH' | 'PIDGIN' | 'YORUBA' | 'HAUSA' | 'IGBO' | 'AUTO_DETECT';

type Profile = {
  id: string;
  email: string;
  role: 'DOCTOR' | 'PATIENT' | 'HOSPITAL_ADMIN' | 'SUPER_ADMIN';
  hospital: { name: string; slug: string } | null;
  doctor?: {
    firstName: string; lastName: string; specialization: string;
    licenseNumber: string; gender: Gender | null; phone: string | null;
    bio: string | null; preferredDialect: Dialect; isAvailable: boolean;
  } | null;
  patient?: {
    firstName: string; lastName: string; medicalRecordNo: string | null;
    dateOfBirth: string | null; gender: Gender | null;
    bloodGroup: string | null; genotype: string | null;
    phone: string | null; address: string | null;
    nextOfKin: string | null; nextOfKinPhone: string | null;
    allergies: string[]; chronicConditions: string[]; preferTTS: boolean;
  } | null;
  adminProfile?: {
    firstName: string; lastName: string; phone: string | null; department: string | null;
  } | null;
};

const DIALECT_OPTIONS: Array<{ value: Dialect; label: string }> = [
  { value: 'AUTO_DETECT', label: 'Auto-detect' },
  { value: 'ENGLISH', label: 'English' },
  { value: 'PIDGIN', label: 'Pidgin' },
  { value: 'YORUBA', label: 'Yoruba' },
  { value: 'HAUSA', label: 'Hausa' },
  { value: 'IGBO', label: 'Igbo' },
];
const GENDER_OPTIONS: Array<{ value: Gender; label: string }> = [
  { value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' }, { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.get('/me/profile')
      .then((r) => {
        if (cancelled) return;
        const p: Profile = r.data.data;
        setProfile(p);
        setDraft(seedDraft(p));
      })
      .catch((err) => {
        if (cancelled) return;
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        setLoadError(e?.response?.data?.message || e?.message || 'Failed to load profile');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const dirty = useMemo(() => {
    if (!profile) return false;
    const seed = seedDraft(profile);
    return Object.keys(draft).some((k) => JSON.stringify(draft[k]) !== JSON.stringify(seed[k]));
  }, [profile, draft]);

  const onChange = <K extends string>(key: K, value: unknown) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setSavedAt(null);
    setSaveError(null);
  };

  const onSave = async () => {
    if (!profile) return;
    setSaving(true);
    setSaveError(null);
    try {
      const r = await api.patch('/me/profile', draft);
      const next: Profile = r.data.data;
      setProfile(next);
      setDraft(seedDraft(next));
      setSavedAt(Date.now());
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setSaveError(e?.response?.data?.message || e?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async () => {
    setPwError(null);
    setPwSuccess(null);
    if (!pwCurrent) { setPwError('Current password is required'); return; }
    if (pwNew.length < 8) { setPwError('New password must be at least 8 characters'); return; }
    if (pwNew !== pwConfirm) { setPwError('New password and confirmation do not match'); return; }
    setPwSaving(true);
    try {
      await api.post('/me/password', { currentPassword: pwCurrent, newPassword: pwNew });
      setPwSuccess('Password updated. Other sessions have been signed out.');
      setPwCurrent(''); setPwNew(''); setPwConfirm('');
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setPwError(e?.response?.data?.message || e?.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }
  if (loadError || !profile) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 p-6 text-sm text-red-600">
        {loadError || 'Profile unavailable.'}
      </div>
    );
  }

  const fullName =
    profile.doctor ? `${profile.doctor.firstName} ${profile.doctor.lastName}` :
    profile.patient ? `${profile.patient.firstName} ${profile.patient.lastName}` :
    profile.adminProfile ? `${profile.adminProfile.firstName} ${profile.adminProfile.lastName}` :
    user?.email || '';
  const initials = (fullName || profile.email).split(' ').filter(Boolean).slice(0, 2)
    .map((s) => s[0]).join('').toUpperCase() || profile.email.slice(0, 2).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-500">{profile.email} · {prettyRole(profile.role)}{profile.hospital ? ` · ${profile.hospital.name}` : ''}</p>
        </div>
      </div>

      {/* Identity card */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Personal information</h2>

        {profile.doctor && (
          <DoctorFields draft={draft} doctor={profile.doctor} onChange={onChange} />
        )}
        {profile.patient && (
          <PatientFields draft={draft} patient={profile.patient} onChange={onChange} />
        )}
        {profile.adminProfile && (
          <AdminFields draft={draft} admin={profile.adminProfile} onChange={onChange} />
        )}

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          {saveError && <p className="text-xs text-red-600 mr-auto">{saveError}</p>}
          {savedAt && !saveError && <p className="text-xs text-emerald-600 mr-auto">Saved.</p>}
          <button
            onClick={() => { setDraft(seedDraft(profile)); setSaveError(null); setSavedAt(null); }}
            disabled={!dirty || saving}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg disabled:opacity-40"
          >
            Reset
          </button>
          <button
            onClick={onSave}
            disabled={!dirty || saving}
            className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </section>

      {/* Password card */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Change password</h2>
        <p className="text-xs text-gray-500 mb-4">Other sessions on this account will be signed out.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Current password" type="password" autoComplete="current-password"
            value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} />
          <div className="hidden sm:block" />
          <Input label="New password" type="password" autoComplete="new-password"
            value={pwNew} onChange={(e) => setPwNew(e.target.value)} />
          <Input label="Confirm new password" type="password" autoComplete="new-password"
            value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} />
        </div>
        <div className="flex items-center justify-end gap-3 mt-4">
          {pwError && <p className="text-xs text-red-600 mr-auto">{pwError}</p>}
          {pwSuccess && <p className="text-xs text-emerald-600 mr-auto">{pwSuccess}</p>}
          <button
            onClick={onChangePassword}
            disabled={pwSaving || !pwCurrent || !pwNew || !pwConfirm}
            className="bg-gray-900 hover:bg-black text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-40"
          >
            {pwSaving ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </section>
    </div>
  );
}

const seedDraft = (p: Profile): Record<string, unknown> => {
  if (p.doctor) {
    const d = p.doctor;
    return {
      firstName: d.firstName, lastName: d.lastName, specialization: d.specialization,
      gender: d.gender, phone: d.phone ?? '', bio: d.bio ?? '',
      preferredDialect: d.preferredDialect, isAvailable: d.isAvailable,
    };
  }
  if (p.patient) {
    const pt = p.patient;
    return {
      firstName: pt.firstName, lastName: pt.lastName,
      dateOfBirth: pt.dateOfBirth ? pt.dateOfBirth.slice(0, 10) : '',
      gender: pt.gender, bloodGroup: pt.bloodGroup ?? '', genotype: pt.genotype ?? '',
      phone: pt.phone ?? '', address: pt.address ?? '',
      nextOfKin: pt.nextOfKin ?? '', nextOfKinPhone: pt.nextOfKinPhone ?? '',
      allergies: pt.allergies, chronicConditions: pt.chronicConditions,
      preferTTS: pt.preferTTS,
    };
  }
  if (p.adminProfile) {
    const a = p.adminProfile;
    return {
      firstName: a.firstName, lastName: a.lastName,
      phone: a.phone ?? '', department: a.department ?? '',
    };
  }
  return {};
};

const prettyRole = (r: Profile['role']) =>
  r === 'DOCTOR' ? 'Doctor' :
  r === 'PATIENT' ? 'Patient' :
  r === 'HOSPITAL_ADMIN' ? 'Hospital admin' :
  r === 'SUPER_ADMIN' ? 'Super admin' : r;

// ── Role-specific field groups ─────────────────────────────────────────

type FieldsCommon = {
  draft: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
};

const DoctorFields = ({
  draft, doctor, onChange,
}: FieldsCommon & { doctor: NonNullable<Profile['doctor']> }) => (
  <div className="grid sm:grid-cols-2 gap-4">
    <Input label="First name" value={(draft.firstName as string) ?? ''} onChange={(e) => onChange('firstName', e.target.value)} />
    <Input label="Last name" value={(draft.lastName as string) ?? ''} onChange={(e) => onChange('lastName', e.target.value)} />
    <Input label="Specialization" value={(draft.specialization as string) ?? ''} onChange={(e) => onChange('specialization', e.target.value)} />
    <ReadOnlyField label="License number" value={doctor.licenseNumber} hint="Contact admin to change" />
    <Select label="Gender" value={(draft.gender as string) ?? ''} onChange={(v) => onChange('gender', v || null)} options={[{ value: '', label: '—' }, ...GENDER_OPTIONS]} />
    <Input label="Phone" value={(draft.phone as string) ?? ''} onChange={(e) => onChange('phone', e.target.value)} />
    <Select label="Preferred dialect" value={(draft.preferredDialect as string) ?? 'AUTO_DETECT'} onChange={(v) => onChange('preferredDialect', v)} options={DIALECT_OPTIONS} />
    <Checkbox label="Available for new sessions" checked={Boolean(draft.isAvailable)} onChange={(b) => onChange('isAvailable', b)} />
    <div className="sm:col-span-2">
      <label className="text-sm font-medium text-gray-700">Bio</label>
      <textarea
        rows={3}
        value={(draft.bio as string) ?? ''}
        onChange={(e) => onChange('bio', e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
        placeholder="A short bio shown to patients on the messaging screen."
      />
    </div>
  </div>
);

const PatientFields = ({
  draft, patient, onChange,
}: FieldsCommon & { patient: NonNullable<Profile['patient']> }) => (
  <div className="grid sm:grid-cols-2 gap-4">
    <Input label="First name" value={(draft.firstName as string) ?? ''} onChange={(e) => onChange('firstName', e.target.value)} />
    <Input label="Last name" value={(draft.lastName as string) ?? ''} onChange={(e) => onChange('lastName', e.target.value)} />
    {patient.medicalRecordNo && (
      <ReadOnlyField label="Medical record no." value={patient.medicalRecordNo} />
    )}
    <Input label="Date of birth" type="date" value={(draft.dateOfBirth as string) ?? ''} onChange={(e) => onChange('dateOfBirth', e.target.value || null)} />
    <Select label="Gender" value={(draft.gender as string) ?? ''} onChange={(v) => onChange('gender', v || null)} options={[{ value: '', label: '—' }, ...GENDER_OPTIONS]} />
    <Input label="Blood group" value={(draft.bloodGroup as string) ?? ''} onChange={(e) => onChange('bloodGroup', e.target.value)} placeholder="e.g. O+" />
    <Input label="Genotype" value={(draft.genotype as string) ?? ''} onChange={(e) => onChange('genotype', e.target.value)} placeholder="e.g. AA" />
    <Input label="Phone" value={(draft.phone as string) ?? ''} onChange={(e) => onChange('phone', e.target.value)} />
    <Input label="Address" value={(draft.address as string) ?? ''} onChange={(e) => onChange('address', e.target.value)} className="sm:col-span-2" />
    <Input label="Next of kin" value={(draft.nextOfKin as string) ?? ''} onChange={(e) => onChange('nextOfKin', e.target.value)} />
    <Input label="Next of kin phone" value={(draft.nextOfKinPhone as string) ?? ''} onChange={(e) => onChange('nextOfKinPhone', e.target.value)} />
    <ChipList label="Allergies" values={(draft.allergies as string[]) ?? []} onChange={(v) => onChange('allergies', v)} placeholder="Add an allergy and press Enter" />
    <ChipList label="Chronic conditions" values={(draft.chronicConditions as string[]) ?? []} onChange={(v) => onChange('chronicConditions', v)} placeholder="Add a condition and press Enter" />
    <Checkbox label="Prefer voice (TTS) playback for notes" checked={Boolean(draft.preferTTS)} onChange={(b) => onChange('preferTTS', b)} />
  </div>
);

const AdminFields = ({ draft, onChange }: FieldsCommon & { admin: NonNullable<Profile['adminProfile']> }) => (
  <div className="grid sm:grid-cols-2 gap-4">
    <Input label="First name" value={(draft.firstName as string) ?? ''} onChange={(e) => onChange('firstName', e.target.value)} />
    <Input label="Last name" value={(draft.lastName as string) ?? ''} onChange={(e) => onChange('lastName', e.target.value)} />
    <Input label="Phone" value={(draft.phone as string) ?? ''} onChange={(e) => onChange('phone', e.target.value)} />
    <Input label="Department" value={(draft.department as string) ?? ''} onChange={(e) => onChange('department', e.target.value)} />
  </div>
);

// ── Tiny inline primitives ─────────────────────────────────────────────

const ReadOnlyField = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">{value}</div>
    {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
  </div>
);

const Select = ({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Checkbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (b: boolean) => void }) => (
  <label className="flex items-center gap-2 self-end pb-2 text-sm text-gray-700 sm:col-span-2">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500" />
    {label}
  </label>
);

const ChipList = ({
  label, values, onChange, placeholder,
}: {
  label: string; values: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) => {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (values.includes(v)) { setDraft(''); return; }
    onChange([...values, v]);
    setDraft('');
  };
  return (
    <div className="flex flex-col gap-1 sm:col-span-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {values.length === 0 && <span className="text-xs text-gray-400">None</span>}
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
            {v}
            <button type="button" aria-label={`Remove ${v}`}
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="text-gray-400 hover:text-red-600">×</button>
          </span>
        ))}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
  );
};
