import { useState } from 'react';
import { fmt, sci } from './terrestrialData';

const W = 640;
const H = 260;
const G = 6.674e-11;
const C = 2.998e8;
const M_SUN = 1.989e30;

type Remnant = {
  id: string;
  name: string;
  mass: number; // M☉
  radius: number; // km
  support: string;
  color: string;
  text: string;
};

const REMNANTS: Remnant[] = [
  { id: 'wd', name: 'Бяло джудже', mass: 0.6, radius: 8700, support: 'налягане на изродените електрони', color: '#e0f2fe', text: 'Масата на Слънцето, свита до размера на Земята. Чаена лъжичка (5 cm³) от него тежи ~2 тона.' },
  { id: 'ns', name: 'Неутронна звезда', mass: 1.4, radius: 12, support: 'налягане на изродените неутрони и ядрени сили', color: '#c4b5fd', text: 'Повече от масата на Слънцето в кълбо колкото град. Чаена лъжичка тежи ~2 милиарда тона – колкото планина. Протоните и електроните са „смачкани“ в неутрони.' },
  { id: 'bh', name: 'Черна дупка (3 M☉)', mass: 3, radius: 8.86, support: 'нищо – колапсът е пълен', color: '#0f172a', text: 'Хоризонтът на събитията не е повърхност, а граница, отвъд която нищо, дори светлината, не може да се върне. Цялата маса е „вътре“ – какво точно има там, още не знаем.' },
];

export default function RemnantCompare() {
  const [view, setView] = useState<'earth' | 'city'>('city');
  const [selId, setSelId] = useState('ns');
  const sel = REMNANTS.find(r => r.id === selId)!;

  const M = sel.mass * M_SUN;
  const R = sel.radius * 1000;
  const vEsc = Math.min(C, Math.sqrt((2 * G * M) / R));
  const g = (G * M) / (R * R);
  const rho = M / ((4 / 3) * Math.PI * R ** 3);
  const compact = (2 * G * M) / (R * C * C);

  // Мащаб: в изгледа „Земя“ – Земята е 70 px; в изгледа „град“ – 60 km са 360 px
  const kmPx = view === 'earth' ? 70 / 6371 : 360 / 60;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-violet-300 dark:border-violet-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Трите звездни трупа в мащаб</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Бялото джудже се сравнява със Земята, а неутронната звезда и черната дупка – с град. Щракнете върху обект.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {view === 'earth' ? (
          <g>
            <circle cx={170} cy={130} r={6371 * kmPx} fill="#3b82f6" />
            <text x={170} y={240} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.8">
              Земя (12 742 km)
            </text>
            <g className="cursor-pointer" onClick={() => setSelId('wd')}>
              <circle cx={430} cy={130} r={8700 * kmPx} fill="#e0f2fe" stroke={selId === 'wd' ? '#f472b6' : 'none'} strokeWidth="2" />
              <text x={430} y={250} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.8">
                бяло джудже 0,6 M☉ (~17 400 km)
              </text>
            </g>
            <text x={W - 10} y={20} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.5">
              неутронната звезда тук би била 0,2 px
            </text>
          </g>
        ) : (
          <g>
            {/* Схематичен „град“ – квартали и пътища */}
            <rect x={140} y={10} width={360} height={240} fill="#1e293b" rx="6" />
            {Array.from({ length: 12 }, (_, i) => (
              <line key={`v${i}`} x1={140 + i * 30} x2={140 + i * 30} y1={10} y2={250} stroke="#334155" />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <line key={`h${i}`} x1={140} x2={500} y1={10 + i * 30} y2={10 + i * 30} stroke="#334155" />
            ))}
            <text x={150} y={26} fontSize="10" fill="white" fillOpacity="0.6">
              град 60 × 40 km (като София с околностите)
            </text>
            <g className="cursor-pointer" onClick={() => setSelId('ns')}>
              <circle cx={250} cy={140} r={12 * kmPx} fill="#c4b5fd" stroke={selId === 'ns' ? '#f472b6' : 'none'} strokeWidth="2" />
              <text x={250} y={140 + 12 * kmPx + 14} fontSize="11" textAnchor="middle" fill="white">
                неутронна звезда (24 km)
              </text>
            </g>
            <g className="cursor-pointer" onClick={() => setSelId('bh')}>
              <circle cx={410} cy={130} r={8.86 * kmPx * 1.5} fill="none" stroke="#fbbf24" strokeDasharray="4 3" strokeOpacity="0.7" />
              <circle cx={410} cy={130} r={8.86 * kmPx} fill="black" stroke={selId === 'bh' ? '#f472b6' : '#f87171'} strokeWidth="2" />
              <text x={410} y={130 + 8.86 * kmPx * 1.5 + 14} fontSize="11" textAnchor="middle" fill="white">
                черна дупка 3 M☉
              </text>
            </g>
            <text x={W - 10} y={H - 10} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.5">
              хоризонт: диаметър 18 km; жълто – фотонната сфера (1,5 Rs)
            </text>
          </g>
        )}
      </svg>

      <div className="flex flex-wrap justify-center gap-1 mt-3">
        <button
          onClick={() => {
            setView('earth');
            setSelId('wd');
          }}
          className={`px-3 py-1 rounded text-sm border ${view === 'earth' ? 'border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300' : 'border-gray-300 dark:border-gray-600'}`}
        >
          🌍 Сравнение със Земята
        </button>
        <button
          onClick={() => {
            setView('city');
            setSelId('ns');
          }}
          className={`px-3 py-1 rounded text-sm border ${view === 'city' ? 'border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300' : 'border-gray-300 dark:border-gray-600'}`}
        >
          🏙️ Сравнение с град
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-center text-sm">
        {[
          { label: 'Маса / радиус', value: `${fmt(sel.mass, 1)} M☉ / ${fmt(sel.radius, 0)} km` },
          { label: 'Средна плътност', value: `${sci(rho / 1000, 1)} g/cm³` },
          { label: 'g на повърхността', value: sel.id === 'bh' ? '–' : `${sci(g / 9.81, 1)} g⊕` },
          { label: 'Втора космическа скорост', value: sel.id === 'bh' ? 'c (на хоризонта)' : `${fmt(vEsc / 1000, 0)} km/s = ${fmt((vEsc / C) * 100, 1)}% c` },
        ].map(s => (
          <div key={s.label} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">{s.label}</div>
            <div className="font-semibold">{s.value}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        <strong>{sel.name}</strong> – крепи се от: {sel.support}. {sel.text}{' '}
        <span className="text-gray-500 dark:text-gray-400">Мярка за компактност 2GM/(Rc²) = {fmt(compact, compact < 0.01 ? 5 : 2)}</span>
      </p>
    </div>
  );
}
