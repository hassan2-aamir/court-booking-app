import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../database/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { BookingStatus, PaymentStatus } from '@prisma/client';

describe('BookingsService', () => {
  let service: BookingsService;
  let mockPrismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrisma = {
      court: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      booking: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn().mockResolvedValue(null),
        delete: jest.fn().mockResolvedValue(null),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    mockPrismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Integration tests would be added here to test the new settings functionality
  // For now, we'll focus on the basic service functionality
});
