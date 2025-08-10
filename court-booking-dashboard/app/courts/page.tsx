"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { CourtsContent } from "@/components/courts-content"
import { ProtectedRoute } from "@/components/protected-route"
import { BottomNav } from "@/components/bottom-nav"
import { ToastProvider } from "@/components/toast-provider"

export default function CourtsPage() {
  return (
    <ProtectedRoute>
      <ToastProvider>
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
            <AppSidebar activePage="courts" />
            <main className="flex-1 pt-16 md:pt-0">
              <CourtsContent />
            </main>
            <BottomNav activePage="courts" />
          </div>
        </SidebarProvider>
      </ToastProvider>
    </ProtectedRoute>
  )
}
