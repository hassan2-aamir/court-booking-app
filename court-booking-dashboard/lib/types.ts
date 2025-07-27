export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  cnic?: string
  address?: string
  status: "Regular" | "New" | "VIP"
  totalBookings: number
  lastVisit?: string
  createdAt: string
}

export interface Court {
  id: string
  name: string
  type: "Tennis" | "Badminton" | "Basketball" | "Football" | "Squash"
  pricePerHour: number
  status: "Active" | "Inactive" | "Maintenance"
  bookingsToday: number
  isAvailableNow: boolean
  description: string
  image: string
  operatingHours: {
    start: string
    end: string
  }
  availableDays: string[]
}

export interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  status: "Available" | "Booked" | "Blocked"
  price: number
  courtId: string
  date: string
}

export interface Booking {
  id: string
  bookingId: string
  customerId: string
  customer: Customer
  courtId: string
  court: Court
  date: string
  startTime: string
  endTime: string
  duration: number
  amount: number
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed"
  paymentStatus: "Paid" | "Unpaid" | "Partial"
  paymentMethod: "Cash" | "Online"
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface BookingFormData {
  customer: {
    id?: string
    name: string
    phone: string
    email?: string
    cnic?: string
    address?: string
  }
  courtId: string
  date: string
  startTime: string
  duration: number
  paymentMethod: "Cash" | "Online"
  notes?: string
}
