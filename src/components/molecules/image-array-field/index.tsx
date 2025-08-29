import React, { useState, useRef } from 'react'
import clsx from 'clsx'
import InputHeader from '../../fundamentals/input-header'
import InputError from '../../atoms/input-error'
import Button from '../../fundamentals/button'
import TrashIcon from '../../fundamentals/icons/trash-icon'
import PlusIcon from '../../fundamentals/icons/plus-icon'
import EditIcon from '../../fundamentals/icons/edit-icon'
import Modal from '../modal'
import InputField from '../input'
import { normalizeImageArray, createImageData, type ImageArrayMetadata, type ImageData } from '../../../utils/image-metadata-utils'

type ImageArrayFieldProps = {
  label: string
  name: string
  value?: ImageArrayMetadata
  onChange: (value: ImageData[] | string[]) => void
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
  const [editingAltIndex, setEditingAltIndex] = useState<number | null>(null)
  const [tempAltText, setTempAltText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Parse and normalize the image data
  const images = normalizeImageArray(value)

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
      
      // Convert URLs to ImageData objects
      const uploadedImages = uploadedUrls.map(url => createImageData(url))
      const newImages = [...images, ...uploadedImages]
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
        // Preserve existing alt text when replacing image
        newImages[indexToReplace] = createImageData(uploadedUrl, images[indexToReplace].alt)
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

  // Alt text handling
  const handleEditAlt = (index: number) => {
    setEditingAltIndex(index)
    setTempAltText(images[index].alt || '')
  }

  const handleSaveAlt = () => {
    if (editingAltIndex !== null) {
      const newImages = [...images]
      newImages[editingAltIndex] = {
        ...newImages[editingAltIndex],
        alt: tempAltText
      }
      onChange(newImages)
      onBlur?.()
      setEditingAltIndex(null)
      setTempAltText('')
    }
  }

  const handleCancelAlt = () => {
    setEditingAltIndex(null)
    setTempAltText('')
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
    const draggedImageData = newImages[draggedIndex]
    
    // Remove from original position
    newImages.splice(draggedIndex, 1)
    
    // Insert at new position
    const actualDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    newImages.splice(actualDropIndex, 0, draggedImageData)
    
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
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {images.map((imageData, index) => (
              <div
                key={`${imageData.url}-${index}`}
                className={clsx(
                  'relative group bg-grey-5 border border-grey-20 rounded-rounded overflow-hidden aspect-square cursor-move w-24 h-24',
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
                  src={imageData.url}
                  alt={imageData.alt || `Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center space-x-1">
                  <Button
                    variant="secondary"
                    size="small"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1 py-1"
                    onClick={() => handleEditAlt(index)}
                    type="button"
                    title="Edit alt text"
                  >
                    ALT
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1 py-1"
                    onClick={() => handleReplaceImage(index)}
                    type="button"
                    title="Replace image"
                  >
                    ↻
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    className="opacity-0 group-hover:opacity-100 transition-opacity px-1 py-1"
                    onClick={() => handleRemoveImage(index)}
                    type="button"
                    title="Remove image"
                  >
                    <TrashIcon size={12} />
                  </Button>
                </div>
                
                {/* Position indicator */}
                <div className="absolute top-0.5 left-0.5 bg-white bg-opacity-90 text-xs px-1 py-0.5 rounded text-grey-90 text-[10px] leading-none">
                  {index + 1}
                </div>
                
                {/* Alt text indicator */}
                {imageData.alt && (
                  <div className="absolute bottom-0.5 left-0.5 bg-violet-60 bg-opacity-90 text-white text-[10px] px-1 py-0.5 rounded leading-none">
                    ALT
                  </div>
                )}
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
      
      {/* Alt Text Editing Modal */}
      {editingAltIndex !== null && (
        <Modal handleClose={handleCancelAlt}>
          <Modal.Header handleClose={handleCancelAlt}>
            <h1 className="inter-xlarge-semibold">
              Edit Alt Text
            </h1>
          </Modal.Header>
          <Modal.Content>
            <div className="flex gap-4 mb-4">
              <img
                src={images[editingAltIndex].url}
                alt="Preview"
                className="w-20 h-20 object-cover rounded border"
              />
              <div className="flex-1">
                <p className="text-sm text-grey-70 mb-2">
                  Add descriptive alt text for this image to improve SEO and accessibility.
                </p>
                <InputField
                  label="Alt Text"
                  name="altText"
                  value={tempAltText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempAltText(e.target.value)}
                  placeholder="Describe what's shown in this image..."
                />
                <p className="text-xs text-grey-50 mt-1">
                  {tempAltText.length}/125 characters (recommended for SEO)
                </p>
              </div>
            </div>
          </Modal.Content>
          <Modal.Footer>
            <div className="flex items-center justify-end w-full gap-x-xsmall">
              <Button
                variant="secondary"
                size="small"
                type="button"
                onClick={handleCancelAlt}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="small"
                type="button"
                onClick={handleSaveAlt}
              >
                Save Alt Text
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  )
}

export default ImageArrayField