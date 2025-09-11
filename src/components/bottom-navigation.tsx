'use client'

import { usePathname } from 'next/navigation'
import { Link } from '@heroui/link'
import { IconHome, IconList, IconPlus } from '@tabler/icons-react'
import clsx from 'clsx'
import { cn } from '@heroui/theme'

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: IconHome,
  },
  {
    label: 'Workouts',
    href: '/workouts',
    icon: IconList,
  },
  {
    label: 'Add',
    href: '/workouts?action=add',
    icon: IconPlus,
    isSpecial: true, // This will be the floating action button style
  },
]

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className='fixed bottom-0 left-0 right-0 z-50 border-t border-divider/20 bg-background/70 backdrop-blur-xl backdrop-saturate-150 pb-5'>
      {/* Glassy effect overlay */}
      <div className='absolute inset-0 bg-gradient-to-t from-background/80 to-background/40 backdrop-blur-xl' />

      <div className='relative flex items-center justify-around px-2 py-2 safe-area-bottom'>
        {navigationItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon

          if (item.isSpecial) {
            // Special floating action button for Add
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-200',
                  'bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary/25',
                  'hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95',
                  'backdrop-blur-sm bg-opacity-90'
                )}>
                <Icon
                  size={24}
                  className={cn(
                    'text-default-foreground/50 drop-shadow-sm',
                    isActive && 'text-primary'
                  )}
                />
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200 min-w-16',
                'hover:bg-primary/10 active:scale-95',
                isActive
                  ? 'text-primary bg-primary/10 shadow-sm'
                  : 'text-default-500 hover:text-foreground'
              )}>
              <Icon
                size={22}
                className={clsx(
                  'mb-1 transition-colors',
                  isActive ? 'text-primary' : 'text-current'
                )}
              />
              <span
                className={clsx(
                  'text-xs font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-current'
                )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
