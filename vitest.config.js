import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // simula o navegador no terminal
    setupFiles: ['./src/tests/setup.js'], // arquivo que vamos criar
    globals: true
  },
})