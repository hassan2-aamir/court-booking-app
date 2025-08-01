import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PrismaClient, Role } from '@prisma/client';


@Injectable()
export class UsersService {

  private prisma = new PrismaClient();

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.create({
      data: createUserDto,
    });
    
    return {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email ?? null,
      cnic: user.cnic ?? null,
      address: user.address ?? null,
      role: user.role as 'CUSTOMER' | 'MANAGER' | 'ADMIN',
      isActive: user.isActive,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  findAll(): Promise<UserResponseDto[]> {
    return this.prisma.user.findMany().then(users => 
      users.map(user => ({
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email ?? null,
        cnic: user.cnic ?? null,
        address: user.address ?? null,
        role: user.role as 'CUSTOMER' | 'MANAGER' | 'ADMIN',
        isActive: user.isActive,
        password: user.password,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }))
    );
  }

  async findByEmail(email: string) : Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });
    if (!user || !user.email) return null;
    // Map user entity to UserResponseDto
    const userResponse: UserResponseDto = {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email ?? null,
      cnic: user.cnic ?? null,
      address: user.address ?? null,
      role: user.role as 'CUSTOMER' | 'MANAGER' | 'ADMIN',
      isActive: user.isActive,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return userResponse;
  }

  async findByPhone(phoneNumber: string) : Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findFirst({
      where: { phoneNumber },
    });
    if (!user || !user.phoneNumber) return null;
    // Map user entity to UserResponseDto
    const userResponse: UserResponseDto = {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email ?? null,
      cnic: user.cnic ?? null,
      address: user.address ?? null,
      role: user.role as 'CUSTOMER' | 'MANAGER' | 'ADMIN',
      isActive: user.isActive,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return userResponse;
  }

  async findOne(id: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) return null;
    
    return {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email ?? null,
      cnic: user.cnic ?? null,
      address: user.address ?? null,
      role: user.role as 'CUSTOMER' | 'MANAGER' | 'ADMIN',
      isActive: user.isActive,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    
    return {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email ?? null,
      cnic: user.cnic ?? null,
      address: user.address ?? null,
      role: user.role as 'CUSTOMER' | 'MANAGER' | 'ADMIN',
      isActive: user.isActive,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async remove(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.delete({
      where: { id },
    });
    
    return {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email ?? null,
      cnic: user.cnic ?? null,
      address: user.address ?? null,
      role: user.role as 'CUSTOMER' | 'MANAGER' | 'ADMIN',
      isActive: user.isActive,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // Search users by name or phone
  async searchUsers(query: string, role?: Role): Promise<UserResponseDto[]> {
    const whereClause: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { phoneNumber: { contains: query } },
      ],
    };

    if (role) {
      whereClause.role = role;
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
    });

    return users.map(user => ({
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email ?? null,
      cnic: user.cnic ?? null,
      address: user.address ?? null,
      role: user.role as 'CUSTOMER' | 'MANAGER' | 'ADMIN',
      isActive: user.isActive,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  // Find users by role
  async findByRole(role: Role): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      where: { role },
    });

    return users.map(user => ({
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email ?? null,
      cnic: user.cnic ?? null,
      address: user.address ?? null,
      role: user.role as 'CUSTOMER' | 'MANAGER' | 'ADMIN',
      isActive: user.isActive,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }
}
