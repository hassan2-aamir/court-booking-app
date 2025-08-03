import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from '../database/prisma.service';
import { Booking, BookingStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    try {
      // Check if the court exists and is active
      const court = await this.prisma.court.findUnique({
        where: { id: createBookingDto.courtId },
      });

      if (!court || !court.isActive) {
        throw new BadRequestException('Court not found or inactive');
      }

      // Check if the user exists
      const user = await this.prisma.user.findUnique({
        where: { id: createBookingDto.userId },
      });

      if (!user || !user.isActive) {
        throw new BadRequestException('User not found or inactive');
      }

      // Check for conflicting bookings
      const conflictingBooking = await this.prisma.booking.findFirst({
        where: {
          courtId: createBookingDto.courtId,
          date: new Date(createBookingDto.date), // Convert string to Date for comparison
          status: {
            not: BookingStatus.CANCELLED,
          },
          OR: [
            {
              AND: [
                { startTime: { lte: createBookingDto.startTime } },
                { endTime: { gt: createBookingDto.startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: createBookingDto.endTime } },
                { endTime: { gte: createBookingDto.endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: createBookingDto.startTime } },
                { endTime: { lte: createBookingDto.endTime } },
              ],
            },
          ],
        },
      });

      if (conflictingBooking) {
        throw new BadRequestException('Time slot is already booked');
      }

      return await this.prisma.booking.create({
        data: {
          ...createBookingDto,
          date: new Date(createBookingDto.date), // Convert string to Date object
          status: createBookingDto.status || BookingStatus.PENDING,
          paymentStatus: createBookingDto.paymentStatus || PaymentStatus.PENDING,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              email: true,
            },
          },
          court: {
            select: {
              id: true,
              name: true,
              type: true,
              pricePerHour: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create booking');
    }
  }

  async findAll(): Promise<Booking[]> {
    return await this.prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            email: true,
          },
        },
        court: {
          select: {
            id: true,
            name: true,
            type: true,
            pricePerHour: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            email: true,
            cnic: true,
            address: true,
          },
        },
        court: {
          select: {
            id: true,
            name: true,
            type: true,
            description: true,
            pricePerHour: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async findByBookingId(bookingId: string): Promise<Booking> {
    const booking = await this.prisma.booking.findUnique({
      where: { bookingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            email: true,
            cnic: true,
            address: true,
          },
        },
        court: {
          select: {
            id: true,
            name: true,
            type: true,
            description: true,
            pricePerHour: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with booking ID ${bookingId} not found`);
    }

    return booking;
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    return await this.prisma.booking.findMany({
      where: { userId },
      include: {
        court: {
          select: {
            id: true,
            name: true,
            type: true,
            pricePerHour: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findByCourtId(courtId: string): Promise<Booking[]> {
    return await this.prisma.booking.findMany({
      where: { courtId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const existingBooking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // If updating time slot, check for conflicts
    if (updateBookingDto.startTime || updateBookingDto.endTime || updateBookingDto.date) {
      // Convert date string to Date object if it's a string
      const dateForComparison = updateBookingDto.date 
        ? (typeof updateBookingDto.date === 'string' ? new Date(updateBookingDto.date) : updateBookingDto.date)
        : existingBooking.date;

      const conflictingBooking = await this.prisma.booking.findFirst({
        where: {
          id: { not: id },
          courtId: updateBookingDto.courtId || existingBooking.courtId,
          date: dateForComparison,
          status: {
            not: BookingStatus.CANCELLED,
          },
          OR: [
            {
              AND: [
                { startTime: { lte: updateBookingDto.startTime || existingBooking.startTime } },
                { endTime: { gt: updateBookingDto.startTime || existingBooking.startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: updateBookingDto.endTime || existingBooking.endTime } },
                { endTime: { gte: updateBookingDto.endTime || existingBooking.endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: updateBookingDto.startTime || existingBooking.startTime } },
                { endTime: { lte: updateBookingDto.endTime || existingBooking.endTime } },
              ],
            },
          ],
        },
      });

      if (conflictingBooking) {
        throw new BadRequestException('Time slot is already booked');
      }
    }

    try {
      // Convert date string to Date object if needed before saving
      const dataToUpdate = {
        ...updateBookingDto,
        ...(updateBookingDto.date && typeof updateBookingDto.date === 'string' 
          ? { date: new Date(updateBookingDto.date) } 
          : {}
        )
      };

      return await this.prisma.booking.update({
        where: { id },
        data: dataToUpdate,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              email: true,
            },
          },
          court: {
            select: {
              id: true,
              name: true,
              type: true,
              pricePerHour: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to update booking');
    }
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const existingBooking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return await this.prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            email: true,
          },
        },
        court: {
          select: {
            id: true,
            name: true,
            type: true,
            pricePerHour: true,
          },
        },
      },
    });
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Booking> {
    const existingBooking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return await this.prisma.booking.update({
      where: { id },
      data: { paymentStatus },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            email: true,
          },
        },
        court: {
          select: {
            id: true,
            name: true,
            type: true,
            pricePerHour: true,
          },
        },
      },
    });
  }

  async remove(id: string): Promise<Booking> {
    const existingBooking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    try {
      return await this.prisma.booking.delete({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              email: true,
            },
          },
          court: {
            select: {
              id: true,
              name: true,
              type: true,
              pricePerHour: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to delete booking');
    }
  }

  async cancel(id: string): Promise<Booking> {
    return await this.updateStatus(id, BookingStatus.CANCELLED);
  }

  async confirm(id: string): Promise<Booking> {
    return await this.updateStatus(id, BookingStatus.CONFIRMED);
  }

  async complete(id: string): Promise<Booking> {
    return await this.updateStatus(id, BookingStatus.COMPLETED);
  }

  async markNoShow(id: string): Promise<Booking> {
    return await this.updateStatus(id, BookingStatus.NO_SHOW);
  }

  // Additional utility methods
  async getBookingsByDateRange(startDate: Date, endDate: Date): Promise<Booking[]> {
    return await this.prisma.booking.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            email: true,
          },
        },
        court: {
          select: {
            id: true,
            name: true,
            type: true,
            pricePerHour: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async getTodaysBookings(): Promise<Booking[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.getBookingsByDateRange(today, tomorrow);
  }
}
