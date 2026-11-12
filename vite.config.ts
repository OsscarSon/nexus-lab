import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ mode }) => ({
  base: mode === "pages" ? "/nexus-lab/" : "/",
  define: {
    "import.meta.env.VITE_STATIC_DEPLOYMENT": JSON.stringify(
      mode === "pages" ? "true" : "false",
    ),
  },
  plugins: [react()],
  server: {
    proxy: {
      "/api": process.env.NEXUS_DEV_API_TARGET || "http://127.0.0.1:3001",
    },
  },
  preview: mode === "pages" ? { proxy: {} } : undefined,
  test: { include: ["tests/**/*.test.ts"] },
}));
