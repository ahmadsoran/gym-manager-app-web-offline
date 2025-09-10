import Dexie, { Table } from 'dexie'
import { WorkoutPlan, Media } from '@//types/gym'

interface Category {
  id: string
  name: string
  createdAt: Date
}

export class GymDatabase extends Dexie {
  workoutPlans!: Table<WorkoutPlan>
  media!: Table<Media>
  categories!: Table<Category>

  constructor() {
    super('GymManagerDB')

    this.version(1).stores({
      workoutPlans: 'id, title, category, createdAt, updatedAt',
      media: 'id, type, createdAt',
    })

    this.version(2).stores({
      workoutPlans: 'id, title, category, createdAt, updatedAt',
      media: 'id, type, createdAt',
      categories: 'id, name, createdAt',
    })
  }
}

export const db = new GymDatabase()

export type { Category }
