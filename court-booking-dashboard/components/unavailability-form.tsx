"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { safeFocus } from "@/lib/focus-utils"

import {
  CourtUnavailability,
  CreateCourtUnavailabilityDto,
  UpdateCourtUnavailabilityDto
} from "@/lib/api/courts"

interface UnavailabilityFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateCourtUnavailabilityDto | UpdateCourtUnavailabilityDto) => Promise<void>
  unavailability?: CourtUnavailability | null
  isEditing?: boolean
  loading?: boolean
}

export function UnavailabilityForm({
  isOpen,
  onClose,
  onSubmit,
  unavailability,
  isEditing = false,
  loading = false
}: UnavailabilityFormProps) {
  const [formData, setFormData] = useState<CreateCourtUnavailabilityDto>({
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
    isRecurring: false
  })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isAllDay, setIsAllDay] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Refs for focus management
  const triggerButtonRef = useRef<HTMLButtonElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  // Reset form when modal opens/closes or unavailability changes
  useEffect(() => {
    if (isOpen) {
      if (isEditing && unavailability) {
        // Populate form with existing data
        const date = new Date(unavailability.date)
        setSelectedDate(date)
        setFormData({
          date: unavailability.date,
          startTime: unavailability.startTime || "",
          endTime: unavailability.endTime || "",
          reason: unavailability.reason,
          isRecurring: unavailability.isRecurring
        })
        setIsAllDay(!unavailability.startTime || !unavailability.endTime)
      } else {
        // Reset form for new unavailability
        setSelectedDate(undefined)
        setFormData({
          date: "",
          startTime: "",
          endTime: "",
          reason: "",
          isRecurring: false
        })
        setIsAllDay(false)
      }
      setErrors({})
      setCalendarOpen(false) // Reset calendar state
    }
  }, [isOpen, isEditing, unavailability])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!selectedDate) {
      newErrors.date = "Date is required"
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Reason is required"
    }

    if (!isAllDay) {
      if (!formData.startTime) {
        newErrors.startTime = "Start time is required"
      }
      if (!formData.endTime) {
        newErrors.endTime = "End time is required"
      }
      if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
        newErrors.endTime = "End time must be after start time"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    console.log('Date selected:', date) // Debug log

    setSelectedDate(date)
    setFormData(prev => ({
      ...prev,
      date: format(date, "yyyy-MM-dd")
    }))

    // Clear date error if it exists
    if (errors.date) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.date
        return newErrors
      })
    }

    // Close calendar after a short delay
    setTimeout(() => {
      setCalendarOpen(false)
      if (triggerButtonRef.current) {
        triggerButtonRef.current.focus()
      }
    }, 150)
  }

  const handleCalendarOpenChange = (open: boolean) => {
    console.log('Calendar open change:', open) // Debug log

    // Only allow closing if we explicitly set it to false
    if (!open && calendarOpen) {
      setCalendarOpen(false)
    } else if (open) {
      setCalendarOpen(true)
      // Focus management for when calendar opens
      setTimeout(() => {
        if (calendarRef.current) {
          const calendarElement = calendarRef.current.querySelector('button[name="day"]') as HTMLElement
          if (calendarElement) {
            calendarElement.focus()
          }
        }
      }, 100)
    }
  }

  // Prevent calendar clicks from bubbling up and closing the popover
  const handleCalendarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleAllDayChange = (checked: boolean) => {
    setIsAllDay(checked)
    if (checked) {
      setFormData(prev => ({
        ...prev,
        startTime: "",
        endTime: ""
      }))
      // Clear time-related errors
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.startTime
        delete newErrors.endTime
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const submitData = {
        ...formData,
        startTime: isAllDay ? undefined : formData.startTime,
        endTime: isAllDay ? undefined : formData.endTime
      }

      await onSubmit(submitData)
      onClose()
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  const handleClose = () => {
    setErrors({})
    setCalendarOpen(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Unavailability" : "Add Unavailability"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Popover open={calendarOpen} onOpenChange={handleCalendarOpenChange} modal={true}>
              <PopoverTrigger asChild>
                <Button
                  ref={triggerButtonRef}
                  variant="outline"
                  type="button"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground",
                    errors.date && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 z-[50]"
                align="start"
                onInteractOutside={(e) => {
                  // Prevent closing when clicking inside the calendar
                  e.preventDefault()
                }}
                onEscapeKeyDown={() => setCalendarOpen(false)}
              >
                <div ref={calendarRef} onClick={handleCalendarClick}>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return date < today
                    }}
                    initialFocus={true}
                    autoFocus={true}
                  />
                </div>
              </PopoverContent>
            </Popover>
            {errors.date && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.date}
              </div>
            )}
          </div>

          {/* All Day Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allDay"
              checked={isAllDay}
              onCheckedChange={handleAllDayChange}
            />
            <Label htmlFor="allDay" className="text-sm">
              All day unavailability
            </Label>
          </div>

          {/* Time Selection */}
          {!isAllDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className={errors.startTime ? "border-red-500" : ""}
                />
                {errors.startTime && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.startTime}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className={errors.endTime ? "border-red-500" : ""}
                />
                {errors.endTime && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.endTime}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for unavailability..."
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className={errors.reason ? "border-red-500" : ""}
              rows={3}
            />
            {errors.reason && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.reason}
              </div>
            )}
          </div>

          {/* Recurring Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="recurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, isRecurring: checked as boolean }))
              }
            />
            <Label htmlFor="recurring" className="text-sm">
              Recurring unavailability
            </Label>
          </div>
          {formData.isRecurring && (
            <p className="text-xs text-gray-500 ml-6">
              This unavailability will apply to the same date every week
            </p>
          )}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEditing ? "Update" : "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}