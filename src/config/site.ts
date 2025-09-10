export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: 'Gym Manager',
  description: 'Offline-first gym manager for workout plans and tracking.',
  navItems: [
    {
      label: 'Dashboard',
      href: '/',
    },
    {
      label: 'Workouts',
      href: '/workouts',
    },
    {
      label: 'Add Workout',
      href: '/workouts/add',
    },
  ],
  navMenuItems: [
    {
      label: 'Dashboard',
      href: '/',
    },
    {
      label: 'Workouts',
      href: '/workouts',
    },
    {
      label: 'Add Workout',
      href: '/workouts/add',
    },
    {
      label: 'Settings',
      href: '/settings',
    },
  ],
  links: {
    github: 'https://github.com/gym-manager',
  },
}
