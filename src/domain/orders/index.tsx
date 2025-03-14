import { useAdminCreateBatchJob } from "medusa-react"
import { useContext, useMemo, useState } from "react"
import { Route, Routes, useNavigate } from "react-router-dom"

import Button from "../../components/fundamentals/button"
import BodyCard from "../../components/organisms/body-card"
import TableViewHeader from "../../components/organisms/custom-table-header"
import ExportModal from "../../components/organisms/export-modal"
import OrderTable from "../../components/templates/order-table"
import { PollingContext } from "../../context/polling"
import useNotification from "../../hooks/use-notification"
import useToggleState from "../../hooks/use-toggle-state"
import { getErrorMessage } from "../../utils/error-messages"
import { formatAmountWithSymbol } from "../../utils/prices"
import Details from "./details"
import { transformFiltersAsExportContext } from "./utils"
const VIEWS = ["orders", "drafts"]

const OrderIndex = () => {
  const view = "orders"

  const { resetInterval } = useContext(PollingContext)
  const navigate = useNavigate()
  const createBatchJob = useAdminCreateBatchJob()
  const notification = useNotification()

  const [contextFilters, setContextFilters] =
    useState<Record<string, { filter: string[] }>>()

  const {
    open: openExportModal,
    close: closeExportModal,
    state: exportModalOpen,
  } = useToggleState(false)
  const handleDownloadOrdersCsv = async () => {
    try {
      notification("Loading", "Preparing export...", "info")
      
      // Use the export_orders endpoint with no cache parameter since backend doesn't support it yet
      const url = "/api/admin/export_orders"
      
      // Request the file directly as a blob for immediate download
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
          // Request as blob but accept JSON as fallback for backward compatibility
          'Accept': 'text/csv, application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Export failed with status: ${response.status}`)
      }
      
      // Check content type to determine if it's CSV or JSON
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('text/csv')) {
        // Backend is already returning CSV directly, use it
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'orders.csv';
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      } else {
        // Backend is returning JSON, so we need to convert it to CSV in the browser
        const data = await response.json();
        
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
        
        // Process the data with the existing mapping logic
        let csv = jsonToCsv(data.map(item => {
          return {
            "ID": item.order.display_id,
            "First Name": item.order?.address_order_shipping_address_idToaddress?.first_name,
            "Last Name": item.order?.address_order_shipping_address_idToaddress?.last_name,
            "Street": item.order?.address_order_shipping_address_idToaddress?.address_1 + ' ' + item.order?.address_order_shipping_address_idToaddress?.address_2,
            "City": item.order?.address_order_shipping_address_idToaddress?.city,
            "Country": item.order?.address_order_shipping_address_idToaddress?.country_code?.toUpperCase(),
            "Product Name": item.title,
            "Manufacturer": "",
            "Email": item.order.email,
            "Telephone": item.order?.address_order_shipping_address_idToaddress?.phone,
            "Postcode": item.order?.address_order_shipping_address_idToaddress?.postal_code,
            "SKU": item?.product_variant?.sku,
            "Comment": item?.note?.value || '',
            "Row Total": formatAmountWithSymbol({
              amount: item.unit_price * item.quantity,
              currency: item.order.currency_code,
              tax: 0
            }),
            "Qty": item.quantity,
            "Created At": (new Date(item.order.created_at)).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
              hour12: true
            })
          };
        }));
        
        // Create and download the CSV file
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.setAttribute('download', 'orders.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      
      notification("Success", "Export completed successfully", "success")
    } catch (error) {
      console.error("Export failed:", error)
      notification("Error", "Export failed. Please try again or contact support.", "error")
    }
  }

  const actions = useMemo(() => {
    return [
      <Button size="small" variant="secondary" onClick={handleDownloadOrdersCsv}
      ><span className="mr-xsmall last:mr-0"><svg width={20} height={20} viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.5 13V15.6667C17.5 16.0203 17.3361 16.3594 17.0444 16.6095C16.7527 16.8595 16.357 17 15.9444 17H5.05556C4.643 17 4.24733 16.8595 3.95561 16.6095C3.66389 16.3594 3.5 16.0203 3.5 15.6667V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M14.6673 6.92057L10.5007 2.75391L6.33398 6.92057" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M10.5 2.75391V12.7539" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span><span className="mr-xsmall last:mr-0">Export Orders</span></Button>
      ,
    ]
  }, [view])

  const handleCreateExport = () => {
    const reqObj = {
      dry_run: false,
      type: "order-export",
      context: contextFilters
        ? transformFiltersAsExportContext(contextFilters)
        : {},
    }

    createBatchJob.mutate(reqObj, {
      onSuccess: () => {
        resetInterval()
        notification("Success", "Successfully initiated export", "success")
      },
      onError: (err) => {
        notification("Error", getErrorMessage(err), "error")
      },
    })

    closeExportModal()
  }

  return (
    <>
      <div className="flex flex-col grow h-full">
        <div className="w-full flex flex-col grow">
          <BodyCard
            customHeader={
              <TableViewHeader
                views={VIEWS}
                setActiveView={(v) => {
                  if (v === "drafts") {
                    navigate(`/a/draft-orders`)
                  }
                }}
                activeView={view}
              />
            }
            className="h-fit"
            customActionable={actions}
          >
            <OrderTable setContextFilters={setContextFilters} />
          </BodyCard>
        </div>
      </div>
      {exportModalOpen && (
        <ExportModal
          title="Export Orders"
          handleClose={() => closeExportModal()}
          onSubmit={handleCreateExport}
          loading={createBatchJob.isLoading}
        />
      )}
    </>
  )
}

const Orders = () => {
  return (
    <Routes>
      <Route index element={<OrderIndex />} />
      <Route path="/:id" element={<Details />} />
    </Routes>
  )
}

export default Orders
