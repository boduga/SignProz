'use client'

import { createContext, useContext } from 'react'
import { createBrowserClient } from '@/lib/supabase/browser'
import { useState, useEffect } from 'react'

interface SupabaseContextValue {
  supabase: ReturnType<typeof createBrowserClient> | null
  isLoading: boolean
}

const SupabaseContext = createContext<SupabaseContextValue | null>(null)

export function useSupabase() {
  const ctx = useContext(SupabaseContext)
  if (!ctx) throw new Error('useSupabase must be used within Providers')
  return ctx
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setSupabase(createBrowserClient())
    setIsLoading(false)
  }, [])

  return (
    <SupabaseContext.Provider value={{ supabase, isLoading }}>
      {children}
    </SupabaseContext.Provider>
  )
}
