import { useEffect, useState } from 'react'

interface AppShellCacheStats {
  appShellCached: boolean
  staticAssetsCached: boolean
  pagesCached: number
  imagesCached: number
  totalCacheSize: number
}

export function useAppShellCache() {
  const [stats, setStats] = useState<AppShellCacheStats>({
    appShellCached: false,
    staticAssetsCached: false,
    pagesCached: 0,
    imagesCached: 0,
    totalCacheSize: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  // Get cache statistics from Cache API
  const getCacheStats = async () => {
    if (!('caches' in window)) return

    try {
      setIsLoading(true)
      const cacheNames = await caches.keys()

      let appShellCached = false
      let staticAssetsCached = false
      let pagesCached = 0
      let imagesCached = 0
      let totalCacheSize = 0

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()

        if (cacheName.includes('app-shell')) {
          appShellCached = keys.length > 0
        }

        if (cacheName.includes('static-assets')) {
          staticAssetsCached = keys.length > 0
        }

        if (cacheName.includes('pages')) {
          pagesCached += keys.length
        }

        if (cacheName.includes('images')) {
          imagesCached += keys.length
        }

        // Estimate cache size (rough calculation)
        totalCacheSize += keys.length * 50000 // Rough estimate: 50KB per entry
      }

      setStats({
        appShellCached,
        staticAssetsCached,
        pagesCached,
        imagesCached,
        totalCacheSize,
      })
    } catch (error) {
      console.error('Failed to get cache stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Preload critical app shell resources
  const preloadAppShell = async () => {
    if (!('caches' in window)) return false

    try {
      setIsLoading(true)
      const cache = await caches.open('app-shell-preload')

      const criticalResources = ['/', '/workouts', '/offline', '/manifest.json']

      await cache.addAll(criticalResources)
      await getCacheStats()
      return true
    } catch (error) {
      console.error('Failed to preload app shell:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Clear specific cache
  const clearCache = async (cachePattern?: string) => {
    if (!('caches' in window)) return false

    try {
      setIsLoading(true)
      const cacheNames = await caches.keys()

      const cachesToDelete = cachePattern
        ? cacheNames.filter((name) => name.includes(cachePattern))
        : cacheNames

      await Promise.all(cachesToDelete.map((name) => caches.delete(name)))
      await getCacheStats()
      return true
    } catch (error) {
      console.error('Failed to clear cache:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Check if app can work offline
  const checkOfflineCapability = async (): Promise<boolean> => {
    if (!('caches' in window)) return false

    try {
      const cache = await caches.open('app-shell')
      const homePageResponse = await cache.match('/')
      const workoutsPageResponse = await cache.match('/workouts')

      return !!(homePageResponse && workoutsPageResponse)
    } catch (error) {
      console.error('Failed to check offline capability:', error)
      return false
    }
  }

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get cache health score (0-100)
  const getCacheHealthScore = (): number => {
    let score = 0

    if (stats.appShellCached) score += 40
    if (stats.staticAssetsCached) score += 30
    if (stats.pagesCached > 0) score += 20
    if (stats.imagesCached > 0) score += 10

    return Math.min(score, 100)
  }

  useEffect(() => {
    getCacheStats()
  }, [])

  return {
    stats,
    isLoading,
    getCacheStats,
    preloadAppShell,
    clearCache,
    checkOfflineCapability,
    formatSize,
    getCacheHealthScore,
  }
}
