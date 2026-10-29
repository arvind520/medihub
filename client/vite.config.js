/**
 * FILE: client/vite.config.js
 * PURPOSE: Configures Vite and the PWA plugin.
 *          This generates the manifest.json and service workers
 *          required to make the app installable on phones.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    host: true, // Exposes to local network
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate", // Auto-updates app when new code is pushed
      devOptions: {
        enabled: true, // Allows testing PWA in local development
      },
      manifest: {
        name: "MediHelp",
        short_name: "MediHelp",
        description: "Hospital assistance at your fingertips",
        theme_color: "#2f725c",
        background_color: "#fbfcfa",
        display: "standalone", // This hides the browser UI!
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png", // We need to create these next
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
