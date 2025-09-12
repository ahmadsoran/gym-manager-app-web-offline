import { useRef, useState, useCallback, useEffect } from 'react'

interface UseIosContextMenuProps {
  onLongPress?: () => void
  longPressDelay?: number
}

interface UseIosContextMenuReturn {
  isPressed: boolean
  isLongPressed: boolean
  cardRef: React.RefObject<HTMLDivElement>
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void
    onPointerUp: () => void
    onPointerLeave: () => void
    onPointerMove: (e: React.PointerEvent) => void
  }
  resetPress: () => void
}

export function useIosContextMenu({
  onLongPress,
  longPressDelay = 500,
}: UseIosContextMenuProps = {}): UseIosContextMenuReturn {
  const [isPressed, setIsPressed] = useState(false)
  const [isLongPressed, setIsLongPressed] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const startPositionRef = useRef<{ x: number; y: number } | null>(null)

  const clearLongPressTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const resetPress = useCallback(() => {
    setIsPressed(false)
    setIsLongPressed(false)
    clearLongPressTimeout()
    startPositionRef.current = null
  }, [clearLongPressTimeout])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      setIsPressed(true)
      startPositionRef.current = { x: e.clientX, y: e.clientY }

      timeoutRef.current = setTimeout(() => {
        setIsLongPressed(true)
        onLongPress?.()

        // Add haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }
      }, longPressDelay)
    },
    [onLongPress, longPressDelay]
  )

  const handlePointerUp = useCallback(() => {
    if (!isLongPressed) {
      resetPress()
    }
  }, [isLongPressed, resetPress])

  const handlePointerLeave = useCallback(() => {
    if (!isLongPressed) {
      resetPress()
    }
  }, [isLongPressed, resetPress])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startPositionRef.current) return

      const deltaX = Math.abs(e.clientX - startPositionRef.current.x)
      const deltaY = Math.abs(e.clientY - startPositionRef.current.y)
      const threshold = 10

      // Cancel long press if user moves too much
      if (deltaX > threshold || deltaY > threshold) {
        if (!isLongPressed) {
          resetPress()
        }
      }
    },
    [isLongPressed, resetPress]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLongPressTimeout()
    }
  }, [clearLongPressTimeout])

  return {
    isPressed,
    isLongPressed,
    cardRef,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerLeave,
      onPointerMove: handlePointerMove,
    },
    resetPress,
  }
}
