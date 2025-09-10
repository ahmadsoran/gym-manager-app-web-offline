'use client'

import { AppShellStatus } from '@/components/app-shell-status'
import { ServiceWorkerStatus } from '@/components/service-worker-status'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Switch } from '@heroui/switch'
import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [useIndexedDBCache, setUseIndexedDBCache] = useState(false)

  useEffect(() => {
    // Check if IndexedDB cache is enabled
    const cacheStrategy = process.env.NEXT_PUBLIC_PWA_CACHE_STRATEGY
    setUseIndexedDBCache(cacheStrategy === 'indexeddb')
  }, [])

  return (
    <div className='container mx-auto p-4 space-y-6'>
      <div>
        <h1 className='text-2xl font-bold mb-2'>Settings</h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Manage your app settings and offline capabilities
        </p>
      </div>

      {/* Service Worker Status */}
      <ServiceWorkerStatus />

      {/* App Shell Status */}
      <AppShellStatus />

      <Card>
        <CardHeader>
          <h2 className='text-xl font-semibold'>Cache Strategy</h2>
        </CardHeader>
        <CardBody className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-medium'>YouTube-Style Offline</h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                App shell caching + IndexedDB for dynamic content
              </p>
            </div>
            <Switch isSelected={true} isDisabled />
          </div>
          <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
            <h4 className='font-medium text-blue-800 dark:text-blue-200 mb-2'>
              How it works:
            </h4>
            <ul className='text-sm text-blue-700 dark:text-blue-300 space-y-1'>
              <li>
                • <strong>App Shell:</strong> UI (HTML/CSS/JS) cached via
                Service Worker
              </li>
              <li>
                • <strong>Dynamic Data:</strong> Workouts & media stored in
                IndexedDB
              </li>
              <li>
                • <strong>Offline-First:</strong> App works even without
                internet
              </li>
              <li>
                • <strong>Background Sync:</strong> Data syncs when connection
                returns
              </li>
            </ul>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
