import { Product } from "@medusajs/medusa"
import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import Button from "../../../../../components/fundamentals/button"
import Modal from "../../../../../components/molecules/modal"
import { nestedForm } from "../../../../../utils/nested-form"
import DiscountableForm, {
  DiscountableFormType,
} from "../../../components/discountable-form"
import GeneralForm, { GeneralFormType } from "../../../components/general-form"
import OrganizeForm, {
  OrganizeFormType,
} from "../../../components/organize-form"
import EditIMetadataProductForm, {
  EditMetadataProductFormType,
} from "../../../components/metadata-form"
import useEditProductActions from "../../hooks/use-edit-product-actions"

type Props = {
  product: Product
  open: boolean
  onClose: () => void
}

type GeneralFormWrapper = {
  general: GeneralFormType
  organize: OrganizeFormType
  discountable: DiscountableFormType
  metadata: EditMetadataProductFormType["metadata"]
}

const GeneralModal = ({ product, open, onClose }: Props) => {
  const { onUpdate, updating } = useEditProductActions(product.id)
  const form = useForm<GeneralFormWrapper>({
    defaultValues: getDefaultValues(product),
  })

  const {
    formState: { isDirty },
    handleSubmit,
    reset,
  } = form

  useEffect(() => {
    reset(getDefaultValues(product))
  }, [product])

  const onReset = () => {
    reset(getDefaultValues(product))
    onClose()
  }

  const onSubmit = handleSubmit((data) => {
    console.log('🐛 DEBUG - Form submission data:', data)
    console.log('🐛 DEBUG - Metadata structure:', data.metadata)
    console.log('🐛 DEBUG - Dimension image value:', data.metadata?.metadata?.dimension_image)
    
    const metadataToSave = data.metadata?.metadata || data.metadata || {}
    console.log('🐛 DEBUG - Final metadata to save:', metadataToSave)
    
    onUpdate(
      {
        title: data.general.title,
        handle: data.general.handle,
        // @ts-ignore
        material: data.general.material,
        // @ts-ignore
        subtitle: data.general.subtitle,
        // @ts-ignore
        description: data.general.description,
        // @ts-ignore
        type: data.organize.type
          ? {
              id: data.organize.type.value,
              value: data.organize.type.label,
            }
          : null,
        // @ts-ignore
        collection_id: data.organize.collection
          ? data.organize.collection.value
          : null,
        // @ts-ignore
        tags: data.organize.tags
          ? data.organize.tags.map((t) => ({ value: t }))
          : null,
        discountable: data.discountable.value,
        // @ts-ignore
        metadata: data.metadata || {},
      },
      onReset
    )
  })

  return (
    <Modal open={open} handleClose={onReset} isLargeModal>
      <Modal.Body>
        <Modal.Header handleClose={onReset}>
          <h1 className="inter-xlarge-semibold m-0">
            Edit General Information
          </h1>
        </Modal.Header>
        <form onSubmit={onSubmit}>
          <Modal.Content>
            <GeneralForm form={nestedForm(form, "general")} />
            <div className="my-xlarge">
              <h2 className="inter-base-semibold mb-base">Organize Product</h2>
              <OrganizeForm form={nestedForm(form, "organize")} />
            </div>
            <DiscountableForm form={nestedForm(form, "discountable")} />
            <div className="my-xlarge">
              <h2 className="inter-base-semibold mb-base">Product Metadata</h2>
              <EditIMetadataProductForm form={form as any} />
            </div>
          </Modal.Content>
          <Modal.Footer>
            <div className="flex gap-x-2 justify-end w-full">
              <Button
                size="small"
                variant="secondary"
                type="button"
                onClick={onReset}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="primary"
                type="submit"
                disabled={!isDirty}
                loading={updating}
              >
                Save
              </Button>
            </div>
          </Modal.Footer>
        </form>
      </Modal.Body>
    </Modal>
  )
}

const getDefaultValues = (product: Product): GeneralFormWrapper => {
  return {
    general: {
      title: product.title,
      subtitle: product.subtitle,
      material: product.material,
      handle: product.handle!,
      description: product.description || null,
    },
    organize: {
      collection: product.collection
        ? { label: product.collection.title, value: product.collection.id }
        : null,
      type: product.type
        ? { label: product.type.value, value: product.type.id }
        : null,
      tags: product.tags ? product.tags.map((t) => t.value) : null,
    },
    discountable: {
      value: product.discountable,
    },
    metadata: {
      sku: product.metadata?.sku || "",
      inspiredOf: product.metadata?.inspiredOf || "",
      description: product.metadata?.description || "",
      product_type: product.metadata?.product_type || "",
      description_1: product.metadata?.description_1 || "",
      description_2: product.metadata?.description_2 || "",
      dimension_image: product.metadata?.dimension_image || "",
      magento_product_id: product.metadata?.magento_product_id || "",
      product_information: product.metadata?.product_information || "",
      inspiredOfInformation: product.metadata?.inspiredOfInformation || "",
      google_product_category: product.metadata?.google_product_category || "",
    },
  }
}

export default GeneralModal
