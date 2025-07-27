import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";


export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    @IsEmail()
    email?: string;

    @IsString()
    cnic?: string;

    @IsString()
    address?: string;

    @IsString()
    role?: "CUSTOMER" | "MANAGER" | "ADMIN";

    @IsString()
    @MinLength(6)
    password?: string;

    // isActive, createdAt, updatedAt, id, bookings are handled by the system
}
