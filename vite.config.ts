import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'

import manifest from './src/manifest'

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: 'build',
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/chunk-[hash].js',
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_debugger: true,
        passes: 2,
      },
      format: {
        comments: false,
      },
    },
    cssMinify: true,
    modulePreload: false,
  },
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
  },
  plugins: [crx({ manifest })],
  legacy: {
    skipWebSocketTokenCheck: true,
  },
})
