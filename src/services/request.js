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
  return fetch(VITE_MEDUSA_BACKEND_URL + path, {
    headers: {
      "x-medusa-access-token": "12345678900",
      "Authorization": "Bearer 12345678900"
    },
  })
}
