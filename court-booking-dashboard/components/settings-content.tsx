"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building, Clock, DollarSign, CalendarDays, Phone, Mail, Save, Plus, X } from "lucide-react"

export function SettingsContent() {
  const [activeTab, setActiveTab] = useState("general")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [newHolidayName, setNewHolidayName] = useState("")

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    businessName: "CourtBook Sports Complex",
    phone: "+92 300 1234567",
    email: "info@courtbook.com",
    businessHours: {
      start: "06:00",
      end: "23:00",
    },
    maxBookingsPerUser: 3,
    defaultDuration: "1",
    advanceBookingLimit: 30,
  })

  // Availability Settings State
  const [availabilitySettings, setAvailabilitySettings] = useState({
    defaultHours: {
      monday: { start: "08:00", end: "22:00", enabled: true },
      tuesday: { start: "08:00", end: "22:00", enabled: true },
      wednesday: { start: "08:00", end: "22:00", enabled: true },
      thursday: { start: "08:00", end: "22:00", enabled: true },
      friday: { start: "08:00", end: "22:00", enabled: true },
      saturday: { start: "07:00", end: "23:00", enabled: true },
      sunday: { start: "07:00", end: "23:00", enabled: true },
    },
    slotDuration: "60",
    breakTimes: [{ start: "13:00", end: "14:00", name: "Lunch Break" }],
    autoConfirm: true,
    sameDayBooking: true,
  })

  // Pricing Settings State
  const [pricingSettings, setPricingSettings] = useState({
    peakHours: [{ start: "18:00", end: "22:00", multiplier: 1.5, name: "Evening Peak" }],
    weekendMultiplier: 1.2,
    seasonalRules: [{ name: "Summer Special", startDate: "2024-06-01", endDate: "2024-08-31", multiplier: 0.9 }],
    regularCustomerDiscount: 10,
    cancellationPolicy: {
      freeUntil: 24,
      partialRefundUntil: 12,
      noRefundAfter: 2,
    },
  })

  const handleSaveSettings = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    // Show success notification
  }

  const daysOfWeek = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ]

  const holidays = [
    { date: "2024-03-23", name: "Pakistan Day" },
    { date: "2024-08-14", name: "Independence Day" },
    { date: "2024-12-25", name: "Christmas Day" },
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Configure your court booking system</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Availability
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="holidays" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Holidays
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card className="bg-card dark:bg-card-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={generalSettings.businessName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, businessName: e.target.value })}
                    className="bg-input dark:bg-input-dark"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={generalSettings.phone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, phone: e.target.value })}
                      className="pl-10 bg-input dark:bg-input-dark"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={generalSettings.email}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })}
                    className="pl-10 bg-input dark:bg-input-dark"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-card-dark">
            <CardHeader>
              <CardTitle>Booking Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxBookings">Max Bookings per User/Day</Label>
                  <Input
                    id="maxBookings"
                    type="number"
                    value={generalSettings.maxBookingsPerUser}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, maxBookingsPerUser: Number(e.target.value) })
                    }
                    min="1"
                    max="10"
                    className="bg-input dark:bg-input-dark"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultDuration">Default Booking Duration</Label>
                  <Select
                    value={generalSettings.defaultDuration}
                    onValueChange={(value) => setGeneralSettings({ ...generalSettings, defaultDuration: value })}
                  >
                    <SelectTrigger className="bg-input dark:bg-input-dark">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover dark:bg-popover-dark">
                      <SelectItem value="0.5">30 minutes</SelectItem>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="1.5">1.5 hours</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advanceLimit">Advance Booking Limit (days)</Label>
                  <Input
                    id="advanceLimit"
                    type="number"
                    value={generalSettings.advanceBookingLimit}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, advanceBookingLimit: Number(e.target.value) })
                    }
                    min="1"
                    max="365"
                    className="bg-input dark:bg-input-dark"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Settings Tab */}
        <TabsContent value="availability" className="space-y-6">
          <Card className="bg-card dark:bg-card-dark">
            <CardHeader>
              <CardTitle>Default Operating Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {daysOfWeek.map((day) => (
                <div key={day.key} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-20">
                    <Switch
                      checked={
                        availabilitySettings.defaultHours[day.key as keyof typeof availabilitySettings.defaultHours]
                          .enabled
                      }
                      onCheckedChange={(checked) =>
                        setAvailabilitySettings({
                          ...availabilitySettings,
                          defaultHours: {
                            ...availabilitySettings.defaultHours,
                            [day.key]: {
                              ...availabilitySettings.defaultHours[
                                day.key as keyof typeof availabilitySettings.defaultHours
                              ],
                              enabled: checked,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="w-24 font-medium">{day.label}</div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={
                        availabilitySettings.defaultHours[day.key as keyof typeof availabilitySettings.defaultHours]
                          .start
                      }
                      onChange={(e) =>
                        setAvailabilitySettings({
                          ...availabilitySettings,
                          defaultHours: {
                            ...availabilitySettings.defaultHours,
                            [day.key]: {
                              ...availabilitySettings.defaultHours[
                                day.key as keyof typeof availabilitySettings.defaultHours
                              ],
                              start: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-24 bg-input dark:bg-input-dark"
                      disabled={
                        !availabilitySettings.defaultHours[day.key as keyof typeof availabilitySettings.defaultHours]
                          .enabled
                      }
                    />
                    <span>to</span>
                    <Input
                      type="time"
                      value={
                        availabilitySettings.defaultHours[day.key as keyof typeof availabilitySettings.defaultHours].end
                      }
                      onChange={(e) =>
                        setAvailabilitySettings({
                          ...availabilitySettings,
                          defaultHours: {
                            ...availabilitySettings.defaultHours,
                            [day.key]: {
                              ...availabilitySettings.defaultHours[
                                day.key as keyof typeof availabilitySettings.defaultHours
                              ],
                              end: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-24 bg-input dark:bg-input-dark"
                      disabled={
                        !availabilitySettings.defaultHours[day.key as keyof typeof availabilitySettings.defaultHours]
                          .enabled
                      }
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-card-dark">
            <CardHeader>
              <CardTitle>Booking Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Auto-confirm bookings</Label>
                    <Switch
                      checked={availabilitySettings.autoConfirm}
                      onCheckedChange={(checked) =>
                        setAvailabilitySettings({ ...availabilitySettings, autoConfirm: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Allow same-day bookings</Label>
                    <Switch
                      checked={availabilitySettings.sameDayBooking}
                      onCheckedChange={(checked) =>
                        setAvailabilitySettings({ ...availabilitySettings, sameDayBooking: checked })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Slot Duration</Label>
                  <Select
                    value={availabilitySettings.slotDuration}
                    onValueChange={(value) => setAvailabilitySettings({ ...availabilitySettings, slotDuration: value })}
                  >
                    <SelectTrigger className="bg-input dark:bg-input-dark">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover dark:bg-popover-dark">
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Settings Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card className="bg-card dark:bg-card-dark">
            <CardHeader>
              <CardTitle>Peak Hours Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pricingSettings.peakHours.map((peak, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input
                    value={peak.name}
                    onChange={(e) => {
                      const updatedPeakHours = [...pricingSettings.peakHours]
                      updatedPeakHours[index] = { ...peak, name: e.target.value }
                      setPricingSettings({ ...pricingSettings, peakHours: updatedPeakHours })
                    }}
                    className="flex-1 bg-input dark:bg-input-dark"
                    placeholder="Peak period name"
                  />
                  <Input
                    type="time"
                    value={peak.start}
                    onChange={(e) => {
                      const updatedPeakHours = [...pricingSettings.peakHours]
                      updatedPeakHours[index] = { ...peak, start: e.target.value }
                      setPricingSettings({ ...pricingSettings, peakHours: updatedPeakHours })
                    }}
                    className="w-24 bg-input dark:bg-input-dark"
                  />
                  <span>to</span>
                  <Input
                    type="time"
                    value={peak.end}
                    onChange={(e) => {
                      const updatedPeakHours = [...pricingSettings.peakHours]
                      updatedPeakHours[index] = { ...peak, end: e.target.value }
                      setPricingSettings({ ...pricingSettings, peakHours: updatedPeakHours })
                    }}
                    className="w-24 bg-input dark:bg-input-dark"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={peak.multiplier}
                      onChange={(e) => {
                        const updatedPeakHours = [...pricingSettings.peakHours]
                        updatedPeakHours[index] = { ...peak, multiplier: Number.parseFloat(e.target.value) || 1 }
                        setPricingSettings({ ...pricingSettings, peakHours: updatedPeakHours })
                      }}
                      step="0.1"
                      min="1"
                      max="3"
                      className="w-20 bg-input dark:bg-input-dark"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">x</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const updatedPeakHours = pricingSettings.peakHours.filter((_, i) => i !== index)
                      setPricingSettings({ ...pricingSettings, peakHours: updatedPeakHours })
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Peak Hours
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-card-dark">
            <CardHeader>
              <CardTitle>Special Pricing Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Weekend Multiplier</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={pricingSettings.weekendMultiplier}
                      step="0.1"
                      min="1"
                      max="3"
                      className="bg-input dark:bg-input-dark"
                      onChange={(e) =>
                        setPricingSettings({ ...pricingSettings, weekendMultiplier: Number(e.target.value) })
                      }
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">x base price</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Regular Customer Discount</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={pricingSettings.regularCustomerDiscount}
                      min="0"
                      max="50"
                      className="bg-input dark:bg-input-dark"
                      onChange={(e) =>
                        setPricingSettings({ ...pricingSettings, regularCustomerDiscount: Number(e.target.value) })
                      }
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">% off</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-card-dark">
            <CardHeader>
              <CardTitle>Cancellation Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Free cancellation until</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={pricingSettings.cancellationPolicy.freeUntil}
                      min="1"
                      max="72"
                      className="bg-input dark:bg-input-dark"
                      onChange={(e) =>
                        setPricingSettings({
                          ...pricingSettings,
                          cancellationPolicy: {
                            ...pricingSettings.cancellationPolicy,
                            freeUntil: Number(e.target.value),
                          },
                        })
                      }
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">hours before</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>50% refund until</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={pricingSettings.cancellationPolicy.partialRefundUntil}
                      min="1"
                      max="24"
                      className="bg-input dark:bg-input-dark"
                      onChange={(e) =>
                        setPricingSettings({
                          ...pricingSettings,
                          cancellationPolicy: {
                            ...pricingSettings.cancellationPolicy,
                            partialRefundUntil: Number(e.target.value),
                          },
                        })
                      }
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">hours before</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>No refund after</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={pricingSettings.cancellationPolicy.noRefundAfter}
                      min="0"
                      max="12"
                      className="bg-input dark:bg-input-dark"
                      onChange={(e) =>
                        setPricingSettings({
                          ...pricingSettings,
                          cancellationPolicy: {
                            ...pricingSettings.cancellationPolicy,
                            noRefundAfter: Number(e.target.value),
                          },
                        })
                      }
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">hours before</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Holidays Tab */}
        <TabsContent value="holidays" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card dark:bg-card-dark">
              <CardHeader>
                <CardTitle>Add Holiday/Unavailable Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates || [])}
                  className="rounded-md border"
                />
                <div className="mt-4 space-y-2">
                  <Label>Holiday Name</Label>
                  <Input
                    placeholder="e.g., Eid ul-Fitr"
                    value={newHolidayName}
                    onChange={(e) => setNewHolidayName(e.target.value)}
                    className="bg-input dark:bg-input-dark"
                  />
                  <Button className="w-full mt-3">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Holiday
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card dark:bg-card-dark">
              <CardHeader>
                <CardTitle>Scheduled Holidays</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {holidays.map((holiday, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{holiday.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{holiday.date}</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Separator className="my-4" />

                <div className="space-y-3">
                  <h4 className="font-medium">Maintenance Schedule</h4>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                    <div>
                      <div className="font-medium">Court Maintenance</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Every Sunday 6:00 AM - 8:00 AM</div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Recurring</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
