import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Needed for Docker
    port: 3000,
    watch: {
      usePolling: true, // Use this if you are on Windows/macOS and reload isn't working
    },
  },
});
