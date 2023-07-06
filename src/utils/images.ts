import { LineItem, ProductVariant } from "@medusajs/medusa";
import Medusa from "../services/api";
import { FormImage } from "../types/shared";

const splitImages = (
  images: FormImage[]
): { uploadImages: FormImage[]; existingImages: FormImage[] } => {
  const uploadImages: FormImage[] = []
  const existingImages: FormImage[] = []

  images.forEach((image) => {
    if (image.nativeFile) {
      uploadImages.push(image)
    } else {
      existingImages.push(image)
    }
  })

  return { uploadImages, existingImages }
}

export const prepareImages = async (images: FormImage[]) => {
  const { uploadImages, existingImages } = splitImages(images)

  let uploadedImgs: FormImage[] = []
  if (uploadImages.length > 0) {
    const files = uploadImages.map((i) => i.nativeFile)
    uploadedImgs = await Medusa.uploads
      .create(files)
      .then(({ data }) => data.uploads)
  }

  return [...existingImages, ...uploadedImgs]
}


export const repalceImage = (src: string) => src.replace(
  "res.cloudinary.com",
  "imageproxy.mobelaris.com/api/images"
)
export const getVariantImage = (variant: ProductVariant) => {


  if (variant.metadata?.images.length > 0) {
    return variant.product.images[0]
  }

  return null
}
export const getOrderLineItemImage = (item: LineItem) => {
  let variant = item.variant

  if (variant?.metadata?.images.length > 0) {
    return repalceImage(variant.metadata.images[0]).replace("/image/upload/e_trim/", `/image/upload/e_trim,w_100/`)
  }

  return item.thumbnail
}