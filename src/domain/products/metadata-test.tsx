import { useState } from "react"
import { useForm } from "react-hook-form"
import Button from "../../components/fundamentals/button"
import EditIMetadataProductForm, { EditMetadataProductFormType } from "./components/metadata-form"

const MetadataTest = () => {
  const [savedData, setSavedData] = useState<any>(null)

  const form = useForm<EditMetadataProductFormType>({
    defaultValues: {
      metadata: {
        sku: '',
        inspiredOf: '',
        description: '',
        product_type: '',
        description_1: '',
        description_2: '',
        dimension_image: '',
        magento_product_id: '',
        product_information: '',
        inspiredOfInformation: '',
        google_product_category: '',
        in_stock: false,
        images: [],
      },
    },
  })

  const { handleSubmit, formState: { isDirty } } = form

  const onSubmit = handleSubmit(async (data) => {
    console.log('🐛 DEBUG - Form submitted with data:', data.metadata)
    setSavedData(data.metadata)
  })

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-grey-90 mb-2">Metadata Form Test</h1>
        <p className="text-grey-50">Test the enhanced metadata form functionality</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <EditIMetadataProductForm form={form} />
        
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="small"
            type="submit"
            disabled={!isDirty}
          >
            Save Metadata
          </Button>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={() => {
              form.reset()
              setSavedData(null)
            }}
          >
            Reset Form
          </Button>
        </div>
      </form>

      {savedData && (
        <div className="mt-8 p-4 border border-grey-20 rounded-rounded bg-grey-5">
          <h3 className="font-medium text-grey-90 mb-3">Saved Data:</h3>
          <pre className="text-sm text-grey-70 whitespace-pre-wrap">
            {JSON.stringify(savedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default MetadataTest
