import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel: tidak perlu base path
export default defineConfig({
  plugins: [react()],
})
