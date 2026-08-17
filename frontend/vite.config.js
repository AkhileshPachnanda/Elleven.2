import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    target: 'esnext'
  },
  worker: {
    format: 'es'
  },
  // --- Vitest configuration ---
  test: {
    // 'globals: true' means you don't need to import describe/it/expect
    // in every test file — they are available automatically
    globals: true,
    // 'jsdom' simulates a browser environment (window, document, etc.)
    // needed because satellite.js references browser APIs
    environment: 'jsdom',
    // Only collect coverage from our own source code, not node_modules
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/hooks/**'],
    },
  },
})