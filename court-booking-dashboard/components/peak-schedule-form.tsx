"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Save } from "lucide-react"
import { 
  PeakSchedule, 
  CreateCourtPeakScheduleDto, 
  UpdateCourtPeakScheduleDto 
} from "../lib/api/courts"

interface PeakScheduleFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateCourtPeakScheduleDto | UpdateCourtPeakScheduleDto) => Promise<void>
  peakSchedule?: PeakSchedule | null
  isEditing?: boolean
  loading?: boolean
  existingSchedules?: PeakSchedule[]
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
]

export function PeakScheduleForm({
  isOpen,
  onClose,
  onSubmit,
  peakSchedule,
  isEditing = false,
  loading = false,
  existingSchedules = []
}: PeakScheduleFormProps) {
  const [formData, setFormData] = useState({
    dayOfWeek: 0,
    startTime: "",
    endTime: "",
    price: 0
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens/closes or when editing different schedule
  useEffect(() => {
    if (isOpen) {
      if (isEditing && peakSchedule) {
        setFormData({
          dayOfWeek: peakSchedule.dayOfWeek,
          startTime: peakSchedule.startTime,
          endTime: peakSchedule.endTime,
          price: peakSchedule.price
        })
      } else {
        setFormData({
          dayOfWeek: 0,
          startTime: "",
          endTime: "",
          price: 0
        })
      }
      setErrors({})
    }
  }, [isOpen, isEditing, peakSchedule])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate day of week
    if (formData.dayOfWeek < 0 || formData.dayOfWeek > 6) {
      newErrors.dayOfWeek = "Please select a valid day of the week"
    }

    // Validate start time
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required"
    }

    // Validate end time
    if (!formData.endTime) {
      newErrors.endTime = "End time is required"
    }

    // Validate time range
    if (formData.startTime && formData.endTime) {
      const startTime = new Date(`2000-01-01T${formData.startTime}`)
      const endTime = new Date(`2000-01-01T${formData.endTime}`)
      
      if (startTime >= endTime) {
        newErrors.endTime = "End time must be after start time"
      }
    }

    // Validate price
    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0"
    }

    // Check for overlapping schedules
    if (formData.startTime && formData.endTime && formData.dayOfWeek >= 0) {
      const hasOverlap = existingSchedules.some(schedule => {
        // Skip the current schedule if editing
        if (isEditing && peakSchedule && schedule.id === peakSchedule.id) {
          return false
        }

        // Only check schedules for the same day
        if (schedule.dayOfWeek !== formData.dayOfWeek) {
          return false
        }

        const existingStart = new Date(`2000-01-01T${schedule.startTime}`)
        const existingEnd = new Date(`2000-01-01T${schedule.endTime}`)
        const newStart = new Date(`2000-01-01T${formData.startTime}`)
        const newEnd = new Date(`2000-01-01T${formData.endTime}`)

        // Check if times overlap
        return (newStart < existingEnd && newEnd > existingStart)
      })

      if (hasOverlap) {
        newErrors.timeOverlap = "This time slot overlaps with an existing peak schedule for the same day"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Failed to submit peak schedule:", error)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
    
    // Clear overlap error when time fields change
    if ((field === 'startTime' || field === 'endTime' || field === 'dayOfWeek') && errors.timeOverlap) {
      setErrors(prev => ({
        ...prev,
        timeOverlap: ""
      }))
    }
  }

  const formatTime = (timeString: string): string => {
    if (!timeString) return ""
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch {
      return timeString
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Peak Schedule" : "Add Peak Schedule"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Day of Week Selection */}
          <div className="space-y-2">
            <Label htmlFor="dayOfWeek">Day of Week</Label>
            <Select
              value={formData.dayOfWeek.toString()}
              onValueChange={(value) => handleInputChange('dayOfWeek', parseInt(value))}
            >
              <SelectTrigger className={errors.dayOfWeek ? "border-red-500" : ""}>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.dayOfWeek && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.dayOfWeek}
              </div>
            )}
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              className={errors.startTime ? "border-red-500" : ""}
            />
            {errors.startTime && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.startTime}
              </div>
            )}
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              className={errors.endTime ? "border-red-500" : ""}
            />
            {errors.endTime && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.endTime}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price (PKR)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={errors.price ? "border-red-500" : ""}
            />
            {errors.price && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.price}
              </div>
            )}
          </div>

          {/* Time Overlap Error */}
          {errors.timeOverlap && (
            <div className="flex items-center gap-2 text-sm text-red-600 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              {errors.timeOverlap}
            </div>
          )}

          {/* Preview */}
          {formData.startTime && formData.endTime && formData.price > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Preview:</strong> {DAYS_OF_WEEK[formData.dayOfWeek]?.label} from{" "}
                {formatTime(formData.startTime)} to {formatTime(formData.endTime)} at PKR{" "}
                {formData.price.toLocaleString()}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Update Schedule" : "Create Schedule"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}