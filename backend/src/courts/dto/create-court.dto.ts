export class CourtAvailabilityDto {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotDuration?: number;
    maxBookingsPerUserPerDay?: number;
}

export class CreateCourtDto {
    name: string;
    type: string;
    description?: string;
    pricePerHour: number;
    isActive: boolean;
    imageUrl?: string;
    availability: CourtAvailabilityDto[];
}