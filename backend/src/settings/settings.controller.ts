import { Controller, Get, Post, Put, Body, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { BusinessSettingsDto, UpdateBusinessSettingsDto } from './dto/business-settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('business')
  async getBusinessSettings(): Promise<BusinessSettingsDto> {
    const settings = await this.settingsService.getBusinessSettings();
    if (!settings) {
      throw new NotFoundException('Business settings not found');
    }
    return settings;
  }

  @Post('business')
  @HttpCode(HttpStatus.CREATED)
  async createBusinessSettings(
    @Body() createData: BusinessSettingsDto,
  ): Promise<BusinessSettingsDto> {
    return this.settingsService.createBusinessSettings(createData);
  }

  @Put('business')
  @HttpCode(HttpStatus.OK)
  async updateBusinessSettings(
    @Body() updateData: UpdateBusinessSettingsDto,
  ): Promise<BusinessSettingsDto> {
    return this.settingsService.updateBusinessSettings(updateData);
  }
}