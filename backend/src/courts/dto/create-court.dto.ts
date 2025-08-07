// Make sure your DTOs properly validate the data
// create-court.dto.ts
import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CourtUnavailabilityDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;
}

export class PeakScheduleDto {
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CourtAvailabilityDto {
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsNumber()
  @Min(5)
  slotDuration?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxBookingsPerUserPerDay?: number;
}

export class CreateCourtDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  pricePerHour: number;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  advancedBookingLimit?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourtAvailabilityDto)
  availability: CourtAvailabilityDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourtUnavailabilityDto)
  unavailability?: CourtUnavailabilityDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PeakScheduleDto)
  peakSchedules?: PeakScheduleDto[];
}