import { UseFormReturn } from "react-hook-form"
import InputField from "../../../../../components/molecules/input"

interface Metadata {
  color: string
  in_stock: string
  leadtime: string
  material: string
  heading_1: string
  heading_2: string
  description_image_1: string
  description_image_2: string
}
let fields = [
  "color",
  "in_stock",
  "leadtime",
  "material",
  "heading_1",
  "heading_2",
  "description_image_1",
  "description_image_2",
]
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

export default EditIMetadataVariantForm
