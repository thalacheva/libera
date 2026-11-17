import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { findPage, fullTitle, notFoundPage, SITE_URL } from '~/pages';
import { structuredDataJson } from '~/structuredData';

function setMeta(selector: string, attr: string, value: string) {
  document.head.querySelector(selector)?.setAttribute(attr, value);
}

// Обновява заглавието и мета таговете при навигация в приложението.
// Началните стойности за всяка страница се записват още при build (vite.config.js).
export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = findPage(pathname);
    const title = fullTitle(page);
    const url = SITE_URL + page.path;

    document.title = title;
    setMeta('meta[name="description"]', 'content', page.description);
    setMeta('link[rel="canonical"]', 'href', url);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', page.description);
    setMeta('meta[property="og:url"]', 'content', url);

    // Несъществуващ адрес: без индексиране и без структурирани данни
    const missing = page === notFoundPage;
    let robots = document.head.querySelector('meta[name="robots"]');
    if (missing && !robots) {
      robots = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex' });
      document.head.appendChild(robots);
    } else if (!missing) robots?.remove();

    let ld = document.getElementById('structured-data');
    if (missing) {
      ld?.remove();
      return;
    }
    if (!ld) {
      ld = Object.assign(document.createElement('script'), { type: 'application/ld+json', id: 'structured-data' });
      document.head.appendChild(ld);
    }
    ld.textContent = structuredDataJson(page);
  }, [pathname]);

  return null;
}
