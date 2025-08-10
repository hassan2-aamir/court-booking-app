import { IsDateString, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateCourtUnavailabilityDto {
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
  
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;
}