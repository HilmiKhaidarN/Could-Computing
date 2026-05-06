import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const supervisorPassword = await bcrypt.hash('super123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // Create Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aegisops.id' },
    update: {},
    create: {
      email: 'admin@aegisops.id',
      name: 'Admin AegisOps',
      password: adminPassword,
      role: 'admin',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create Supervisor user (analyst role)
  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@aegisops.id' },
    update: {},
    create: {
      email: 'supervisor@aegisops.id',
      name: 'Supervisor AegisOps',
      password: supervisorPassword,
      role: 'analyst',
    },
  });
  console.log('✅ Created supervisor user:', supervisor.email);

  // Create Warga user (viewer role)
  const user = await prisma.user.upsert({
    where: { email: 'user@aegisops.id' },
    update: {},
    create: {
      email: 'user@aegisops.id',
      name: 'Warga AegisOps',
      password: userPassword,
      role: 'viewer',
    },
  });
  console.log('✅ Created warga user:', user.email);

  console.log('\n🎉 Seeding completed!');
  console.log('\n📝 Login credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:');
  console.log('  Email: admin@aegisops.id');
  console.log('  Password: admin123');
  console.log('\nSupervisor:');
  console.log('  Email: supervisor@aegisops.id');
  console.log('  Password: super123');
  console.log('\nWarga:');
  console.log('  Email: user@aegisops.id');
  console.log('  Password: user123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
