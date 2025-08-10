"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Settings, 
  Calendar, 
  DollarSign, 
  Clock, 
  Plus,
  Edit,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { 
  Court, 
  CourtSettings, 
  CourtUnavailability, 
  PeakSchedule,
  CreateCourtUnavailabilityDto,
  UpdateCourtUnavailabilityDto,
  CreateCourtPeakScheduleDto,
  UpdateCourtPeakScheduleDto,
  getCourtSettings,
  updateAdvancedBookingLimit,
  createCourtUnavailability,
  updateCourtUnavailability,
  deleteCourtUnavailability,
  createCourtPeakSchedule,
  updateCourtPeakSchedule,
  deleteCourtPeakSchedule
} from "../lib/api/courts"
import { useToast } from "@/components/toast-provider"
import { safeFocus } from "@/lib/focus-utils"
import { UnavailabilityForm } from "./unavailability-form"
import { PeakScheduleForm } from "./peak-schedule-form"

interface CourtSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  court: Court | null
  onSettingsUpdate?: (courtId: string, settings: CourtSettings) => void
}

export function CourtSettingsModal({ 
  isOpen, 
  onClose, 
  court, 
  onSettingsUpdate 
}: CourtSettingsModalProps) {
  const [settings, setSettings] = useState<CourtSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("booking-limit")
  const { addToast } = useToast()

  // Form states for different sections
  const [bookingLimitForm, setBookingLimitForm] = useState({
    advancedBookingLimit: 30
  })
  const [bookingLimitError, setBookingLimitError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Unavailabilities management state
  const [unavailabilityFormOpen, setUnavailabilityFormOpen] = useState(false)
  const [editingUnavailability, setEditingUnavailability] = useState<CourtUnavailability | null>(null)
  const [unavailabilityLoading, setUnavailabilityLoading] = useState(false)
  const [deletingUnavailabilityId, setDeletingUnavailabilityId] = useState<string | null>(null)

  // Peak schedules management state
  const [peakScheduleFormOpen, setPeakScheduleFormOpen] = useState(false)
  const [editingPeakSchedule, setEditingPeakSchedule] = useState<PeakSchedule | null>(null)
  const [peakScheduleLoading, setPeakScheduleLoading] = useState(false)
  const [deletingPeakScheduleId, setDeletingPeakScheduleId] = useState<string | null>(null)

  // Load settings when modal opens
  useEffect(() => {
    if (isOpen && court) {
      loadCourtSettings()
    }
  }, [isOpen, court])

  // Reset form when settings change
  useEffect(() => {
    if (settings) {
      setBookingLimitForm({
        advancedBookingLimit: settings.advancedBookingLimit
      })
      setBookingLimitError(null)
      setHasUnsavedChanges(false)
    }
  }, [settings])

  // Clean up when modal closes to prevent focus conflicts
  useEffect(() => {
    if (!isOpen) {
      const timeout = setTimeout(() => {
        setSettings(null)
        setError(null)
        setActiveTab("booking-limit")
        setBookingLimitError(null)
        setHasUnsavedChanges(false)
        setUnavailabilityFormOpen(false)
        setEditingUnavailability(null)
        setUnavailabilityLoading(false)
        setDeletingUnavailabilityId(null)
        setPeakScheduleFormOpen(false)
        setEditingPeakSchedule(null)
        setPeakScheduleLoading(false)
        setDeletingPeakScheduleId(null)
      }, 200) // match Dialog close animation duration
      return () => clearTimeout(timeout)
    }
  }, [isOpen])

  const loadCourtSettings = async () => {
    if (!court) return
    
    setLoading(true)
    setError(null)
    
    try {
      const courtSettings = await getCourtSettings(court.id)
      // Settings are already normalized by the API function
      const normalizedSettings = courtSettings
      setSettings(normalizedSettings)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load court settings"
      setError(errorMessage)
      addToast({
        type: "error",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const validateBookingLimit = (value: number): string | null => {
    if (isNaN(value)) {
      return "Please enter a valid number"
    }
    if (value < 1) {
      return "Booking limit must be at least 1 day"
    }
    if (value > 365) {
      return "Booking limit cannot exceed 365 days"
    }
    if (!Number.isInteger(value)) {
      return "Booking limit must be a whole number"
    }
    return null
  }

  const handleBookingLimitChange = (value: string) => {
    const numValue = value === "" ? 0 : Number(value)
    setBookingLimitForm({
      ...bookingLimitForm,
      advancedBookingLimit: numValue
    })
    
    // Check if value has changed from saved value
    if (settings) {
      setHasUnsavedChanges(numValue !== settings.advancedBookingLimit)
    }
    
    // Clear error when user starts typing
    if (bookingLimitError) {
      setBookingLimitError(null)
    }
    
    // Real-time validation feedback
    if (value !== "" && numValue > 0) {
      const validationError = validateBookingLimit(numValue)
      if (validationError) {
        setBookingLimitError(validationError)
      }
    }
  }

  const handleSaveBookingLimit = async () => {
    if (!court) return
    
    // Validate input before saving
    const validationError = validateBookingLimit(bookingLimitForm.advancedBookingLimit)
    if (validationError) {
      setBookingLimitError(validationError)
      return
    }
    
    setSaving(true)
    setBookingLimitError(null)
    
    try {
      await updateAdvancedBookingLimit(court.id, bookingLimitForm.advancedBookingLimit)
      
      // Update local settings state
      if (settings) {
        const updatedSettings = {
          ...settings,
          advancedBookingLimit: bookingLimitForm.advancedBookingLimit
        }
        setSettings(updatedSettings)
        onSettingsUpdate?.(court.id, updatedSettings)
      }
      
      setHasUnsavedChanges(false)
      addToast({
        type: "success",
        title: "Success",
        description: "Advanced booking limit updated successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update booking limit"
      setBookingLimitError(errorMessage)
      addToast({
        type: "error",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setSettings(null)
    setError(null)
    setActiveTab("booking-limit")
    setBookingLimitError(null)
    setHasUnsavedChanges(false)
    setUnavailabilityFormOpen(false)
    setEditingUnavailability(null)
    setUnavailabilityLoading(false)
    setDeletingUnavailabilityId(null)
    setPeakScheduleFormOpen(false)
    setEditingPeakSchedule(null)
    setPeakScheduleLoading(false)
    setDeletingPeakScheduleId(null)
    onClose()
  }

  // Unavailabilities management functions
  const handleAddUnavailability = () => {
    setEditingUnavailability(null)
    setUnavailabilityFormOpen(true)
  }

  const handleEditUnavailability = (unavailability: CourtUnavailability) => {
    setEditingUnavailability(unavailability)
    setUnavailabilityFormOpen(true)
  }

  const handleUnavailabilitySubmit = async (data: CreateCourtUnavailabilityDto | UpdateCourtUnavailabilityDto) => {
    if (!court || !settings) return

    setUnavailabilityLoading(true)
    
    try {
      let updatedUnavailability: CourtUnavailability

      if (editingUnavailability) {
        // Update existing unavailability
        updatedUnavailability = await updateCourtUnavailability(
          court.id, 
          editingUnavailability.id, 
          data as UpdateCourtUnavailabilityDto
        )
        
        // Update local state
        const currentUnavailabilities = settings.unavailabilities || []
        const updatedUnavailabilities = currentUnavailabilities.map(u => 
          u.id === editingUnavailability.id ? updatedUnavailability : u
        )
        const updatedSettings = { ...settings, unavailabilities: updatedUnavailabilities }
        setSettings(updatedSettings)
        onSettingsUpdate?.(court.id, updatedSettings)

        addToast({
          type: "success",
          title: "Unavailability Updated",
          description: "The unavailability has been updated successfully",
        })
      } else {
        // Create new unavailability
        updatedUnavailability = await createCourtUnavailability(
          court.id, 
          data as CreateCourtUnavailabilityDto
        )
        // Update local state
        const currentUnavailabilities = settings.unavailabilities || []
        const updatedUnavailabilities = [...currentUnavailabilities, updatedUnavailability]
        const updatedSettings = { ...settings, unavailabilities: updatedUnavailabilities }
        setSettings(updatedSettings)
        onSettingsUpdate?.(court.id, updatedSettings)

        addToast({
          type: "success",
          title: "Unavailability Created",
          description: "The unavailability has been created successfully",
        })
      }

      setUnavailabilityFormOpen(false)
      setEditingUnavailability(null)
    } catch (err) {
      let errorMessage = "Failed to save unavailability"
      
      if (err instanceof Error) {
        errorMessage = err.message
        // Handle specific error cases
        if (errorMessage.includes("overlap") || errorMessage.includes("conflict")) {
          errorMessage = "This unavailability conflicts with existing bookings or schedules"
        } else if (errorMessage.includes("validation")) {
          errorMessage = "Please check your input and try again"
        } else if (errorMessage.includes("unauthorized")) {
          errorMessage = "You don't have permission to modify this court's settings"
        }
      }
      
      addToast({
        type: "error",
        title: editingUnavailability ? "Update Failed" : "Creation Failed",
        description: errorMessage,
      })
    } finally {
      setUnavailabilityLoading(false)
    }
  }

  const handleDeleteUnavailability = async (unavailabilityId: string) => {
    if (!court || !settings) return

    setDeletingUnavailabilityId(unavailabilityId)
    
    try {
      await deleteCourtUnavailability(court.id, unavailabilityId)
      
      // Update local state
      const currentUnavailabilities = settings.unavailabilities || []
      const updatedUnavailabilities = currentUnavailabilities.filter(u => u.id !== unavailabilityId)
      const updatedSettings = { ...settings, unavailabilities: updatedUnavailabilities }
      setSettings(updatedSettings)
      onSettingsUpdate?.(court.id, updatedSettings)

      addToast({
        type: "success",
        title: "Success",
        description: "Unavailability deleted successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete unavailability"
      addToast({
        type: "error",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setDeletingUnavailabilityId(null)
    }
  }

  // Peak schedules management functions
  const handleAddPeakSchedule = () => {
    setEditingPeakSchedule(null)
    setPeakScheduleFormOpen(true)
  }

  const handleEditPeakSchedule = (peakSchedule: PeakSchedule) => {
    setEditingPeakSchedule(peakSchedule)
    setPeakScheduleFormOpen(true)
  }

  const handlePeakScheduleSubmit = async (data: CreateCourtPeakScheduleDto | UpdateCourtPeakScheduleDto) => {
    if (!court || !settings) return

    setPeakScheduleLoading(true)
    
    try {
      let updatedPeakSchedule: PeakSchedule

      if (editingPeakSchedule) {
        // Update existing peak schedule
        updatedPeakSchedule = await updateCourtPeakSchedule(
          court.id, 
          editingPeakSchedule.id, 
          data as UpdateCourtPeakScheduleDto
        )
        
        // Update local state
        const currentPeakSchedules = settings.peakSchedules || []
        const updatedPeakSchedules = currentPeakSchedules.map(p => 
          p.id === editingPeakSchedule.id ? updatedPeakSchedule : p
        )
        const updatedSettings = { ...settings, peakSchedules: updatedPeakSchedules }
        setSettings(updatedSettings)
        onSettingsUpdate?.(court.id, updatedSettings)

        addToast({
          type: "success",
          title: "Peak Schedule Updated",
          description: "The peak schedule has been updated successfully",
        })
      } else {
        // Create new peak schedule
        updatedPeakSchedule = await createCourtPeakSchedule(
          court.id, 
          data as CreateCourtPeakScheduleDto
        )
        
        // Update local state
        const currentPeakSchedules = settings.peakSchedules || []
        const updatedPeakSchedules = [...currentPeakSchedules, updatedPeakSchedule]
        const updatedSettings = { ...settings, peakSchedules: updatedPeakSchedules }
        setSettings(updatedSettings)
        onSettingsUpdate?.(court.id, updatedSettings)

        addToast({
          type: "success",
          title: "Peak Schedule Created",
          description: "The peak schedule has been created successfully",
        })
      }

      setPeakScheduleFormOpen(false)
      setEditingPeakSchedule(null)
    } catch (err) {
      let errorMessage = "Failed to save peak schedule"
      
      if (err instanceof Error) {
        errorMessage = err.message
        // Handle specific error cases
        if (errorMessage.includes("overlap") || errorMessage.includes("conflict")) {
          errorMessage = "This time slot overlaps with an existing peak schedule"
        } else if (errorMessage.includes("validation")) {
          errorMessage = "Please check your input and try again"
        } else if (errorMessage.includes("unauthorized")) {
          errorMessage = "You don't have permission to modify this court's settings"
        }
      }
      
      addToast({
        type: "error",
        title: editingPeakSchedule ? "Update Failed" : "Creation Failed",
        description: errorMessage,
      })
    } finally {
      setPeakScheduleLoading(false)
    }
  }

  const handleDeletePeakSchedule = async (peakScheduleId: string) => {
    if (!court || !settings) return

    setDeletingPeakScheduleId(peakScheduleId)
    
    try {
      await deleteCourtPeakSchedule(court.id, peakScheduleId)
      
      // Update local state
      const currentPeakSchedules = settings.peakSchedules || []
      const updatedPeakSchedules = currentPeakSchedules.filter(p => p.id !== peakScheduleId)
      const updatedSettings = { ...settings, peakSchedules: updatedPeakSchedules }
      setSettings(updatedSettings)
      onSettingsUpdate?.(court.id, updatedSettings)

      addToast({
        type: "success",
        title: "Success",
        description: "Peak schedule deleted successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete peak schedule"
      addToast({
        type: "error",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setDeletingPeakScheduleId(null)
    }
  }

  const getDayName = (dayOfWeek: number): string => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[dayOfWeek] || "Unknown"
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (timeString: string): string => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // Group peak schedules by day for better organization
  const groupedPeakSchedules = (settings?.peakSchedules || []).reduce((acc, schedule) => {
    const dayName = getDayName(schedule.dayOfWeek)
    if (!acc[dayName]) {
      acc[dayName] = []
    }
    acc[dayName].push(schedule)
    return acc
  }, {} as Record<string, PeakSchedule[]>)

  // Sort schedules within each day by start time
  Object.keys(groupedPeakSchedules).forEach(day => {
    groupedPeakSchedules[day].sort((a, b) => a.startTime.localeCompare(b.startTime))
  })

  if (!court) return null

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={handleClose}
      modal={true}
    >
      <DialogContent 
        className="max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800"
        onCloseAutoFocus={(event) => {
          // Prevent default and handle focus manually to avoid aria-hidden conflicts
          event.preventDefault()
          // Return focus to the court card after modal closes
          safeFocus(
            document.querySelector(`[data-court-id="${court?.id}"]`) as HTMLElement,
            100
          )
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Court Settings - {court.name}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading settings...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={loadCourtSettings} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="booking-limit" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Booking Limit
              </TabsTrigger>
              <TabsTrigger value="unavailabilities" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Unavailabilities
              </TabsTrigger>
              <TabsTrigger value="peak-schedules" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Peak Pricing
              </TabsTrigger>
            </TabsList>

            {/* Advanced Booking Limit Tab */}
            <TabsContent value="booking-limit" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Advanced Booking Limit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Set how many days in advance customers can book this court. Enter a value between 1 and 365 days.
                  </p>
                  
                  <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="bookingLimit">Days in advance</Label>
                      <Input
                        id="bookingLimit"
                        type="number"
                        min="1"
                        max="365"
                        step="1"
                        value={bookingLimitForm.advancedBookingLimit || ""}
                        onChange={(e) => handleBookingLimitChange(e.target.value)}
                        placeholder="Enter days (1-365)"
                        className={bookingLimitError ? "border-red-500 focus:border-red-500" : ""}
                        disabled={saving}
                      />
                      {bookingLimitError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                          <AlertCircle className="h-4 w-4" />
                          {bookingLimitError}
                        </div>
                      )}
                    </div>
                    <Button 
                      onClick={handleSaveBookingLimit}
                      disabled={saving || !!bookingLimitError || !hasUnsavedChanges}
                      className={`${hasUnsavedChanges && !bookingLimitError ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'} disabled:opacity-50`}
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {settings && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      Current limit: {settings.advancedBookingLimit} days
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Court Unavailabilities Tab */}
            <TabsContent value="unavailabilities" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Court Unavailabilities
                      <span className="text-sm font-normal text-gray-500">
                        ({settings?.unavailabilities?.length || 0} items)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={loadCourtSettings}
                        disabled={loading}
                      >
                        {loading ? "Loading..." : "Refresh"}
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleAddUnavailability}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Unavailability
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {settings?.unavailabilities && Array.isArray(settings.unavailabilities) && settings.unavailabilities.length > 0 ? (
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {settings.unavailabilities.map((unavailability) => (
                          <div
                            key={unavailability.id}
                            className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-700"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">
                                  {formatDate(unavailability.date)}
                                </Badge>
                                {unavailability.isRecurring && (
                                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                                    Recurring
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {unavailability.startTime && unavailability.endTime ? (
                                  <>
                                    {formatTime(unavailability.startTime)} - {formatTime(unavailability.endTime)}
                                  </>
                                ) : (
                                  <span className="font-medium">All day</span>
                                )}
                                {unavailability.reason && (
                                  <span className="ml-2">• {unavailability.reason}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditUnavailability(unavailability)}
                                disabled={unavailabilityLoading}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleDeleteUnavailability(unavailability.id)}
                                disabled={deletingUnavailabilityId === unavailability.id}
                              >
                                {deletingUnavailabilityId === unavailability.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No unavailabilities set for this court</p>
                      <p className="text-sm">Click "Add Unavailability" to block specific dates or times</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Peak Schedules Tab */}
            <TabsContent value="peak-schedules" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Peak Pricing Schedules
                      <span className="text-sm font-normal text-gray-500">
                        ({settings?.peakSchedules?.length || 0} items)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={loadCourtSettings}
                        disabled={loading}
                      >
                        {loading ? "Loading..." : "Refresh"}
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleAddPeakSchedule}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Peak Schedule
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {settings?.peakSchedules && Array.isArray(settings.peakSchedules) && settings.peakSchedules.length > 0 ? (
                    <ScrollArea className="h-64">
                      <div className="space-y-4">
                        {Object.keys(groupedPeakSchedules).length > 0 ? (
                          Object.entries(groupedPeakSchedules).map(([dayName, schedules]) => (
                            <div key={dayName} className="space-y-2">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {dayName}
                                <span className="text-sm font-normal text-gray-500">
                                  ({schedules.length} schedule{schedules.length !== 1 ? 's' : ''})
                                </span>
                              </h4>
                              <div className="space-y-2 ml-6">
                                {schedules.map((schedule) => (
                                  <div
                                    key={schedule.id}
                                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-700"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                          PKR {schedule.price.toLocaleString()}
                                        </Badge>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleEditPeakSchedule(schedule)}
                                        disabled={peakScheduleLoading}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => handleDeletePeakSchedule(schedule.id)}
                                        disabled={deletingPeakScheduleId === schedule.id}
                                      >
                                        {deletingPeakScheduleId === schedule.id ? (
                                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                                        ) : (
                                          <Trash2 className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No peak pricing schedules organized</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No peak pricing schedules set for this court</p>
                      <p className="text-sm">Click "Add Peak Schedule" to set higher prices for busy periods</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <Separator />
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleClose} className="bg-transparent">
            Close
          </Button>
        </div>
      </DialogContent>

      {/* Unavailability Form Modal */}
      <UnavailabilityForm
        isOpen={unavailabilityFormOpen}
        onClose={() => {
          setUnavailabilityFormOpen(false)
          setEditingUnavailability(null)
        }}
        onSubmit={handleUnavailabilitySubmit}
        unavailability={editingUnavailability}
        isEditing={!!editingUnavailability}
        loading={unavailabilityLoading}
      />

      {/* Peak Schedule Form Modal */}
      <PeakScheduleForm
        isOpen={peakScheduleFormOpen}
        onClose={() => {
          setPeakScheduleFormOpen(false)
          setEditingPeakSchedule(null)
        }}
        onSubmit={handlePeakScheduleSubmit}
        peakSchedule={editingPeakSchedule}
        isEditing={!!editingPeakSchedule}
        loading={peakScheduleLoading}
        existingSchedules={settings?.peakSchedules || []}
      />
    </Dialog>
  )
}