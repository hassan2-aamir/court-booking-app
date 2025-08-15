import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { OverviewMetricsDto } from './dto/overview-metrics.dto';
import { WeeklyBookingStatsDto, WeeklyBookingDataDto } from './dto/weekly-booking-stats.dto';
import { CourtUtilizationDto, CourtUtilizationDataDto } from './dto/court-utilization.dto';
import { TodaysBookingSummaryDto } from './dto/todays-booking-summary.dto';
import { BookingStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getOverviewMetrics(): Promise<OverviewMetricsDto> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(startOfToday);
      endOfToday.setDate(endOfToday.getDate() + 1);

      // Get total bookings for current month
      const totalBookingsThisMonth = await this.prisma.booking.count({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          status: {
            not: BookingStatus.CANCELLED,
          },
        },
      });

      // Get active users (users who have made bookings in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeUsers = await this.prisma.user.count({
        where: {
          isActive: true,
          bookings: {
            some: {
              createdAt: {
                gte: thirtyDaysAgo,
              },
            },
          },
        },
      });

      // Get revenue for current month (only from paid bookings)
      const revenueResult = await this.prisma.booking.aggregate({
        _sum: {
          totalPrice: true,
        },
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          paymentStatus: PaymentStatus.PAID,
          status: {
            not: BookingStatus.CANCELLED,
          },
        },
      });

      const revenueThisMonth = revenueResult._sum.totalPrice || 0;

      // Get today's booking statistics
      const todaysBookings = await this.prisma.booking.count({
        where: {
          date: {
            gte: startOfToday,
            lt: endOfToday,
          },
          status: {
            not: BookingStatus.CANCELLED,
          },
        },
      });

      const completedTodaysBookings = await this.prisma.booking.count({
        where: {
          date: {
            gte: startOfToday,
            lt: endOfToday,
          },
          status: BookingStatus.COMPLETED,
        },
      });

      const pendingTodaysBookings = await this.prisma.booking.count({
        where: {
          date: {
            gte: startOfToday,
            lt: endOfToday,
          },
          status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
          },
        },
      });

      return {
        totalBookingsThisMonth,
        activeUsers,
        revenueThisMonth,
        todaysBookings,
        completedTodaysBookings,
        pendingTodaysBookings,
      };
    } catch (error) {
      this.logger.error('Error fetching overview metrics:', error);
      throw new Error('Failed to fetch overview metrics');
    }
  }

  async getWeeklyBookingStats(): Promise<WeeklyBookingStatsDto> {
    try {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Calculate offset to Monday
      
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() + mondayOffset);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weeklyData: WeeklyBookingDataDto[] = [];

      // Get bookings for each day of the week
      for (let i = 0; i < 7; i++) {
        const dayStart = new Date(weekStart);
        dayStart.setDate(weekStart.getDate() + i);
        dayStart.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        const bookingCount = await this.prisma.booking.count({
          where: {
            date: {
              gte: dayStart,
              lte: dayEnd,
            },
            status: {
              not: BookingStatus.CANCELLED,
            },
          },
        });

        weeklyData.push({
          day: dayNames[i],
          bookings: bookingCount,
          date: dayStart.toISOString().split('T')[0], // YYYY-MM-DD format
        });
      }

      return {
        weeklyData,
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
      };
    } catch (error) {
      this.logger.error('Error fetching weekly booking stats:', error);
      throw new Error('Failed to fetch weekly booking stats');
    }
  }

  async getCourtUtilizationStats(): Promise<CourtUtilizationDto> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Get all court types and their bookings in the last 30 days
      const courts = await this.prisma.court.findMany({
        where: {
          isActive: true,
        },
        include: {
          bookings: {
            where: {
              date: {
                gte: thirtyDaysAgo,
              },
              status: {
                not: BookingStatus.CANCELLED,
              },
            },
          },
          availability: true,
        },
      });

      // Group courts by type and calculate utilization
      const courtTypeStats = new Map<string, {
        totalHours: number;
        bookedHours: number;
        courts: any[];
      }>();

      courts.forEach(court => {
        if (!courtTypeStats.has(court.type)) {
          courtTypeStats.set(court.type, {
            totalHours: 0,
            bookedHours: 0,
            courts: [],
          });
        }
        courtTypeStats.get(court.type)!.courts.push(court);
      });

      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];
      const utilizationData: CourtUtilizationDataDto[] = [];
      let colorIndex = 0;

      for (const [courtType, stats] of courtTypeStats) {
        let totalAvailableHours = 0;
        let totalBookedHours = 0;

        stats.courts.forEach(court => {
          // Calculate total available hours for this court in the last 30 days
          court.availability.forEach(availability => {
            const startTime = parseInt(availability.startTime.split(':')[0]);
            const endTime = parseInt(availability.endTime.split(':')[0]);
            const dailyHours = endTime - startTime;
            
            // Multiply by 30 days, but only count days that match the dayOfWeek
            // For simplicity, assume each day of week occurs ~4.3 times in 30 days
            totalAvailableHours += dailyHours * 4.3;
          });

          // Calculate total booked hours for this court
          court.bookings.forEach(booking => {
            totalBookedHours += booking.duration / 60; // Convert minutes to hours
          });
        });

        stats.totalHours = Math.round(totalAvailableHours);
        stats.bookedHours = Math.round(totalBookedHours);

        const utilizationPercentage = totalAvailableHours > 0 
          ? Math.round((totalBookedHours / totalAvailableHours) * 100)
          : 0;

        utilizationData.push({
          name: courtType,
          value: utilizationPercentage,
          color: colors[colorIndex % colors.length],
          totalHours: stats.totalHours,
          bookedHours: stats.bookedHours,
        });

        colorIndex++;
      }

      return {
        utilizationData,
        calculationPeriod: 'Last 30 days',
      };
    } catch (error) {
      this.logger.error('Error fetching court utilization stats:', error);
      throw new Error('Failed to fetch court utilization stats');
    }
  }

  async getTodaysBookingSummary(): Promise<TodaysBookingSummaryDto> {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(startOfToday);
      endOfToday.setDate(endOfToday.getDate() + 1);

      // Get all bookings for today
      const todaysBookings = await this.prisma.booking.findMany({
        where: {
          date: {
            gte: startOfToday,
            lt: endOfToday,
          },
        },
      });

      const totalBookings = todaysBookings.length;
      const completedBookings = todaysBookings.filter(b => b.status === BookingStatus.COMPLETED).length;
      const pendingBookings = todaysBookings.filter(b => b.status === BookingStatus.PENDING).length;
      const confirmedBookings = todaysBookings.filter(b => b.status === BookingStatus.CONFIRMED).length;
      const cancelledBookings = todaysBookings.filter(b => b.status === BookingStatus.CANCELLED).length;
      const noShowBookings = todaysBookings.filter(b => b.status === BookingStatus.NO_SHOW).length;

      // Calculate total revenue for today (only from paid bookings)
      const totalRevenue = todaysBookings
        .filter(b => b.paymentStatus === PaymentStatus.PAID && b.status !== BookingStatus.CANCELLED)
        .reduce((sum, booking) => sum + booking.totalPrice, 0);

      return {
        totalBookings,
        completedBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        noShowBookings,
        totalRevenue,
      };
    } catch (error) {
      this.logger.error('Error fetching today\'s booking summary:', error);
      throw new Error('Failed to fetch today\'s booking summary');
    }
  }
}
