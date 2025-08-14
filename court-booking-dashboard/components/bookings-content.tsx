"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
import { safeFocus } from "@/lib/focus-utils"
import * as bookingsApi from "@/lib/api/bookings"
import { getCourts, Court } from "@/lib/api/courts"

export function BookingsContent() {
  const [bookings, setBookings] = useState<bookingsApi.Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<bookingsApi.Booking[]>([])
  const [courts, setCourts] = useState<Court[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingBooking, setEditingBooking] = useState<bookingsApi.Booking | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<bookingsApi.Booking | null>(null)
  const [selectedBookings, setSelectedBookings] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [courtFilter, setCourtFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // Add state for managing dropdown open states to prevent focus conflicts
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({})

  const handleDropdownOpenChange = (bookingId: string, open: boolean) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [bookingId]: open
    }))
  }

  // All hooks that depend on context/external libraries
  const { addToast } = useToast()

  // All useMemo and useCallback hooks
  const mappedBooking = useMemo(() => {
    if (!selectedBooking) return null;
    return {
      id: selectedBooking.id,
      bookingId: selectedBooking.bookingId,
      date: typeof selectedBooking.date === 'string' ? selectedBooking.date : selectedBooking.date.toISOString(),
      time: `${selectedBooking.startTime} - ${selectedBooking.endTime}`,
      customerName: selectedBooking.user?.name || 'N/A',
      customerPhone: selectedBooking.user?.phoneNumber || 'N/A',
      courtName: selectedBooking.court?.name || 'N/A',
      courtType: selectedBooking.court?.type || 'N/A',
      duration: `${bookingsApi.getBookingDurationHours(selectedBooking.duration)} hour${bookingsApi.getBookingDurationHours(selectedBooking.duration) > 1 ? 's' : ''}`,
      amount: selectedBooking.totalPrice,
      status: selectedBooking.status.charAt(0) + selectedBooking.status.slice(1).toLowerCase() as "Confirmed" | "Pending" | "Cancelled" | "Completed",
      paymentStatus: selectedBooking.paymentStatus.charAt(0) + selectedBooking.paymentStatus.slice(1).toLowerCase() as "Paid" | "Unpaid" | "Partial",
    };
  }, [selectedBooking])

  // All useEffect hooks
  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => {
      clearTimeout(timerId)
    }
  }, [searchTerm])

  // Load bookings and courts on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Debug authentication state
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('access_token')
          if (!token) {
            console.error('No access token found')
            addToast({
              type: "error",
              title: "Authentication Error",
              description: "No authentication token found. Please log in again.",
            })
            return
          }
        }
        
        const [bookingsData, courtsData] = await Promise.all([
          bookingsApi.getBookings(),
          getCourts()
        ])
        setBookings(bookingsData)
        setFilteredBookings(bookingsData)
        setCourts(courtsData)
      } catch (error: any) {
        console.error('Failed to load data:', error)
        const isAuthError = error.message?.includes('Authentication') || error.message?.includes('Unauthorized')
        addToast({
          type: "error",
          title: isAuthError ? "Authentication Error" : "Error loading data",
          description: isAuthError ? "Please log in again to continue." : "Failed to load bookings and courts data",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...bookings]

    // Apply search
    if (debouncedSearchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.user?.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          booking.user?.phoneNumber.includes(debouncedSearchTerm) ||
          booking.bookingId.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          booking.court?.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status.toUpperCase() === statusFilter.toUpperCase())
    }

    // Apply court filter
    if (courtFilter !== "all") {
      filtered = filtered.filter((booking) => booking.court?.name === courtFilter)
    }

    setFilteredBookings(filtered)
    setCurrentPage(1)
  }, [bookings, debouncedSearchTerm, statusFilter, courtFilter])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const bookingsData = await bookingsApi.getBookings()
      setBookings(bookingsData)
      setFilteredBookings(bookingsData)
      addToast({
        type: "success",
        title: "Data refreshed",
        description: "Bookings have been updated successfully",
      })
    } catch (error) {
      addToast({
        type: "error",
        title: "Refresh failed",
        description: "Failed to refresh bookings data",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkConfirm = async () => {
    try {
      const confirmPromises = selectedBookings
        .filter(id => {
          const booking = bookings.find(b => b.id === id)
          return booking && booking.status === "PENDING"
        })
        .map(id => bookingsApi.confirmBooking(id))
      
      await Promise.all(confirmPromises)
      
      // Refresh bookings data
      const updatedBookings = await bookingsApi.getBookings()
      setBookings(updatedBookings)
      setFilteredBookings(updatedBookings)
      setSelectedBookings([])
      
      addToast({
        type: "success",
        title: "Bookings confirmed",
        description: `${confirmPromises.length} booking(s) confirmed successfully`,
      })
    } catch (error) {
      addToast({
        type: "error",
        title: "Confirmation failed",
        description: "Failed to confirm selected bookings",
      })
    }
  }

  // After modal is fully closed, clear selectedBooking and ensure proper focus management
  useEffect(() => {
    if (!isDetailsModalOpen && selectedBooking) {
      const timeout = setTimeout(() => {
        setSelectedBooking(null)
        // Clear any dropdown states when modal closes to prevent focus conflicts
        setOpenDropdowns({})
      }, 200) // match Dialog close animation duration
      return () => clearTimeout(timeout)
    }
  }, [isDetailsModalOpen, selectedBooking])

  const handleStatusChange = async (bookingId: string, newStatus: bookingsApi.Booking["status"]) => {
    try {
      await bookingsApi.updateBookingStatus(bookingId, newStatus)
      
      // Refresh bookings data
      const updatedBookings = await bookingsApi.getBookings()
      setBookings(updatedBookings)
      setFilteredBookings(updatedBookings)
      
      addToast({
        type: "success",
        title: "Status updated",
        description: `Booking status changed to ${newStatus}`,
      })
    } catch (error) {
      addToast({
        type: "error",
        title: "Status update failed",
        description: "Failed to update booking status",
      })
    }
  }

  const handleEditBooking = (booking: bookingsApi.Booking) => {
    setEditingBooking(booking)
    setIsEditMode(true)
    setIsModalOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
      case "COMPLETED":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>
      case "NO_SHOW":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">No Show</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">Paid</Badge>
      case "PENDING":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs">Pending</Badge>
      case "REFUNDED":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 text-xs">Refunded</Badge>
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
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-blue-600 hover:bg-blue-700 min-h-[44px]"
            data-add-booking-button
          >
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
                      <span className="font-medium text-gray-900 dark:text-gray-100">{booking.user?.name || 'N/A'}</span>
                      <div className="text-gray-500 dark:text-gray-400">{booking.user?.phoneNumber || 'N/A'}</div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{booking.court?.name || 'N/A'}</span>
                      <div className="text-gray-500 dark:text-gray-400">{booking.court?.type || 'N/A'}</div>
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
                        <div className="font-medium text-green-600">PKR {booking.totalPrice.toLocaleString()}</div>
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
                    {booking.status === "PENDING" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(booking.id, "CONFIRMED")}
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
                          <div className="font-medium text-gray-900 dark:text-gray-100">{booking.user?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{booking.user?.phoneNumber || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{booking.court?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{booking.court?.type || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-green-600">PKR {booking.totalPrice.toLocaleString()}</div>
                          {getPaymentBadge(booking.paymentStatus)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu 
                          modal={false}
                          open={openDropdowns[booking.id] || false}
                          onOpenChange={(open) => handleDropdownOpenChange(booking.id, open)}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              aria-label={`More actions for booking ${booking.bookingId}`}
                              onFocus={() => {
                                // Ensure any conflicting aria-hidden elements don't interfere
                                if (openDropdowns[booking.id]) {
                                  setOpenDropdowns(prev => ({
                                    ...prev,
                                    [booking.id]: false
                                  }))
                                }
                              }}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            align="end" 
                            side="bottom" 
                            avoidCollisions
                            onCloseAutoFocus={(event) => {
                              // Prevent default and handle focus manually to avoid aria-hidden conflicts
                              event.preventDefault()
                              safeFocus(
                                document.querySelector(`[aria-label="More actions for booking ${booking.bookingId}"]`) as HTMLElement,
                                50
                              )
                            }}
                          >
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedBooking(booking)
                                setIsDetailsModalOpen(true)
                                setOpenDropdowns(prev => ({
                                  ...prev,
                                  [booking.id]: false
                                }))
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {booking.status === "PENDING" && (
                              <DropdownMenuItem 
                                onClick={() => {
                                  handleStatusChange(booking.id, "CONFIRMED")
                                  setOpenDropdowns(prev => ({
                                    ...prev,
                                    [booking.id]: false
                                  }))
                                }}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Confirm Booking
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setOpenDropdowns(prev => ({
                                  ...prev,
                                  [booking.id]: false
                                }))
                                handleEditBooking(booking)
                              }}
                            >
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
        onClose={() => {
          setIsModalOpen(false)
          setIsEditMode(false)
          setEditingBooking(null)
          // Return focus to the add booking button after modal closes
          safeFocus(
            document.querySelector('[data-add-booking-button]') as HTMLElement,
            100
          )
        }}
        onSuccess={(updatedBooking) => {
          if (isEditMode) {
            // Update existing booking in the list
            setBookings(bookings.map(b => b.id === updatedBooking.id ? updatedBooking : b))
            setFilteredBookings(filteredBookings.map(b => b.id === updatedBooking.id ? updatedBooking : b))
          } else {
            // Add new booking to the list
            setBookings([updatedBooking, ...bookings])
            setFilteredBookings([updatedBooking, ...filteredBookings])
          }
          setIsModalOpen(false)
          setIsEditMode(false)
          setEditingBooking(null)
          addToast({
            type: "success",
            title: isEditMode ? "Booking updated" : "Booking created",
            description: isEditMode
              ? "Booking updated successfully"
              : "Booking created successfully",
          })
        }}
        courts={courts as any}
        booking={editingBooking || undefined}
      />

      <BookingDetailsModal
        booking={mappedBooking}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
        }}
        onStatusChange={async (bookingId: string, newStatus: "Confirmed" | "Pending" | "Cancelled" | "Completed") => {
          const apiStatus = newStatus.toUpperCase() as bookingsApi.Booking["status"]
          await handleStatusChange(bookingId, apiStatus)
        }}
        onEditBooking={(booking) => {
          // Convert the mapped booking back to the original booking format
          const originalBooking = selectedBooking
          if (originalBooking) {
            handleEditBooking(originalBooking)
          }
        }}
      />
    </div>
  )
}
