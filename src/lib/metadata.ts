import { Metadata } from 'next'
import { siteConfig } from '@/config/site'

interface MetadataGeneratorOptions {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
}

const siteUrl = 'https://workout-manager-app.ahmedsoran.dev'

export function generateMetadata(
  options: MetadataGeneratorOptions = {}
): Metadata {
  const {
    title,
    description = siteConfig.description,
    keywords = [
      'workout',
      'fitness',
      'gym',
      'exercise',
      'training',
      'offline',
      'PWA',
    ],
    image = '/icons/icon-512x512.png',
    url = '',
  } = options

  const fullTitle = title ? `${title} - ${siteConfig.name}` : siteConfig.name
  const fullUrl = siteUrl.concat(url)
  const fullImageUrl = siteUrl.concat(image)

  return {
    title: {
      default: fullTitle,
      template: title ? `%s - ${siteConfig.name}` : `%s - ${siteConfig.name}`,
    },
    description,
    keywords,
    authors: [{ name: 'Workout Manager Team' }],
    creator: 'Workout Manager',
    publisher: 'Workout Manager',
    alternates: {
      canonical: fullUrl,
    },
    manifest: siteUrl.concat('/manifest.json'),
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: title || 'Workout Manager',
    },
    formatDetection: {
      telephone: false,
    },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title: {
        default: fullTitle,
        template: title ? `%s - ${siteConfig.name}` : `%s - ${siteConfig.name}`,
      },
      description,
      url: fullUrl,
      images: [
        {
          url: fullImageUrl,
          width: 512,
          height: 512,
          alt: `${title || siteConfig.name} - Workout Manager App Icon`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: {
        default: fullTitle,
        template: title ? `%s - ${siteConfig.name}` : `%s - ${siteConfig.name}`,
      },
      description,
      images: [fullImageUrl],
    },
    icons: {
      icon: siteUrl.concat('/favicon.ico'),
      shortcut: siteUrl.concat('/favicon.ico'),
      apple: [
        { url: siteUrl.concat('/icons/icon-192x192.png') },
        { url: siteUrl.concat('/icons/icon-512x512.png'), sizes: '512x512' },
      ],
    },
  }
}

// Common viewport configuration
export const commonViewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width' as const,
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover' as const,
}
