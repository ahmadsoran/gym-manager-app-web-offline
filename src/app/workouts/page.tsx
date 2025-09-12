import { Suspense } from 'react'
import { Spinner } from '@heroui/spinner'
import WorkoutContainer from '@/components/container/workouts-page-content'
import { generateMetadata } from '@/lib/metadata'

export const metadata = generateMetadata({
  title: 'Workouts',
  description:
    'Manage and track your workout plans, exercises, and fitness routines. Create custom workouts with sets, reps, and media.',
  keywords: [
    'workouts',
    'exercise plans',
    'fitness routines',
    'gym tracker',
    'workout planner',
  ],
  url: '/workouts',
})
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
      <WorkoutContainer />
    </Suspense>
  )
}
