import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create manager users
  const hashedPassword = await bcrypt.hash('manager123', 12);
  
  const manager = await prisma.user.upsert({
    where: { phoneNumber: '+923001234567' },
    update: {},
    create: {
      name: 'Ahmed Khan',
      email: 'manager@courtbooking.com',
      phoneNumber: '+923001234567',
      password: hashedPassword,
      role: 'MANAGER',
    },
  });

  const admin = await prisma.user.upsert({
    where: { phoneNumber: '+923007654321' },
    update: {},
    create: {
      name: 'Sara Ahmed',
      email: 'admin@courtbooking.com',
      phoneNumber: '+923007654321',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create sample courts
  const courts = await Promise.all([
    prisma.court.create({
      data: {
        name: 'Tennis Court A',
        type: 'Tennis',
        description: 'Professional tennis court with synthetic surface',
        pricePerHour: 1500,
        isActive: true,
      },
    }),
    prisma.court.create({
      data: {
        name: 'Badminton Court 1',
        type: 'Badminton',
        description: 'Indoor badminton court with wooden flooring',
        pricePerHour: 800,
        isActive: true,
      },
    }),
    prisma.court.create({
      data: {
        name: 'Basketball Court',
        type: 'Basketball',
        description: 'Full-size basketball court',
        pricePerHour: 1200,
        isActive: true,
      },
    }),
  ]);

  // Create court availability
  for (const court of courts) {
    for (let day = 0; day < 7; day++) {
      await prisma.courtAvailability.create({
        data: {
          courtId: court.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '21:00',
          slotDuration: 60,
          maxBookingsPerUserPerDay: 2,
        },
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });