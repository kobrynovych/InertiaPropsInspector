import { readFileSync, writeFileSync, rmSync, readdirSync, statSync } from 'fs'
import { join, resolve } from 'path'
import { minify } from 'terser'

const buildDir = resolve('build')

// 1. Remove .vite directory
rmSync(join(buildDir, '.vite'), { recursive: true, force: true })

// 2. Minify all HTML files
function minifyHtml(html) {
  return html
    .replace(/<!--.*?-->/gs, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s+>/g, '>')
    .replace(/\s+\/>/g, '/>')
    .trim()
}

async function processDir(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      await processDir(fullPath)
      continue
    }

    if (entry.endsWith('.html')) {
      const original = readFileSync(fullPath, 'utf-8')
      const minified = minifyHtml(original)
      writeFileSync(fullPath, minified)
      console.log(`  html: ${entry} ${original.length} → ${minified.length} bytes`)
    }

    if (entry.endsWith('.js')) {
      const original = readFileSync(fullPath, 'utf-8')
      const result = await minify(original, {
        compress: { passes: 2 },
        format: { comments: false },
      })
      if (result.code && result.code.length < original.length) {
        writeFileSync(fullPath, result.code)
        console.log(`  js:   ${entry} ${original.length} → ${result.code.length} bytes`)
      }
    }
  }
}

console.log('Post-build optimizations:')
await processDir(buildDir)
console.log('Done.')
