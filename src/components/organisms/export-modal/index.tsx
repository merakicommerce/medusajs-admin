import React from "react"
import Button from "../../fundamentals/button"
import Modal from "../../molecules/modal"

type ExportModalProps = {
  handleClose: () => void
  onSubmit?: () => void
  loading: boolean
  title: string
}

const ExportModal: React.FC<ExportModalProps> = ({
  handleClose,
  title,
  loading,
  onSubmit,
}) => {
  return (
    <Modal handleClose={handleClose}>
      <Modal.Body>
        <Modal.Header handleClose={handleClose}>
          <span className="inter-xlarge-semibold">{title}</span>
        </Modal.Header>
        <Modal.Content>
          {loading ? (
            <div className="flex flex-col">
              <div className="flex mb-4 inter-small-regular text-grey-90">
                <strong>Export in progress...</strong>
              </div>
              <div className="flex mb-4 inter-small-regular text-grey-50">
                Your export is being processed. This may take up to 1 minute depending on the number of products. The file will download automatically when ready.
              </div>
              <div className="flex mb-4 inter-small-regular text-grey-50">
                You can continue working in other tabs while the export completes.
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex mb-4 inter-small-regular text-grey-50">
                Export all your products to a CSV file. This process may take up to 1 minute.
              </div>
              <div className="flex mb-4 inter-small-regular text-grey-50">
                The file will include product details, variants, pricing, and inventory information.
              </div>
            </div>
          )}
        </Modal.Content>
        <Modal.Footer>
          <div className="w-full flex justify-end">
            <Button
              variant="ghost"
              size="small"
              onClick={handleClose}
              className="mr-2"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              loading={loading}
              disabled={loading}
              variant="primary"
              size="small"
              onClick={onSubmit}
            >
              {loading ? "Exporting..." : "Export"}
            </Button>
          </div>
        </Modal.Footer>
      </Modal.Body>
    </Modal>
  )
}

export default ExportModal
