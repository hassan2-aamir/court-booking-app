export class UserResponseDto {
    id: string;
    email: string | null;
    phoneNumber: string;
    name: string | null;
    password: string | null;
    createdAt: Date;
    updatedAt: Date;
}