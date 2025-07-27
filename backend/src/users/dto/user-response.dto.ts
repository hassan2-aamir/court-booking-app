export class UserResponseDto {
    id: string;
    email: string ;
    name: string | null;
    password: string | null;
    createdAt: Date;
    updatedAt: Date;
}