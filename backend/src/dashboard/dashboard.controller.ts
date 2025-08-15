import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { OverviewMetricsDto } from './dto/overview-metrics.dto';
import { WeeklyBookingStatsDto } from './dto/weekly-booking-stats.dto';
import { CourtUtilizationDto } from './dto/court-utilization.dto';
import { TodaysBookingSummaryDto } from './dto/todays-booking-summary.dto';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
@ApiBearerAuth('JWT-auth')
@ApiTags('Dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard overview metrics' })
  @ApiResponse({ status: 200, description: 'Overview metrics retrieved successfully', type: OverviewMetricsDto })
  async getOverviewMetrics(): Promise<OverviewMetricsDto> {
    return this.dashboardService.getOverviewMetrics();
  }

  @Get('weekly-bookings')
  @ApiOperation({ summary: 'Get weekly booking statistics' })
  @ApiResponse({ status: 200, description: 'Weekly booking stats retrieved successfully', type: WeeklyBookingStatsDto })
  async getWeeklyBookingStats(): Promise<WeeklyBookingStatsDto> {
    return this.dashboardService.getWeeklyBookingStats();
  }

  @Get('court-utilization')
  @ApiOperation({ summary: 'Get court utilization statistics' })
  @ApiResponse({ status: 200, description: 'Court utilization stats retrieved successfully', type: CourtUtilizationDto })
  async getCourtUtilizationStats(): Promise<CourtUtilizationDto> {
    return this.dashboardService.getCourtUtilizationStats();
  }

  @Get('todays-summary')
  @ApiOperation({ summary: 'Get today\'s booking summary' })
  @ApiResponse({ status: 200, description: 'Today\'s booking summary retrieved successfully', type: TodaysBookingSummaryDto })
  async getTodaysBookingSummary(): Promise<TodaysBookingSummaryDto> {
    return this.dashboardService.getTodaysBookingSummary();
  }
}
