import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { createServer, defineConfig } from 'vite'
import { allPages, fullTitle, SITE_URL } from './src/pages'

const escapeHtml = s =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// След build записва dist/<път>.html за всяка страница – с правилните заглавие и описание
// и с готовия HTML на урока (src/entry-server.tsx), за да ги виждат търсачките без JavaScript –
// и sitemap.xml.
function seoPages() {
  let outDir
  return {
    name: 'seo-pages',
    apply: 'build',
    configResolved(config) {
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
          .replace('<div id="root"></div>', () => `<div id="root">${body}</div>`)
        const file = path.join(outDir, page.path === '/' ? 'index.html' : `${page.path}.html`)
        fs.mkdirSync(path.dirname(file), { recursive: true })
        fs.writeFileSync(file, html)
      }
      await server.close()

      const urls = allPages.map(p => `  <url><loc>${SITE_URL}${p.path}</loc></url>`).join('\n')
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
