"use client"

import * as React from "react"
import { Court } from "@/lib/api/courts"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Edit,
  Eye,
  Settings,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react"

interface CourtContextMenuProps {
  children: React.ReactNode
  court: Court
  onSettingsClick: (court: Court) => void
  onEditClick: (court: Court) => void
  onScheduleClick: (court: Court) => void
  onToggleStatus: (courtId: string) => void
  onDelete: (courtId: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CourtContextMenu({
  children,
  court,
  onSettingsClick,
  onEditClick,
  onScheduleClick,
  onToggleStatus,
  onDelete,
  open,
  onOpenChange,
}: CourtContextMenuProps) {
  const handleSettingsClick = () => {
    console.log("Context menu: Settings clicked for court:", court.name)
    onSettingsClick(court)
  }

  const handleEditClick = () => {
    onEditClick(court)
  }

  const handleScheduleClick = () => {
    onScheduleClick(court)
  }

  const handleToggleStatus = () => {
    onToggleStatus(court.id)
  }

  const handleDelete = () => {
    onDelete(court.id)
  }

  return (
    <ContextMenu 
      open={open} 
      onOpenChange={onOpenChange}
      modal={false}
    >
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onSelect={handleSettingsClick}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={handleEditClick}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Court
        </ContextMenuItem>
        <ContextMenuItem onSelect={handleScheduleClick}>
          <Eye className="mr-2 h-4 w-4" />
          View Schedule
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={handleToggleStatus}>
          {court.status === "Active" ? (
            <>
              <ToggleRight className="mr-2 h-4 w-4" />
              Deactivate Court
            </>
          ) : (
            <>
              <ToggleLeft className="mr-2 h-4 w-4" />
              Activate Court
            </>
          )}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onSelect={handleDelete}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Court
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}