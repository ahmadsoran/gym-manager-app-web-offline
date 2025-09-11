export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: 'Workout Manager',
  description: 'Offline-first Workout Manager for workout plans and tracking.',
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
      href: '/workouts?action=create',
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
      href: '/workouts?action=create',
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
