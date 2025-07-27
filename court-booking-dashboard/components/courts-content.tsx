"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddEditCourtModal } from "@/components/add-edit-court-modal"
import {
  Plus,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Eye,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react"

interface Court {
  id: string
  name: string
  type: "Tennis" | "Badminton" | "Basketball" | "Football" | "Squash"
  pricePerHour: number
  status: "Active" | "Inactive" | "Maintenance"
  bookingsToday: number
  isAvailableNow: boolean
  description: string
  image: string
  operatingHours: {
    start: string
    end: string
  }
  availableDays: string[]
}

const mockCourts: Court[] = [
  {
    id: "1",
    name: "Tennis Court A",
    type: "Tennis",
    pricePerHour: 1500,
    status: "Active",
    bookingsToday: 3,
    isAvailableNow: false,
    description: "Professional tennis court with synthetic surface",
    image: "/placeholder.svg?height=200&width=300",
    operatingHours: { start: "06:00", end: "22:00" },
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
  {
    id: "2",
    name: "Tennis Court B",
    type: "Tennis",
    pricePerHour: 1500,
    status: "Active",
    bookingsToday: 1,
    isAvailableNow: true,
    description: "Professional tennis court with clay surface",
    image: "/placeholder.svg?height=200&width=300",
    operatingHours: { start: "06:00", end: "22:00" },
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
  {
    id: "3",
    name: "Badminton Court 1",
    type: "Badminton",
    pricePerHour: 800,
    status: "Active",
    bookingsToday: 5,
    isAvailableNow: false,
    description: "Indoor badminton court with wooden flooring",
    image: "/placeholder.svg?height=200&width=300",
    operatingHours: { start: "07:00", end: "23:00" },
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
  {
    id: "4",
    name: "Badminton Court 2",
    type: "Badminton",
    pricePerHour: 800,
    status: "Maintenance",
    bookingsToday: 0,
    isAvailableNow: false,
    description: "Indoor badminton court - currently under maintenance",
    image: "/placeholder.svg?height=200&width=300",
    operatingHours: { start: "07:00", end: "23:00" },
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  },
  {
    id: "5",
    name: "Basketball Court",
    type: "Basketball",
    pricePerHour: 1200,
    status: "Active",
    bookingsToday: 2,
    isAvailableNow: true,
    description: "Full-size basketball court with professional hoops",
    image: "/placeholder.svg?height=200&width=300",
    operatingHours: { start: "06:00", end: "21:00" },
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
  {
    id: "6",
    name: "Football Ground",
    type: "Football",
    pricePerHour: 2500,
    status: "Active",
    bookingsToday: 0,
    isAvailableNow: true,
    description: "Full-size football ground with natural grass",
    image: "/placeholder.svg?height=200&width=300",
    operatingHours: { start: "08:00", end: "20:00" },
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
  {
    id: "7",
    name: "Squash Court 1",
    type: "Squash",
    pricePerHour: 1000,
    status: "Active",
    bookingsToday: 4,
    isAvailableNow: false,
    description: "Professional squash court with glass walls",
    image: "/placeholder.svg?height=200&width=300",
    operatingHours: { start: "07:00", end: "22:00" },
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  },
  {
    id: "8",
    name: "Squash Court 2",
    type: "Squash",
    pricePerHour: 1000,
    status: "Inactive",
    bookingsToday: 0,
    isAvailableNow: false,
    description: "Secondary squash court - temporarily closed",
    image: "/placeholder.svg?height=200&width=300",
    operatingHours: { start: "07:00", end: "22:00" },
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  },
]

export function CourtsContent() {
  const [courts, setCourts] = useState<Court[]>(mockCourts)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Inactive":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "Maintenance":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "Inactive":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>
      case "Maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Maintenance</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Tennis":
        return "bg-blue-100 text-blue-800"
      case "Badminton":
        return "bg-green-100 text-green-800"
      case "Basketball":
        return "bg-orange-100 text-orange-800"
      case "Football":
        return "bg-purple-100 text-purple-800"
      case "Squash":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAddCourt = () => {
    setEditingCourt(null)
    setIsModalOpen(true)
  }

  const handleEditCourt = (court: Court) => {
    setEditingCourt(court)
    setIsModalOpen(true)
  }

  const handleToggleStatus = (courtId: string) => {
    setCourts(
      courts.map((court) =>
        court.id === courtId
          ? {
              ...court,
              status: court.status === "Active" ? "Inactive" : "Active",
            }
          : court,
      ),
    )
  }

  const handleSaveCourt = (courtData: Partial<Court>) => {
    if (editingCourt) {
      // Update existing court
      setCourts(courts.map((court) => (court.id === editingCourt.id ? { ...court, ...courtData } : court)))
    } else {
      // Add new court
      const newCourt: Court = {
        id: Date.now().toString(),
        name: courtData.name || "",
        type: courtData.type || "Tennis",
        pricePerHour: courtData.pricePerHour || 0,
        status: "Active",
        bookingsToday: 0,
        isAvailableNow: true,
        description: courtData.description || "",
        image: "/placeholder.svg?height=200&width=300",
        operatingHours: courtData.operatingHours || { start: "08:00", end: "20:00" },
        availableDays: courtData.availableDays || [],
      }
      setCourts([...courts, newCourt])
    }
    setIsModalOpen(false)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Courts Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your sports courts and facilities</p>
        </div>
        <Button onClick={handleAddCourt} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Court
        </Button>
      </div>

      {/* Courts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courts.map((court) => (
          <Card
            key={court.id}
            className="hover:shadow-lg transition-shadow duration-200 overflow-hidden dark:bg-gray-800 dark:hover:shadow-none"
          >
            <div className="relative">
              <img
                src={court.image || "/placeholder.svg"}
                alt={court.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=200&width=300"
                }}
              />
              <div className="absolute top-3 right-3">{getStatusBadge(court.status)}</div>
              <div className="absolute top-3 left-3">
                <Badge className={`${getTypeColor(court.type)} hover:${getTypeColor(court.type)}`}>{court.type}</Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{court.name}</h3>
                <div className="flex items-center gap-1">{getStatusIcon(court.status)}</div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-300">{court.bookingsToday} bookings today</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className={`${court.isAvailableNow ? "text-green-600" : "text-red-600"}`}>
                    {court.isAvailableNow ? "Available now" : "Occupied"}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-xl font-bold text-green-600">PKR {court.pricePerHour.toLocaleString()}</span>
                <span className="text-gray-500 dark:text-gray-400">/hour</span>
              </div>

              {/* Operating Hours */}
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Hours: </span>
                {court.operatingHours.start} - {court.operatingHours.end}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => handleEditCourt(court)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Eye className="h-3 w-3 mr-1" />
                  Schedule
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`px-3 ${court.status === "Active" ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"} bg-transparent`}
                  onClick={() => handleToggleStatus(court.id)}
                >
                  {court.status === "Active" ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Court Modal */}
      <AddEditCourtModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCourt}
        court={editingCourt}
      />
    </div>
  )
}
