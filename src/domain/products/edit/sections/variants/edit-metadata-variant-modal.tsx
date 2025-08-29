import {
  AdminPostProductsProductVariantsVariantReq,
  Product,
  ProductVariant,
} from "@medusajs/medusa"
import { useForm } from "react-hook-form"
import Button from "../../../../../components/fundamentals/button"
import Modal from "../../../../../components/molecules/modal"

import EditIMetadataVariantForm, {
  EditMetadataVariantFormType,
} from "../../../components/variant-form/edit-metafields-variant-form"
import useEditProductActions from "../../hooks/use-edit-product-actions"

type Props = {
  onClose: () => void
  product: Product
  variant: ProductVariant
}
export const createUpdatePayload = (
  data: EditMetadataVariantFormType
): AdminPostProductsProductVariantsVariantReq => {
  const { metadata } = data
  return {
    metadata,
  }
}
const EditIMetadataVariantModal = ({ onClose, product, variant }: Props) => {
  const form = useForm<EditMetadataVariantFormType>({
    defaultValues: getEditIMetadataVariantDefaultValues(variant),
  })

  const {
    formState: { isDirty },
    handleSubmit,
    reset,
  } = form

  const handleClose = () => {
    reset(getEditIMetadataVariantDefaultValues(variant))
    onClose()
  }
  console.log(form.getValues())
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
          <EditIMetadataVariantForm form={form} />
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

export const getEditIMetadataVariantDefaultValues = (
  variant: ProductVariant
): EditMetadataVariantFormType => {
  const {
    color,
    in_stock,
    leadtime,
    material,
    description,
    product_information,
    dimension_image,
    heading_1,
    heading_2,
    description_image_1,
    description_image_2,
    images,
  } = variant.metadata as {
    color: string
    in_stock: boolean | string
    leadtime: string
    material: string
    description: string
    product_information: string
    heading_1: string
    heading_2: string
    dimension_image: string
    description_image_1: string
    description_image_2: string
    images: string[] | string
  }
  return {
    metadata: {
      color,
      in_stock: in_stock || false,
      leadtime,
      material,
      description,
      product_information,
      heading_1,
      dimension_image,
      heading_2,
      description_image_1,
      description_image_2,
      images: images || [],
    },
  }
}

export default EditIMetadataVariantModal
