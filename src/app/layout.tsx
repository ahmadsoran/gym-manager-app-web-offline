import '@/styles/globals.css'
import { Metadata, Viewport } from 'next'
import clsx from 'clsx'

import { Providers } from './providers'
import BottomNavigation from '@//components/bottom-navigation'

import { siteConfig } from '@//config/site'
import { fontSans } from '@//config/fonts'

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevent zoom on mobile
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning lang='en'>
      <head />
      <body
        className={clsx(
          'min-h-screen text-foreground bg-background font-sans antialiased',
          fontSans.variable
        )}>
        <Providers themeProps={{ attribute: 'class', defaultTheme: 'dark' }}>
          <div className='relative flex flex-col min-h-screen max-w-sm mx-auto bg-background py-10'>
            <main className='flex-1 pb-20 safe-area-bottom'>{children}</main>
            <BottomNavigation />
          </div>
        </Providers>
      </body>
    </html>
  )
}
