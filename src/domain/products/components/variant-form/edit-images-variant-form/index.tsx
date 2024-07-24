import { Controller, UseFormReturn } from "react-hook-form"
import TrashIcon from "../../../../../components/fundamentals/icons/trash-icon"
import { ActionType } from "../../../../../components/molecules/actionables"
import Section from "../../../../../components/organisms/section"

export type EditImagesVariantFormType<T extends string> = {
  [key in T]: string[]
}

interface Props<T extends string> {
  name: T
  form: UseFormReturn<EditImagesVariantFormType<T>, any>
}

type MediaSectionProps = {
  images: string[]
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
const MediaSection = ({ images, onAdd, onRemove }: MediaSectionProps) => {
  const actions: ActionType[] = [
    {
      label: "Edit Media",
      onClick: useCloudinaryUplaod((result) => onAdd(result.info)),
    },
  ]

  return (
    <>
      <Section title="Media" actions={actions}>
        {images && images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 gap-xsmall mt-base">
            {images.map((image, index) => {
              return (
                <div
                  key={index}
                  className="relative flex items-center justify-center border aspect-square"
                >
                  <img
                    src={image}
                    alt={`Image ${index + 1}`}
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
              )
            })}
          </div>
        )}
      </Section>
    </>
  )
}

const EditImagesVariantForm = <T extends string>({ form, name }: Props<T>) => {
  return (
    <div>
      <Controller
        name={name}
        control={form.control}
        render={({ field }) => {
          console.log({ field })
          return (
            <MediaSection
              onAdd={({ url }) => {
                console.log([...form.getValues(name), url])
                form.setValue(name, [...form.getValues(name), url])
              }}
              onRemove={({ url }) => {
                form.setValue(
                  name,
                  form.getValues(name).filter((img) => img !== url)
                )
              }}
              images={field.value}
            />
          )
        }}
      />
    </div>
  )
}

export default EditImagesVariantForm
