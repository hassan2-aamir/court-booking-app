"use client"

import { useState, useEffect } from 'react'
import { settingsApi, type BusinessSettings } from '@/lib/api/settings'

export function useBusinessSettings() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        setError(null)
        const businessSettings = await settingsApi.getBusinessSettings()
        setSettings(businessSettings)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch business settings')
        console.error('Error fetching business settings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    refetch: () => {
      const fetchSettings = async () => {
        try {
          setLoading(true)
          setError(null)
          const businessSettings = await settingsApi.getBusinessSettings()
          setSettings(businessSettings)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch business settings')
          console.error('Error fetching business settings:', err)
        } finally {
          setLoading(false)
        }
      }
      fetchSettings()
    }
  }
}