// Core types for Gym Manager App based on data-model.md

export interface WorkoutPlan {
  id: string // UUID
  title: string
  description?: string
  category?: string
  createdAt: Date
  updatedAt: Date
  sets: Set[]
  media: Media[]
}

export interface Set {
  id: string // UUID
  reps: number
  weight?: number
  notes?: string
}

export interface Media {
  id: string // UUID
  type: 'photo' | 'video'
  url: string // IndexedDB reference
  createdAt: Date
}

// Form types for creating/editing
export interface CreateWorkoutPlanData {
  title: string
  description?: string
  category?: string
  sets: CreateSetData[]
}

export interface CreateSetData {
  reps: number
  weight?: number
  notes?: string
}

// Validation constraints from data-model.md
export const VALIDATION_RULES = {
  title: {
    required: true,
    maxLength: 100,
  },
  sets: {
    minCount: 1,
  },
} as const
