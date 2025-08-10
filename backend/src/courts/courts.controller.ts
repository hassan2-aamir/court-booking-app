import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CourtsService } from './courts.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
import { UpdateAdvancedBookingLimitDto } from './dto/update-advanced-booking-limit.dto';
import { CreateCourtUnavailabilityDto } from './dto/create-court-unavailability.dto';
import { UpdateCourtUnavailabilityDto } from './dto/update-court-unavailability.dto';
import { CreateCourtPeakScheduleDto } from './dto/create-court-peak-schedule.dto';
import { UpdateCourtPeakScheduleDto } from './dto/update-court-peak-schedule.dto';

@UseGuards(JwtAuthGuard)
@Controller('courts')
@ApiBearerAuth('JWT-auth')
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Post()
  create(@Body() createCourtDto: CreateCourtDto) {
    return this.courtsService.create(createCourtDto);
  }

  @Get()
  findAll() {
    return this.courtsService.findAll();
  }

  @Post('availability-today/:id')
  getAvailabilityToday(@Param('id') id: string) {
    return this.courtsService.getAvailabilityToday(id);
  }

  @Get(':id/available-slots/:date')
  getAvailableSlots(@Param('id') id: string, @Param('date') date: string) {
    return this.courtsService.getAvailableSlots(id, date);
  }

  @Get(':id/settings')
  getCourtSettings(@Param('id') id: string) {
    return this.courtsService.getCourtSettings(id);
  }

  @Patch(':id/advanced-booking-limit')
  updateAdvancedBookingLimit(@Param('id') id: string, @Body() updateDto: UpdateAdvancedBookingLimitDto) {
    return this.courtsService.updateAdvancedBookingLimit(id, updateDto);
  }

  @Get(':id/unavailabilities')
  getCourtUnavailabilities(@Param('id') id: string) {
    return this.courtsService.getCourtUnavailabilities(id);
  }

  @Post(':id/unavailabilities')
  createCourtUnavailability(@Param('id') id: string, @Body() createDto: CreateCourtUnavailabilityDto) {
    return this.courtsService.createCourtUnavailability(id, createDto);
  }

  @Patch(':id/unavailabilities/:unavailabilityId')
  updateCourtUnavailability(
    @Param('id') id: string,
    @Param('unavailabilityId') unavailabilityId: string,
    @Body() updateDto: UpdateCourtUnavailabilityDto,
  ) {
    return this.courtsService.updateCourtUnavailability(id, unavailabilityId, updateDto);
  }

  @Delete(':id/unavailabilities/:unavailabilityId')
  deleteCourtUnavailability(@Param('id') id: string, @Param('unavailabilityId') unavailabilityId: string) {
    return this.courtsService.deleteCourtUnavailability(id, unavailabilityId);
  }

  @Get(':id/peak-schedules')
  getCourtPeakSchedules(@Param('id') id: string) {
    return this.courtsService.getCourtPeakSchedules(id);
  }

  @Post(':id/peak-schedules')
  createCourtPeakSchedule(@Param('id') id: string, @Body() createDto: CreateCourtPeakScheduleDto) {
    return this.courtsService.createCourtPeakSchedule(id, createDto);
  }

  @Patch(':id/peak-schedules/:scheduleId')
  updateCourtPeakSchedule(
    @Param('id') id: string,
    @Param('scheduleId') scheduleId: string,
    @Body() updateDto: UpdateCourtPeakScheduleDto,
  ) {
    return this.courtsService.updateCourtPeakSchedule(id, scheduleId, updateDto);
  }

  @Delete(':id/peak-schedules/:scheduleId')
  deleteCourtPeakSchedule(@Param('id') id: string, @Param('scheduleId') scheduleId: string) {
    return this.courtsService.deleteCourtPeakSchedule(id, scheduleId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courtsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourtDto: UpdateCourtDto) {
    return this.courtsService.update(id, updateCourtDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courtsService.remove(id);
  }
}
