import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { findPage, fullTitle, SITE_URL } from '~/pages';

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
  }, [pathname]);

  return null;
}
