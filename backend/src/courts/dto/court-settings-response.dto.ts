import { CourtUnavailability, PeakSchedule } from '@prisma/client';

export class CourtSettingsResponseDto {
  advancedBookingLimit: number;
  unavailabilities: CourtUnavailability[];
  peakSchedules: PeakSchedule[];
}