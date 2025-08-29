import { Route, Routes } from "react-router-dom"
import Edit from "./edit"
import Overview from "./overview"
import MetadataTest from "./metadata-test"

const ProductsRoute = () => {
  return (
    <Routes>
      <Route index element={<Overview />} />
      <Route path="/metadata-test" element={<MetadataTest />} />
      <Route path="/:id" element={<Edit />} />
    </Routes>
  )
}

export default ProductsRoute
