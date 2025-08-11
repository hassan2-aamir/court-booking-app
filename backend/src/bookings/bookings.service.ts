import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from '../database/prisma.service';
import { Booking, BookingStatus, PaymentStatus, CourtUnavailability, PeakSchedule } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) { }

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    try {
      // Check if the court exists and is active
      const court = await this.prisma.court.findUnique({
        where: { id: createBookingDto.courtId },
        include: {
          unavailability: true,
          peakSchedules: true,
        },
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

      const bookingDate = new Date(createBookingDto.date);

      // Validate advanced booking limit
      await this.validateAdvancedBookingLimit(court.advancedBookingLimit, bookingDate);

      // Check court unavailabilities
      await this.validateCourtAvailability(court.unavailability, bookingDate, createBookingDto.startTime, createBookingDto.endTime);

      // Check for conflicting bookings
      const conflictingBooking = await this.prisma.booking.findFirst({
        where: {
          courtId: createBookingDto.courtId,
          date: bookingDate,
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

      // Calculate total price with peak pricing
      const totalPrice = await this.calculateTotalPrice(
        court,
        bookingDate,
        createBookingDto.startTime,
        createBookingDto.endTime,
        createBookingDto.duration
      );

      return await this.prisma.booking.create({
        data: {
          ...createBookingDto,
          date: bookingDate,
          totalPrice,
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

    // If updating time slot, date, or court, validate settings
    if (updateBookingDto.startTime || updateBookingDto.endTime || updateBookingDto.date || updateBookingDto.courtId) {
      const courtId = updateBookingDto.courtId || existingBooking.courtId;

      // Get court with settings
      const court = await this.prisma.court.findUnique({
        where: { id: courtId },
        include: {
          unavailability: true,
          peakSchedules: true,
        },
      });

      if (!court || !court.isActive) {
        throw new BadRequestException('Court not found or inactive');
      }

      // Convert date string to Date object if it's a string
      const bookingDate = updateBookingDto.date
        ? (typeof updateBookingDto.date === 'string' ? new Date(updateBookingDto.date) : updateBookingDto.date)
        : existingBooking.date;

      const startTime = updateBookingDto.startTime || existingBooking.startTime;
      const endTime = updateBookingDto.endTime || existingBooking.endTime;

      // Validate advanced booking limit
      await this.validateAdvancedBookingLimit(court.advancedBookingLimit, bookingDate);

      // Check court unavailabilities
      await this.validateCourtAvailability(court.unavailability, bookingDate, startTime, endTime);

      // Check for conflicting bookings
      const conflictingBooking = await this.prisma.booking.findFirst({
        where: {
          id: { not: id },
          courtId: courtId,
          date: bookingDate,
          status: {
            not: BookingStatus.CANCELLED,
          },
          OR: [
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: startTime } },
                { endTime: { lte: endTime } },
              ],
            },
          ],
        },
      });

      if (conflictingBooking) {
        throw new BadRequestException('Time slot is already booked');
      }

      // Recalculate total price if time, date, or court changed
      if (updateBookingDto.startTime || updateBookingDto.endTime || updateBookingDto.date || updateBookingDto.courtId) {
        const duration = updateBookingDto.duration || existingBooking.duration;
        const totalPrice = await this.calculateTotalPrice(
          court,
          bookingDate,
          startTime,
          endTime,
          duration
        );
        updateBookingDto.totalPrice = totalPrice;
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

  // Settings integration methods

  /**
   * Validates that the booking date is within the advanced booking limit
   */
  private async validateAdvancedBookingLimit(advancedBookingLimit: number, bookingDate: Date): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxBookingDate = new Date(today);
    maxBookingDate.setDate(maxBookingDate.getDate() + advancedBookingLimit);

    const bookingDateOnly = new Date(bookingDate);
    bookingDateOnly.setHours(0, 0, 0, 0);

    if (bookingDateOnly > maxBookingDate) {
      throw new BadRequestException(
        `Booking date cannot be more than ${advancedBookingLimit} days in advance`
      );
    }

    if (bookingDateOnly < today) {
      throw new BadRequestException('Cannot book for past dates');
    }
  }

  /**
   * Validates that the booking time doesn't conflict with court unavailabilities
   */
  private async validateCourtAvailability(
    unavailabilities: CourtUnavailability[],
    bookingDate: Date,
    startTime: string,
    endTime: string
  ): Promise<void> {
    const bookingDateOnly = new Date(bookingDate);
    bookingDateOnly.setHours(0, 0, 0, 0);

    for (const unavailability of unavailabilities) {
      const unavailabilityDate = new Date(unavailability.date);
      unavailabilityDate.setHours(0, 0, 0, 0);

      // Check if dates match
      if (unavailabilityDate.getTime() === bookingDateOnly.getTime()) {
        // If no specific times are set, the entire day is unavailable
        if (!unavailability.startTime || !unavailability.endTime) {
          throw new BadRequestException(
            `Court is unavailable on ${bookingDate.toDateString()}: ${unavailability.reason}`
          );
        }

        // Check for time overlap
        if (this.hasTimeOverlap(startTime, endTime, unavailability.startTime, unavailability.endTime)) {
          throw new BadRequestException(
            `Court is unavailable during the requested time: ${unavailability.reason}`
          );
        }
      }

      // Handle recurring unavailabilities
      if (unavailability.isRecurring) {
        const unavailabilityDayOfWeek = unavailabilityDate.getDay();
        const bookingDayOfWeek = bookingDateOnly.getDay();

        if (unavailabilityDayOfWeek === bookingDayOfWeek) {
          // If no specific times are set, the entire day is unavailable
          if (!unavailability.startTime || !unavailability.endTime) {
            throw new BadRequestException(
              `Court is unavailable on ${this.getDayName(bookingDayOfWeek)}s: ${unavailability.reason}`
            );
          }

          // Check for time overlap
          if (this.hasTimeOverlap(startTime, endTime, unavailability.startTime, unavailability.endTime)) {
            throw new BadRequestException(
              `Court is unavailable during the requested time on ${this.getDayName(bookingDayOfWeek)}s: ${unavailability.reason}`
            );
          }
        }
      }
    }
  }

  /**
   * Calculates the total price including peak pricing
   */
  private async calculateTotalPrice(
    court: any,
    bookingDate: Date,
    startTime: string,
    endTime: string,
    duration: number
  ): Promise<number> {
    const dayOfWeek = bookingDate.getDay();
    const peakSchedules = court.peakSchedules || [];

    // Find applicable peak schedules for the booking time
    const applicablePeakSchedules = peakSchedules.filter((schedule: PeakSchedule) => {
      return schedule.dayOfWeek === dayOfWeek &&
        this.hasTimeOverlap(startTime, endTime, schedule.startTime, schedule.endTime);
    });

    if (applicablePeakSchedules.length === 0) {
      // No peak pricing applies, use regular court price
      return court.pricePerHour * (duration / 60);
    }

    // Calculate price with peak pricing
    // For simplicity, if any part of the booking falls within peak hours, apply peak pricing
    // In a more complex scenario, you might want to calculate proportional pricing
    let totalPrice = 0;
    const durationHours = duration / 60;

    // Find the highest peak price that applies (in case of overlapping peak schedules)
    const maxPeakPrice = Math.max(...applicablePeakSchedules.map((schedule: PeakSchedule) => schedule.price));

    // Use peak price if it's higher than regular price, otherwise use regular price
    const effectivePrice = Math.max(maxPeakPrice, court.pricePerHour);
    totalPrice = effectivePrice * durationHours;

    return totalPrice;
  }

  /**
   * Checks if two time ranges overlap
   */
  private hasTimeOverlap(
    startTime1: string,
    endTime1: string,
    startTime2: string,
    endTime2: string
  ): boolean {
    const start1 = this.parseTime(startTime1);
    const end1 = this.parseTime(endTime1);
    const start2 = this.parseTime(startTime2);
    const end2 = this.parseTime(endTime2);

    // Check if time ranges overlap
    return start1 < end2 && start2 < end1;
  }

  /**
   * Parses time string (HH:MM) to minutes since midnight
   */
  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Gets the day name from day of week number
   */
  private getDayName(dayOfWeek: number): string {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[dayOfWeek];
  }
}
