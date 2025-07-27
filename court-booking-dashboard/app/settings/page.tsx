"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SettingsContent } from "@/components/settings-content"
import { ProtectedRoute } from "@/components/protected-route"
import { BottomNav } from "@/components/bottom-nav"

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
          <AppSidebar activePage="settings" />
          <main className="flex-1 pt-16 md:pt-0">
            <SettingsContent />
          </main>
          <BottomNav activePage="settings" />
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
