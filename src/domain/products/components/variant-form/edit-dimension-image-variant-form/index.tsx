import { Controller, UseFormReturn } from "react-hook-form"
import TrashIcon from "../../../../../components/fundamentals/icons/trash-icon"
import { ActionType } from "../../../../../components/molecules/actionables"
import Section from "../../../../../components/organisms/section"

export type EditDimensionImageVariantFormType = {
  image: string
}

type Props = {
  form: UseFormReturn<EditDimensionImageVariantFormType, any>
}

type MediaSectionProps = {
  image: string
  onAdd: ({ url }) => void
  onRemove: ({ url }) => void
}
const useCloudinaryUplaod = (onSuccess) => {
  const cloudName = "dfgbpib38" // replace with your own cloud name
  const uploadPreset = "z48xz3qg" // replace with your own upload preset
  return () => {
    window.myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
      },
      (error, result) => {
        console.log({ error, result })
        if (!error && result && result.event === "success") {
          onSuccess(result)
          return result
        }
      }
    )
    window.myWidget.open()
  }
}
const MediaSection = ({ image, onAdd, onRemove }: MediaSectionProps) => {
  const actions: ActionType[] = [
    {
      label: "Edit Media",
      onClick: useCloudinaryUplaod((result) => onAdd(result.info)),
    },
  ]

  return (
    <>
      <Section title="Media" actions={actions}>
        {image && (
          <div
            className="relative flex items-center justify-center border aspect-square"
          >
            <img
              src={image}
              className="object-contain max-w-full max-h-full rounded-rounded"
            />
            <button
              className="absolute bg-slate-100 btn btn-ghost top-2 right-2 btn-small w-xlarge h-xlarge focus-visible:outline-none focus-visible:shadow-input focus-visible:border-violet-60 focus:shadow-none"
              type="button"
            >
              <span
                onClick={(e) => onRemove({ url: image })}
                className="mr-xsmall last:mr-0"
              >
                <TrashIcon />
              </span>
            </button>
          </div>
        )}
      </Section>
    </>
  )
}

const EditDimensionImageVariantForm = ({ form }: Props) => {
  return (
    <div>
      <Controller
        name="image"
        control={form.control}
        render={({ field }) => {
          console.log({ field })
          return (
            <MediaSection
              onAdd={({ url }) => {
                console.log({ url })
                form.setValue("image", url)
              }}
              onRemove={({ url }) => {
                form.setValue(
                  "image",
                  ''
                )
              }}
              image={field.value}
            />
          )
        }}
      />
    </div>
  )
}

export default EditDimensionImageVariantForm
