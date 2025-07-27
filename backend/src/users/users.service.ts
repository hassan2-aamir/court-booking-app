import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PrismaClient } from '@prisma/client';


@Injectable()
export class UsersService {

  private prisma = new PrismaClient();

  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async findByEmail(email: string) : Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });
    if (!user || !user.email) return null;
    // Map user entity to UserResponseDto
    const userResponse: UserResponseDto = {
      id: user.id,
      email: user.email ?? null,
      phoneNumber: user.phoneNumber,
      name: user.name,
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
      email: user.email ?? null,
      phoneNumber: user.phoneNumber,
      name: user.name,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return userResponse;
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
