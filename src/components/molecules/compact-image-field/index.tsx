import React, { useState, useRef } from 'react'
import clsx from 'clsx'
import InputHeader from '../../fundamentals/input-header'
import InputError from '../../atoms/input-error'
import Button from '../../fundamentals/button'
import TrashIcon from '../../fundamentals/icons/trash-icon'
import EditIcon from '../../fundamentals/icons/edit-icon'

type CompactImageFieldProps = {
  label: string
  name: string
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  required?: boolean
  errors?: { [x: string]: unknown }
  className?: string
}

const CompactImageField: React.FC<CompactImageFieldProps> = ({
  label,
  name,
  value = '',
  onChange,
  onBlur,
  required = false,
  errors,
  className
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      // In a real implementation, you'd upload to a CDN and get back a URL
      // For now, we'll just use the file name
      onChange(file.name)
      onBlur?.()
    }
  }

  const handleRemoveImage = () => {
    setUploadedFile(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onBlur?.()
  }

  const handleReplaceClick = () => {
    fileInputRef.current?.click()
  }

  const hasImage = uploadedFile || value

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
                ) : (
                  <div className="w-12 h-12 bg-grey-20 rounded border flex items-center justify-center">
                    <span className="text-xs text-grey-50">IMG</span>
                  </div>
                )}
              </div>
              
              {/* File Info */}
              <div className="flex-grow min-w-0">
                <p className="text-sm font-medium text-grey-90 truncate">
                  {uploadedFile ? uploadedFile.name : value}
                </p>
                {uploadedFile && (
                  <p className="text-xs text-grey-50">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  onClick={handleReplaceClick}
                  className="p-1"
                >
                  <EditIcon size={16} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  onClick={handleRemoveImage}
                  className="p-1 text-rose-50 hover:text-rose-60"
                >
                  <TrashIcon size={16} />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="p-4 text-center cursor-pointer hover:bg-grey-10 transition-colors"
            onClick={handleReplaceClick}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-grey-20 rounded border-2 border-dashed border-grey-30 flex items-center justify-center">
                <span className="text-xs text-grey-50">+</span>
              </div>
              <p className="text-sm text-grey-50">Click to upload image</p>
            </div>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/gif,image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <InputError name={name} errors={errors} />
    </div>
  )
}

export default CompactImageField