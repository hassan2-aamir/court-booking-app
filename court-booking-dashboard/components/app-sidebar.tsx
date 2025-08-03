"use client"

import type * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { useTheme } from "@/components/theme-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutDashboard, Calendar, MapPin, Settings, User, LogOut, Sun, Moon, Monitor, ChevronUp, ChevronRight } from "lucide-react"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activePage?: string
}

const navigation = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    key: "dashboard",
  },
  {
    title: "Bookings",
    url: "/bookings",
    icon: Calendar,
    key: "bookings",
  },
  {
    title: "Courts",
    url: "/courts",
    icon: MapPin,
    key: "courts",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    key: "settings",
  },
]

export function AppSidebar({ activePage, ...props }: AppSidebarProps) {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()

  const handleSignOut = () => {
    signOut()
    router.push("/signin")
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <LayoutDashboard className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-gray-900 dark:text-gray-100">Court Manager</span>
            <span className="truncate text-xs text-gray-500 dark:text-gray-400">Professional System</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild isActive={activePage === item.key} tooltip={item.title}>
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                    <AvatarFallback className="rounded-lg bg-blue-600 text-white">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-gray-900 dark:text-gray-100">{user?.name}</span>
                    <span className="truncate text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-white dark:bg-gray-800"
                side="bottom"
                align="end"
                sideOffset={4}
                onCloseAutoFocus={(event) => {
                  // Prevent focus conflicts
                  event.preventDefault()
                }}
              >
                <DropdownMenuItem asChild>
                  <a href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                
                {/* Theme Selection Submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-2">
                    {getThemeIcon()}
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-40 bg-white dark:bg-gray-800">
                    <DropdownMenuItem
                      onClick={() => {
                        setTheme("light")
                      }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Sun className="h-4 w-4" />
                      <span>Light</span>
                      {theme === "light" && <div className="ml-auto h-2 w-2 rounded-full bg-blue-600" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setTheme("dark")
                      }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Moon className="h-4 w-4" />
                      <span>Dark</span>
                      {theme === "dark" && <div className="ml-auto h-2 w-2 rounded-full bg-blue-600" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setTheme("system")
                      }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Monitor className="h-4 w-4" />
                      <span>System</span>
                      {theme === "system" && <div className="ml-auto h-2 w-2 rounded-full bg-blue-600" />}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
