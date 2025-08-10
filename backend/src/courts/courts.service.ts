import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CourtAvailabilityDto, CreateCourtDto, CourtUnavailabilityDto, PeakScheduleDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
import { SettingDto } from './dto/setting.dto';
import { CreateCourtUnavailabilityDto } from './dto/create-court-unavailability.dto';
import { UpdateCourtUnavailabilityDto } from './dto/update-court-unavailability.dto';
import { CreateCourtPeakScheduleDto } from './dto/create-court-peak-schedule.dto';
import { UpdateCourtPeakScheduleDto } from './dto/update-court-peak-schedule.dto';
import { UpdateAdvancedBookingLimitDto } from './dto/update-advanced-booking-limit.dto';
import { PrismaService } from '../database/prisma.service';
import { Court, CourtAvailability, BookingStatus, CourtUnavailability, PeakSchedule } from '@prisma/client';
import { CourtResponseDto } from './dto/court-response.dto';

@Injectable()
export class CourtsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCourtDto: CreateCourtDto) {
    // Assuming you have injected PrismaService and your model is named 'court'
    // Example: constructor(private prisma: PrismaService) {}
    const { availability, unavailability, peakSchedules, ...courtData } = createCourtDto as any;
    return this.prisma.court.create({
      data: {
        ...courtData,
        advancedBookingLimit: createCourtDto.advancedBookingLimit ?? 30,
        availability: availability
          ? {
              create: availability,
            }
          : undefined,
        unavailability: unavailability
          ? {
              create: unavailability,
            }
          : undefined,
        peakSchedules: peakSchedules
          ? {
              create: peakSchedules,
            }
          : undefined,
      },
    });
  }

  findAll(): Promise<CourtResponseDto[]> {
    return this.prisma.court.findMany({
      include: {
        availability: true,
      },
    }).then(courts =>
      courts.map(court =>
        new (CourtResponseDto)({
          id: court.id,
          name: court.name,
          isActive: court.isActive,
          availability: court.availability && court.availability.length > 0
            ? court.availability.map((a: any) => ({
                startTime: a.startTime,
                endTime: a.endTime,
                dayOfWeek: a.dayOfWeek,
              }))
            : [],
          pricePerHour: court.pricePerHour,
          type: court.type,
        }),
      ),
    );
  }

  findOne(id: string):Promise<CourtResponseDto | null> {
    return this.prisma.court.findUnique({
      where: { id },
      include: { availability: true },
    }).then(court => {
      if (!court) return null;
      return new (CourtResponseDto)({
      id: court.id,
      name: court.name,
      isActive: court.isActive,
      availability: court.availability && court.availability.length > 0
        ? court.availability.map((a: any) => ({
          startTime: a.startTime,
          endTime: a.endTime,
          dayOfWeek: a.dayOfWeek,
        }))
        : [],
      pricePerHour: court.pricePerHour,
      type: court.type,
      });
    });
  }

  update(id: string, updateCourtDto: UpdateCourtDto) {
    const { availability, unavailability, peakSchedules, ...courtData } = updateCourtDto as any;
    
    return this.prisma.court.update({
      where: { id },
      data: {
        ...courtData,
        availability: availability
          ? {
              // Delete existing availability and create new ones
              deleteMany: {},
              create: availability,
            }
          : undefined,
        unavailability: unavailability
          ? {
              // Delete existing unavailability and create new ones
              deleteMany: {},
              create: unavailability,
            }
          : undefined,
        peakSchedules: peakSchedules
          ? {
              // Delete existing peak schedules and create new ones
              deleteMany: {},
              create: peakSchedules,
            }
          : undefined,
      },
    });
  }

  remove(id: string) {
    return this.prisma.court.delete({
      where: { id },
    });

  }

  getAvailabilityToday(id: string): Promise<CourtAvailabilityDto[]> {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sunday) - 6 (Saturday)

    return this.prisma.courtAvailability.findMany({
      where: {
        courtId: id,
        dayOfWeek: dayOfWeek,
      },
      select: {
        startTime: true,
        endTime: true,
        dayOfWeek: true,
      },
    })
  }

  async getAvailableSlots(courtId: string, date: string): Promise<{ startTime: string; endTime: string; isAvailable: boolean }[]> {
    // Parse the date
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Get court with availability
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
      include: {
        availability: {
          where: { dayOfWeek }
        }
      }
    });

    if (!court || court.availability.length === 0) {
      return [];
    }

    // Get all bookings for this court on the selected date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await this.prisma.booking.findMany({
      where: {
        courtId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          notIn: [BookingStatus.CANCELLED]
        }
      },
      select: {
        startTime: true,
        endTime: true
      }
    });

    // Generate all possible time slots
    const slots: { startTime: string; endTime: string; isAvailable: boolean }[] = [];
    const dayAvailability = court.availability[0];
    
    if (!dayAvailability || !dayAvailability.startTime || !dayAvailability.endTime) {
      return slots;
    }

    const slotDuration = dayAvailability.slotDuration || 60; // minutes
    const [startHour, startMinute] = dayAvailability.startTime.split(':').map(Number);
    const [endHour, endMinute] = dayAvailability.endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const nextHour = currentHour + Math.floor((currentMinute + slotDuration) / 60);
      const nextMinute = (currentMinute + slotDuration) % 60;
      
      if (nextHour < endHour || (nextHour === endHour && nextMinute <= endMinute)) {
        const slotStart = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        const slotEnd = `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`;
        
        // Check if this slot conflicts with any booking
        const isBooked = bookings.some(booking => {
          return (
            (slotStart >= booking.startTime && slotStart < booking.endTime) ||
            (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
            (slotStart <= booking.startTime && slotEnd >= booking.endTime)
          );
        });
        
        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          isAvailable: !isBooked
        });
      }
      
      currentHour = nextHour;
      currentMinute = nextMinute;
    }
    
    return slots;
  }

  async getSetting(courtId: string): Promise<SettingDto | null> {
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
      include: {
        unavailability: true,
        peakSchedules: true,
      },
    }) as any;

    if (!court) {
      return null;
    }

    return {
      courtId: court.id,
      advancedBookingLimit: court.advancedBookingLimit,
      unavailability: court.unavailability?.map((unavail: any) => ({
        startTime: unavail.startTime,
        endTime: unavail.endTime,
        date: unavail.date instanceof Date ? unavail.date.toISOString() : unavail.date,
        reason: unavail.reason,
        isRecurring: unavail.isRecurring,
      })) || [],
      peakSchedules: court.peakSchedules?.map((peak: any) => ({
        startTime: peak.startTime,
        endTime: peak.endTime,
        dayOfWeek: peak.dayOfWeek,
        price: peak.price,
      })) || [],
    };
  }

  // Settings management methods

  async getCourtSettings(courtId: string): Promise<SettingDto> {
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
      include: {
        unavailability: true,
        peakSchedules: true,
      },
    });

    if (!court) {
      throw new NotFoundException(`Court with ID ${courtId} not found`);
    }

    return {
      courtId: court.id,
      advancedBookingLimit: court.advancedBookingLimit,
      unavailability: court.unavailability?.map((unavail) => ({
        id: unavail.id, // Include the ID for frontend CRUD operations
        courtId: unavail.courtId,
        startTime: unavail.startTime || undefined,
        endTime: unavail.endTime || undefined,
        date: unavail.date instanceof Date ? unavail.date.toISOString() : unavail.date,
        reason: unavail.reason,
        isRecurring: unavail.isRecurring,
      })) || [],
      peakSchedules: court.peakSchedules?.map((peak) => ({
        id: peak.id, // Include the ID for frontend CRUD operations
        courtId: peak.courtId,
        startTime: peak.startTime,
        endTime: peak.endTime,
        dayOfWeek: peak.dayOfWeek,
        price: peak.price,
      })) || [],
    };
  }

  // Advanced booking limit management

  async updateAdvancedBookingLimit(courtId: string, updateDto: UpdateAdvancedBookingLimitDto): Promise<Court> {
    // Verify court exists
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
    });

    if (!court) {
      throw new NotFoundException(`Court with ID ${courtId} not found`);
    }

    return this.prisma.court.update({
      where: { id: courtId },
      data: {
        advancedBookingLimit: updateDto.advancedBookingLimit,
      },
    });
  }

  // Court unavailabilities CRUD operations

  async getCourtUnavailabilities(courtId: string): Promise<CourtUnavailability[]> {
    // Verify court exists
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
    });

    if (!court) {
      throw new NotFoundException(`Court with ID ${courtId} not found`);
    }

    return this.prisma.courtUnavailability.findMany({
      where: { courtId },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async createCourtUnavailability(courtId: string, createDto: CreateCourtUnavailabilityDto): Promise<CourtUnavailability> {
    // Verify court exists
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
    });

    if (!court) {
      throw new NotFoundException(`Court with ID ${courtId} not found`);
    }

    // Validate time range if both start and end times are provided
    if (createDto.startTime && createDto.endTime) {
      this.validateTimeRange(createDto.startTime, createDto.endTime);
    }

    // Check for conflicts with existing unavailabilities
    await this.validateUnavailabilityConflicts(courtId, createDto);

    return this.prisma.courtUnavailability.create({
      data: {
        courtId,
        date: new Date(createDto.date),
        startTime: createDto.startTime,
        endTime: createDto.endTime,
        reason: createDto.reason,
        isRecurring: createDto.isRecurring || false,
      },
    });
  }

  async updateCourtUnavailability(
    courtId: string,
    unavailabilityId: string,
    updateDto: UpdateCourtUnavailabilityDto,
  ): Promise<CourtUnavailability> {
    // Verify court exists
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
    });

    if (!court) {
      throw new NotFoundException(`Court with ID ${courtId} not found`);
    }

    // Verify unavailability exists and belongs to the court
    const unavailability = await this.prisma.courtUnavailability.findFirst({
      where: {
        id: unavailabilityId,
        courtId,
      },
    });

    if (!unavailability) {
      throw new NotFoundException(`Unavailability with ID ${unavailabilityId} not found for court ${courtId}`);
    }

    // Validate time range if both start and end times are provided
    if (updateDto.startTime && updateDto.endTime) {
      this.validateTimeRange(updateDto.startTime, updateDto.endTime);
    }

    // Check for conflicts with existing unavailabilities (excluding current one)
    if (updateDto.date || updateDto.startTime || updateDto.endTime) {
      await this.validateUnavailabilityConflicts(courtId, updateDto, unavailabilityId);
    }

    const updateData: any = {};
    if (updateDto.date) updateData.date = new Date(updateDto.date);
    if (updateDto.startTime !== undefined) updateData.startTime = updateDto.startTime;
    if (updateDto.endTime !== undefined) updateData.endTime = updateDto.endTime;
    if (updateDto.reason !== undefined) updateData.reason = updateDto.reason;
    if (updateDto.isRecurring !== undefined) updateData.isRecurring = updateDto.isRecurring;

    return this.prisma.courtUnavailability.update({
      where: { id: unavailabilityId },
      data: updateData,
    });
  }

  async deleteCourtUnavailability(courtId: string, unavailabilityId: string): Promise<void> {
    // Verify court exists
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
    });

    if (!court) {
      throw new NotFoundException(`Court with ID ${courtId} not found`);
    }

    // Verify unavailability exists and belongs to the court
    const unavailability = await this.prisma.courtUnavailability.findFirst({
      where: {
        id: unavailabilityId,
        courtId,
      },
    });

    if (!unavailability) {
      throw new NotFoundException(`Unavailability with ID ${unavailabilityId} not found for court ${courtId}`);
    }

    await this.prisma.courtUnavailability.delete({
      where: { id: unavailabilityId },
    });
  }

  // Peak schedules CRUD operations

  async getCourtPeakSchedules(courtId: string): Promise<PeakSchedule[]> {
    // Verify court exists
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
    });

    if (!court) {
      throw new NotFoundException(`Court with ID ${courtId} not found`);
    }

    return this.prisma.peakSchedule.findMany({
      where: { courtId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async createCourtPeakSchedule(courtId: string, createDto: CreateCourtPeakScheduleDto): Promise<PeakSchedule> {
    // Verify court exists
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
    });

    if (!court) {
      throw new NotFoundException(`Court with ID ${courtId} not found`);
    }

    // Validate time range
    this.validateTimeRange(createDto.startTime, createDto.endTime);

    // Check for overlapping schedules
    await this.validatePeakScheduleOverlap(courtId, createDto);

    return this.prisma.peakSchedule.create({
      data: {
        courtId,
        dayOfWeek: createDto.dayOfWeek,
        startTime: createDto.startTime,
        endTime: createDto.endTime,
        price: createDto.price,
      },
    });
  }

  async updateCourtPeakSchedule(
    courtId: string,
    scheduleId: string,
    updateDto: UpdateCourtPeakScheduleDto,
  ): Promise<PeakSchedule> {
    // Verify court exists
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
    });

    if (!court) {
      throw new NotFoundException(`Court with ID ${courtId} not found`);
    }

    // Verify peak schedule exists and belongs to the court
    const schedule = await this.prisma.peakSchedule.findFirst({
      where: {
        id: scheduleId,
        courtId,
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Peak schedule with ID ${scheduleId} not found for court ${courtId}`);
    }

    // Validate time range if both start and end times are provided
    if (updateDto.startTime && updateDto.endTime) {
      this.validateTimeRange(updateDto.startTime, updateDto.endTime);
    }

    // Check for overlapping schedules (excluding current one)
    if (updateDto.dayOfWeek !== undefined || updateDto.startTime || updateDto.endTime) {
      await this.validatePeakScheduleOverlap(courtId, updateDto, scheduleId);
    }

    return this.prisma.peakSchedule.update({
      where: { id: scheduleId },
      data: updateDto,
    });
  }

  async deleteCourtPeakSchedule(courtId: string, scheduleId: string): Promise<void> {
    // Verify court exists
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
    });

    if (!court) {
      throw new NotFoundException(`Court with ID ${courtId} not found`);
    }

    // Verify peak schedule exists and belongs to the court
    const schedule = await this.prisma.peakSchedule.findFirst({
      where: {
        id: scheduleId,
        courtId,
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Peak schedule with ID ${scheduleId} not found for court ${courtId}`);
    }

    await this.prisma.peakSchedule.delete({
      where: { id: scheduleId },
    });
  }

  // Validation helper methods

  private validateTimeRange(startTime: string, endTime: string): void {
    const start = this.parseTime(startTime);
    const end = this.parseTime(endTime);

    if (start >= end) {
      throw new BadRequestException('Start time must be before end time');
    }
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new BadRequestException(`Invalid time format: ${timeString}. Expected format: HH:MM`);
    }
    return hours * 60 + minutes;
  }

  private async validateUnavailabilityConflicts(
    courtId: string,
    unavailabilityData: CreateCourtUnavailabilityDto | UpdateCourtUnavailabilityDto,
    excludeId?: string,
  ): Promise<void> {
    const date = unavailabilityData.date ? new Date(unavailabilityData.date) : null;
    if (!date) return;

    const whereClause: any = {
      courtId,
      date,
    };

    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const existingUnavailabilities = await this.prisma.courtUnavailability.findMany({
      where: whereClause,
    });

    for (const existing of existingUnavailabilities) {
      if (this.hasTimeOverlap(
        unavailabilityData.startTime,
        unavailabilityData.endTime,
        existing.startTime,
        existing.endTime,
      )) {
        throw new BadRequestException(
          `Unavailability conflicts with existing unavailability on ${date.toDateString()}`,
        );
      }
    }
  }

  private async validatePeakScheduleOverlap(
    courtId: string,
    scheduleData: CreateCourtPeakScheduleDto | UpdateCourtPeakScheduleDto,
    excludeId?: string,
  ): Promise<void> {
    const dayOfWeek = scheduleData.dayOfWeek;
    if (dayOfWeek === undefined) return;

    const whereClause: any = {
      courtId,
      dayOfWeek,
    };

    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const existingSchedules = await this.prisma.peakSchedule.findMany({
      where: whereClause,
    });

    for (const existing of existingSchedules) {
      if (this.hasTimeOverlap(
        scheduleData.startTime,
        scheduleData.endTime,
        existing.startTime,
        existing.endTime,
      )) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        throw new BadRequestException(
          `Peak schedule overlaps with existing schedule on ${dayNames[dayOfWeek]}`,
        );
      }
    }
  }

  private hasTimeOverlap(
    startTime1?: string | null,
    endTime1?: string | null,
    startTime2?: string | null,
    endTime2?: string | null,
  ): boolean {
    // If any time is missing, consider it as full day overlap
    if (!startTime1 || !endTime1 || !startTime2 || !endTime2) {
      return true;
    }

    const start1 = this.parseTime(startTime1);
    const end1 = this.parseTime(endTime1);
    const start2 = this.parseTime(startTime2);
    const end2 = this.parseTime(endTime2);

    // Check if time ranges overlap
    return start1 < end2 && start2 < end1;
  }

}
