# Преминаване към KaTeX (завършено 09.10.2026)

Всички 54 урока са преминати: автоматично конвертиране + ръчни корекции. `redo.sh` е замразен –
пускането му би изтрило ръчните корекции. Новите уроци пишат формулите направо с `<Tex>` и `$…$`.

Проверки, които остават полезни и за нови уроци:

```bash
node scripts/tex/validate.mjs src/**/*.tsx        # всяка формула се рендира с KaTeX без грешка
node scripts/tex/check-quizzes.mjs src/**/*.tsx   # верният отговор е сред вариантите и не се откроява
sh scripts/tex/check-all.sh [страница…]           # в браузъра при 1280 и 390 px (dev сървър на :5179)
```

---

# Преминаване към KaTeX

Временни инструменти за превръщане на формулите в уроците от Unicode (x², √D, x₁,₂) в LaTeX за KaTeX.

```bash
node scripts/tex/convert-lesson.mjs src/algebra/Powers.tsx        # променя файла
node scripts/tex/convert-lesson.mjs src/algebra/Powers.tsx --dry  # само показва резултата
echo '["x² − 4 = 0"]' | node scripts/tex/mark.mjs                 # превръща отделни низове
python3 scripts/tex/fix-array.py src/algebra/Powers.tsx --mistakes # картите „Чести грешки“
python3 scripts/tex/fix-array.py <файл> "<откъс>" поле1,поле2    # друг масив, показван направо
sh scripts/tex/redo.sh                                            # всички преминати уроци наново
agent-browser eval --stdin < scripts/tex/expand.js                # отваря всички решения
agent-browser eval --stdin < scripts/tex/check.js                 # проверка на отворената страница
```

Скриптът обработва текста в JSX на експортираната страница (→ `<Tex>`) и низовете в `description`, `steps`,
`question`, `answers`, `correctAnswer`, `problem`, `solution`, `answer`, `explanation` (→ `$…$`).
Лабораториите и SVG надписите не се пипат. След всеки урок: преглед на разликата, `npx tsc --noEmit -p .`
и проверка в браузъра, че няма `.katex-error` и останали `$…$`. Картите „Чести грешки“ и другите масиви, показвани направо, се обработват с `fix-array.py`.
Всеки преминат урок и ръчните стъпки за него се добавят в `redo.sh`, за да може след подобрение на
инструментите всичко да се пусне наново еднакво. `check.js` брои формулите и намира
`.katex-error`, останали `$…$` и формули, които излизат извън екрана (пусни го и при ширина 390 px).

Когато всички уроци са преминати, папката може да се изтрие.
