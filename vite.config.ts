import react from "@vitejs/plugin-react"
import dns from "dns"
import path from "path"
import { defineConfig, loadEnv } from "vite"

// Resolve localhost for Node v16 and older.
// @see https://vitejs.dev/config/server-options.html#server-host.
dns.setDefaultResultOrder("verbatim")

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const MEDUSA_BACKEND_URL = JSON.stringify(
    env.VITE_MEDUSA_BACKEND_URL ||
    // Backwards-compat with Gatsby.
    env.GATSBY_MEDUSA_BACKEND_URL ||
    env.GATSBY_STORE_URL ||
    "http://localhost:9000"
  )
  console.log("MEDUSA_BACKEND_URL", MEDUSA_BACKEND_URL)
  return {
    plugins: [react()],
    // Backwards-compat with Gatsby.
    publicDir: "static",
    build: {
      outDir: "public",
    },

    resolve: {
      alias: {
        gatsby: path.resolve(__dirname, "src/compat/gatsby-compat.tsx"),
        "@reach/router": path.resolve(
          __dirname,
          "src/compat/reach-router-compat.tsx"
        ),
      },
    },
    define: {
      __MEDUSA_BACKEND_URL__: MEDUSA_BACKEND_URL
    },
    optimizeDeps: {
      exclude: ["typeorm", "medusa-interfaces"],
    },
    server: {
      host: true,
      proxy: {
        "/api": {
          target: env.VITE_MEDUSA_BACKEND_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  }
})

