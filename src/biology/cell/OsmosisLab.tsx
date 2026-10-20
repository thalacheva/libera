import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

// Опит: картофени пръчици стоят 24 h в разтвори на захароза. Изотоничната концентрация в модела е 0,28 mol/L.
const ISO = 0.28;
const CONCS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1];
const R = 0.00831; // L·MPa/(mol·K)
const T = 293; // K, 20 °C

const hash = (i: number) => {
  const x = Math.sin(i * 78.233 + 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
/** Промяна на масата, %: приблизително права, която не надхвърля граници (стената / плазмолизата), плюс „грешка от измерването“. */
const change = (c: number, i: number) => Math.max(-28, Math.min(15, -40 * (c - ISO))) + (hash(i) - 0.5) * 2.4;
const mass0 = (i: number) => Math.round((2.4 + hash(i + 50) * 0.3) * 100) / 100;
const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',').replace('-', '−');

// Графиката
const GX = 50;
const GW = 260;
const GY = 16;
const GH = 190;
const gx = (c: number) => GX + c * GW;
const gy = (p: number) => GY + ((20 - p) / 50) * GH; // от +20% до −30%

/** Осмоза в картоф: в кой разтвор пръчиците нито поемат, нито губят вода? */
export default function OsmosisLab() {
  const [tested, setTested] = useState<number[]>([]);
  const [fit, setFit] = useState(false);
  const [last, setLast] = useState<number | null>(null);

  const points = tested.map(i => ({ c: CONCS[i], p: change(CONCS[i], i), m0: mass0(i), i }));
  // Права по метода на най-малките квадрати
  let line: { a: number; b: number } | null = null;
  if (fit && points.length >= 3) {
    const n = points.length;
    const sx = points.reduce((s, q) => s + q.c, 0);
    const sy = points.reduce((s, q) => s + q.p, 0);
    const sxx = points.reduce((s, q) => s + q.c * q.c, 0);
    const sxy = points.reduce((s, q) => s + q.c * q.p, 0);
    const a = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    line = { a, b: (sy - a * sx) / n };
  }
  const iso = line ? -line.b / line.a : null;
  const lastP = last === null ? null : change(CONCS[last], last);

  const test = (i: number) => {
    setTested(t => (t.includes(i) ? t : [...t, i].sort((p, q) => p - q)));
    setLast(i);
  };

  // Растителната клетка вдясно: вакуолата и цитоплазмата се свиват при загуба на вода
  const shrink = lastP === null ? 0 : Math.max(0, Math.min(1, -lastP / 25));
  const swell = lastP === null ? 0 : Math.max(0, Math.min(1, lastP / 12));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 240" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Оси */}
        <line x1={GX} x2={GX + GW} y1={gy(0)} y2={gy(0)} className="stroke-gray-400" />
        <line x1={GX} x2={GX} y1={GY} y2={GY + GH} className="stroke-gray-400" />
        {[20, 10, 0, -10, -20, -30].map(p => (
          <text key={p} x={GX - 6} y={gy(p) + 4} fontSize="11" textAnchor="end" fill="currentColor">
            {p > 0 ? `+${p}` : String(p).replace('-', '−')}%
          </text>
        ))}
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map(c => (
          <text key={c} x={gx(c)} y={GY + GH + 16} fontSize="11" textAnchor="middle" fill="currentColor">
            {fmt(c, 1)}
          </text>
        ))}
        <text x={GX + GW} y={GY + GH + 32} fontSize="11" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          захароза, mol/L
        </text>
        {line && (
          <line x1={gx(0)} x2={gx(1)} y1={gy(line.b)} y2={gy(line.a + line.b)} stroke="#e11d48" strokeWidth="2" strokeDasharray="6 4" />
        )}
        {iso !== null && iso > 0 && iso < 1 && (
          <g>
            <circle cx={gx(iso)} cy={gy(0)} r="5" fill="none" stroke="#e11d48" strokeWidth="2" />
            <text x={gx(iso) + 8} y={gy(0) - 8} fontSize="12" fontWeight="700" fill="#e11d48">
              {fmt(iso)} mol/L
            </text>
          </g>
        )}
        {points.map(q => (
          <circle key={q.i} cx={gx(q.c)} cy={gy(q.p)} r="5" fill={q.i === last ? '#2563eb' : '#64748b'} />
        ))}

        {/* Клетка от картофа при последния разтвор */}
        <g transform="translate(350 40)">
          <rect x={0} y={0} width={110} height={150} rx={8} fill="#fef9c3" stroke="#a16207" strokeWidth="4" />
          <rect
            x={6 + shrink * 22}
            y={6 + shrink * 30}
            width={98 - shrink * 44}
            height={138 - shrink * 60}
            rx={8 + shrink * 20}
            fill="#ecfccb"
            stroke="#be123c"
            strokeWidth="2"
          />
          <rect
            x={18 + shrink * 28}
            y={18 + shrink * 36}
            width={74 - shrink * 56}
            height={114 - shrink * 72}
            rx={14 + shrink * 10}
            fill="#bae6fd"
            stroke="#0284c7"
            strokeWidth={1.5 + swell}
          />
          <text x={55} y={172} fontSize="12" textAnchor="middle" fill="currentColor">
            {lastP === null ? 'клетка от картофа' : lastP < -3 ? 'плазмолиза' : lastP > 3 ? 'стегната (тургор)' : 'почти без промяна'}
          </text>
        </g>
      </LabSvg>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">Потопи пръчица в разтвор (mol/L захароза):</p>
      <Buttons>
        {CONCS.map((c, i) => (
          <DiagramButton key={c} active={tested.includes(i)} onClick={() => test(i)}>
            {fmt(c, 1)}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={fit} onClick={() => setFit(!fit)}>
          📈 начертай права
        </DiagramButton>
        <DiagramButton
          onClick={() => {
            setTested([]);
            setFit(false);
            setLast(null);
          }}
        >
          Отначало
        </DiagramButton>
      </Buttons>

      {points.length > 0 && (
        <div className="overflow-x-auto mt-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-xs sm:text-sm border-collapse tabular-nums">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60">
                <th className="px-3 py-1.5 text-left">c, mol/L</th>
                <th className="px-3 py-1.5 text-left">маса преди, g</th>
                <th className="px-3 py-1.5 text-left">маса след, g</th>
                <th className="px-3 py-1.5 text-left">промяна</th>
              </tr>
            </thead>
            <tbody>
              {points.map(q => (
                <tr key={q.i} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-3 py-1">{fmt(q.c, 1)}</td>
                  <td className="px-3 py-1">{fmt(q.m0)}</td>
                  <td className="px-3 py-1">{fmt(q.m0 * (1 + q.p / 100))}</td>
                  <td className="px-3 py-1">{q.p > 0 ? '+' : ''}{fmt(q.p, 1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Note tone={iso !== null ? 'emerald' : 'violet'}>
        {iso !== null
          ? `Правата пресича нулата при ≈ ${fmt(iso)} mol/L – това е изотоничният разтвор. Водният потенциал на картофа е ≈ −cRT = ${fmt(-iso * R * T)} MPa.`
          : fit
            ? 'За права са нужни поне 3 точки.'
            : 'В разреден разтвор пръчицата поема вода и натежава, в концентриран – губи вода. Изпробвай няколко разтвора и начертай права.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Промяната е в проценти от началната маса – така пръчици с различна маса могат да се сравняват. Точките не лягат точно на правата:
        в истински опит има грешки при подсушаване и претегляне. Затова се пробват повече разтвори.
      </p>
    </div>
  );
}
