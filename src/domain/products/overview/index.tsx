import { useAdminCreateCollection } from "medusa-react"
import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import medusaRequest from "../../../services/request"
import Fade from "../../../components/atoms/fade-wrapper"
import Button from "../../../components/fundamentals/button"
import ExportIcon from "../../../components/fundamentals/icons/export-icon"
import PlusIcon from "../../../components/fundamentals/icons/plus-icon"
import UploadIcon from "../../../components/fundamentals/icons/upload-icon"
import BodyCard from "../../../components/organisms/body-card"
import TableViewHeader from "../../../components/organisms/custom-table-header"
import ExportModal from "../../../components/organisms/export-modal"
import AddCollectionModal from "../../../components/templates/collection-modal"
import CollectionsTable from "../../../components/templates/collections-table"
import ProductTable from "../../../components/templates/product-table"
import useNotification from "../../../hooks/use-notification"
import useToggleState from "../../../hooks/use-toggle-state"
import { getErrorMessage } from "../../../utils/error-messages"
import ImportProducts from "../batch-job/import"
import NewProduct from "../new"

const VIEWS = ["products", "collections"]

const Overview = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [view, setView] = useState("products")
  const {
    state: createProductState,
    close: closeProductCreate,
    open: openProductCreate,
  } = useToggleState()


  const notification = useNotification()

  const createCollection = useAdminCreateCollection()

  useEffect(() => {
    if (location.search.includes("?view=collections")) {
      setView("collections")
    }
  }, [location])

  useEffect(() => {
    location.search = ""
  }, [view])

  const CurrentView = () => {
    switch (view) {
      case "products":
        return <ProductTable />
      default:
        return <CollectionsTable />
    }
  }

  const CurrentAction = () => {
    switch (view) {
      case "products":
        return (
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="small"
              onClick={() => openImportModal()}
            >
              <UploadIcon size={20} />
              Import Products
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={() => openExportModal()}
            >
              <ExportIcon size={20} />
              Export Products
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={openProductCreate}
            >
              <PlusIcon size={20} />
              New Product
            </Button>
          </div>
        )
      default:
        return (
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="small"
              onClick={() => setShowNewCollection(!showNewCollection)}
            >
              <PlusIcon size={20} />
              New Collection
            </Button>
          </div>
        )
    }
  }

  const [showNewCollection, setShowNewCollection] = useState(false)
  const {
    open: openExportModal,
    close: closeExportModal,
    state: exportModalOpen,
  } = useToggleState(false)

  const [isExporting, setIsExporting] = useState(false)

  const {
    open: openImportModal,
    close: closeImportModal,
    state: importModalOpen,
  } = useToggleState(false)

  const handleCreateCollection = async (data, colMetadata) => {
    const metadata = colMetadata
      .filter((m) => m.key && m.value) // remove empty metadata
      .reduce((acc, next) => {
        return {
          ...acc,
          [next.key]: next.value,
        }
      }, {})

    await createCollection.mutateAsync(
      { ...data, metadata },
      {
        onSuccess: ({ collection }) => {
          notification("Success", "Successfully created collection", "success")
          navigate(`/a/collections/${collection.id}`)
          setShowNewCollection(false)
        },
        onError: (err) => notification("Error", getErrorMessage(err), "error"),
      }
    )
  }

  const handleCreateExport = async () => {
    try {
      setIsExporting(true)
      notification("Info", "Export started - this may take up to 1 minute. The file will download automatically when ready.", "info")
      
      // Use medusaRequest for proper authentication
      const response = await medusaRequest(
        "GET", 
        "/admin/products?fields=id,title,handle,status,description,collection_id&expand=variants,options,variants.prices,variants.options,collection,tags,type,images,sales_channels&is_giftcard=false&limit=1000"
      )
      
      const data = response.data
      
      // Convert JSON to CSV
      function jsonToCsv(json) {
        if (!json || json.length === 0) {
          return '';
        }
        
        // Extract fields from the first item to use as headers
        const fields = Object.keys(json[0]);
        const replacer = (key, value) => value === null ? '' : value;
        
        // Create CSV rows
        const csv = json.map(row => {
          return fields.map(fieldName => {
            return JSON.stringify(row[fieldName], replacer);
          }).join(',');
        });
        
        // Add header row
        csv.unshift(fields.join(','));
        return csv.join('\r\n');
      }
      
      // Process the products data for CSV export
      const csvData = data.products.map(product => {
        return {
          "ID": product.id,
          "Title": product.title,
          "Handle": product.handle,
          "Status": product.status,
          "Description": product.description || '',
          "Collection": product.collection?.title || '',
          "Type": product.type?.value || '',
          "Tags": product.tags?.map(tag => tag.value).join('; ') || '',
          "Thumbnail": product.thumbnail || '',
          "Variant Count": product.variants?.length || 0,
          "Option Count": product.options?.length || 0,
          "Created At": product.created_at ? new Date(product.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
          }) : '',
          "Updated At": product.updated_at ? new Date(product.updated_at).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
          }) : ''
        };
      });
      
      const csv = jsonToCsv(csvData);
      
      // Create and download the CSV file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.setAttribute('download', 'products.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Cleanup
      window.URL.revokeObjectURL(downloadUrl);
      
      notification("Success", "Products exported successfully! The file has been downloaded.", "success")
    } catch (error) {
      console.error("Export failed:", error)
      notification("Error", "Export failed. Please try again.", "error")
    } finally {
      setIsExporting(false)
      closeExportModal()
    }
  }


  return (
    <>
      <div className="flex flex-col grow h-full">
        <div className="w-full flex flex-col grow">
          <BodyCard
            forceDropdown={false}
            customActionable={CurrentAction()}
            customHeader={
              <TableViewHeader
                views={VIEWS}
                setActiveView={setView}
                activeView={view}
              />
            }
            className="h-fit"
          >
            <CurrentView />
          </BodyCard>
        </div>
      </div>
      {showNewCollection && (
        <AddCollectionModal
          onClose={() => setShowNewCollection(!showNewCollection)}
          onSubmit={handleCreateCollection}
        />
      )}
      {exportModalOpen && (
        <ExportModal
          title="Export Products"
          handleClose={() => !isExporting && closeExportModal()}
          onSubmit={handleCreateExport}
          loading={isExporting}
        />
      )}
      {importModalOpen && (
        <ImportProducts handleClose={() => closeImportModal()} />
      )}
      <Fade isVisible={createProductState} isFullScreen={true}>
        <NewProduct onClose={closeProductCreate} />
      </Fade>
    </>
  )
}

export default Overview
