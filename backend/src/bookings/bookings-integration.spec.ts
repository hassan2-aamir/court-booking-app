import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { CourtsService } from '../courts/courts.service';
import { PrismaService } from '../database/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('BookingsService Integration with Court Settings', () => {
  let bookingsService: BookingsService;
  let courtsService: CourtsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        CourtsService,
        {
          provide: PrismaService,
          useValue: {
            court: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
            booking: {
              findFirst: jest.fn(),
              create: jest.fn(),
            },
            courtUnavailability: {
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            peakSchedule: {
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    bookingsService = module.get<BookingsService>(BookingsService);
    courtsService = module.get<CourtsService>(CourtsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(bookingsService).toBeDefined();
    expect(courtsService).toBeDefined();
  });

  describe('Settings Integration', () => {
    it('should validate advanced booking limit during booking creation', async () => {
      // This test verifies that the booking service correctly validates
      // the advanced booking limit when creating a new booking
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 40); // 40 days from now
      
      const mockCourt = {
        id: 'court-1',
        isActive: true,
        advancedBookingLimit: 30, // Only 30 days allowed
        pricePerHour: 100,
        unavailability: [],
        peakSchedules: [],
      };

      const mockUser = {
        id: 'user-1',
        isActive: true,
      };

      (prismaService.court.findUnique as jest.Mock).mockResolvedValue(mockCourt);
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const createBookingDto = {
        bookingId: 'booking-1',
        userId: 'user-1',
        courtId: 'court-1',
        date: futureDate.toISOString(),
        startTime: '10:00',
        endTime: '11:00',
        duration: 60,
        totalPrice: 100,
      };

      await expect(bookingsService.create(createBookingDto)).rejects.toThrow(
        'Booking date cannot be more than 30 days in advance'
      );
    });

    it('should validate court unavailability during booking creation', async () => {
      // This test verifies that the booking service correctly validates
      // court unavailabilities when creating a new booking
      
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + 5);
      
      const mockCourt = {
        id: 'court-1',
        isActive: true,
        advancedBookingLimit: 30,
        pricePerHour: 100,
        unavailability: [
          {
            id: 'unavail-1',
            date: bookingDate,
            startTime: '09:00',
            endTime: '12:00',
            reason: 'Maintenance',
            isRecurring: false,
          },
        ],
        peakSchedules: [],
      };

      const mockUser = {
        id: 'user-1',
        isActive: true,
      };

      (prismaService.court.findUnique as jest.Mock).mockResolvedValue(mockCourt);
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const createBookingDto = {
        bookingId: 'booking-1',
        userId: 'user-1',
        courtId: 'court-1',
        date: bookingDate.toISOString(),
        startTime: '10:00',
        endTime: '11:00',
        duration: 60,
        totalPrice: 100,
      };

      await expect(bookingsService.create(createBookingDto)).rejects.toThrow(
        'Court is unavailable during the requested time: Maintenance'
      );
    });

    it('should apply peak pricing during booking creation', async () => {
      // This test verifies that the booking service correctly applies
      // peak pricing when creating a new booking
      
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + 5);
      const dayOfWeek = bookingDate.getDay();
      
      const mockCourt = {
        id: 'court-1',
        isActive: true,
        advancedBookingLimit: 30,
        pricePerHour: 100,
        unavailability: [],
        peakSchedules: [
          {
            id: 'peak-1',
            dayOfWeek,
            startTime: '17:00',
            endTime: '20:00',
            price: 150, // Peak price higher than regular
          },
        ],
      };

      const mockUser = {
        id: 'user-1',
        isActive: true,
      };

      const mockCreatedBooking = {
        id: 'booking-1',
        bookingId: 'booking-1',
        userId: 'user-1',
        courtId: 'court-1',
        date: bookingDate,
        startTime: '18:00',
        endTime: '19:00',
        duration: 60,
        totalPrice: 150, // Peak price applied
        status: 'PENDING',
        paymentStatus: 'PENDING',
        user: { id: 'user-1', name: 'Test User', phoneNumber: '123', email: 'test@test.com' },
        court: { id: 'court-1', name: 'Court 1', type: 'Tennis', pricePerHour: 100 },
      };

      (prismaService.court.findUnique as jest.Mock).mockResolvedValue(mockCourt);
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.booking.findFirst as jest.Mock).mockResolvedValue(null); // No conflicts
      (prismaService.booking.create as jest.Mock).mockResolvedValue(mockCreatedBooking);

      const createBookingDto = {
        bookingId: 'booking-1',
        userId: 'user-1',
        courtId: 'court-1',
        date: bookingDate.toISOString(),
        startTime: '18:00',
        endTime: '19:00',
        duration: 60,
        totalPrice: 100, // This will be recalculated
      };

      const result = await bookingsService.create(createBookingDto);

      expect(result.totalPrice).toBe(150); // Peak price should be applied
      expect(prismaService.booking.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          totalPrice: 150,
        }),
        include: expect.any(Object),
      });
    });
  });
});