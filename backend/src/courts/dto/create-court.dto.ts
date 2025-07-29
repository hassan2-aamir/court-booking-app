// Make sure your DTOs properly validate the data
// create-court.dto.ts
import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourtAvailabilityDto)
  availability: CourtAvailabilityDto[];
}