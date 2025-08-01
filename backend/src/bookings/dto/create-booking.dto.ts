export class CreateBookingDto {
    bookingId: string;
    userId: string;
    courtId: string;
    date: Date;
    startTime: string;
    endTime: string;
    duration: number;
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
    totalPrice: number;
    notes?: string;
    paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED';
}
