import { useState } from 'react';
import { fmt, sci } from './terrestrialData';

const W = 640;
const H = 262;
const R_EARTH = 6371e3; // m
const YEAR = 3.156e7; // s
const EX = 430;
const EY = 100;
const ER = 40; // радиус на Земята в пиксели
const SAFE = 2; // земни радиуса – с резерв за гравитационното фокусиране

const PRESETS = [
  { name: 'DART и Диморфос', d: 151, density: 2.4, mass: 580, u: 6.14, beta: 3.6, years: 10 },
  { name: 'Апофис, 10 г. по-рано', d: 340, density: 2.6, mass: 580, u: 6.14, beta: 3, years: 10 },
  { name: 'Тяло от 140 m, 20 г.', d: 140, density: 2.6, mass: 1500, u: 8, beta: 3, years: 20 },
  { name: 'Тяло от 1 km, 5 г.', d: 1000, density: 2.6, mass: 10000, u: 10, beta: 3, years: 5 },
];

export default function DeflectionLab() {
  const [d, setD] = useState(340); // m
  const [density, setDensity] = useState(2.6);
  const [impactor, setImpactor] = useState(580); // kg
  const [u, setU] = useState(6.14); // km/s
  const [beta, setBeta] = useState(3);
  const [years, setYears] = useState(10);

  const M = density * 1000 * (Math.PI / 6) * d ** 3;
  const dv = (beta * impactor * u * 1000) / M; // m/s от един удар
  const t = years * YEAR;
  const shift = 3 * dv * t; // m – изместване по орбитата след време t
  const needed = (SAFE * R_EARTH) / (3 * t); // m/s
  const n = Math.ceil(needed / dv);
  const shiftR = shift / R_EARTH;

  // Пътят на астероида: без отклоняване минава през центъра на Земята
  const offsetPx = Math.min(110, shiftR * ER);
  const miss = shiftR > SAFE;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-emerald-300 dark:border-emerald-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Да отклоним астероид</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Космически апарат се удря в астероида и леко променя скоростта му. Колкото по-рано, толкова по-малък тласък стига: малката
        промяна в периода се натрупва с всяка обиколка.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <circle cx={EX} cy={EY} r={ER * SAFE} fill="#22c55e" fillOpacity="0.05" stroke="#22c55e" strokeOpacity="0.4" strokeDasharray="4 4" />
        <text x={EX} y={EY - ER * SAFE - 4} fontSize="9" textAnchor="middle" fill="#86efac">
          безопасно разстояние ({SAFE} R⊕)
        </text>
        <circle cx={EX} cy={EY} r={ER} fill="#3b82f6" />
        <text x={EX} y={EY + 4} fontSize="11" textAnchor="middle" fill="white">
          Земя
        </text>

        {/* Без отклоняване */}
        <line x1={20} y1={EY} x2={EX} y2={EY} stroke="#f87171" strokeOpacity="0.6" strokeDasharray="5 4" />
        <text x={30} y={EY - 6} fontSize="10" fill="#fca5a5">
          без намеса – удар
        </text>
        {/* С отклоняване */}
        <path d={`M 20 ${EY} C 200 ${EY}, 280 ${EY - offsetPx}, ${W - 20} ${EY - offsetPx}`} fill="none" stroke="#4ade80" strokeWidth="2" />
        <circle cx={20} cy={EY} r="5" fill="#a8a29e" />
        <text x={30} y={EY + 18} fontSize="10" fill="#86efac">
          след 1 удар: изместване {fmt(shift / 1000, 0)} km = {fmt(shiftR, 2)} R⊕
        </text>

        <g fontSize="11" fill="white" transform="translate(20, 200)">
          <text x={0} y={0} fillOpacity="0.85">
            маса на астероида ≈ {sci(M)} kg
          </text>
          <text x={0} y={16} fillOpacity="0.85">
            Δv от един удар = β · m · u / M ≈ {fmt(dv * 1000, 3)} mm/s
          </text>
          <text x={0} y={34} fill="#fde68a">
            нужно Δv за {SAFE} R⊕ за {fmt(years, 0)} г.: 2R⊕ / (3t) ≈ {fmt(needed * 1000, 2)} mm/s →{' '}
            <tspan fontWeight="700" fill={n <= 1 ? '#4ade80' : n <= 5 ? '#fbbf24' : '#f87171'}>
              {n <= 1 ? 'стига 1 апарат' : `нужни са ${fmt(n, 0)} апарата`}
            </tspan>
          </text>
          <text x={0} y={52} fillOpacity="0.6" fontSize="10">
            {miss ? 'Дори само един удар отклонява астероида покрай Земята.' : 'Един удар не стига – астероидът пак уцелва Земята.'}
          </text>
        </g>
      </svg>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Диаметър на астероида: {d < 1000 ? `${fmt(d, 0)} m` : `${fmt(d / 1000, 1)} km`}</label>
          <input type="range" min="50" max="2000" step="5" value={d} onChange={e => setD(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Предупреждение: {years} години преди удара</label>
          <input type="range" min="1" max="40" value={years} onChange={e => setYears(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Маса на апарата: {fmt(impactor, 0)} kg</label>
          <input type="range" min="100" max="20000" step="100" value={impactor} onChange={e => setImpactor(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">
            Усилване от изхвърленото вещество: β = {fmt(beta, 1)}
          </label>
          <input type="range" min="1" max="5" step="0.1" value={beta} onChange={e => setBeta(Number(e.target.value))} className="w-full" />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        {PRESETS.map(p => (
          <button
            key={p.name}
            onClick={() => {
              setD(p.d);
              setDensity(p.density);
              setImpactor(p.mass);
              setU(p.u);
              setBeta(p.beta);
              setYears(p.years);
            }}
            className="px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {p.name}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        β показва колко пъти изхвърлените при удара скали увеличават тласъка: те „отскачат“ назад като газове от ракетен двигател.
        При DART β ≈ 3,6 – ударът е бил почти 4 пъти по-ефективен, отколкото ако апаратът просто се беше залепил за астероида.
        Скоростта на удара е {fmt(u, 1)} km/s, плътността – {fmt(density, 1)} g/cm³.
      </p>
    </div>
  );
}
