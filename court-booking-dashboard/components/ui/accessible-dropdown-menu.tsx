"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

const AccessibleDropdownMenu = DropdownMenuPrimitive.Root

const AccessibleDropdownMenuTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Trigger
    ref={ref}
    className={cn(
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      className
    )}
    {...props}
  >
    {children}
  </DropdownMenuPrimitive.Trigger>
))
AccessibleDropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName

const AccessibleDropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      onCloseAutoFocus={(event) => {
        // Prevent the default behavior and manually focus the trigger
        event.preventDefault()
        
        // Find the trigger button and focus it
        const target = event.currentTarget as HTMLElement
        const root = target?.closest('[data-radix-dropdown-menu-root]')
        const trigger = root?.querySelector('[data-radix-dropdown-menu-trigger]') as HTMLElement
        if (trigger) {
          trigger.focus()
        }
      }}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
AccessibleDropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const AccessibleDropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
AccessibleDropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

export {
  AccessibleDropdownMenu,
  AccessibleDropdownMenuTrigger,
  AccessibleDropdownMenuContent,
  AccessibleDropdownMenuItem,
}
