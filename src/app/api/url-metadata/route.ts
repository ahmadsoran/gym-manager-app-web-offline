import { NextRequest, NextResponse } from 'next/server'
import urlMetadata from 'url-metadata'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    const metadata = await urlMetadata(url, {
      timeout: 10000,
      maxRedirects: 5,
      requestHeaders: {
        'User-Agent':
          'Gym Manager App (+https://github.com/ahmadsoran/gym-manager-app-web-offline)',
      },
    })

    // Extract YouTube video ID if it's a YouTube URL
    const extractYouTubeId = (url: string): string | null => {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/,
      ]

      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) {
          return match[1]
        }
      }
      return null
    }

    // Check if URL is a direct image
    const isImageUrl = (url: string): boolean => {
      const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i
      return imageExtensions.test(url.split('?')[0])
    }

    // Determine content type
    let type: 'video' | 'image' | 'webpage' = 'webpage'
    let isYouTube = false
    let youTubeId: string | null = null
    let embedUrl: string | undefined
    let thumbnailUrl: string | undefined

    // Check for YouTube
    youTubeId = extractYouTubeId(url)
    if (youTubeId) {
      isYouTube = true
      type = 'video'
      embedUrl = `https://www.youtube.com/embed/${youTubeId}`
      thumbnailUrl = `https://img.youtube.com/vi/${youTubeId}/maxresdefault.jpg`
    }
    // Check for direct image
    else if (isImageUrl(url)) {
      type = 'image'
      thumbnailUrl = url
    }
    // Check for video based on metadata
    else if (
      metadata.image?.includes('youtube') ||
      metadata.title?.toLowerCase().includes('video') ||
      url.includes('video')
    ) {
      type = 'video'
      thumbnailUrl = metadata.image
    } else {
      thumbnailUrl = metadata.image
    }

    const response = {
      url: metadata.url || url,
      title: metadata.title,
      description: metadata.description,
      image: metadata.image,
      type,
      isYouTube,
      youTubeId,
      thumbnailUrl,
      embedUrl,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching URL metadata:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch metadata',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
