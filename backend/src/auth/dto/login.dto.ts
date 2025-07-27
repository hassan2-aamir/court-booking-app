import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class LoginDto {
    @ApiProperty({ example: '+923001234567' })
    @IsString()
    @Matches(/^\+?[1-9]\d{1,14}$/)
    phone: string;

    @ApiProperty({ example: 'manager123' })
    @IsString()
    @MinLength(6)
    password: string;
}