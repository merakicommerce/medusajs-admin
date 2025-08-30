// Use proxy in development, direct backend URL in production
const medusaUrl = import.meta.env.DEV 
  ? "/api" 
  : import.meta.env.VITE_MEDUSA_BACKEND_URL

const feedUrl = import.meta.env.VITE_FEED_URL
const frontAdminUrl = import.meta.env.VITE_FRONT_ADMIN_URL
const VITE_MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL

export { VITE_MEDUSA_BACKEND_URL, feedUrl, frontAdminUrl, medusaUrl }
