import { ReactElement } from 'react'

export interface SwipeAction {
  id: string
  label: string
  icon: ReactElement
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default'
  variant?: 'solid' | 'flat' | 'ghost' | 'light'
  onPress: () => void
  width?: number
}

export interface SwipeActionsConfig {
  leftActions?: SwipeAction[]
  rightActions?: SwipeAction[]
  threshold?: number
  dragSpeedMultiplier?: number
  animationDuration?: number
}

export interface SwipeActionsProps {
  children: ReactElement
  config: SwipeActionsConfig
  disabled?: boolean
  className?: string
}
