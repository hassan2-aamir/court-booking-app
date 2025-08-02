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
import * as courtsApi from "@/lib/api/courts"

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  price: number
  status: "Available" | "Booked" | "Blocked"
}

interface AddBookingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (booking: bookingsApi.Booking) => void
  courts: courtsApi.Court[]
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
  duration: number
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

export function AddBookingModal({ isOpen, onClose, onSuccess, courts }: AddBookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<usersApi.User[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<usersApi.User | null>(null)
  const [selectedCourt, setSelectedCourt] = useState<courtsApi.Court | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [duration, setDuration] = useState(1)
  const [createdBooking, setCreatedBooking] = useState<bookingsApi.Booking | null>(null)
  const [courtTypeFilter, setCourtTypeFilter] = useState("all")
  const [localCourts, setLocalCourts] = useState<courtsApi.Court[]>([])
  const [courtsLoading, setCourtsLoading] = useState(false)

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
    duration: 1,
    paymentMethod: "Cash",
    notes: "",
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1)
      setSelectedCustomer(null)
      setSelectedCourt(null)
      setSelectedDate(undefined)
      setSelectedSlot(null)
      setCreatedBooking(null)
      setCourtTypeFilter("all")
      setFormData({
        customer: { name: "", phone: "", email: "", cnic: "", address: "" },
        courtId: "",
        date: "",
        startTime: "",
        duration: 1,
        paymentMethod: "Cash",
        notes: "",
      })
    } else {
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
          })
          .catch((error) => {
            console.error('Failed to fetch courts:', error)
          })
          .finally(() => {
            setCourtsLoading(false)
          })
      }
    }
  }, [isOpen, courts])

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

  // Generate available time slots based on court availability
  const generateTimeSlots = (court: courtsApi.Court, date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const dateDay = date.getDay() // 0 = Sunday, 1 = Monday, etc.
    
    // Find availability for the selected day
    const dayAvailability = court.availability?.find(av => av.dayOfWeek === dateDay)
    
    if (!dayAvailability || !dayAvailability.startTime || !dayAvailability.endTime) {
      return slots
    }

    const startTime = dayAvailability.startTime
    const endTime = dayAvailability.endTime
    const slotDuration = court.slotDuration || 60 // minutes
    
    // Parse start and end times
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

  // Load available time slots when court and date are selected
  useEffect(() => {
    if (selectedCourt && selectedDate) {
      const slots = generateTimeSlots(selectedCourt, selectedDate)
      setAvailableSlots(slots)
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
      //case 4:
      //  return formData.paymentMethod !== ""
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
      // Create or get customer
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

      // Calculate duration in minutes
      const durationMinutes = duration * 60

      // Validate required data
      if (!customerId || !selectedCourt.id || !selectedDate || !selectedSlot) {
        throw new Error('Missing required booking information')
      }

      // Create booking
      const bookingData: bookingsApi.CreateBookingDto = {
        bookingId: bookingsApi.generateBookingId(),
        userId: customerId,
        courtId: selectedCourt.id,
        date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD format
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        duration: durationMinutes,
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
      const booking = await bookingsApi.createBooking(cleanedBookingData)
      setCreatedBooking(booking)
      setCurrentStep(5)
      onSuccess(booking)
    } catch (error) {
      console.error("Booking creation failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotal = () => {
    if (!selectedCourt || !selectedSlot) return 0
    return selectedSlot.price * duration
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
                        className={`cursor-pointer transition-all ${
                          selectedCourt?.id === court.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
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
                <div className="flex items-center justify-between">
                  <Label>Available Time Slots</Label>
                  <Select value={duration.toString()} onValueChange={(value) => setDuration(Number(value))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="1.5">1.5 hours</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
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
                          className={`p-3 h-auto flex flex-col items-start ${
                            slot.status === "Available"
                              ? selectedSlot?.id === slot.id
                                ? "bg-blue-600 text-white"
                                : "hover:bg-blue-50 bg-transparent"
                              : "opacity-50 cursor-not-allowed bg-transparent"
                          }`}
                          disabled={slot.status !== "Available"}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <div className="font-medium">
                            {slot.startTime} - {slot.endTime}
                          </div>
                          <div className="text-sm">PKR {(slot.price * duration).toLocaleString()}</div>
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
                        {selectedSlot.startTime} - {selectedSlot.endTime} ({duration} hour{duration > 1 ? "s" : ""})
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
                    <span className="text-gray-600 dark:text-gray-300">Duration & Amount:</span>
                    <div className="font-medium">
                      {duration} hour{duration > 1 ? "s" : ""}
                    </div>
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
                <Checkbox id="terms" required />
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600 dark:text-gray-300">Your court booking has been successfully created.</p>
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
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Booking</DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {currentStep > step.id ? <CheckCircle className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${currentStep > step.id ? "bg-blue-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto py-4">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1} className="bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!validateStep(currentStep) || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!validateStep(currentStep) || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Confirm Booking
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
