import React, { useState, useRef } from 'react'
import clsx from 'clsx'
import InputHeader from '../../fundamentals/input-header'
import InputError from '../../atoms/input-error'
import Button from '../../fundamentals/button'
import TrashIcon from '../../fundamentals/icons/trash-icon'
import EditIcon from '../../fundamentals/icons/edit-icon'
import Spinner from '../../atoms/spinner'
import InputField from '../input'
import { normalizeImageData, createImageData, type ImageMetadata, type ImageData } from '../../../utils/image-metadata-utils'

type CompactImageFieldProps = {
  label: string
  name: string
  value?: ImageMetadata
  onChange: (value: ImageData | string) => void
  onBlur?: () => void
  required?: boolean
  errors?: { [x: string]: unknown }
  className?: string
}

const CompactImageField: React.FC<CompactImageFieldProps> = ({
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [showAltText, setShowAltText] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Normalize the current value
  const imageData = normalizeImageData(value || '')
  const currentUrl = imageData?.url || ''
  const currentAlt = imageData?.alt || ''

  // Direct Cloudinary upload function without widget
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = "dfgbpib38"
    const uploadPreset = "z48xz3qg"
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('🐛 DEBUG - Cloudinary upload success:', data)
    return data.secure_url
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      console.error('🐛 DEBUG - Invalid file type:', file.type)
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error('🐛 DEBUG - File too large:', file.size)
      return
    }

    setUploadedFile(file)
    setIsUploading(true)
    
    try {
      const imageUrl = await uploadToCloudinary(file)
      console.log('🐛 DEBUG - Image uploaded successfully:', imageUrl)
      // Preserve existing alt text or create new image data
      const newImageData = createImageData(imageUrl, currentAlt)
      onChange(newImageData)
      onBlur?.()
    } catch (error) {
      console.error('🐛 DEBUG - Cloudinary upload failed:', error)
      // Reset file input on error
      setUploadedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setUploadedFile(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setShowAltText(false)
    onBlur?.()
  }
  
  const handleAltTextChange = (newAlt: string) => {
    if (currentUrl) {
      const newImageData = createImageData(currentUrl, newAlt)
      onChange(newImageData)
      onBlur?.()
    }
  }

  const handleReplaceClick = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const hasImage = uploadedFile || currentUrl

  return (
    <div className={className}>
      <InputHeader
        label={label}
        required={required}
        className="mb-xsmall"
      />
      
      <div
        className={clsx(
          'w-full border border-grey-20 rounded-rounded bg-grey-5',
          {
            'border-rose-50': errors && name && errors[name],
          }
        )}
      >
        {hasImage ? (
          <div className="p-3">
            <div className="flex items-center gap-3">
              {/* Image Preview */}
              <div className="flex-shrink-0">
                {uploadedFile ? (
                  <img
                    src={URL.createObjectURL(uploadedFile)}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded border"
                  />
                ) : currentUrl ? (
                  <img
                    src={currentUrl}
                    alt={currentAlt || "Uploaded image"}
                    className="w-12 h-12 object-cover rounded border"
                    onError={(e) => {
                      // Show fallback if image fails to load
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-grey-20 rounded border flex items-center justify-center">
                    <span className="text-xs text-grey-50">IMG</span>
                  </div>
                )}
              </div>
              
              {/* File Info */}
              <div className="flex-grow min-w-0">
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="small" />
                    <span className="text-sm text-grey-50">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-grey-90 truncate">
                      {uploadedFile ? uploadedFile.name : currentUrl ? 'Uploaded image' : 'No image'}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-grey-50">
                        {uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} KB` : 'Cloudinary hosted'}
                      </p>
                      {currentAlt && (
                        <div className="bg-violet-10 px-1.5 py-0.5 rounded text-[10px] text-violet-60 font-medium">
                          ALT
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  onClick={() => setShowAltText(!showAltText)}
                  className="p-1 text-xs"
                  disabled={isUploading}
                  title="Edit alt text"
                >
                  ALT
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  onClick={handleReplaceClick}
                  className="p-1"
                  disabled={isUploading}
                >
                  <EditIcon size={16} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  onClick={handleRemoveImage}
                  className="p-1 text-rose-50 hover:text-rose-60"
                  disabled={isUploading}
                >
                  <TrashIcon size={16} />
                </Button>
              </div>
            </div>
            
            {/* Alt Text Section */}
            {showAltText && (
              <div className="mt-3 pt-3 border-t border-grey-20 bg-grey-5 -mx-3 -mb-3 px-3 pb-3 rounded-b-rounded">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-grey-90">Alt Text</span>
                  <div className="bg-violet-10 px-1.5 py-0.5 rounded text-[10px] text-violet-60 font-medium">
                    SEO
                  </div>
                </div>
                <InputField
                  name={`${name}_alt`}
                  value={currentAlt}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAltTextChange(e.target.value)}
                  placeholder="Describe this image for SEO and accessibility..."
                  className="mb-2"
                />
                <div className="flex justify-between items-center text-xs text-grey-50">
                  <span>Improves accessibility and search rankings</span>
                  <span className={currentAlt.length > 125 ? 'text-rose-50' : ''}>
                    {currentAlt.length}/125 chars
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div 
            className={clsx(
              "p-4 text-center transition-colors",
              isUploading 
                ? "cursor-not-allowed bg-grey-5" 
                : "cursor-pointer hover:bg-grey-10"
            )}
            onClick={handleReplaceClick}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-grey-20 rounded border-2 border-dashed border-grey-30 flex items-center justify-center">
                <span className="text-xs text-grey-50">+</span>
              </div>
              <p className="text-sm text-grey-50">
                {isUploading ? "Uploading..." : "Click to upload image"}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <InputError name={name} errors={errors} />
    </div>
  )
}

export default CompactImageField