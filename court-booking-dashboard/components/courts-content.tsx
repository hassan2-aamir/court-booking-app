"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddEditCourtModal } from "@/components/add-edit-court-modal"
import {
  getCourts,
  createCourt,
  updateCourt,
  CourtResponseDto,
  CreateCourtDto,
  UpdateCourtDto,
  getAvailabilityToday,
  deleteCourt
} from "../lib/api/courts"
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

// Court interface replaced by CourtResponseDto from API
type Court = CourtResponseDto & {
  status?: "Active" | "Inactive" 
  bookingsToday?: number
  isAvailableNow?: boolean
  description?: string
  image?: string
  operatingHours?: { start: string; end: string }
  availableDays?: string[]
}




export function CourtsContent() {
  const [courts, setCourts] = useState<Court[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getCourts()
      .then((data) => {
        Promise.all(
          data.map(async (court) => {
            let isAvailableNow = false;
            const todayAvailability = await getAvailabilityToday(court.id);
            try {
              // If any slot is available now, set true (customize as needed)
              isAvailableNow = Array.isArray(todayAvailability) && todayAvailability.length > 0;
            } catch {
              isAvailableNow = false;
            }
            // Extract operating hours for today from today's availability
            let operatingHours = undefined;
            if (Array.isArray(todayAvailability) && todayAvailability.length > 0) {
              const start = todayAvailability[0].startTime;
              const end = todayAvailability[todayAvailability.length - 1].endTime;
              operatingHours = { start, end };
            }

            return {
              ...court,
              status: court.isActive ? "Active" as "Active" : "Inactive" as "Inactive",
              bookingsToday: 0, // TODO: Replace with real data if available
              isAvailableNow,
              description: "", // Placeholder
              image: "/placeholder.svg?height=200&width=300", //TODO: Replace with real image if available
              operatingHours,
              availableDays: court.availability
              ? court.availability.map((a) =>
                a.dayOfWeek !== null ? a.dayOfWeek.toString() : ""
                )
              : [],
            };
          })
        ).then(setCourts);
        setLoading(false)
      })
      .catch((err) => {
        setError("Failed to load courts")
        setLoading(false)
      })
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Inactive":
        return <XCircle className="h-4 w-4 text-red-600" />
      //case "Maintenance":
      //  return <AlertTriangle className="h-4 w-4 text-yellow-600" />
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
      //case "Maintenance":
      //  return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Maintenance</Badge>
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


  const handleToggleStatus = async (courtId: string) => {
    const court = courts.find((c) => c.id === courtId);
    if (!court) return;
    const newStatus = court.status === "Active" ? false : true;
    try {
      const updated = await updateCourt(courtId, { isActive: newStatus } as UpdateCourtDto);
      setCourts(
        courts.map((c) =>
          c.id === courtId
            ? {
                ...c,
                ...updated,
                status: updated.isActive ? "Active" : "Inactive",
              }
            : c
        )
      );
    } catch (err) {
      setError("Failed to update court status");
    }
  } 

  const handleDeleteCourt = async (courtId: string) => {
    try {
      // You may want to add a confirmation dialog here
      await deleteCourt(courtId);
      setCourts(courts.filter((court) => court.id !== courtId));
    } catch (err) {
      setError("Failed to delete court");
    }
  }

  const handleSaveCourt = async (courtData: Partial<Court>) => {
    try {
      if (editingCourt) {
        // Update existing court
        const updated = await updateCourt(editingCourt.id, courtData as UpdateCourtDto)
        setCourts(courts.map((court) => (court.id === editingCourt.id ? { ...court, ...updated } : court)))
      } else {
        // Add new court
        const created = await createCourt(courtData as CreateCourtDto)
        setCourts([...courts, created])
      }
      setIsModalOpen(false)
    } catch (err) {
      setError("Failed to save court")
    }
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

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading courts...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : (
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
                <div className="absolute top-3 right-3">{getStatusBadge(court.status ?? "Inactive")}</div>
                <div className="absolute top-3 left-3">
                  <Badge className={`${getTypeColor(court.type)} hover:${getTypeColor(court.type)}`}>{court.type}</Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{court.name}</h3>
                  <div className="flex items-center gap-1">{getStatusIcon(court.status ?? "Inactive")}</div>
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
                  {court.operatingHours?.start} - {court.operatingHours?.end}
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
      )}

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
