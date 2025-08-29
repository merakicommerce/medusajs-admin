import { FormImage } from "../types/shared";

// Upload images directly to Cloudinary instead of using Medusa uploads
export const prepareCloudinaryImages = async (images: FormImage[]): Promise<FormImage[]> => {
  const uploadImages: FormImage[] = []
  const existingImages: FormImage[] = []

  // Separate images that need uploading vs existing ones
  images.forEach((image) => {
    if (image.nativeFile) {
      uploadImages.push(image)
    } else {
      existingImages.push(image)
    }
  })

  let uploadedImages: FormImage[] = []
  
  if (uploadImages.length > 0) {
    // Upload to Cloudinary in parallel
    const uploadPromises = uploadImages.map(async (image) => {
      if (!image.nativeFile) return image

      const formData = new FormData()
      formData.append('file', image.nativeFile)
      formData.append('upload_preset', 'z48xz3qg')
      formData.append('folder', 'media/catalog/product')

      try {
        const response = await fetch(
          'https://api.cloudinary.com/v1_1/dfgbpib38/image/upload',
          {
            method: 'POST',
            body: formData,
          }
        )

        if (!response.ok) {
          throw new Error(`Upload failed for ${image.name}`)
        }

        const data = await response.json()
        
        return {
          url: data.secure_url,
          name: image.name || 'uploaded-image',
          size: image.size,
        } as FormImage
      } catch (error) {
        console.error('Cloudinary upload error:', error)
        throw error
      }
    })

    uploadedImages = await Promise.all(uploadPromises)
  }

  return [...existingImages, ...uploadedImages]
}

// Single image upload for thumbnail
export const uploadSingleImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'z48xz3qg')
  formData.append('folder', 'media/catalog/product/thumbnails')

  try {
    const response = await fetch(
      'https://api.cloudinary.com/v1_1/dfgbpib38/image/upload',
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}