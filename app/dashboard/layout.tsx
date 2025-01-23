'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/providers/supabase-provider'
import { SidebarNav } from "@/components/sidebar-nav";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useSupabase()

  // Don't render anything until we know the user is authenticated
  if (!user) return null

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <SidebarNav />
        <main className="flex-1 overflow-auto">
          <SidebarTrigger />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
} 