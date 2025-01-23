'use client'

import { useSupabase } from '@/providers/supabase-provider'

export default function DashboardPage() {
  const { user } = useSupabase()

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user?.email}</h1>
      <p>This is your dashboard. Start by creating an agent or exploring existing ones.</p>
    </div>
  )
} 