import { UseFormReturn } from "react-hook-form"
import InputField from "../../../../../components/molecules/input"
import RichTextField from "../../../../../components/molecules/rich-text-field"
import CompactImageField from "../../../../../components/molecules/compact-image-field"

interface Metadata {
  color: string
  in_stock: string
  leadtime: string
  material: string
  heading_1: string
  heading_2: string
  dimension_image: string
  description_image_1: string
  description_image_2: string
}
// Define field configurations for better rendering
const fieldConfig = {
  color: { type: 'text', label: 'Color', section: 'basic' },
  in_stock: { type: 'text', label: 'In Stock', section: 'basic' },
  leadtime: { type: 'text', label: 'Lead Time', section: 'basic' },
  material: { type: 'text', label: 'Material', section: 'basic' },
  heading_1: { type: 'richtext', label: 'Heading 1', section: 'content' },
  heading_2: { type: 'richtext', label: 'Heading 2', section: 'content' },
  dimension_image: { type: 'image', label: 'Dimension Image', section: 'images' },
  description_image_1: { type: 'image', label: 'Description Image 1', section: 'images' },
  description_image_2: { type: 'image', label: 'Description Image 2', section: 'images' },
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
        return (
          <RichTextField
            key={fieldId}
            label={config.label}
            name={`metadata.${fieldId}`}
            value={currentValue}
            onChange={(value) => setValue(`metadata.${fieldId}` as any, value)}
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
            onChange={(value) => setValue(`metadata.${fieldId}` as any, value)}
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
