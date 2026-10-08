import { useState } from 'react';
import { fmt } from './terrestrialData';

const K_B = 1.381e-23; // J/K
const AMU = 1.661e-27; // kg

const W = 640;
const H = 300;
const X0 = 60;
const X1 = 620;
const Y0 = 30;
const Y1 = 250;

// Температурата на екзосферата – най-горния слой, от който молекулите могат да избягат
const BODIES = [
  { id: 'moon', name: 'Луна', escape: 2.38, T: 390, note: 'Дневната страна на Луната е гореща, а гравитацията ѝ – слаба: не може да задържи никакъв газ.' },
  { id: 'mercury', name: 'Меркурий', escape: 4.25, T: 600, note: 'По критерия Меркурий би задържал тежките газове. Но той е изгубил атмосферата си по други начини: слънчевият вятър, който е най-силен толкова близо до Слънцето, буквално я „издухва“, а удари на големи тела са я изхвърлили.' },
  { id: 'venus', name: 'Венера', escape: 10.36, T: 300, note: 'Задържа всичко освен водорода. Водата се е изпарила, ултравиолетовите лъчи са я разбили на H и O, а водородът е избягал – затова Венера е суха.' },
  { id: 'earth', name: 'Земя', escape: 11.19, T: 1000, note: 'Земята губи водород и хелий, но задържа азота, кислорода и водната пара. Водата е спасена и от студения слой над тропосферата – там парите кондензират и не стигат високо.' },
  { id: 'mars', name: 'Марс', escape: 5.03, T: 250, note: 'Термично Марс би задържал CO₂ и N₂, но без магнитно поле слънчевият вятър откъсва йони от горната атмосфера (измерено от сондата MAVEN). Така за милиарди години е изгубил по-голямата част от въздуха и водата си.' },
  { id: 'jupiter', name: 'Юпитер', escape: 59.5, T: 1000, note: 'Огромната маса задържа дори водорода и хелия – затова гигантите са запазили първичния газ, от който са се образували.' },
];

const GASES = [
  { formula: 'H₂', name: 'водород', m: 2 },
  { formula: 'He', name: 'хелий', m: 4 },
  { formula: 'CH₄', name: 'метан', m: 16 },
  { formula: 'H₂O', name: 'водна пара', m: 18 },
  { formula: 'N₂', name: 'азот', m: 28 },
  { formula: 'O₂', name: 'кислород', m: 32 },
  { formula: 'CO₂', name: 'въглероден диоксид', m: 44 },
];

/** Средна квадратична скорост на молекулите (km/s). */
const vrms = (T: number, m: number) => Math.sqrt((3 * K_B * T) / (m * AMU)) / 1000;

const V_MAX = 70; // km/s – горен край на вертикалната ос (логаритмична)
const V_MIN = 1;
const vy = (v: number) => Y1 - (Math.log10(Math.max(v, V_MIN) / V_MIN) / Math.log10(V_MAX / V_MIN)) * (Y1 - Y0);

export default function AtmosphereEscapeLab() {
  const [bodyIndex, setBodyIndex] = useState(3);
  const [T, setT] = useState(BODIES[3].T);
  const body = BODIES[bodyIndex];

  const choose = (i: number) => {
    setBodyIndex(i);
    setT(BODIES[i].T);
  };

  const band = (X1 - X0) / GASES.length;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-sky-300 dark:border-sky-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Кой газ ще остане?</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Стълбчето е 6 пъти средната скорост на молекулите. Ако е под линията на втората космическа скорост, газът остава за милиарди
        години. Леките и горещите молекули са най-бързи.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        {/* Скала */}
        {[1, 2, 5, 10, 20, 50].map(v => (
          <g key={v}>
            <line x1={X0} x2={X1} y1={vy(v)} y2={vy(v)} stroke="white" strokeOpacity="0.08" />
            <text x={X0 - 6} y={vy(v) + 4} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.6">
              {v}
            </text>
          </g>
        ))}
        <text x={14} y={(Y0 + Y1) / 2} fontSize="10" fill="white" fillOpacity="0.6" transform={`rotate(-90 14 ${(Y0 + Y1) / 2})`} textAnchor="middle">
          km/s (лог. скала)
        </text>

        {/* Стълбчетата */}
        {GASES.map((g, i) => {
          const v6 = 6 * vrms(T, g.m);
          const kept = v6 < body.escape;
          const x = X0 + i * band + band * 0.2;
          return (
            <g key={g.formula}>
              <rect x={x} y={vy(v6)} width={band * 0.6} height={Y1 - vy(v6)} rx="3" fill={kept ? '#22c55e' : '#ef4444'} fillOpacity="0.85" />
              <text x={x + band * 0.3} y={vy(v6) - 5} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.8">
                {fmt(v6, 1)}
              </text>
              <text x={x + band * 0.3} y={Y1 + 18} fontSize="12" textAnchor="middle" fill="white" fontWeight="600">
                {g.formula}
              </text>
              <text x={x + band * 0.3} y={Y1 + 32} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.6">
                {kept ? 'остава' : 'бяга'}
              </text>
            </g>
          );
        })}

        {/* Втора космическа скорост */}
        <line x1={X0} x2={X1} y1={vy(body.escape)} y2={vy(body.escape)} stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 4" />
        <text x={X1 - 4} y={vy(body.escape) - 6} fontSize="11" textAnchor="end" fill="#fbbf24">
          v₂ = {fmt(body.escape, 1)} km/s ({body.name})
        </text>
      </svg>

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {BODIES.map((b, i) => (
          <button
            key={b.id}
            onClick={() => choose(i)}
            className={`px-3 py-1 rounded text-sm border ${
              i === bodyIndex
                ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      <label className="block text-sm font-semibold mt-4 mb-1">
        Температура на горната атмосфера: {T} K {T !== body.T && <span className="font-normal text-gray-500">(реалистично ~{body.T} K)</span>}
      </label>
      <input type="range" min="50" max="2000" step="10" value={T} onChange={e => setT(Number(e.target.value))} className="w-full" />

      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{body.note}</p>
    </div>
  );
}
