'use client'

import { useState, useEffect, useCallback } from 'react'

export interface OfflineAction {
  id: string
  type:
    | 'add_workout'
    | 'update_workout'
    | 'delete_workout'
    | 'add_media'
    | 'remove_media'
  data: any
  timestamp: number
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([])
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    // Load pending actions from localStorage
    const loadPendingActions = () => {
      try {
        const stored = localStorage.getItem('offline-pending-actions')
        if (stored) {
          setPendingActions(JSON.parse(stored))
        }
      } catch (error) {
        console.error('Error loading pending actions:', error)
      }
    }

    // Handle online/offline status
    const handleOnline = () => {
      setIsOnline(true)
      loadPendingActions()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial setup
    setIsOnline(navigator.onLine)
    loadPendingActions()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const addPendingAction = useCallback(
    (action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
      const newAction: OfflineAction = {
        ...action,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      }

      setPendingActions((prev) => {
        const updated = [...prev, newAction]
        localStorage.setItem('offline-pending-actions', JSON.stringify(updated))
        return updated
      })
    },
    []
  )

  const removePendingAction = useCallback((actionId: string) => {
    setPendingActions((prev) => {
      const updated = prev.filter((action) => action.id !== actionId)
      localStorage.setItem('offline-pending-actions', JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearPendingActions = useCallback(() => {
    setPendingActions([])
    localStorage.removeItem('offline-pending-actions')
  }, [])

  const syncPendingActions = useCallback(async () => {
    if (!isOnline || pendingActions.length === 0 || isSyncing) {
      return
    }

    setIsSyncing(true)

    try {
      // Process each pending action
      for (const action of pendingActions) {
        try {
          // Here you would normally sync with a backend API
          // For now, we'll just log the action as "synced"
          console.log('Syncing action:', action)

          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 100))

          // Remove the action after successful sync
          removePendingAction(action.id)
        } catch (error) {
          console.error('Error syncing action:', action, error)
          // Continue with other actions even if one fails
        }
      }
    } catch (error) {
      console.error('Error during sync:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline, pendingActions, isSyncing, removePendingAction])

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      // Delay sync to ensure connection is stable
      const timer = setTimeout(() => {
        syncPendingActions()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isOnline, pendingActions.length, syncPendingActions])

  return {
    isOnline,
    pendingActions,
    isSyncing,
    addPendingAction,
    removePendingAction,
    clearPendingActions,
    syncPendingActions,
    hasPendingActions: pendingActions.length > 0,
  }
}
