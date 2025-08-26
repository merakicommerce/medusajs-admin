import { UseFormReturn } from "react-hook-form"
import InputField from "../../../../components/molecules/input"
import RichTextField from "../../../../components/molecules/rich-text-field"
import CompactImageField from "../../../../components/molecules/compact-image-field"

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
// Define field configurations for better rendering
const fieldConfig = {
  sku: { type: 'text', label: 'SKU', section: 'basic' },
  product_type: { type: 'text', label: 'Product Type', section: 'basic' },
  magento_product_id: { type: 'text', label: 'Magento Product ID', section: 'basic' },
  google_product_category: { type: 'text', label: 'Google Product Category', section: 'basic' },
  inspiredOf: { type: 'text', label: 'Inspired Of', section: 'basic' },
  description: { type: 'richtext', label: 'Description', section: 'content' },
  description_1: { type: 'richtext', label: 'Description 1', section: 'content' },
  description_2: { type: 'richtext', label: 'Description 2', section: 'content' },
  product_information: { type: 'richtext', label: 'Product Information', section: 'content' },
  inspiredOfInformation: { type: 'richtext', label: 'Inspired Of Information', section: 'content' },
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

  const renderField = (fieldId: keyof Metadata, config: any) => {
    const currentValue = watch(`metadata.${fieldId}` as any) || ''

    switch (config.type) {
      case 'richtext':
        return (
          <RichTextField
            key={fieldId}
            label={config.label}
            name={`metadata.${fieldId}`}
            value={currentValue}
            onChange={(value) => setValue(`metadata.${fieldId}` as any, value, { shouldDirty: true })}
            placeholder={`Enter ${config.label.toLowerCase()}...`}
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
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-base font-medium text-grey-90 mb-3">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.basic.map(([fieldId, config]) => renderField(fieldId, config))}
        </div>
      </div>

      {/* Content & Descriptions */}
      <div>
        <h3 className="text-base font-medium text-grey-90 mb-3">Content & Descriptions</h3>
        <div className="space-y-4">
          {sections.content.map(([fieldId, config]) => renderField(fieldId, config))}
        </div>
      </div>

      {/* Media */}
      <div>
        <h3 className="text-base font-medium text-grey-90 mb-3">Media</h3>
        <div className="space-y-4">
          {sections.media.map(([fieldId, config]) => renderField(fieldId, config))}
        </div>
      </div>
    </div>
  )
}

export default EditIMetadataProductForm
