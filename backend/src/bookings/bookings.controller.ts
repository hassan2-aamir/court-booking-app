import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingStatus, PaymentStatus } from '@prisma/client';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'courtId', required: false, description: 'Filter by court ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for date range filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for date range filter (YYYY-MM-DD)' })
  findAll(
    @Query('userId') userId?: string,
    @Query('courtId') courtId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (userId) {
      return this.bookingsService.findByUserId(userId);
    }
    if (courtId) {
      return this.bookingsService.findByCourtId(courtId);
    }
    if (startDate && endDate) {
      return this.bookingsService.getBookingsByDateRange(new Date(startDate), new Date(endDate));
    }
    return this.bookingsService.findAll();
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today\'s bookings' })
  getTodaysBookings() {
    return this.bookingsService.getTodaysBookings();
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get booking by booking ID' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  findByBookingId(@Param('bookingId') bookingId: string) {
    return this.bookingsService.findByBookingId(bookingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update booking status' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  updateStatus(@Param('id') id: string, @Body('status') status: BookingStatus) {
    return this.bookingsService.updateStatus(id, status);
  }

  @Patch(':id/payment-status')
  @ApiOperation({ summary: 'Update payment status' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  updatePaymentStatus(@Param('id') id: string, @Body('paymentStatus') paymentStatus: PaymentStatus) {
    return this.bookingsService.updatePaymentStatus(id, paymentStatus);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  cancel(@Param('id') id: string) {
    return this.bookingsService.cancel(id);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirm booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  confirm(@Param('id') id: string) {
    return this.bookingsService.confirm(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark booking as completed' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  complete(@Param('id') id: string) {
    return this.bookingsService.complete(id);
  }

  @Patch(':id/no-show')
  @ApiOperation({ summary: 'Mark booking as no-show' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  markNoShow(@Param('id') id: string) {
    return this.bookingsService.markNoShow(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}
