import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export class CreateBookingDto {
    @IsString()
    @IsNotEmpty()
    bookingId: string;

    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    courtId: string;

    @IsDateString()
    date: string;

    @IsString()
    @IsNotEmpty()
    startTime: string;

    @IsString()
    @IsNotEmpty()
    endTime: string;

    @IsNumber()
    @Type(() => Number)
    duration: number;

    @IsOptional()
    @IsEnum(BookingStatus)
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

    @IsNumber()
    @Type(() => Number)
    totalPrice: number;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsEnum(PaymentStatus)
    paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED';
}
