import {StrictMode} from 'react';
import {prerender} from 'react-dom/static';
import {StaticRouter} from 'react-router-dom';
import App from './App';

const page = (url: string) => (
  <StrictMode>
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  </StrictMode>
);

// Рендерира страницата до готов HTML при build (vite.config.js), за да виждат
// търсачките текста на урока без JavaScript.
export async function render(url: string) {
  // Без лимита React изнася големите уроци в скрит <div>, а на мястото им оставя
  // „Зареждане…“, докато скрипт не ги размени.
  const {prelude} = await prerender(page(url), {progressiveChunkSize: Infinity});
  return new Response(prelude).text();
}
