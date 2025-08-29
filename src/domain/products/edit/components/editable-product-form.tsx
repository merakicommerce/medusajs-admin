import React, { useState, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { Product } from '@medusajs/medusa'
import clsx from 'clsx'
import Button from '../../../../components/fundamentals/button'
import InputField from '../../../../components/molecules/input'
import Textarea from '../../../../components/molecules/textarea'
import useNotification from '../../../../hooks/use-notification'
import useEditProductActions from '../hooks/use-edit-product-actions'

type EditableProductFormData = {
  title: string
  description: string
  handle: string
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
  return {
    title: product.title || "",
    description: product.description || "",
    handle: product.handle || "",
  }
}

export default EditableProductForm