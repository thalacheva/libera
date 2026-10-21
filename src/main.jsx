import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { inject } from "@vercel/analytics";
import App from "./App.js";
import "./index.css";

// Vercel Web Analytics – посещения без бисквитки; отчита и навигацията в сайта.
inject();

const container = document.getElementById("root");
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Страниците от build идват с готов HTML (vite.config.js) – React го поема.
// Разлики са очаквани (случайни задачи в тренажорите, запомнен прогрес, днешната дата):
// тогава React просто рендерира урока наново, затова не ги показваме като грешки.
if (container.hasChildNodes()) {
  hydrateRoot(container, app, {
    onRecoverableError: (error) => {
      // #418 – минифицираният код на същата грешка в production
      if (!/Hydration|#418/.test(String(error?.message))) console.error(error);
    },
  });
} else {
  createRoot(container).render(app);
}
