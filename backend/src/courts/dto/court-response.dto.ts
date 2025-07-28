export class CourtResponseDto {
    id: string;
    name: string;
    isActive: boolean;
    availability: {
        startTime: string | null;
        endTime: string | null;
        dayOfWeek: number | null;
    }[];

    pricePerHour: number;
    type: string;

    constructor(partial: Partial<CourtResponseDto>) {
        Object.assign(this, partial);
    }
}