import { UseFormReturn } from "react-hook-form"
import InputField from "../../../../components/molecules/input"
import TextArea from "../../../../components/molecules/textarea"
import FileUploadField from "../../../../components/atoms/file-upload-field"
import Button from "../../../../components/fundamentals/button"
import TrashIcon from "../../../../components/fundamentals/icons/trash-icon"
import { useState } from "react"

interface Metadata {
  sku: string
  inspiredOf: string
  description: string
  product_type: string
  description_1: string
  description_2: string
  dimension_image: string
  magento_product_id: string
  product_information: string
  inspiredOfInformation: string
  google_product_category: string
}
// Define field types for better rendering
const fieldConfig = {
  sku: { type: 'text', label: 'SKU', section: 'basic' },
  product_type: { type: 'text', label: 'Product Type', section: 'basic' },
  magento_product_id: { type: 'text', label: 'Magento Product ID', section: 'basic' },
  google_product_category: { type: 'text', label: 'Google Product Category', section: 'basic' },
  description: { type: 'textarea', label: 'Description', section: 'content' },
  description_1: { type: 'textarea', label: 'Description 1', section: 'content' },
  description_2: { type: 'textarea', label: 'Description 2', section: 'content' },
  product_information: { type: 'textarea', label: 'Product Information', section: 'content' },
  inspiredOf: { type: 'text', label: 'Inspired Of', section: 'content' },
  inspiredOfInformation: { type: 'textarea', label: 'Inspired Of Information', section: 'content' },
  dimension_image: { type: 'image', label: 'Dimension Image', section: 'media' },
}
export type EditMetadataProductFormType = {
  metadata: Metadata
}

type Props = {
  form: UseFormReturn<EditMetadataProductFormType, any>
}

const EditIMetadataProductForm = ({ form }: Props) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form

  const [uploadedImages, setUploadedImages] = useState<{ [key: string]: File | null }>({})

  const handleImageUpload = (fieldId: keyof Metadata, files: File[]) => {
    if (files.length > 0) {
      const file = files[0]
      setUploadedImages(prev => ({ ...prev, [fieldId]: file }))
      // For now, we'll store the file name in the metadata field
      // In a real implementation, you'd upload to a CDN and store the URL
      setValue(`metadata.${fieldId}` as any, file.name)
    }
  }

  const handleRemoveImage = (fieldId: keyof Metadata) => {
    setUploadedImages(prev => ({ ...prev, [fieldId]: null }))
    setValue(`metadata.${fieldId}` as any, '')
  }

  const renderField = (fieldId: keyof Metadata, config: any) => {
    const currentValue = watch(`metadata.${fieldId}` as any) || ''
    const uploadedFile = uploadedImages[fieldId]

    switch (config.type) {
      case 'textarea':
        return (
          <TextArea
            key={fieldId}
            label={config.label}
            placeholder={`Enter ${config.label.toLowerCase()}...`}
            rows={4}
            {...register(`metadata.${fieldId}` as any, {})}
            errors={errors}
          />
        )
      
      case 'image':
        return (
          <div key={fieldId} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {config.label}
            </label>
            {!uploadedFile && !currentValue ? (
              <FileUploadField
                onFileChosen={(files) => handleImageUpload(fieldId, files)}
                filetypes={["image/gif", "image/jpeg", "image/png", "image/webp"]}
                placeholder="Upload image file"
                className="h-32"
                text="Drop image here or click to browse"
              />
            ) : (
              <div className="relative border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {uploadedFile && (
                      <img
                        src={URL.createObjectURL(uploadedFile)}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {uploadedFile ? uploadedFile.name : currentValue}
                      </p>
                      {uploadedFile && (
                        <p className="text-xs text-gray-500">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={() => handleRemoveImage(fieldId)}
                  >
                    <TrashIcon size={16} />
                  </Button>
                </div>
              </div>
            )}
            <input
              type="hidden"
              {...register(`metadata.${fieldId}` as any, {})}
            />
          </div>
        )
      
      default:
        return (
          <InputField
            key={fieldId}
            label={config.label}
            placeholder={`Enter ${config.label.toLowerCase()}...`}
            {...register(`metadata.${fieldId}` as any, {})}
          />
        )
    }
  }

  // Group fields by section
  const sections = {
    basic: Object.entries(fieldConfig).filter(([_, config]) => config.section === 'basic') as [keyof Metadata, any][],
    content: Object.entries(fieldConfig).filter(([_, config]) => config.section === 'content') as [keyof Metadata, any][],
    media: Object.entries(fieldConfig).filter(([_, config]) => config.section === 'media') as [keyof Metadata, any][],
  }

  return (
    <div className="space-y-8">
      {/* Basic Information Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.basic.map(([fieldId, config]) => renderField(fieldId, config))}
        </div>
      </div>

      {/* Content Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Content & Descriptions</h3>
        <div className="space-y-4">
          {sections.content.map(([fieldId, config]) => renderField(fieldId, config))}
        </div>
      </div>

      {/* Media Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Media</h3>
        <div className="space-y-4">
          {sections.media.map(([fieldId, config]) => renderField(fieldId, config))}
        </div>
      </div>
    </div>
  )
}

export default EditIMetadataProductForm
