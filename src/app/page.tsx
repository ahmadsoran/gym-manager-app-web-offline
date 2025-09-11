'use client'

import { useEffect } from 'react'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
import { Link } from '@heroui/link'
import {
  IconPlus,
  IconBarbell,
  IconTrendingUp,
  IconTrash,
} from '@tabler/icons-react'
import { useWorkoutStore } from '@/store/workout-store'
import MobileHeader from '@/components/mobile-header'
import { addToast } from '@heroui/toast'

export default function DashboardPage() {
  const {
    workouts,
    loadWorkouts,
    getUniqueCategories,
    loadCategories,
    deleteCategory,
    isCategoryUsed,
  } = useWorkoutStore()

  useEffect(() => {
    loadWorkouts()
    loadCategories()
  }, [loadWorkouts, loadCategories])

  const totalWorkouts = workouts.length
  const recentWorkouts = workouts.slice(0, 3)
  const uniqueCategories = getUniqueCategories()
  const categoryStats = uniqueCategories.map((category) => ({
    category,
    count: workouts.filter((w) => w.category === category).length,
  }))

  return (
    <>
      <MobileHeader title='Dashboard' showBack={false} />
      <div className='space-y-4 p-4 pb-20'>
        {/* Welcome Section */}
        <div className='text-center mb-6'>
          <h1 className='text-2xl font-bold mb-1'>Welcome Back!</h1>
          <p className='text-default-500 text-sm'>
            Ready for your next workout?
          </p>
        </div>

        {/* Quick Actions */}
        <div className='grid grid-cols-2 gap-3 mb-6'>
          <Button
            as={Link}
            href='/workouts?action=create'
            color='primary'
            size='lg'
            className='h-20 flex-col gap-2'
            startContent={<IconPlus size={24} />}>
            <span className='text-sm font-medium'>Add Workout</span>
          </Button>
          <Button
            as={Link}
            href='/workouts'
            variant='flat'
            color='primary'
            size='lg'
            className='h-20 flex-col gap-2'
            startContent={<IconBarbell size={24} />}>
            <span className='text-sm font-medium'>View All</span>
          </Button>
        </div>

        {/* Stats Cards - Mobile Optimized */}
        <div className='grid grid-cols-2 gap-3 mb-6'>
          <Card className='bg-gradient-to-br from-primary-500/10 to-primary-600/10 border-primary-200/20'>
            <CardBody className='text-center p-4'>
              <IconBarbell className='text-primary mx-auto mb-2' size={28} />
              <p className='text-2xl font-bold text-primary'>{totalWorkouts}</p>
              <p className='text-xs text-default-500'>Total Workouts</p>
            </CardBody>
          </Card>

          <Card className='bg-gradient-to-br from-success-500/10 to-success-600/10 border-success-200/20'>
            <CardBody className='text-center p-4'>
              <IconTrendingUp className='text-success mx-auto mb-2' size={28} />
              <p className='text-2xl font-bold text-success'>
                {categoryStats.length}
              </p>
              <p className='text-xs text-default-500'>Categories</p>
            </CardBody>
          </Card>
        </div>
        {/* Recent Workouts */}
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex justify-between items-center w-full'>
              <h2 className='text-lg font-semibold'>Recent Workouts</h2>
              <Button
                as={Link}
                href='/workouts'
                variant='light'
                size='sm'
                className='text-xs'>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardBody className='pt-0'>
            {recentWorkouts.length === 0 ? (
              <div className='text-center py-8'>
                <div className='w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mx-auto mb-4'>
                  <IconBarbell className='text-default-400' size={32} />
                </div>
                <p className='text-default-500 mb-4 text-sm'>No workouts yet</p>
                <Button
                  as={Link}
                  href='/workouts?action=create'
                  color='primary'
                  size='sm'
                  startContent={<IconPlus size={16} />}>
                  Create Your First Workout
                </Button>
              </div>
            ) : (
              <div className='space-y-3'>
                {recentWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className='flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-100/10'>
                    <div className='flex-1'>
                      <h3 className='font-medium text-sm line-clamp-1'>
                        {workout.title}
                      </h3>
                      <div className='flex items-center gap-2 mt-1'>
                        <p className='text-xs text-default-500'>
                          {workout.sets.length} sets
                        </p>
                        {workout.category && (
                          <>
                            <span className='text-xs text-default-300'>•</span>
                            <Chip
                              size='sm'
                              variant='flat'
                              className='text-xs h-5'>
                              {workout.category}
                            </Chip>
                          </>
                        )}
                      </div>
                    </div>
                    <p className='text-xs text-default-400 ml-2'>
                      {new Date(workout.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
        {/* Category Overview */}
        {categoryStats.length > 0 && (
          <Card>
            <CardHeader className='pb-3'>
              <h2 className='text-lg font-semibold'>Categories</h2>
            </CardHeader>
            <CardBody className='pt-0'>
              <div className='grid grid-cols-2 gap-2'>
                {categoryStats.map(({ category, count }) => (
                  <div
                    key={category}
                    className='p-3 rounded-lg bg-primary/5 border border-primary/10 text-center relative group'>
                    <p className='font-medium text-sm text-primary'>
                      {category}
                    </p>
                    <p className='text-xs text-default-500 mt-1'>
                      {count} workout{count !== 1 ? 's' : ''}
                    </p>
                    {!isCategoryUsed(category) && (
                      <Button
                        isIconOnly
                        size='sm'
                        variant='light'
                        color='danger'
                        radius='full'
                        className='absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity'
                        onPress={async () => {
                          try {
                            await deleteCategory(category)
                          } catch (error) {
                            addToast({
                              title: 'Failed to delete category',
                              color: 'danger',
                            })
                          }
                        }}>
                        <IconTrash size={12} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </>
  )
}
