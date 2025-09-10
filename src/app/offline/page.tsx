'use client'

import { Button } from '@heroui/button'
import { Card, CardBody } from '@heroui/card'
import { IconWifiOff, IconRefresh } from '@tabler/icons-react'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-background'>
      <Card className='w-full max-w-md'>
        <CardBody className='text-center space-y-6 p-8'>
          <div className='flex justify-center'>
            <div className='p-4 bg-danger/10 rounded-full'>
              <IconWifiOff size={48} className='text-danger' />
            </div>
          </div>

          <div className='space-y-2'>
            <h1 className='text-2xl font-bold'>You're Offline</h1>
            <p className='text-default-500'>
              No internet connection detected. Don't worry, you can still use
              the app with your previously saved workouts.
            </p>
          </div>

          <div className='space-y-3'>
            <Button
              color='primary'
              size='lg'
              className='w-full'
              startContent={<IconRefresh size={20} />}
              onPress={handleRetry}>
              Try Again
            </Button>

            <Button
              variant='light'
              size='lg'
              className='w-full'
              onPress={() => window.history.back()}>
              Go Back
            </Button>
          </div>

          <div className='text-sm text-default-400 space-y-1'>
            <p>Available offline features:</p>
            <ul className='text-left space-y-1'>
              <li>• View saved workouts</li>
              <li>• Add new workouts</li>
              <li>• Edit existing workouts</li>
              <li>• Take workout photos/videos</li>
            </ul>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
