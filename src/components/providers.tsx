'use client'

import { createContext, useContext } from 'react'
import { createBrowserClient } from '@/lib/supabase/browser'

interface SupabaseContextValue {
  supabase: ReturnType<typeof createBrowserClient>
}

const SupabaseContext = createContext<SupabaseContextValue | null>(null)

export function useSupabase() {
  const ctx = useContext(SupabaseContext)
  if (!ctx) throw new Error('useSupabase must be used within Providers')
  return ctx
}

export function Providers({ children }: { children: React.ReactNode }) {
  const supabase = createBrowserClient()

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  )
}
