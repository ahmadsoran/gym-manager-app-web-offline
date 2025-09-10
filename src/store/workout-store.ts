import { create } from 'zustand'
import { WorkoutPlan, CreateWorkoutPlanData } from '@//types/gym'
import { db, type Category } from '@//lib/database'
import { v4 as uuidv4 } from 'uuid'

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
      set({ workouts, isLoading: false })
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
        media: [],
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
}))
