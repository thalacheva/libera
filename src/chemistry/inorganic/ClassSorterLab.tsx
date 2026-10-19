import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

type Cls = 'oxide' | 'base' | 'acid' | 'salt';

// Веществата идват в един и същ ред – без случайност, за да съвпада с HTML-а от prerender.
const ITEMS: { f: string; cls: Cls; sub: string; why: string }[] = [
  { f: 'SO₃', cls: 'oxide', sub: 'киселинен оксид', why: 'Два елемента, единият е кислород. С вода дава сярна киселина H₂SO₄ – SO₃ е нейният анхидрид.' },
  { f: 'NaOH', cls: 'base', sub: 'основа (алкална)', why: 'Метал и хидроксидна група OH. Разтваря се добре във вода – такива основи се наричат алкални основи (основи).' },
  { f: 'H₃PO₄', cls: 'acid', sub: 'кислородна, триосновна', why: 'Водород + киселинен остатък PO₄. Три водородни атома могат да се заместят с метал – триосновна киселина.' },
  { f: 'CaCO₃', cls: 'salt', sub: 'нормална сол', why: 'Метал + киселинен остатък CO₃, без H и OH – нормална сол (варовик, мрамор, тебешир).' },
  { f: 'Na₂O', cls: 'oxide', sub: 'основен оксид', why: 'Оксид на активен метал. С вода дава основата NaOH, с киселини – сол и вода.' },
  { f: 'HCl', cls: 'acid', sub: 'безкислородна, едноосновна', why: 'Водород + киселинен остатък Cl, без кислород. Един заместим водороден атом – едноосновна.' },
  { f: 'Fe(OH)₃', cls: 'base', sub: 'неразтворима основа', why: 'Метал и три OH групи. Не се разтваря във вода – кафява утайка, която при нагряване дава Fe₂O₃ и вода.' },
  { f: 'NaHCO₃', cls: 'salt', sub: 'кисела сол', why: 'В аниона е останал един водороден атом от H₂CO₃ – кисела сол (сода бикарбонат).' },
  { f: 'Al₂O₃', cls: 'oxide', sub: 'амфотерен оксид', why: 'Реагира и с киселини, и с основи – амфотерен оксид. В природата е корундът (рубин и сапфир с примеси).' },
  { f: 'H₂SO₄', cls: 'acid', sub: 'кислородна, двуосновна', why: 'Два заместими водородни атома и киселинен остатък SO₄ – двуосновна кислородна киселина.' },
  { f: 'Zn(OH)₂', cls: 'base', sub: 'амфотерен хидроксид', why: 'По формула е основа, но реагира и с киселини, и с алкални основи – амфотерен хидроксид.' },
  { f: 'Cu₂(OH)₂CO₃', cls: 'salt', sub: 'основна сол', why: 'Освен киселинния остатък CO₃ има и OH групи – основна сол. Това е минералът малахит и зелената патина по медта.' },
  { f: 'CO', cls: 'oxide', sub: 'неутрален (несолеобразуващ) оксид', why: 'Не реагира нито с киселини, нито с основи и не дава соли – несолеобразуващ оксид.' },
  { f: 'CuSO₄·5H₂O', cls: 'salt', sub: 'кристалохидрат на нормална сол', why: 'Синият камък – CuSO₄ с кристализационна вода. Безводният CuSO₄ е бял.' },
  { f: 'KAl(SO₄)₂·12H₂O', cls: 'salt', sub: 'двойна сол (кристалохидрат)', why: 'Два различни катиона (K⁺ и Al³⁺) и един анион – двойна сол. Това е стипцата.' },
];

const CHOICES: { cls: Cls; label: string }[] = [
  { cls: 'oxide', label: 'оксид' },
  { cls: 'base', label: 'основа' },
  { cls: 'acid', label: 'киселина' },
  { cls: 'salt', label: 'сол' },
];

const BOX_W = 114;
const BOXES: { cls: Cls; name: string; x: number; tint: string }[] = [
  { cls: 'oxide', name: 'оксиди', x: 4, tint: 'fill-rose-50 stroke-rose-300 dark:fill-rose-900/30 dark:stroke-rose-700' },
  { cls: 'base', name: 'основи', x: 123, tint: 'fill-violet-50 stroke-violet-300 dark:fill-violet-900/30 dark:stroke-violet-700' },
  { cls: 'acid', name: 'киселини', x: 242, tint: 'fill-amber-50 stroke-amber-300 dark:fill-amber-900/30 dark:stroke-amber-700' },
  { cls: 'salt', name: 'соли', x: 361, tint: 'fill-emerald-50 stroke-emerald-300 dark:fill-emerald-900/30 dark:stroke-emerald-700' },
];
const TOP = 54;
const ROW = 30;

/** Подреди веществата в четирите класа; след всеки отговор – подкласът и защо. */
export default function ClassSorterLab() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Cls[]>([]);
  const done = index >= ITEMS.length;
  const current = ITEMS[Math.min(index, ITEMS.length - 1)];
  const answered = answers.length > index;
  const score = answers.filter((a, i) => a === ITEMS[i].cls).length;

  // Всяко вещество отива във вярната кутия; рамката показва дали е познато
  const counts: Record<Cls, number> = { oxide: 0, base: 0, acid: 0, salt: 0 };
  const placed = answers.map((a, i) => {
    const item = ITEMS[i];
    const box = BOXES.find(b => b.cls === item.cls)!;
    const row = counts[item.cls]++;
    return { f: item.f, x: box.x + BOX_W / 2, y: TOP + 16 + row * ROW, ok: a === item.cls };
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 220" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {BOXES.map(b => (
          <g key={b.cls}>
            <rect x={b.x} y={4} width={BOX_W} height={212} rx="12" className={b.tint} strokeWidth="2" />
            <text x={b.x + BOX_W / 2} y={30} fontSize="15" fontWeight="700" textAnchor="middle" fill="currentColor">
              {b.name}
            </text>
          </g>
        ))}
        {placed.map(p => (
          <g key={p.f}>
            <rect x={p.x - 53} y={p.y - 15} width="106" height="24" rx="12" className={p.ok ? 'fill-white stroke-emerald-500 dark:fill-gray-800' : 'fill-white stroke-red-500 dark:fill-gray-800'} strokeWidth="2" />
            <text x={p.x} y={p.y + 2} fontSize={p.f.length > 12 ? 11 : 13} textAnchor="middle" fill="currentColor">
              {p.f}
            </text>
          </g>
        ))}
      </LabSvg>

      {!done && (
        <div className="text-center mt-3">
          <div className="text-2xl mb-1 font-semibold text-gray-900 dark:text-gray-100">{current.f}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {index + 1} от {ITEMS.length}. Към кой клас е?
          </p>
        </div>
      )}
      <Buttons>
        {!done &&
          !answered &&
          CHOICES.map(c => (
            <DiagramButton key={c.cls} onClick={() => setAnswers([...answers, c.cls])}>
              {c.label}
            </DiagramButton>
          ))}
        {answered && !done && <DiagramButton onClick={() => setIndex(index + 1)}>Следващо →</DiagramButton>}
        {done && (
          <DiagramButton
            onClick={() => {
              setIndex(0);
              setAnswers([]);
            }}
          >
            Отначало
          </DiagramButton>
        )}
      </Buttons>
      {answered && !done && (
        <Note tone={answers[index] === current.cls ? 'emerald' : 'rose'}>
          {answers[index] === current.cls ? '✓ Вярно – ' : '✗ Не съвсем – '}
          {current.sub}. {current.why}
        </Note>
      )}
      {done && (
        <Note tone="violet">
          Позна {score} от {ITEMS.length}. Червената рамка отбелязва грешките – веществото все пак е поставено във вярната кутия.
        </Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Гледай формулата: два елемента, единият кислород – оксид; метал + OH групи – основа; водород + киселинен остатък – киселина; метал
        (или NH₄⁺) + киселинен остатък – сол. Зелена рамка – позна, червена – сгреши.
      </p>
    </div>
  );
}
