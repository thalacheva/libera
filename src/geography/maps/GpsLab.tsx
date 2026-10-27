import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

/** Скорост на светлината в km за микросекунда. */
const C_KM_US = 0.3;
const X0 = 20;
const Y0 = 6;
const K = 6; // px на km
const W_KM = 100;
const H_KM = 54;
const RECEIVER = { x: 58, y: 34 };
/** Часовникът на приемника изостава с 40 µs – това е 12 km грешка в разстоянията. */
const TRUE_BIAS = 40;
/** Грешки в измерените разстояния (атмосфера, отражения), km. */
const NOISE = [1.4, -1.1, 0.9];

type Pt = { x: number; y: number };
const GEOMETRIES: { id: string; name: string; sats: Pt[] }[] = [
  {
    id: 'spread',
    name: 'разпръснати спътници',
    sats: [
      { x: 10, y: 8 },
      { x: 92, y: 12 },
      { x: 40, y: 50 },
    ],
  },
  {
    id: 'cluster',
    name: 'спътници в една посока',
    sats: [
      { x: 30, y: 6 },
      { x: 42, y: 3 },
      { x: 54, y: 6 },
    ],
  },
];

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

/** Точката, която най-добре пасва на трите окръжности (метод на Гаус–Нютон). */
function fit(sats: Pt[], r: number[]) {
  let p = { x: 50, y: 30 };
  for (let it = 0; it < 50; it++) {
    let a11 = 0;
    let a12 = 0;
    let a22 = 0;
    let b1 = 0;
    let b2 = 0;
    sats.forEach((s, i) => {
      const d = Math.max(dist(p, s), 1e-6);
      const ux = (p.x - s.x) / d;
      const uy = (p.y - s.y) / d;
      const e = d - r[i];
      a11 += ux * ux;
      a12 += ux * uy;
      a22 += uy * uy;
      b1 += ux * e;
      b2 += uy * e;
    });
    const det = a11 * a22 - a12 * a12;
    if (Math.abs(det) < 1e-12) break;
    const dx = (a22 * b1 - a12 * b2) / det;
    const dy = (a11 * b2 - a12 * b1) / det;
    p = { x: p.x - dx, y: p.y - dy };
    if (Math.hypot(dx, dy) < 1e-7) break;
  }
  const rms = Math.sqrt(sats.reduce((s, sat, i) => s + (dist(p, sat) - r[i]) ** 2, 0) / sats.length);
  return { p, rms };
}

/** GPS в равнина: разстояния по времето на сигнала, грешка в часовника и разположение на спътниците. */
export default function GpsLab() {
  const [g, setG] = useState(0);
  const [bias, setBias] = useState(0);
  const [noise, setNoise] = useState(false);
  const sats = GEOMETRIES[g].sats;

  // Измерените „псевдоразстояния“: истинското + изоставането на часовника (+ шум), след поправката от плъзгача
  const r = sats.map((s, i) => dist(RECEIVER, s) + C_KM_US * (TRUE_BIAS - bias) + (noise ? NOISE[i] : 0));
  const { p, rms } = fit(sats, r);
  const err = dist(p, RECEIVER);
  const X = (x: number) => X0 + x * K;
  const Y = (y: number) => Y0 + y * K;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 340" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <clipPath id="gps-box">
            <rect x={X0} y={Y0} width={W_KM * K} height={H_KM * K} />
          </clipPath>
        </defs>
        <rect x={X0} y={Y0} width={W_KM * K} height={H_KM * K} className="fill-emerald-50 stroke-gray-300 dark:fill-gray-900 dark:stroke-gray-600" />
        {Array.from({ length: 11 }, (_, i) => i * 10).map(v => (
          <line key={`v${v}`} x1={X(v)} y1={Y0} x2={X(v)} y2={Y(H_KM)} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="0.6" />
        ))}
        {Array.from({ length: 6 }, (_, i) => i * 10).map(v => (
          <line key={`h${v}`} x1={X0} y1={Y(v)} x2={X(W_KM)} y2={Y(v)} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="0.6" />
        ))}
        <g clipPath="url(#gps-box)">
          {sats.map((s, i) => (
            <circle key={i} cx={X(s.x)} cy={Y(s.y)} r={Math.max(0, r[i]) * K} fill="none" className={['stroke-sky-600', 'stroke-amber-600', 'stroke-violet-600'][i]} strokeWidth="1.8" />
          ))}
        </g>
        {sats.map((s, i) => (
          <g key={i}>
            <rect x={X(s.x) - 7} y={Y(s.y) - 4} width={14} height={8} rx={1} className={['fill-sky-600', 'fill-amber-600', 'fill-violet-600'][i]} />
            <line x1={X(s.x) - 13} y1={Y(s.y)} x2={X(s.x) + 13} y2={Y(s.y)} className={['stroke-sky-600', 'stroke-amber-600', 'stroke-violet-600'][i]} strokeWidth="3" />
          </g>
        ))}
        <circle cx={X(RECEIVER.x)} cy={Y(RECEIVER.y)} r={5} className="fill-none stroke-gray-900 dark:stroke-white" strokeWidth="2" />
        <text x={X(RECEIVER.x) + 8} y={Y(RECEIVER.y) + 16} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
          истинско място
        </text>
        <circle cx={X(p.x)} cy={Y(p.y)} r={4} className="fill-rose-600" />
        <text x={X(p.x) + 7} y={Y(p.y) - 6} fontSize="11" fontWeight="bold" className="fill-rose-700 dark:fill-rose-300">
          изчислено
        </text>
        <line x1={X(0)} y1={Y(H_KM) + 14} x2={X(10)} y2={Y(H_KM) + 14} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="2" />
        <text x={X(12)} y={Y(H_KM) + 18} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          10 km
        </text>
      </LabSvg>

      <Buttons>
        {GEOMETRIES.map((x, i) => (
          <DiagramButton key={x.id} active={g === i} onClick={() => setG(i)}>
            {x.name}
          </DiagramButton>
        ))}
        <DiagramButton active={noise} onClick={() => setNoise(!noise)}>
          ☁️ Грешки от атмосферата
        </DiagramButton>
      </Buttons>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">Плъзгачът задава поправката на часовника на приемника.</p>
      <Sliders>
        <Slider label="Δt, µs" value={bias} onChange={setBias} min={0} max={80} step={1} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'часовникът още греши с', value: `${TRUE_BIAS - bias} µs = ${fmt(Math.abs(TRUE_BIAS - bias) * C_KM_US, 1)} km` },
            { label: 'окръжностите се разминават с', value: `${fmt(rms, 2)} km` },
            { label: 'грешка на мястото', value: `${fmt(err, 2)} km`, tone: 'rose' },
          ]}
        />
      </div>
      <Note tone={rms < 0.05 ? 'emerald' : 'amber'}>
        {rms < 0.05
          ? 'Трите окръжности се срещат в една точка – часовникът е поправен.'
          : noise
            ? 'С грешките от атмосферата окръжностите никога не се срещат точно. Намери поправката, при която разминаването е най-малко, и сравни двете разположения на спътниците.'
            : 'Нагласи поправката на часовника така, че трите окръжности да се срещнат в една точка.'}
      </Note>
    </div>
  );
}
