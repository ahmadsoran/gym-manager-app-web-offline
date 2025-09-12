'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Button } from '@heroui/button'
import { IconX } from '@tabler/icons-react'
import ViewWorkout from '@/components/workouts/view-workout'
import { ScrollShadow } from '@heroui/scroll-shadow'

interface IosContextModalProps {
  isOpen: boolean
  onClose: () => void
  workoutId: string
  initialRect?: DOMRect | null
  onEdit?: () => void
  onDelete?: () => void
}

export default function IosContextModal({
  isOpen,
  onClose,
  workoutId,
  initialRect,
  onEdit,
  onDelete,
}: IosContextModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
          />

          {/* Modal Content */}
          <motion.div
            ref={modalRef}
            className='fixed z-50 rounded-2xl p-0 overflow-hidden'
            initial={
              initialRect
                ? {
                    left: initialRect.left,
                    top: initialRect.top,
                    width: initialRect.width,
                    height: initialRect.height,
                    scale: 1,
                  }
                : {
                    left: '50%',
                    top: '50%',
                    width: 320,
                    height: 200,
                    scale: 0.8,
                    x: '-50%',
                    y: '-50%',
                  }
            }
            animate={{
              left: '5%',
              top: '5%',
              width: '90%',
              height: '90%',
              scale: 1,
              x: 0,
              y: 0,
            }}
            exit={
              initialRect
                ? {
                    left: initialRect.left,
                    top: initialRect.top,
                    width: initialRect.width,
                    height: initialRect.height,
                    scale: 0.95,
                    opacity: 0,
                  }
                : {
                    scale: 0.8,
                    opacity: 0,
                  }
            }
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 200,
              duration: 0.4,
            }}>
            {/* Close Button */}
            <div className='absolute top-4 right-4 z-50'>
              <Button
                isIconOnly
                size='sm'
                variant='flat'
                className='shadow-md shadow-black/20'
                color='primary'
                radius='full'
                onPress={onClose}>
                <IconX size={16} />
              </Button>
            </div>
            {/* Content */}
            <ScrollShadow className='h-full flex justify-center'>
              <div className='w-full max-w-sm rounded-2xl'>
                <ViewWorkout
                  workoutId={workoutId}
                  onEdit={() => {
                    onClose()
                    onEdit?.()
                  }}
                  onDelete={() => {
                    onClose()
                    onDelete?.()
                  }}
                />
              </div>
            </ScrollShadow>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
