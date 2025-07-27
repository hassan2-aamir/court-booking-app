"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ProfileContent } from "@/components/profile-content"
import { ProtectedRoute } from "@/components/protected-route"
import { BottomNav } from "@/components/bottom-nav"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
          <AppSidebar activePage="profile" />
          <main className="flex-1 pt-16 md:pt-0">
            <ProfileContent />
          </main>
          <BottomNav activePage="profile" />
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
