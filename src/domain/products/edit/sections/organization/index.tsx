import { Product } from "@medusajs/medusa"
import React from "react"
import { Controller, useFormContext } from "react-hook-form"
import Section from "../../../../../components/organisms/section"
import {
  NextCreateableSelect,
  NextSelect,
} from "../../../../../components/molecules/select/next-select"
import TagInput from "../../../../../components/molecules/tag-input"
import { Option } from "../../../../../types/shared"
import useOrganizeData from "../../components/organize-form/use-organize-data"
import useEditProductActions from "../../hooks/use-edit-product-actions"

type Props = {
  product: Product
}


const OrganizationSection = ({ product }: Props) => {
  const { control, setValue } = useFormContext()
  const { productTypeOptions, collectionOptions } = useOrganizeData()
  const { updating, updatingVariant } = useEditProductActions(product.id)

  const onCreateOption = (value: string) => {
    const newOption = { label: value, value }
    // Add to options list (this will be handled by the hook on next render)
    productTypeOptions.push(newOption)
    setValue("type", newOption, { shouldDirty: true })
  }

  return (
    <Section title="Product Organization">
      <div className="mt-4 space-y-4">
        {/* Type and Collection Row */}
        <div className="grid grid-cols-1 gap-4">
          <Controller
            name="type"
            control={control}
            render={({ field: { value, onChange } }) => {
              return (
                <NextCreateableSelect
                  label="Type"
                  onChange={(newValue) => {
                    onChange(newValue)
                  }}
                  options={productTypeOptions}
                  value={value || null}
                  placeholder="Choose a type"
                  onCreateOption={onCreateOption}
                  isClearable
                  isDisabled={updating || updatingVariant}
                />
              )
            }}
          />
          <Controller
            name="collection"
            control={control}
            render={({ field: { value, onChange } }) => {
              return (
                <NextSelect
                  label="Collection"
                  onChange={(newValue) => {
                    onChange(newValue)
                  }}
                  options={collectionOptions}
                  value={value}
                  placeholder="Choose a collection"
                  isClearable
                  isDisabled={updating || updatingVariant}
                />
              )
            }}
          />
        </div>
        
        {/* Tags */}
        <Controller
          control={control}
          name="tags"
          render={({ field: { value, onChange } }) => {
            return (
              <TagInput
                onChange={(newValue) => {
                  onChange(newValue)
                }}
                values={value || []}
                disabled={updating || updatingVariant}
              />
            )
          }}
        />
      </div>
    </Section>
  )
}



export default OrganizationSection
