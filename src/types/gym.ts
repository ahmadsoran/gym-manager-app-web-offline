// Core types for Workout Manager App based on data-model.md

export interface WorkoutPlan {
  id: string // UUID
  title: string
  description?: string
  category?: string
  createdAt: Date
  updatedAt: Date
  sets: Set[]
  media: Media[]
  urlLinks?: UrlLink[]
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
  url: string // Object URL for display
  blob: Blob // Actual file data
  name: string // Original filename
  size: number // File size in bytes
  createdAt: Date
}

export interface UrlLink {
  id: string // UUID
  url: string
  title?: string
  description?: string
  thumbnailUrl?: string
  type: 'video' | 'image' | 'webpage'
  isYouTube?: boolean
  youTubeId?: string
  embedUrl?: string
  createdAt: Date
}

// Form types for creating/editing
export interface CreateWorkoutPlanData {
  title: string
  description?: string
  category?: string
  sets: CreateSetData[]
  media?: File[]
  urlLinks?: import('@/lib/url-metadata-fetcher').UrlMetadata[]
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
