'use client'

import { useEffect, useState } from 'react'
import { Card, CardBody } from '@heroui/card'
import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
import {
  IconWifi,
  IconWifiOff,
  IconRefresh,
  IconDownload,
} from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/database'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const [cachedWorkouts, setCachedWorkouts] = useState(0)
  const [cachedMedia, setCachedMedia] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    // Get cached data counts
    const getCachedData = async () => {
      try {
        const workoutCount = await db.workoutPlans.count()
        const mediaCount = await db.media.count()
        setCachedWorkouts(workoutCount)
        setCachedMedia(mediaCount)
      } catch (error) {
        console.error('Error getting cached data:', error)
      }
    }

    getCachedData()
  }, [])

  const handleRetry = () => {
    if (isOnline) {
      router.push('/')
    } else {
      window.location.reload()
    }
  }

  const handleGoToWorkouts = () => {
    router.push('/workouts')
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4'>
      <div className='max-w-md w-full space-y-6'>
        {/* Status Card */}
        <Card className='text-center'>
          <CardBody className='p-8'>
            <div className='flex justify-center mb-4'>
              {isOnline ? (
                <div className='p-4 bg-green-100 dark:bg-green-900/30 rounded-full'>
                  <IconWifi className='w-8 h-8 text-green-600 dark:text-green-400' />
                </div>
              ) : (
                <div className='p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full'>
                  <IconWifiOff className='w-8 h-8 text-orange-600 dark:text-orange-400' />
                </div>
              )}
            </div>

            <h1 className='text-2xl font-bold mb-2'>
              {isOnline ? 'Connection Restored!' : "You're Offline"}
            </h1>

            <p className='text-gray-600 dark:text-gray-400 mb-4'>
              {isOnline
                ? 'Your internet connection has been restored. You can now access all features.'
                : "Don't worry! You can still access your downloaded workouts and continue training."}
            </p>

            <Chip
              color={isOnline ? 'success' : 'warning'}
              variant='flat'
              startContent={
                isOnline ? <IconWifi size={16} /> : <IconWifiOff size={16} />
              }>
              {isOnline ? 'Online' : 'Offline Mode'}
            </Chip>
          </CardBody>
        </Card>

        {/* Cached Data Card */}
        {!isOnline && (
          <Card>
            <CardBody className='p-6'>
              <h2 className='text-lg font-semibold mb-4 flex items-center'>
                <IconDownload className='w-5 h-5 mr-2' />
                Available Offline
              </h2>

              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Workout Plans
                  </span>
                  <Chip size='sm' variant='flat' color='primary'>
                    {cachedWorkouts}
                  </Chip>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Media Files
                  </span>
                  <Chip size='sm' variant='flat' color='secondary'>
                    {cachedMedia}
                  </Chip>
                </div>
              </div>

              {cachedWorkouts > 0 && (
                <Button
                  color='primary'
                  variant='flat'
                  className='w-full mt-4'
                  onPress={handleGoToWorkouts}>
                  Browse Offline Workouts
                </Button>
              )}
            </CardBody>
          </Card>
        )}

        {/* Action Buttons */}
        <div className='flex flex-col gap-3'>
          <Button
            color={isOnline ? 'success' : 'primary'}
            variant={isOnline ? 'solid' : 'flat'}
            className='w-full'
            startContent={<IconRefresh />}
            onPress={handleRetry}>
            {isOnline ? 'Go to Dashboard' : 'Try Again'}
          </Button>

          {!isOnline && (
            <Button
              variant='light'
              className='w-full'
              onPress={handleGoToWorkouts}>
              Continue Offline
            </Button>
          )}
        </div>

        {/* Info */}
        <div className='text-center text-sm text-gray-500 dark:text-gray-400'>
          <p>
            {isOnline
              ? 'All features are now available'
              : 'Some features may be limited while offline'}
          </p>
        </div>
      </div>
    </div>
  )
}
