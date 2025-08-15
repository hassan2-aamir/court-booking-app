import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CourtUtilizationDataDto {
  @IsString()
  name: string; // Court type name

  @IsNumber()
  @Type(() => Number)
  value: number; // Utilization percentage

  @IsString()
  color: string; // Chart color

  @IsNumber()
  @Type(() => Number)
  totalHours: number; // Total available hours

  @IsNumber()
  @Type(() => Number)
  bookedHours: number; // Total booked hours
}

export class CourtUtilizationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourtUtilizationDataDto)
  utilizationData: CourtUtilizationDataDto[];

  @IsString()
  calculationPeriod: string; // e.g., "Last 30 days"
}