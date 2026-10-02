import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/")
          ) {
            return "vendor-react"
          }
          if (
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/react-router-dom/")
          ) {
            return "vendor-router"
          }
          if (id.includes("node_modules/recharts/")) {
            return "vendor-recharts"
          }
        },
      },
    },
  },
})
