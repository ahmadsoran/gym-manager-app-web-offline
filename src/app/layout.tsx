import '@/styles/globals.css'
import { Metadata, Viewport } from 'next'
import clsx from 'clsx'

import { Providers } from './providers'
import BottomNavigation from '@//components/bottom-navigation'
import PWAManager from '@//components/pwa-manager'

import { siteConfig } from '@//config/site'
import { fontSans } from '@//config/fonts'

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Gym Manager',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: {
      default: siteConfig.name,
      template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary',
    title: {
      default: siteConfig.name,
      template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: [
      { url: '/icons/icon-192x192.png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevent zoom on mobile
  viewportFit: 'cover', // For iPhone X+ notch support
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
            <PWAManager />
          </div>
        </Providers>
      </body>
    </html>
  )
}
