import { Injectable } from '@nestjs/common';
import { CourtAvailabilityDto, CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
import { PrismaService } from '../database/prisma.service';
import { Court, CourtAvailability } from '@prisma/client';
import { CourtResponseDto } from './dto/court-response.dto';

@Injectable()
export class CourtsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCourtDto: CreateCourtDto) {
    // Assuming you have injected PrismaService and your model is named 'court'
    // Example: constructor(private prisma: PrismaService) {}
    const { availability, ...courtData } = createCourtDto as any;
    return this.prisma.court.create({
      data: {
        ...courtData,
        availability: availability
          ? {
              create: availability,
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
    const { availability, ...courtData } = updateCourtDto as any;
    return this.prisma.court.update({
      where: { id },
      data: {
        ...courtData,
        availability: availability
          ? {
              upsert: availability.map((a: any) => ({
                where: { id: a.id },
                create: a,
                update: a,
              })),
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
}
