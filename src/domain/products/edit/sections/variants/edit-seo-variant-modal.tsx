import { Product, ProductVariant } from "@medusajs/medusa"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import Button from "../../../../../components/fundamentals/button"
import InputField from "../../../../../components/molecules/input"
import Textarea from "../../../../../components/molecules/textarea"
import Modal from "../../../../../components/molecules/modal"
import useEditProductActions from "../../hooks/use-edit-product-actions"

type Props = {
  variant: ProductVariant
  product: Product
  onClose: () => void
}

type SEOFormData = {
  meta_title: string
  meta_keyword: string
  meta_description: string
}

const EditSEOVariantModal = ({ variant, product, onClose }: Props) => {
  const { onUpdateVariant, updatingVariant } = useEditProductActions(product.id)

  // Get fallback values from product metadata
  const productMetadata = product.metadata && typeof product.metadata === 'object' 
    ? product.metadata as any 
    : {}

  const variantMetadata = variant.metadata && typeof variant.metadata === 'object' 
    ? variant.metadata as any 
    : {}

  const form = useForm<SEOFormData>({
    defaultValues: {
      meta_title: variantMetadata.meta_title || productMetadata.meta_title || '',
      meta_keyword: variantMetadata.meta_keyword || productMetadata.meta_keyword || '',
      meta_description: variantMetadata.meta_description || productMetadata.meta_description || '',
    }
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty, errors }
  } = form

  // Reset form when variant changes
  useEffect(() => {
    reset({
      meta_title: variantMetadata.meta_title || productMetadata.meta_title || '',
      meta_keyword: variantMetadata.meta_keyword || productMetadata.meta_keyword || '',
      meta_description: variantMetadata.meta_description || productMetadata.meta_description || '',
    })
  }, [variant, product, reset])

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = handleSubmit((data) => {
    const updatedMetadata = {
      ...variantMetadata,
      meta_title: data.meta_title,
      meta_keyword: data.meta_keyword,
      meta_description: data.meta_description,
    }

    onUpdateVariant(
      variant.id,
      { metadata: updatedMetadata },
      handleClose
    )
  })

  const currentDescription = watch("meta_description")

  return (
    <Modal handleClose={handleClose}>
      <Modal.Header handleClose={handleClose}>
        <h1 className="inter-xlarge-semibold">
          Edit SEO - {variant.title}
          <span className="text-grey-50 inter-xlarge-regular ml-2">
            ({product.title})
          </span>
        </h1>
      </Modal.Header>
      
      <form onSubmit={onSubmit} noValidate>
        <Modal.Content>
          <div className="space-y-6">
            {/* Google Search Preview */}
            <div className="mb-8 p-4 bg-grey-5 border border-grey-20 rounded-rounded">
              <h3 className="text-sm font-medium text-grey-90 mb-3">Search engine listing preview</h3>
              <div className="bg-white p-4 rounded border">
                {/* Site name and URL */}
                <div className="text-sm text-green-600 mb-1">
                  <span>Mobelaris</span>
                </div>
                <div className="text-xs text-grey-50 mb-2">
                  {import.meta.env.VITE_SITE_URL || 'https://www.mobelaris.com'} › products › {product.handle} › {variant.title?.toLowerCase().replace(/\s+/g, '-') || 'variant'}
                </div>
                
                {/* Title */}
                <div className="text-blue-600 text-lg leading-tight mb-2 cursor-pointer hover:underline">
                  {watch("meta_title") || variant.title || product.title || "Product Title"}
                </div>
                
                {/* Description */}
                <div className="text-sm text-grey-70 leading-relaxed">
                  {watch("meta_description") || product.description || "Product description will appear here. Add a meta description to control how this variant appears in search results."}
                </div>
                
                {/* Price placeholder */}
                <div className="text-sm text-grey-90 mt-2 font-medium">
                  From £{((variant.prices?.[0]?.amount || 0) / 100).toFixed(2)} GBP
                </div>
              </div>
            </div>

            {/* SEO Fields */}
            <div className="space-y-4">
              <div>
                <InputField
                  label="Meta Title"
                  {...register("meta_title")}
                  placeholder={`${variant.title || product.title || "Product title"} | Mobelaris`}
                  errors={errors}
                />
                {!variantMetadata.meta_title && productMetadata.meta_title && (
                  <p className="text-xs text-grey-50 mt-1">
                    <span className="text-violet-60">Inheriting from product:</span> {productMetadata.meta_title}
                  </p>
                )}
              </div>
              
              <div>
                <InputField
                  label="Meta Keywords"
                  {...register("meta_keyword")}
                  placeholder="Comma-separated keywords for SEO"
                  errors={errors}
                />
                <p className="text-xs text-grey-50 mt-1">
                  Separate keywords with commas. Focus on terms your customers might search for.
                </p>
                {!variantMetadata.meta_keyword && productMetadata.meta_keyword && (
                  <p className="text-xs text-grey-50 mt-1">
                    <span className="text-violet-60">Inheriting from product:</span> {productMetadata.meta_keyword}
                  </p>
                )}
              </div>

              <div>
                <Textarea
                  label="Meta Description"
                  {...register("meta_description")}
                  placeholder="Brief description that will appear in search results..."
                  errors={errors}
                  rows={3}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-grey-50">
                    Describe this variant in 150-160 characters to improve search rankings
                  </p>
                  <p className={`text-xs ${currentDescription.length > 160 ? "text-rose-50" : "text-grey-50"}`}>
                    {currentDescription.length}/160 chars
                  </p>
                </div>
                {!variantMetadata.meta_description && productMetadata.meta_description && (
                  <p className="text-xs text-grey-50 mt-1">
                    <span className="text-violet-60">Inheriting from product:</span> {productMetadata.meta_description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Modal.Content>
        
        <Modal.Footer>
          <div className="flex items-center justify-end w-full gap-x-xsmall">
            <Button
              variant="secondary"
              size="small"
              type="button"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="small"
              type="submit"
              disabled={!isDirty}
              loading={updatingVariant}
            >
              Save SEO Settings
            </Button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default EditSEOVariantModal