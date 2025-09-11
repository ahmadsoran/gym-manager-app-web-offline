'use client'

import { Card, CardBody, CardHeader } from '@heroui/card'
import { Chip } from '@heroui/chip'
import { IconWeight, IconCalendar } from '@tabler/icons-react'
import { PhotoView } from 'react-photo-view'
import { useWorkoutStore } from '@//store/workout-store'

interface ViewWorkoutProps {
  workoutId: string
  onEdit?: () => void
  onDelete?: () => void
}

export default function ViewWorkout({
  workoutId,
  onEdit,
  onDelete,
}: ViewWorkoutProps) {
  const { workouts } = useWorkoutStore()

  const workout = workouts.find((w) => w.id === workoutId)

  if (!workout) {
    return (
      <Card className='p-6'>
        <CardBody>
          <p className='text-center text-default-500'>Workout not found</p>
        </CardBody>
      </Card>
    )
  }

  return (
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
              <IconWeight size={16} />
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
                        className='w-full h-48 object-cover rounded-lg cursor-pointer'
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
                          <PhotoView src={urlLink.thumbnailUrl}>
                            <img
                              src={urlLink.thumbnailUrl}
                              alt='Video thumbnail'
                              className='w-24 h-18 object-cover rounded cursor-pointer'
                            />
                          </PhotoView>
                          <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                            <div className='w-10 h-10 bg-red-600 rounded-full flex items-center justify-center'>
                              <div className='w-0 h-0 border-l-[8px] border-l-white border-y-[5px] border-y-transparent ml-1'></div>
                            </div>
                          </div>
                        </div>
                      ) : urlLink.type === 'image' ? (
                        <PhotoView src={urlLink.thumbnailUrl}>
                          <img
                            src={urlLink.thumbnailUrl}
                            alt='Link thumbnail'
                            className='w-24 h-18 object-cover rounded cursor-pointer'
                          />
                        </PhotoView>
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
                      <a
                        href={urlLink.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-primary hover:underline'>
                        {urlLink.title || 'External Link'}
                      </a>
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
                    <p className='text-sm text-default-500 mt-1'>{set.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  )
}
