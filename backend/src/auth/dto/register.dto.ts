import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  cnic?: string;

  @IsOptional()
  @IsString()
  address?: string;
}