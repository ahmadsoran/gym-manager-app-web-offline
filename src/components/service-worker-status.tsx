'use client'

import { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Chip } from '@heroui/chip'
import { Button } from '@heroui/button'

export function ServiceWorkerStatus() {
  const [swStatus, setSWStatus] = useState<
    'loading' | 'active' | 'not-supported' | 'error'
  >('loading')
  const [cacheStats, setCacheStats] = useState<{
    names: string[]
    totalSize: number
  }>({ names: [], totalSize: 0 })

  useEffect(() => {
    checkServiceWorker()
    getCacheInfo()
  }, [])

  const checkServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration && registration.active) {
          setSWStatus('active')
        } else {
          setSWStatus('error')
        }
      } catch (error) {
        setSWStatus('error')
      }
    } else {
      setSWStatus('not-supported')
    }
  }

  const getCacheInfo = async () => {
    if ('caches' in window) {
      try {
        const names = await caches.keys()
        let totalSize = 0

        for (const name of names) {
          const cache = await caches.open(name)
          const keys = await cache.keys()
          totalSize += keys.length
        }

        setCacheStats({ names, totalSize })
      } catch (error) {
        console.error('Error getting cache info:', error)
      }
    }
  }

  const testOffline = async () => {
    try {
      // Try to fetch a page that should be cached
      const response = await fetch('/offline')
      if (response.ok) {
        alert('✅ Offline page is accessible!')
      } else {
        alert('❌ Offline page not found')
      }
    } catch (error) {
      alert('❌ Network request failed: ' + error)
    }
  }

  const testFallback = async () => {
    try {
      // Test fallback by trying to fetch a non-existent page that should fallback to /offline
      const response = await fetch('/non-existent-page-test-123')
      const text = await response.text()
      if (text.includes('Offline Page') || text.includes('offline')) {
        alert('✅ Fallback working! Non-existent page returns offline content')
      } else {
        alert(
          '❌ Fallback not working - got: ' +
            response.status +
            ' ' +
            text.substring(0, 100)
        )
      }
    } catch (error) {
      alert('❌ Fallback test failed: ' + error)
    }
  }

  const clearAllCaches = async () => {
    if ('caches' in window) {
      try {
        const names = await caches.keys()
        await Promise.all(names.map((name) => caches.delete(name)))
        await getCacheInfo()
        alert('✅ All caches cleared')
      } catch (error) {
        alert('❌ Error clearing caches: ' + error)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <h3 className='text-lg font-semibold'>Service Worker Status</h3>
      </CardHeader>
      <CardBody className='space-y-4'>
        <div className='flex items-center justify-between'>
          <span>Service Worker:</span>
          <Chip
            color={
              swStatus === 'active'
                ? 'success'
                : swStatus === 'error'
                  ? 'danger'
                  : swStatus === 'not-supported'
                    ? 'warning'
                    : 'default'
            }
            variant='flat'>
            {swStatus === 'active'
              ? 'Active'
              : swStatus === 'error'
                ? 'Error'
                : swStatus === 'not-supported'
                  ? 'Not Supported'
                  : 'Loading'}
          </Chip>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span>Cache Stores:</span>
            <span>{cacheStats.names.length}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span>Total Cached Items:</span>
            <span>{cacheStats.totalSize}</span>
          </div>
        </div>

        {cacheStats.names.length > 0 && (
          <div>
            <h4 className='font-medium mb-2'>Cache Names:</h4>
            <div className='flex flex-wrap gap-1'>
              {cacheStats.names.map((name) => (
                <Chip key={name} size='sm' variant='flat'>
                  {name}
                </Chip>
              ))}
            </div>
          </div>
        )}

        <div className='flex gap-2'>
          <Button size='sm' onPress={checkServiceWorker}>
            Refresh Status
          </Button>
          <Button size='sm' color='primary' onPress={testOffline}>
            Test Offline
          </Button>
          <Button size='sm' color='secondary' onPress={testFallback}>
            Test Fallback
          </Button>
          <Button
            size='sm'
            color='danger'
            variant='flat'
            onPress={clearAllCaches}>
            Clear Caches
          </Button>
        </div>

        <div className='text-sm text-gray-600 dark:text-gray-400'>
          <p>
            <strong>How to test:</strong>
          </p>
          <ol className='list-decimal list-inside space-y-1 mt-2'>
            <li>Ensure Service Worker is "Active"</li>
            <li>Browse the app to cache pages</li>
            <li>Go to Network tab → Set to "Offline"</li>
            <li>Refresh the page - should load from cache</li>
          </ol>
        </div>
      </CardBody>
    </Card>
  )
}
