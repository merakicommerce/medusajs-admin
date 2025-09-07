import {
  useAdminCollection,
  useAdminDeleteCollection,
  useAdminUpdateCollection,
} from "medusa-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import BackButton from "../../../components/atoms/back-button"
import Spinner from "../../../components/atoms/spinner"
import Button from "../../../components/fundamentals/button"
import EditIcon from "../../../components/fundamentals/icons/edit-icon"
import TrashIcon from "../../../components/fundamentals/icons/trash-icon"
import Actionables from "../../../components/molecules/actionables"
import InputField from "../../../components/molecules/input"
import JSONView from "../../../components/molecules/json-view"
import RichTextField from "../../../components/molecules/rich-text-field"
import DeletePrompt from "../../../components/organisms/delete-prompt"
import Section from "../../../components/organisms/section"
import AddProductsTable from "../../../components/templates/collection-product-table/add-product-table"
import ViewProductsTable from "../../../components/templates/collection-product-table/view-products-table"
import useNotification from "../../../hooks/use-notification"
import Medusa from "../../../services/api"
import { getErrorMessage } from "../../../utils/error-messages"

const CollectionDetails = () => {
  const { id } = useParams()

  const { collection, isLoading, refetch } = useAdminCollection(id!)
  const deleteCollection = useAdminDeleteCollection(id!)
  const updateCollection = useAdminUpdateCollection(id!)
  const [showDelete, setShowDelete] = useState(false)
  const [showAddProducts, setShowAddProducts] = useState(false)
  const navigate = useNavigate()
  const notification = useNotification()
  const [updates, setUpdates] = useState(0)
  const [description, setDescription] = useState("")
  const [originalDescription, setOriginalDescription] = useState("")
  const [title, setTitle] = useState("")
  const [originalTitle, setOriginalTitle] = useState("")
  const [handle, setHandle] = useState("")
  const [originalHandle, setOriginalHandle] = useState("")
  const [hasChanges, setHasChanges] = useState(false)

  const handleDelete = () => {
    deleteCollection.mutate(undefined, {
      onSuccess: () => navigate(`/a/collections`),
    })
  }

  const handleSaveCollection = () => {
    const currentMetadata = collection?.metadata || {}
    const updatedMetadata = {
      ...currentMetadata,
      description: description,
    }

    console.log("Saving description:", description)
    console.log("Updated metadata:", updatedMetadata)

    updateCollection.mutate(
      {
        title: title,
        handle: handle,
        metadata: updatedMetadata,
      },
      {
        onSuccess: () => {
          notification("Success", "Collection updated successfully", "success")
          setOriginalDescription(description)
          setOriginalTitle(title)
          setOriginalHandle(handle)
          setHasChanges(false)
          refetch()
        },
        onError: (error) => {
          notification("Error", getErrorMessage(error), "error")
        },
      }
    )
  }

  const handleDescriptionChange = (value: string) => {
    console.log("Description changed:", value)
    console.log("Description contains <br>:", value.includes('<br>'))
    setDescription(value)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    console.log("Title changed:", value)
    setTitle(value)
  }

  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    console.log("Handle changed:", value)
    setHandle(value)
  }

  const handleReset = () => {
    setTitle(originalTitle)
    setHandle(originalHandle)
    setDescription(originalDescription)
    setHasChanges(false)
  }

  const handleAddProducts = async (
    addedIds: string[],
    removedIds: string[]
  ) => {
    try {
      if (addedIds.length > 0) {
        await Medusa.collections.addProducts(collection?.id, {
          product_ids: addedIds,
        })
      }

      if (removedIds.length > 0) {
        await Medusa.collections.removeProducts(collection?.id, {
          product_ids: removedIds,
        })
      }

      setShowAddProducts(false)
      notification("Success", "Updated products in collection", "success")
      refetch()
    } catch (error) {
      notification("Error", getErrorMessage(error), "error")
    }
  }

  useEffect(() => {
    if (collection?.products?.length) {
      setUpdates(updates + 1) // force re-render product table when products are added/removed
    }
  }, [collection?.products])

  useEffect(() => {
    if (collection) {
      const desc = collection.metadata?.description as string || ""
      const collectionTitle = collection.title || ""
      const collectionHandle = collection.handle || ""
      
      console.log("Loading collection description from API:", desc)
      console.log("Description contains <br> tags:", desc.includes('<br>'))
      
      setDescription(desc)
      setOriginalDescription(desc)
      setTitle(collectionTitle)
      setOriginalTitle(collectionTitle)
      setHandle(collectionHandle)
      setOriginalHandle(collectionHandle)
      setHasChanges(false)
    }
  }, [collection])

  useEffect(() => {
    const titleChanged = title !== originalTitle
    const handleChanged = handle !== originalHandle
    const descriptionChanged = description !== originalDescription
    setHasChanges(titleChanged || handleChanged || descriptionChanged)
  }, [title, handle, description, originalTitle, originalHandle, originalDescription])

  return (
    <>
      <div className="flex flex-col !pb-xlarge">
        <BackButton
          className="mb-xsmall"
          path="/a/products?view=collections"
          label="Back to Collections"
        />
        <div className="rounded-rounded py-large px-xlarge border border-grey-20 bg-grey-0 mb-large">
          {isLoading || !collection ? (
            <div className="flex items-center w-full h-12">
              <Spinner variant="secondary" size="large" />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-large">
                <h2 className="inter-xlarge-semibold">Edit Collection</h2>
                <Actionables
                  forceDropdown
                  actions={[
                    {
                      label: "Delete",
                      onClick: () => setShowDelete(!showDelete),
                      variant: "danger",
                      icon: <TrashIcon size="20" />,
                    },
                  ]}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-large">
                <InputField
                  label="Title"
                  placeholder="Collection title"
                  value={title}
                  onChange={handleTitleChange}
                />
                <InputField
                  label="Handle"
                  placeholder="collection-handle"
                  value={handle}
                  onChange={handleHandleChange}
                  prefix="/"
                />
              </div>
              
              <div>
                <RichTextField
                  label="Description"
                  name="collection-description"
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="Enter collection description..."
                />
              </div>
              
              {hasChanges && (
                <div className="fixed bottom-8 right-8 bg-white rounded-lg shadow-lg border border-grey-20 p-4 flex items-center gap-x-4">
                  <div className="flex flex-col">
                    <p className="inter-base-semibold text-grey-90">Unsaved changes</p>
                    <p className="inter-small-regular text-grey-50">Click save to apply changes</p>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={handleReset}
                      disabled={updateCollection.isLoading}
                    >
                      Reset
                    </Button>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={handleSaveCollection}
                      loading={updateCollection.isLoading}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
              {collection.metadata && (
                <div className="mt-large flex flex-col gap-y-base">
                  <h3 className="inter-base-semibold">Metadata</h3>
                  <div>
                    <JSONView data={collection.metadata} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <Section
          title="Products"
          actions={[
            {
              label: "Edit Products",
              icon: <EditIcon size="20" />,
              onClick: () => setShowAddProducts(!showAddProducts),
            },
          ]}
        >
          <p className="text-grey-50 inter-base-regular mt-xsmall mb-base">
            To start selling, all you need is a name, price, and image.
          </p>
          {collection && (
            <ViewProductsTable
              key={updates} // force re-render when collection is updated
              collectionId={collection.id}
              refetchCollection={refetch}
            />
          )}
        </Section>
      </div>
      {showDelete && (
        <DeletePrompt
          handleClose={() => setShowDelete(!showDelete)}
          heading="Delete collection"
          successText="Successfully deleted collection"
          onDelete={async () => handleDelete()}
          confirmText="Yes, delete"
        />
      )}
      {showAddProducts && (
        <AddProductsTable
          onClose={() => setShowAddProducts(false)}
          onSubmit={handleAddProducts}
          existingRelations={collection?.products ?? []}
        />
      )}
    </>
  )
}

export default CollectionDetails
