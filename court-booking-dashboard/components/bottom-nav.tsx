"use client"

import { Calendar, LayoutDashboard, MapPin, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  activePage?: "dashboard" | "bookings" | "courts" | "settings" | "profile"
}

export function BottomNav({ activePage = "dashboard" }: BottomNavProps) {
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
      title: "Profile",
      url: "/profile",
      icon: User,
      isActive: activePage === "profile",
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      isActive: activePage === "settings",
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 md:hidden">
      <nav className="flex items-center justify-around py-2">
        {items.map((item) => (
          <a
            key={item.title}
            href={item.url}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors min-h-[44px] justify-center",
              item.isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400",
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.title}</span>
          </a>
        ))}
      </nav>
    </div>
  )
}
