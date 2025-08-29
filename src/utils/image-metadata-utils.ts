export type ImageData = {
  url: string
  alt?: string
}

export type ImageMetadata = string | ImageData
export type ImageArrayMetadata = string | string[] | ImageData[]

/**
 * Normalize single image data to standard format
 */
export const normalizeImageData = (data: ImageMetadata): ImageData | null => {
  if (!data) return null
  
  if (typeof data === 'string') {
    return data.trim() ? { url: data.trim(), alt: '' } : null
  }
  
  if (typeof data === 'object' && data.url) {
    return {
      url: data.url.trim(),
      alt: data.alt || ''
    }
  }
  
  return null
}

/**
 * Normalize image array data to standard format
 */
export const normalizeImageArray = (data: ImageArrayMetadata): ImageData[] => {
  if (!data) return []
  
  // Handle string format (single image or JSON array)
  if (typeof data === 'string') {
    try {
      // Try to parse as JSON array
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) {
        return parsed
          .filter(item => typeof item === 'string' && item.trim())
          .map(url => ({ url: url.trim(), alt: '' }))
      }
    } catch {
      // If not JSON, treat as single URL
      return data.trim() ? [{ url: data.trim(), alt: '' }] : []
    }
    
    // Single string URL
    return data.trim() ? [{ url: data.trim(), alt: '' }] : []
  }
  
  // Handle string array format
  if (Array.isArray(data) && data.every(item => typeof item === 'string')) {
    return (data as string[])
      .filter(url => url && url.trim())
      .map(url => ({ url: url.trim(), alt: '' }))
  }
  
  // Handle ImageData array format
  if (Array.isArray(data) && data.every(item => typeof item === 'object' && item.url)) {
    return (data as ImageData[])
      .filter(item => item.url && item.url.trim())
      .map(item => ({
        url: item.url.trim(),
        alt: item.alt || ''
      }))
  }
  
  return []
}

/**
 * Extract URL from image data
 */
export const getImageUrl = (data: ImageMetadata): string => {
  const normalized = normalizeImageData(data)
  return normalized?.url || ''
}

/**
 * Extract alt text from image data
 */
export const getImageAlt = (data: ImageMetadata): string => {
  const normalized = normalizeImageData(data)
  return normalized?.alt || ''
}

/**
 * Create image data object from URL and alt text
 */
export const createImageData = (url: string, alt?: string): ImageData => {
  return {
    url: url.trim(),
    alt: alt?.trim() || ''
  }
}

/**
 * Convert image data back to string format for backward compatibility
 */
export const imageDataToString = (data: ImageData): string => {
  return data.url
}

/**
 * Convert image array back to string array for backward compatibility
 */
export const imageArrayToStringArray = (data: ImageData[]): string[] => {
  return data.map(item => item.url).filter(url => url.trim())
}

/**
 * Check if data contains alt text information
 */
export const hasAltTextSupport = (data: any): boolean => {
  if (typeof data === 'object' && data.url) return true
  if (Array.isArray(data) && data.some(item => typeof item === 'object' && item.url)) return true
  return false
}

/**
 * Serialize image data for form submission - preserves alt text
 */
export const serializeImageData = (data: ImageMetadata): ImageData | string => {
  const normalized = normalizeImageData(data)
  if (!normalized) return ''
  
  // If there's alt text, return full object; otherwise just URL for compatibility
  return normalized.alt ? normalized : normalized.url
}

/**
 * Serialize image array for form submission
 */
export const serializeImageArray = (data: ImageData[]): ImageData[] | string[] => {
  if (!data.length) return []
  
  // If any item has alt text, return full objects; otherwise strings for compatibility
  const hasAltText = data.some(item => item.alt)
  return hasAltText ? data : data.map(item => item.url)
}