'use client'
import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
import { Link } from '@heroui/link'
import { Input } from '@heroui/input'
import { Spinner } from '@heroui/spinner'
import {
  IconPlus,
  IconBarbell,
  IconSearch,
  IconEdit,
  IconTrash,
  IconEye,
} from '@tabler/icons-react'
import { useWorkoutStore } from '@//store/workout-store'
import MobileHeader from '@//components/mobile-header'
import { useEffect, useState } from 'react'
import { Card, CardBody } from '@heroui/card'

export default function WorkoutsPage() {
  const { workouts, isLoading, getUniqueCategories } = useWorkoutStore()

  const loadWorkouts = useWorkoutStore((state) => state.loadWorkouts)
  const loadCategories = useWorkoutStore((state) => state.loadCategories)
  const deleteWorkout = useWorkoutStore((state) => state.deleteWorkout)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadWorkouts()
    loadCategories()
  }, []) // Remove dependencies to prevent infinite loops

  const uniqueCategories = getUniqueCategories()

  const filteredWorkouts = workouts.filter((workout) => {
    const matchesSearch =
      workout.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || workout.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this workout?')) {
      await deleteWorkout(id)
    }
  }

  const headerActions = (
    <Button as={Link} href='/workouts/add' color='primary' size='sm' isIconOnly>
      <IconPlus size={18} />
    </Button>
  )

  if (isLoading) {
    return (
      <>
        <MobileHeader title='Workouts' actions={headerActions} />
        <div className='flex justify-center items-center min-h-64'>
          <Spinner size='lg' />
        </div>
      </>
    )
  }

  return (
    <>
      <MobileHeader title='Workouts' actions={headerActions} />
      <div className='space-y-4 p-4 pb-20'>
        {/* Search Bar - Prominent on Mobile */}
        <div className='sticky top-0 z-10 bg-background/80 backdrop-blur-md rounded-lg p-1'>
          <Input
            placeholder='Search workouts...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<IconSearch size={18} className='text-default-400' />}
            classNames={{
              base: 'shadow-sm',
              input: 'text-sm',
            }}
          />
        </div>

        {/* Category Filter Chips */}
        <div className='flex gap-2 overflow-x-auto pb-2 scrollbar-hide'>
          <Chip
            key='all'
            variant={selectedCategory === 'all' ? 'solid' : 'flat'}
            color={selectedCategory === 'all' ? 'primary' : 'default'}
            size='sm'
            className='cursor-pointer whitespace-nowrap'
            onClick={() => setSelectedCategory('all')}>
            All ({workouts.length})
          </Chip>
          {uniqueCategories.map((category) => {
            const count = workouts.filter((w) => w.category === category).length
            return (
              <Chip
                key={category}
                variant={selectedCategory === category ? 'solid' : 'flat'}
                color={selectedCategory === category ? 'primary' : 'default'}
                size='sm'
                className='cursor-pointer whitespace-nowrap'
                onClick={() => setSelectedCategory(category)}>
                {category} ({count})
              </Chip>
            )
          })}
        </div>

        {/* Results Count */}
        <div className='flex items-center justify-between'>
          <p className='text-sm text-default-500'>
            {filteredWorkouts.length} workout
            {filteredWorkouts.length !== 1 ? 's' : ''} found
          </p>
          {searchTerm && (
            <Button
              size='sm'
              variant='light'
              color='primary'
              onPress={() => setSearchTerm('')}
              className='text-xs'>
              Clear
            </Button>
          )}
        </div>

        {/* Workouts List - Mobile Optimized */}
        {filteredWorkouts.length === 0 ? (
          <div className='text-center py-16'>
            <div className='w-20 h-20 rounded-full bg-default-100 flex items-center justify-center mx-auto mb-6'>
              <IconBarbell className='text-default-400' size={40} />
            </div>
            <h3 className='text-lg font-semibold mb-2'>
              {workouts.length === 0
                ? 'No workouts yet'
                : 'No matching workouts'}
            </h3>
            <p className='text-default-500 mb-6 text-sm max-w-xs mx-auto'>
              {workouts.length === 0
                ? 'Create your first workout to get started on your fitness journey'
                : 'Try adjusting your search or category filter'}
            </p>
            {workouts.length === 0 && (
              <Button
                as={Link}
                href='/workouts/add'
                color='primary'
                size='lg'
                startContent={<IconPlus size={20} />}>
                Create Your First Workout
              </Button>
            )}
          </div>
        ) : (
          <div className='space-y-3'>
            {filteredWorkouts.map((workout) => (
              <Card
                key={workout.id}
                className='hover:shadow-md transition-all duration-200 active:scale-98'>
                <CardBody className='p-4'>
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-semibold text-base line-clamp-1 mb-1'>
                        {workout.title}
                      </h3>
                      {workout.description && (
                        <p className='text-sm text-default-500 line-clamp-2'>
                          {workout.description}
                        </p>
                      )}
                    </div>
                    {workout.category && (
                      <Chip
                        size='sm'
                        variant='flat'
                        color='primary'
                        className='ml-2 shrink-0'>
                        {workout.category}
                      </Chip>
                    )}
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4 text-sm text-default-600'>
                      <div className='flex items-center gap-1'>
                        <IconBarbell size={16} />
                        <span>{workout.sets.length} sets</span>
                      </div>
                      <div className='text-xs text-default-400'>
                        {new Date(workout.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: '2-digit',
                          }
                        )}
                      </div>
                    </div>

                    <div className='flex gap-1'>
                      <Button
                        as={Link}
                        href={`/workouts/${workout.id}`}
                        isIconOnly
                        size='sm'
                        variant='light'
                        color='default'
                        className='w-8 h-8'
                        aria-label='View workout details'>
                        <IconEye size={14} />
                      </Button>
                      <Button
                        as={Link}
                        href={`/workouts/edit/${workout.id}`}
                        isIconOnly
                        size='sm'
                        variant='light'
                        color='primary'
                        className='w-8 h-8'
                        aria-label='Edit workout'>
                        <IconEdit size={14} />
                      </Button>
                      <Button
                        isIconOnly
                        size='sm'
                        variant='light'
                        color='danger'
                        className='w-8 h-8'
                        aria-label='Delete workout'
                        onPress={() => handleDelete(workout.id)}>
                        <IconTrash size={14} />
                      </Button>
                    </div>
                  </div>

                  {/* Sets Preview */}
                  {workout.sets.length > 0 && (
                    <div className='mt-3 pt-3 border-t border-default-100'>
                      <div className='flex flex-wrap gap-1'>
                        {workout.sets.slice(0, 3).map((set, index) => (
                          <span
                            key={set.id}
                            className='text-xs bg-default-100 text-default-600 px-2 py-1 rounded-md'>
                            {set.reps}r{set.weight ? ` × ${set.weight}kg` : ''}
                          </span>
                        ))}
                        {workout.sets.length > 3 && (
                          <span className='text-xs text-default-400 px-2 py-1'>
                            +{workout.sets.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
