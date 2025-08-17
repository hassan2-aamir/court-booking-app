import { IsString, IsEmail, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BusinessHoursDto {
  @IsString()
  start: string;

  @IsString()
  end: string;
}

export class BusinessSettingsDto {
  @IsString()
  businessName: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsObject()
  @ValidateNested()
  @Type(() => BusinessHoursDto)
  businessHours: BusinessHoursDto;

  @IsOptional()
  maxBookingsPerUser?: number;

  @IsOptional()
  defaultDuration?: string;

  @IsOptional()
  advanceBookingLimit?: number;
}

export class UpdateBusinessSettingsDto {
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BusinessHoursDto)
  businessHours?: BusinessHoursDto;

  @IsOptional()
  maxBookingsPerUser?: number;

  @IsOptional()
  defaultDuration?: string;

  @IsOptional()
  advanceBookingLimit?: number;
}