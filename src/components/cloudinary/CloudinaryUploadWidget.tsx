/* eslint-disable prettier/prettier */
import { Component } from "react"
let myWidget
class CloudinaryUploadWidget extends Component {
  componentDidMount() {
    const cloudName = "dfgbpib38" // replace with your own cloud name
    const uploadPreset = "z48xz3qg" // replace with your own upload preset

    // Remove the comments from the code below to add
    // additional functionality.
    // Note that these are only a few examples, to see
    // the full list of possible parameters that you
    // can add see:
    //   https://cloudinary.com/documentation/upload_widget_reference

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
  }

  render() {
    return (
      <div
        onClick={() => {
          myWidget && myWidget.open()
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
}

export default CloudinaryUploadWidget
