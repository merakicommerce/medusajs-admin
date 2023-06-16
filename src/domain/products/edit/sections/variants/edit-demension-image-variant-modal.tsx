import {
  AdminPostProductsProductVariantsVariantReq,
  Product,
  ProductVariant,
} from "@medusajs/medusa"
import { useForm } from "react-hook-form"
import Button from "../../../../../components/fundamentals/button"
import Modal from "../../../../../components/molecules/modal"

import EditDimensionImageVariantForm, { EditDimensionImageVariantFormType } from "../../../components/variant-form/edit-dimension-image-variant-form"
import useEditProductActions from "../../hooks/use-edit-product-actions"

type Props = {
  onClose: () => void
  product: Product
  variant: ProductVariant
}
export const createUpdatePayload = (
  data: EditDimensionImageVariantFormType
): AdminPostProductsProductVariantsVariantReq => {
  const { image } = data
  return {
    metadata: {
      dimension_image: image.replace('http://', 'https://'),
    },
  }
}
const EditDimensionVariantModal = ({ onClose, product, variant }: Props) => {
  const form = useForm<EditDimensionImageVariantFormType>({
    defaultValues: getEditImagesVariantDefaultValues(variant),
  })

  const {
    formState: { isDirty },
    handleSubmit,
    reset,
  } = form

  const handleClose = () => {
    reset(getEditImagesVariantDefaultValues(variant))
    onClose()
  }

  const { onUpdateVariant, addingVariant, updatingVariant } =
    useEditProductActions(product.id)

  const onSubmit = handleSubmit((data) => {
    onUpdateVariant(variant.id, createUpdatePayload(data), handleClose)
  })

  return (
    <Modal handleClose={console.log}>
      <Modal.Header handleClose={handleClose}>
        <h1 className="inter-xlarge-semibold">
          Edit Variant
          {variant.title && (
            <span className="text-grey-50 inter-xlarge-regular">
              ({variant.title})
            </span>
          )}
        </h1>
      </Modal.Header>
      <style
        dangerouslySetInnerHTML={{
          __html: `[src^="https://upload-widget.cloudinary.com/widget"]{
            pointer-events: auto;
            }`,
        }}
      ></style>
      <form onSubmit={onSubmit} noValidate>
        <Modal.Content>
          <EditDimensionImageVariantForm form={form} />
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
              disabled={isDirty}
              loading={addingVariant || updatingVariant}
            >
              Save and close
            </Button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export const getEditImagesVariantDefaultValues = (
  variant: ProductVariant
): EditDimensionImageVariantFormType => {
  return {
    image: String(variant.metadata?.dimension_image || ''),
  }
}

export default EditDimensionVariantModal
