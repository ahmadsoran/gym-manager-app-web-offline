'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Textarea } from '@heroui/input'
import { Autocomplete, AutocompleteItem } from '@heroui/autocomplete'
import { Tabs, Tab } from '@heroui/tabs'
import {
  IconPlus,
  IconMinus,
  IconDeviceFloppy,
  IconCamera,
  IconLink,
} from '@tabler/icons-react'
import { useWorkoutStore } from '@//store/workout-store'
import {
  type CreateWorkoutPlanData,
  type CreateSetData,
  type WorkoutPlan,
} from '@//types/gym'
import CameraRecorder from '@//components/camera-recorder'
import { PhotoView } from 'react-photo-view'
import { fetchUrlMetadata, isValidUrl } from '@//lib/url-metadata-fetcher'
import { addToast } from '@heroui/toast'
import MobileHeader from '../mobile-header'

interface AddWorkoutProps {
  editWorkout?: WorkoutPlan | null
  isEditMode?: boolean
}

export default function AddWorkout({
  editWorkout = null,
  isEditMode = false,
}: AddWorkoutProps) {
  const router = useRouter()

  const {
    addWorkout,
    updateWorkout,
    isLoading,
    getUniqueCategories,
    loadWorkouts,
    loadCategories,
    addCategory,
    addMediaToWorkout,
    removeMediaFromWorkout,
  } = useWorkoutStore()

  const [formData, setFormData] = useState<CreateWorkoutPlanData>({
    title: isEditMode && editWorkout ? editWorkout.title : '',
    description: isEditMode && editWorkout ? editWorkout.description || '' : '',
    category: isEditMode && editWorkout ? editWorkout.category || '' : '',
    sets:
      isEditMode && editWorkout
        ? editWorkout.sets.map((set: any) => ({
            reps: set.reps,
            weight: set.weight,
            notes: set.notes || '',
          }))
        : [{ reps: 10, weight: undefined, notes: '' }],
    media: [], // This will store new File objects
    urlLinks:
      isEditMode && editWorkout
        ? editWorkout.urlLinks?.map((link: any) => ({
            url: link.url,
            title: link.title || '',
            description: link.description || '',
            image: link.thumbnailUrl || '',
            type: link.type,
            isYouTube: link.isYouTube || false,
            youTubeId: link.youTubeId,
            embedUrl: link.embedUrl,
          })) || []
        : [],
  })

  const [categoryInputValue, setCategoryInputValue] = useState('')
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  // mediaFiles will now store both existing media (as display-only) and new files
  const [mediaFiles, setMediaFiles] = useState<
    Array<{
      file?: File
      type: 'image' | 'video'
      url: string
      isExisting?: boolean
    }>
  >([])

  // Load existing media into mediaFiles for display (but not in formData.media)
  useEffect(() => {
    if (isEditMode && editWorkout?.media && editWorkout.media.length > 0) {
      const existingMediaFiles = editWorkout.media.map((media) => ({
        type: media.type === 'photo' ? ('image' as const) : ('video' as const),
        url: media.url,
        isExisting: true, // Flag to identify existing media
      }))
      setMediaFiles(existingMediaFiles)
    }
  }, [isEditMode, editWorkout])

  // URL media states
  const [mediaTabSelected, setMediaTabSelected] = useState('media')
  const [urlInput, setUrlInput] = useState('')
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const [urlError, setUrlError] = useState('')

  useEffect(() => {
    loadWorkouts()
    loadCategories()
  }, [loadWorkouts, loadCategories])

  // Sync categoryInputValue with formData.category
  useEffect(() => {
    setCategoryInputValue(formData.category || '')
  }, [formData.category])

  // Cleanup object URLs for local media files when component unmounts
  useEffect(() => {
    return () => {
      mediaFiles.forEach((media) => {
        if (!media.isExisting && media.file) {
          URL.revokeObjectURL(media.url)
        }
      })
    }
  }, [])

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
    if (isEditMode && editWorkout) {
      // In edit mode, add to existing workout
      await addMediaToWorkout(editWorkout.id, [file])
    } else {
      // In add mode, add to local state
      const url = URL.createObjectURL(file)
      setMediaFiles((prev) => [...prev, { file, type, url, isExisting: false }])
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

  const removeMedia = async (index: number) => {
    if (isEditMode && editWorkout) {
      // In edit mode, remove from database
      const mediaItem = editWorkout.media?.[index]
      if (mediaItem) {
        await removeMediaFromWorkout(editWorkout.id, mediaItem.id)
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

  const removeUrlLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      urlLinks: prev.urlLinks?.filter((_: any, i: number) => i !== index) || [],
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

  const [isSubmitting, setSubmitting] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      addToast({ title: 'Please enter a workout title', color: 'danger' })
      return
    }

    try {
      setSubmitting(true)
      if (isEditMode && editWorkout) {
        // For updates, we need to transform sets to include IDs
        const updatedSets = formData.sets.map((set, index) => ({
          id: editWorkout.sets[index]?.id || Date.now().toString() + index,
          reps: set.reps,
          weight: set.weight,
          notes: set.notes || '',
        }))

        await updateWorkout(editWorkout.id, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          sets: updatedSets,
          urlLinks:
            formData.urlLinks?.map((urlLink, index) => ({
              id:
                editWorkout.urlLinks?.[index]?.id ||
                Date.now().toString() + index,
              url: urlLink.url,
              title: urlLink.title,
              description: urlLink.description,
              thumbnailUrl: urlLink.image,
              type: urlLink.type as 'video' | 'image' | 'webpage',
              isYouTube: urlLink.isYouTube,
              youTubeId: urlLink.youTubeId,
              embedUrl: urlLink.embedUrl,
              createdAt: editWorkout.urlLinks?.[index]?.createdAt || new Date(),
            })) || [],
        })
        addToast({ title: 'Workout updated successfully', color: 'success' })
      } else {
        // Create new workout
        await addWorkout(formData)
        addToast({ title: 'Workout saved successfully', color: 'success' })
      }
      setSubmitting(false)

      router.push('/workouts')
    } catch (error) {
      addToast({
        title: isEditMode
          ? 'Failed to update workout. Please try again.'
          : 'Failed to save workout. Please try again.',
        color: 'danger',
      })
      setSubmitting(false)
    }
  }

  const isValid = formData.title.trim().length > 0 && formData.sets.length > 0

  return (
    <div className='p-4 pb-32 space-y-6'>
      <form id='workout-form' onSubmit={handleSubmit} className='space-y-6'>
        <MobileHeader
          title={isEditMode ? 'Edit Workout' : 'Add Workout'}
          showBack={true}
          actions={
            <Button
              type='submit'
              color='primary'
              size='sm'
              isLoading={isSubmitting}
              form='workout-form'
              startContent={<IconDeviceFloppy size={16} />}>
              {isEditMode ? 'Update' : 'Save'}
            </Button>
          }
        />
        <Card>
          <CardHeader className='pb-3'>
            <h2 className='text-lg font-semibold'>
              {isEditMode ? 'Edit Workout' : 'Workout Details'}
            </h2>
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
              onChange={(e) => handleInputChange('description', e.target.value)}
              maxRows={3}
            />

            <Autocomplete
              label='Category (Optional)'
              placeholder='Type to search or add new category'
              inputValue={categoryInputValue}
              onInputChange={(value) => {
                setCategoryInputValue(value)
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

                  if (selectedCategory.startsWith('add-new:')) {
                    const newCategory = selectedCategory.replace('add-new:', '')
                    await addCategory(newCategory)
                    handleInputChange('category', newCategory)
                    setCategoryInputValue(newCategory)
                  } else {
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

                  {(() => {
                    // Determine which media to display
                    const displayMedia =
                      isEditMode && editWorkout
                        ? editWorkout.media || []
                        : mediaFiles

                    const hasMedia = displayMedia.length > 0

                    return hasMedia ? (
                      <div className='grid grid-cols-2 gap-3'>
                        {displayMedia.map((media, index) => {
                          // Handle both Media objects (from database) and local media files
                          const isStoredMedia = 'id' in media
                          const mediaUrl = media.url
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
                                  controls={false}
                                  autoPlay={false}
                                  muted={false}
                                  loop={false}
                                  playsInline={false}
                                />
                              ) : (
                                <PhotoView src={mediaUrl}>
                                  <img
                                    src={mediaUrl}
                                    alt={`Exercise media ${index + 1}`}
                                    className='w-full h-48 object-cover rounded-lg cursor-pointer'
                                  />
                                </PhotoView>
                              )}
                              <Button
                                isIconOnly
                                size='sm'
                                variant='solid'
                                color='danger'
                                className='absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity'
                                onPress={() => removeMedia(index)}>
                                <IconMinus size={12} />
                              </Button>
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
                          Capture photos or videos of your exercises
                        </p>
                      </div>
                    )
                  })()}
                </div>
              </Tab>

              <Tab key='url' title='URL'>
                <div className='space-y-4'>
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
                      startContent={!isLoadingUrl && <IconPlus size={16} />}>
                      Add
                    </Button>
                  </div>

                  {(formData.urlLinks || []).length > 0 ? (
                    <div className='space-y-3'>
                      {(formData.urlLinks || []).map((urlLink, index) => (
                        <div
                          key={index}
                          className='relative group border border-default-200 rounded-lg p-3'>
                          <div className='flex gap-3'>
                            {urlLink.thumbnailUrl && (
                              <div className='flex-shrink-0'>
                                {urlLink.isYouTube ? (
                                  <div className='relative'>
                                    <PhotoView src={urlLink.thumbnailUrl}>
                                      <img
                                        src={urlLink.thumbnailUrl}
                                        alt={`${urlLink.title || 'Video'} thumbnail`}
                                        className='w-20 h-14 object-cover rounded cursor-pointer'
                                      />
                                    </PhotoView>
                                    <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                                      <div className='w-8 h-8 bg-red-600 rounded-full flex items-center justify-center'>
                                        <div className='w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5'></div>
                                      </div>
                                    </div>
                                  </div>
                                ) : urlLink.type === 'image' ? (
                                  <PhotoView src={urlLink.thumbnailUrl}>
                                    <img
                                      src={urlLink.thumbnailUrl}
                                      alt={`${urlLink.title || 'Image'} thumbnail`}
                                      className='w-20 h-14 object-cover rounded cursor-pointer'
                                    />
                                  </PhotoView>
                                ) : (
                                  <img
                                    src={urlLink.thumbnailUrl}
                                    alt={`${urlLink.title || 'Link'} thumbnail`}
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
                            </div>

                            <Button
                              isIconOnly
                              size='sm'
                              variant='light'
                              color='danger'
                              className='opacity-0 group-hover:opacity-100 transition-opacity'
                              onPress={() => removeUrlLink(index)}>
                              <IconMinus size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-8 text-default-500'>
                      <IconLink size={48} className='mx-auto mb-4 opacity-50' />
                      <p className='text-sm'>No URLs added yet</p>
                      <p className='text-xs mt-1'>
                        Add YouTube videos, images, or reference links
                      </p>
                    </div>
                  )}
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
                        e.target.value ? parseFloat(e.target.value) : undefined
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

      <div className='fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-default-200 p-4'>
        <Button
          type='submit'
          color='primary'
          size='lg'
          className='w-full'
          isLoading={isLoading}
          isDisabled={!isValid}
          form='workout-form'
          startContent={!isLoading && <IconDeviceFloppy size={16} />}>
          {isEditMode ? 'Update Workout' : 'Save Workout'}
        </Button>
      </div>

      {/* Camera Recorder Modal */}
      <CameraRecorder
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onMediaCapture={handleMediaCapture}
      />
    </div>
  )
}
