import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // ✅ Garante que o Render (ou qualquer servidor estático) use caminhos relativos
  build: {
    outDir: 'dist',
  },
})
