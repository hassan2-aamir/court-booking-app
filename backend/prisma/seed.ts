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

  // Create sample customers
  const customers = await Promise.all([
    prisma.user.upsert({
      where: { phoneNumber: '+923331234567' },
      update: {},
      create: {
        name: 'Muhammad Ali',
        email: 'ali@email.com',
        phoneNumber: '+923331234567',
        cnic: '42401-1234567-1',
        address: 'Lahore, Pakistan',
        role: 'CUSTOMER',
      },
    }),
    prisma.user.upsert({
      where: { phoneNumber: '+923339876543' },
      update: {},
      create: {
        name: 'Fatima Sheikh',
        email: 'fatima@email.com',
        phoneNumber: '+923339876543',
        cnic: '42401-9876543-2',
        address: 'Karachi, Pakistan',
        role: 'CUSTOMER',
      },
    }),
    prisma.user.upsert({
      where: { phoneNumber: '+923445678901' },
      update: {},
      create: {
        name: 'Hassan Ahmed',
        phoneNumber: '+923445678901',
        cnic: '42401-5678901-3',
        address: 'Islamabad, Pakistan',
        role: 'CUSTOMER',
      },
    }),
    prisma.user.upsert({
      where: { phoneNumber: '+923556789012' },
      update: {},
      create: {
        name: 'Aisha Khan',
        email: 'aisha@email.com',
        phoneNumber: '+923556789012',
        address: 'Faisalabad, Pakistan',
        role: 'CUSTOMER',
      },
    }),
  ]);

  // Helper function to generate booking ID
  const generateBookingId = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BK${timestamp.slice(-6)}${random}`;
  };

  // Create sample bookings
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const bookings = await Promise.all([
    // Today's bookings
    prisma.booking.create({
      data: {
        bookingId: generateBookingId(),
        userId: customers[0].id,
        courtId: courts[0].id, // Tennis Court A
        date: today,
        startTime: '10:00',
        endTime: '11:00',
        duration: 60,
        status: 'CONFIRMED',
        totalPrice: 1500,
        notes: 'Regular tennis session',
        paymentStatus: 'PAID',
      },
    }),
    prisma.booking.create({
      data: {
        bookingId: generateBookingId(),
        userId: customers[1].id,
        courtId: courts[1].id, // Badminton Court 1
        date: today,
        startTime: '14:00',
        endTime: '15:00',
        duration: 60,
        status: 'PENDING',
        totalPrice: 800,
        notes: 'First time booking',
        paymentStatus: 'PENDING',
      },
    }),
    prisma.booking.create({
      data: {
        bookingId: generateBookingId(),
        userId: customers[2].id,
        courtId: courts[2].id, // Basketball Court
        date: today,
        startTime: '18:00',
        endTime: '20:00',
        duration: 120,
        status: 'CONFIRMED',
        totalPrice: 2400,
        notes: 'Team practice session',
        paymentStatus: 'PAID',
      },
    }),

    // Yesterday's bookings (completed)
    prisma.booking.create({
      data: {
        bookingId: generateBookingId(),
        userId: customers[0].id,
        courtId: courts[0].id, // Tennis Court A
        date: yesterday,
        startTime: '09:00',
        endTime: '10:00',
        duration: 60,
        status: 'COMPLETED',
        totalPrice: 1500,
        notes: 'Morning tennis session',
        paymentStatus: 'PAID',
      },
    }),
    prisma.booking.create({
      data: {
        bookingId: generateBookingId(),
        userId: customers[3].id,
        courtId: courts[1].id, // Badminton Court 1
        date: yesterday,
        startTime: '16:00',
        endTime: '17:00',
        duration: 60,
        status: 'NO_SHOW',
        totalPrice: 800,
        notes: 'Customer did not show up',
        paymentStatus: 'REFUNDED',
      },
    }),

    // Tomorrow's bookings
    prisma.booking.create({
      data: {
        bookingId: generateBookingId(),
        userId: customers[1].id,
        courtId: courts[0].id, // Tennis Court A
        date: tomorrow,
        startTime: '11:00',
        endTime: '12:00',
        duration: 60,
        status: 'CONFIRMED',
        totalPrice: 1500,
        notes: 'Weekend tennis match',
        paymentStatus: 'PAID',
      },
    }),
    prisma.booking.create({
      data: {
        bookingId: generateBookingId(),
        userId: customers[2].id,
        courtId: courts[2].id, // Basketball Court
        date: tomorrow,
        startTime: '15:00',
        endTime: '16:00',
        duration: 60,
        status: 'PENDING',
        totalPrice: 1200,
        notes: 'Practice session',
        paymentStatus: 'PENDING',
      },
    }),

    // Next week bookings
    prisma.booking.create({
      data: {
        bookingId: generateBookingId(),
        userId: customers[3].id,
        courtId: courts[1].id, // Badminton Court 1
        date: nextWeek,
        startTime: '19:00',
        endTime: '21:00',
        duration: 120,
        status: 'CONFIRMED',
        totalPrice: 1600,
        notes: 'Evening badminton doubles',
        paymentStatus: 'PAID',
      },
    }),
    prisma.booking.create({
      data: {
        bookingId: generateBookingId(),
        userId: customers[0].id,
        courtId: courts[2].id, // Basketball Court
        date: nextWeek,
        startTime: '17:00',
        endTime: '18:00',
        duration: 60,
        status: 'PENDING',
        totalPrice: 1200,
        notes: 'Weekly basketball session',
        paymentStatus: 'PENDING',
      },
    }),

    // Cancelled booking
    prisma.booking.create({
      data: {
        bookingId: generateBookingId(),
        userId: customers[1].id,
        courtId: courts[0].id, // Tennis Court A
        date: tomorrow,
        startTime: '08:00',
        endTime: '09:00',
        duration: 60,
        status: 'CANCELLED',
        totalPrice: 1500,
        notes: 'Cancelled due to weather',
        paymentStatus: 'REFUNDED',
      },
    }),
  ]);

  console.log(`Created ${customers.length} customers`);
  console.log(`Created ${bookings.length} bookings`);
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