import { useState } from 'react';
import { fmt } from './terrestrialData';
import LabSvg from '~/LabSvg';

const W = 640;
const H = 260;
const MOON = 3474.8 / 384400; // ъгловият диаметър на Луната, rad
const MOON_PX = 90; // колко пиксела е Луната на чертежа
const RAD_DEG = 180 / Math.PI;

type Body = { id: string; name: string; size: number; dist: number; sizeText: string; distText: string; color: string };

/** Диаметър и разстояние в метри. За монетата разстоянието се задава с плъзгача. */
const BODIES: Body[] = [
  { id: 'sun', name: 'Слънцето', size: 1.3927e9, dist: 1.496e11, sizeText: '1 392 700 km', distText: '149,6 млн. km', color: '#fcd34d' },
  { id: 'moon', name: 'Луната', size: 3.4748e6, dist: 3.844e8, sizeText: '3475 km', distText: '384 400 km', color: '#e5e7eb' },
  { id: 'coin', name: 'Монета 2 cm', size: 0.02, dist: 1, sizeText: '2 cm', distText: '', color: '#d6a35c' },
  { id: 'jupiter', name: 'Юпитер', size: 1.42984e8, dist: 4.2 * 1.496e11, sizeText: '142 984 km', distText: '4,2 AU (най-близо)', color: '#fdba74' },
  { id: 'iss', name: 'МКС', size: 109, dist: 4.2e5, sizeText: '109 m', distText: '420 km (над главата)', color: '#93c5fd' },
];

/** Ъгъл в най-удобната единица. */
function angleText(rad: number) {
  const deg = rad * RAD_DEG;
  if (deg >= 1) return `${fmt(deg, 2)}°`;
  if (deg * 60 >= 1) return `${fmt(deg * 60, 1)}′`;
  return `${fmt(deg * 3600, 1)}″`;
}

export default function AngleDistanceLab() {
  const [id, setId] = useState('moon');
  const [coinDist, setCoinDist] = useState(1);
  const body = BODIES.find(b => b.id === id)!;
  const dist = id === 'coin' ? coinDist : body.dist;
  const alpha = body.size / dist; // малки ъгли: α = D / d
  const ratio = alpha / MOON;
  const r = Math.max(1.2, Math.min(95, (ratio * MOON_PX) / 2));

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-sky-300 dark:border-sky-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Колко голямо изглежда?</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Видимият размер зависи от отношението на диаметъра към разстоянието. Пунктирът е Луната – сравнете с нея.
      </p>

      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {/* Луната като еталон */}
        <circle cx={170} cy={130} r={MOON_PX / 2} fill="none" stroke="#e5e7eb" strokeOpacity="0.5" strokeDasharray="4 4" />
        <text x={170} y={200} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.6">
          Луната: {angleText(MOON)}
        </text>

        {/* Избраният обект в същия мащаб */}
        <circle cx={450} cy={130} r={r} fill={body.color} />
        {ratio > 2.3 && (
          <circle cx={450} cy={130} r={MOON_PX / 2} fill="none" stroke="#0f172a" strokeOpacity="0.7" strokeDasharray="4 4" />
        )}
        {r < 4 && <circle cx={450} cy={130} r={10} fill="none" stroke={body.color} strokeOpacity="0.6" />}
        <text x={450} y={250} fontSize="12" textAnchor="middle" fill="#fde68a" fontWeight="700">
          {body.name}: {angleText(alpha)}
        </text>

        <g fontSize="12" fill="white" transform="translate(16, 24)">
          <text x={0} y={0} fillOpacity="0.9">
            α = D / d = {body.sizeText} / {id === 'coin' ? `${fmt(coinDist, 2)} m` : body.distText}
          </text>
          <text x={0} y={20} fillOpacity="0.75">
            = {fmt(alpha, alpha < 0.001 ? 6 : 5)} rad = {angleText(alpha)}
          </text>
          <text x={0} y={40} fill="#86efac">
            {ratio > 0.97 && ratio < 1.03
              ? 'Точно колкото Луната!'
              : ratio > 1
                ? `${fmt(ratio, ratio < 10 ? 2 : 0)} пъти по-голямо от Луната`
                : `${fmt(1 / ratio, 1 / ratio < 10 ? 2 : 0)} пъти по-малко от Луната`}
          </text>
        </g>
      </LabSvg>

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {BODIES.map(b => (
          <button
            key={b.id}
            onClick={() => setId(b.id)}
            className={`px-2 py-1 rounded text-xs border ${
              b.id === id
                ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>
      {id === 'coin' && (
        <>
          <label className="block text-sm font-semibold mt-4 mb-1">Разстояние до монетата: {fmt(coinDist, 2)} m</label>
          <input
            type="range"
            min={0.3}
            max={5}
            step={0.01}
            value={coinDist}
            onChange={e => setCoinDist(Number(e.target.value))}
            className="w-full"
          />
        </>
      )}
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {id === 'sun' || id === 'moon'
          ? 'Слънцето е около 400 пъти по-голямо от Луната, но е и около 390 пъти по-далеч – затова на небето двете изглеждат почти еднакво големи. Това щастливо съвпадение прави пълните слънчеви затъмнения възможни.'
          : id === 'coin'
            ? 'Монета с диаметър 2 cm закрива точно Луната, когато е на около 2,2 m от окото. На изпъната ръка (около 60 cm) тя изглежда почти 4 пъти по-голяма от Луната.'
            : id === 'jupiter'
              ? 'Юпитер е 11 пъти по-голям от Земята, но е толкова далеч, че с просто око е само точка. Неговият диск (под 1′) се вижда едва с бинокъл или телескоп.'
              : 'Международната космическа станция е голяма колкото футболно игрище, но от 420 km изглежда под 1′ – като ярка точка, която прелита по небето за няколко минути.'}
      </p>
    </div>
  );
}
