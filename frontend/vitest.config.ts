import { defineConfig, mergeConfig } from 'vite'
import { defineConfig as defineVitestConfig } from 'vitest/config'
import viteConfig from './vite.config'

// Fichier séparé de vite.config.ts (laissé intact) : ajoute uniquement la configuration
// de test par-dessus la config Vite existante (plugins React + Tailwind).
export default mergeConfig(
  viteConfig,
  defineVitestConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
    },
  }),
)
