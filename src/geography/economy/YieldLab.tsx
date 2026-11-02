import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { VARIETIES, econOptimumN, yieldN, yieldP, yieldW } from './agricultureModel';

const NMAX = 250;
const YMAX = 10;
const X0 = 45;
const X1 = 450;
const T0 = 20;
const B0 = 290;
const xOf = (n: number) => X0 + (n / NMAX) * (X1 - X0);
const yOf = (y: number) => B0 - (Math.min(y, YMAX) / YMAX) * (B0 - T0);

// бъчвата на Либих
const BX = 520;
const BW = 30;
const BAR = [
  { key: 'N', label: 'азот', color: '#0ea5e9' },
  { key: 'W', label: 'вода', color: '#2563eb' },
  { key: 'P', label: 'фосфор', color: '#a855f7' },
] as const;

/** Добивът на пшеница според азота, водата и фосфора – закон на минимума и намаляваща възвръщаемост. */
export default function YieldLab() {
  const [vi, setVi] = useState(1);
  const [N, setN] = useState(120);
  const [W, setW] = useState(550);
  const [P, setP] = useState(25);
  const [ratio, setRatio] = useState(5);

  const v = VARIETIES[vi];
  const yN = yieldN(v, N);
  const yW = yieldW(W);
  const yP = yieldP(v, P);
  const y = Math.min(yN, yW, yP);
  const limit = y === yN ? 'азотът' : y === yW ? 'водата' : 'фосфорът';
  const gain10 = (Math.min(yieldN(v, N + 10), yW, yP) - y) * 1000;
  const cap = Math.min(yW, yP);
  const nOpt = econOptimumN(v, ratio, cap);

  const curve: string[] = [];
  const actual: string[] = [];
  for (let n = 0; n <= NMAX; n += 2) {
    curve.push(`${xOf(n).toFixed(1)},${yOf(yieldN(v, n)).toFixed(1)}`);
    actual.push(`${xOf(n).toFixed(1)},${yOf(Math.min(yieldN(v, n), cap)).toFixed(1)}`);
  }
  const vals = { N: yN, W: yW, P: yP };
  const bh = (t: number) => (Math.min(t, YMAX) / YMAX) * (B0 - T0);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 320" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {[0, 2, 4, 6, 8, 10].map(t => (
          <g key={t}>
            <line x1={X0} y1={yOf(t)} x2={X1} y2={yOf(t)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={X0 - 6} y={yOf(t) + 3} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {t}
            </text>
          </g>
        ))}
        <text x={X0 - 6} y={T0 - 8} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          t/ha
        </text>
        {[0, 50, 100, 150, 200, 250].map(n => (
          <text key={n} x={xOf(n)} y={B0 + 14} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {n}
          </text>
        ))}
        <text x={X1} y={B0 + 27} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          азотен тор, kg N/ha
        </text>
        {/* Таваните от водата и фосфора */}
        <line x1={X0} y1={yOf(yW)} x2={X1} y2={yOf(yW)} stroke="#2563eb" strokeDasharray="5 4" strokeWidth="1.5" />
        <text x={X1 - 2} y={yOf(yW) - 4} fontSize="10" textAnchor="end" fill="#2563eb">
          вода
        </text>
        <line x1={X0} y1={yOf(yP)} x2={X1} y2={yOf(yP)} stroke="#a855f7" strokeDasharray="2 3" strokeWidth="1.5" />
        <text x={X1 - 40} y={yOf(yP) - 4} fontSize="10" textAnchor="end" fill="#a855f7">
          фосфор
        </text>
        <polyline points={curve.join(' ')} fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="4 3" />
        <polyline points={actual.join(' ')} fill="none" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="3" />
        {nOpt !== null && (
          <line x1={xOf(nOpt)} y1={T0} x2={xOf(nOpt)} y2={B0} className="stroke-amber-500" strokeDasharray="3 3" />
        )}
        <circle cx={xOf(N)} cy={yOf(y)} r={5} className="fill-emerald-600 dark:fill-emerald-400 stroke-white" strokeWidth="1.5" />

        {/* Бъчвата на Либих */}
        <text x={BX + (BW * 3) / 2} y={T0 - 6} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          бъчвата на Либих
        </text>
        <rect x={BX} y={B0 - bh(y)} width={BW * 3} height={bh(y)} fill="#60a5fa" opacity="0.55" />
        {BAR.map((b, i) => (
          <g key={b.key}>
            <rect
              x={BX + i * BW + 2}
              y={B0 - bh(vals[b.key])}
              width={BW - 4}
              height={bh(vals[b.key])}
              fill="none"
              stroke={b.color}
              strokeWidth="2.5"
            />
            <text x={BX + i * BW + BW / 2} y={B0 + 14} fontSize="9" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              {b.label}
            </text>
          </g>
        ))}
        <line x1={BX - 4} y1={B0} x2={BX + BW * 3 + 4} y2={B0} className="stroke-gray-500" strokeWidth="2" />
      </LabSvg>
      <Buttons>
        {VARIETIES.map((vv, i) => (
          <DiagramButton key={vv.name} active={vi === i} onClick={() => setVi(i)}>
            {vv.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="N, kg" value={N} onChange={setN} min={0} max={NMAX} step={5} tone="blue" />
        <Slider label="вода" value={W} onChange={setW} min={150} max={700} step={10} tone="blue" />
        <Slider label="P, kg" value={P} onChange={setP} min={0} max={60} step={1} tone="violet" />
        <Slider label="цени" value={ratio} onChange={setRatio} min={2} max={15} step={0.5} tone="amber" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        N и P – внесен азот и фосфор (kg/ha); вода – валежи и напояване през сезона (mm); цени – колко килограма зърно струва 1 kg азот (около 5 при 1 €/kg N и
        200 €/t пшеница). Опростен модел: азот и фосфор – крива на Мичерлих, вода – около 20 kg зърно на всеки милиметър над 110 mm.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'добив', value: `${fmt(y, 1)} t/ha`, tone: 'emerald' },
            { label: 'ограничава', value: limit, tone: 'rose' },
            { label: '+10 kg N', value: `+${fmt(gain10)} kg зърно`, tone: 'blue' },
            { label: 'изгоден азот', value: nOpt === null ? '0' : `${fmt(nOpt)} kg/ha`, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone="blue">
        {y < yN - 0.05
          ? `Повече азот не помага – ограничава ${limit}. Бъчвата се пълни само до най-късата дъска.`
          : gain10 < ratio * 10
            ? `Всеки следващ килограм азот носи все по-малко: 10 kg N дават само ${fmt(gain10)} kg зърно, а струват колкото ${fmt(ratio * 10)} kg – вече е на загуба.`
            : 'Азотът се изплаща: 10 kg N носят повече зърно, отколкото струват. Добивът обаче расте все по-бавно.'}
      </Note>
    </div>
  );
}
