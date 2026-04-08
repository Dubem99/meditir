import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create SuperAdmin
  const superAdminEmail = 'superadmin@meditir.com';
  const existing = await prisma.user.findUnique({ where: { email: superAdminEmail } });
  if (!existing) {
    const superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        passwordHash: await bcrypt.hash('Meditir@SuperAdmin2024!', 12),
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    await prisma.adminProfile.create({
      data: {
        userId: superAdmin.id,
        firstName: 'Super',
        lastName: 'Admin',
      },
    });
    console.log('✓ SuperAdmin created:', superAdminEmail);
  }

  // Create demo hospital
  const slug = 'lagos-general';
  const existingHospital = await prisma.hospital.findUnique({ where: { slug } });
  if (!existingHospital) {
    const hospital = await prisma.hospital.create({
      data: {
        name: 'Lagos General Hospital',
        slug,
        email: 'admin@lagosgeneral.ng',
        address: '1 Marina Road, Lagos Island, Lagos',
        phone: '+234-1-234-5678',
      },
    });

    // Hospital Admin
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@lagosgeneral.ng',
        passwordHash: await bcrypt.hash('Admin@2024!', 12),
        role: 'HOSPITAL_ADMIN',
        hospitalId: hospital.id,
      },
    });
    await prisma.adminProfile.create({
      data: { userId: adminUser.id, firstName: 'Chidi', lastName: 'Okafor', department: 'Administration' },
    });

    // Doctor
    const doctorUser = await prisma.user.create({
      data: {
        email: 'dr.adeola@lagosgeneral.ng',
        passwordHash: await bcrypt.hash('Doctor@2024!', 12),
        role: 'DOCTOR',
        hospitalId: hospital.id,
      },
    });
    const doctor = await prisma.doctor.create({
      data: {
        userId: doctorUser.id,
        hospitalId: hospital.id,
        firstName: 'Adeola',
        lastName: 'Bello',
        specialization: 'General Practice',
        licenseNumber: 'MDCN-2024-001',
        preferredDialect: 'YORUBA_ACCENTED',
      },
    });
    // Schedule: Mon-Fri 8am-5pm
    for (let day = 1; day <= 5; day++) {
      await prisma.doctorSchedule.create({
        data: { doctorId: doctor.id, dayOfWeek: day, startTime: '08:00', endTime: '17:00' },
      });
    }

    // Patient
    const patientUser = await prisma.user.create({
      data: {
        email: 'patient@example.ng',
        passwordHash: await bcrypt.hash('Patient@2024!', 12),
        role: 'PATIENT',
        hospitalId: hospital.id,
      },
    });
    await prisma.patient.create({
      data: {
        userId: patientUser.id,
        hospitalId: hospital.id,
        firstName: 'Emeka',
        lastName: 'Nwosu',
        medicalRecordNo: 'LGH-2024-001',
        bloodGroup: 'O+',
        genotype: 'AA',
        allergies: ['Penicillin'],
        chronicConditions: ['Hypertension'],
        preferTTS: true,
      },
    });

    console.log('✓ Demo hospital created:', slug);
    console.log('  Admin:', 'admin@lagosgeneral.ng / Admin@2024!');
    console.log('  Doctor:', 'dr.adeola@lagosgeneral.ng / Doctor@2024!');
    console.log('  Patient:', 'patient@example.ng / Patient@2024!');
  }

  console.log('Seeding complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
