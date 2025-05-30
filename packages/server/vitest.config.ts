import { defineConfig } from "vitest/config"
import { resolve } from "path"

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.{test,spec}.{ts,js}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    globals: true,
  },
  resolve: {
    alias: {
      "@codenames50/core": resolve(__dirname, "../core/src"),
      "@codenames50/messaging": resolve(__dirname, "../messaging/src"),
      "@psousa50/shared": resolve(__dirname, "../shared/src"),
    },
  },
})
