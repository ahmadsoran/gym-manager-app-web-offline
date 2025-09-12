'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody } from '@heroui/card'
import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
import { motion } from 'framer-motion'
import { IconBarbell, IconEye, IconEdit, IconTrash } from '@tabler/icons-react'
import { useIosContextMenu } from '@/hooks/use-ios-context-menu'
import IosContextModal from './ios-context-modal'
import type { WorkoutPlan } from '@/types/gym'

interface WorkoutCardProps {
  workout: WorkoutPlan
  onDelete: (id: string) => void
}

export default function WorkoutCard({ workout, onDelete }: WorkoutCardProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cardRect, setCardRect] = useState<DOMRect | null>(null)

  const { isPressed, isLongPressed, cardRef, handlers, resetPress } =
    useIosContextMenu({
      onLongPress: () => {
        // Capture the card's position for animation
        if (cardRef.current) {
          const rect = cardRef.current.getBoundingClientRect()
          setCardRect(rect)
        }
        setIsModalOpen(true)
      },
      longPressDelay: 500,
    })

  const handleModalClose = () => {
    setIsModalOpen(false)
    resetPress()
    setTimeout(() => setCardRect(null), 400) // Clear after animation
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Only handle regular clicks if not in long press mode
    if (!isLongPressed && !isPressed) {
      e.preventDefault()
      router.push(`/workouts?action=view&id=${workout.id}`)
    }
  }

  return (
    <>
      <motion.div
        ref={cardRef}
        animate={{
          scale: isPressed ? 0.98 : 1,
          opacity: isLongPressed ? 0.8 : 1,
        }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300,
        }}
        className='touch-none select-none'
        {...handlers}>
        <Card
          className={`
            hover:shadow-md transition-all duration-200 cursor-pointer
            ${isPressed ? 'shadow-lg' : ''}
            ${isLongPressed ? 'pointer-events-none' : ''}
          `}
          onClick={handleCardClick}>
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
                  {new Date(workout.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit',
                  })}
                </div>
              </div>

              <div className='flex gap-1' onClick={(e) => e.stopPropagation()}>
                <Button
                  onPress={() =>
                    router.push(`/workouts?action=view&id=${workout.id}`)
                  }
                  isIconOnly
                  size='sm'
                  radius='full'
                  variant='shadow'
                  color='default'
                  aria-label='View workout details'>
                  <IconEye size={14} />
                </Button>
                <Button
                  onPress={() =>
                    router.push(`/workouts?action=edit&id=${workout.id}`)
                  }
                  isIconOnly
                  size='sm'
                  radius='full'
                  variant='shadow'
                  color='primary'
                  aria-label='Edit workout'>
                  <IconEdit size={14} />
                </Button>
                <Button
                  isIconOnly
                  size='sm'
                  variant='shadow'
                  radius='full'
                  color='danger'
                  aria-label='Delete workout'
                  onPress={() => onDelete(workout.id)}>
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
      </motion.div>

      {/* iOS Context Modal */}
      <IosContextModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        workoutId={workout.id}
        initialRect={cardRect}
        onEdit={() => router.push(`/workouts?action=edit&id=${workout.id}`)}
        onDelete={() => onDelete(workout.id)}
      />
    </>
  )
}
