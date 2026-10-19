import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Method = 'C' | 'K';
const T_C = 5730; // години
const T_K = 1.248; // милиарда години
const EC = 0.1072; // дял на ⁴⁰K, който се превръща в ⁴⁰Ar

// Примерни проби: делът на ¹⁴C е подбран да съответства на публикуваната възраст (закръглено)
const SAMPLES_C: { name: string; pct: number }[] = [
  { name: 'свитък от Мъртво море', pct: 78 },
  { name: 'Йоци – ледения човек', pct: 52.7 },
  { name: 'Варненски некропол', pct: 45.8 },
  { name: 'въглен от пещерата Ласко', pct: 12.8 },
  { name: 'кост от мамут', pct: 2.1 },
];
const SAMPLES_K: { name: string; ratio: number }[] = [
  { name: 'базалт, ~17 млн. години', ratio: 0.001 },
  { name: 'гранит, ~1 млрд. години', ratio: 0.08 },
  { name: 'лунен базалт, ~3,5 млрд.', ratio: 0.64 },
];

const fmt = (v: number, d = 1) => v.toLocaleString('bg-BG', { maximumFractionDigits: d, minimumFractionDigits: 0 });

// Чертеж: остават N/N₀ в зависимост от времето в периоди на полуразпадане (0…6)
const X0 = 50;
const X1 = 450;
const Y0 = 20;
const Y1 = 190;
const PERIODS = 6;
const px = (k: number) => X0 + ((X1 - X0) * k) / PERIODS;
const py = (f: number) => Y1 - (Y1 - Y0) * f;

/** Датиране: от измерения дял на останалия изотоп (или отношението Ar/K) – възрастта. */
export default function DatingLab() {
  const [method, setMethod] = useState<Method>('C');
  const [pct, setPct] = useState(52.7);
  const [ratio, setRatio] = useState(0.08);

  // k – изминали периоди на полуразпадане; f – останала част от изходния изотоп
  let k: number;
  let f: number;
  let age: string;
  if (method === 'C') {
    f = pct / 100;
    k = Math.log2(1 / f);
    age = `${fmt(Math.round((k * T_C) / 10) * 10, 0)} години`;
  } else {
    // ⁴⁰Ar/⁴⁰K = EC · (2^k − 1) ⇒ 2^k = 1 + ratio/EC
    k = Math.log2(1 + ratio / EC);
    f = 2 ** -k;
    const t = k * T_K;
    age = t < 0.1 ? `${fmt(t * 1000, 0)} милиона години` : `${fmt(t, 2)} милиарда години`;
  }
  const curve = Array.from({ length: 121 }, (_, i) => {
    const kk = (i / 120) * PERIODS;
    return `${i ? 'L' : 'M'} ${px(kk).toFixed(1)} ${py(2 ** -kk).toFixed(1)}`;
  }).join(' ');
  const kk = Math.min(k, PERIODS);
  const tooOld = method === 'C' && pct < 1;
  const unit = method === 'C' ? T_C : T_K;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={method === 'C'} onClick={() => setMethod('C')}>
          радиовъглерод ¹⁴C
        </DiagramButton>
        <DiagramButton active={method === 'K'} onClick={() => setMethod('K')}>
          калий-аргон ⁴⁰K → ⁴⁰Ar
        </DiagramButton>
      </Buttons>
      <div className="flex flex-wrap justify-center gap-1.5 mt-2">
        {method === 'C'
          ? SAMPLES_C.map(s => (
              <DiagramButton key={s.name} active={pct === s.pct} onClick={() => setPct(s.pct)}>
                {s.name}
              </DiagramButton>
            ))
          : SAMPLES_K.map(s => (
              <DiagramButton key={s.name} active={ratio === s.ratio} onClick={() => setRatio(s.ratio)}>
                {s.name}
              </DiagramButton>
            ))}
      </div>

      <LabSvg viewBox="0 0 480 228" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {/* оси и деления */}
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} className="stroke-gray-400" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} className="stroke-gray-400" />
        {Array.from({ length: PERIODS + 1 }, (_, i) => (
          <g key={i}>
            <line x1={px(i)} y1={Y1} x2={px(i)} y2={Y1 + 4} className="stroke-gray-400" />
            <text x={px(i)} y={Y1 + 16} fontSize="10" textAnchor="middle" className="fill-gray-500">
              {method === 'C' ? fmt(i * T_C, 0) : fmt(i * T_K, 2)}
            </text>
          </g>
        ))}
        <text x={(X0 + X1) / 2} y={Y1 + 32} fontSize="11" textAnchor="middle" className="fill-current">
          {method === 'C' ? 'възраст, години' : 'възраст, милиарда години'}
        </text>
        {[1, 0.5, 0.25].map(v => (
          <g key={v}>
            <line x1={X0 - 4} y1={py(v)} x2={X0} y2={py(v)} className="stroke-gray-400" />
            <text x={X0 - 7} y={py(v) + 4} fontSize="10" textAnchor="end" className="fill-gray-500">
              {v * 100}%
            </text>
          </g>
        ))}
        <path d={curve} fill="none" className="stroke-sky-500" strokeWidth="2.5" />
        {/* измерената точка */}
        <line x1={X0} y1={py(f)} x2={px(kk)} y2={py(f)} className="stroke-amber-500" strokeDasharray="4 3" />
        <line x1={px(kk)} y1={py(f)} x2={px(kk)} y2={Y1} className="stroke-amber-500" strokeDasharray="4 3" />
        {k <= PERIODS && <circle cx={px(kk)} cy={py(f)} r={6} className="fill-amber-500" />}
        <text x={X1} y={Y0 + 10} fontSize="11" textAnchor="end" className="fill-sky-600 dark:fill-sky-400">
          {method === 'C' ? 'остава ¹⁴C (спрямо живия организъм)' : 'остава ⁴⁰K'}
        </text>
      </LabSvg>

      <Sliders>
        {method === 'C' ? (
          <Slider label="¹⁴C, %" value={pct} onChange={setPct} min={0.5} max={100} step={0.1} tone="amber" />
        ) : (
          <Slider label="Ar/K" value={ratio} onChange={setRatio} min={0.001} max={1.2} step={0.001} tone="amber" />
        )}
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'изминали периоди:', value: fmt(k, 2) },
            { label: 'период на полуразпадане:', value: method === 'C' ? `${fmt(unit, 0)} години` : `${fmt(unit, 3)} млрд. години` },
            { label: 'възраст:', value: age, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={tooOld ? 'amber' : 'emerald'}>
        {tooOld
          ? 'Под около 1% от изходния ¹⁴C измерването става много неточно – радиовъглеродният метод работи до около 50 000 години.'
          : method === 'C'
            ? `t = T · log₂(N₀/N) = ${fmt(T_C, 0)} · log₂(100 / ${fmt(pct)}) ≈ ${age}.`
            : `От ⁴⁰K към ⁴⁰Ar отиват около 10,7% от разпаданията, затова 2^(t/T) = 1 + (Ar/K) : 0,1072.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Пробите са примерни – делът е подбран според публикуваните възрасти, а истинските лаборатории внасят и поправки (калибровъчни
        криви за ¹⁴C, загуба на аргон от скалата). Радиовъглеродът датира останки от живи организми до около 50 000 години, а калий-аргоновият
        метод – вулканични скали от стотици хиляди до милиарди години.
      </p>
    </div>
  );
}
