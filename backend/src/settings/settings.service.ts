import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { BusinessSettingsDto, UpdateBusinessSettingsDto } from './dto/business-settings.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private prisma: PrismaService) {}

  async getBusinessSettings(): Promise<BusinessSettingsDto | null> {
    try {
      const settings = await this.prisma.systemSetting.findMany({
        where: {
          key: {
            in: [
              'businessName',
              'phone',
              'email',
              'businessHours',
              'maxBookingsPerUser',
              'defaultDuration',
              'advanceBookingLimit',
            ],
          },
        },
      });

      // If no settings exist, return null
      if (settings.length === 0) {
        return null;
      }

      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.type === 'json' ? JSON.parse(setting.value) : setting.value;
        return acc;
      }, {} as Record<string, any>);

      return {
        businessName: settingsMap.businessName || 'CourtBook Sports Complex',
        phone: settingsMap.phone || '+92 300 1234567',
        email: settingsMap.email || 'info@courtbook.com',
        businessHours: settingsMap.businessHours || { start: '06:00', end: '23:00' },
        maxBookingsPerUser: parseInt(settingsMap.maxBookingsPerUser) || 3,
        defaultDuration: settingsMap.defaultDuration || '1',
        advanceBookingLimit: parseInt(settingsMap.advanceBookingLimit) || 30,
      };
    } catch (error) {
      this.logger.error('Failed to get business settings', error);
      throw error;
    }
  }

  async createBusinessSettings(createData: BusinessSettingsDto): Promise<BusinessSettingsDto> {
    try {
      const updates: Promise<any>[] = [];

      for (const [key, value] of Object.entries(createData)) {
        if (value !== undefined) {
          const settingType = typeof value === 'object' ? 'json' : 'string';
          const settingValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

          updates.push(
            this.prisma.systemSetting.create({
              data: {
                key,
                value: settingValue,
                type: settingType,
              },
            })
          );
        }
      }

      await Promise.all(updates);

      const result = await this.getBusinessSettings();
      return result!; // We know it exists since we just created it
    } catch (error) {
      this.logger.error('Failed to create business settings', error);
      throw error;
    }
  }

  async updateBusinessSettings(updateData: UpdateBusinessSettingsDto): Promise<BusinessSettingsDto> {
    try {
      const updates: Promise<any>[] = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (value !== undefined) {
          const settingType = typeof value === 'object' ? 'json' : 'string';
          const settingValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

          updates.push(
            this.prisma.systemSetting.upsert({
              where: { key },
              update: {
                value: settingValue,
                type: settingType,
              },
              create: {
                key,
                value: settingValue,
                type: settingType,
              },
            })
          );
        }
      }

      await Promise.all(updates);

      const result = await this.getBusinessSettings();
      return result!; // We know it exists since we just updated it
    } catch (error) {
      this.logger.error('Failed to update business settings', error);
      throw error;
    }
  }

  async getSetting(key: string): Promise<any> {
    try {
      const setting = await this.prisma.systemSetting.findUnique({
        where: { key },
      });

      if (!setting) {
        return null;
      }

      return setting.type === 'json' ? JSON.parse(setting.value) : setting.value;
    } catch (error) {
      this.logger.error(`Failed to get setting: ${key}`, error);
      throw error;
    }
  }

  async setSetting(key: string, value: any): Promise<void> {
    try {
      const settingType = typeof value === 'object' ? 'json' : 'string';
      const settingValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

      await this.prisma.systemSetting.upsert({
        where: { key },
        update: {
          value: settingValue,
          type: settingType,
        },
        create: {
          key,
          value: settingValue,
          type: settingType,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to set setting: ${key}`, error);
      throw error;
    }
  }
}