'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Chip } from '@heroui/chip'
import { Spinner } from '@heroui/spinner'
import {
  IconSearch,
  IconPlus,
  IconBarbell,
  IconDeviceFloppy,
} from '@tabler/icons-react'
import { useWorkoutStore } from '@/store/workout-store'
import MobileHeader from '@/components/mobile-header'
import AddWorkout from '@/components/workouts/add-workout'
import ViewWorkout from '@/components/workouts/view-workout'
import WorkoutCard from '@/components/workouts/workout-card'
import { addToast, closeAll } from '@heroui/toast'

export default function WorkoutContainer() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const action = searchParams.get('action')
  const workoutId = searchParams.get('id')

  // Determine the current mode
  const isAddMode = action === 'create'
  const isEditMode = action === 'edit' && workoutId
  const isViewMode = action === 'view' && workoutId

  const {
    workouts,
    isLoading,
    getUniqueCategories,
    deleteWorkout,
    loadWorkouts,
    loadCategories,
    getWorkoutById,
  } = useWorkoutStore()

  // List mode states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadWorkouts()
    loadCategories()
  }, [])

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
    addToast({
      title: `Do you want to delete this workout?`,
      color: 'danger',

      endContent: (
        <Button
          size='sm'
          variant='solid'
          color='danger'
          onPress={async () => {
            await deleteWorkout(id)
            // Close the toast
            if (isViewMode && workoutId === id) {
              router.push('/workouts')
            }
            closeAll()
          }}>
          Delete
        </Button>
      ),
    })
  }

  // VIEW MODE - Use ViewWorkout component
  if (isViewMode && workoutId) {
    return (
      <>
        <MobileHeader title='Workout Details' showBack={true} />
        <ViewWorkout
          workoutId={workoutId}
          onEdit={() => router.push(`/workouts?action=edit&id=${workoutId}`)}
          onDelete={() => router.push('/workouts')}
        />
      </>
    )
  }

  // ADD/EDIT MODE - Use AddWorkout component
  if (isAddMode || isEditMode) {
    const editWorkout =
      isEditMode && workoutId ? getWorkoutById(workoutId) : null

    const headerActions = (
      <Button
        type='submit'
        color='primary'
        size='sm'
        form='workout-form'
        startContent={<IconDeviceFloppy size={16} />}>
        {isEditMode ? 'Update' : 'Save'}
      </Button>
    )

    return (
      <>
        <MobileHeader
          title={isEditMode ? 'Edit Workout' : 'Add Workout'}
          showBack={true}
          actions={headerActions}
        />
        <AddWorkout editWorkout={editWorkout} isEditMode={!!isEditMode} />
      </>
    )
  }

  // LIST MODE - Default workout list view
  const headerActions = (
    <Button
      onPress={() => router.push('/workouts?action=create')}
      color='primary'
      size='sm'
      isIconOnly>
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
                onPress={() => router.push('/workouts?action=create')}
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
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
