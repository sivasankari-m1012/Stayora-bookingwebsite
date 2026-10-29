import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 127.0.0.1 (not "localhost"): avoids the IPv6 ::1 lookup that causes 502 on some machines.
  // Backend: cd backend && npm start  (port 4000). Restart `npm run dev` after editing this file.
  server: { proxy: { '/api': { target: 'http://127.0.0.1:4000', changeOrigin: true } } },
})
