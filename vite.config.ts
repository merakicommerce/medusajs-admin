import react from "@vitejs/plugin-react"
import dns from "dns"
import path from "path"
import { defineConfig, loadEnv } from "vite"

// Resolve localhost for Node v16 and older.
// @see https://vitejs.dev/config/server-options.html#server-host.
dns.setDefaultResultOrder("verbatim")

const removeNodeModulesPlugin = {
  name: 'remove-node-modules',
  resolveId(id: string) {
    if (id === 'typeorm' || id === 'medusa-interfaces') {
      return { id: 'virtual-empty', external: true }
    }
  },
}

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
    plugins: [react(), removeNodeModulesPlugin],
    // Backwards-compat with Gatsby.
    publicDir: "static",
    build: {
      outDir: "public",
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        external: ["typeorm", "medusa-interfaces"],
        output: {
          manualChunks: {
            // Vendor chunks for better caching
            'radix': [
              '@radix-ui/react-accordion',
              '@radix-ui/react-avatar',
              '@radix-ui/react-collapsible',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-popover',
              '@radix-ui/react-portal',
              '@radix-ui/react-radio-group',
              '@radix-ui/react-select',
              '@radix-ui/react-switch',
              '@radix-ui/react-tooltip',
            ],
            'react-vendors': [
              'react',
              'react-dom',
              'react-router-dom',
            ],
            'query': [
              '@tanstack/react-query',
              'axios',
            ],
            'medusa': [
              '@medusajs/medusa',
              'medusa-react',
            ],
            'forms': [
              'react-hook-form',
              '@hookform/error-message',
              'react-select',
            ],
            'table': [
              'react-table',
            ],
            'utils': [
              'lodash',
              'moment',
              'clsx',
              'uuid',
            ],
          }
        }
      }
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
      exclude: ["typeorm", "medusa-interfaces", "@medusajs/medusa"],
    },
    server: {
      host: true,
      proxy: {
        "/api": {
          target: env.VITE_MEDUSA_BACKEND_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/backend": {
          target: env.VITE_MEDUSA_BACKEND_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/backend/, ""),
        },
      },

    },
  }
})

