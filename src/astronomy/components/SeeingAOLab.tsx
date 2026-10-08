import { useState } from 'react';
import { fmt } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 300;
const N = 56; // пиксели на страна
const FOV = 2; // ъглови секунди
const PIX = 250 / N;
const IX = 20;
const IY = 25;
const D = 8; // m
const ARCSEC = 206265;
const ACT = 0.2; // разстояние между задвижванията на деформируемото огледало, m
const RESID_NM = 150; // други грешки на вълновия фронт, nm

type Mode = 'short' | 'long' | 'ao';
const MODES: { k: Mode; name: string }[] = [
  { k: 'short', name: 'кратка експозиция' },
  { k: 'long', name: 'дълга експозиция' },
  { k: 'ao', name: 'с адаптивна оптика' },
];
const BANDS = [
  { name: 'видимо 0,55 µm', lam: 0.55e-6 },
  { name: 'инфрачервено 1,6 µm', lam: 1.6e-6 },
  { name: 'инфрачервено 2,2 µm', lam: 2.2e-6 },
];

function rnd(n: number) {
  const x = Math.sin(n * 78.233 + 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
const gauss = (n: number) => Math.sqrt(-2 * Math.log(rnd(n) + 1e-9)) * Math.cos(2 * Math.PI * rnd(n + 91));

export default function SeeingAOLab() {
  const [seeing500, setSeeing500] = useState(0.8);
  const [bi, setBi] = useState(2);
  const [mode, setMode] = useState<Mode>('short');
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  useAnimationFrame(playing, dt => setT(v => v + dt));

  const lam = BANDS[bi].lam;
  const r0_500 = (0.98 * 0.5e-6) / (seeing500 / ARCSEC);
  const r0 = r0_500 * (lam / 0.5e-6) ** 1.2;
  const seeing = ((0.98 * lam) / r0) * ARCSEC; // FWHM, ″
  const diff = ((1.03 * lam) / D) * ARCSEC; // FWHM, ″
  const sigma2 = 0.3 * (ACT / r0) ** (5 / 3) + ((2 * Math.PI * RESID_NM * 1e-9) / lam) ** 2;
  const strehl = Math.exp(-sigma2);
  const nSpeckles = Math.min(Math.round((D / r0) ** 2), 120);

  // Образ
  const frame = Math.floor(t * 12);
  const sS = seeing / 2.355;
  const sD = Math.max(diff / 2.355, (FOV / N) * 0.45);
  const tipX = 0.25 * sS * gauss(frame * 7 + 1);
  const tipY = 0.25 * sS * gauss(frame * 7 + 2);
  const speckles = Array.from({ length: nSpeckles }, (_, i) => ({
    x: tipX + sS * 0.9 * gauss(frame * 1000 + i * 3 + 5),
    y: tipY + sS * 0.9 * gauss(frame * 1000 + i * 3 + 6),
    a: 0.4 + rnd(frame * 1000 + i * 3 + 7),
  }));
  const img: number[] = [];
  let max = 0;
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const x = (i + 0.5 - N / 2) * (FOV / N);
      const y = (j + 0.5 - N / 2) * (FOV / N);
      let v = 0;
      if (mode === 'short') {
        for (const s of speckles) v += s.a * Math.exp(-((x - s.x) ** 2 + (y - s.y) ** 2) / (2 * sD * sD));
      } else {
        const halo = Math.exp(-(x * x + y * y) / (2 * sS * sS)) / (sS * sS);
        const core = Math.exp(-(x * x + y * y) / (2 * sD * sD)) / (sD * sD);
        v = mode === 'long' ? halo : strehl * core + (1 - strehl) * halo;
      }
      img.push(v);
      if (v > max) max = v;
    }
  }
  const peakGain = mode === 'ao' ? strehl * (sS / sD) ** 2 + (1 - strehl) : 1;

  // Профил: дълга експозиция срещу адаптивна оптика
  const PX0 = 300;
  const PX1 = 620;
  const PY0 = 60;
  const PY1 = 200;
  const prof = (k: 'long' | 'ao') =>
    Array.from({ length: 161 }, (_, i) => {
      const x = -1 + (i / 160) * 2;
      const halo = Math.exp(-(x * x) / (2 * sS * sS)) / (sS * sS);
      const core = Math.exp(-(x * x) / (2 * sD * sD)) / (sD * sD);
      const v = k === 'long' ? halo : strehl * core + (1 - strehl) * halo;
      const vmax = strehl / (sD * sD) + (1 - strehl) / (sS * sS);
      return `${PX0 + (i / 160) * (PX1 - PX0)},${PY1 - Math.sqrt(v / vmax) * (PY1 - PY0)}`;
    }).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-sky-300 dark:border-sky-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Трептенето на звездите и адаптивната оптика</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Звезда през 8-метров телескоп. Турбулентните слоеве на въздуха разбиват образа на десетки „спекли“, които подскачат стотици пъти в
        секунда. Деформируемо огледало може да ги изправи.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <rect x={IX} y={IY} width={N * PIX} height={N * PIX} fill="black" />
        {img.map((v, k) => {
          const b = Math.sqrt(v / max);
          if (b < 0.03) return null;
          const c = Math.round(255 * b);
          return <rect key={k} x={IX + (k % N) * PIX} y={IY + Math.floor(k / N) * PIX} width={PIX + 0.3} height={PIX + 0.3} fill={`rgb(${c}, ${Math.round(c * 0.95)}, ${Math.round(c * 0.85)})`} />;
        })}
        <line x1={IX + 10} x2={IX + 10 + (0.5 / FOV) * N * PIX} y1={IY + N * PIX - 10} y2={IY + N * PIX - 10} stroke="white" strokeWidth="2" />
        <text x={IX + 10} y={IY + N * PIX - 15} fontSize="9" fill="white" fillOpacity="0.8">
          0,5″
        </text>
        <text x={IX + (N * PIX) / 2} y={IY + N * PIX + 16} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.7">
          {MODES.find(m => m.k === mode)!.name}
        </text>

        <rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        <text x={PX0} y={PY0 - 8} fontSize="10" fill="white" fillOpacity="0.7">
          профил на образа (√ на яркостта)
        </text>
        <polyline points={prof('long')} fill="none" stroke="#f87171" strokeWidth="2" />
        <polyline points={prof('ao')} fill="none" stroke="#7dd3fc" strokeWidth="2" />
        <text x={PX1 - 6} y={PY0 + 14} fontSize="9" textAnchor="end" fill="#f87171">
          без адаптивна оптика
        </text>
        <text x={PX1 - 6} y={PY0 + 28} fontSize="9" textAnchor="end" fill="#7dd3fc">
          с адаптивна оптика
        </text>
        <text x={PX0} y={PY1 + 12} fontSize="8" fill="white" fillOpacity="0.5">
          −1″
        </text>
        <text x={PX1} y={PY1 + 12} fontSize="8" textAnchor="end" fill="white" fillOpacity="0.5">
          +1″
        </text>
        <g fontSize="11" fill="white" transform={`translate(${PX0}, ${PY1 + 34})`}>
          <text x={0} y={0} fillOpacity="0.85">
            атмосфера (seeing): {fmt(seeing, 2)}″ · дифракция: {fmt(diff, 3)}″
          </text>
          <text x={0} y={18} fillOpacity="0.85">
            r₀ = {fmt(r0 * 100, 0)} cm · ~{fmt(Math.round((D / r0) ** 2), 0)} спекли
          </text>
          <text x={0} y={36} fill="#7dd3fc" fontWeight="700">
            Strehl = {fmt(strehl * 100, 0)}%{mode === 'ao' ? ` · пикът е ${fmt(peakGain, 0)}× по-ярък` : ''}
          </text>
        </g>
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">Качество на атмосферата (seeing при 0,5 µm): {fmt(seeing500, 2)}″</label>
      <input type="range" min="0.4" max="2.5" step="0.01" value={seeing500} onChange={e => setSeeing500(Number(e.target.value))} className="w-full" />
      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        <button onClick={() => setPlaying(v => !v)} className="px-4 py-1 rounded bg-sky-600 text-white text-sm hover:bg-sky-700">
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
        {MODES.map(m => (
          <button
            key={m.k}
            onClick={() => setMode(m.k)}
            className={`px-2 py-1 rounded text-xs border ${
              m.k === mode ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {m.name}
          </button>
        ))}
        {BANDS.map((b, i) => (
          <button
            key={b.name}
            onClick={() => setBi(i)}
            className={`px-2 py-1 rounded text-xs border ${
              i === bi ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {mode === 'short'
          ? 'Всяко „петънце“ е образ с дифракционна острота, но атмосферата ги разпилява. Пуснете анимацията: така изглежда звездата за милисекунди.'
          : mode === 'long'
            ? 'За една секунда спеклите се размазват в петно с ширина seeing – около 1″, колкото при 10-сантиметров телескоп. 8-метровото огледало събира много повече светлина, но не вижда по-остро.'
            : 'Сензор измерва изкривяването на вълновия фронт от ярка звезда (или лазерна „изкуствена звезда“), а деформируемо огледало с хиляди задвижвания се извива ~1000 пъти в секунда. Работи най-добре в инфрачервено, където турбулентността пречи по-малко – затова Strehl там е много по-голям.'}
      </p>
    </div>
  );
}
