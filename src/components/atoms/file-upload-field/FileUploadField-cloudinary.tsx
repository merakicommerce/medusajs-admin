import React, { useEffect } from "react"

type FileUploadFieldProps = {}

const FileUploadFieldCloudinary: React.FC<FileUploadFieldProps> = ({}) => {
  useEffect(() => {
    myWidget =
      window.myWidget ||
      window.cloudinary.createUploadWidget(
        {
          cloudName: cloudName,
          uploadPreset: uploadPreset,
        },
        (error, result) => {
          if (!error && result && result.event === "success") {
            console.log("Done! Here is the image info: ", result.info)
            myWidget.close()
          }
        }
      )
    window.myWidget = myWidget
  }, [])
  return (
    <div
      onClick={() => {
        window.myWidget && window.myWidget.open()
      }}
      id="upload_widget"
      className="flex flex-col items-center justify-center w-full h-full transition-colors border-2 border-dashed cursor-pointer select-none inter-base-regular text-grey-50 rounded-rounded border-grey-20 hover:border-violet-60 hover:text-grey-40 py-large"
    >
      <div className="flex flex-col items-center">
        <p>
          <span>
            Drop your images here, or{" "}
            <span className="text-violet-60">click to browse</span>
          </span>
        </p>
        1200 x 1600 (3:4) recommended, up to 10MB each
      </div>
    </div>
  )
}

export default FileUploadFieldCloudinary
