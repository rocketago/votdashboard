import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Geo files live in public/ and are copied verbatim, never inlined,
    // so they stay swappable without a rebuild of the JS bundle.
    assetsInlineLimit: 0,
  },
})
