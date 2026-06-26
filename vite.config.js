import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/jincosmetics/' : '/',
  server: {
    host: true,
    port: 5173,
    open: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        products: resolve(__dirname, 'products.html'),
        gate: resolve(__dirname, 'gate.html'),
      },
    },
  },
})
