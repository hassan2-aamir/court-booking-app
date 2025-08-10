import { IsNumber, Min, Max } from 'class-validator';

export class UpdateAdvancedBookingLimitDto {
  @IsNumber()
  @Min(1)
  @Max(365)
  advancedBookingLimit: number;
}