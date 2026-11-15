import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Node API during local dev (server runs on 5000)
      "/api": "http://localhost:5000",
    },
  },
});
