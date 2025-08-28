const medusaUrl = "/api"
const feedUrl = import.meta.env.VITE_FEED_URL
const frontAdminUrl = import.meta.env.VITE_FRONT_ADMIN_URL
const MEDUSA_BACKEND_URL = import.meta.env.MEDUSA_BACKEND_URL || import.meta.env.VITE_MEDUSA_BACKEND_URL

export { MEDUSA_BACKEND_URL, feedUrl, frontAdminUrl, medusaUrl }
