"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, Clock } from "lucide-react"


import { updateCourt, createCourt, Court } from "../lib/api/courts"


interface AddEditCourtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (courtData: Court) => void;
  court: Court | null;
}

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function AddEditCourtModal({ isOpen, onClose, onSave, court }: AddEditCourtModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "Tennis" as Court["type"],
    pricePerHour: 0,
    description: "",
    isActive: true,
    operatingHours: {
      start: "08:00",
      end: "20:00",
    },
    availableDays: [] as string[],
    slotDuration: 60, // minutes, default
    maxBookingsPerUserPerDay: 1, // default
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
  if (court) {
    // Map court.availability (array of {dayOfWeek}) to day names for availableDays
    const dayNumberToName = [
      "Sunday",
      "Monday",
      "Tuesday", 
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    let availableDays: string[] = [];
    
    if (Array.isArray((court as any).availability)) {
      availableDays = (court as any).availability
        .map((a: any) => {
          // Check for both number and null, and ensure it's a valid day
          if (typeof a.dayOfWeek === "number" && a.dayOfWeek >= 0 && a.dayOfWeek <= 6) {
            return dayNumberToName[a.dayOfWeek];
          }
          return null;
        })
        .filter((d: string | null) => d !== null) as string[];
    } 
    
    // Always check for availableDays as fallback, regardless of availability array
    if (availableDays.length === 0 && Array.isArray(court.availableDays)) {
      availableDays = court.availableDays;
    }
    
    // Debug logging to see what's happening
    console.log('Court availability:', (court as any).availability);
    console.log('Court availableDays:', court.availableDays);
    console.log('Mapped availableDays:', availableDays);
    
    setFormData({
      name: court.name,
      type: court.type,
      pricePerHour: court.pricePerHour,
      description: court.description ?? "",
      isActive: court.status === "Active",
      operatingHours: court.operatingHours ?? { start: "08:00", end: "20:00" },
      availableDays,
      slotDuration: court.slotDuration ?? 60,
      maxBookingsPerUserPerDay: court.maxBookingsPerUserPerDay ?? 1,
    });
  } else {
    setFormData({
      name: "",
      type: "Tennis",
      pricePerHour: 0,
      description: "",
      isActive: true,
      operatingHours: {
        start: "",
        end: "",
      },
      availableDays: [],
      slotDuration: 60,
      maxBookingsPerUserPerDay: 1,
    });
  }
  }, [court, isOpen]);

  // In add-edit-court-modal.tsx, modify the handleSubmit function:

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (isLoading) return;
  setIsLoading(true);

  try {
    let result;
    const dayNameToNumber: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };
    
    const availability = formData.availableDays.map((day) => ({
      dayOfWeek: dayNameToNumber[day],
      startTime: formData.operatingHours.start,
      endTime: formData.operatingHours.end,
      slotDuration: formData.slotDuration ?? 60,
      maxBookingsPerUserPerDay: formData.maxBookingsPerUserPerDay ?? 1,
    }));
    
    if (availability.length === 0) {
      throw new Error("At least one available day must be selected");
    }

    if (court) {
      // Update
      result = await updateCourt(court.id, {
        name: formData.name,
        type: formData.type,
        pricePerHour: formData.pricePerHour,
        description: formData.description,
        isActive: formData.isActive,
        availability,
      });
    } else {
      // Create
      result = await createCourt({
        name: formData.name,
        type: formData.type,
        pricePerHour: formData.pricePerHour,
        description: formData.description,
        isActive: formData.isActive,
        availability,
      });
    }

    // WORKAROUND: Since API doesn't return availability, we'll add it manually
    const enhancedResult = {
      ...result,
      availability: availability,
      availableDays: formData.availableDays,
      operatingHours: formData.operatingHours,
      slotDuration: formData.slotDuration,
      maxBookingsPerUserPerDay: formData.maxBookingsPerUserPerDay
    };

    onSave(enhancedResult);
    onClose();
  } catch (err) {
    console.error(err);
  }
  setIsLoading(false);
}

  const handleDayToggle = (day: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        availableDays: [...formData.availableDays, day],
      })
    } else {
      setFormData({
        ...formData,
        availableDays: formData.availableDays.filter((d) => d !== day),
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {court ? "Edit Court" : "Add New Court"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Court Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Tennis Court A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Court Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: Court["type"]) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tennis">Tennis</SelectItem>
                  <SelectItem value="Badminton">Badminton</SelectItem>
                  <SelectItem value="Basketball">Basketball</SelectItem>
                  <SelectItem value="Football">Football</SelectItem>
                  <SelectItem value="Squash">Squash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price per Hour (PKR) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.pricePerHour}
                onChange={(e) => setFormData({ ...formData, pricePerHour: Number(e.target.value) })}
                placeholder="1500"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label className="text-sm text-gray-900 dark:text-gray-100">
                  {formData.isActive ? "Active" : "Inactive"}
                </Label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the court..."
              rows={3}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Court Image</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <Button type="button" variant="outline" size="sm">
                  Choose File
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG up to 10MB</p>
            </div>
          </div>

          {/* Operating Hours and Slot Settings */}
          <div className="space-y-4">
            <Label className="text-base font-medium text-gray-900 dark:text-gray-100">Operating Hours & Slot Settings</Label>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.operatingHours.start}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        operatingHours: { ...formData.operatingHours, start: e.target.value },
                      })
                    }
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.operatingHours.end}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        operatingHours: { ...formData.operatingHours, end: e.target.value },
                      })
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="slotDuration">Slot Duration (minutes)</Label>
                <Input
                  id="slotDuration"
                  type="number"
                  min={5}
                  step={5}
                  value={formData.slotDuration}
                  onChange={(e) => setFormData({ ...formData, slotDuration: Number(e.target.value) })}
                  placeholder="60"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxBookings">Max Bookings/User/Day</Label>
                <Input
                  id="maxBookings"
                  type="number"
                  min={1}
                  step={1}
                  value={formData.maxBookingsPerUserPerDay}
                  onChange={(e) => setFormData({ ...formData, maxBookingsPerUserPerDay: Number(e.target.value) })}
                  placeholder="1"
                  required
                />
              </div>
            </div>
          </div>
          {/* Available Days */}
          <div className="space-y-4">
            <Label className="text-base font-medium text-gray-900 dark:text-gray-100">Available Days</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {daysOfWeek.map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={day}
                    checked={formData.availableDays.includes(day)}
                    onCheckedChange={(checked) => handleDayToggle(day, checked as boolean)}
                  />
                  <Label htmlFor={day} className="text-sm text-gray-900 dark:text-gray-100">
                    {day.slice(0, 3)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Saving..." : court ? "Update Court" : "Add Court"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
