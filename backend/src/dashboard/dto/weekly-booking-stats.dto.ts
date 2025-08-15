import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class WeeklyBookingDataDto {
  @IsString()
  day: string; // Mon, Tue, Wed, etc.

  @IsNumber()
  @Type(() => Number)
  bookings: number;

  @IsString()
  date: string; // YYYY-MM-DD
}

export class WeeklyBookingStatsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeeklyBookingDataDto)
  weeklyData: WeeklyBookingDataDto[];

  @IsString()
  weekStart: string;

  @IsString()
  weekEnd: string;
}