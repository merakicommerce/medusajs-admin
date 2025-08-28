import axios from "axios"
import { medusaUrl, VITE_MEDUSA_BACKEND_URL } from "./config"

const client = axios.create({ baseURL: medusaUrl })

export default function medusaRequest(method, path = "", payload = {}) {
  const options = {
    method,
    withCredentials: true,
    url: path,
    data: payload,
    json: true,
  }
  return client(options)
}

export function backendRequest(path) {
  const fullUrl = VITE_MEDUSA_BACKEND_URL + path
  console.log("🐛 DEBUG - backendRequest:")
  console.log("  VITE_MEDUSA_BACKEND_URL:", VITE_MEDUSA_BACKEND_URL)
  console.log("  path:", path)
  console.log("  fullUrl:", fullUrl)
  
  return fetch(fullUrl, {
    headers: {
      "x-medusa-access-token": "12345678900",
      "Authorization": "Bearer 12345678900"
    },
  })
}
