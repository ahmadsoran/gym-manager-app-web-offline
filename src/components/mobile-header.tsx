'use client'

import { Button } from '@heroui/button'
import { IconArrowLeft } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { ThemeSwitch } from './theme-switch'

interface MobileHeaderProps {
  title: string
  showBack?: boolean
  backHref?: string
  actions?: React.ReactNode
  showThemeSwitch?: boolean
}

export default function MobileHeader({
  title,
  showBack = false,
  backHref,
  actions,
  showThemeSwitch = true,
}: MobileHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  return (
    <header className='sticky top-0 z-50 w-full border-b border-divider bg-background/80 backdrop-blur-md'>
      <div className='flex h-14 items-center justify-between px-4'>
        {/* Left Section */}
        <div className='flex items-center gap-2'>
          {showBack && (
            <Button
              isIconOnly
              variant='light'
              size='sm'
              onPress={handleBack}
              aria-label='Go back'>
              <IconArrowLeft size={20} />
            </Button>
          )}
          <p className='text-lg font-semibold truncate'>{title}</p>
        </div>

        {/* Right Section */}
        <div className='flex items-center gap-2'>
          {showThemeSwitch && <ThemeSwitch />}
          {actions}
        </div>
      </div>
    </header>
  )
}
