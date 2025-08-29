import React, { useState, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { Product } from '@medusajs/medusa'
import clsx from 'clsx'
import Button from '../../../../components/fundamentals/button'
import InputField from '../../../../components/molecules/input'
import Textarea from '../../../../components/molecules/textarea'
import KeyValueField from '../../../../components/molecules/key-value-field'
import BooleanField from '../../../../components/molecules/boolean-field'
import ImageArrayField from '../../../../components/molecules/image-array-field'
import CompactImageField from '../../../../components/molecules/compact-image-field'
import useNotification from '../../../../hooks/use-notification'
import useEditProductActions from '../hooks/use-edit-product-actions'
import { normalizeImageData, createImageData, type ImageData, type ImageMetadata } from '../../../../utils/image-metadata-utils'

type EditableProductFormData = {
  title: string
  description: string
  handle: string
  weight: number | null
  length: number | null
  width: number | null
  height: number | null
  hs_code: string
  mid_code: string
  material: string
  origin_country: string
  // Metadata fields
  metadata: {
    sku: string
    inspiredOf: string
    description: string
    product_type: string
    description_1: string
    description_2: string
    dimension_image: ImageMetadata
    magento_product_id: string
    product_information: string
    inspiredOfInformation: string
    google_product_category: string
    in_stock: boolean | string
    images: ImageData[] | string[] | string
    // SEO fields
    meta_title: string
    meta_keyword: string
    meta_description: string
  }
}

type Props = {
  product: Product
}

const EditableProductForm: React.FC<Props> = ({ product }) => {
  const { onUpdate, updating } = useEditProductActions(product.id)
  const notification = useNotification()

  const methods = useForm<EditableProductFormData>({
    defaultValues: getDefaultValues(product)
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty, errors }
  } = methods

  // Reset form when product changes
  useEffect(() => {
    reset(getDefaultValues(product))
  }, [product, reset])

  const onSubmit = handleSubmit((data) => {
    onUpdate(
      {
        title: data.title,
        description: data.description,
        handle: data.handle,
        weight: data.weight,
        length: data.length,
        width: data.width,
        height: data.height,
        hs_code: data.hs_code,
        mid_code: data.mid_code,
        material: data.material,
        origin_country: data.origin_country,
        metadata: data.metadata,
      },
      () => {
        // onSuccess callback - this is what was missing!
        console.log("Product updated successfully")
      }
    )
  })

  const handleReset = () => {
    reset(getDefaultValues(product))
  }

  return (
    <FormProvider {...methods}>
      <div className="relative">
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <InputField
              label="Title"
              {...register("title", { required: "Title is required" })}
              errors={errors}
            />
          </div>

          {/* Description */}
          <div>
            <Textarea
              label="Description"
              {...register("description")}
              errors={errors}
              rows={3}
            />
          </div>

          {/* Handle */}
          <div>
            <InputField
              label="Handle"
              {...register("handle")}
              errors={errors}
            />
          </div>

          {/* Dimensions Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputField
                label="Weight (g)"
                type="number"
                {...register("weight", { valueAsNumber: true })}
                errors={errors}
              />
            </div>

            <div>
              <InputField
                label="Length (cm)"
                type="number"
                {...register("length", { valueAsNumber: true })}
                errors={errors}
              />
            </div>

            <div>
              <InputField
                label="Width (cm)"
                type="number"
                {...register("width", { valueAsNumber: true })}
                errors={errors}
              />
            </div>

            <div>
              <InputField
                label="Height (cm)"
                type="number"
                {...register("height", { valueAsNumber: true })}
                errors={errors}
              />
            </div>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputField
                label="HS Code"
                {...register("hs_code")}
                errors={errors}
              />
            </div>

            <div>
              <InputField
                label="MID Code"
                {...register("mid_code")}
                errors={errors}
              />
            </div>

            <div>
              <InputField
                label="Material"
                {...register("material")}
                errors={errors}
              />
            </div>

            <div>
              <InputField
                label="Origin Country"
                {...register("origin_country")}
                errors={errors}
              />
            </div>
          </div>

          {/* Metadata Section */}
          <div className="mt-8 pt-6 border-t border-grey-20">
            <h2 className="text-xl font-semibold text-grey-90 mb-6">Product Metadata</h2>
            
            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-grey-90 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="SKU"
                  {...register("metadata.sku")}
                  errors={errors}
                />
                <InputField
                  label="Product Type"
                  {...register("metadata.product_type")}
                  errors={errors}
                />
                <InputField
                  label="Magento Product ID"
                  {...register("metadata.magento_product_id")}
                  errors={errors}
                />
                <InputField
                  label="Google Product Category"
                  {...register("metadata.google_product_category")}
                  errors={errors}
                />
                <InputField
                  label="Inspired Of"
                  {...register("metadata.inspiredOf")}
                  errors={errors}
                />
                <BooleanField
                  label="In Stock"
                  name="metadata.in_stock"
                  value={watch("metadata.in_stock")}
                  onChange={(value) => setValue("metadata.in_stock", value, { shouldDirty: true })}
                  errors={errors}
                />
              </div>
            </div>

            {/* Content & Descriptions */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-grey-90 mb-4">Content & Descriptions</h3>
              <div className="space-y-4">
                <KeyValueField
                  label="Description"
                  name="metadata.description"
                  value={watch("metadata.description")}
                  onChange={(value) => setValue("metadata.description", value, { shouldDirty: true })}
                  placeholder="Enter description...

For structured data, use format:
Top: Brushed Brass
Base: White Marble
Style: Modern Classic
Warranty: 5 Years"
                  errors={errors}
                />
                <Textarea
                  label="Description 1"
                  {...register("metadata.description_1")}
                  errors={errors}
                  rows={3}
                />
                <Textarea
                  label="Description 2"
                  {...register("metadata.description_2")}
                  errors={errors}
                  rows={3}
                />
                <KeyValueField
                  label="Product Information"
                  name="metadata.product_information"
                  value={watch("metadata.product_information")}
                  onChange={(value) => setValue("metadata.product_information", value, { shouldDirty: true })}
                  placeholder="Enter product information...

For structured data, use format:
Material: Premium Oak Wood
Dimensions: 120cm x 80cm x 75cm
Weight: 25kg
Color: Natural Oak"
                  errors={errors}
                />
                <Textarea
                  label="Inspired Of Information"
                  {...register("metadata.inspiredOfInformation")}
                  errors={errors}
                  rows={3}
                />
              </div>
            </div>

            {/* Media */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-grey-90 mb-4">Media</h3>
              <div className="space-y-4">
                <CompactImageField
                  label="Dimension Image"
                  name="metadata.dimension_image"
                  value={watch("metadata.dimension_image")}
                  onChange={(value) => setValue("metadata.dimension_image", value, { shouldDirty: true })}
                  errors={errors}
                />
                <ImageArrayField
                  label="Product Images"
                  name="metadata.images"
                  value={watch("metadata.images")}
                  onChange={(value) => setValue("metadata.images", value, { shouldDirty: true })}
                  errors={errors}
                />
              </div>
            </div>

            {/* SEO Fields */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-grey-90 mb-4">SEO Settings</h3>
              <div className="space-y-4">
                <InputField
                  label="Meta Title"
                  {...register("metadata.meta_title")}
                  placeholder="Custom title for search engines and social media"
                  errors={errors}
                />
                <InputField
                  label="Meta Keywords"
                  {...register("metadata.meta_keyword")}
                  placeholder="Comma-separated keywords for SEO"
                  errors={errors}
                />
                <Textarea
                  label="Meta Description"
                  {...register("metadata.meta_description")}
                  placeholder="Brief description for search engines (150-160 characters recommended)"
                  errors={errors}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Floating Save Button */}
          {isDirty && (
            <div className="fixed bottom-6 right-6 z-50 bg-white shadow-2xl border border-grey-20 rounded-rounded p-4 flex items-center space-x-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-grey-90">
                  Unsaved changes
                </span>
                <span className="text-xs text-grey-50">
                  Click save to apply changes
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="small"
                  onClick={handleReset}
                  disabled={updating}
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={onSubmit}
                  loading={updating}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </FormProvider>
  )
}

const getDefaultValues = (product: Product): EditableProductFormData => {
  const productMetadata = product.metadata && typeof product.metadata === 'object' 
    ? product.metadata 
    : {}

  return {
    title: product.title || "",
    description: product.description || "",
    handle: product.handle || "",
    weight: product.weight || null,
    length: product.length || null,
    width: product.width || null,
    height: product.height || null,
    hs_code: product.hs_code || "",
    mid_code: product.mid_code || "",
    material: product.material || "",
    origin_country: product.origin_country || "",
    metadata: {
      sku: (productMetadata as any).sku || '',
      inspiredOf: (productMetadata as any).inspiredOf || '',
      description: (productMetadata as any).description || '',
      product_type: (productMetadata as any).product_type || '',
      description_1: (productMetadata as any).description_1 || '',
      description_2: (productMetadata as any).description_2 || '',
      dimension_image: (productMetadata as any).dimension_image || '',
      magento_product_id: (productMetadata as any).magento_product_id || '',
      product_information: (productMetadata as any).product_information || '',
      inspiredOfInformation: (productMetadata as any).inspiredOfInformation || '',
      google_product_category: (productMetadata as any).google_product_category || '',
      in_stock: (productMetadata as any).in_stock || false,
      images: (productMetadata as any).images || [],
      // SEO fields
      meta_title: (productMetadata as any).meta_title || '',
      meta_keyword: (productMetadata as any).meta_keyword || '',
      meta_description: (productMetadata as any).meta_description || '',
    }
  }
}

export default EditableProductForm