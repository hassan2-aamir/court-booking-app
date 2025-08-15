import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class OverviewMetricsDto {
  @IsNumber()
  @Type(() => Number)
  totalBookingsThisMonth: number;

  @IsNumber()
  @Type(() => Number)
  activeUsers: number;

  @IsNumber()
  @Type(() => Number)
  revenueThisMonth: number;

  @IsNumber()
  @Type(() => Number)
  todaysBookings: number;

  @IsNumber()
  @Type(() => Number)
  completedTodaysBookings: number;

  @IsNumber()
  @Type(() => Number)
  pendingTodaysBookings: number;
}