import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function upsertUser(params: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  const passwordHash = await bcrypt.hash(params.password, 10);

  return prisma.user.upsert({
    where: { email: params.email },
    update: {
      firstName: params.firstName,
      lastName: params.lastName,
      role: params.role,
      passwordHash,
    },
    create: {
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      role: params.role,
      passwordHash,
    },
  });
}

async function main() {
  await upsertUser({
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@ferretto.local',
    password: 'Admin123!',
    role: UserRole.ADMIN,
  });

  await upsertUser({
    firstName: 'Project',
    lastName: 'Manager',
    email: 'pm@ferretto.local',
    password: 'Pm123456!',
    role: UserRole.PM,
  });

  await upsertUser({
    firstName: 'Field',
    lastName: 'Installer',
    email: 'installer@ferretto.local',
    password: 'Install123!',
    role: UserRole.INSTALLER,
  });

  console.log('Seed completed: admin, pm, installer users available.');
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
