import React, { useState, useRef } from 'react'
import clsx from 'clsx'
import InputHeader from '../../fundamentals/input-header'
import InputError from '../../atoms/input-error'
import Button from '../../fundamentals/button'
import TrashIcon from '../../fundamentals/icons/trash-icon'
import PlusIcon from '../../fundamentals/icons/plus-icon'

type ImageArrayFieldProps = {
  label: string
  name: string
  value?: string[] | string
  onChange: (value: string[]) => void
  onBlur?: () => void
  required?: boolean
  errors?: { [x: string]: unknown }
  className?: string
}

const ImageArrayField: React.FC<ImageArrayFieldProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  required = false,
  errors,
  className
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Parse the value - handle both string and array formats
  const parseImages = (val: string[] | string | undefined): string[] => {
    if (!val) return []
    if (Array.isArray(val)) return val
    if (typeof val === 'string') {
      try {
        // Try to parse as JSON array
        const parsed = JSON.parse(val)
        return Array.isArray(parsed) ? parsed : [val]
      } catch {
        // If not JSON, treat as single URL
        return val ? [val] : []
      }
    }
    return []
  }

  const images = parseImages(value)

  // Upload image to Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'medusa_uploads') // Adjust preset name as needed
    formData.append('folder', 'media/catalog/product')

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
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const uploadPromises = Array.from(files).map(uploadToCloudinary)
      const uploadedUrls = await Promise.all(uploadPromises)
      
      const newImages = [...images, ...uploadedUrls]
      onChange(newImages)
      onBlur?.()
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleAddImages = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove)
    onChange(newImages)
    onBlur?.()
  }

  const handleReplaceImage = (indexToReplace: number) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setIsUploading(true)
      try {
        const uploadedUrl = await uploadToCloudinary(file)
        const newImages = [...images]
        newImages[indexToReplace] = uploadedUrl
        onChange(newImages)
        onBlur?.()
      } catch (error) {
        console.error('Replace upload error:', error)
      } finally {
        setIsUploading(false)
      }
    }
    input.click()
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    
    // Remove from original position
    newImages.splice(draggedIndex, 1)
    
    // Insert at new position
    const actualDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    newImages.splice(actualDropIndex, 0, draggedImage)
    
    onChange(newImages)
    onBlur?.()
    setDraggedIndex(null)
  }

  return (
    <div className={className}>
      <InputHeader
        label={label}
        required={required}
        className="mb-xsmall"
      />
      
      <div className="space-y-3">
        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {images.map((imageUrl, index) => (
              <div
                key={`${imageUrl}-${index}`}
                className={clsx(
                  'relative group bg-grey-5 border border-grey-20 rounded-rounded overflow-hidden aspect-square cursor-move w-16 h-16',
                  {
                    'opacity-50': draggedIndex === index,
                    'ring-2 ring-violet-60': draggedIndex !== null && draggedIndex !== index,
                  }
                )}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, index)}
              >
                <img
                  src={imageUrl}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center space-x-1">
                  <Button
                    variant="secondary"
                    size="small"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1 py-1"
                    onClick={() => handleReplaceImage(index)}
                    type="button"
                  >
                    ↻
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    className="opacity-0 group-hover:opacity-100 transition-opacity px-1 py-1"
                    onClick={() => handleRemoveImage(index)}
                    type="button"
                  >
                    <TrashIcon size={12} />
                  </Button>
                </div>
                
                {/* Position indicator */}
                <div className="absolute top-0.5 left-0.5 bg-white bg-opacity-90 text-xs px-1 py-0.5 rounded text-grey-90 text-[10px] leading-none">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Images Button */}
        <div className={clsx(
          'border-2 border-dashed border-grey-20 rounded-rounded p-4 text-center',
          'hover:border-violet-60 hover:bg-violet-5 transition-colors cursor-pointer',
          {
            'border-rose-50': errors && name && errors[name],
          }
        )}
        onClick={!isUploading ? handleAddImages : undefined}
        >
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-60"></div>
              <span className="text-grey-50">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <PlusIcon className="text-grey-40" size={24} />
              <span className="text-grey-50 text-sm">
                {images.length === 0 ? 'Add images' : 'Add more images'}
              </span>
              <span className="text-xs text-grey-40">
                Drag to reorder • Click to replace or remove
              </span>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      <InputError name={name} errors={errors} />
    </div>
  )
}

export default ImageArrayField