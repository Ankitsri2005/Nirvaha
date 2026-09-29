/**
 * Import audit: bundles every page/component/lib module and reports any export
 * that is undefined. Catches "imported a name that does not exist", which
 * compiles cleanly and only explodes at render time.
 *
 *   npm run test:imports
 */
import { readdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, basename, dirname, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'esbuild'

const here = dirname(fileURLToPath(import.meta.url))
const src = join(here, '..', 'src')
const dirs = ['pages', 'components', 'lib', 'context', 'services']
const out = join(here, '.imports.bundle.mjs')

const files = dirs.flatMap((d) =>
  readdirSync(join(src, d))
    .filter((f) => /\.(jsx?|mjs)$/.test(f))
    .map((f) => `${d}/${f}`),
)

/* a generated entry so esbuild transpiles the jsx and resolves every path */
const imports = files.map((f, i) => `import * as m${i} from './${f}'`).join('\n')
const mapping = files.map((f, i) => `'${f}': m${i}`).join(', ')
const entry = `${imports}\nglobalThis.__audit = { ${mapping} }\n`

/* node cannot import a .css file, so route them to an empty module */
const stubCss = {
  name: 'stub-css',
  setup(build) {
    build.onResolve({ filter: /\.css$/ }, (args) => ({ path: args.path, namespace: 'stub-css' }))
    build.onLoad({ filter: /.*/, namespace: 'stub-css' }, () => ({ contents: 'export default {}', loader: 'js' }))
  },
}

await build({
  stdin: { contents: entry, resolveDir: src, loader: 'jsx' },
  bundle: true,
  format: 'esm',
  platform: 'node',
  packages: 'external',
  plugins: [stubCss],
  jsx: 'automatic',
  outfile: out,
  logLevel: 'error',
})
await import(pathToFileURL(out).href)

const problems = []
let checked = 0

for (const [rel, mod] of Object.entries(globalThis.__audit)) {
  const name = basename(rel)
  if (!mod) {
    problems.push(`${name}: module did not load`)
    continue
  }
  if (/^(pages|components)\//.test(rel) && typeof mod.default !== 'function') {
    problems.push(`${name}: default export is ${typeof mod.default}, expected a component`)
  }
  for (const [k, v] of Object.entries(mod)) {
    checked += 1
    if (v === undefined) problems.push(`${name}: named export "${k}" is undefined`)
  }
}

rmSync(out, { force: true })

console.log(`audited ${files.length} modules, ${checked} exports`)
if (problems.length) {
  problems.forEach((p) => console.log(`  FAIL  ${p}`))
  console.log(`\n${problems.length} problem(s)`)
  process.exit(1)
}
console.log('all exports resolve')
