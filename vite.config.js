import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@clerk")) return "clerk";
            if (id.includes("firebase")) return "firebase";
            if (id.includes("jspdf") || id.includes("html2canvas")) return "pdf";
            if (id.includes("papaparse") || id.includes("react-csv")) return "csv";
            if (id.includes("react-datepicker") || id.includes("moment")) return "date";
            if (id.includes("lucide-react") || id.includes("react-icons")) return "icons";
            if (id.includes("react") || id.includes("react-router")) return "react";
            return "vendor";
          }
        },
      },
    },
  },
});