import { useState } from 'react';
import { element, ELEMENTS } from './light';
import { SpectrumStrip } from './SpectrumStrip';

const W = 640;
const H = 410;
const SOURCE = { x: 90, y: 150 };
const CLOUD = { x: 330, y: 170 };

type View = 'continuous' | 'absorption' | 'emission';

const OBSERVERS: { view: View; x: number; y: number; title: string; law: string }[] = [
  {
    view: 'continuous',
    x: 575,
    y: 50,
    title: 'Непрекъснат спектър',
    law: 'Нагрято плътно тяло (твърдо, течно или плътен газ като звездата) излъчва всички дължини на вълната – непрекъсната дъга без линии.',
  },
  {
    view: 'absorption',
    x: 575,
    y: 170,
    title: 'Абсорбционен спектър',
    law: 'Когато непрекъсната светлина мине през по-хладен разреден газ, газът поглъща точно своите дължини на вълната – на тяхно място остават тъмни линии.',
  },
  {
    view: 'emission',
    x: 330,
    y: 290,
    title: 'Емисионен спектър',
    law: 'Нагрят разреден газ, гледан на тъмен фон, свети само на определени дължини на вълната – ярки линии върху тъмно.',
  },
];

const GAS_IDS = ['H', 'He', 'Na', 'Hg', 'Ne'];

export default function KirchhoffLab() {
  const [view, setView] = useState<View>('absorption');
  const [gasId, setGasId] = useState('H');

  const gas = element(gasId);
  const observer = OBSERVERS.find(o => o.view === view)!;

  const ray = (x1: number, y1: number, x2: number, y2: number, active: boolean, color: string) => (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={active ? 2.5 : 1.5}
      strokeOpacity={active ? 0.9 : 0.25}
      strokeDasharray="7 5"
      markerEnd={active ? 'url(#kh-arrow)' : undefined}
    />
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Трите закона на Кирхоф</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Изберете наблюдател (1, 2 или 3) и газ в облака. Един и същ газ дава ярки или тъмни линии – зависи откъде гледаме.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <defs>
          <radialGradient id="kh-source">
            <stop offset="0.3" stopColor="#fff7d6" />
            <stop offset="0.7" stopColor="#fbbf24" />
            <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="kh-cloud">
            <stop offset="0" stopColor="#a78bfa" stopOpacity="0.55" />
            <stop offset="1" stopColor="#7c3aed" stopOpacity="0.1" />
          </radialGradient>
          <marker id="kh-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="white" />
          </marker>
        </defs>

        {/* Лъчи към наблюдателите */}
        {ray(SOURCE.x + 30, SOURCE.y - 10, OBSERVERS[0].x - 26, OBSERVERS[0].y + 6, view === 'continuous', '#fde68a')}
        {ray(SOURCE.x + 34, SOURCE.y + 4, OBSERVERS[1].x - 26, OBSERVERS[1].y, view === 'absorption', '#fde68a')}
        {ray(CLOUD.x, CLOUD.y + 40, OBSERVERS[2].x, OBSERVERS[2].y - 26, view === 'emission', '#c4b5fd')}

        {/* Горещ източник */}
        <circle cx={SOURCE.x} cy={SOURCE.y} r={60} fill="url(#kh-source)" />
        <text x={SOURCE.x} y={SOURCE.y + 72} fontSize="11" textAnchor="middle" fill="white" fillOpacity="0.8">
          горещо плътно тяло
        </text>

        {/* Газов облак */}
        <ellipse cx={CLOUD.x} cy={CLOUD.y} rx={70} ry={40} fill="url(#kh-cloud)" stroke="#a78bfa" strokeOpacity="0.5" />
        <text x={CLOUD.x} y={CLOUD.y + 5} fontSize="16" fontWeight="700" textAnchor="middle" fill="white">
          {gas.symbol}
        </text>
        <text x={CLOUD.x + 60} y={CLOUD.y + 52} fontSize="11" fill="white" fillOpacity="0.8">
          разреден газ
        </text>

        {/* Наблюдатели */}
        {OBSERVERS.map((o, i) => (
          <g key={o.view} onClick={() => setView(o.view)} className="cursor-pointer">
            <circle
              cx={o.x}
              cy={o.y}
              r={22}
              fill={view === o.view ? '#4f46e5' : '#1e293b'}
              stroke="white"
              strokeOpacity={view === o.view ? 1 : 0.4}
              strokeWidth="2"
            />
            <text x={o.x} y={o.y + 5} fontSize="15" fontWeight="700" textAnchor="middle" fill="white">
              {i + 1}
            </text>
          </g>
        ))}

        {/* Какво вижда избраният наблюдател */}
        <text x={20} y={334} fontSize="13" fontWeight="600" fill="white">
          Наблюдател {OBSERVERS.indexOf(observer) + 1} вижда: {observer.title.toLowerCase()}
        </text>
        <SpectrumStrip x={20} y={344} width={W - 40} height={38} kind={view} lines={view === 'continuous' ? [] : gas.lines} ticks />
      </svg>

      <div className="flex flex-wrap gap-2 mt-3">
        {OBSERVERS.map((o, i) => (
          <button
            key={o.view}
            onClick={() => setView(o.view)}
            className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
              view === o.view
                ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {i + 1}. {o.title}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1 mt-2 items-center">
        <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">Газ в облака:</span>
        {ELEMENTS.filter(e => GAS_IDS.includes(e.id)).map(e => (
          <button
            key={e.id}
            onClick={() => setGasId(e.id)}
            className={`px-2 py-0.5 rounded text-xs border ${
              gasId === e.id
                ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {e.name}
          </button>
        ))}
      </div>

      <div className="mt-3 p-3 bg-gray-100/70 dark:bg-gray-900/40 rounded-lg text-sm">
        <strong>{observer.title}:</strong> {observer.law}
        {view !== 'continuous' && (
          <span className="block mt-1 text-gray-600 dark:text-gray-400">
            Линиите на {gas.name.toLowerCase()} са на едни и същи места и в двата спектъра – това е „пръстовият отпечатък“ на елемента.
          </span>
        )}
      </div>
    </div>
  );
}
