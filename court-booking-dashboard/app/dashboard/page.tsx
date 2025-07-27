"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardContent } from "@/components/dashboard-content"
import { ProtectedRoute } from "@/components/protected-route"
import { BottomNav } from "@/components/bottom-nav"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
          <AppSidebar activePage="dashboard" />
          <main className="flex-1 pt-16 md:pt-0">
            <DashboardContent />
          </main>
          <BottomNav activePage="dashboard" />
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
