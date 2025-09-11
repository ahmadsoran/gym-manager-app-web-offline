import { Suspense } from 'react'
import { Spinner } from '@heroui/spinner'
import WorkoutsPageContent from '@/components/workouts/workouts-page-content'

function WorkoutsPageFallback() {
  return (
    <div className='flex justify-center items-center min-h-screen'>
      <Spinner size='lg' />
    </div>
  )
}

export default function WorkoutsPage() {
  return (
    <Suspense fallback={<WorkoutsPageFallback />}>
      <WorkoutsPageContent />
    </Suspense>
  )
}
