export class UnavailabilityResponseDto {
  id: string;
  courtId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  reason: string;
  isRecurring: boolean;
}