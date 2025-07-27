"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, Calendar, LayoutDashboard, MapPin, Settings, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  activePage?: "dashboard" | "bookings" | "courts" | "settings" | "profile"
}

export function MobileNav({ activePage = "dashboard" }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  const items = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: activePage === "dashboard",
    },
    {
      title: "Bookings",
      url: "/bookings",
      icon: Calendar,
      isActive: activePage === "bookings",
    },
    {
      title: "Courts",
      url: "/courts",
      icon: MapPin,
      isActive: activePage === "courts",
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      isActive: activePage === "settings",
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
      isActive: activePage === "profile",
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[300px]">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CourtBook</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Management</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.title}>
                  <a
                    href={item.url}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                      "hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300",
                      item.isActive
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300",
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}
