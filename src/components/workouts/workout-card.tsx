'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody } from '@heroui/card'
import { Button, ButtonGroup } from '@heroui/button'
import { Chip } from '@heroui/chip'
import { motion } from 'framer-motion'
import { IconBarbell, IconEdit, IconEye, IconTrash } from '@tabler/icons-react'
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
  const [dragX, setDragX] = useState(0)
  const [isSwipeActionsVisible, setIsSwipeActionsVisible] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)

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
    // Only handle regular clicks if not in long press mode and no swipe actions
    if (!isLongPressed && !isPressed && !isSwipeActionsVisible && !isDragging) {
      e.preventDefault()
      router.push(`/workouts?action=view&id=${workout.id}`)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isLongPressed) return
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
    setCurrentX(e.touches[0].clientX)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    // Call the original iOS context menu handler first
    handlers.onPointerDown(e)

    // Then handle drag if not a touch event
    if (isLongPressed || e.pointerType === 'touch') return
    setIsDragging(true)
    setStartX(e.clientX)
    setCurrentX(e.clientX)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isLongPressed) return
    e.preventDefault()
    const touch = e.touches[0]
    setCurrentX(touch.clientX)
    const diffX = touch.clientX - startX

    // Block drag when reaching the action button limits
    const maxRightDrag = 80
    const maxLeftDrag = -160

    const constrainedDragX = Math.max(
      maxLeftDrag,
      Math.min(maxRightDrag, diffX)
    )
    setDragX(constrainedDragX)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    // Call the original iOS context menu handler first
    handlers.onPointerMove(e)

    // Then handle drag if not a touch event
    if (!isDragging || isLongPressed || e.pointerType === 'touch') return
    e.preventDefault()
    setCurrentX(e.clientX)
    const diffX = e.clientX - startX

    // Block drag when reaching the action button limits
    const maxRightDrag = 80
    const maxLeftDrag = -160

    const constrainedDragX = Math.max(
      maxLeftDrag,
      Math.min(maxRightDrag, diffX)
    )
    setDragX(constrainedDragX)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const diffX = currentX - startX
    const rightSwipeThreshold = 40
    const leftSwipeThreshold = 40

    if (diffX > rightSwipeThreshold) {
      // Swiped right more than 40px - snap to 80px to show left action button
      setDragX(80)
      setIsSwipeActionsVisible(true)
    } else if (diffX < -leftSwipeThreshold) {
      // Swiped left more than 40px - snap to -160px to show right action buttons
      setDragX(-160)
      setIsSwipeActionsVisible(true)
    } else {
      // Return to origin
      setDragX(0)
      setIsSwipeActionsVisible(false)
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    // Call the original iOS context menu handler first
    handlers.onPointerUp()

    // Then handle drag if not a touch event
    if (!isDragging || e.pointerType === 'touch') return
    setIsDragging(false)

    const diffX = currentX - startX
    const rightSwipeThreshold = 40
    const leftSwipeThreshold = 40

    if (diffX > rightSwipeThreshold) {
      // Swiped right more than 40px - snap to 80px to show left action button
      setDragX(80)
      setIsSwipeActionsVisible(true)
    } else if (diffX < -leftSwipeThreshold) {
      // Swiped left more than 40px - snap to -160px to show right action buttons
      setDragX(-160)
      setIsSwipeActionsVisible(true)
    } else {
      // Return to origin
      setDragX(0)
      setIsSwipeActionsVisible(false)
    }
  }

  const handlePointerLeave = (e: React.PointerEvent) => {
    // Call the original iOS context menu handler first
    handlers.onPointerLeave()

    // Reset drag state if dragging
    if (isDragging && e.pointerType !== 'touch') {
      setIsDragging(false)
      setDragX(0)
      setIsSwipeActionsVisible(false)
    }
  }

  const handleEdit = () => {
    router.push(`/workouts?action=edit&id=${workout.id}`)
    setDragX(0)
    setIsSwipeActionsVisible(false)
  }

  const handleDelete = () => {
    onDelete(workout.id)
    setDragX(0)
    setIsSwipeActionsVisible(false)
  }

  const handleView = () => {
    router.push(`/workouts?action=view&id=${workout.id}`)
    setDragX(0)
    setIsSwipeActionsVisible(false)
  }

  return (
    <>
      <div className='relative overflow-hidden'>
        {/* Swipe Actions Background */}
        <div className='absolute left-0 top-0 bottom-0 flex items-center scale-90'>
          <Button
            isIconOnly
            size='sm'
            variant='flat'
            color='primary'
            className='h-full w-20'
            onPress={handleView}
            aria-label='View workout'>
            <IconEye size={16} />
          </Button>
        </div>
        <div className='absolute right-0 top-0 bottom-0 flex items-center scale-90'>
          <ButtonGroup className='h-full'>
            <Button
              isIconOnly
              size='sm'
              variant='flat'
              color='primary'
              className='h-full w-20'
              onPress={handleEdit}
              aria-label='Edit workout'>
              <IconEdit size={16} />
            </Button>
            <Button
              isIconOnly
              size='sm'
              variant='flat'
              color='danger'
              className='h-full w-20'
              onPress={handleDelete}
              aria-label='Delete workout'>
              <IconTrash size={16} />
            </Button>
          </ButtonGroup>
        </div>

        {/* Main Card */}
        <motion.div
          ref={cardRef}
          animate={{
            scale: isPressed ? 0.98 : 1,
            opacity: isLongPressed ? 0.8 : 1,
            x: dragX,
          }}
          transition={{
            type: 'tween',
            duration: 0.2,
          }}
          className='touch-none select-none relative z-10'
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}>
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
      </div>

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
