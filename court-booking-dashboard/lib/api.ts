import type { Customer, Court, TimeSlot, Booking, BookingFormData } from "./types"

// Mock customers data
export const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Ahmed Khan",
    phone: "+92 300 1234567",
    email: "ahmed.khan@email.com",
    cnic: "42101-1234567-1",
    address: "House 123, Block A, Gulberg, Lahore",
    status: "Regular",
    totalBookings: 25,
    lastVisit: "2024-01-20",
    createdAt: "2023-06-15",
  },
  {
    id: "2",
    name: "Sara Ali",
    phone: "+92 301 2345678",
    email: "sara.ali@email.com",
    status: "VIP",
    totalBookings: 45,
    lastVisit: "2024-01-19",
    createdAt: "2023-03-10",
  },
  {
    id: "3",
    name: "Muhammad Hassan",
    phone: "+92 302 3456789",
    email: "hassan@email.com",
    cnic: "42101-9876543-2",
    address: "Flat 45, DHA Phase 5, Karachi",
    status: "Regular",
    totalBookings: 12,
    lastVisit: "2024-01-18",
    createdAt: "2023-09-20",
  },
  {
    id: "4",
    name: "Fatima Sheikh",
    phone: "+92 303 4567890",
    status: "New",
    totalBookings: 2,
    lastVisit: "2024-01-15",
    createdAt: "2024-01-10",
  },
  {
    id: "5",
    name: "Ali Raza",
    phone: "+92 304 5678901",
    email: "ali.raza@email.com",
    status: "Regular",
    totalBookings: 18,
    lastVisit: "2024-01-17",
    createdAt: "2023-08-05",
  },
]

// Mock API functions
export const searchCustomers = async (query: string): Promise<Customer[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockCustomers.filter(
    (customer) => customer.name.toLowerCase().includes(query.toLowerCase()) || customer.phone.includes(query),
  )
}

export const getCustomerByPhone = async (phone: string): Promise<Customer | null> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockCustomers.find((customer) => customer.phone === phone) || null
}

export const createCustomer = async (customerData: Partial<Customer>): Promise<Customer> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const newCustomer: Customer = {
    id: Date.now().toString(),
    name: customerData.name || "",
    phone: customerData.phone || "",
    email: customerData.email,
    cnic: customerData.cnic,
    address: customerData.address,
    status: "New",
    totalBookings: 0,
    createdAt: new Date().toISOString(),
  }
  return newCustomer
}

export const getAvailableTimeSlots = async (courtId: string, date: string): Promise<TimeSlot[]> => {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const baseSlots = [
    { start: "08:00", end: "09:00" },
    { start: "09:00", end: "10:00" },
    { start: "10:00", end: "11:00" },
    { start: "11:00", end: "12:00" },
    { start: "14:00", end: "15:00" },
    { start: "15:00", end: "16:00" },
    { start: "16:00", end: "17:00" },
    { start: "17:00", end: "18:00" },
    { start: "18:00", end: "19:00" },
    { start: "19:00", end: "20:00" },
    { start: "20:00", end: "21:00" },
  ]

  return baseSlots.map((slot, index) => ({
    id: `${courtId}-${date}-${index}`,
    startTime: slot.start,
    endTime: slot.end,
    status: Math.random() > 0.3 ? "Available" : ("Booked" as "Available" | "Booked"),
    price: 1500,
    courtId,
    date,
  }))
}

export const createBooking = async (bookingData: BookingFormData): Promise<Booking> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const bookingId = `#BK${String(Date.now()).slice(-3).padStart(3, "0")}`

  const newBooking: Booking = {
    id: Date.now().toString(),
    bookingId,
    customerId: bookingData.customer.id || Date.now().toString(),
    customer: bookingData.customer as Customer,
    courtId: bookingData.courtId,
    court: {} as Court, // Would be populated from court data
    date: bookingData.date,
    startTime: bookingData.startTime,
    endTime: "", // Calculate based on duration
    duration: bookingData.duration,
    amount: 1500 * bookingData.duration,
    status: "Confirmed",
    paymentStatus: bookingData.paymentMethod === "Cash" ? "Unpaid" : "Paid",
    paymentMethod: bookingData.paymentMethod,
    notes: bookingData.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return newBooking
}
