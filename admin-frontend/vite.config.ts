import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/admin/",
  server: {
    port: 5173,
    hmr: {
      // Force the HMR client to connect to the root dev server origin
      // so websocket upgrades go through the `/admin` proxy on port 3000.
      clientPort: 3000,
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "../public/admin",
  },
});
