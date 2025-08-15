import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  const mockDashboardService = {
    getOverviewMetrics: jest.fn(),
    getWeeklyBookingStats: jest.fn(),
    getCourtUtilizationStats: jest.fn(),
    getTodaysBookingSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOverviewMetrics', () => {
    it('should return overview metrics', async () => {
      const mockMetrics = {
        totalBookingsThisMonth: 150,
        activeUsers: 75,
        revenueThisMonth: 5000,
        todaysBookings: 25,
        completedTodaysBookings: 20,
        pendingTodaysBookings: 5,
      };

      mockDashboardService.getOverviewMetrics.mockResolvedValue(mockMetrics);

      const result = await controller.getOverviewMetrics();

      expect(result).toEqual(mockMetrics);
      expect(service.getOverviewMetrics).toHaveBeenCalled();
    });
  });

  describe('getWeeklyBookingStats', () => {
    it('should return weekly booking stats', async () => {
      const mockStats = {
        weeklyData: [
          { day: 'Mon', bookings: 10, date: '2024-01-01' },
          { day: 'Tue', bookings: 15, date: '2024-01-02' },
        ],
        weekStart: '2024-01-01',
        weekEnd: '2024-01-07',
      };

      mockDashboardService.getWeeklyBookingStats.mockResolvedValue(mockStats);

      const result = await controller.getWeeklyBookingStats();

      expect(result).toEqual(mockStats);
      expect(service.getWeeklyBookingStats).toHaveBeenCalled();
    });
  });

  describe('getCourtUtilizationStats', () => {
    it('should return court utilization stats', async () => {
      const mockUtilization = {
        utilizationData: [
          { name: 'Tennis', value: 75, color: '#8884d8', totalHours: 100, bookedHours: 75 },
        ],
        calculationPeriod: 'Last 30 days',
      };

      mockDashboardService.getCourtUtilizationStats.mockResolvedValue(mockUtilization);

      const result = await controller.getCourtUtilizationStats();

      expect(result).toEqual(mockUtilization);
      expect(service.getCourtUtilizationStats).toHaveBeenCalled();
    });
  });

  describe('getTodaysBookingSummary', () => {
    it('should return today\'s booking summary', async () => {
      const mockSummary = {
        totalBookings: 5,
        completedBookings: 1,
        pendingBookings: 1,
        confirmedBookings: 1,
        cancelledBookings: 1,
        noShowBookings: 1,
        totalRevenue: 425,
      };

      mockDashboardService.getTodaysBookingSummary.mockResolvedValue(mockSummary);

      const result = await controller.getTodaysBookingSummary();

      expect(result).toEqual(mockSummary);
      expect(service.getTodaysBookingSummary).toHaveBeenCalled();
    });
  });
});
