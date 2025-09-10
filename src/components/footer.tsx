'use client'

import { IconX } from '@tabler/icons-react'
import Link from 'next/link'
import { useState } from 'react'

export default function Footer() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) {
    return null
  }

  return (
    <footer className='px-6 pb-16 text-center text-xs text-muted-foreground relative'>
      <button
        onClick={() => setIsVisible(false)}
        className='text-muted-foreground hover:text-foreground transition-colors p-1'
        aria-label='Hide footer'>
        <IconX size={16} />
      </button>
      <p>
        Made with ❤️ by{' '}
        <Link
          href='https://ahmedsoran.dev'
          target='_blank'
          rel='noopener noreferrer'
          className='text-primary hover:underline'>
          Ahmed Soran
        </Link>
      </p>
      <p className='mt-1'>
        Source code available on{' '}
        <Link
          href='https://github.com/ahmadsoran/gym-manager-app-web-offline'
          target='_blank'
          rel='noopener noreferrer'
          className='text-primary hover:underline'>
          GitHub
        </Link>
        , feel free to contribute!
      </p>
    </footer>
  )
}
