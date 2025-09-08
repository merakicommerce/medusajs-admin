import React, { useState, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { Product, ProductVariant } from '@medusajs/medusa'
import clsx from 'clsx'
import Button from '../../../../components/fundamentals/button'
import InputField from '../../../../components/molecules/input'
import Textarea from '../../../../components/molecules/textarea'
import RichTextField from '../../../../components/molecules/rich-text-field'
import useNotification from '../../../../hooks/use-notification'
import useEditProductActions from '../hooks/use-edit-product-actions'

// Helper function to check if all variants have the same heading values
const getCommonHeadingValues = (variants: ProductVariant[]) => {
  if (!variants || variants.length === 0) {
    return { 
      heading_1: "", 
      heading_2: "", 
      hasMultipleValues: false,
      hasVariants: false
    }
  }
  
  const firstVariant = variants[0]
  const firstHeading1 = (firstVariant?.metadata?.heading_1 as string) || ""
  const firstHeading2 = (firstVariant?.metadata?.heading_2 as string) || ""
  
  const allSameHeading1 = variants.every(variant => 
    ((variant.metadata?.heading_1 as string) || "") === firstHeading1
  )
  const allSameHeading2 = variants.every(variant => 
    ((variant.metadata?.heading_2 as string) || "") === firstHeading2
  )
  
  return {
    heading_1: allSameHeading1 ? firstHeading1 : "",
    heading_2: allSameHeading2 ? firstHeading2 : "",
    hasMultipleValues: !allSameHeading1 || !allSameHeading2,
    hasVariants: true
  }
}

type EditableProductFormData = {
  title: string
  description: string
  metadata: {
    heading_1: string
    description_1: string
    heading_2: string
    description_2: string
  }
}

type Props = {
  product: Product
}

const EditableProductForm: React.FC<Props> = ({ product }) => {
  const { onUpdate, onUpdateVariant, updating, updatingVariant } = useEditProductActions(product.id)
  const notification = useNotification()
  
  // Get variant heading info for UI feedback
  const variantHeadings = getCommonHeadingValues(product.variants || [])

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

  const onSubmit = handleSubmit(async (data) => {
    try {
      // First update the product basic info and description metadata (not headings)
      await new Promise<void>((resolve, reject) => {
        onUpdate(
          {
            title: data.title,
            description: data.description,
            metadata: {
              // Only save description metadata to product, not headings
              description_1: data.metadata.description_1,
              description_2: data.metadata.description_2,
            },
          },
          () => resolve(),
        )
      })
      
      // Then update all variants with heading values
      if (product.variants && product.variants.length > 0) {
        const variantUpdates = product.variants.map(variant => {
          return new Promise<void>((resolve, reject) => {
            onUpdateVariant(
              variant.id,
              {
                metadata: {
                  ...variant.metadata,
                  heading_1: data.metadata.heading_1,
                  heading_2: data.metadata.heading_2,
                }
              },
              () => resolve(),
              "" // No success message for individual variants
            )
          })
        })
        
        await Promise.all(variantUpdates)
        notification("Success", "Product and variant headings updated successfully", "success")
      } else {
        notification("Success", "Product updated successfully", "success")
      }
      
      console.log("Product and variants updated successfully")
    } catch (error) {
      console.error("Error updating product/variants:", error)
      notification("Error", "Failed to update product", "error")
    }
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



          {/* Heading 1 */}
          <div>
            <InputField
              label={`Heading 1${!variantHeadings.hasVariants ? ' (No variants)' : variantHeadings.hasMultipleValues ? ' (Variants have different values)' : ''}`}
              {...register("metadata.heading_1")}
              errors={errors}
              placeholder={
                !variantHeadings.hasVariants 
                  ? "No variants to update" 
                  : variantHeadings.hasMultipleValues 
                    ? "Variants have different values - will update all to this value" 
                    : "Enter heading for additional description 1..."
              }
            />
          </div>

          {/* Description 1 (Rich Text) */}
          <div>
            <RichTextField
              label="Additional Description 1"
              name="metadata.description_1"
              value={watch("metadata.description_1") || ''}
              onChange={(value) => setValue("metadata.description_1", value, { shouldDirty: true })}
              placeholder="Enter additional description..."
              errors={errors}
            />
          </div>

          {/* Heading 2 */}
          <div>
            <InputField
              label={`Heading 2${!variantHeadings.hasVariants ? ' (No variants)' : variantHeadings.hasMultipleValues ? ' (Variants have different values)' : ''}`}
              {...register("metadata.heading_2")}
              errors={errors}
              placeholder={
                !variantHeadings.hasVariants 
                  ? "No variants to update" 
                  : variantHeadings.hasMultipleValues 
                    ? "Variants have different values - will update all to this value" 
                    : "Enter heading for additional description 2..."
              }
            />
          </div>

          {/* Description 2 (Rich Text) */}
          <div>
            <RichTextField
              label="Additional Description 2"
              name="metadata.description_2"
              value={watch("metadata.description_2") || ''}
              onChange={(value) => setValue("metadata.description_2", value, { shouldDirty: true })}
              placeholder="Enter additional description..."
              errors={errors}
            />
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
                  disabled={updating || updatingVariant}
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={onSubmit}
                  loading={updating || updatingVariant}
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
  const metadata = product.metadata || {}
  
  // Get heading values from variants
  const variantHeadings = getCommonHeadingValues(product.variants || [])
  
  return {
    title: product.title || "",
    description: product.description || "",
    metadata: {
      heading_1: variantHeadings.heading_1,
      description_1: (metadata.description_1 as string) || "",
      heading_2: variantHeadings.heading_2,
      description_2: (metadata.description_2 as string) || "",
    },
  }
}

export default EditableProductForm