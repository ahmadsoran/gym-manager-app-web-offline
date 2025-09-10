'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Textarea } from '@heroui/input'
import { Autocomplete, AutocompleteItem } from '@heroui/autocomplete'
import { Chip } from '@heroui/chip'
import { Link } from '@heroui/link'
import {
  IconPlus,
  IconMinus,
  IconDeviceFloppy,
  IconEdit,
  IconTrash,
  IconBarbell,
  IconCalendar,
} from '@tabler/icons-react'
import { useWorkoutStore } from '@//store/workout-store'
import { type CreateWorkoutPlanData, type CreateSetData } from '@//types/gym'
import MobileHeader from '@//components/mobile-header'

export default function WorkoutPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string[]

  // Determine the mode based on slug
  const isEditMode = slug[0] === 'edit' && slug[1]
  const isDetailsMode =
    slug[0] && slug[0] !== 'edit' && slug[0] !== 'add' && !slug[1]
  const isAddMode = slug[0] === 'add'

  const workoutId = isEditMode ? slug[1] : isDetailsMode ? slug[0] : null

  const {
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutById,
    isLoading,
    getUniqueCategories,
    loadWorkouts,
    loadCategories,
    addCategory,
  } = useWorkoutStore()

  const [formData, setFormData] = useState<CreateWorkoutPlanData>({
    title: '',
    description: '',
    category: '',
    sets: [{ reps: 10, weight: undefined, notes: '' }],
  })

  const [categoryInputValue, setCategoryInputValue] = useState('')

  useEffect(() => {
    loadWorkouts()
    loadCategories()
  }, [loadWorkouts, loadCategories])

  // Load workout data for editing
  useEffect(() => {
    if (isEditMode && workoutId) {
      const workout = getWorkoutById(workoutId)
      if (workout) {
        setFormData({
          title: workout.title,
          description: workout.description || '',
          category: workout.category || '',
          sets: workout.sets.map((set) => ({
            reps: set.reps,
            weight: set.weight,
            notes: set.notes || '',
          })),
        })
      }
    }
  }, [isEditMode, workoutId, getWorkoutById])

  // Sync categoryInputValue with formData.category
  useEffect(() => {
    setCategoryInputValue(formData.category || '')
  }, [formData.category])

  const existingCategories = getUniqueCategories()

  const handleInputChange = (
    field: keyof CreateWorkoutPlanData,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSetChange = (
    index: number,
    field: keyof CreateSetData,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      sets: prev.sets.map((set, i) =>
        i === index ? { ...set, [field]: value } : set
      ),
    }))
  }

  const addSet = () => {
    setFormData((prev) => ({
      ...prev,
      sets: [...prev.sets, { reps: 10, weight: undefined, notes: '' }],
    }))
  }

  const removeSet = (index: number) => {
    if (formData.sets.length > 1) {
      setFormData((prev) => ({
        ...prev,
        sets: prev.sets.filter((_, i) => i !== index),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Please enter a workout title')
      return
    }

    try {
      if (isEditMode && workoutId) {
        // For updates, we need to transform sets to include IDs
        const existingWorkout = getWorkoutById(workoutId)
        const updatedSets = formData.sets.map((set, index) => ({
          id: existingWorkout?.sets[index]?.id || crypto.randomUUID(),
          reps: set.reps,
          weight: set.weight,
          notes: set.notes || '',
        }))

        await updateWorkout(workoutId, {
          ...formData,
          sets: updatedSets,
        })
      } else {
        await addWorkout(formData)
      }
      router.push('/workouts')
    } catch (error) {
      alert(
        `Failed to ${isEditMode ? 'update' : 'save'} workout. Please try again.`
      )
    }
  }

  const isValid = formData.title.trim().length > 0 && formData.sets.length > 0

  // Get workout for details view
  const workout = workoutId ? getWorkoutById(workoutId) : null

  const handleDelete = async () => {
    if (workout && confirm('Are you sure you want to delete this workout?')) {
      await deleteWorkout(workout.id)
      router.push('/workouts')
    }
  }

  const headerActions = isDetailsMode ? (
    <div className='flex gap-2'>
      <Button
        as={Link}
        href={`/workouts/edit/${workout?.id}`}
        isIconOnly
        size='sm'
        variant='light'
        color='primary'
        aria-label='Edit workout'>
        <IconEdit size={16} />
      </Button>
      <Button
        isIconOnly
        size='sm'
        variant='light'
        color='danger'
        aria-label='Delete workout'
        onPress={handleDelete}>
        <IconTrash size={16} />
      </Button>
    </div>
  ) : (
    <Button
      type='submit'
      color='primary'
      size='sm'
      isLoading={isLoading}
      isDisabled={!isValid}
      form='workout-form'
      startContent={!isLoading && <IconDeviceFloppy size={16} />}>
      {isEditMode ? 'Update' : 'Save'}
    </Button>
  )

  const getTitle = () => {
    if (isDetailsMode) return workout?.title || 'Workout Details'
    if (isEditMode) return 'Edit Workout'
    return 'Add Workout'
  }

  // Details View
  if (isDetailsMode) {
    if (!workout) {
      return (
        <>
          <MobileHeader title='Workout Not Found' showBack={true} />
          <div className='p-4 text-center'>
            <p className='text-default-500'>Workout not found</p>
          </div>
        </>
      )
    }

    return (
      <>
        <MobileHeader
          title={getTitle()}
          showBack={true}
          actions={headerActions}
        />
        <div className='p-4 pb-20 space-y-6'>
          {/* Workout Header */}
          <Card>
            <CardBody className='space-y-4'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <h1 className='text-2xl font-bold mb-2'>{workout.title}</h1>
                  {workout.description && (
                    <p className='text-default-600 text-base'>
                      {workout.description}
                    </p>
                  )}
                </div>
                {workout.category && (
                  <Chip size='lg' variant='flat' color='primary'>
                    {workout.category}
                  </Chip>
                )}
              </div>

              <div className='flex items-center gap-6 text-sm text-default-500 pt-2 border-t border-default-100'>
                <div className='flex items-center gap-2'>
                  <IconBarbell size={16} />
                  <span>{workout.sets.length} sets</span>
                </div>
                <div className='flex items-center gap-2'>
                  <IconCalendar size={16} />
                  <span>
                    Created {new Date(workout.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Sets Details */}
          <Card>
            <CardHeader>
              <h2 className='text-lg font-semibold'>Sets</h2>
            </CardHeader>
            <CardBody className='space-y-4'>
              {workout.sets.map((set, index) => (
                <div key={set.id} className='space-y-3'>
                  {index > 0 && <div className='h-px bg-default-200 my-4' />}

                  <div className='flex items-center gap-3'>
                    <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
                      <span className='text-primary font-semibold text-sm'>
                        {index + 1}
                      </span>
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-4 text-lg font-medium'>
                        <span>{set.reps} reps</span>
                        {set.weight && (
                          <>
                            <span className='text-default-400'>×</span>
                            <span>{set.weight} kg</span>
                          </>
                        )}
                      </div>
                      {set.notes && (
                        <p className='text-sm text-default-500 mt-1'>
                          {set.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </>
    )
  }

  // Form View (Add/Edit)
  return (
    <>
      <MobileHeader
        title={getTitle()}
        showBack={true}
        actions={headerActions}
      />
      <div className='p-4 pb-32 space-y-6'>
        <form id='workout-form' onSubmit={handleSubmit} className='space-y-6'>
          <Card>
            <CardHeader className='pb-3'>
              <h2 className='text-lg font-semibold'>Workout Details</h2>
            </CardHeader>
            <CardBody className='space-y-4'>
              <Input
                label='Workout Title'
                placeholder='e.g., Push Day, Leg Day, Cardio Session'
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                isRequired
                maxLength={100}
              />

              <Textarea
                label='Description (Optional)'
                placeholder='Describe your workout...'
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                maxRows={3}
              />

              <Autocomplete
                label='Category (Optional)'
                placeholder='Type to search or add new category'
                inputValue={categoryInputValue}
                onInputChange={(value) => {
                  setCategoryInputValue(value)
                  // Only update form data if it's an existing category
                  if (value && existingCategories.includes(value)) {
                    handleInputChange('category', value)
                  } else if (!value) {
                    handleInputChange('category', '')
                  }
                }}
                selectedKey={formData.category || null}
                onSelectionChange={async (key) => {
                  if (key) {
                    const selectedCategory = String(key)

                    // Check if this is a new category (starts with "add-new:")
                    if (selectedCategory.startsWith('add-new:')) {
                      const newCategory = selectedCategory.replace(
                        'add-new:',
                        ''
                      )
                      await addCategory(newCategory)
                      handleInputChange('category', newCategory)
                      setCategoryInputValue(newCategory)
                    } else {
                      // Existing category
                      handleInputChange('category', selectedCategory)
                      setCategoryInputValue(selectedCategory)
                    }
                  } else {
                    handleInputChange('category', '')
                    setCategoryInputValue('')
                  }
                }}
                allowsCustomValue={true}
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter' &&
                    categoryInputValue &&
                    !existingCategories.includes(categoryInputValue)
                  ) {
                    // Create new category on Enter
                    addCategory(categoryInputValue).then(() => {
                      handleInputChange('category', categoryInputValue)
                    })
                    e.preventDefault()
                  }
                }}
                items={(() => {
                  const filteredCategories = existingCategories.filter(
                    (category) =>
                      !categoryInputValue ||
                      category
                        .toLowerCase()
                        .includes(categoryInputValue.toLowerCase())
                  )

                  const shouldShowAddNew =
                    categoryInputValue &&
                    categoryInputValue.trim() &&
                    !existingCategories.some(
                      (cat) =>
                        cat.toLowerCase() === categoryInputValue.toLowerCase()
                    )

                  return [
                    ...filteredCategories.map((cat) => ({
                      key: cat,
                      label: cat,
                      isNew: false,
                    })),
                    ...(shouldShowAddNew
                      ? [
                          {
                            key: `add-new:${categoryInputValue.trim()}`,
                            label: categoryInputValue.trim(),
                            isNew: true,
                          },
                        ]
                      : []),
                  ]
                })()}>
                {(item) => (
                  <AutocompleteItem key={item.key}>
                    {item.isNew ? (
                      <div className='flex items-center gap-2'>
                        <IconPlus size={16} />
                        Add "{item.label}" as new category
                      </div>
                    ) : (
                      item.label
                    )}
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className='flex justify-between items-center pb-3'>
              <h2 className='text-lg font-semibold'>Sets</h2>
              <Button
                color='primary'
                variant='flat'
                size='sm'
                startContent={<IconPlus size={16} />}
                onPress={addSet}>
                Add Set
              </Button>
            </CardHeader>
            <CardBody className='space-y-4'>
              {formData.sets.map((set, index) => (
                <div key={index} className='space-y-3'>
                  {index > 0 && <div className='h-px bg-default-200 my-4' />}

                  <div className='flex items-center gap-2 mb-3'>
                    <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
                      <span className='text-primary font-semibold text-sm'>
                        {index + 1}
                      </span>
                    </div>
                    <h3 className='font-medium text-sm'>Set {index + 1}</h3>
                    {formData.sets.length > 1 && (
                      <Button
                        isIconOnly
                        color='danger'
                        variant='light'
                        size='sm'
                        className='ml-auto w-8 h-8'
                        onPress={() => removeSet(index)}
                        aria-label='Remove set'>
                        <IconMinus size={14} />
                      </Button>
                    )}
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    <Input
                      type='number'
                      label='Reps'
                      placeholder='10'
                      value={set.reps.toString()}
                      onChange={(e) =>
                        handleSetChange(
                          index,
                          'reps',
                          parseInt(e.target.value) || 0
                        )
                      }
                      min='1'
                    />

                    <Input
                      type='number'
                      label='Weight (kg)'
                      placeholder='Optional'
                      value={set.weight?.toString() || ''}
                      onChange={(e) =>
                        handleSetChange(
                          index,
                          'weight',
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined
                        )
                      }
                      min='0'
                      step='0.5'
                    />
                  </div>

                  <Input
                    label='Notes (Optional)'
                    placeholder='Rest time, form notes, etc.'
                    value={set.notes || ''}
                    onChange={(e) =>
                      handleSetChange(index, 'notes', e.target.value)
                    }
                  />
                </div>
              ))}
            </CardBody>
          </Card>
        </form>
      </div>
    </>
  )
}
