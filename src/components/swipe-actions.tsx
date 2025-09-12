'use client'

import { useState, useEffect, useRef, cloneElement } from 'react'
import { motion } from 'framer-motion'
import { Button, ButtonGroup } from '@heroui/button'
import type { SwipeActionsProps, SwipeAction } from '@/types/swipe-actions'

export default function SwipeActions({
  children,
  config,
  disabled = false,
  className = '',
}: SwipeActionsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragX, setDragX] = useState(0)
  const [isSwipeActionsVisible, setIsSwipeActionsVisible] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)

  const {
    leftActions = [],
    rightActions = [],
    threshold = 0.3,
    dragSpeedMultiplier = 1,
    animationDuration = 0.2,
  } = config

  // Calculate container widths
  const leftActionsWidth = leftActions.reduce(
    (sum, action) => sum + (action.width || 80),
    0
  )
  const rightActionsWidth = rightActions.reduce(
    (sum, action) => sum + (action.width || 80),
    0
  )

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return

    // Only handle mouse events with pointer
    if (e.pointerType === 'touch') return

    setIsDragging(true)
    setStartX(e.clientX)
    setCurrentX(e.clientX)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || disabled || e.pointerType === 'touch') return

    e.preventDefault()
    setCurrentX(e.clientX)
    const diffX = (e.clientX - startX) * dragSpeedMultiplier

    // Constrain drag based on available actions
    const maxLeftDrag = leftActions.length > 0 ? leftActionsWidth : 0
    const maxRightDrag = rightActions.length > 0 ? -rightActionsWidth : 0

    const constrainedDragX = Math.max(
      maxRightDrag,
      Math.min(maxLeftDrag, diffX)
    )
    setDragX(constrainedDragX)
  }

  const handlePointerUp = () => {
    if (!isDragging || disabled) return

    setIsDragging(false)

    const diffX = currentX - startX
    const leftThreshold = leftActionsWidth * threshold
    const rightThreshold = rightActionsWidth * threshold

    if (diffX > leftThreshold && leftActions.length > 0) {
      // Show left actions
      setDragX(leftActionsWidth)
      setIsSwipeActionsVisible(true)
    } else if (diffX < -rightThreshold && rightActions.length > 0) {
      // Show right actions
      setDragX(-rightActionsWidth)
      setIsSwipeActionsVisible(true)
    } else {
      // Return to origin
      resetSwipe()
    }
  }

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (isDragging && e.pointerType !== 'touch' && !disabled) {
      setIsDragging(false)
      resetSwipe()
    }
  }

  const resetSwipe = () => {
    setDragX(0)
    setIsSwipeActionsVisible(false)
  }

  const handleActionPress = (action: SwipeAction) => {
    action.onPress()
    resetSwipe()
  }

  // Handle touch events with native listeners
  useEffect(() => {
    const element = containerRef.current
    if (!element || disabled) return

    const handleTouchStart = (e: TouchEvent) => {
      setIsDragging(true)
      const touch = e.touches[0]
      setStartX(touch.clientX)
      setCurrentX(touch.clientX)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return

      e.preventDefault()
      const touch = e.touches[0]
      setCurrentX(touch.clientX)
      const diffX = (touch.clientX - startX) * dragSpeedMultiplier

      // Constrain drag based on available actions
      const maxLeftDrag = leftActions.length > 0 ? leftActionsWidth : 0
      const maxRightDrag = rightActions.length > 0 ? -rightActionsWidth : 0

      const constrainedDragX = Math.max(
        maxRightDrag,
        Math.min(maxLeftDrag, diffX)
      )
      setDragX(constrainedDragX)
    }

    const handleTouchEnd = () => {
      if (!isDragging) return

      setIsDragging(false)

      const diffX = currentX - startX
      const leftThreshold = leftActionsWidth * threshold
      const rightThreshold = rightActionsWidth * threshold

      if (diffX > leftThreshold && leftActions.length > 0) {
        // Show left actions
        setDragX(leftActionsWidth)
        setIsSwipeActionsVisible(true)
      } else if (diffX < -rightThreshold && rightActions.length > 0) {
        // Show right actions
        setDragX(-rightActionsWidth)
        setIsSwipeActionsVisible(true)
      } else {
        // Return to origin
        resetSwipe()
      }
    }

    // Add listeners with passive: false to allow preventDefault
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [
    isDragging,
    startX,
    currentX,
    leftActionsWidth,
    rightActionsWidth,
    threshold,
    dragSpeedMultiplier,
    leftActions.length,
    rightActions.length,
    disabled,
  ])

  // Handle clicks outside to reset swipe
  useEffect(() => {
    if (!isSwipeActionsVisible) return

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        resetSwipe()
      }
    }

    document.addEventListener('click', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isSwipeActionsVisible])

  const renderActions = (actions: SwipeAction[], side: 'left' | 'right') => {
    if (actions.length === 0) return null

    const isLeft = side === 'left'

    return (
      <div
        className={`absolute top-0 bottom-0 flex items-center ${isLeft ? 'left-0' : 'right-0'} scale-90`}>
        <ButtonGroup className='h-full'>
          {actions.map((action) => (
            <Button
              key={action.id}
              isIconOnly
              size='sm'
              variant={action.variant || 'flat'}
              color={action.color || 'primary'}
              className='h-full'
              style={{ width: action.width || 80 }}
              onPress={() => handleActionPress(action)}
              aria-label={action.label}>
              {action.icon}
            </Button>
          ))}
        </ButtonGroup>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Left Actions */}
      {renderActions(leftActions, 'left')}

      {/* Right Actions */}
      {renderActions(rightActions, 'right')}

      {/* Main Content */}
      <motion.div
        animate={{ x: dragX }}
        transition={{
          type: 'tween',
          duration: animationDuration,
        }}
        className='relative z-10 touch-none select-none'
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}>
        {cloneElement(children, {
          style: {
            ...children.props.style,
            pointerEvents: isSwipeActionsVisible ? 'none' : 'auto',
          },
        })}
      </motion.div>
    </div>
  )
}
