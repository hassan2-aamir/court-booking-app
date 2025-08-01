"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar } from "lucide-react"
import { Court } from "../lib/api/courts"

interface CourtScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  court: Court | null
}

export function CourtScheduleModal({ isOpen, onClose, court }: CourtScheduleModalProps) {
  if (!court) return null

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {court.name} - Schedule
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          

          {/* Available Days */}
          <div>
            <div className="grid grid-cols-1 gap-2">
              {daysOfWeek.map((day) => {
                const isAvailable = court.availableDays?.includes(day) || false
                return (
                  <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{day}</span>
                    {isAvailable ? (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Available
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {court.operatingHours?.start || "08:00"} - {court.operatingHours?.end || "20:00"}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        Closed
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Slot Duration:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {court.slotDuration || 60} minutes
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Max bookings per user/day:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {court.maxBookingsPerUserPerDay || 1}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Price per hour:</span>
                <span className="font-medium text-green-600">
                  PKR {court.pricePerHour.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
