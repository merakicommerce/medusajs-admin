import { UseFormReturn } from "react-hook-form"
import InputField from "../../../../../components/molecules/input"
import RichTextField from "../../../../../components/molecules/rich-text-field"
import BooleanField from "../../../../../components/molecules/boolean-field"
import ImageArrayField from "../../../../../components/molecules/image-array-field"
import CompactImageField from "../../../../../components/molecules/compact-image-field"
import KeyValueField from "../../../../../components/molecules/key-value-field"
import { type ImageData, type ImageMetadata } from "../../../../../utils/image-metadata-utils"

interface Metadata {
  color: string
  leadtime: string
  material: string
  description: string
  product_information: string
  description_1: string
  description_2: string
  heading_1: string
  heading_2: string
  dimension_image: ImageMetadata
  description_image_1: ImageMetadata
  description_image_2: ImageMetadata
  images: ImageData[] | string[] | string
  // SEO fields
  handle: string
  meta_title: string
  meta_keyword: string
  meta_description: string
}
// Define field configurations for better rendering
const fieldConfig = {
  color: { type: 'text', label: 'Color', section: 'basic' },
  leadtime: { type: 'text', label: 'Lead Time', section: 'basic' },
  material: { type: 'text', label: 'Material', section: 'basic' },
  description: { type: 'key-value', label: 'Description', section: 'content' },
  product_information: { type: 'key-value', label: 'Product Information', section: 'content' },
  heading_1: { type: 'richtext', label: 'Heading 1', section: 'content' },
  description_1: { type: 'richtext', label: 'Description 1', section: 'content' },
  heading_2: { type: 'richtext', label: 'Heading 2', section: 'content' },
  description_2: { type: 'richtext', label: 'Description 2', section: 'content' },
  dimension_image: { type: 'image', label: 'Dimension Image', section: 'images' },
  description_image_1: { type: 'image', label: 'Description Image 1', section: 'images' },
  description_image_2: { type: 'image', label: 'Description Image 2', section: 'images' },
  images: { type: 'image-array', label: 'Product Images', section: 'images' },
}
export type EditMetadataVariantFormType = {
  metadata: Metadata
}

type Props = {
  form: UseFormReturn<EditMetadataVariantFormType, any>
}

const EditIMetadataVariantForm = ({ form }: Props) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form

  const renderField = (fieldId: keyof Metadata, config: any) => {
    const currentValue = watch(`metadata.${fieldId}` as any) || ''

    switch (config.type) {
      case 'richtext':
        // Use inheritance message for description fields in variant form
        const shouldShowInheritanceMessage = fieldId === 'description_1' || fieldId === 'description_2'
        const inheritanceMessage = shouldShowInheritanceMessage ? "If empty, will inherit content from product metadata" : undefined
        
        return (
          <RichTextField
            key={fieldId}
            label={config.label}
            name={`metadata.${fieldId}`}
            value={currentValue}
            onChange={(value) => setValue(`metadata.${fieldId}` as any, value, { shouldDirty: true })}
            placeholder={`Enter ${config.label.toLowerCase()}...`}
            errors={errors}
            inheritanceMessage={inheritanceMessage}
          />
        )
      
      case 'key-value':
        const placeholder = fieldId === 'description' 
          ? `Enter description...

For structured data, use format:
Top: Brushed Brass
Base: White Marble
Style: Modern Classic
Warranty: 5 Years`
          : fieldId === 'product_information'
          ? `Enter product information...

For structured data, use format:
Material: Premium Oak Wood
Dimensions: 120cm x 80cm x 75cm
Weight: 25kg
Color: Natural Oak`
          : `Enter ${config.label.toLowerCase()}...`
        
        return (
          <KeyValueField
            key={fieldId}
            label={config.label}
            name={`metadata.${fieldId}`}
            value={currentValue}
            onChange={(value) => setValue(`metadata.${fieldId}` as any, value, { shouldDirty: true })}
            placeholder={placeholder}
            errors={errors}
          />
        )
      
      case 'image':
        return (
          <CompactImageField
            key={fieldId}
            label={config.label}
            name={`metadata.${fieldId}`}
            value={currentValue}
            onChange={(value) => setValue(`metadata.${fieldId}` as any, value, { shouldDirty: true })}
            errors={errors}
          />
        )
      
      case 'boolean':
        return (
          <BooleanField
            key={fieldId}
            label={config.label}
            name={`metadata.${fieldId}`}
            value={currentValue}
            onChange={(value) => setValue(`metadata.${fieldId}` as any, value, { shouldDirty: true })}
            errors={errors}
          />
        )
      
      case 'image-array':
        return (
          <ImageArrayField
            key={fieldId}
            label={config.label}
            name={`metadata.${fieldId}`}
            value={currentValue}
            onChange={(value) => setValue(`metadata.${fieldId}` as any, value, { shouldDirty: true })}
            errors={errors}
          />
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
    images: Object.entries(fieldConfig).filter(([_, config]) => config.section === 'images') as [keyof Metadata, any][],
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-base font-medium text-grey-90 mb-3">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.basic.map(([fieldId, config]) => renderField(fieldId, config))}
        </div>
      </div>

      {/* Content */}
      <div>
        <h3 className="text-base font-medium text-grey-90 mb-3">Content</h3>
        <div className="space-y-4">
          {sections.content.map(([fieldId, config]) => renderField(fieldId, config))}
        </div>
      </div>

      {/* Images */}
      <div>
        <h3 className="text-base font-medium text-grey-90 mb-3">Images</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.images.map(([fieldId, config]) => renderField(fieldId, config))}
        </div>
      </div>
    </div>
  )
}

export default EditIMetadataVariantForm
