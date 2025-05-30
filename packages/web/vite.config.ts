import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        // Add aliases for workspace packages
        "@codenames50/core": resolve(__dirname, "../core/src"),
        "@codenames50/messaging": resolve(__dirname, "../messaging/src"),
        "@codenames50/shared": resolve(__dirname, "../shared/src"),
        "@psousa50/shared": resolve(__dirname, "../shared/src"),
      },
    },
    server: {
      port: env.VITE_PORT ? parseInt(env.VITE_PORT) : 4000,
      // Enable HMR for better development experience
      hmr: true,
    },
    define: {
      // Replace process.env with import.meta.env
      "process.env.REACT_APP_SERVER_URL": JSON.stringify(env.VITE_SERVER_URL || ""),
    },
    optimizeDeps: {
      include: ["@codenames50/core", "@codenames50/messaging", "@codenames50/shared", "@psousa50/shared"],
    },
    build: {
      // Increase the warning limit for chunk size
      chunkSizeWarningLimit: 800,
      // Minify the output for smaller bundle sizes
      minify: "terser",
      // Configure Rollup options for better chunking
      rollupOptions: {
        output: {
          // Split chunks by module for better caching
          manualChunks: id => {
            // Create separate chunks for major dependencies
            if (id.includes("node_modules")) {
              if (id.includes("@material-ui")) {
                return "vendor-material-ui"
              }
              if (id.includes("react") || id.includes("react-dom")) {
                return "vendor-react"
              }
              if (id.includes("socket.io")) {
                return "vendor-socketio"
              }
              return "vendor" // all other dependencies
            }
            return null // return null for non-node_modules files
          },
        },
      },
      // Generate source maps for debugging
      sourcemap: mode === "development",
    },
  }
})
