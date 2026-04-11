'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type Step = 'choose' | 'doctor' | 'patient' | 'success';

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('choose');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdName, setCreatedName] = useState('');

  const [doctorForm, setDoctorForm] = useState({
    email: '', password: '', firstName: '', lastName: '',
    specialization: '', licenseNumber: '', phone: '',
  });

  const [patientForm, setPatientForm] = useState({
    email: '', password: '', firstName: '', lastName: '',
    medicalRecordNo: '', phone: '', bloodGroup: '', genotype: '',
  });

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/doctors', doctorForm);
      setCreatedName(`Dr. ${doctorForm.firstName} ${doctorForm.lastName}`);
      setStep('success');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to onboard doctor');
    } finally { setLoading(false); }
  };

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/patients', patientForm);
      setCreatedName(`${patientForm.firstName} ${patientForm.lastName}`);
      setStep('success');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to register patient');
    } finally { setLoading(false); }
  };

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto">
        <Card>
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Successfully Onboarded</h2>
            <p className="text-gray-500 text-sm mb-6"><strong>{createdName}</strong> has been added to your hospital.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => { setStep('choose'); setError(''); }}>
                Onboard Another
              </Button>
              <Button onClick={() => window.location.href = '/admin'}>Go to Dashboard</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Hospital Onboarding</h1>

      {step === 'choose' && (
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setStep('doctor')}
            className="flex flex-col items-center gap-4 p-8 border-2 border-gray-200 rounded-2xl hover:border-primary-400 hover:bg-primary-50 transition-all group">
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              <svg className="h-7 w-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900">Onboard a Doctor</p>
              <p className="text-sm text-gray-500 mt-1">Add a new doctor to your hospital</p>
            </div>
          </button>
          <button onClick={() => setStep('patient')}
            className="flex flex-col items-center gap-4 p-8 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all group">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900">Register a Patient</p>
              <p className="text-sm text-gray-500 mt-1">Add a new patient record</p>
            </div>
          </button>
        </div>
      )}

      {step === 'doctor' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setStep('choose')}>←</Button>
              <h2 className="font-semibold text-gray-900">Doctor Details</h2>
            </div>
          </CardHeader>
          <form onSubmit={handleDoctorSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={doctorForm.firstName} onChange={(e) => setDoctorForm(f => ({ ...f, firstName: e.target.value }))} required />
              <Input label="Last Name" value={doctorForm.lastName} onChange={(e) => setDoctorForm(f => ({ ...f, lastName: e.target.value }))} required />
            </div>
            <Input label="Email" type="email" value={doctorForm.email} onChange={(e) => setDoctorForm(f => ({ ...f, email: e.target.value }))} required />
            <Input label="Temporary Password" type="password" value={doctorForm.password} onChange={(e) => setDoctorForm(f => ({ ...f, password: e.target.value }))} required minLength={8} />
            <Input label="Specialization" value={doctorForm.specialization} onChange={(e) => setDoctorForm(f => ({ ...f, specialization: e.target.value }))} required />
            <Input label="License Number" value={doctorForm.licenseNumber} onChange={(e) => setDoctorForm(f => ({ ...f, licenseNumber: e.target.value }))} required />
            <Input
              label="Phone (optional)"
              value={doctorForm.phone}
              onChange={(e) => setDoctorForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="e.g. 08012345678 or +2348012345678"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">Onboard Doctor</Button>
          </form>
        </Card>
      )}

      {step === 'patient' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setStep('choose')}>←</Button>
              <h2 className="font-semibold text-gray-900">Patient Details</h2>
            </div>
          </CardHeader>
          <form onSubmit={handlePatientSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={patientForm.firstName} onChange={(e) => setPatientForm(f => ({ ...f, firstName: e.target.value }))} required />
              <Input label="Last Name" value={patientForm.lastName} onChange={(e) => setPatientForm(f => ({ ...f, lastName: e.target.value }))} required />
            </div>
            <Input label="Email" type="email" value={patientForm.email} onChange={(e) => setPatientForm(f => ({ ...f, email: e.target.value }))} required />
            <Input label="Temporary Password" type="password" value={patientForm.password} onChange={(e) => setPatientForm(f => ({ ...f, password: e.target.value }))} required minLength={8} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Medical Record No." value={patientForm.medicalRecordNo} onChange={(e) => setPatientForm(f => ({ ...f, medicalRecordNo: e.target.value }))} />
              <Input
                label="Phone"
                value={patientForm.phone}
                onChange={(e) => setPatientForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="08012345678 or +2348012345678"
              />
            </div>
            <p className="text-xs text-gray-500 -mt-2">
              Phone is used for WhatsApp after-visit summaries. Accepts Nigerian mobile formats only.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Blood Group" value={patientForm.bloodGroup} onChange={(e) => setPatientForm(f => ({ ...f, bloodGroup: e.target.value }))} placeholder="e.g. A+" />
              <Input label="Genotype" value={patientForm.genotype} onChange={(e) => setPatientForm(f => ({ ...f, genotype: e.target.value }))} placeholder="e.g. AA" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">Register Patient</Button>
          </form>
        </Card>
      )}
    </div>
  );
}
