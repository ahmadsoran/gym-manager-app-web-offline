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
import { Tabs, Tab } from '@heroui/tabs'
import {
  IconPlus,
  IconMinus,
  IconDeviceFloppy,
  IconEdit,
  IconTrash,
  IconBarbell,
  IconCalendar,
  IconCamera,
  IconLink,
} from '@tabler/icons-react'
import { useWorkoutStore } from '@/store/workout-store'
import { type CreateWorkoutPlanData, type CreateSetData } from '@/types/gym'
import MobileHeader from '@/components/mobile-header'
import CameraRecorder from '@/components/camera-recorder'
import { PhotoView } from 'react-photo-view'
import {
  fetchUrlMetadata,
  isValidUrl,
  type UrlMetadata,
} from '@/lib/url-metadata-fetcher'

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
    addMediaToWorkout,
    removeMediaFromWorkout,
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
    media: [],
    urlLinks: [],
  })

  const [categoryInputValue, setCategoryInputValue] = useState('')
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<
    Array<{ file: File; type: 'image' | 'video'; url: string }>
  >([])

  // URL media states
  const [mediaTabSelected, setMediaTabSelected] = useState('media')
  const [urlInput, setUrlInput] = useState('')
  const [urlMetadata, setUrlMetadata] = useState<UrlMetadata | null>(null)
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const [urlError, setUrlError] = useState('')

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
          urlLinks: workout.urlLinks || [],
          // Note: We don't need to set media in formData for edit mode
          // since we're using the workout.media directly from the store
        })
      }
    }
  }, [isEditMode, workoutId, getWorkoutById])

  // Sync categoryInputValue with formData.category
  useEffect(() => {
    setCategoryInputValue(formData.category || '')
  }, [formData.category])

  // Cleanup object URLs for local media files when component unmounts or when switching modes
  useEffect(() => {
    return () => {
      mediaFiles.forEach((media) => URL.revokeObjectURL(media.url))
    }
  }, [])

  // Clear local media files when switching to edit mode or details mode
  useEffect(() => {
    if (isEditMode || isDetailsMode) {
      setMediaFiles((prev) => {
        prev.forEach((media) => URL.revokeObjectURL(media.url))
        return []
      })
    }
  }, [isEditMode, isDetailsMode])

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

  const handleMediaCapture = async (file: File, type: 'image' | 'video') => {
    if (isEditMode && workoutId) {
      // In edit mode, add to existing workout
      await addMediaToWorkout(workoutId, [file])
    } else {
      // In add mode, add to local state
      const url = URL.createObjectURL(file)
      setMediaFiles((prev) => [...prev, { file, type, url }])
      setFormData((prev) => ({
        ...prev,
        media: [...(prev.media || []), file],
      }))
    }
  }

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      setUrlError('Please enter a valid URL')
      return
    }

    if (!isValidUrl(urlInput)) {
      setUrlError('Please enter a valid URL format')
      return
    }

    setIsLoadingUrl(true)
    setUrlError('')

    try {
      const metadata = await fetchUrlMetadata(urlInput.trim())
      console.log({ metadata })
      setUrlMetadata(metadata)

      // Add URL metadata to form data
      setFormData((prev) => ({
        ...prev,
        urlLinks: [...(prev.urlLinks || []), metadata],
      }))

      // Clear input
      setUrlInput('')
    } catch (error) {
      setUrlError('Failed to fetch URL metadata. Please try again.')
      console.error('Error fetching URL metadata:', error)
    } finally {
      setIsLoadingUrl(false)
    }
  }

  const removeUrlLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      urlLinks: prev.urlLinks?.filter((_: any, i: number) => i !== index) || [],
    }))
  }

  const removeMedia = async (index: number) => {
    if (isEditMode && workoutId && workout) {
      // In edit mode, remove from database
      const mediaItem = workout.media[index]
      if (mediaItem) {
        await removeMediaFromWorkout(workoutId, mediaItem.id)
      }
    } else {
      // In add mode, remove from local state
      setMediaFiles((prev) => {
        const updated = [...prev]
        URL.revokeObjectURL(updated[index].url)
        updated.splice(index, 1)
        return updated
      })
      setFormData((prev) => ({
        ...prev,
        media: prev.media?.filter((_, i) => i !== index) || [],
      }))
    }
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
          title: formData.title,
          description: formData.description,
          category: formData.category,
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

          {/* Exercise Media */}
          {workout.media && workout.media.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className='text-lg font-semibold'>Exercise Media</h2>
              </CardHeader>
              <CardBody className='space-y-4'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {workout.media.map((media, index) => (
                    <div key={media.id} className='relative group'>
                      {media.type === 'video' ? (
                        <video
                          src={media.url}
                          className='w-full h-48 object-cover rounded-lg'
                          controls
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <PhotoView src={media.url}>
                          <img
                            src={media.url}
                            alt='Exercise media'
                            className='w-full h-48 object-cover rounded-lg'
                          />
                        </PhotoView>
                      )}
                      <div className='absolute top-2 left-2 flex gap-2'>
                        <Chip
                          size='sm'
                          variant='solid'
                          color='default'
                          className='text-xs bg-black/70 text-white'>
                          {media.type === 'video' ? 'Video' : 'Photo'}
                        </Chip>
                        <Chip
                          size='sm'
                          variant='solid'
                          color='secondary'
                          className='text-xs bg-black/70 text-white'>
                          {(media.size / 1024 / 1024).toFixed(1)}MB
                        </Chip>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Exercise URL Links */}
          {workout.urlLinks && workout.urlLinks.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className='text-lg font-semibold'>Exercise Links</h2>
              </CardHeader>
              <CardBody className='space-y-4'>
                {workout.urlLinks.map((urlLink, index) => (
                  <div
                    key={urlLink.id || index}
                    className='border border-default-200 rounded-lg p-4'>
                    <div className='flex gap-3'>
                      {urlLink.thumbnailUrl && (
                        <div className='flex-shrink-0'>
                          {urlLink.isYouTube ? (
                            <div className='relative'>
                              <img
                                src={urlLink.thumbnailUrl}
                                alt='Video thumbnail'
                                className='w-24 h-18 object-cover rounded'
                              />
                              <div className='absolute inset-0 flex items-center justify-center'>
                                <div className='w-10 h-10 bg-red-600 rounded-full flex items-center justify-center'>
                                  <div className='w-0 h-0 border-l-[8px] border-l-white border-y-[5px] border-y-transparent ml-1'></div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={urlLink.thumbnailUrl}
                              alt='Link thumbnail'
                              className='w-24 h-18 object-cover rounded'
                            />
                          )}
                        </div>
                      )}

                      <div className='flex-1 min-w-0'>
                        <h4 className='font-semibold text-base mb-2'>
                          {urlLink.title || 'External Link'}
                        </h4>
                        {urlLink.description && (
                          <p className='text-sm text-default-600 mb-3'>
                            {urlLink.description}
                          </p>
                        )}
                        <div className='flex items-center gap-3 mb-3'>
                          <Chip size='sm' variant='flat' color='primary'>
                            {urlLink.isYouTube ? 'YouTube' : urlLink.type}
                          </Chip>
                          <a
                            href={urlLink.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-sm text-primary hover:underline'>
                            View Original
                          </a>
                        </div>
                      </div>
                    </div>

                    {urlLink.isYouTube && urlLink.embedUrl && (
                      <div className='mt-4'>
                        <iframe
                          src={`${urlLink.embedUrl}?autoplay=1&mute=1`}
                          className='w-full h-48 rounded-lg'
                          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

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
                placeholder='e.g., Tricep Dips, Push Ups'
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

          {/* Media Section */}
          <Card>
            <CardHeader className='pb-3'>
              <h2 className='text-lg font-semibold'>Exercise Media</h2>
            </CardHeader>
            <CardBody className='space-y-4'>
              <Tabs
                selectedKey={mediaTabSelected}
                onSelectionChange={(key) => setMediaTabSelected(key as string)}
                variant='underlined'
                color='primary'
                className='w-full'>
                <Tab key='media' title='Media'>
                  <div className='space-y-4'>
                    {!isDetailsMode && (
                      <div className='flex justify-center'>
                        <Button
                          color='primary'
                          variant='flat'
                          size='sm'
                          startContent={<IconCamera size={16} />}
                          onPress={() => setIsCameraOpen(true)}>
                          Capture Media
                        </Button>
                      </div>
                    )}

                    {(() => {
                      // Determine which media to display
                      const displayMedia =
                        isEditMode || isDetailsMode
                          ? workout?.media || []
                          : mediaFiles

                      const hasMedia = displayMedia.length > 0

                      return hasMedia ? (
                        <div className='grid grid-cols-2 gap-3'>
                          {displayMedia.map((media, index) => {
                            // Handle both Media objects (from database) and local media files
                            const isStoredMedia = 'id' in media
                            const mediaUrl = isStoredMedia
                              ? media.url
                              : media.url
                            const mediaType = isStoredMedia
                              ? media.type
                              : media.type
                            // Normalize media types: both 'video' and 'image'/'photo' should work
                            const isVideo = mediaType === 'video'

                            return (
                              <div
                                key={isStoredMedia ? media.id : index}
                                className='relative group'>
                                {isVideo ? (
                                  <video
                                    src={mediaUrl}
                                    className='w-full h-24 object-cover rounded-lg'
                                    controls={isDetailsMode ? true : false}
                                    autoPlay={isDetailsMode ? true : false}
                                    muted={isDetailsMode ? true : false}
                                    loop={isDetailsMode ? true : false}
                                    playsInline={isDetailsMode ? true : false}
                                  />
                                ) : (
                                  <PhotoView src={mediaUrl}>
                                    <img
                                      src={mediaUrl}
                                      alt='Exercise media'
                                      className='w-full h-48 object-cover rounded-lg'
                                    />
                                  </PhotoView>
                                )}
                                {!isDetailsMode && (
                                  <Button
                                    isIconOnly
                                    size='sm'
                                    variant='solid'
                                    color='danger'
                                    className='absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity'
                                    onPress={() => removeMedia(index)}>
                                    <IconTrash size={12} />
                                  </Button>
                                )}
                                <div className='absolute bottom-1 left-1'>
                                  <Chip
                                    size='sm'
                                    variant='solid'
                                    color='default'
                                    className='text-xs'>
                                    {isVideo ? 'Video' : 'Photo'}
                                  </Chip>
                                </div>
                                {isStoredMedia && (
                                  <div className='absolute bottom-1 right-1'>
                                    <Chip
                                      size='sm'
                                      variant='solid'
                                      color='secondary'
                                      className='text-xs'>
                                      {(media.size / 1024 / 1024).toFixed(1)}MB
                                    </Chip>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className='text-center py-8 text-default-500'>
                          <IconCamera
                            size={48}
                            className='mx-auto mb-4 opacity-50'
                          />
                          <p className='text-sm'>No media added yet</p>
                          <p className='text-xs mt-1'>
                            {isDetailsMode
                              ? 'No media was captured for this workout'
                              : 'Capture photos or videos of your exercises'}
                          </p>
                        </div>
                      )
                    })()}
                  </div>
                </Tab>

                <Tab key='url' title='URL'>
                  <div className='space-y-4'>
                    {!isDetailsMode && (
                      <div className='flex gap-2 items-center'>
                        <Input
                          label='URL'
                          placeholder='Enter URL'
                          value={urlInput}
                          onValueChange={(value) => {
                            setUrlInput(value?.trim() || '')
                            setUrlError('')
                          }}
                          isInvalid={!!urlError}
                          errorMessage={urlError}
                          startContent={<IconLink size={16} />}
                          className='flex-1'
                        />
                        <Button
                          color='primary'
                          variant='flat'
                          size='lg'
                          isLoading={isLoadingUrl}
                          isDisabled={!urlInput.trim() || isLoadingUrl}
                          onPress={handleUrlSubmit}
                          startContent={
                            !isLoadingUrl && <IconPlus size={16} />
                          }>
                          Add
                        </Button>
                      </div>
                    )}

                    {(() => {
                      const displayUrlLinks = formData.urlLinks || []
                      const hasUrlLinks = displayUrlLinks.length > 0

                      return hasUrlLinks ? (
                        <div className='space-y-3'>
                          {displayUrlLinks.map((urlLink, index) => (
                            <div
                              key={index}
                              className='relative group border border-default-200 rounded-lg p-3'>
                              <div className='flex gap-3'>
                                {urlLink.thumbnailUrl && (
                                  <div className='flex-shrink-0'>
                                    {urlLink.isYouTube ? (
                                      <div className='relative'>
                                        <img
                                          src={urlLink.thumbnailUrl}
                                          alt='Video thumbnail'
                                          className='w-20 h-14 object-cover rounded'
                                        />
                                        <div className='absolute inset-0 flex items-center justify-center'>
                                          <div className='w-8 h-8 bg-red-600 rounded-full flex items-center justify-center'>
                                            <div className='w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5'></div>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <img
                                        src={urlLink.thumbnailUrl}
                                        alt='Link thumbnail'
                                        className='w-20 h-14 object-cover rounded'
                                      />
                                    )}
                                  </div>
                                )}

                                <div className='flex-1 min-w-0'>
                                  <h4 className='font-medium text-sm truncate'>
                                    {urlLink.title || 'External Link'}
                                  </h4>
                                  {urlLink.description && (
                                    <p className='text-xs text-default-500 mt-1 line-clamp-2'>
                                      {urlLink.description}
                                    </p>
                                  )}
                                  <div className='flex items-center gap-2 mt-2'>
                                    <Chip
                                      size='sm'
                                      variant='flat'
                                      color='primary'>
                                      {urlLink.isYouTube
                                        ? 'YouTube'
                                        : urlLink.type}
                                    </Chip>
                                    <a
                                      href={urlLink.url}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-xs text-primary hover:underline truncate'>
                                      {urlLink.url}
                                    </a>
                                  </div>
                                </div>

                                {!isDetailsMode && (
                                  <Button
                                    isIconOnly
                                    size='sm'
                                    variant='light'
                                    color='danger'
                                    className='opacity-0 group-hover:opacity-100 transition-opacity'
                                    onPress={() => removeUrlLink(index)}>
                                    <IconTrash size={14} />
                                  </Button>
                                )}
                              </div>

                              {urlLink.isYouTube &&
                                urlLink.embedUrl &&
                                isDetailsMode && (
                                  <div className='mt-3'>
                                    <iframe
                                      src={`${urlLink.embedUrl}?autoplay=1&mute=1`}
                                      className='w-full h-40 rounded-lg'
                                      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                      allowFullScreen
                                    />
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className='text-center py-8 text-default-500'>
                          <IconLink
                            size={48}
                            className='mx-auto mb-4 opacity-50'
                          />
                          <p className='text-sm'>No URLs added yet</p>
                          <p className='text-xs mt-1'>
                            {isDetailsMode
                              ? 'No URLs were added for this workout'
                              : 'Add YouTube videos, images, or reference links'}
                          </p>
                        </div>
                      )
                    })()}
                  </div>
                </Tab>
              </Tabs>
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

      {/* Camera Recorder Modal */}
      <CameraRecorder
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onMediaCapture={handleMediaCapture}
      />
    </>
  )
}
