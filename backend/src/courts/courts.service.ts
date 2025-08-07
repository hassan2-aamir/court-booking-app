import { Injectable } from '@nestjs/common';
import { CourtAvailabilityDto, CreateCourtDto, CourtUnavailabilityDto, PeakScheduleDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
import { SettingDto } from './dto/setting.dto';
import { PrismaService } from '../database/prisma.service';
import { Court, CourtAvailability, BookingStatus } from '@prisma/client';
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

}
