import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

// Дължина (милиони базови двойки, приблизително) и дял на късото рамо p – за схематичния чертеж
const CHROM: Record<string, [number, number]> = {
  '1': [248, 0.48], '2': [242, 0.39], '3': [198, 0.46], '4': [190, 0.27], '5': [181, 0.27],
  '6': [171, 0.35], '7': [159, 0.37], '8': [145, 0.31], '9': [138, 0.35], '10': [134, 0.3], '11': [135, 0.39], '12': [133, 0.27],
  '13': [114, 0.15], '14': [107, 0.16], '15': [102, 0.17], '16': [90, 0.43], '17': [83, 0.3], '18': [80, 0.23],
  '19': [59, 0.45], '20': [64, 0.44], '21': [47, 0.25], '22': [51, 0.27], X: [156, 0.39], Y: [57, 0.2],
};

const ROWS = [
  ['1', '2', '3', '4', '5'],
  ['6', '7', '8', '9', '10', '11', '12'],
  ['13', '14', '15', '16', '17', '18'],
  ['19', '20', '21', '22', 'XY'],
];

type Case = { id: string; notation: string; name: string; extra?: string; sex: string[]; about: string };

const CASES: Case[] = [
  { id: 'xx', notation: '46,XX', name: 'нормален женски кариотип', sex: ['X', 'X'], about: '22 двойки автозоми и две X-хромозоми.' },
  { id: 'xy', notation: '46,XY', name: 'нормален мъжки кариотип', sex: ['X', 'Y'], about: '22 двойки автозоми, една X и една (малка) Y-хромозома.' },
  {
    id: 'down',
    notation: '47,XY,+21',
    name: 'синдром на Даун',
    extra: '21',
    sex: ['X', 'Y'],
    about: 'Три хромозоми 21 (тризомия 21). Най-честата хромозомна аномалия при живородените – около 1 на 700–1000 раждания.',
  },
  {
    id: 'turner',
    notation: '45,X',
    name: 'синдром на Търнър',
    sex: ['X'],
    about: 'Само една X-хромозома. Жена, обикновено ниска, с недоразвити яйчници (безплодие). Около 1 на 2000–2500 момичета.',
  },
  {
    id: 'klinefelter',
    notation: '47,XXY',
    name: 'синдром на Клайнфелтер',
    sex: ['X', 'X', 'Y'],
    about: 'Две X и една Y. Мъж (Y определя пола), често висок и безплоден. Около 1 на 500–1000 момчета; много случаи остават неоткрити.',
  },
  {
    id: 'xxx',
    notation: '47,XXX',
    name: 'тризомия X',
    sex: ['X', 'X', 'X'],
    about: 'Три X-хромозоми. Жена, често без забележими симптоми – две от трите X са неактивни (телца на Бар).',
  },
];

const W = 560;
const SCALE = 0.27; // px за милион бази
const CW = 7; // ширина на една хроматида
const TOP = 12;

/** Схематична метафазна хромозома: две сестрински хроматиди, свити при центромерата. */
function Chromosome({ x, cy, name, hi }: { x: number; cy: number; name: string; hi: boolean }) {
  const [len, pFrac] = CHROM[name];
  const p = len * pFrac * SCALE;
  const q = len * (1 - pFrac) * SCALE;
  const fill = hi ? 'fill-rose-500' : name === 'X' || name === 'Y' ? 'fill-violet-500' : 'fill-gray-500 dark:fill-gray-400';
  return (
    <g className={fill}>
      {[-CW / 2 - 0.6, CW / 2 + 0.6].map(dx => (
        <g key={dx}>
          <rect x={x + dx - CW / 2} y={cy - p} width={CW} height={p - 1.5} rx={CW / 2} />
          <rect x={x + dx - CW / 2} y={cy + 1.5} width={CW} height={q - 1.5} rx={CW / 2} />
        </g>
      ))}
      <rect x={x - CW / 2} y={cy - 2} width={CW} height={4} rx={2} />
    </g>
  );
}

function layout() {
  // Центромерите в един ред са на една линия, както в истинските кариограми
  let y = TOP;
  return ROWS.map(names => {
    const items = names.flatMap(n => (n === 'XY' ? ['X', 'Y'] : [n]));
    const maxP = Math.max(...items.map(n => CHROM[n][0] * CHROM[n][1] * SCALE));
    const maxQ = Math.max(...items.map(n => CHROM[n][0] * (1 - CHROM[n][1]) * SCALE));
    const cy = y + maxP;
    const labelY = cy + maxQ + 13;
    y = labelY + 14;
    return { names, cy, labelY };
  });
}
const ROW_LAYOUT = layout();
const HEIGHT = ROW_LAYOUT[ROW_LAYOUT.length - 1].labelY + 8;

/** Кариотип: нормален и с хромозомни аномалии; режим „познай“. */
export default function KaryotypeLab() {
  const [ci, setCi] = useState(0);
  const [quiz, setQuiz] = useState(false);
  const [guess, setGuess] = useState<number | null>(null);
  const c = CASES[ci];
  const hidden = quiz && guess === null;

  const total = 44 + (c.extra ? 1 : 0) + c.sex.length;
  const xCount = c.sex.filter(s => s === 'X').length;

  const newQuiz = () => {
    setQuiz(true);
    setGuess(null);
    // Различен случай от сегашния
    setCi(prev => {
      const next = Math.floor(Math.random() * (CASES.length - 1));
      return next >= prev ? next + 1 : next;
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {CASES.map((k, i) => (
          <DiagramButton
            key={k.id}
            active={!quiz && ci === i}
            onClick={() => {
              setQuiz(false);
              setCi(i);
            }}
          >
            {k.notation}
          </DiagramButton>
        ))}
        <DiagramButton onClick={newQuiz} active={quiz}>
          🎲 Познай
        </DiagramButton>
      </Buttons>

      <LabSvg viewBox={`0 0 ${W} ${HEIGHT}`} className="w-full h-auto max-w-2xl mx-auto block select-none mt-3 text-gray-800 dark:text-gray-100">
        {ROW_LAYOUT.map(({ names, cy, labelY }) => {
          const slot = (W - 20) / names.length;
          return names.map((n, i) => {
            const cx = 10 + slot * (i + 0.5);
            const copies = n === 'XY' ? c.sex : Array(n === c.extra ? 3 : 2).fill(n);
            const abnormal = !hidden && (n === c.extra || (n === 'XY' && c.id !== 'xx' && c.id !== 'xy'));
            const step = 2 * CW + 6;
            return (
              <g key={n}>
                {abnormal && (
                  <rect x={cx - (copies.length * step) / 2 - 3} y={labelY - 10} width={copies.length * step + 6} height={14} rx={4} className="fill-rose-100 dark:fill-rose-500/20" />
                )}
                {copies.map((name, k) => (
                  <Chromosome key={k} x={cx + (k - (copies.length - 1) / 2) * step} cy={cy} name={name} hi={abnormal} />
                ))}
                <text x={cx} y={labelY} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
                  {n === 'XY' ? (hidden ? 'полови' : c.sex.join('')) : n}
                </text>
              </g>
            );
          });
        })}
      </LabSvg>

      {quiz && (
        <>
          <p className="text-center text-sm font-medium mt-3">Преброй хромозомите и разгледай половите. Кой е кариотипът?</p>
          <Buttons>
            {CASES.map((k, i) => (
              <DiagramButton key={k.id} onClick={() => setGuess(i)} active={guess === i}>
                {k.notation}
              </DiagramButton>
            ))}
          </Buttons>
          {guess !== null && (
            <Note tone={guess === ci ? 'emerald' : 'amber'}>{guess === ci ? '✓ Вярно!' : `✗ Не – това е ${c.notation}.`}</Note>
          )}
        </>
      )}

      {!hidden && (
        <>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'кариотип', value: c.notation },
                { label: 'хромозоми', value: total },
                { label: 'пол', value: c.sex.includes('Y') ? 'мъжки' : 'женски' },
                { label: 'телца на Бар', value: Math.max(0, xCount - 1) },
              ]}
            />
          </div>
          <Note tone="violet">
            {c.name[0].toUpperCase() + c.name.slice(1)}. {c.about}
          </Note>
        </>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Схема: хромозомите са подредени по големина, а дължините им са пропорционални на броя базови двойки. В истинския кариотип
        се виждат и ивици след оцветяване, по които се разпознават двойките. Телцата на Бар са неактивните X-хромозоми: във всяка
        клетка остава активна само една.
      </p>
    </div>
  );
}
