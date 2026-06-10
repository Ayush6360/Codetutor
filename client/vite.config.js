import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward all /api requests to the Express backend
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
