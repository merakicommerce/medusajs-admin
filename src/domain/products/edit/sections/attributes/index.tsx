import { Product } from "@medusajs/medusa"
import { useAdminUpdateProduct } from "medusa-react"
import { useForm } from "react-hook-form"
import Button from "../../../../../components/fundamentals/button"
import EditIMetadataProductForm, { EditMetadataProductFormType } from "../../../components/metadata-form"
import Section from "../../../../../components/organisms/section"

type Props = {
  product: Product
}

const AttributesSection = ({ product }: Props) => {
  const updateProduct = useAdminUpdateProduct(product.id)

  // Ensure metadata is a proper object
  const productMetadata = product.metadata && typeof product.metadata === 'object' 
    ? product.metadata 
    : {}

  const form = useForm<EditMetadataProductFormType>({
    defaultValues: {
      metadata: {
        sku: productMetadata.sku || '',
        inspiredOf: productMetadata.inspiredOf || '',
        description: productMetadata.description || '',
        product_type: productMetadata.product_type || '',
        description_1: productMetadata.description_1 || '',
        description_2: productMetadata.description_2 || '',
        dimension_image: productMetadata.dimension_image || '',
        magento_product_id: productMetadata.magento_product_id || '',
        product_information: productMetadata.product_information || '',
        inspiredOfInformation: productMetadata.inspiredOfInformation || '',
        google_product_category: productMetadata.google_product_category || '',
      },
    },
  })

  const { handleSubmit, formState: { isDirty } } = form

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateProduct.mutateAsync({
        metadata: data.metadata,
      })
      console.log('🐛 DEBUG - Metadata saved successfully:', data.metadata)
    } catch (error) {
      console.error('🐛 DEBUG - Failed to save metadata:', error)
    }
  })

  return (
    <form onSubmit={onSubmit}>
      <Section
        title="Product Metadata"
        description="Additional product information and custom fields"
        actions={
          <Button
            variant="secondary"
            size="small"
            type="submit"
            disabled={!isDirty || updateProduct.isLoading}
            loading={updateProduct.isLoading}
          >
            Save metadata
          </Button>
        }
      >
        <div className="mt-base">
          <EditIMetadataProductForm form={form} />
        </div>
      </Section>
    </form>
  )
}

export default AttributesSection
