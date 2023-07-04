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
    const url = "/api/admin/export_orders"
    let data = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    }).then(res => res.json())
    console.log({ data })
    function jsonToCsc(json) {
      var fields = Object.keys(json[0])
      var replacer = function (key, value) { return value === null ? '' : value }
      var csv = json.map(function (row) {
        return fields.map(function (fieldName) {
          return JSON.stringify(row[fieldName], replacer)
        }).join(',')
      })
      csv.unshift(fields.join(',')) // add header column
      csv = csv.join('\r\n');
      console.log(csv)
      return csv
    }
    let csv = jsonToCsc(data)
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'orders.csv';
    hiddenElement.click();

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
