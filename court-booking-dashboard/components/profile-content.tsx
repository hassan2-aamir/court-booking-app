"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"
import {
  Camera,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Eye,
  EyeOff,
  Shield,
  Save,
  Smartphone,
  Monitor,
  Trash2,
} from "lucide-react"

export function ProfileContent() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  // Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.name || "Muhammad Ahmed Khan",
    email: user?.email || "ahmed.manager@courtbooking.com",
    phone: "+92 300 1234567",
    department: "Operations",
    employeeId: "CM001",
  })

  // Security State
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  })

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    email: {
      newBookings: true,
      cancellations: true,
      dailyReports: false,
      systemUpdates: true,
    },
    whatsapp: {
      confirmations: true,
      reminders: true,
      alerts: false,
    },
    push: {
      browser: true,
      sound: false,
    },
  })

  // Appearance Settings State
  const [appearance, setAppearance] = useState({
    language: "english",
    timezone: "asia/karachi",
    dateFormat: "dd/mm/yyyy",
    currency: "pkr",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSavePersonalInfo = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast({
      title: "Profile updated",
      description: "Your personal information has been saved successfully.",
      type: "success",
      onClose: () => setIsLoading(false),
    })
  }

  const handleSaveSecurity = async () => {
    if (security.newPassword !== security.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirm password do not match.",
        type: "error",
        onClose: () => {},
      })
      return
    }

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast({
      title: "Security settings updated",
      description: "Your security settings have been saved successfully.",
      type: "success",
      onClose: () => {},
    })
    setSecurity({
      ...security,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setIsLoading(false)
  }

  const handleSaveNotifications = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast({
      title: "Notification preferences updated",
      description: "Your notification settings have been saved successfully.",
      type: "success",
      onClose: () => {},
    })
    setIsLoading(false)
  }

  const handleSaveAppearance = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast({
      title: "Appearance settings updated",
      description: "Your appearance preferences have been saved successfully.",
      type: "success",
      onClose: () => {},
    })
    setIsLoading(false)
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "" }
    if (password.length < 6) return { strength: 25, label: "Weak" }
    if (password.length < 8) return { strength: 50, label: "Fair" }
    if (password.length < 12) return { strength: 75, label: "Good" }
    return { strength: 100, label: "Strong" }
  }

  const passwordStrength = getPasswordStrength(security.newPassword)

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Avatar Section */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile Photo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                  <AvatarFallback className="bg-blue-600 text-white text-2xl">
                    {user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button size="sm" className="absolute bottom-0 right-0 rounded-full h-10 w-10 p-0">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user?.name}</h3>
                <Badge variant="secondary" className="mt-1 capitalize">
                  {user?.role}
                </Badge>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                Change Photo
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Bookings</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">1,247</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Active Courts</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">6</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Revenue This Month</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">PKR 125,000</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Member Since</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Jan 2024</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Settings Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="text-gray-700 dark:text-gray-300">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        value={personalInfo.fullName}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">Role</Label>
                      <div className="mt-1">
                        <Badge variant="secondary" className="capitalize">
                          {user?.role}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="department" className="text-gray-700 dark:text-gray-300">
                        Department
                      </Label>
                      <Input
                        id="department"
                        value={personalInfo.department}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, department: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="employeeId" className="text-gray-700 dark:text-gray-300">
                        Employee ID
                      </Label>
                      <Input
                        id="employeeId"
                        value={personalInfo.employeeId}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, employeeId: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSavePersonalInfo} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings Tab */}
            <TabsContent value="security">
              <div className="space-y-6">
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Change Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword" className="text-gray-700 dark:text-gray-300">
                        Current Password
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="currentPassword"
                          type={security.showCurrentPassword ? "text" : "password"}
                          value={security.currentPassword}
                          onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setSecurity({ ...security, showCurrentPassword: !security.showCurrentPassword })
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {security.showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300">
                        New Password
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="newPassword"
                          type={security.showNewPassword ? "text" : "password"}
                          value={security.newPassword}
                          onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setSecurity({ ...security, showNewPassword: !security.showNewPassword })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {security.showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {security.newPassword && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Password strength:</span>
                            <span
                              className={`font-medium ${
                                passwordStrength.strength < 50
                                  ? "text-red-600"
                                  : passwordStrength.strength < 75
                                    ? "text-yellow-600"
                                    : "text-green-600"
                              }`}
                            >
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                passwordStrength.strength < 50
                                  ? "bg-red-500"
                                  : passwordStrength.strength < 75
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                              style={{ width: `${passwordStrength.strength}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
                        Confirm New Password
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="confirmPassword"
                          type={security.showConfirmPassword ? "text" : "password"}
                          value={security.confirmPassword}
                          onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setSecurity({ ...security, showConfirmPassword: !security.showConfirmPassword })
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {security.showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleSaveSecurity} disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? "Updating..." : "Update Password"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Two-Factor Authentication
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Enable 2FA</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch
                        checked={security.twoFactorEnabled}
                        onCheckedChange={(checked) => setSecurity({ ...security, twoFactorEnabled: checked })}
                      />
                    </div>
                    {security.twoFactorEnabled && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            2FA Setup Required
                          </span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                          Scan the QR code with your authenticator app to complete setup.
                        </p>
                        <Button size="sm" variant="outline">
                          Setup Authenticator
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Active Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Monitor className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Current Session</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Chrome on Windows • Karachi, Pakistan
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Smartphone className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Mobile App</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">iPhone • Last active 2 hours ago</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Revoke
                        </Button>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button variant="destructive" size="sm">
                        Sign Out All Devices
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <div className="space-y-6">
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Email Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">New Bookings</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Get notified when new bookings are made
                        </p>
                      </div>
                      <Switch
                        checked={notifications.email.newBookings}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            email: { ...notifications.email, newBookings: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Booking Cancellations</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Get notified when bookings are cancelled
                        </p>
                      </div>
                      <Switch
                        checked={notifications.email.cancellations}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            email: { ...notifications.email, cancellations: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Daily Reports</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Receive daily summary reports</p>
                      </div>
                      <Switch
                        checked={notifications.email.dailyReports}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            email: { ...notifications.email, dailyReports: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">System Updates</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Get notified about system updates and maintenance
                        </p>
                      </div>
                      <Switch
                        checked={notifications.email.systemUpdates}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            email: { ...notifications.email, systemUpdates: checked },
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      WhatsApp Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Booking Confirmations</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Send WhatsApp confirmations to customers
                        </p>
                      </div>
                      <Switch
                        checked={notifications.whatsapp.confirmations}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            whatsapp: { ...notifications.whatsapp, confirmations: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Payment Reminders</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Send payment reminder messages</p>
                      </div>
                      <Switch
                        checked={notifications.whatsapp.reminders}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            whatsapp: { ...notifications.whatsapp, reminders: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Court Maintenance Alerts</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Get alerts about court maintenance schedules
                        </p>
                      </div>
                      <Switch
                        checked={notifications.whatsapp.alerts}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            whatsapp: { ...notifications.whatsapp, alerts: checked },
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Push Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Browser Notifications</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Show notifications in your browser</p>
                      </div>
                      <Switch
                        checked={notifications.push.browser}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            push: { ...notifications.push, browser: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Sound Notifications</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Play sound with notifications</p>
                      </div>
                      <Switch
                        checked={notifications.push.sound}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            push: { ...notifications.push, sound: checked },
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Appearance Settings Tab */}
            <TabsContent value="appearance">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Appearance Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">Theme</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="light"
                          name="theme"
                          checked={theme === "light"}
                          onChange={() => setTheme("light")}
                          className="text-blue-600"
                        />
                        <Label htmlFor="light" className="text-gray-700 dark:text-gray-300">
                          Light Mode
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="dark"
                          name="theme"
                          checked={theme === "dark"}
                          onChange={() => setTheme("dark")}
                          className="text-blue-600"
                        />
                        <Label htmlFor="dark" className="text-gray-700 dark:text-gray-300">
                          Dark Mode
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="system"
                          name="theme"
                          checked={theme === "system"}
                          onChange={() => setTheme("system")}
                          className="text-blue-600"
                        />
                        <Label htmlFor="system" className="text-gray-700 dark:text-gray-300">
                          System Preference
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="language" className="text-gray-700 dark:text-gray-300">
                        Language
                      </Label>
                      <Select
                        value={appearance.language}
                        onValueChange={(value) => setAppearance({ ...appearance, language: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="urdu">اردو (Urdu)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="timezone" className="text-gray-700 dark:text-gray-300">
                        Time Zone
                      </Label>
                      <Select
                        value={appearance.timezone}
                        onValueChange={(value) => setAppearance({ ...appearance, timezone: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asia/karachi">Asia/Karachi (PKT)</SelectItem>
                          <SelectItem value="asia/lahore">Asia/Lahore (PKT)</SelectItem>
                          <SelectItem value="asia/islamabad">Asia/Islamabad (PKT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="dateFormat" className="text-gray-700 dark:text-gray-300">
                        Date Format
                      </Label>
                      <Select
                        value={appearance.dateFormat}
                        onValueChange={(value) => setAppearance({ ...appearance, dateFormat: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="currency" className="text-gray-700 dark:text-gray-300">
                        Currency Display
                      </Label>
                      <Select
                        value={appearance.currency}
                        onValueChange={(value) => setAppearance({ ...appearance, currency: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pkr">PKR (Pakistani Rupee)</SelectItem>
                          <SelectItem value="usd">USD (US Dollar)</SelectItem>
                          <SelectItem value="eur">EUR (Euro)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveAppearance} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
