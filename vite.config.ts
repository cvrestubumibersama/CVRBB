import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig(({ command }) => {
  const isDev = command === 'serve' || process.env.NODE_ENV === 'development' || process.env.VITE_DEV === 'true';

  return {
    // Serve the `public` dir in dev so static assets (RBB.jpeg, /uploads/*)
    // are available at the app origin during local development.
    publicDir: "public",
    resolve: { tsconfigPaths: true },
    plugins: (() => {
      const base = [
        tanstackStart({
          // Use default server entry provided by TanStack Start instead of
          // custom `server` entry which can cause 404s on Vercel/Nitro runtimes.
        }),
        tailwindcss(),
        react(),
      ];
      // Only enable Nitro plugin in non-dev modes so `/api` routes can be
      // proxied to the backend during local development (avoids route collision).
      if (!isDev) {
        base.splice(
          1,
          0,
          nitro({
            routeRules: {
              "/api/**": { proxy: "http://127.0.0.1:4000/api/**" },
              "/uploads/**": { proxy: "http://127.0.0.1:4000/uploads/**" },
            },
          }),
        );
      }
      return base;
    })(),
  server: {
    port: 3000,
    proxy: {
      // Proxy admin path to the admin-frontend dev server so
      // visiting /admin on the main dev server shows the latest admin app.
      "/admin": {
        target: "http://localhost:5173",
        changeOrigin: true,
        secure: false,
        ws: true,
        // keep the /admin prefix so admin dev (which uses base "/admin/")
        // serves assets and routes correctly
        rewrite: (path) => (path === '/admin' ? '/admin/' : path),
      },
      // Proxy API calls to the backend (default port 4000)
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },

      // Proxy only public API routes to backend to avoid colliding with
      // local server routes under `/api` (e.g. TanStack Start / Nitro).
      "/api/public": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
    },
  };
});