export class UserResponseDto {
    id: string;
    name: string;
    phoneNumber: string;
    email?: string | null;
    cnic?: string | null;
    address?: string | null;
    role: 'CUSTOMER' | 'MANAGER' | 'ADMIN';
    isActive: boolean;
    password?: string | null; // Usually omitted in responses for security
    createdAt: Date;
    updatedAt: Date;
}