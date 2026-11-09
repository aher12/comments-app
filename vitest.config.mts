import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Компоненты интерфейса и общий клиент-серверный код. Async Server Components, Route Handlers
      // и Auth.js Vitest не исполняет — их проверяют e2e-тесты (см. документацию Next.js).
      include: ['src/components/**', 'src/hooks/**', 'src/store/**', 'src/lib/schemas.ts', 'src/lib/permissions.ts'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/components/user-menu.tsx'],
    },
  },
})
