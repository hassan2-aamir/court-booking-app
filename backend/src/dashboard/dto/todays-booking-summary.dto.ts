import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class TodaysBookingSummaryDto {
  @IsNumber()
  @Type(() => Number)
  totalBookings: number;

  @IsNumber()
  @Type(() => Number)
  completedBookings: number;

  @IsNumber()
  @Type(() => Number)
  pendingBookings: number;

  @IsNumber()
  @Type(() => Number)
  confirmedBookings: number;

  @IsNumber()
  @Type(() => Number)
  cancelledBookings: number;

  @IsNumber()
  @Type(() => Number)
  noShowBookings: number;

  @IsNumber()
  @Type(() => Number)
  totalRevenue: number;
}