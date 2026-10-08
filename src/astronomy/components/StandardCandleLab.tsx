import { useState } from 'react';
import { fmt } from './terrestrialData';

const W = 640;
const H = 250;
// Ос на разстоянията
const AX0 = 30;
const AX1 = 610;
const AY = 205;
const LOG_MIN = 0; // 1 pc
const LOG_MAX = 10; // 10 Gpc
const ax = (d: number) => AX0 + ((Math.log10(d) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * (AX1 - AX0);
// Малка графика на зависимостта
const PX0 = 330;
const PX1 = 610;
const PY0 = 24;
const PY1 = 140;
const M_LIMIT = 29; // най-слабото, което виждат JWST и Хъбъл при дълги експозиции

const LANDMARKS = [
  { d: 1.3, name: 'Проксима' },
  { d: 8200, name: 'център на Галактиката' },
  { d: 50000, name: 'Голям Магеланов облак' },
  { d: 765000, name: 'Андромеда' },
  { d: 16.5e6, name: 'куп Дева' },
  { d: 100e6, name: 'куп Кома' },
  { d: 3e9, name: 'далечни квазари' },
];

type Candle = {
  id: string;
  name: string;
  input?: { label: string; min: number; max: number; step: number; init: number; unit: string; log?: boolean };
  M: (x: number) => number;
  text: string;
};

const CANDLES: Candle[] = [
  {
    id: 'rrlyr',
    name: 'RR Лира',
    M: () => 0.6,
    text: 'Всички звезди тип RR Лира имат почти еднаква светимост (M_V ≈ +0,6), но са сравнително слаби. Стигат до съседните галактики.',
  },
  {
    id: 'cepheid',
    name: 'Цефеида',
    input: { label: 'Период', min: 0, max: 2, step: 0.01, init: 1, unit: 'дни', log: true },
    M: lgP => -2.43 * (lgP - 1) - 4.05,
    text: 'По периода намираме светимостта (Левит, Лекция 23). Хъбъл и JWST виждат цефеиди до ~40 Mpc.',
  },
  {
    id: 'trgb',
    name: 'Връх на червените гиганти',
    M: () => -4.05,
    text: 'Най-ярките червени гиганти, тъкмо преди хелиевия проблясък (Лекция 20), имат почти еднаква светимост в инфрачервено (M_I ≈ −4,05). Методът е независима проверка на цефеидите.',
  },
  {
    id: 'snia',
    name: 'Свръхнова Ia',
    input: { label: 'Спад на блясъка за 15 дни след максимума Δm₁₅', min: 0.8, max: 1.8, step: 0.01, init: 1.1, unit: 'mag' },
    M: dm15 => -19.3 + 0.78 * (dm15 - 1.1),
    text: 'В максимума свръхновата Ia е милиарди пъти по-ярка от Слънцето. Не всички са еднакви, но по-ярките угасват по-бавно (зависимост на Филипс, 1993) – по скоростта на угасване поправяме светимостта с точност ~5%.',
  },
  {
    id: 'tf',
    name: 'Спирална галактика (Тъли–Фишър)',
    input: { label: 'Скорост на въртене', min: 80, max: 350, step: 1, init: 220, unit: 'km/s' },
    M: v => -21 - 8 * (Math.log10(2 * v) - 2.5),
    text: 'По-масивните галактики се въртят по-бързо и са по-ярки. Скоростта на въртене се мери по разширението на радиолинията на водорода при 21 cm.',
  },
];

export default function StandardCandleLab() {
  const [cid, setCid] = useState('cepheid');
  const candle = CANDLES.find(c => c.id === cid)!;
  const [x, setX] = useState(candle.input?.init ?? 0);
  const [m, setM] = useState(20);
  const [A, setA] = useState(0);

  const M = candle.M(x);
  const mu = m - M - A;
  const d = 10 ** (mu / 5 + 1);
  const dMax = 10 ** ((M_LIMIT - M) / 5 + 1);

  const choose = (c: Candle) => {
    setCid(c.id);
    setX(c.input?.init ?? 0);
  };

  const fmtD = (pc: number) => (pc < 1e3 ? `${fmt(pc, 0)} pc` : pc < 1e6 ? `${fmt(pc / 1e3, 1)} kpc` : pc < 1e9 ? `${fmt(pc / 1e6, 1)} Mpc` : `${fmt(pc / 1e9, 2)} Gpc`);
  const inputText = candle.input ? (candle.input.log ? `${fmt(10 ** x, 1)} ${candle.input.unit}` : `${fmt(x, 2)} ${candle.input.unit}`) : '';

  // Графика M(вход)
  const curve = candle.input
    ? Array.from({ length: 51 }, (_, i) => {
        const v = candle.input!.min + (i / 50) * (candle.input!.max - candle.input!.min);
        return { v, M: candle.M(v) };
      })
    : [];
  const mLo = curve.length ? Math.min(...curve.map(c => c.M)) : 0;
  const mHi = curve.length ? Math.max(...curve.map(c => c.M)) : 1;
  const px = (v: number) => PX0 + ((v - candle.input!.min) / (candle.input!.max - candle.input!.min)) * (PX1 - PX0);
  const py = (MM: number) => PY0 + ((MM - mLo) / (mHi - mLo + 1e-9)) * (PY1 - PY0);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-emerald-300 dark:border-emerald-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Калкулатор на стандартни свещи</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Изберете вид свещ, задайте измереното (период, скорост на угасване…) и видимата величина. Ако знаем истинската светимост,
        разстоянието следва от m − M = 5 lg(d / 10 pc) + A.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {/* Резултат */}
        <g fontSize="11" fill="white" transform="translate(20, 34)">
          <text x={0} y={0} fontSize="13" fontWeight="700" fill="#6ee7b7">
            {candle.name}
          </text>
          <text x={0} y={22} fillOpacity="0.85">
            абсолютна величина M = {fmt(M, 2)}
          </text>
          <text x={0} y={40} fillOpacity="0.85">
            видима m = {fmt(m, 1)}, прах A = {fmt(A, 1)}
          </text>
          <text x={0} y={58} fillOpacity="0.85">
            m − M − A = {fmt(mu, 2)}
          </text>
          <text x={0} y={84} fontSize="16" fontWeight="700" fill="#fde68a">
            d ≈ {fmtD(d)}
          </text>
          <text x={0} y={104} fontSize="10" fillOpacity="0.6">
            = {d < 3e5 ? `${fmt(d * 3.26, 0)} светлинни години` : `${fmt((d * 3.26) / 1e6, 1)} млн. светлинни години`}
          </text>
          <text x={0} y={128} fontSize="10" fill="#6ee7b7">
            {dMax > 1e10 ? 'видима до края на наблюдаемата Вселена (там се намесва космологията)' : `JWST я вижда до ~${fmtD(dMax)} (m ≈ ${M_LIMIT})`}
          </text>
        </g>

        {/* Зависимост */}
        {candle.input && (
          <g>
            <rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
            <polyline points={curve.map(c => `${px(c.v)},${py(c.M)}`).join(' ')} fill="none" stroke="#6ee7b7" strokeWidth="2" />
            <circle cx={px(x)} cy={py(M)} r="5" fill="#fde68a" />
            <text x={PX0} y={PY0 - 6} fontSize="9" fill="white" fillOpacity="0.6">
              по-ярки ↑ (M)
            </text>
            <text x={PX1} y={PY1 + 12} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.6">
              {candle.input.label} →
            </text>
          </g>
        )}

        {/* Ос на разстоянията */}
        <line x1={AX0} x2={AX1} y1={AY} y2={AY} stroke="white" strokeOpacity="0.35" />
        <rect x={AX0} y={AY - 6} width={Math.max(0, Math.min(AX1, ax(dMax)) - AX0)} height={12} fill="#10b981" fillOpacity="0.2" />
        {[0, 2, 4, 6, 8, 10].map(p => (
          <g key={p}>
            <line x1={ax(10 ** p)} x2={ax(10 ** p)} y1={AY - 4} y2={AY + 4} stroke="white" strokeOpacity="0.5" />
            <text x={ax(10 ** p)} y={AY + 32} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.5">
              {fmtD(10 ** p)}
            </text>
          </g>
        ))}
        {LANDMARKS.map((l, i) => (
          <g key={l.name}>
            <circle cx={ax(l.d)} cy={AY} r="2.5" fill="#93c5fd" />
            <text x={ax(l.d)} y={AY + (i % 2 ? 18 : -10)} fontSize="8" textAnchor="middle" fill="#93c5fd" fillOpacity="0.8">
              {l.name}
            </text>
          </g>
        ))}
        {d >= 1 && d <= 1e10 && <path d={`M ${ax(d)} ${AY - 14} l -6 -10 l 12 0 z`} fill="#fde68a" />}
      </svg>

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {CANDLES.map(c => (
          <button
            key={c.id}
            onClick={() => choose(c)}
            className={`px-2 py-1 rounded text-xs border ${
              c.id === cid ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-3 gap-x-4">
        {candle.input && (
          <div>
            <label className="block text-sm font-semibold mt-3 mb-1">
              {candle.input.label}: {inputText}
            </label>
            <input type="range" min={candle.input.min} max={candle.input.max} step={candle.input.step} value={x} onChange={e => setX(Number(e.target.value))} className="w-full" />
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Видима величина m = {fmt(m, 1)}</label>
          <input type="range" min="0" max="29" step="0.1" value={m} onChange={e => setM(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Поглъщане от прах A = {fmt(A, 1)} mag</label>
          <input type="range" min="0" max="3" step="0.1" value={A} onChange={e => setA(Number(e.target.value))} className="w-full" />
        </div>
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">{candle.text}</p>
    </div>
  );
}
