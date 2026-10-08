import { useState } from 'react';
import { temperatureToRGB } from './light';
import { STARS, apparent } from './starData';
import { fmt, sci } from './terrestrialData';

const W = 640;
const H = 230;
const X0 = 40;
const X1 = 600;
const LOG_MIN = -1; // 0,1 pc
const LOG_MAX = 4; // 10 kpc
const AXIS_Y = 150;
const PC = 3.086e16; // m
const L_SUN = 3.828e26; // W

const dx = (logD: number) => X0 + ((logD - LOG_MIN) / (LOG_MAX - LOG_MIN)) * (X1 - X0);

function visibility(m: number) {
  if (m < -4) return { text: 'вижда се и денем', color: '#fde68a' };
  if (m < 1.5) return { text: 'сред най-ярките звезди', color: '#fde68a' };
  if (m < 4) return { text: 'вижда се и от града', color: '#bef264' };
  if (m < 6.5) return { text: 'с просто око на тъмно място', color: '#86efac' };
  if (m < 9.5) return { text: 'с бинокъл', color: '#7dd3fc' };
  if (m < 14) return { text: 'с любителски телескоп', color: '#93c5fd' };
  if (m < 27) return { text: 'само с голям телескоп', color: '#c4b5fd' };
  return { text: 'на границата на Хъбъл и JWST', color: '#f9a8d4' };
}

const formatDistance = (d: number) => (d < 1 ? `${fmt(d, 2)} pc` : d < 1000 ? `${fmt(d, d < 10 ? 2 : 0)} pc` : `${fmt(d / 1000, 1)} kpc`);

export default function DistanceLab() {
  const [starId, setStarId] = useState('sun');
  const s = STARS.find(x => x.id === starId)!;
  const [logD, setLogD] = useState(1);

  const d = 10 ** logD;
  const m = apparent(s.MV, d);
  const flux = (s.L * L_SUN) / (4 * Math.PI * (d * PC) ** 2);
  const vis = visibility(m);
  const realLog = Math.log10(s.d);

  const choose = (id: string) => {
    setStarId(id);
    const x = STARS.find(v => v.id === id)!;
    setLogD(x.id === 'sun' ? 1 : Math.min(LOG_MAX, Math.max(LOG_MIN, Math.log10(x.d))));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-teal-300 dark:border-teal-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Колко ярко ще изглежда?</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Изберете звезда и я преместете. Абсолютната величина M е нейна собствена характеристика – тя не се променя. Видимата величина m
        расте с 5 при всяко десетократно отдалечаване.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        {/* Наблюдател и ос на разстоянията */}
        <text x={X0 - 24} y={AXIS_Y + 4} fontSize="16">
          👁️
        </text>
        <line x1={X0} x2={X1} y1={AXIS_Y} y2={AXIS_Y} stroke="white" strokeOpacity="0.35" />
        {[0.1, 1, 10, 100, 1000, 10000].map(v => (
          <g key={v}>
            <line x1={dx(Math.log10(v))} x2={dx(Math.log10(v))} y1={AXIS_Y - 4} y2={AXIS_Y + 4} stroke="white" strokeOpacity="0.5" />
            <text x={dx(Math.log10(v))} y={AXIS_Y + 18} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
              {v < 1000 ? `${fmt(v, 1)} pc` : `${fmt(v / 1000, 0)} kpc`}
            </text>
          </g>
        ))}
        <line x1={dx(1)} x2={dx(1)} y1={AXIS_Y - 50} y2={AXIS_Y} stroke="#4ade80" strokeDasharray="3 3" />
        <text x={dx(1)} y={AXIS_Y - 54} fontSize="9" textAnchor="middle" fill="#86efac">
          10 pc: тук m = M
        </text>
        {s.id !== 'sun' && realLog >= LOG_MIN && realLog <= LOG_MAX && (
          <g>
            <path d={`M ${dx(realLog)} ${AXIS_Y + 24} l -4 7 l 8 0 z`} fill="#fbbf24" />
            <text x={dx(realLog)} y={AXIS_Y + 42} fontSize="9" textAnchor="middle" fill="#fbbf24">
              истинското място
            </text>
          </g>
        )}
        <circle cx={dx(logD)} cy={AXIS_Y} r="9" fill={temperatureToRGB(s.T)} />
        <circle cx={dx(logD)} cy={AXIS_Y} r="16" fill={temperatureToRGB(s.T)} fillOpacity="0.2" />

        {/* Резултати */}
        <g fontSize="11" fill="white" transform="translate(20, 26)">
          <text x={0} y={0} fontWeight="700" fontSize="13">
            {s.name} ({s.type})
          </text>
          <text x={0} y={20} fillOpacity="0.85">
            L = {s.L >= 1000 ? sci(s.L, 1) : fmt(s.L, s.L < 1 ? 4 : 1)} L☉ · M = {fmt(s.MV, 2)}
          </text>
          <text x={0} y={38} fillOpacity="0.85">
            d = {formatDistance(d)} = {fmt(d * 3.26, d < 1 ? 2 : 0)} светлинни години
          </text>
        </g>
        <g fontSize="11" fill="white" transform="translate(360, 26)">
          <text x={0} y={0} fontWeight="700" fontSize="15" fill={vis.color}>
            m = M + 5 lg(d / 10) = {fmt(m, 1)}
          </text>
          <text x={0} y={20} fill={vis.color}>
            {vis.text}
          </text>
          <text x={0} y={38} fillOpacity="0.7">
            поток: F = L / (4πd²) ≈ {sci(flux, 1)} W/m²
          </text>
        </g>
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">Разстояние: {formatDistance(d)}</label>
      <input type="range" min={LOG_MIN} max={LOG_MAX} step="0.01" value={logD} onChange={e => setLogD(Number(e.target.value))} className="w-full" />
      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {STARS.map(x => (
          <button
            key={x.id}
            onClick={() => choose(x.id)}
            className={`px-2 py-1 rounded text-xs border ${
              x.id === starId
                ? 'border-teal-500 bg-teal-50 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: temperatureToRGB(x.T) }} />
            {x.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {s.note} {s.id !== 'sun' && <>Истинското разстояние е {formatDistance(s.d)}, а видимата величина – {fmt(s.mV, 2)}.</>}
      </p>
    </div>
  );
}
