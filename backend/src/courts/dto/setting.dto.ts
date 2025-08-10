import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, IsDateString, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UnavailabilitySettingDto {
  @IsString()
  id: string;

  @IsString()
  courtId: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsDateString()
  date: string;

  @IsString()
  reason: string;

  @IsBoolean()
  isRecurring: boolean;
}

export class PeakScheduleSettingDto {
  @IsString()
  id: string;

  @IsString()
  courtId: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class SettingDto {
  @IsString()
  courtId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  advancedBookingLimit?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnavailabilitySettingDto)
  unavailability?: UnavailabilitySettingDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PeakScheduleSettingDto)
  peakSchedules?: PeakScheduleSettingDto[];
}