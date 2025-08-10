import { IsNumber, IsString, Min, Max } from 'class-validator';

export class CreateCourtPeakScheduleDto {
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