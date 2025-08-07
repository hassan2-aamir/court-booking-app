import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CourtsService } from './courts.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';

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
  getSetting(@Param('id') id: string) {
    return this.courtsService.getSetting(id);
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
