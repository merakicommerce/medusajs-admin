import axios from "axios"
import { medusaUrl } from "./config"

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
  return client({
    method: 'GET',
    url: path,
    withCredentials: true,
  }).then((response) => response.data)
}
