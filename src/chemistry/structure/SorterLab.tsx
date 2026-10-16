import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

type Kind = 'simple' | 'compound' | 'homogeneous' | 'heterogeneous';

// Нещата идват в един и същ ред – без случайност, за да съвпада с HTML-а от prerender.
const ITEMS: { name: string; emoji: string; kind: Kind; why: string }[] = [
  { name: 'кислород', emoji: '🫁', kind: 'simple', why: 'Медицинският кислород е почти чист O₂ – молекули от два атома на един и същ елемент. Затова е просто вещество.' },
  { name: 'морска вода', emoji: '🌊', kind: 'homogeneous', why: 'Солите са разтворени – не се виждат и не се утаяват. Разтворите са хомогенни смеси.' },
  { name: 'захар', emoji: '🍬', kind: 'compound', why: 'Захарозата C₁₂H₂₂O₁₁ е изградена от три елемента – въглерод, водород и кислород. Сложно вещество.' },
  { name: 'гранит', emoji: '🪨', kind: 'heterogeneous', why: 'С просто око се виждат зрънца с различен цвят – кварц, фелдшпат, слюда. Хетерогенна смес.' },
  { name: 'медна жица', emoji: '🔌', kind: 'simple', why: 'Медта Cu е съставена от атоми само на един елемент – просто вещество.' },
  { name: 'въздух', emoji: '💨', kind: 'homogeneous', why: 'Въздухът е смес от азот, кислород, аргон, въглероден диоксид и други газове. Газовете се смесват напълно – сместа е хомогенна.' },
  { name: 'дестил. вода', emoji: '💧', kind: 'compound', why: 'H₂O е съединение на водород и кислород. Дестилираната вода е почти чисто вещество – сложно.' },
  { name: 'олио и вода', emoji: '🫗', kind: 'heterogeneous', why: 'Олиото не се смесва с водата и изплува отгоре – ясно се вижда границата. Хетерогенна смес.' },
  { name: 'диамант', emoji: '💎', kind: 'simple', why: 'Диамантът е само от въглеродни атоми – просто вещество, също като графита в молива.' },
  { name: '18-кар. злато', emoji: '💍', kind: 'homogeneous', why: 'Бижутерското злато е сплав на злато със сребро и мед. Металите са смесени на ниво атоми – сплавите обикновено са хомогенни смеси.' },
  { name: 'готварска сол', emoji: '🧂', kind: 'compound', why: 'NaCl е съединение на натрий и хлор – сложно вещество. Свойствата му нямат нищо общо с мекия метал натрий и отровния газ хлор.' },
  { name: 'мъгла', emoji: '🌫️', kind: 'heterogeneous', why: 'Мъглата е от малки водни капчици във въздуха – две фази, течност и газ. Хетерогенна смес.' },
  { name: 'сух лед', emoji: '🧊', kind: 'compound', why: 'Сухият лед е твърд въглероден диоксид CO₂ – сложно вещество, не замръзнала вода.' },
  { name: 'прецеден чай', emoji: '🍵', kind: 'homogeneous', why: 'След прецеждане в чая остават само разтворени вещества – той е разтвор, хомогенна смес.' },
];

const CHOICES: { kind: Kind; label: string }[] = [
  { kind: 'simple', label: 'просто вещество' },
  { kind: 'compound', label: 'сложно вещество' },
  { kind: 'homogeneous', label: 'хомогенна смес' },
  { kind: 'heterogeneous', label: 'хетерогенна смес' },
];

// Две големи области (чисти вещества и смеси), всяка разделена на две.
const GROUPS = [
  { name: 'Чисти вещества', x: 4, cls: 'fill-sky-50 stroke-sky-300 dark:fill-sky-900/30 dark:stroke-sky-700' },
  { name: 'Смеси', x: 244, cls: 'fill-amber-50 stroke-amber-300 dark:fill-amber-900/30 dark:stroke-amber-700' },
];
const BOXES: { kind: Kind; name: string; x: number }[] = [
  { kind: 'simple', name: 'прости', x: 12 },
  { kind: 'compound', name: 'сложни', x: 124 },
  { kind: 'homogeneous', name: 'хомогенни', x: 252 },
  { kind: 'heterogeneous', name: 'хетерогенни', x: 364 },
];
const BOX_W = 104;
const TOP = 92;
const ROW = 30;

/** Подреди нещата около нас: чисто вещество (просто или сложно) или смес (хомогенна или хетерогенна). */
export default function SorterLab() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Kind[]>([]);
  const answered = answers.length > index;
  const done = answers.length === ITEMS.length;
  const current = ITEMS[Math.min(index, ITEMS.length - 1)];
  const score = answers.filter((a, i) => a === ITEMS[i].kind).length;

  const placed = ITEMS.slice(0, answers.length).map((item, i) => {
    const before = ITEMS.slice(0, i).filter(m => m.kind === item.kind).length;
    const box = BOXES.find(b => b.kind === item.kind)!;
    return { ...item, ok: answers[i] === item.kind, x: box.x + BOX_W / 2, y: TOP + before * ROW };
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 240" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {GROUPS.map(g => (
          <g key={g.name}>
            <rect x={g.x} y={4} width={232} height={232} rx="12" className={g.cls} strokeWidth="2" />
            <text x={g.x + 116} y={26} fontSize="15" fontWeight="700" textAnchor="middle" fill="currentColor">
              {g.name}
            </text>
          </g>
        ))}
        {BOXES.map(b => (
          <g key={b.kind}>
            <rect x={b.x} y={38} width={BOX_W} height={190} rx="10" className="fill-white/70 stroke-gray-300 dark:fill-gray-900/40 dark:stroke-gray-600" strokeWidth="1.5" />
            <text x={b.x + BOX_W / 2} y={60} fontSize="13" fontWeight="600" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              {b.name}
            </text>
          </g>
        ))}
        {placed.map(p => (
          <g key={p.name}>
            <rect x={p.x - 49} y={p.y - 15} width="98" height="24" rx="12" className={p.ok ? 'fill-white stroke-emerald-500 dark:fill-gray-800' : 'fill-white stroke-red-500 dark:fill-gray-800'} strokeWidth="2" />
            <text x={p.x} y={p.y + 2} fontSize="12" textAnchor="middle" fill="currentColor">
              {p.name}
            </text>
          </g>
        ))}
      </LabSvg>

      {!done && (
        <div className="text-center mt-3">
          <div className="text-2xl mb-1 text-gray-900 dark:text-gray-100">
            {current.emoji} {current.name}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {index + 1} от {ITEMS.length}. Чисто вещество ли е, или смес?
          </p>
        </div>
      )}
      <Buttons>
        {!done &&
          !answered &&
          CHOICES.map(c => (
            <DiagramButton key={c.kind} onClick={() => setAnswers([...answers, c.kind])}>
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
      {answered && (
        <Note tone={answers[index] === current.kind ? 'emerald' : 'rose'}>
          {answers[index] === current.kind ? '✓ Вярно! ' : '✗ Не съвсем. '}
          {current.why}
        </Note>
      )}
      {done && (
        <Note tone="violet">
          Позна {score} от {ITEMS.length}. Повечето неща около нас са смеси – чистите вещества получаваме, като ги разделяме.
        </Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Първо питай: едно вещество ли е, или няколко? Ако е едно – от колко елемента е изградено? Ако е смес – виждаш ли (поне под
        микроскоп) отделни части? Зелена рамка – позна, червена – сгреши.
      </p>
    </div>
  );
}
