export interface UrlMetadata {
  title?: string
  description?: string
  image?: string
  url: string
  type: 'video' | 'image' | 'webpage'
  isYouTube?: boolean
  youTubeId?: string
  thumbnailUrl?: string
  embedUrl?: string
}

// Main function to fetch URL metadata using the API route
export async function fetchUrlMetadata(url: string): Promise<UrlMetadata> {
  try {
    // Normalize URL
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`

    const response = await fetch('/api/url-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: normalizedUrl }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch metadata')
    }

    const metadata = await response.json()
    return metadata
  } catch (error) {
    console.error('Error fetching URL metadata:', error)

    // Return basic metadata as fallback
    return {
      url,
      type: 'webpage',
      title: 'External Link',
      description: 'Unable to fetch metadata',
    }
  }
}

// Validate URL format
export function isValidUrl(string: string): boolean {
  try {
    const url = string.startsWith('http') ? string : `https://${string}`
    new URL(url)
    return true
  } catch (_) {
    return false
  }
}
