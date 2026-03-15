import { createReadStream, createWriteStream, mkdirSync, readFileSync } from 'fs'
import { join, resolve } from 'path'
import { createRequire } from 'module'
import archiver from 'archiver'

const require = createRequire(import.meta.url)
const buildDir = resolve('build')
const manifest = JSON.parse(readFileSync(join(buildDir, 'manifest.json'), 'utf-8'))

const outDir = resolve('package')
mkdirSync(outDir, { recursive: true })

const fileName = `${manifest.name.replaceAll(' ', '-')}-${manifest.version}.zip`
const output = createWriteStream(join(outDir, fileName))
const archive = archiver('zip', { zlib: { level: 9 } })

output.on('close', () => {
  console.log(`✅ ${fileName} (${(archive.pointer() / 1024).toFixed(1)} KB)`)
})

archive.on('error', (err) => {
  throw err
})

archive.pipe(output)
archive.directory(buildDir, false)
archive.finalize()
