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
    method: 'GET',
    headers: {
      "Authorization": "Bearer 12345678900",
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    credentials: 'include'
  }).then(async (response) => {
    console.log("🐛 DEBUG - Response status:", response.status)
    console.log("🐛 DEBUG - Response headers:", Object.fromEntries(response.headers.entries()))
    
    const responseText = await response.text()
    console.log("🐛 DEBUG - Response body (first 500 chars):", responseText.slice(0, 500))
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`)
    }
    
    try {
      return JSON.parse(responseText)
    } catch (e) {
      console.error("🐛 DEBUG - Failed to parse JSON:", e)
      throw new Error(`Invalid JSON response: ${responseText.slice(0, 100)}`)
    }
  })
}

// Create a direct backend request for abandoned carts that matches your working curl
export function directBackendRequest(path) {
  const fullUrl = VITE_MEDUSA_BACKEND_URL + path
  console.log("🐛 DEBUG - directBackendRequest:")
  console.log("  fullUrl:", fullUrl)
  
  return fetch(fullUrl, {
    method: 'GET',
    headers: {
      "Authorization": "Bearer 12345678900"
    }
  }).then(async (response) => {
    console.log("🐛 DEBUG - Direct response status:", response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log("🐛 DEBUG - Direct response error:", errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    const data = await response.json()
    console.log("🐛 DEBUG - Direct response data:", data)
    return data
  })
}
