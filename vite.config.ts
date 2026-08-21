import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/, not the domain root, so asset URLs and
  // the `geo/` fetches (which build on BASE_URL) have to be prefixed. The deploy
  // workflow passes the repo name in; everything else — dev, preview, deploying to a
  // root domain — wants the default.
  base: process.env['BASE_PATH'] ?? '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Geo files live in public/ and are copied verbatim, never inlined,
    // so they stay swappable without a rebuild of the JS bundle.
    assetsInlineLimit: 0,
  },
})
