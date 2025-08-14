"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  User,
  Phone,
  Mail,
  CreditCard,
  Clock,
  MapPin,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import * as bookingsApi from "@/lib/api/bookings"
import * as usersApi from "@/lib/api/users"
import { formatDateForAPI } from "@/lib/utils"
import * as courtsApi from "@/lib/api/courts"

// Type aliases for clarity
type BookingUser = bookingsApi.User
type FullUser = usersApi.User

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  price: number
  status: "Available" | "Booked" | "Blocked"
  isPeakTime?: boolean
}

interface AddBookingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (booking: bookingsApi.Booking) => void
  courts: courtsApi.Court[]
  booking?: bookingsApi.Booking // Optional booking for edit mode
}

interface BookingFormData {
  customer: {
    id?: string
    name: string
    phone: string
    email: string
    cnic: string
    address: string
  }
  courtId: string
  date: string
  startTime: string
  paymentMethod: string
  notes: string
}

const steps = [
  { id: 1, title: "Customer Info", icon: User },
  { id: 2, title: "Court Selection", icon: MapPin },
  { id: 3, title: "Date & Time", icon: Clock },
  { id: 4, title: "Payment", icon: CreditCard },
  { id: 5, title: "Confirmation", icon: CheckCircle },
]

export function AddBookingModal({ isOpen, onClose, onSuccess, courts, booking }: AddBookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<FullUser[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<FullUser | null>(null)
  const [selectedCourt, setSelectedCourt] = useState<courtsApi.Court | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [createdBooking, setCreatedBooking] = useState<bookingsApi.Booking | null>(null)
  const [courtTypeFilter, setCourtTypeFilter] = useState("all")
  const [localCourts, setLocalCourts] = useState<courtsApi.Court[]>([])
  const [courtsLoading, setCourtsLoading] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [formData, setFormData] = useState<BookingFormData>({
    customer: {
      name: "",
      phone: "",
      email: "",
      cnic: "",
      address: "",
    },
    courtId: "",
    date: "",
    startTime: "",
    paymentMethod: "Cash",
    notes: "",
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1)
      setIsEditMode(false)
      setSelectedCustomer(null)
      setSelectedCourt(null)
      setSelectedDate(undefined)
      setSelectedSlot(null)
      setCreatedBooking(null)
      setCourtTypeFilter("all")
      setTermsAccepted(false)
      setFormData({
        customer: { name: "", phone: "", email: "", cnic: "", address: "" },
        courtId: "",
        date: "",
        startTime: "",
        paymentMethod: "Cash",
        notes: "",
      })
    } else {
      // Check if we're in edit mode
      const editMode = !!booking
      setIsEditMode(editMode)

      // Debug: Check courts data when modal opens
      console.log('Courts passed to AddBookingModal:', courts)
      console.log('Number of courts:', courts?.length || 0)
      console.log('Active courts:', courts?.filter(c => c.isActive)?.length || 0)

      // If no courts provided via props, fetch them
      if (!courts || courts.length === 0) {
        setCourtsLoading(true)
        courtsApi.getCourts()
          .then((fetchedCourts) => {
            console.log('Fetched courts:', fetchedCourts)
            setLocalCourts(fetchedCourts as courtsApi.Court[])

            // If in edit mode and we have booking data, preload it after courts are loaded
            if (editMode && booking) {
              preloadBookingData(booking, fetchedCourts as courtsApi.Court[])
            }
          })
          .catch((error) => {
            console.error('Failed to fetch courts:', error)
          })
          .finally(() => {
            setCourtsLoading(false)
          })
      } else {
        // If courts are already available and we're in edit mode, preload data immediately
        if (editMode && booking) {
          preloadBookingData(booking, courts)
        }
      }
    }
  }, [isOpen, courts, booking])

  // Function to preload booking data when in edit mode
  const preloadBookingData = (bookingData: bookingsApi.Booking, availableCourts: courtsApi.Court[]) => {
    try {
      console.log('Preloading booking data:', bookingData)

      // Set customer data
      if (bookingData.user) {
        const customer = bookingData.user
        // Convert booking User to usersApi User format by creating a compatible object
        const compatibleCustomer: FullUser = {
          id: customer.id,
          name: customer.name,
          phoneNumber: customer.phoneNumber,
          email: customer.email,
          cnic: customer.cnic,
          address: customer.address,
          role: 'CUSTOMER' as const,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        setSelectedCustomer(compatibleCustomer)
        setFormData(prev => ({
          ...prev,
          customer: {
            id: customer.id,
            name: customer.name,
            phone: customer.phoneNumber,
            email: customer.email || "",
            cnic: customer.cnic || "",
            address: customer.address || "",
          }
        }))
      }

      // Set court data
      const court = availableCourts.find(c => c.id === bookingData.courtId)
      if (court) {
        setSelectedCourt(court)
        setFormData(prev => ({ ...prev, courtId: court.id }))
      }

      // Set date
      const bookingDate = typeof bookingData.date === 'string'
        ? new Date(bookingData.date)
        : bookingData.date
      setSelectedDate(bookingDate)
      setFormData(prev => ({
        ...prev,
        date: formatDateForAPI(bookingDate)
      }))

      // Set time slot
      const timeSlot: TimeSlot = {
        id: `edit-slot-${bookingData.id}`,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        price: bookingData.totalPrice, // Use total price directly
        status: "Available"
      }
      setSelectedSlot(timeSlot)
      setFormData(prev => ({
        ...prev,
        startTime: bookingData.startTime
      }))

      // Set notes and payment method
      setFormData(prev => ({
        ...prev,
        notes: bookingData.notes || "",
        paymentMethod: bookingData.paymentStatus === 'PAID' ? 'Online' : 'Cash'
      }))

      console.log('Booking data preloaded successfully')
    } catch (error) {
      console.error('Error preloading booking data:', error)
    }
  }

  // Customer search
  const handleCustomerSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length > 2) {
      setIsLoading(true)
      try {
        const results = await usersApi.searchCustomers(query)
        setSearchResults(results)
      } catch (error) {
        console.error("Search failed:", error)
      } finally {
        setIsLoading(false)
      }
    } else {
      setSearchResults([])
    }
  }

  // Phone number validation and customer lookup
  const handlePhoneChange = async (phone: string) => {
    setFormData({ ...formData, customer: { ...formData.customer, phone } })

    if (phone.length >= 11) {
      setIsLoading(true)
      try {
        const customer = await usersApi.getCustomerByPhone(phone)
        if (customer) {
          setSelectedCustomer(customer)
          setFormData({
            ...formData,
            customer: {
              id: customer.id,
              name: customer.name,
              phone: customer.phoneNumber,
              email: customer.email || "",
              cnic: customer.cnic || "",
              address: customer.address || "",
            },
          })
        }
      } catch (error) {
        console.error("Customer lookup failed:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Generate available time slots based on court availability and existing bookings
  const generateTimeSlots = async (court: courtsApi.Court, date: Date): Promise<TimeSlot[]> => {
    const slots: TimeSlot[] = []

    try {
      // Format date as YYYY-MM-DD for the API (using local timezone to avoid date shifting)
      const dateStr = formatDateForAPI(date)

      // Fetch available slots from backend
      const availableSlots = await courtsApi.getAvailableSlots(court.id, dateStr)
      console.log('Available slots from API:', availableSlots) // Debug log to verify API response

      // Convert backend slots to frontend TimeSlot format
      availableSlots.forEach((slot, index) => {
        slots.push({
          id: `slot-${index + 1}`,
          startTime: slot.startTime,
          endTime: slot.endTime,
          price: slot.price || court.pricePerHour, // Use API price if available, fallback to court price
          status: slot.isAvailable ? "Available" : "Booked",
          isPeakTime: slot.isPeakTime || false // Include peak time information
        })
      })

      console.log('Processed slots for frontend:', slots) // Debug log to verify slot processing
      return slots
    } catch (error) {
      console.error('Failed to fetch available slots:', error)

      // Fallback to generating slots without booking info
      const dateDay = date.getDay()
      const dayAvailability = court.availability?.find(av => av.dayOfWeek === dateDay)

      if (!dayAvailability || !dayAvailability.startTime || !dayAvailability.endTime) {
        return slots
      }

      const startTime = dayAvailability.startTime
      const endTime = dayAvailability.endTime
      const slotDuration = court.slotDuration || 60

      const [startHour, startMinute] = startTime.split(':').map(Number)
      const [endHour, endMinute] = endTime.split(':').map(Number)

      let currentHour = startHour
      let currentMinute = startMinute
      let slotId = 1

      while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const nextHour = currentHour + Math.floor((currentMinute + slotDuration) / 60)
        const nextMinute = (currentMinute + slotDuration) % 60

        if (nextHour < endHour || (nextHour === endHour && nextMinute <= endMinute)) {
          const slotStart = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
          const slotEnd = `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`

          slots.push({
            id: `slot-${slotId}`,
            startTime: slotStart,
            endTime: slotEnd,
            price: court.pricePerHour,
            status: "Available"
          })

          slotId++
        }

        currentHour = nextHour
        currentMinute = nextMinute
      }

      return slots
    }
  }

  // Load available time slots when court and date are selected
  useEffect(() => {
    if (selectedCourt && selectedDate) {
      setIsLoading(true)
      generateTimeSlots(selectedCourt, selectedDate)
        .then(slots => {
          setAvailableSlots(slots)
        })
        .catch(error => {
          console.error('Error loading time slots:', error)
          setAvailableSlots([])
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [selectedCourt, selectedDate])

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.customer.name.length > 0 && formData.customer.phone.length >= 11
      case 2:
        return selectedCourt !== null
      case 3:
        return selectedDate !== undefined && selectedSlot !== null
      case 4:
        return formData.paymentMethod !== "" && termsAccepted
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    if (!selectedCourt || !selectedDate || !selectedSlot) return

    setIsLoading(true)
    try {
      if (isEditMode && booking) {
        // Update existing booking
        const bookingData: bookingsApi.UpdateBookingDto = {
          userId: formData.customer.id || booking.userId,
          courtId: selectedCourt.id,
          date: formatDateForAPI(selectedDate), // YYYY-MM-DD format
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          duration: selectedCourt.slotDuration || 60,
          totalPrice: calculateTotal(),
          notes: formData.notes || undefined,
          status: booking.status, // Keep existing status
          paymentStatus: formData.paymentMethod === 'Online' ? 'PAID' : booking.paymentStatus
        }

        console.log('Updating booking with data:', bookingData)

        // Remove undefined values to avoid issues
        const cleanedBookingData = Object.fromEntries(
          Object.entries(bookingData).filter(([_, value]) => value !== undefined)
        ) as bookingsApi.UpdateBookingDto

        console.log('Cleaned update booking data:', cleanedBookingData)
        const updatedBooking = await bookingsApi.updateBooking(booking.id, cleanedBookingData)
        setCreatedBooking(updatedBooking)
        setCurrentStep(5)
        onSuccess(updatedBooking)
      } else {
        // Create new booking (existing logic)
        let customerId = formData.customer.id

        if (!customerId) {
          // Create new customer
          const newCustomer = await usersApi.createUser({
            name: formData.customer.name,
            phoneNumber: formData.customer.phone,
            email: formData.customer.email || undefined,
            cnic: formData.customer.cnic || undefined,
            address: formData.customer.address || undefined,
            role: 'CUSTOMER'
          })
          customerId = newCustomer.id
        }

        // Validate required data
        if (!customerId || !selectedCourt.id || !selectedDate || !selectedSlot) {
          throw new Error('Missing required booking information')
        }

        // Create booking
        const bookingData: bookingsApi.CreateBookingDto = {
          bookingId: bookingsApi.generateBookingId(),
          userId: customerId,
          courtId: selectedCourt.id,
          date: formatDateForAPI(selectedDate), // YYYY-MM-DD format
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          duration: selectedCourt.slotDuration || 60,
          totalPrice: calculateTotal(),
          notes: formData.notes || undefined,
          status: 'PENDING',
          paymentStatus: 'PENDING'
        }

        console.log('Booking data being sent:', bookingData)

        // Remove undefined values to avoid issues
        const cleanedBookingData = Object.fromEntries(
          Object.entries(bookingData).filter(([_, value]) => value !== undefined)
        ) as bookingsApi.CreateBookingDto

        console.log('Cleaned booking data:', cleanedBookingData)
        const newBooking = await bookingsApi.createBooking(cleanedBookingData)
        setCreatedBooking(newBooking)
        setCurrentStep(5)
        onSuccess(newBooking)
      }
    } catch (error) {
      console.error(`Booking ${isEditMode ? 'update' : 'creation'} failed:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotal = () => {
    if (!selectedCourt || !selectedSlot) return 0
    return selectedSlot.price
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Search Existing Customer</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or phone..."
                    value={searchQuery}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="border rounded-lg max-h-40 overflow-y-auto">
                    {searchResults.map((customer) => (
                      <div
                        key={customer.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setSelectedCustomer(customer)
                          setFormData({
                            ...formData,
                            customer: {
                              id: customer.id,
                              name: customer.name,
                              phone: customer.phoneNumber,
                              email: customer.email || "",
                              cnic: customer.cnic || "",
                              address: customer.address || "",
                            },
                          })
                          setSearchResults([])
                          setSearchQuery("")
                        }}
                      >
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{customer.phoneNumber}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-center text-gray-500 dark:text-gray-400">or</div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.customer.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customer: { ...formData.customer, name: e.target.value },
                        })
                      }
                      placeholder="Enter customer name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={formData.customer.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="+92 300 1234567"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.customer.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customer: { ...formData.customer, email: e.target.value },
                          })
                        }
                        placeholder="customer@email.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnic">CNIC Number</Label>
                    <Input
                      id="cnic"
                      value={formData.customer.cnic}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customer: { ...formData.customer, cnic: e.target.value },
                        })
                      }
                      placeholder="42101-1234567-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.customer.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer: { ...formData.customer, address: e.target.value },
                      })
                    }
                    placeholder="Enter customer address"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        const availableCourts = courts && courts.length > 0 ? courts : localCourts
        return (
          <div className="space-y-6">
            <div className="flex gap-4 mb-4">
              <Select value={courtTypeFilter} onValueChange={setCourtTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courts</SelectItem>
                  <SelectItem value="Tennis">Tennis</SelectItem>
                  <SelectItem value="Badminton">Badminton</SelectItem>
                  <SelectItem value="Basketball">Basketball</SelectItem>
                  <SelectItem value="Football">Football</SelectItem>
                  <SelectItem value="Squash">Squash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {courtsLoading ? (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  Loading courts...
                </div>
              ) : availableCourts && availableCourts.length > 0 ? (
                availableCourts
                  .filter((court) => court.isActive === true)
                  .filter((court) => courtTypeFilter === "all" || court.type === courtTypeFilter)
                  .length > 0 ? (
                  availableCourts
                    .filter((court) => court.isActive === true)
                    .filter((court) => courtTypeFilter === "all" || court.type === courtTypeFilter)
                    .map((court) => (
                      <Card
                        key={court.id}
                        className={`cursor-pointer transition-all ${selectedCourt?.id === court.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
                          }`}
                        onClick={() => {
                          setSelectedCourt(court)
                          setFormData({ ...formData, courtId: court.id })
                        }}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{court.name}</CardTitle>
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{court.type}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-300">Price per hour</span>
                              <span className="font-semibold text-green-600">
                                PKR {court.pricePerHour.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-300">Status</span>
                              <Badge
                                className={
                                  court.isAvailableNow
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : "bg-red-100 text-red-800 hover:bg-red-100"
                                }
                              >
                                {court.isAvailableNow ? "Available" : "Occupied"}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    No {courtTypeFilter === "all" ? "" : courtTypeFilter.toLowerCase()} courts available
                  </div>
                )
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  No courts found. Please check your connection or contact support.
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label>Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Available Time Slots</Label>
                </div>

                {selectedDate && (
                  <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                    {isLoading ? (
                      <div className="col-span-2 flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      availableSlots.map((slot) => (
                        <Button
                          key={slot.id}
                          variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                          className={`p-3 h-auto flex flex-col items-start relative ${slot.status === "Available"
                            ? selectedSlot?.id === slot.id
                              ? "bg-blue-600 text-white"
                              : slot.isPeakTime
                                ? "hover:bg-orange-50 bg-orange-25 border-orange-200"
                                : "hover:bg-blue-50 bg-transparent"
                            : "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
                            }`}
                          disabled={slot.status !== "Available"}
                          onClick={() => slot.status === "Available" && setSelectedSlot(slot)}
                        >
                          {slot.isPeakTime && (
                            <Badge className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-1 py-0">
                              Peak
                            </Badge>
                          )}
                          <div className="font-medium">
                            {slot.startTime} - {slot.endTime}
                          </div>
                          <div className="text-sm">
                            {slot.status === "Available"
                              ? `PKR ${slot.price.toLocaleString()}`
                              : "Booked"
                            }
                            {slot.isPeakTime && slot.status === "Available" && (
                              <span className="text-orange-600 font-medium ml-1">(Peak)</span>
                            )}
                          </div>
                        </Button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedSlot && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Selected Slot</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {selectedSlot.startTime} - {selectedSlot.endTime}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">PKR {calculateTotal().toLocaleString()}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Total Amount</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Customer:</span>
                    <div className="font-medium">{formData.customer.name}</div>
                    <div className="text-gray-500 dark:text-gray-400">{formData.customer.phone}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Court:</span>
                    <div className="font-medium">{selectedCourt?.name}</div>
                    <div className="text-gray-500 dark:text-gray-400">{selectedCourt?.type}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Date & Time:</span>
                    <div className="font-medium">{selectedDate && format(selectedDate, "MMM dd, yyyy")}</div>
                    <div className="text-gray-500 dark:text-gray-400">
                      {selectedSlot?.startTime} - {selectedSlot?.endTime}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Amount:</span>
                    <div className="text-green-600 font-semibold">PKR {calculateTotal().toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value: "Cash" | "Online") => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash (Pay at venue)</SelectItem>
                    <SelectItem value="Online">Online Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Special Notes/Requirements</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special requirements or notes..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))}
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the terms and conditions and cancellation policy
                </Label>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {isEditMode ? 'Booking Updated!' : 'Booking Confirmed!'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {isEditMode
                  ? 'Your court booking has been successfully updated.'
                  : 'Your court booking has been successfully created.'
                }
              </p>
            </div>

            {createdBooking && (
              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Booking Details
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{createdBooking.bookingId}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Customer:</span>
                      <div className="font-medium">{createdBooking.user?.name || formData.customer.name}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Court:</span>
                      <div className="font-medium">{selectedCourt?.name}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Date & Time:</span>
                      <div className="font-medium">{selectedDate && format(selectedDate, "MMM dd, yyyy")}</div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {selectedSlot?.startTime} - {selectedSlot?.endTime}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Total Amount:</span>
                      <div className="font-medium text-green-600">PKR {createdBooking.totalPrice.toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
                Close
              </Button>
              {!isEditMode && (
                <Button
                  onClick={() => {
                    setCurrentStep(1)
                    setSelectedCustomer(null)
                    setSelectedCourt(null)
                    setSelectedDate(undefined)
                    setSelectedSlot(null)
                    setCreatedBooking(null)
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Create Another Booking
                </Button>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] max-h-[90vh] bg-white dark:bg-gray-800 flex flex-col mx-4 sm:mx-auto overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            {isEditMode ? 'Edit Booking' : 'Create New Booking'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="space-y-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${currentStep >= step.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600 dark:text-gray-300"
                      }`}
                  >
                    {currentStep > step.id ? <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" /> : <step.icon className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </div>
                  <span className={`text-xs mt-1 text-center max-w-[60px] sm:max-w-none leading-tight ${currentStep >= step.id ? "text-blue-600 font-medium" : "text-gray-500 dark:text-gray-400"
                    }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-4 sm:w-8 h-0.5 mx-1 sm:mx-2 mt-[-12px] ${currentStep > step.id ? "bg-blue-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto py-4 min-h-0">{renderStepContent()}</div>

        {/* Navigation Buttons - Fixed at bottom */}
        {currentStep < 5 && (
          <div className="flex justify-between items-center pt-0 border-t flex-shrink-0 bg-white dark:bg-gray-800 mt-auto">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="bg-transparent min-h-[44px] px-3 sm:px-6 text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!validateStep(currentStep) || isLoading}
                className="bg-blue-600 hover:bg-blue-700 min-h-[44px] px-3 sm:px-6 text-sm sm:text-base"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-1 sm:mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-1 sm:mr-2" />
                )}
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!validateStep(currentStep) || isLoading}
                className="bg-green-600 hover:bg-green-700 min-h-[44px] px-3 sm:px-6 text-sm sm:text-base"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-1 sm:mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-1 sm:mr-2" />
                )}
                <span className="hidden sm:inline">{isEditMode ? 'Update Booking' : 'Confirm Booking'}</span>
                <span className="sm:hidden">{isEditMode ? 'Update' : 'Confirm'}</span>
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
