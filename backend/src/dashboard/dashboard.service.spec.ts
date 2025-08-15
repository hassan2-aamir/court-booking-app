import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../database/prisma.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';

describe('DashboardService', () => {
  let service: DashboardService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    booking: {
      count: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
    court: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOverviewMetrics', () => {
    it('should return overview metrics', async () => {
      // Mock the database calls
      mockPrismaService.booking.count
        .mockResolvedValueOnce(150) // totalBookingsThisMonth
        .mockResolvedValueOnce(25)  // todaysBookings
        .mockResolvedValueOnce(20)  // completedTodaysBookings
        .mockResolvedValueOnce(5);  // pendingTodaysBookings

      mockPrismaService.user.count.mockResolvedValue(75); // activeUsers

      mockPrismaService.booking.aggregate.mockResolvedValue({
        _sum: { totalPrice: 5000 }
      }); // revenueThisMonth

      const result = await service.getOverviewMetrics();

      expect(result).toEqual({
        totalBookingsThisMonth: 150,
        activeUsers: 75,
        revenueThisMonth: 5000,
        todaysBookings: 25,
        completedTodaysBookings: 20,
        pendingTodaysBookings: 5,
      });
    });

    it('should handle null revenue', async () => {
      mockPrismaService.booking.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      mockPrismaService.user.count.mockResolvedValue(0);

      mockPrismaService.booking.aggregate.mockResolvedValue({
        _sum: { totalPrice: null }
      });

      const result = await service.getOverviewMetrics();

      expect(result.revenueThisMonth).toBe(0);
    });
  });

  describe('getWeeklyBookingStats', () => {
    it('should return weekly booking statistics', async () => {
      // Mock booking counts for each day of the week
      mockPrismaService.booking.count
        .mockResolvedValueOnce(10) // Monday
        .mockResolvedValueOnce(15) // Tuesday
        .mockResolvedValueOnce(12) // Wednesday
        .mockResolvedValueOnce(18) // Thursday
        .mockResolvedValueOnce(20) // Friday
        .mockResolvedValueOnce(25) // Saturday
        .mockResolvedValueOnce(22); // Sunday

      const result = await service.getWeeklyBookingStats();

      expect(result.weeklyData).toHaveLength(7);
      expect(result.weeklyData[0].day).toBe('Mon');
      expect(result.weeklyData[0].bookings).toBe(10);
      expect(result.weekStart).toBeDefined();
      expect(result.weekEnd).toBeDefined();
    });
  });

  describe('getCourtUtilizationStats', () => {
    it('should return court utilization statistics', async () => {
      const mockCourts = [
        {
          id: '1',
          type: 'Tennis',
          bookings: [
            { duration: 60 }, // 1 hour
            { duration: 120 }, // 2 hours
          ],
          availability: [
            { startTime: '09:00', endTime: '17:00' }, // 8 hours daily
          ],
        },
        {
          id: '2',
          type: 'Basketball',
          bookings: [
            { duration: 90 }, // 1.5 hours
          ],
          availability: [
            { startTime: '10:00', endTime: '18:00' }, // 8 hours daily
          ],
        },
      ];

      mockPrismaService.court.findMany.mockResolvedValue(mockCourts);

      const result = await service.getCourtUtilizationStats();

      expect(result.utilizationData).toHaveLength(2);
      expect(result.utilizationData[0].name).toBe('Tennis');
      expect(result.utilizationData[1].name).toBe('Basketball');
      expect(result.calculationPeriod).toBe('Last 30 days');
    });
  });

  describe('getTodaysBookingSummary', () => {
    it('should return today\'s booking summary', async () => {
      const mockBookings = [
        { status: BookingStatus.COMPLETED, paymentStatus: PaymentStatus.PAID, totalPrice: 100 },
        { status: BookingStatus.PENDING, paymentStatus: PaymentStatus.PENDING, totalPrice: 150 },
        { status: BookingStatus.CONFIRMED, paymentStatus: PaymentStatus.PAID, totalPrice: 200 },
        { status: BookingStatus.CANCELLED, paymentStatus: PaymentStatus.REFUNDED, totalPrice: 75 },
        { status: BookingStatus.NO_SHOW, paymentStatus: PaymentStatus.PAID, totalPrice: 125 },
      ];

      mockPrismaService.booking.findMany.mockResolvedValue(mockBookings);

      const result = await service.getTodaysBookingSummary();

      expect(result).toEqual({
        totalBookings: 5,
        completedBookings: 1,
        pendingBookings: 1,
        confirmedBookings: 1,
        cancelledBookings: 1,
        noShowBookings: 1,
        totalRevenue: 425, // 100 + 200 + 125 (paid bookings excluding cancelled)
      });
    });
  });
});
