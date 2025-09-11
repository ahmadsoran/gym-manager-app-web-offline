import { MetadataRoute } from 'next'
import { db } from '@/lib/database'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://workout-manager-app.ahmedsoran.dev'

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/workouts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/workouts/add`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/offline`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Dynamic workout routes
  let dynamicRoutes: MetadataRoute.Sitemap = []

  try {
    // Get all workouts from the database
    const workouts = await db.workoutPlans.toArray()

    dynamicRoutes = workouts.map((workout) => ({
      url: `${baseUrl}/workouts/${workout.id}`,
      lastModified: workout.updatedAt || workout.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Get unique categories for category-based routes
    const categoriesSet = new Set(
      workouts.map((w) => w.category).filter(Boolean)
    )
    const categories = Array.from(categoriesSet)
    const categoryRoutes: MetadataRoute.Sitemap = categories.map(
      (category) => ({
        url: `${baseUrl}/workouts?category=${encodeURIComponent(category!)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })
    )

    dynamicRoutes = [...dynamicRoutes, ...categoryRoutes]
  } catch (error) {
    // Fallback in case database is not accessible (e.g., during build)
    console.warn('Could not generate dynamic sitemap routes:', error)
  }

  return [...staticRoutes, ...dynamicRoutes]
}
