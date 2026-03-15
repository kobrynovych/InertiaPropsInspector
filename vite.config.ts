import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'

import manifest from './src/manifest'

export default defineConfig(({ mode }) => {
  return {
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
    },
    esbuild: {
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
      jsxInject: `import { h, Fragment } from 'preact'`,
    },
    resolve: {
      alias: {
        'react': 'preact/compat',
        'react-dom': 'preact/compat',
      },
    },
    plugins: [crx({ manifest })],
    legacy: {
      skipWebSocketTokenCheck: true,
    },
  }
})
