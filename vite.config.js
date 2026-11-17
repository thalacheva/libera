import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { createServer, defineConfig } from 'vite'
import { allPages, fullTitle, homePage, notFoundPage, sectionPages, SITE_URL } from './src/pages'
import { structuredDataJson } from './src/structuredData'

const escapeHtml = s =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Кой файл рендерира всяка страница – от lazy() импортите и <Route> дървото в src/App.tsx.
function routeFiles(root) {
  const app = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8')
  const modules = {}
  for (const [, name, mod] of app.matchAll(/^const (\w+) = lazy\(\(\) => import\('\.\/([^']+)'\)/gm)) modules[name] = mod
  const resolve = mod =>
    ['.tsx', '.ts', '.jsx', '/index.tsx'].map(ext => `src/${mod}${ext}`).find(f => fs.existsSync(path.join(root, f)))
  const files = {}
  const stack = []
  for (const line of app.split('\n')) {
    const open = line.match(/^\s*<Route path="([^"]+)">\s*$/)
    const leaf = line.match(/^\s*<Route (?:path="([^"]+)"|index) element=\{<(\w+)[^}]*\}\s*\/>/)
    if (open) stack.push(open[1])
    else if (/^\s*<\/Route>/.test(line)) stack.pop()
    else if (leaf && modules[leaf[2]]) {
      const route = '/' + [...stack, ...(leaf[1] ? [leaf[1]] : [])].join('/')
      files[route] = resolve(modules[leaf[2]])
    }
  }
  return files
}

// Дата на последната промяна (YYYY-MM-DD) за <lastmod> в sitemap.xml – от git:
// последният commit на файловете на страницата, или днес, ако има непубликувани промени.
function lastModified(root) {
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' })
  try {
    git('rev-parse', '--git-dir')
  } catch {
    return () => undefined // няма git (напр. build без история) – sitemap без дати
  }
  const today = new Date().toISOString().slice(0, 10)
  const dirty = git('status', '--porcelain', '--', 'src').split('\n').filter(Boolean).map(l => l.slice(3))
  const dateOf = file =>
    dirty.some(d => d === file || d.startsWith(file + '/') || file.startsWith(d.endsWith('/') ? d : d + '/'))
      ? today
      : git('log', '-1', '--format=%cs', '--', file).trim() || undefined
  const files = routeFiles(root)
  const shared = ['src/pages.ts', 'src/topics.ts']
  const sources = page => {
    if (page === homePage) return ['src/Home.tsx', ...shared]
    if (sectionPages.includes(page)) return ['src/SectionHome.tsx', ...shared]
    const file = files[page.path]
    if (!file) return []
    // Справочниците и „Тази вечер“ четат данни от съседните файлове в папката
    return /^src\/(reference|tonight)\//.test(file) ? [path.dirname(file)] : [file]
  }
  return page => {
    const dates = sources(page).map(dateOf).filter(Boolean).sort()
    if (!dates.length) console.warn(`sitemap: няма дата за ${page.path}`)
    return dates.at(-1)
  }
}

// След build записва dist/<път>.html за всяка страница – с правилните заглавие и описание
// и структурираните данни (src/structuredData.ts), с готовия HTML на урока (src/entry-server.tsx), за да ги виждат търсачките без JavaScript –
// и sitemap.xml.
function seoPages() {
  let outDir, root
  return {
    name: 'seo-pages',
    apply: 'build',
    configResolved(config) {
      root = config.root
      outDir = path.resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      const template = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8')
      const server = await createServer({
        server: { middlewareMode: true, hmr: false },
        appType: 'custom',
        logLevel: 'error',
      })
      const { render } = await server.ssrLoadModule('/src/entry-server.tsx')

      for (const page of allPages) {
        const title = escapeHtml(fullTitle(page))
        const description = escapeHtml(page.description)
        const url = SITE_URL + page.path
        const body = await render(page.path)
        const html = template
          .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
          .replace(/(<meta name="description" content=")[^"]*/, `$1${description}`)
          .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
          .replace(/(<meta property="og:title" content=")[^"]*/, `$1${title}`)
          .replace(/(<meta property="og:description" content=")[^"]*/, `$1${description}`)
          .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
          .replace('</head>', () => `  <script type="application/ld+json" id="structured-data">${structuredDataJson(page)}</script>\n  </head>`)
          .replace('<div id="root"></div>', () => `<div id="root">${body}</div>`)
        const file = path.join(outDir, page.path === '/' ? 'index.html' : `${page.path}.html`)
        fs.mkdirSync(path.dirname(file), { recursive: true })
        fs.writeFileSync(file, html)
      }

      // 404.html – Vercel го връща с код 404 за всеки несъществуващ адрес
      const notFound = template
        .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(fullTitle(notFoundPage))}</title>`)
        .replace(/(<meta name="description" content=")[^"]*/, `$1${escapeHtml(notFoundPage.description)}`)
        .replace(/\s*<link rel="canonical"[^>]*>/, '')
        .replace(/\s*<meta property="og:url"[^>]*>/, '')
        .replace('</head>', '  <meta name="robots" content="noindex" />\n  </head>')
        .replace('<div id="root"></div>', `<div id="root">${await render('/404')}</div>`)
      fs.writeFileSync(path.join(outDir, '404.html'), notFound)
      await server.close()

      const lastmod = lastModified(root)
      const urls = allPages
        .map(p => {
          const date = lastmod(p)
          return `  <url><loc>${SITE_URL}${p.path}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}</url>`
        })
        .join('\n')
      fs.writeFileSync(
        path.join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seoPages()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 7000
  }
})
