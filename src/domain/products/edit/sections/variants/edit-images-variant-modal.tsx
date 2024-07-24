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
  name: string
  onClose: () => void
  product: Product
  variant: ProductVariant
}
export const createUpdatePayload = <T extends string>(
  data: EditImagesVariantFormType<T>
): AdminPostProductsProductVariantsVariantReq => {
  return {
    metadata: data,
  }
}
const EditImagesVariantModal = ({ onClose, product, variant, name }: Props) => {
  const form = useForm<EditImagesVariantFormType<typeof name>>({
    defaultValues: getEditImagesVariantDefaultValues(variant, name),
  })

  const {
    formState: { isDirty },
    handleSubmit,
    reset,
  } = form

  const handleClose = () => {
    reset(getEditImagesVariantDefaultValues(variant, name))
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
          <EditImagesVariantForm form={form} name={name} />
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

export const getEditImagesVariantDefaultValues = <T extends string>(
  variant: ProductVariant,
  name: T
): EditImagesVariantFormType<T> => {
  console.log({ "variant.metadata?.[name] ": variant.metadata?.[name], name })
  return {
    [name]: (variant.metadata?.[name] as string[]) || [],
  }
}

export default EditImagesVariantModal
