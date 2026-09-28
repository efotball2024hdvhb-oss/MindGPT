// Standalone build for the Android APK (no server). Run: pnpm build:mobile
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/postcss";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: root + "mobile",
  publicDir: root + "public",
  plugins: [react()],
  resolve: { alias: { "@": root.replace(/\/$/, "") } },
  css: { postcss: { plugins: [tailwindcss({ base: root })] } },
  build: {
    outDir: root + "dist-mobile",
    emptyOutDir: true,
    target: "es2022",
  },
});
