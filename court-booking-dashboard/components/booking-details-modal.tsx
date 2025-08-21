"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
} from "lucide-react"
import { format } from "date-fns"
import { updatePaymentStatus, updateBookingStatus } from "@/lib/api/bookings"
import { useState, useEffect } from "react"

interface Booking {
  id: string
  bookingId: string
  date: string
  time: string
  customerName: string
  customerPhone: string
  courtName: string
  courtType: string
  duration: string
  amount: number
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed"
  paymentStatus: "Paid" | "Pending"
  notes?: string
}

interface BookingDetailsModalProps {
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: (bookingId: string, newStatus: Booking["status"]) => void
  onPaymentStatusChange?: (bookingId: string, newPaymentStatus: Booking["paymentStatus"]) => void
  onEditBooking?: (booking: Booking) => void
}

export function BookingDetailsModal({ booking, isOpen, onClose, onStatusChange, onPaymentStatusChange, onEditBooking }: BookingDetailsModalProps) {
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [notes, setNotes] = useState(booking?.notes || "")

  // Update notes when booking changes
  useEffect(() => {
    setNotes(booking?.notes || "")
  }, [booking?.notes])

  // Helper function to calculate actual duration from time string
  const calculateDurationFromTimeString = (timeString: string): string => {
    const [startTime, endTime] = timeString.split(' - ');
    if (!startTime || !endTime) return booking?.duration || "1 hour";

    const parseTime = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);

    // Handle cases where end time is on the next day
    let durationMinutes = endMinutes - startMinutes;
    if (durationMinutes < 0) {
      durationMinutes = (24 * 60 - startMinutes) + endMinutes;
    }

    const hours = durationMinutes / 60;

    if (hours === 1) {
      return "1 hour";
    } else if (hours < 1) {
      return `${durationMinutes} minutes`;
    } else if (hours % 1 === 0) {
      return `${hours} hours`;
    } else {
      const wholeHours = Math.floor(hours);
      const remainingMinutes = Math.round((hours - wholeHours) * 60);
      if (wholeHours === 0) {
        return `${remainingMinutes} minutes`;
      } else if (remainingMinutes === 0) {
        return `${wholeHours} hour${wholeHours > 1 ? 's' : ''}`;
      } else {
        return `${wholeHours} hour${wholeHours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
      }
    }
  };

  if (!booking) return null

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
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handlePaymentStatusChange = async (newPaymentStatus: string) => {
    if (!booking) return

    setIsUpdatingPayment(true)
    try {
      // Map frontend status to backend status
      const backendStatus = newPaymentStatus === "Paid" ? "PAID" : "PENDING"

      await updatePaymentStatus(booking.id, backendStatus as "PENDING" | "PAID" | "REFUNDED")

      // Call the parent callback if provided
      if (onPaymentStatusChange) {
        onPaymentStatusChange(booking.id, newPaymentStatus as Booking["paymentStatus"])
      }
    } catch (error) {
      console.error("Failed to update payment status:", error)
      // You might want to show a toast notification here
    } finally {
      setIsUpdatingPayment(false)
    }
  }

  const handleBookingStatusChange = async (newStatus: Booking["status"]) => {
    if (!booking) return

    setIsUpdatingStatus(true)
    try {
      // Map frontend status to backend status
      const backendStatus = newStatus.toUpperCase() as "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"

      await updateBookingStatus(booking.id, backendStatus)

      // Call the parent callback if provided
      onStatusChange(booking.id, newStatus)
    } catch (error) {
      console.error("Failed to update booking status:", error)
      // You might want to show a toast notification here
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!booking) return

    try {
      // Import updateBooking function
      const { updateBooking } = await import("@/lib/api/bookings")

      await updateBooking(booking.id, { notes })

      // You might want to show a success toast here
      console.log("Notes saved successfully")
    } catch (error) {
      console.error("Failed to save notes:", error)
      // You might want to show an error toast here
    }
  }

  const bookingTimeline = [
    {
      status: "Booking Created",
      // time: "2 hours ago",
      icon: <FileText className="h-4 w-4" />,
      completed: true,
    },
    {
      status: "Payment Received",
      // time: "1 hour ago",
      icon: <DollarSign className="h-4 w-4" />,
      completed: booking.paymentStatus === "Paid",
    },
    {
      status: "Booking Confirmed",
      // time: "30 minutes ago",
      icon: <CheckCircle className="h-4 w-4" />,
      completed: booking.status === "Confirmed" || booking.status === "Completed",
    },
    {
      status: "Court Session",
      // time: "Scheduled",
      icon: <MapPin className="h-4 w-4" />,
      completed: booking.status === "Completed",
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 mx-4 sm:mx-auto"
        onCloseAutoFocus={(event) => {
          // Prevent focus issues when modal closes
          event.preventDefault()
          // Allow natural focus handling without conflicts
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Booking Details - {booking.bookingId}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Full Name</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{booking.customerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Phone Number</label>
                    <p className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Phone className="h-4 w-4" />
                      {booking.customerPhone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Booking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Date</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {format(new Date(booking.date), "EEEE, MMMM dd, yyyy")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Time Slot</label>
                    <p className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Clock className="h-4 w-4" />
                      {booking.time}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Court</label>
                    <p className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <MapPin className="h-4 w-4" />
                      {booking.courtName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Duration</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{calculateDurationFromTimeString(booking.time)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Court Type</label>
                  <p className="text-lg text-gray-900 dark:text-gray-100">{booking.courtType}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Amount</label>
                    <p className="text-2xl font-bold text-green-600 text-gray-900 dark:text-gray-100">
                      PKR {booking.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Payment Status</label>
                    <div className="mt-1">{getPaymentBadge(booking.paymentStatus)}</div>
                  </div>
                </div>
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Payment Method</label>
                    <p className="text-lg text-gray-900 dark:text-gray-100">Credit Card</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Transaction ID</label>
                    <p className="text-lg font-mono text-sm text-gray-900 dark:text-gray-100">
                      TXN-{booking.bookingId.slice(1)}-2024
                    </p>
                  </div>
                </div> */}
              </CardContent>
            </Card>

            {/* Notes Section */}
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader>
                <CardTitle>Notes & Comments</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <Textarea
                  placeholder="Add notes about this booking..."
                  className="flex-1 min-h-[120px] max-h-[300px] resize-y"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <Button className="mt-3" size="sm" onClick={handleSaveNotes}>
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Status & Timeline */}
          <div className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">{getStatusBadge(booking.status)}</div>
                <Separator />
                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                    onClick={() => handleBookingStatusChange("Confirmed")}
                    disabled={isUpdatingStatus || booking.status === "Confirmed"}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </Button>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                    onClick={() => handleBookingStatusChange("Completed")}
                    disabled={isUpdatingStatus || booking.status === "Completed"}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Booking
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 bg-transparent disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                    onClick={() => handleBookingStatusChange("Cancelled")}
                    disabled={isUpdatingStatus || booking.status === "Cancelled" }
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Booking
                  </Button>
                  {isUpdatingStatus && (
                    <p className="text-sm text-gray-500 text-center">Updating booking status...</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">{getPaymentBadge(booking.paymentStatus)}</div>
                <Separator />
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full border-yellow-200 text-yellow-600 hover:bg-yellow-50 bg-transparent dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
                    onClick={() => handlePaymentStatusChange("Pending")}
                    disabled={isUpdatingPayment || booking.paymentStatus === "Pending"}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Mark Pending
                  </Button>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handlePaymentStatusChange("Paid")}
                    disabled={isUpdatingPayment || booking.paymentStatus === "Paid"}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Paid
                  </Button>
                  {isUpdatingPayment && (
                    <p className="text-sm text-gray-500 text-center">Updating payment status...</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Booking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookingTimeline.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full ${item.completed ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"}`}
                      >
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${item.completed ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}
                        >
                          {item.status}
                        </p>
                        {/* <p className="text-sm text-gray-500 dark:text-gray-400">{item.time}</p> */}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => {
                    if (onEditBooking) {
                      onClose() // Close the details modal first
                      onEditBooking(booking) // Then open edit modal
                    }
                  }}
                  disabled={isUpdatingStatus}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Booking
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Customer
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  Send Confirmation
                </Button>
                {/* <Button variant="outline" className="w-full justify-start bg-transparent">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Report Issue
                </Button> */}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
