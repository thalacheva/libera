import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Preset = { id: string; name: string; w: [number, number, number]; q0: number; note: string };

const PRESETS: Preset[] = [
  {
    id: 'lethal',
    name: 'вреден рецесивен',
    w: [1, 1, 0],
    q0: 0.5,
    note: 'Отборът премахва само хомозиготите aa. Докато a е чест, той намалява бързо, но когато стане рядък, почти всички копия са скрити в здрави хетерозиготи и спадът става много бавен: qₙ = q₀ / (1 + n·q₀).',
  },
  {
    id: 'moth',
    name: 'тъмна пеперуда',
    w: [1, 1, 0.7],
    q0: 0.99,
    note: 'Брезовата педя: алелът A за тъмни крила е доминантен. По опушените стволове светлите пеперуди aa се виждат и птиците ги изяждат по-често. Новият полезен доминантен алел се разпространява бързо, но не изтласква съвсем a.',
  },
  {
    id: 'recessive',
    name: 'полезен рецесивен',
    w: [0.8, 0.8, 1],
    q0: 0.03,
    note: 'Рядък полезен рецесивен алел дълго „не се вижда“ от отбора – почти няма хомозиготи aa. После изведнъж тръгва нагоре и бързо се фиксира. Обратното на тъмната пеперуда: там полезният доминантен алел тръгва веднага, но накрая забавя.',
  },
  {
    id: 'sickle',
    name: 'хетерозиготно предимство',
    w: [0.85, 1, 0.2],
    q0: 0.02,
    note: 'Сърповидноклетъчна анемия в малариен район: AA боледуват тежко от малария, aa – от анемия, хетерозиготите са най-приспособени. Честотата стига устойчиво равновесие q* = s/(s + t) и двата алела се запазват.',
  },
  {
    id: 'underdominance',
    name: 'хетерозиготен недостатък',
    w: [1, 0.8, 1],
    q0: 0.45,
    note: 'Когато хетерозиготите са най-слаби, равновесието при q = 0,5 е неустойчиво: по-честият алел измества другия. Пробвай q₀ = 0,55.',
  },
];

const GENS = 200;
const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',');

/** q в следващото поколение при приспособеност wAA, wAa, waa. */
function nextQ(q: number, [wAA, wAa, waa]: [number, number, number]) {
  const p = 1 - q;
  const mean = p * p * wAA + 2 * p * q * wAa + q * q * waa;
  return mean === 0 ? q : (q * (p * wAa + q * waa)) / mean;
}

// Графиката
const GX = 40;
const GW = 420;
const GY = 12;
const GH = 180;

/** Естествен отбор: как се мени честотата на алела a за 200 поколения при зададена приспособеност на генотиповете. */
export default function SelectionLab() {
  const [presetId, setPresetId] = useState('moth');
  const [w, setW] = useState<[number, number, number]>([1, 1, 0.7]);
  const [q0, setQ0] = useState(0.99);

  const qs = [q0];
  for (let g = 1; g <= GENS; g++) qs.push(nextQ(qs[g - 1], w));
  const [wAA, wAa, waa] = w;
  const meanW = (q: number) => (1 - q) ** 2 * wAA + 2 * (1 - q) * q * wAa + q * q * waa;

  // Равновесие при хетеро­зиготно предимство или недостатък
  const s = wAa - wAA;
  const t = wAa - waa;
  const equilibrium = (s > 0 && t > 0) || (s < 0 && t < 0) ? s / (s + t) : null;
  const stable = s > 0 && t > 0;

  const preset = PRESETS.find(p => p.id === presetId);
  const choose = (p: Preset) => {
    setPresetId(p.id);
    setW(p.w);
    setQ0(p.q0);
  };
  const setOne = (i: number, v: number) => {
    setPresetId('');
    setW(old => old.map((x, k) => (k === i ? v : x)) as [number, number, number]);
  };

  const gx = (g: number) => GX + (g / GENS) * GW;
  const gy = (q: number) => GY + GH - q * GH;
  const line = (vals: number[]) => vals.map((v, g) => `${gx(g).toFixed(1)},${gy(v).toFixed(1)}`).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton key={p.id} active={presetId === p.id} onClick={() => choose(p)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 226" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <line x1={GX} x2={GX + GW} y1={gy(0)} y2={gy(0)} className="stroke-gray-400" />
        <line x1={GX} x2={GX} y1={GY} y2={gy(0)} className="stroke-gray-400" />
        {[0, 0.25, 0.5, 0.75, 1].map(v => (
          <g key={v}>
            <line x1={GX} x2={GX + GW} y1={gy(v)} y2={gy(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={GX - 5} y={gy(v) + 4} fontSize="11" textAnchor="end" fill="currentColor">
              {fmt(v)}
            </text>
          </g>
        ))}
        {[0, 50, 100, 150, 200].map(g => (
          <text key={g} x={gx(g)} y={gy(0) + 15} fontSize="11" textAnchor="middle" fill="currentColor">
            {g}
          </text>
        ))}
        <text x={GX + GW} y={gy(0) + 30} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          поколение
        </text>
        {equilibrium !== null && (
          <g>
            <line x1={GX} x2={GX + GW} y1={gy(equilibrium)} y2={gy(equilibrium)} stroke="#7c3aed" strokeDasharray="6 4" strokeWidth="1.5" />
            <text x={GX + GW - 4} y={gy(equilibrium) - 5} fontSize="11" textAnchor="end" fill="#7c3aed">
              q* = {fmt(equilibrium, 3)} {stable ? '(устойчиво)' : '(неустойчиво)'}
            </text>
          </g>
        )}
        <polyline points={line(qs.map(q => 1 - q))} fill="none" stroke="#e11d48" strokeWidth="2" strokeDasharray="5 4" />
        <polyline points={line(qs)} fill="none" stroke="#2563eb" strokeWidth="2.5" />
        <polyline points={line(qs.map(meanW))} fill="none" stroke="#059669" strokeWidth="1.5" opacity={0.8} />
      </LabSvg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
        <span>
          <span className="inline-block w-5 h-0.5 align-middle mr-1 bg-blue-600" /> q – честота на a
        </span>
        <span>
          <span className="inline-block w-5 align-middle mr-1 border-t-2 border-dashed border-rose-600" /> p – честота на A
        </span>
        <span>
          <span className="inline-block w-5 h-0.5 align-middle mr-1 bg-emerald-600" /> w̄ – средна приспособеност
        </span>
      </div>

      <Sliders>
        <Slider label="wAA" value={wAA} onChange={v => setOne(0, v)} min={0} max={1} step={0.05} tone="rose" />
        <Slider label="wAa" value={wAa} onChange={v => setOne(1, v)} min={0} max={1} step={0.05} tone="violet" />
        <Slider label="waa" value={waa} onChange={v => setOne(2, v)} min={0} max={1} step={0.05} tone="blue" />
        <Slider
          label="q₀"
          value={q0}
          onChange={v => {
            setPresetId(old => (old === 'underdominance' ? old : ''));
            setQ0(v);
          }}
          min={0.01}
          max={0.99}
          step={0.01}
          tone="blue"
        />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'q след 10 пок.', value: fmt(qs[10], 3), tone: 'blue' },
            { label: 'след 50', value: fmt(qs[50], 3), tone: 'blue' },
            { label: 'след 200', value: fmt(qs[200], 3), tone: 'blue' },
            { label: 'w̄ накрая', value: fmt(meanW(qs[200]), 3), tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone="violet">
        {preset
          ? preset.note
          : wAA === wAa && wAa === waa
            ? 'Всички генотипове са еднакво приспособени – отбор няма и честотата не се мени (без дрейф и мутации това е равновесието на Харди–Вайнберг).'
            : 'Отборът не „иска“ нищо: той само увеличава дела на алела, чиито носители оставят средно повече потомство. Средната приспособеност w̄ (зелената линия) обикновено расте.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Приспособеността w е относителният брой оцелели потомци на генотипа (най-добрият има w = 1). Новата честота е{' '}
        q′ = q(p·wAa + q·waa) / w̄, където w̄ = p²wAA + 2pq·wAa + q²waa. Популацията е безкрайно голяма – без дрейф.
      </p>
    </div>
  );
}
