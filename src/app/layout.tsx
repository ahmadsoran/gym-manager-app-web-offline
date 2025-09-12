import '@/styles/globals.css'
import { Viewport } from 'next'
import clsx from 'clsx'

import { Providers } from './providers'
import BottomNavigation from '@/components/bottom-navigation'
import PWAManager from '@/components/pwa-manager'
import Footer from '@/components/footer'

import { fontSans } from '@/config/fonts'
import { commonViewport, generateMetadata } from '@/lib/metadata'

export const metadata = generateMetadata()
export const viewport: Viewport = commonViewport

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
            <main className='flex-1 safe-area-bottom'>{children}</main>
            <Footer />
            <BottomNavigation />
            <PWAManager />
          </div>
        </Providers>
      </body>
    </html>
  )
}
