import { create } from 'zustand'
import { WorkoutPlan, CreateWorkoutPlanData, Media, UrlLink } from '@/types/gym'
import { db, type Category } from '@/lib/database'
import { v4 as uuidv4 } from 'uuid'
import { type UrlMetadata } from '@/lib/url-metadata-fetcher'

interface WorkoutStore {
  workouts: WorkoutPlan[]
  categories: string[]
  isLoading: boolean
  error: string | null

  // Actions
  loadWorkouts: () => Promise<void>
  loadCategories: () => Promise<void>
  addCategory: (name: string) => Promise<void>
  deleteCategory: (name: string) => Promise<void>
  addWorkout: (data: CreateWorkoutPlanData) => Promise<void>
  updateWorkout: (id: string, data: Partial<WorkoutPlan>) => Promise<void>
  deleteWorkout: (id: string) => Promise<void>
  getWorkoutById: (id: string) => WorkoutPlan | undefined
  getWorkoutsByCategory: (category?: string) => WorkoutPlan[]
  getUniqueCategories: () => string[]
  isCategoryUsed: (categoryName: string) => boolean
  // Media management
  fileToMedia: (file: File) => Media
  urlMetadataToUrlLink: (metadata: UrlMetadata) => UrlLink
  addMediaToWorkout: (workoutId: string, files: File[]) => Promise<void>
  removeMediaFromWorkout: (workoutId: string, mediaId: string) => Promise<void>
  updateWorkoutMedia: (workoutId: string, files: File[]) => Promise<void>
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  workouts: [],
  categories: [],
  isLoading: false,
  error: null,

  loadWorkouts: async () => {
    set({ isLoading: true, error: null })
    try {
      const workouts = await db.workoutPlans
        .orderBy('createdAt')
        .reverse()
        .toArray()

      // Load media for each workout and recreate object URLs
      const workoutsWithMedia = await Promise.all(
        workouts.map(async (workout) => {
          if (workout.media && workout.media.length > 0) {
            const mediaWithUrls = await Promise.all(
              workout.media.map(async (mediaRef) => {
                try {
                  const fullMedia = await db.media.get(mediaRef.id)
                  if (fullMedia && fullMedia.blob) {
                    return {
                      ...fullMedia,
                      url: URL.createObjectURL(fullMedia.blob),
                    }
                  }
                  return mediaRef
                } catch (error) {
                  console.error('Failed to load media:', error)
                  return mediaRef
                }
              })
            )
            return { ...workout, media: mediaWithUrls }
          }
          return workout
        })
      )

      set({ workouts: workoutsWithMedia, isLoading: false })
    } catch (error) {
      set({ error: 'Failed to load workouts', isLoading: false })
    }
  },

  loadCategories: async () => {
    try {
      const categories = await db.categories.orderBy('name').toArray()
      set({ categories: categories.map((c) => c.name) })
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  },

  addCategory: async (name: string) => {
    if (!name.trim()) return

    try {
      const trimmedName = name.trim()

      // Check if category already exists
      const existingCategory = await db.categories
        .where('name')
        .equalsIgnoreCase(trimmedName)
        .first()

      if (existingCategory) {
        return // Category already exists
      }

      const category: Category = {
        id: uuidv4(),
        name: trimmedName,
        createdAt: new Date(),
      }

      await db.categories.add(category)

      // Update the categories in state
      set((state) => ({
        categories: [...state.categories, trimmedName].sort(),
      }))
    } catch (error) {
      console.error('Failed to add category:', error)
    }
  },

  deleteCategory: async (name: string) => {
    try {
      const trimmedName = name.trim()

      // Check if category is used by any workout
      const { workouts } = get()
      const isUsed = workouts.some(
        (workout) => workout.category === trimmedName
      )

      if (isUsed) {
        throw new Error('Cannot delete category that is being used by workouts')
      }

      // Delete from database
      await db.categories.where('name').equalsIgnoreCase(trimmedName).delete()

      // Update the categories in state
      set((state) => ({
        categories: state.categories.filter((cat) => cat !== trimmedName),
      }))
    } catch (error) {
      console.error('Failed to delete category:', error)
      throw error
    }
  },

  addWorkout: async (data: CreateWorkoutPlanData) => {
    set({ isLoading: true, error: null })
    try {
      // Add category to database if it doesn't exist
      if (data.category && data.category.trim()) {
        await get().addCategory(data.category.trim())
      }

      // Process media files if any
      const mediaItems = data.media
        ? await Promise.all(
            data.media.map(async (file) => {
              const media = get().fileToMedia(file)
              // Store in IndexedDB
              await db.media.add(media)
              return media
            })
          )
        : []

      // Process URL links if any
      const urlLinks = data.urlLinks
        ? data.urlLinks.map((metadata) => get().urlMetadataToUrlLink(metadata))
        : []

      const now = new Date()
      const workout: WorkoutPlan = {
        id: uuidv4(),
        title: data.title,
        description: data.description,
        category: data.category,
        createdAt: now,
        updatedAt: now,
        sets: data.sets.map((set) => ({
          id: uuidv4(),
          reps: set.reps,
          weight: set.weight,
          notes: set.notes,
        })),
        media: mediaItems,
        urlLinks: urlLinks,
      }

      await db.workoutPlans.add(workout)
      set((state) => ({
        workouts: [workout, ...state.workouts],
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to add workout', isLoading: false })
    }
  },

  updateWorkout: async (id: string, data: Partial<WorkoutPlan>) => {
    set({ isLoading: true, error: null })
    try {
      await db.workoutPlans.update(id, { ...data, updatedAt: new Date() })
      set((state) => ({
        workouts: state.workouts.map((w) =>
          w.id === id ? { ...w, ...data, updatedAt: new Date() } : w
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to update workout', isLoading: false })
    }
  },

  deleteWorkout: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      // Get the workout to access its media
      const workout = get().workouts.find((w) => w.id === id)

      if (workout && workout.media && workout.media.length > 0) {
        // Delete all associated media from the database and revoke object URLs
        await Promise.all(
          workout.media.map(async (media) => {
            // Revoke object URL to free memory
            URL.revokeObjectURL(media.url)
            // Delete from media database
            await db.media.delete(media.id)
          })
        )
      }

      // Delete the workout from database
      await db.workoutPlans.delete(id)

      set((state) => ({
        workouts: state.workouts.filter((w) => w.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to delete workout', isLoading: false })
    }
  },

  getWorkoutById: (id: string) => {
    const { workouts } = get()
    return workouts.find((w) => w.id === id)
  },

  getWorkoutsByCategory: (category?: string) => {
    const { workouts } = get()
    if (!category) return workouts
    return workouts.filter((w) => w.category === category)
  },

  getUniqueCategories: () => {
    const { workouts, categories } = get()
    const workoutCategories = workouts
      .map((w) => w.category)
      .filter((category): category is string => Boolean(category))

    // Combine database categories with workout categories
    const allCategories = [...categories, ...workoutCategories]
    return Array.from(new Set(allCategories)).sort()
  },

  isCategoryUsed: (categoryName: string) => {
    const { workouts } = get()
    return workouts.some((workout) => workout.category === categoryName)
  },

  // Helper method to convert File to Media
  fileToMedia: (file: File): Media => {
    const mediaId = uuidv4()
    return {
      id: mediaId,
      type: file.type.startsWith('image/') ? 'photo' : 'video',
      url: URL.createObjectURL(file),
      blob: file,
      name:
        file.name ||
        `${file.type.startsWith('image/') ? 'photo' : 'video'}-${Date.now()}`,
      size: file.size,
      createdAt: new Date(),
    }
  },

  urlMetadataToUrlLink: (metadata: UrlMetadata): UrlLink => {
    return {
      id: uuidv4(),
      url: metadata.url,
      title: metadata.title,
      description: metadata.description,
      thumbnailUrl: metadata.thumbnailUrl,
      type: metadata.type,
      isYouTube: metadata.isYouTube,
      youTubeId: metadata.youTubeId,
      embedUrl: metadata.embedUrl,
      createdAt: new Date(),
    }
  },

  // Media management methods
  addMediaToWorkout: async (workoutId: string, files: File[]) => {
    try {
      const workout = get().workouts.find((w) => w.id === workoutId)
      if (!workout) return

      const mediaItems = await Promise.all(
        files.map(async (file) => {
          const media = get().fileToMedia(file)

          // Store in IndexedDB
          await db.media.add(media)

          return media
        })
      )

      const updatedMedia = [...workout.media, ...mediaItems]
      await db.workoutPlans.update(workoutId, { media: updatedMedia })

      set((state) => ({
        workouts: state.workouts.map((w) =>
          w.id === workoutId ? { ...w, media: updatedMedia } : w
        ),
      }))
    } catch (error) {
      console.error('Failed to add media to workout:', error)
    }
  },

  removeMediaFromWorkout: async (workoutId: string, mediaId: string) => {
    try {
      const workout = get().workouts.find((w) => w.id === workoutId)
      if (!workout) return

      // Get the media item to revoke its object URL
      const mediaItem = workout.media.find((m) => m.id === mediaId)
      if (mediaItem) {
        URL.revokeObjectURL(mediaItem.url)
      }

      // Remove media from database
      await db.media.delete(mediaId)

      const updatedMedia = workout.media.filter((m) => m.id !== mediaId)
      await db.workoutPlans.update(workoutId, { media: updatedMedia })

      set((state) => ({
        workouts: state.workouts.map((w) =>
          w.id === workoutId ? { ...w, media: updatedMedia } : w
        ),
      }))
    } catch (error) {
      console.error('Failed to remove media from workout:', error)
    }
  },

  updateWorkoutMedia: async (workoutId: string, files: File[]) => {
    try {
      const workout = get().workouts.find((w) => w.id === workoutId)
      if (!workout) return

      // Remove all existing media and revoke object URLs
      await Promise.all(
        workout.media.map(async (media) => {
          URL.revokeObjectURL(media.url)
          await db.media.delete(media.id)
        })
      )

      // Add new media
      const mediaItems = await Promise.all(
        files.map(async (file) => {
          const media = get().fileToMedia(file)
          await db.media.add(media)
          return media
        })
      )

      await db.workoutPlans.update(workoutId, { media: mediaItems })

      set((state) => ({
        workouts: state.workouts.map((w) =>
          w.id === workoutId ? { ...w, media: mediaItems } : w
        ),
      }))
    } catch (error) {
      console.error('Failed to update workout media:', error)
    }
  },
}))
