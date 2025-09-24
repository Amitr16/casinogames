import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({ 
  plugins: [react()], 
  server: { port: 5173 },
  define: {
    'process.env.VITE_CASINO_API': JSON.stringify(process.env.VITE_CASINO_API || 'http://localhost:8888')
  }
})
