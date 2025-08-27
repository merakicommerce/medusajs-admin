import {
  AdminPostProductsProductReq,
  Product,
} from "@medusajs/medusa"
import { useForm } from "react-hook-form"
import Button from "../../../../../components/fundamentals/button"
import Modal from "../../../../../components/molecules/modal"
import EditIMetadataProductForm, {
  EditMetadataProductFormType,
} from "../../../components/metadata-form"

import useEditProductActions from "../../hooks/use-edit-product-actions"

type Props = {
  onClose: () => void
  product: Product
}
export const createUpdatePayload = (
  data: EditMetadataProductFormType
): Partial<AdminPostProductsProductReq> => {
  const { metadata } = data
  return {
    metadata,
  }
}
const EditIMetadataProductModal = ({ onClose, product }: Props) => {
  const form = useForm<EditMetadataProductFormType>({
    defaultValues: getEditIMetadataProductDefaultValues(product),
  })

  const {
    formState: { isDirty },
    handleSubmit,
    reset,
  } = form

  const handleClose = () => {
    reset(getEditIMetadataProductDefaultValues(product))
    onClose()
  }
  console.log(form.getValues())
  const { onUpdate, updating } = useEditProductActions(product.id)

  const onSubmit = handleSubmit((data) => {
    onUpdate(createUpdatePayload(data), handleClose)
  })

  return (
    <Modal handleClose={console.log}>
      <Modal.Header handleClose={handleClose}>
        <h1 className="inter-xlarge-semibold">
          Edit Variant
          {product.title && (
            <span className="text-grey-50 inter-xlarge-regular">
              ({product.title})
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
          <EditIMetadataProductForm form={form} />
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
              loading={updating}
            >
              Save and close
            </Button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export const getEditIMetadataProductDefaultValues = (
  product: Product
): EditMetadataProductFormType => {
  const {
    sku,
    inspiredOf,
    description,
    product_type,
    description_1,
    description_2,
    dimension_image,
    magento_product_id,
    product_information,
    inspiredOfInformation,
    google_product_category,
  } = product.metadata as any
  return {
    metadata: {
      sku,
      inspiredOf,
      description,
      product_type,
      description_1,
      description_2,
      dimension_image,
      magento_product_id,
      product_information,
      inspiredOfInformation,
      google_product_category,
    },
  }
}

export default EditIMetadataProductModal
