import { UseFormReturn } from "react-hook-form"
import InputField from "../../../../components/molecules/input"

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
let fields = [
  "sku",
  "inspiredOf",
  "description",
  "product_type",
  "description_1",
  "description_2",
  "dimension_image",
  "magento_product_id",
  "product_information",
  "inspiredOfInformation",
  "google_product_category",
]
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
  } = form
  return (
    <div>
      <div className="grid grid-cols-1 gap-large mb-large">
        {fields.map((id) => {
          const label = id.replaceAll("_", " ").toUpperCase()
          return (
            <InputField
              key={id}
              label={label}
              placeholder={label}
              {...register("metadata." + id, {})}
            />
          )
        })}
      </div>
    </div>
  )
}

export default EditIMetadataProductForm
