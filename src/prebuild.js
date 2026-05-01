import { resolve } from 'path'
import * as esbuild from 'esbuild'

const outfile = resolve('public/mainWorld.js')

console.log('Pre-build: bundling MAIN-world script')
await esbuild.build({
  entryPoints: [resolve('src/mainWorld/index.ts')],
  bundle: true,
  format: 'iife',
  target: 'chrome111',
  outfile,
  minify: true,
  legalComments: 'none',
  logLevel: 'warning',
})
console.log(`  -> ${outfile}`)
