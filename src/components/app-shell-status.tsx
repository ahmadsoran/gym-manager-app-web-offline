'use client'

import { useAppShellCache } from '@/hooks/use-app-shell-cache'
import { Button } from '@heroui/button'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Chip } from '@heroui/chip'
import { Progress } from '@heroui/progress'
import { Spinner } from '@heroui/spinner'
import {
  IconShield,
  IconShieldCheck,
  IconDownload,
  IconTrash,
} from '@tabler/icons-react'

export function AppShellStatus() {
  const {
    stats,
    isLoading,
    getCacheStats,
    preloadAppShell,
    clearCache,
    checkOfflineCapability,
    formatSize,
    getCacheHealthScore,
  } = useAppShellCache()

  const healthScore = getCacheHealthScore()
  const isHealthy = healthScore >= 70

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'success'
    if (score >= 70) return 'warning'
    return 'danger'
  }

  const handlePreloadAppShell = async () => {
    const success = await preloadAppShell()
    if (success) {
      console.log('App shell preloaded successfully')
    }
  }

  const handleClearAllCache = async () => {
    const success = await clearCache()
    if (success) {
      console.log('All cache cleared successfully')
    }
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div className='flex items-center gap-2'>
          {isHealthy ? (
            <IconShieldCheck className='w-6 h-6 text-green-600' />
          ) : (
            <IconShield className='w-6 h-6 text-orange-600' />
          )}
          <div>
            <h3 className='text-lg font-semibold'>App Shell Cache</h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Offline capability status
            </p>
          </div>
        </div>
        <Chip color={getHealthColor(healthScore)} variant='flat'>
          {healthScore}% Ready
        </Chip>
      </CardHeader>

      <CardBody className='space-y-6'>
        {isLoading ? (
          <div className='flex justify-center'>
            <Spinner size='sm' />
          </div>
        ) : (
          <>
            {/* Health Score */}
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm font-medium'>Offline Readiness</span>
                <span className='text-sm text-gray-600'>{healthScore}%</span>
              </div>
              <Progress
                value={healthScore}
                color={getHealthColor(healthScore)}
                className='w-full'
              />
            </div>

            {/* Cache Status Grid */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>App Shell</span>
                  <Chip
                    size='sm'
                    color={stats.appShellCached ? 'success' : 'default'}
                    variant='flat'>
                    {stats.appShellCached ? 'Cached' : 'Not Cached'}
                  </Chip>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Static Assets</span>
                  <Chip
                    size='sm'
                    color={stats.staticAssetsCached ? 'success' : 'default'}
                    variant='flat'>
                    {stats.staticAssetsCached ? 'Cached' : 'Not Cached'}
                  </Chip>
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Pages</span>
                  <Chip size='sm' variant='flat' color='primary'>
                    {stats.pagesCached}
                  </Chip>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Images</span>
                  <Chip size='sm' variant='flat' color='secondary'>
                    {stats.imagesCached}
                  </Chip>
                </div>
              </div>
            </div>

            {/* Total Cache Size */}
            <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium'>Total Cache Size</span>
                <span className='text-lg font-semibold'>
                  {formatSize(stats.totalCacheSize)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-2'>
              <Button
                size='sm'
                variant='flat'
                onPress={getCacheStats}
                isLoading={isLoading}>
                Refresh
              </Button>
              <Button
                size='sm'
                variant='flat'
                color='primary'
                startContent={<IconDownload size={16} />}
                onPress={handlePreloadAppShell}
                isLoading={isLoading}>
                Preload Shell
              </Button>
              <Button
                size='sm'
                variant='flat'
                color='danger'
                startContent={<IconTrash size={16} />}
                onPress={handleClearAllCache}
                isLoading={isLoading}>
                Clear Cache
              </Button>
            </div>

            {/* Recommendations */}
            {!isHealthy && (
              <div className='bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4'>
                <h4 className='font-medium text-orange-800 dark:text-orange-200 mb-2'>
                  Improve Offline Performance
                </h4>
                <ul className='text-sm text-orange-700 dark:text-orange-300 space-y-1'>
                  {!stats.appShellCached && (
                    <li>
                      • Click "Preload Shell" to cache essential app files
                    </li>
                  )}
                  {!stats.staticAssetsCached && (
                    <li>• Browse the app to cache static assets</li>
                  )}
                  {stats.pagesCached === 0 && (
                    <li>• Visit pages to cache them for offline use</li>
                  )}
                </ul>
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  )
}
