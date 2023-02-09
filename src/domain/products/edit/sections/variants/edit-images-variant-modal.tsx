import {
  AdminPostProductsProductVariantsVariantReq,
  Product,
  ProductVariant,
} from "@medusajs/medusa"
import { useForm } from "react-hook-form"
import Button from "../../../../../components/fundamentals/button"
import Modal from "../../../../../components/molecules/modal"
import EditImagesVariantForm, {
  EditImagesVariantFormType,
} from "../../../components/variant-form/edit-images-variant-form"
import useEditProductActions from "../../hooks/use-edit-product-actions"

type Props = {
  onClose: () => void
  product: Product
  variant: ProductVariant
}
export const createUpdatePayload = (
  data: EditImagesVariantFormType
): AdminPostProductsProductVariantsVariantReq => {
  const { images } = data
  return {
    metadata: {
      images,
    },
  }
}
const EditImagesVariantModal = ({ onClose, product, variant }: Props) => {
  const form = useForm<EditImagesVariantFormType>({
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
          <EditImagesVariantForm form={form} />
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
): EditImagesVariantFormType => {
  return {
    images: variant.metadata?.images || [],
  }
}

export default EditImagesVariantModal
