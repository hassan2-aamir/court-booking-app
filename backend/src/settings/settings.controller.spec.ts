import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

describe('SettingsController', () => {
  let controller: SettingsController;
  let service: SettingsService;

  const mockSettingsService = {
    getBusinessSettings: jest.fn(),
    createBusinessSettings: jest.fn(),
    updateBusinessSettings: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        {
          provide: SettingsService,
          useValue: mockSettingsService,
        },
      ],
    }).compile();

    controller = module.get<SettingsController>(SettingsController);
    service = module.get<SettingsService>(SettingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBusinessSettings', () => {
    it('should throw NotFoundException when settings do not exist', async () => {
      mockSettingsService.getBusinessSettings.mockResolvedValue(null);

      await expect(controller.getBusinessSettings()).rejects.toThrow(NotFoundException);
    });

    it('should return business settings when they exist', async () => {
      const mockSettings = {
        businessName: 'Test Business',
        phone: '+1234567890',
        email: 'test@example.com',
        businessHours: { start: '09:00', end: '18:00' },
      };

      mockSettingsService.getBusinessSettings.mockResolvedValue(mockSettings);

      const result = await controller.getBusinessSettings();

      expect(result).toEqual(mockSettings);
    });
  });
});