import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { cloudflare } from "@cloudflare/vite-plugin"

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [
      vue(),
      cloudflare(),
    ],
    server: {
      host: '0.0.0.0',
      port: 4202
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      APP_VERSION: JSON.stringify(process.env.npm_package_version),
    },
    base: process.env.NODE_ENV === 'production' ? '/cs-course-tools' : '/'
  }
})
