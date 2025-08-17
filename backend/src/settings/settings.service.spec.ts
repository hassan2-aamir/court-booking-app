import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { PrismaService } from '../database/prisma.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    systemSetting: {
      findMany: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBusinessSettings', () => {
    it('should return null when no settings exist', async () => {
      mockPrismaService.systemSetting.findMany.mockResolvedValue([]);

      const result = await service.getBusinessSettings();

      expect(result).toBeNull();
    });

    it('should return business settings when they exist', async () => {
      const mockSettings = [
        { key: 'businessName', value: 'Test Business', type: 'string' },
        { key: 'phone', value: '+1234567890', type: 'string' },
        { key: 'email', value: 'test@example.com', type: 'string' },
        { key: 'businessHours', value: '{"start":"09:00","end":"18:00"}', type: 'json' },
      ];

      mockPrismaService.systemSetting.findMany.mockResolvedValue(mockSettings);

      const result = await service.getBusinessSettings();

      expect(result).toEqual({
        businessName: 'Test Business',
        phone: '+1234567890',
        email: 'test@example.com',
        businessHours: { start: '09:00', end: '18:00' },
        maxBookingsPerUser: 3,
        defaultDuration: '1',
        advanceBookingLimit: 30,
      });
    });
  });
});