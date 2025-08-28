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
  console.log("  fullUrl:", fullUrl)
  
  return fetch(fullUrl, {
    method: 'GET',
    headers: {
      "Authorization": "Bearer 12345678900"
    }
  }).then(async (response) => {
    console.log("🐛 DEBUG - Response status:", response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log("🐛 DEBUG - Response error:", errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    const data = await response.json()
    console.log("🐛 DEBUG - Response data:", data)
    return data
  })
}
