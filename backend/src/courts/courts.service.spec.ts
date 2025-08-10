import { Test, TestingModule } from '@nestjs/testing';
import { CourtsService } from './courts.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CourtsService', () => {
  let service: CourtsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    court: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    courtAvailability: {
      findMany: jest.fn(),
    },
    courtUnavailability: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
    peakSchedule: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourtsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CourtsService>(CourtsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSetting', () => {
    it('should return court settings successfully', async () => {
      const courtId = 'court-1';
      const mockCourt = {
        id: courtId,
        advancedBookingLimit: 30,
        unavailability: [
          {
            id: 'unavail-1',
            startTime: '09:00',
            endTime: '10:00',
            date: new Date('2024-01-01'),
            reason: 'Maintenance',
            isRecurring: false,
          },
        ],
        peakSchedules: [
          {
            id: 'peak-1',
            startTime: '18:00',
            endTime: '20:00',
            dayOfWeek: 1,
            price: 100,
          },
        ],
      };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);

      const result = await service.getSetting(courtId);

      expect(result).toEqual({
        courtId,
        advancedBookingLimit: 30,
        unavailability: [
          {
            startTime: '09:00',
            endTime: '10:00',
            date: '2024-01-01T00:00:00.000Z',
            reason: 'Maintenance',
            isRecurring: false,
          },
        ],
        peakSchedules: [
          {
            startTime: '18:00',
            endTime: '20:00',
            dayOfWeek: 1,
            price: 100,
          },
        ],
      });
    });

    it('should return null when court does not exist', async () => {
      const courtId = 'non-existent';
      mockPrismaService.court.findUnique.mockResolvedValue(null);

      const result = await service.getSetting(courtId);
      expect(result).toBeNull();
    });

    it('should handle court with no unavailabilities or peak schedules', async () => {
      const courtId = 'court-1';
      const mockCourt = {
        id: courtId,
        advancedBookingLimit: 30,
        unavailability: null,
        peakSchedules: null,
      };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);

      const result = await service.getSetting(courtId);

      expect(result).toEqual({
        courtId,
        advancedBookingLimit: 30,
        unavailability: [],
        peakSchedules: [],
      });
    });

    it('should handle court with empty arrays for unavailabilities and peak schedules', async () => {
      const courtId = 'court-1';
      const mockCourt = {
        id: courtId,
        advancedBookingLimit: 30,
        unavailability: [],
        peakSchedules: [],
      };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);

      const result = await service.getSetting(courtId);

      expect(result).toEqual({
        courtId,
        advancedBookingLimit: 30,
        unavailability: [],
        peakSchedules: [],
      });
    });
  });

  describe('getCourtSettings', () => {
    it('should return court settings successfully', async () => {
      const courtId = 'court-1';
      const mockCourt = {
        id: courtId,
        advancedBookingLimit: 30,
        unavailability: [
          {
            id: 'unavail-1',
            startTime: '09:00',
            endTime: '10:00',
            date: new Date('2024-01-01'),
            reason: 'Maintenance',
            isRecurring: false,
          },
        ],
        peakSchedules: [
          {
            id: 'peak-1',
            startTime: '18:00',
            endTime: '20:00',
            dayOfWeek: 1,
            price: 100,
          },
        ],
      };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);

      const result = await service.getCourtSettings(courtId);

      expect(result).toEqual({
        courtId,
        advancedBookingLimit: 30,
        unavailability: [
          {
            startTime: '09:00',
            endTime: '10:00',
            date: '2024-01-01T00:00:00.000Z',
            reason: 'Maintenance',
            isRecurring: false,
          },
        ],
        peakSchedules: [
          {
            startTime: '18:00',
            endTime: '20:00',
            dayOfWeek: 1,
            price: 100,
          },
        ],
      });
    });

    it('should throw NotFoundException when court does not exist', async () => {
      const courtId = 'non-existent';
      mockPrismaService.court.findUnique.mockResolvedValue(null);

      await expect(service.getCourtSettings(courtId)).rejects.toThrow('Court with ID non-existent not found');
    });

    it('should handle court with null unavailabilities and peak schedules', async () => {
      const courtId = 'court-1';
      const mockCourt = {
        id: courtId,
        advancedBookingLimit: 45,
        unavailability: null,
        peakSchedules: null,
      };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);

      const result = await service.getCourtSettings(courtId);

      expect(result).toEqual({
        courtId,
        advancedBookingLimit: 45,
        unavailability: [],
        peakSchedules: [],
      });
    });

    it('should handle unavailabilities with null start/end times', async () => {
      const courtId = 'court-1';
      const mockCourt = {
        id: courtId,
        advancedBookingLimit: 30,
        unavailability: [
          {
            id: 'unavail-1',
            startTime: null,
            endTime: null,
            date: new Date('2024-01-01'),
            reason: 'Full day closure',
            isRecurring: true,
          },
        ],
        peakSchedules: [],
      };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);

      const result = await service.getCourtSettings(courtId);

      expect(result).toEqual({
        courtId,
        advancedBookingLimit: 30,
        unavailability: [
          {
            startTime: undefined,
            endTime: undefined,
            date: '2024-01-01T00:00:00.000Z',
            reason: 'Full day closure',
            isRecurring: true,
          },
        ],
        peakSchedules: [],
      });
    });
  });

  describe('updateAdvancedBookingLimit', () => {
    it('should update advanced booking limit successfully', async () => {
      const courtId = 'court-1';
      const updateDto = { advancedBookingLimit: 60 };
      const mockCourt = { id: courtId, name: 'Court 1' };
      const updatedCourt = { ...mockCourt, advancedBookingLimit: 60 };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.court.update.mockResolvedValue(updatedCourt);

      const result = await service.updateAdvancedBookingLimit(courtId, updateDto);

      expect(result).toEqual(updatedCourt);
      expect(mockPrismaService.court.update).toHaveBeenCalledWith({
        where: { id: courtId },
        data: { advancedBookingLimit: 60 },
      });
    });

    it('should throw NotFoundException when court does not exist', async () => {
      const courtId = 'non-existent';
      const updateDto = { advancedBookingLimit: 60 };
      mockPrismaService.court.findUnique.mockResolvedValue(null);

      await expect(service.updateAdvancedBookingLimit(courtId, updateDto)).rejects.toThrow('Court with ID non-existent not found');
    });
  });

  describe('createCourtUnavailability', () => {
    it('should create unavailability successfully', async () => {
      const courtId = 'court-1';
      const createDto = {
        date: '2024-01-01',
        startTime: '09:00',
        endTime: '10:00',
        reason: 'Maintenance',
        isRecurring: false,
      };
      const mockCourt = { id: courtId, name: 'Court 1' };
      const createdUnavailability = {
        id: 'unavail-1',
        courtId,
        ...createDto,
        date: new Date(createDto.date),
      };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.courtUnavailability.findMany.mockResolvedValue([]);
      mockPrismaService.courtUnavailability.create.mockResolvedValue(createdUnavailability);

      const result = await service.createCourtUnavailability(courtId, createDto);

      expect(result).toEqual(createdUnavailability);
      expect(mockPrismaService.courtUnavailability.create).toHaveBeenCalledWith({
        data: {
          courtId,
          date: new Date(createDto.date),
          startTime: createDto.startTime,
          endTime: createDto.endTime,
          reason: createDto.reason,
          isRecurring: false,
        },
      });
    });

    it('should throw BadRequestException for invalid time range', async () => {
      const courtId = 'court-1';
      const createDto = {
        date: '2024-01-01',
        startTime: '10:00',
        endTime: '09:00', // End time before start time
        reason: 'Maintenance',
      };
      const mockCourt = { id: courtId, name: 'Court 1' };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);

      await expect(service.createCourtUnavailability(courtId, createDto)).rejects.toThrow('Start time must be before end time');
    });

    it('should throw BadRequestException for conflicting unavailability', async () => {
      const courtId = 'court-1';
      const createDto = {
        date: '2024-01-01',
        startTime: '09:00',
        endTime: '10:00',
        reason: 'Maintenance',
      };
      const mockCourt = { id: courtId, name: 'Court 1' };
      const existingUnavailability = {
        id: 'existing-1',
        courtId,
        date: new Date('2024-01-01'),
        startTime: '09:30',
        endTime: '10:30',
        reason: 'Existing',
        isRecurring: false,
      };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.courtUnavailability.findMany.mockResolvedValue([existingUnavailability]);

      await expect(service.createCourtUnavailability(courtId, createDto)).rejects.toThrow('Unavailability conflicts with existing unavailability');
    });
  });

  describe('createCourtPeakSchedule', () => {
    it('should create peak schedule successfully', async () => {
      const courtId = 'court-1';
      const createDto = {
        dayOfWeek: 1,
        startTime: '18:00',
        endTime: '20:00',
        price: 100,
      };
      const mockCourt = { id: courtId, name: 'Court 1' };
      const createdSchedule = {
        id: 'peak-1',
        courtId,
        ...createDto,
      };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.peakSchedule.findMany.mockResolvedValue([]);
      mockPrismaService.peakSchedule.create.mockResolvedValue(createdSchedule);

      const result = await service.createCourtPeakSchedule(courtId, createDto);

      expect(result).toEqual(createdSchedule);
      expect(mockPrismaService.peakSchedule.create).toHaveBeenCalledWith({
        data: {
          courtId,
          dayOfWeek: createDto.dayOfWeek,
          startTime: createDto.startTime,
          endTime: createDto.endTime,
          price: createDto.price,
        },
      });
    });

    it('should throw BadRequestException for overlapping schedules', async () => {
      const courtId = 'court-1';
      const createDto = {
        dayOfWeek: 1,
        startTime: '18:00',
        endTime: '20:00',
        price: 100,
      };
      const mockCourt = { id: courtId, name: 'Court 1' };
      const existingSchedule = {
        id: 'existing-1',
        courtId,
        dayOfWeek: 1,
        startTime: '19:00',
        endTime: '21:00',
        price: 80,
      };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.peakSchedule.findMany.mockResolvedValue([existingSchedule]);

      await expect(service.createCourtPeakSchedule(courtId, createDto)).rejects.toThrow('Peak schedule overlaps with existing schedule on Monday');
    });
  });

  describe('deleteCourtUnavailability', () => {
    it('should delete unavailability successfully', async () => {
      const courtId = 'court-1';
      const unavailabilityId = 'unavail-1';
      const mockCourt = { id: courtId, name: 'Court 1' };
      const mockUnavailability = { id: unavailabilityId, courtId };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.courtUnavailability.findFirst.mockResolvedValue(mockUnavailability);
      mockPrismaService.courtUnavailability.delete.mockResolvedValue(mockUnavailability);

      await service.deleteCourtUnavailability(courtId, unavailabilityId);

      expect(mockPrismaService.courtUnavailability.delete).toHaveBeenCalledWith({
        where: { id: unavailabilityId },
      });
    });

    it('should throw NotFoundException when unavailability does not exist', async () => {
      const courtId = 'court-1';
      const unavailabilityId = 'non-existent';
      const mockCourt = { id: courtId, name: 'Court 1' };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.courtUnavailability.findFirst.mockResolvedValue(null);

      await expect(service.deleteCourtUnavailability(courtId, unavailabilityId)).rejects.toThrow(`Unavailability with ID ${unavailabilityId} not found for court ${courtId}`);
    });
  });

  describe('updateCourtUnavailability', () => {
    it('should update unavailability successfully', async () => {
      const courtId = 'court-1';
      const unavailabilityId = 'unavail-1';
      const updateDto = {
        startTime: '10:00',
        endTime: '11:00',
        reason: 'Updated maintenance',
      };
      const mockCourt = { id: courtId, name: 'Court 1' };
      const mockUnavailability = { id: unavailabilityId, courtId };
      const updatedUnavailability = {
        id: unavailabilityId,
        courtId,
        ...updateDto,
        date: new Date('2024-01-01'),
        isRecurring: false,
      };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.courtUnavailability.findFirst.mockResolvedValue(mockUnavailability);
      mockPrismaService.courtUnavailability.findMany.mockResolvedValue([]);
      mockPrismaService.courtUnavailability.update.mockResolvedValue(updatedUnavailability);

      const result = await service.updateCourtUnavailability(courtId, unavailabilityId, updateDto);

      expect(result).toEqual(updatedUnavailability);
      expect(mockPrismaService.courtUnavailability.update).toHaveBeenCalledWith({
        where: { id: unavailabilityId },
        data: {
          startTime: updateDto.startTime,
          endTime: updateDto.endTime,
          reason: updateDto.reason,
        },
      });
    });

    it('should throw NotFoundException when court does not exist', async () => {
      const courtId = 'non-existent';
      const unavailabilityId = 'unavail-1';
      const updateDto = { reason: 'Updated' };

      mockPrismaService.court.findUnique.mockResolvedValue(null);

      await expect(service.updateCourtUnavailability(courtId, unavailabilityId, updateDto))
        .rejects.toThrow('Court with ID non-existent not found');
    });

    it('should throw NotFoundException when unavailability does not exist', async () => {
      const courtId = 'court-1';
      const unavailabilityId = 'non-existent';
      const updateDto = { reason: 'Updated' };
      const mockCourt = { id: courtId, name: 'Court 1' };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.courtUnavailability.findFirst.mockResolvedValue(null);

      await expect(service.updateCourtUnavailability(courtId, unavailabilityId, updateDto))
        .rejects.toThrow(`Unavailability with ID ${unavailabilityId} not found for court ${courtId}`);
    });

    it('should throw BadRequestException for invalid time range in update', async () => {
      const courtId = 'court-1';
      const unavailabilityId = 'unavail-1';
      const updateDto = {
        startTime: '10:00',
        endTime: '09:00', // End time before start time
      };
      const mockCourt = { id: courtId, name: 'Court 1' };
      const mockUnavailability = { id: unavailabilityId, courtId };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.courtUnavailability.findFirst.mockResolvedValue(mockUnavailability);

      await expect(service.updateCourtUnavailability(courtId, unavailabilityId, updateDto))
        .rejects.toThrow('Start time must be before end time');
    });
  });

  describe('getCourtUnavailabilities', () => {
    it('should return unavailabilities for a court', async () => {
      const courtId = 'court-1';
      const mockCourt = { id: courtId, name: 'Court 1' };
      const mockUnavailabilities = [
        {
          id: 'unavail-1',
          courtId,
          date: new Date('2024-01-01'),
          startTime: '09:00',
          endTime: '10:00',
          reason: 'Maintenance',
          isRecurring: false,
        },
        {
          id: 'unavail-2',
          courtId,
          date: new Date('2024-01-02'),
          startTime: null,
          endTime: null,
          reason: 'Closed',
          isRecurring: true,
        },
      ];

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.courtUnavailability.findMany.mockResolvedValue(mockUnavailabilities);

      const result = await service.getCourtUnavailabilities(courtId);

      expect(result).toEqual(mockUnavailabilities);
      expect(mockPrismaService.courtUnavailability.findMany).toHaveBeenCalledWith({
        where: { courtId },
        orderBy: [
          { date: 'asc' },
          { startTime: 'asc' },
        ],
      });
    });

    it('should throw NotFoundException when court does not exist', async () => {
      const courtId = 'non-existent';
      mockPrismaService.court.findUnique.mockResolvedValue(null);

      await expect(service.getCourtUnavailabilities(courtId))
        .rejects.toThrow('Court with ID non-existent not found');
    });
  });

  describe('getCourtPeakSchedules', () => {
    it('should return peak schedules for a court', async () => {
      const courtId = 'court-1';
      const mockCourt = { id: courtId, name: 'Court 1' };
      const mockSchedules = [
        {
          id: 'peak-1',
          courtId,
          dayOfWeek: 1,
          startTime: '18:00',
          endTime: '20:00',
          price: 100,
        },
        {
          id: 'peak-2',
          courtId,
          dayOfWeek: 5,
          startTime: '17:00',
          endTime: '19:00',
          price: 120,
        },
      ];

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.peakSchedule.findMany.mockResolvedValue(mockSchedules);

      const result = await service.getCourtPeakSchedules(courtId);

      expect(result).toEqual(mockSchedules);
      expect(mockPrismaService.peakSchedule.findMany).toHaveBeenCalledWith({
        where: { courtId },
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' },
        ],
      });
    });

    it('should throw NotFoundException when court does not exist', async () => {
      const courtId = 'non-existent';
      mockPrismaService.court.findUnique.mockResolvedValue(null);

      await expect(service.getCourtPeakSchedules(courtId))
        .rejects.toThrow('Court with ID non-existent not found');
    });
  });

  describe('updateCourtPeakSchedule', () => {
    it('should update peak schedule successfully', async () => {
      const courtId = 'court-1';
      const scheduleId = 'peak-1';
      const updateDto = {
        startTime: '19:00',
        endTime: '21:00',
        price: 150,
      };
      const mockCourt = { id: courtId, name: 'Court 1' };
      const mockSchedule = { id: scheduleId, courtId, dayOfWeek: 1 };
      const updatedSchedule = {
        id: scheduleId,
        courtId,
        dayOfWeek: 1,
        ...updateDto,
      };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.peakSchedule.findFirst.mockResolvedValue(mockSchedule);
      mockPrismaService.peakSchedule.findMany.mockResolvedValue([]);
      mockPrismaService.peakSchedule.update.mockResolvedValue(updatedSchedule);

      const result = await service.updateCourtPeakSchedule(courtId, scheduleId, updateDto);

      expect(result).toEqual(updatedSchedule);
      expect(mockPrismaService.peakSchedule.update).toHaveBeenCalledWith({
        where: { id: scheduleId },
        data: updateDto,
      });
    });

    it('should throw NotFoundException when court does not exist', async () => {
      const courtId = 'non-existent';
      const scheduleId = 'peak-1';
      const updateDto = { price: 150 };

      mockPrismaService.court.findUnique.mockResolvedValue(null);

      await expect(service.updateCourtPeakSchedule(courtId, scheduleId, updateDto))
        .rejects.toThrow('Court with ID non-existent not found');
    });

    it('should throw NotFoundException when peak schedule does not exist', async () => {
      const courtId = 'court-1';
      const scheduleId = 'non-existent';
      const updateDto = { price: 150 };
      const mockCourt = { id: courtId, name: 'Court 1' };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.peakSchedule.findFirst.mockResolvedValue(null);

      await expect(service.updateCourtPeakSchedule(courtId, scheduleId, updateDto))
        .rejects.toThrow(`Peak schedule with ID ${scheduleId} not found for court ${courtId}`);
    });

    it('should throw BadRequestException for overlapping schedules in update', async () => {
      const courtId = 'court-1';
      const scheduleId = 'peak-1';
      const updateDto = {
        dayOfWeek: 1,
        startTime: '18:00',
        endTime: '20:00',
      };
      const mockCourt = { id: courtId, name: 'Court 1' };
      const mockSchedule = { id: scheduleId, courtId, dayOfWeek: 1 };
      const existingSchedule = {
        id: 'existing-1',
        courtId,
        dayOfWeek: 1,
        startTime: '19:00',
        endTime: '21:00',
        price: 80,
      };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.peakSchedule.findFirst.mockResolvedValue(mockSchedule);
      mockPrismaService.peakSchedule.findMany.mockResolvedValue([existingSchedule]);

      await expect(service.updateCourtPeakSchedule(courtId, scheduleId, updateDto))
        .rejects.toThrow('Peak schedule overlaps with existing schedule on Monday');
    });
  });

  describe('deleteCourtPeakSchedule', () => {
    it('should delete peak schedule successfully', async () => {
      const courtId = 'court-1';
      const scheduleId = 'peak-1';
      const mockCourt = { id: courtId, name: 'Court 1' };
      const mockSchedule = { id: scheduleId, courtId };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.peakSchedule.findFirst.mockResolvedValue(mockSchedule);
      mockPrismaService.peakSchedule.delete.mockResolvedValue(mockSchedule);

      await service.deleteCourtPeakSchedule(courtId, scheduleId);

      expect(mockPrismaService.peakSchedule.delete).toHaveBeenCalledWith({
        where: { id: scheduleId },
      });
    });

    it('should throw NotFoundException when court does not exist', async () => {
      const courtId = 'non-existent';
      const scheduleId = 'peak-1';

      mockPrismaService.court.findUnique.mockResolvedValue(null);

      await expect(service.deleteCourtPeakSchedule(courtId, scheduleId))
        .rejects.toThrow('Court with ID non-existent not found');
    });

    it('should throw NotFoundException when peak schedule does not exist', async () => {
      const courtId = 'court-1';
      const scheduleId = 'non-existent';
      const mockCourt = { id: courtId, name: 'Court 1' };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.peakSchedule.findFirst.mockResolvedValue(null);

      await expect(service.deleteCourtPeakSchedule(courtId, scheduleId))
        .rejects.toThrow(`Peak schedule with ID ${scheduleId} not found for court ${courtId}`);
    });
  });

  describe('validation helpers and edge cases', () => {
    it('should validate time range correctly for invalid hour', async () => {
      const courtId = 'court-1';
      const createDto = {
        date: '2024-01-01',
        startTime: '25:00', // Invalid hour
        endTime: '10:00',
        reason: 'Maintenance',
      };
      const mockCourt = { id: courtId, name: 'Court 1' };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);

      await expect(service.createCourtUnavailability(courtId, createDto))
        .rejects.toThrow('Invalid time format: 25:00. Expected format: HH:MM');
    });

    it('should validate time range correctly for invalid minute', async () => {
      const courtId = 'court-1';
      const createDto = {
        date: '2024-01-01',
        startTime: '09:60', // Invalid minute
        endTime: '10:00',
        reason: 'Maintenance',
      };
      const mockCourt = { id: courtId, name: 'Court 1' };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);

      await expect(service.createCourtUnavailability(courtId, createDto))
        .rejects.toThrow('Invalid time format: 09:60. Expected format: HH:MM');
    });

    it('should handle unavailability without specific times (full day)', async () => {
      const courtId = 'court-1';
      const createDto = {
        date: '2024-01-01',
        reason: 'Closed for maintenance',
        isRecurring: false,
      };
      const mockCourt = { id: courtId, name: 'Court 1' };
      const createdUnavailability = {
        id: 'unavail-1',
        courtId,
        date: new Date(createDto.date),
        startTime: null,
        endTime: null,
        reason: createDto.reason,
        isRecurring: false,
      };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.courtUnavailability.findMany.mockResolvedValue([]);
      mockPrismaService.courtUnavailability.create.mockResolvedValue(createdUnavailability);

      const result = await service.createCourtUnavailability(courtId, createDto);

      expect(result).toEqual(createdUnavailability);
      expect(mockPrismaService.courtUnavailability.create).toHaveBeenCalledWith({
        data: {
          courtId,
          date: new Date(createDto.date),
          startTime: undefined,
          endTime: undefined,
          reason: createDto.reason,
          isRecurring: false,
        },
      });
    });

    it('should detect time overlap correctly for full day unavailabilities', async () => {
      const courtId = 'court-1';
      const createDto = {
        date: '2024-01-01',
        startTime: '09:00',
        endTime: '10:00',
        reason: 'Maintenance',
      };
      const mockCourt = { id: courtId, name: 'Court 1' };
      const existingFullDayUnavailability = {
        id: 'existing-1',
        courtId,
        date: new Date('2024-01-01'),
        startTime: null, // Full day
        endTime: null,
        reason: 'Closed',
        isRecurring: false,
      };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.courtUnavailability.findMany.mockResolvedValue([existingFullDayUnavailability]);

      await expect(service.createCourtUnavailability(courtId, createDto))
        .rejects.toThrow('Unavailability conflicts with existing unavailability');
    });

    it('should handle recurring unavailabilities', async () => {
      const courtId = 'court-1';
      const createDto = {
        date: '2024-01-01',
        startTime: '09:00',
        endTime: '10:00',
        reason: 'Weekly maintenance',
        isRecurring: true,
      };
      const mockCourt = { id: courtId, name: 'Court 1' };
      const createdUnavailability = {
        id: 'unavail-1',
        courtId,
        date: new Date(createDto.date),
        startTime: createDto.startTime,
        endTime: createDto.endTime,
        reason: createDto.reason,
        isRecurring: true,
      };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.courtUnavailability.findMany.mockResolvedValue([]);
      mockPrismaService.courtUnavailability.create.mockResolvedValue(createdUnavailability);

      const result = await service.createCourtUnavailability(courtId, createDto);

      expect(result).toEqual(createdUnavailability);
      expect(result.isRecurring).toBe(true);
    });

    it('should validate peak schedule with edge case times', async () => {
      const courtId = 'court-1';
      const createDto = {
        dayOfWeek: 0, // Sunday
        startTime: '23:59',
        endTime: '23:59', // Same time
        price: 100,
      };
      const mockCourt = { id: courtId, name: 'Court 1' };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);

      await expect(service.createCourtPeakSchedule(courtId, createDto))
        .rejects.toThrow('Start time must be before end time');
    });

    it('should handle peak schedule for all days of week', async () => {
      const courtId = 'court-1';
      const mockCourt = { id: courtId, name: 'Court 1' };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.peakSchedule.findMany.mockResolvedValue([]);

      for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
        const createDto = {
          dayOfWeek,
          startTime: '18:00',
          endTime: '20:00',
          price: 100,
        };
        const createdSchedule = {
          id: `peak-${dayOfWeek}`,
          courtId,
          ...createDto,
        };

        mockPrismaService.peakSchedule.create.mockResolvedValue(createdSchedule);

        const result = await service.createCourtPeakSchedule(courtId, createDto);
        expect(result.dayOfWeek).toBe(dayOfWeek);
      }
    });

    it('should handle complex time overlap scenarios', async () => {
      const courtId = 'court-1';
      const mockCourt = { id: courtId, name: 'Court 1' };

      // Test various overlap scenarios
      const testCases = [
        {
          existing: { startTime: '09:00', endTime: '11:00' },
          new: { startTime: '10:00', endTime: '12:00' },
          shouldOverlap: true,
          description: 'partial overlap at end',
        },
        {
          existing: { startTime: '10:00', endTime: '12:00' },
          new: { startTime: '09:00', endTime: '11:00' },
          shouldOverlap: true,
          description: 'partial overlap at start',
        },
        {
          existing: { startTime: '09:00', endTime: '13:00' },
          new: { startTime: '10:00', endTime: '12:00' },
          shouldOverlap: true,
          description: 'new completely inside existing',
        },
        {
          existing: { startTime: '10:00', endTime: '12:00' },
          new: { startTime: '09:00', endTime: '13:00' },
          shouldOverlap: true,
          description: 'new completely contains existing',
        },
        {
          existing: { startTime: '09:00', endTime: '10:00' },
          new: { startTime: '10:00', endTime: '11:00' },
          shouldOverlap: false,
          description: 'adjacent times (no overlap)',
        },
        {
          existing: { startTime: '10:00', endTime: '11:00' },
          new: { startTime: '09:00', endTime: '10:00' },
          shouldOverlap: false,
          description: 'adjacent times reverse (no overlap)',
        },
      ];

      for (const testCase of testCases) {
        const createDto = {
          dayOfWeek: 1,
          startTime: testCase.new.startTime,
          endTime: testCase.new.endTime,
          price: 100,
        };
        const existingSchedule = {
          id: 'existing-1',
          courtId,
          dayOfWeek: 1,
          startTime: testCase.existing.startTime,
          endTime: testCase.existing.endTime,
          price: 80,
        };

        mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
        mockPrismaService.peakSchedule.findMany.mockResolvedValue([existingSchedule]);

        if (testCase.shouldOverlap) {
          await expect(service.createCourtPeakSchedule(courtId, createDto))
            .rejects.toThrow('Peak schedule overlaps with existing schedule on Monday');
        } else {
          const createdSchedule = {
            id: 'peak-new',
            courtId,
            ...createDto,
          };
          mockPrismaService.peakSchedule.create.mockResolvedValue(createdSchedule);

          const result = await service.createCourtPeakSchedule(courtId, createDto);
          expect(result).toEqual(createdSchedule);
        }
      }
    });

    it('should handle database errors gracefully', async () => {
      const courtId = 'court-1';
      const createDto = {
        date: '2024-01-01',
        startTime: '09:00',
        endTime: '10:00',
        reason: 'Maintenance',
      };
      const mockCourt = { id: courtId, name: 'Court 1' };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.courtUnavailability.findMany.mockResolvedValue([]);
      mockPrismaService.courtUnavailability.create.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.createCourtUnavailability(courtId, createDto))
        .rejects.toThrow('Database connection failed');
    });

    it('should handle malformed time strings', async () => {
      const courtId = 'court-1';
      const createDto = {
        date: '2024-01-01',
        startTime: 'invalid-time',
        endTime: '10:00',
        reason: 'Maintenance',
      };
      const mockCourt = { id: courtId, name: 'Court 1' };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);

      await expect(service.createCourtUnavailability(courtId, createDto))
        .rejects.toThrow('Invalid time format: invalid-time. Expected format: HH:MM');
    });

    it('should handle negative time values', async () => {
      const courtId = 'court-1';
      const createDto = {
        date: '2024-01-01',
        startTime: '-1:00',
        endTime: '10:00',
        reason: 'Maintenance',
      };
      const mockCourt = { id: courtId, name: 'Court 1' };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);

      await expect(service.createCourtUnavailability(courtId, createDto))
        .rejects.toThrow('Invalid time format: -1:00. Expected format: HH:MM');
    });

    it('should handle time strings without colon separator', async () => {
      const courtId = 'court-1';
      const createDto = {
        date: '2024-01-01',
        startTime: '0900',
        endTime: '10:00',
        reason: 'Maintenance',
      };
      const mockCourt = { id: courtId, name: 'Court 1' };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);

      await expect(service.createCourtUnavailability(courtId, createDto))
        .rejects.toThrow('Invalid time format: 0900. Expected format: HH:MM');
    });

    it('should handle exact time boundary overlaps', async () => {
      const courtId = 'court-1';
      const createDto = {
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '11:00',
        price: 100,
      };
      const mockCourt = { id: courtId, name: 'Court 1' };
      const existingSchedule = {
        id: 'existing-1',
        courtId,
        dayOfWeek: 1,
        startTime: '11:00', // Starts exactly when new one ends
        endTime: '12:00',
        price: 80,
      };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.peakSchedule.findMany.mockResolvedValue([existingSchedule]);

      // This should NOT overlap since they are adjacent
      const createdSchedule = {
        id: 'peak-new',
        courtId,
        ...createDto,
      };
      mockPrismaService.peakSchedule.create.mockResolvedValue(createdSchedule);

      const result = await service.createCourtPeakSchedule(courtId, createDto);
      expect(result).toEqual(createdSchedule);
    });

    it('should handle midnight time boundaries', async () => {
      const courtId = 'court-1';
      const createDto = {
        dayOfWeek: 1,
        startTime: '00:00',
        endTime: '01:00',
        price: 100,
      };
      const mockCourt = { id: courtId, name: 'Court 1' };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.peakSchedule.findMany.mockResolvedValue([]);

      const createdSchedule = {
        id: 'peak-midnight',
        courtId,
        ...createDto,
      };
      mockPrismaService.peakSchedule.create.mockResolvedValue(createdSchedule);

      const result = await service.createCourtPeakSchedule(courtId, createDto);
      expect(result).toEqual(createdSchedule);
    });

    it('should handle late night time boundaries', async () => {
      const courtId = 'court-1';
      const createDto = {
        dayOfWeek: 1,
        startTime: '23:00',
        endTime: '23:59',
        price: 100,
      };
      const mockCourt = { id: courtId, name: 'Court 1' };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.peakSchedule.findMany.mockResolvedValue([]);

      const createdSchedule = {
        id: 'peak-late',
        courtId,
        ...createDto,
      };
      mockPrismaService.peakSchedule.create.mockResolvedValue(createdSchedule);

      const result = await service.createCourtPeakSchedule(courtId, createDto);
      expect(result).toEqual(createdSchedule);
    });
  });

  describe('advanced booking limit edge cases', () => {
    it('should handle minimum booking limit', async () => {
      const courtId = 'court-1';
      const updateDto = { advancedBookingLimit: 1 };
      const mockCourt = { id: courtId, name: 'Court 1' };
      const updatedCourt = { ...mockCourt, advancedBookingLimit: 1 };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.court.update.mockResolvedValue(updatedCourt);

      const result = await service.updateAdvancedBookingLimit(courtId, updateDto);

      expect(result.advancedBookingLimit).toBe(1);
    });

    it('should handle maximum booking limit', async () => {
      const courtId = 'court-1';
      const updateDto = { advancedBookingLimit: 365 };
      const mockCourt = { id: courtId, name: 'Court 1' };
      const updatedCourt = { ...mockCourt, advancedBookingLimit: 365 };

      mockPrismaService.court.findUnique.mockResolvedValue(mockCourt);
      mockPrismaService.court.update.mockResolvedValue(updatedCourt);

      const result = await service.updateAdvancedBookingLimit(courtId, updateDto);

      expect(result.advancedBookingLimit).toBe(365);
    });
  });

});
