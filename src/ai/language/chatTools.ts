// Помощни сметки за урока „От модел до асистент“: разговорът като един текст, отрязване на контекста,
// опростен „учещ се в контекста“ модел и търсене в документи по припокриване на думи.

export type Role = 'system' | 'user' | 'assistant';
export type Message = { role: Role; text: string };

export const ROLE_MARK: Record<Role, string> = { system: '<|система|>', user: '<|потребител|>', assistant: '<|асистент|>' };

/** Груба оценка: един токен на всеки три знака. Истинският брой зависи от речника на модела. */
export const approxTokens = (text: string) => Math.ceil(text.length / 3);

/** Токените на една реплика: един за маркера на ролята плюс текста. */
export const messageTokens = (m: Message) => 1 + approxTokens(m.text);

/**
 * Кои реплики се побират в контекст от `limit` токена. Системните указания остават винаги,
 * а от разговора отпадат най-старите реплики, докато остатъкът се побере. Един токен се пази за маркера,
 * след който моделът започва да пише.
 */
export function visibleMessages(messages: Message[], limit: number): boolean[] {
  const keep = messages.map(m => m.role === 'system');
  let used = 1 + messages.filter(m => m.role === 'system').reduce((s, m) => s + messageTokens(m), 0);
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'system') continue;
    const t = messageTokens(messages[i]);
    if (used + t > limit) break;
    used += t;
    keep[i] = true;
  }
  return keep;
}

export const usedTokens = (messages: Message[], keep: boolean[]) => 1 + messages.reduce((s, m, i) => s + (keep[i] ? messageTokens(m) : 0), 0);

// ---------- Учене в контекста (опростено) ----------

export type Rule = { id: string; label: string; f: (x: number) => number };

/** Хипотезите на играчката-модел. Нарочно съвпадат за някои входове: 3 → 6 е вярно за три от тях. */
export const RULES: Rule[] = [
  { id: 'double', label: 'удвои (2·x)', f: x => 2 * x },
  { id: 'plus3', label: 'прибави 3 (x + 3)', f: x => x + 3 },
  { id: 'square', label: 'на квадрат (x²)', f: x => x * x },
  { id: 'triple3', label: 'утрои и извади 3 (3·x − 3)', f: x => 3 * x - 3 },
];

/** Колко вероятно е пример, който НЕ отговаря на правилото (грешка при преписване). */
export const NOISE = 0.02;

/** Увереност във всяка хипотеза след примерите: започва поравно и се умножава по 1 или по NOISE за всеки пример. */
export function posterior(examples: [number, number][], rules: Rule[] = RULES): number[] {
  const w = rules.map(r => examples.reduce((p, [x, y]) => p * (r.f(x) === y ? 1 : NOISE), 1));
  const sum = w.reduce((a, b) => a + b, 0);
  return w.map(v => v / sum);
}

/** Предсказания за нов вход: всеки възможен отговор със сбора от увереностите на хипотезите, които го дават. */
export function predict(post: number[], x: number, rules: Rule[] = RULES): { y: number; p: number }[] {
  const by = new Map<number, number>();
  rules.forEach((r, i) => by.set(r.f(x), (by.get(r.f(x)) ?? 0) + post[i]));
  return [...by.entries()].map(([y, p]) => ({ y, p })).sort((a, b) => b.p - a.p || a.y - b.y);
}

// ---------- Търсене в документи ----------

export type Doc = { title: string; text: string };

export const DOCS: Doc[] = [
  { title: 'Библиотека', text: 'Библиотеката е отворена от понеделник до петък от 8:00 до 16:30. Книга се заема за 14 дни.' },
  { title: 'Столова', text: 'Столовата предлага обяд от 11:30 до 14:00. Менюто за седмицата се обявява в понеделник.' },
  { title: 'Телефони', text: 'Мобилните телефони се изключват по време на час и се държат в раницата.' },
  { title: 'Физкултурен салон', text: 'Физкултурният салон е свободен за ученици във вторник и четвъртък след 15:00. Нужни са спортни обувки.' },
  { title: 'Екскурзия', text: 'Екскурзията до Рилския манастир е на 17 май. Записването е при класния ръководител до 30 април.' },
  { title: 'Отсъствия', text: 'Отсъствие по болест се извинява с медицинска бележка в срок от три дни.' },
  { title: 'Кръжок', text: 'Кръжокът по роботика се събира всяка сряда от 14:30 в кабинет 204.' },
];

export type Query = { text: string; /** номерът на документа с отговора или null, ако такъв няма */ expected: number | null; answer: string };

export const QUERIES: Query[] = [
  { text: 'До колко часа е отворена библиотеката?', expected: 0, answer: 'До 16:30, от понеделник до петък.' },
  { text: 'Кога е екскурзията до Рилския манастир?', expected: 4, answer: 'На 17 май; записването е до 30 април.' },
  { text: 'Мога ли да ползвам телефон по време на час?', expected: 2, answer: 'Не – телефоните се изключват и стоят в раницата.' },
  { text: 'Къде се събира кръжокът по роботика?', expected: 6, answer: 'В кабинет 204, всяка сряда от 14:30.' },
  { text: 'Какво се случва в понеделник?', expected: 1, answer: 'В понеделник се обявява менюто за седмицата.' },
  { text: 'Кога мога да хапна нещо топло?', expected: 1, answer: 'Обядът в столовата е от 11:30 до 14:00.' },
  { text: 'Кой е директорът на училището?', expected: null, answer: '' },
];

const STOP = new Set(['се', 'да', 'за', 'от', 'до', 'на', 'по', 'във', 'при', 'след', 'кога', 'къде', 'кой', 'мога', 'нещо', 'колко', 'всяка', 'са', 'ли']);

/** Думите на текста, сведени до първите си пет букви („библиотеката“ и „библиотека“ стават едно и също). */
export function stems(text: string): string[] {
  const words = text.toLowerCase().match(/[а-я]+/g) ?? [];
  return [...new Set(words.filter(w => w.length >= 3 && !STOP.has(w)).map(w => w.slice(0, 5)))];
}

/** Тегло на дума: колкото в по-малко документи се среща, толкова повече тежи. */
export function wordWeights(docs: Doc[] = DOCS): Map<string, number> {
  const df = new Map<string, number>();
  for (const d of docs) for (const s of stems(d.text)) df.set(s, (df.get(s) ?? 0) + 1);
  return new Map([...df.entries()].map(([s, n]) => [s, Math.log(1 + docs.length / n)]));
}

/** Близост на въпрос и документ: сборът от теглата на общите им думи. */
export function scores(query: string, docs: Doc[] = DOCS): { score: number; shared: string[] }[] {
  const w = wordWeights(docs);
  const q = stems(query);
  return docs.map(d => {
    const ds = new Set(stems(d.text));
    const shared = q.filter(s => ds.has(s));
    return { score: shared.reduce((s, x) => s + (w.get(x) ?? 0), 0), shared };
  });
}

/** Под този праг документът се смята за неподходящ и не се добавя. */
export const MIN_SCORE = 1.5;

/** Номерата на най-близките `k` документа с оценка над прага, подредени по оценка. */
export function retrieve(query: string, k: number, docs: Doc[] = DOCS): number[] {
  return scores(query, docs)
    .map((s, i) => ({ i, score: s.score }))
    .filter(s => s.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, k)
    .map(s => s.i);
}
