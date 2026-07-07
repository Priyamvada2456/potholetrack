import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Forward API calls to Flask during local dev so the frontend can
      // just call "/api/..." without worrying about CORS or full URLs.
      "/api": "http://localhost:5000",
      "/uploads": "http://localhost:5000",
    },
  },
});
