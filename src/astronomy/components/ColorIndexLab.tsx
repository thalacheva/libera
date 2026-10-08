import { useState } from 'react';
import { WIEN, planck, temperatureToRGB, wavelengthToRGB } from './light';
import { STARS, bvFromTemperature, classOf, temperatureFromBV } from './starData';
import { fmt } from './terrestrialData';

const W = 640;
const H = 270;
const GX0 = 40;
const GX1 = 440;
const GY0 = 30;
const GY1 = 220;
const L_MIN = 150; // nm
const L_MAX = 1500;
const gx = (nm: number) => GX0 + ((nm - L_MIN) / (L_MAX - L_MIN)) * (GX1 - GX0);

// Филтрите B и V (средна дължина на вълната и ширина, nm)
const FILTERS = [
  { name: 'B', center: 445, width: 94, color: '#60a5fa' },
  { name: 'V', center: 551, width: 88, color: '#4ade80' },
];

export default function ColorIndexLab() {
  const [logT, setLogT] = useState(Math.log10(5772));
  const [pickedId, setPickedId] = useState<string | null>(null);
  const T = 10 ** logT;
  const bv = bvFromTemperature(T);
  const peak = (WIEN / T) * 1e9;
  const cls = classOf(T);

  // Кривата на Планк, нормирана към максимума в показания интервал
  const samples = Array.from({ length: 201 }, (_, i) => L_MIN + (i / 200) * (L_MAX - L_MIN));
  const values = samples.map(nm => planck(nm * 1e-9, T));
  const maxV = Math.max(...values);
  const gy = (v: number) => GY1 - (v / maxV) * (GY1 - GY0 - 10);
  const curve = samples.map((nm, i) => `${gx(nm)},${gy(values[i])}`).join(' ');
  const area = `${gx(L_MIN)},${GY1} ${curve} ${gx(L_MAX)},${GY1}`;

  const picked = STARS.find(s => s.id === pickedId);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Температурата от два филтъра</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Снимаме звездата през син (B) и зелено-жълт (V) филтър. Колко по-ярка е в единия, отколкото в другия, издава наклона на
        кривата на Планк – а оттам и температурата. Не ни трябва разстоянието!
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        {/* Видимата област */}
        {Array.from({ length: 34 }, (_, i) => 380 + i * 10).map(nm => (
          <rect key={nm} x={gx(nm)} y={GY1} width={gx(nm + 10) - gx(nm) + 0.5} height={8} fill={wavelengthToRGB(nm)} />
        ))}
        {/* Филтрите */}
        {FILTERS.map(f => (
          <g key={f.name}>
            <rect x={gx(f.center - f.width / 2)} y={GY0} width={gx(f.center + f.width / 2) - gx(f.center - f.width / 2)} height={GY1 - GY0} fill={f.color} fillOpacity="0.12" />
            <text x={gx(f.center)} y={GY0 - 6} fontSize="11" textAnchor="middle" fill={f.color} fontWeight="700">
              {f.name}
            </text>
          </g>
        ))}
        <polygon points={area} fill={temperatureToRGB(T)} fillOpacity="0.25" />
        <polyline points={curve} fill="none" stroke={temperatureToRGB(T)} strokeWidth="2" />
        {peak > L_MIN && peak < L_MAX && (
          <g>
            <line x1={gx(peak)} x2={gx(peak)} y1={GY0} y2={GY1} stroke="white" strokeOpacity="0.5" strokeDasharray="3 3" />
            <text x={gx(peak) + 4} y={GY0 + 12} fontSize="9" fill="white" fillOpacity="0.7">
              λ_max = {fmt(peak, 0)} nm
            </text>
          </g>
        )}
        {peak <= L_MIN && (
          <text x={GX0 + 4} y={GY0 + 12} fontSize="9" fill="white" fillOpacity="0.7">
            ← λ_max = {fmt(peak, 0)} nm (ултравиолетово)
          </text>
        )}
        <line x1={GX0} x2={GX1} y1={GY1} y2={GY1} stroke="white" strokeOpacity="0.4" />
        {[200, 500, 1000, 1500].map(nm => (
          <text key={nm} x={gx(nm)} y={GY1 + 22} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.6">
            {nm} nm
          </text>
        ))}

        {/* Звездата и числата */}
        <circle cx={540} cy={80} r={34} fill={temperatureToRGB(T)} />
        <circle cx={540} cy={80} r={46} fill={temperatureToRGB(T)} fillOpacity="0.15" />
        <g fontSize="11" fill="white" textAnchor="middle">
          <text x={540} y={145} fontSize="14" fontWeight="700">
            T = {fmt(T, 0)} K
          </text>
          <text x={540} y={165} fill="#fde68a" fontWeight="700">
            B − V = {bv >= 0 ? '+' : '−'}
            {fmt(Math.abs(bv), 2)}
          </text>
          <text x={540} y={183} fillOpacity="0.8">
            спектрален клас {cls.letter}
          </text>
          <text x={540} y={205} fontSize="10" fillOpacity="0.6">
            {bv < 0 ? 'по-ярка в синьо – гореща' : bv > 1 ? 'много по-ярка в жълто – студена' : 'малко по-ярка в жълто'}
          </text>
        </g>
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">Температура: {fmt(T, 0)} K</label>
      <input type="range" min={Math.log10(2500)} max={Math.log10(40000)} step="0.001" value={logT} onChange={e => setLogT(Number(e.target.value))} className="w-full" />

      <div className="mt-3">
        <p className="text-sm font-semibold mb-1 text-center">Измерено B − V на реални звезди – колко е T?</p>
        <div className="flex flex-wrap justify-center gap-1">
          {STARS.filter(s => s.id !== 'siriusb').map(s => (
            <button
              key={s.id}
              onClick={() => {
                setPickedId(s.id);
                setLogT(Math.log10(temperatureFromBV(s.bv)));
              }}
              className={`px-2 py-1 rounded text-xs border ${
                s.id === pickedId
                  ? 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {s.name} ({s.bv >= 0 ? '+' : '−'}
              {fmt(Math.abs(s.bv), 2)})
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {picked
          ? `${picked.name}: от B − V = ${fmt(picked.bv, 2)} формулата дава ~${fmt(Math.round(temperatureFromBV(picked.bv) / 100) * 100, 0)} K, а по-точните спектрални измервания – ${fmt(picked.T, 0)} K. Звездите не са идеални черни тела: тъмните линии в спектъра и прахът по пътя променят цвета им малко.`
          : 'Нулата на скалата е избрана така, че за Вега (~9600 K) B − V = 0. Горещите звезди имат отрицателен показател, а студените – положителен. Формулата е най-точна между ~4000 и ~10 000 K: при много горещите звезди почти цялото излъчване е в ултравиолетовото и B − V едва се променя.'}
      </p>
    </div>
  );
}
