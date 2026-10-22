import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton } from '~/geometry/diagram';

const TRAITS = ['кутикула и устица', 'проводящи тъкани', 'семе', 'цвят', 'плод', 'оплождане без вода'];

type Group = {
  name: string;
  emoji: string;
  traits: boolean[];
  /** Коя фаза преобладава: гаметофитът (n) или спорофитът (2n); null – няма многоклетъчен спорофит. */
  dominant: 'n' | '2n';
  gametophyte: string;
  sporophyte: string | null;
  age: string;
  species: string;
  note: string;
};

const GROUPS: Group[] = [
  {
    name: 'зелени водорасли',
    emoji: '🟢',
    traits: [false, false, false, false, false, false],
    dominant: 'n',
    gametophyte: 'клетката или нишката',
    sporophyte: null,
    age: 'над 1 млрд. години',
    species: 'няколко хиляди',
    note: 'При много зелени водорасли (напр. хламидомонас) диплоидна е само зиготата: тя веднага се дели мейотично и дава хаплоидни клетки. Строго погледнато водораслите не са растения – но сухоземните растения произлизат от зелени водорасли.',
  },
  {
    name: 'мъхове',
    emoji: '🌿',
    traits: [true, false, false, false, false, false],
    dominant: 'n',
    gametophyte: 'зеленото растенийце',
    sporophyte: 'кутийка на дръжка',
    age: '≈ 470 млн. години',
    species: '≈ 20 000',
    note: 'Зеленото килимче е гаметофитът. Спорофитът (кутийка на дръжка) расте върху него и се храни от него. Без проводящи тъкани мъховете остават ниски, а сперматозоидите плуват до яйцеклетката в капка вода.',
  },
  {
    name: 'папрати',
    emoji: '🌱',
    traits: [true, true, false, false, false, false],
    dominant: '2n',
    gametophyte: 'проталий ≈ 1 cm',
    sporophyte: 'растението с листата',
    age: '≈ 420 млн. години',
    species: '≈ 12 000',
    note: 'Проводящите тъкани позволяват на спорофита да стане голям – в карбона папратовидните образуват гори, от които са днешните въглища. Гаметофитът (проталий) е малка зелена пластинка, независима от спорофита; за оплождането пак трябва вода.',
  },
  {
    name: 'голосеменни',
    emoji: '🌲',
    traits: [true, true, true, false, false, true],
    dominant: '2n',
    gametophyte: 'в шишарката и прашеца',
    sporophyte: 'дървото (бор, ела)',
    age: '≈ 360 млн. години',
    species: '≈ 1 000',
    note: 'Гаметофитите са микроскопични и се развиват в шишарките; мъжкият е прашецът, който вятърът носи. Прашецът и семето освобождават растенията от водата. Семената лежат открито върху люспите на шишарката – оттам „голосеменни“.',
  },
  {
    name: 'покритосеменни',
    emoji: '🌸',
    traits: [true, true, true, true, true, true],
    dominant: '2n',
    gametophyte: 'прашец, зародишна торбичка',
    sporophyte: 'цялото растение',
    age: '≈ 130–140 млн. години',
    species: '≈ 300 000',
    note: 'Семепъпките са скрити в плодника, а от него след оплождането се развива плодът. Цветът привлича опрашители, а плодът помага за разпространението на семената. Днес това е най-голямата група растения.',
  },
];

// Възлите на цикъла: [x, y] на центъра, половин ширина и височина
const NODES = {
  spores: { x: 75, y: 92, label: 'спори', ploidy: 'n' },
  gametophyte: { x: 240, y: 42, label: 'гаметофит', ploidy: 'n' },
  gametes: { x: 405, y: 92, label: 'гамети', ploidy: 'n' },
  zygote: { x: 405, y: 190, label: 'зигота', ploidy: '2n' },
  sporophyte: { x: 240, y: 232, label: 'спорофит', ploidy: '2n' },
} as const;
type NodeId = keyof typeof NODES;

const size = (big: boolean) => (big ? { hw: 82, hh: 26 } : { hw: 52, hh: 18 });
/** Разширява кутията, ако надписът под името е по-дълъг (шрифт 10 ≈ 5,6 единици на буква). */
const fit = (s: { hw: number; hh: number }, sub: string) => ({ ...s, hw: Math.max(s.hw, sub.length * 2.9 + 8) });

/** Точката по ръба на правоъгълника около (x, y) в посока към (tx, ty). */
function edge(x: number, y: number, hw: number, hh: number, tx: number, ty: number) {
  const dx = tx - x;
  const dy = ty - y;
  const t = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
  return { x: x + dx * t, y: y + dy * t };
}

function Arrow({ from, to, label, sizes, dy = 0 }: { from: NodeId; to: NodeId; label: string; sizes: Record<NodeId, { hw: number; hh: number }>; dy?: number }) {
  const a = NODES[from];
  const b = NODES[to];
  const p = edge(a.x, a.y, sizes[from].hw + 4, sizes[from].hh + 4, b.x, b.y);
  const q = edge(b.x, b.y, sizes[to].hw + 6, sizes[to].hh + 6, a.x, a.y);
  const meiosis = label === 'мейоза';
  return (
    <g>
      <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} strokeWidth={meiosis ? 2.5 : 1.5} className={meiosis ? 'stroke-violet-500' : 'stroke-gray-400'} markerEnd="url(#plant-arrow)" />
      <text x={(p.x + q.x) / 2} y={(p.y + q.y) / 2 + dy} fontSize="11" textAnchor="middle" className={meiosis ? 'fill-violet-600 dark:fill-violet-300 font-semibold' : 'fill-gray-500 dark:fill-gray-400'}>
        {label}
      </text>
    </g>
  );
}

/** Групите растения: белезите им и редуването на поколенията. */
export default function PlantGroupsLab() {
  const [k, setK] = useState(1);
  const g = GROUPS[k];
  const noSporophyte = g.sporophyte === null;
  const sizes: Record<NodeId, { hw: number; hh: number }> = {
    spores: size(false),
    gametes: size(false),
    zygote: size(false),
    gametophyte: fit(size(g.dominant === 'n'), g.gametophyte),
    sporophyte: fit(size(g.dominant === '2n'), g.sporophyte ?? 'няма'),
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {GROUPS.map((x, i) => (
          <DiagramButton key={x.name} active={i === k} onClick={() => setK(i)}>
            {x.emoji} {x.name}
          </DiagramButton>
        ))}
      </Buttons>

      <div className="flex flex-wrap justify-center gap-1.5 mt-3">
        {TRAITS.map((t, i) => (
          <span
            key={t}
            className={`rounded-full border px-2.5 py-0.5 text-xs sm:text-sm ${
              g.traits[i]
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                : 'border-gray-200 bg-gray-50 text-gray-400 line-through dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-500'
            }`}
          >
            {g.traits[i] ? '✓' : '✗'} {t}
          </span>
        ))}
      </div>

      <LabSvg viewBox="0 0 480 270" className="w-full h-auto max-w-xl mx-auto block mt-3 select-none text-gray-800 dark:text-gray-100">
        <defs>
          <marker id="plant-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="fill-gray-500" />
          </marker>
        </defs>
        <rect x={0} y={0} width={480} height={140} className="fill-sky-50 dark:fill-sky-500/10" />
        <rect x={0} y={140} width={480} height={130} className="fill-rose-50 dark:fill-rose-500/10" />
        <text x={8} y={134} fontSize="11" className="fill-sky-700 dark:fill-sky-300">
          хаплоидно (n)
        </text>
        <text x={8} y={156} fontSize="11" className="fill-rose-700 dark:fill-rose-300">
          диплоидно (2n)
        </text>

        <Arrow from="spores" to="gametophyte" label="митози" sizes={sizes} dy={-6} />
        <Arrow from="gametophyte" to="gametes" label="митози" sizes={sizes} dy={-6} />
        <Arrow from="gametes" to="zygote" label="оплождане" sizes={sizes} dy={4} />
        {noSporophyte ? (
          <Arrow from="zygote" to="spores" label="мейоза" sizes={sizes} dy={-6} />
        ) : (
          <>
            <Arrow from="zygote" to="sporophyte" label="митози" sizes={sizes} dy={16} />
            <Arrow from="sporophyte" to="spores" label="мейоза" sizes={sizes} dy={16} />
          </>
        )}

        {(Object.keys(NODES) as NodeId[]).map(id => {
          const n = NODES[id];
          const { hw, hh } = sizes[id];
          const missing = id === 'sporophyte' && noSporophyte;
          const dominant = (id === 'gametophyte' && g.dominant === 'n') || (id === 'sporophyte' && g.dominant === '2n');
          const sub = id === 'gametophyte' ? g.gametophyte : id === 'sporophyte' ? g.sporophyte ?? 'няма' : n.ploidy;
          return (
            <g key={id} opacity={missing ? 0.4 : 1}>
              <rect
                x={n.x - hw}
                y={n.y - hh}
                width={2 * hw}
                height={2 * hh}
                rx={8}
                strokeWidth={dominant ? 2.5 : 1.2}
                strokeDasharray={missing ? '4 3' : undefined}
                className={n.ploidy === 'n' ? 'fill-white stroke-sky-500 dark:fill-gray-800' : 'fill-white stroke-rose-500 dark:fill-gray-800'}
              />
              <text x={n.x} y={n.y - (hh > 20 ? 4 : 1)} fontSize={dominant ? 13 : 12} fontWeight={dominant ? 700 : 600} textAnchor="middle" fill="currentColor">
                {n.label}
              </text>
              <text x={n.x} y={n.y + (hh > 20 ? 13 : 12)} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
                {sub}
              </text>
            </g>
          );
        })}
      </LabSvg>

      <div className="grid grid-cols-2 gap-2 text-center text-xs sm:text-sm mt-2">
        <div className="rounded bg-gray-50 dark:bg-gray-900/40 p-2">
          появяват се преди
          <div className="font-semibold text-gray-900 dark:text-gray-100">{g.age}</div>
        </div>
        <div className="rounded bg-gray-50 dark:bg-gray-900/40 p-2">
          описани видове
          <div className="font-semibold text-gray-900 dark:text-gray-100">{g.species}</div>
        </div>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 mt-3">{g.note}</p>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 С по-дебела рамка е фазата, която преобладава – тази, която виждаш в природата. От водораслите към покритосеменните спорофитът
        расте, а гаметофитът се смалява до няколко клетки. Възрастите и броят на видовете са приблизителни.
      </p>
    </div>
  );
}
