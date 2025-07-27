"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, Plus, Search, X, Download, RefreshCw, MoreHorizontal, Check, Edit } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { AddBookingModal } from "@/components/add-booking-modal"
import { BookingDetailsModal } from "@/components/booking-details-modal"
import { BookingsSkeleton } from "@/components/loading-skeleton"
import { useToast } from "@/components/toast-provider"
import { debounce } from "@/lib/utils"
import type { Booking } from "@/lib/types"

const mockBookings: Booking[] = [
  {
    id: "1",
    bookingId: "#BK001",
    customerId: "1",
    customer: {
      id: "1",
      name: "Ahmed Khan",
      phone: "+92 300 1234567",
      email: "ahmed.khan@email.com",
      status: "Regular",
      totalBookings: 25,
      createdAt: "2023-06-15",
    },
    courtId: "1",
    court: {
      id: "1",
      name: "Tennis Court A",
      type: "Tennis",
      pricePerHour: 1500,
      status: "Active",
      bookingsToday: 3,
      isAvailableNow: false,
      description: "Professional tennis court",
      image: "/placeholder.svg",
      operatingHours: { start: "06:00", end: "22:00" },
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "10:00",
    duration: 1,
    amount: 1500,
    status: "Confirmed",
    paymentStatus: "Paid",
    paymentMethod: "Cash",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    bookingId: "#BK002",
    customerId: "2",
    customer: {
      id: "2",
      name: "Sara Ali",
      phone: "+92 301 2345678",
      email: "sara.ali@email.com",
      status: "VIP",
      totalBookings: 45,
      createdAt: "2023-03-10",
    },
    courtId: "3",
    court: {
      id: "3",
      name: "Badminton Court 1",
      type: "Badminton",
      pricePerHour: 800,
      status: "Active",
      bookingsToday: 5,
      isAvailableNow: false,
      description: "Indoor badminton court",
      image: "/placeholder.svg",
      operatingHours: { start: "07:00", end: "23:00" },
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "10:30",
    endTime: "11:30",
    duration: 1,
    amount: 800,
    status: "Pending",
    paymentStatus: "Unpaid",
    paymentMethod: "Cash",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    bookingId: "#BK003",
    customerId: "3",
    customer: {
      id: "3",
      name: "Muhammad Hassan",
      phone: "+92 302 3456789",
      email: "hassan@email.com",
      status: "Regular",
      totalBookings: 12,
      createdAt: "2023-09-20",
    },
    courtId: "5",
    court: {
      id: "5",
      name: "Basketball Court",
      type: "Basketball",
      pricePerHour: 1200,
      status: "Active",
      bookingsToday: 2,
      isAvailableNow: true,
      description: "Full-size basketball court",
      image: "/placeholder.svg",
      operatingHours: { start: "06:00", end: "21:00" },
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "14:30",
    endTime: "15:30",
    duration: 1,
    amount: 1200,
    status: "Confirmed",
    paymentStatus: "Paid",
    paymentMethod: "Online",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const courts = [
  {
    id: "1",
    name: "Tennis Court A",
    type: "Tennis" as const,
    pricePerHour: 1500,
    status: "Active" as const,
    bookingsToday: 3,
    isAvailableNow: false,
    description: "Professional tennis court",
    image: "/placeholder.svg",
    operatingHours: { start: "06:00", end: "22:00" },
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
  {
    id: "2",
    name: "Tennis Court B",
    type: "Tennis" as const,
    pricePerHour: 1500,
    status: "Active" as const,
    bookingsToday: 1,
    isAvailableNow: true,
    description: "Professional tennis court",
    image: "/placeholder.svg",
    operatingHours: { start: "06:00", end: "22:00" },
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
  {
    id: "3",
    name: "Badminton Court 1",
    type: "Badminton" as const,
    pricePerHour: 800,
    status: "Active" as const,
    bookingsToday: 5,
    isAvailableNow: false,
    description: "Indoor badminton court",
    image: "/placeholder.svg",
    operatingHours: { start: "07:00", end: "23:00" },
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
]

export function BookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>(mockBookings)
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedBookings, setSelectedBookings] = useState<string[]>([])

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [courtFilter, setCourtFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const { addToast } = useToast()

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      const filtered = bookings.filter(
        (booking) =>
          booking.customer.name.toLowerCase().includes(term.toLowerCase()) ||
          booking.customer.phone.includes(term) ||
          booking.bookingId.toLowerCase().includes(term.toLowerCase()) ||
          booking.court.name.toLowerCase().includes(term.toLowerCase()),
      )
      setFilteredBookings(filtered)
      setCurrentPage(1)
    }, 300),
    [bookings],
  )

  // Apply filters
  useEffect(() => {
    let filtered = [...bookings]

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.customer.phone.includes(searchTerm) ||
          booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.court.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status.toLowerCase() === statusFilter)
    }

    // Apply court filter
    if (courtFilter !== "all") {
      filtered = filtered.filter((booking) => booking.court.name === courtFilter)
    }

    setFilteredBookings(filtered)
    setCurrentPage(1)
  }, [bookings, searchTerm, statusFilter, courtFilter])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    if (!value) {
      setFilteredBookings(bookings)
    } else {
      debouncedSearch(value)
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    setFilteredBookings(bookings)
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    addToast({
      type: "success",
      title: "Data refreshed",
      description: "Bookings have been updated successfully",
    })
  }

  const handleBulkConfirm = () => {
    const updatedBookings = bookings.map((booking) =>
      selectedBookings.includes(booking.id) && booking.status === "Pending"
        ? { ...booking, status: "Confirmed" as const }
        : booking,
    )
    setBookings(updatedBookings)
    setSelectedBookings([])
    addToast({
      type: "success",
      title: "Bookings confirmed",
      description: `${selectedBookings.length} booking(s) confirmed successfully`,
    })
  }

  const handleStatusChange = (bookingId: string, newStatus: Booking["status"]) => {
    const updatedBookings = bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, status: newStatus } : booking,
    )
    setBookings(updatedBookings)
    addToast({
      type: "success",
      title: "Status updated",
      description: `Booking status changed to ${newStatus}`,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "Cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
      case "Completed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">Paid</Badge>
      case "Unpaid":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs">Unpaid</Badge>
      case "Partial":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 text-xs">Partial</Badge>
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            {status}
          </Badge>
        )
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBookings = filteredBookings.slice(startIndex, endIndex)

  if (isLoading) {
    return <BookingsSkeleton />
  }

  // Map booking to flat structure for BookingDetailsModal
  const mapBookingForModal = (booking: Booking | null) => {
    if (!booking) return null;
    return {
      id: booking.id,
      bookingId: booking.bookingId,
      date: booking.date,
      time: `${booking.startTime} - ${booking.endTime}`,
      customerName: booking.customer.name,
      customerPhone: booking.customer.phone,
      courtName: booking.court.name,
      courtType: booking.court.type,
      duration: `${booking.duration} hour${booking.duration > 1 ? 's' : ''}`,
      amount: booking.amount,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
    };
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Bookings Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your court bookings and schedules</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="bg-transparent">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 min-h-[44px]">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add New Booking</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by customer, phone, booking ID, or court..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-10 min-h-[44px]"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-32 min-h-[44px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={courtFilter} onValueChange={setCourtFilter}>
                <SelectTrigger className="w-full md:w-40 min-h-[44px]">
                  <SelectValue placeholder="Court" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courts</SelectItem>
                  {courts.map((court) => (
                    <SelectItem key={court.id} value={court.name}>
                      {court.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedBookings.length > 0 && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {selectedBookings.length} booking(s) selected
              </span>
              <Button size="sm" onClick={handleBulkConfirm} className="bg-blue-600 hover:bg-blue-700">
                <Check className="h-4 w-4 mr-1" />
                Confirm Selected
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedBookings([])} className="bg-transparent">
                Clear Selection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-4">
        {currentBookings.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "No bookings found matching your search" : "No bookings found"}
              </div>
            </CardContent>
          </Card>
        ) : (
          currentBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedBookings.includes(booking.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedBookings([...selectedBookings, booking.id])
                          } else {
                            setSelectedBookings(selectedBookings.filter((id) => id !== booking.id))
                          }
                        }}
                      />
                      <span className="font-medium text-blue-600">{booking.bookingId}</span>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{booking.customer.name}</span>
                      <div className="text-gray-500 dark:text-gray-400">{booking.customer.phone}</div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{booking.court.name}</span>
                      <div className="text-gray-500 dark:text-gray-400">{booking.court.type}</div>
                    </div>

                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {format(new Date(booking.date), "MMM dd, yyyy")}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {booking.startTime} - {booking.endTime}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">PKR {booking.amount.toLocaleString()}</div>
                        {getPaymentBadge(booking.paymentStatus)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedBooking(booking)
                        setIsDetailsModalOpen(true)
                      }}
                      className="flex-1 bg-transparent min-h-[44px]"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {booking.status === "Pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(booking.id, "Confirmed")}
                        className="flex-1 bg-green-600 hover:bg-green-700 min-h-[44px]"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedBookings.length === currentBookings.length && currentBookings.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedBookings(currentBookings.map((b) => b.id))
                        } else {
                          setSelectedBookings([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Court</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {searchTerm ? "No bookings found matching your search criteria" : "No bookings found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentBookings.map((booking) => (
                    <TableRow key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <TableCell>
                        <Checkbox
                          checked={selectedBookings.includes(booking.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedBookings([...selectedBookings, booking.id])
                            } else {
                              setSelectedBookings(selectedBookings.filter((id) => id !== booking.id))
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-blue-600">{booking.bookingId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {format(new Date(booking.date), "MMM dd, yyyy")}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {booking.startTime} - {booking.endTime}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{booking.customer.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{booking.customer.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{booking.court.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{booking.court.type}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-green-600">PKR {booking.amount.toLocaleString()}</div>
                          {getPaymentBadge(booking.paymentStatus)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedBooking(booking)
                                setIsDetailsModalOpen(true)
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {booking.status === "Pending" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "Confirmed")}>
                                <Check className="mr-2 h-4 w-4" />
                                Confirm Booking
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Booking
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {filteredBookings.length > 0 && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length}{" "}
                  results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="bg-transparent"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="bg-transparent"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newBooking) => {
          setBookings([newBooking, ...bookings])
          setIsModalOpen(false)
        }}
        courts={courts}
      />

      <BookingDetailsModal
        booking={mapBookingForModal(selectedBooking)}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
