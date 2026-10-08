import { useState } from 'react';

const W = 640;
const H = 260;
const X0 = 110;
const X1 = 610;
const LOG_MIN = -2; // 0,01
const LOG_MAX = 7; // 10 000 000
const TICKS: [number, string][] = [
  [-2, '10⁻²'],
  [0, '1'],
  [2, '10²'],
  [4, '10⁴'],
  [6, '10⁶'],
];
const mx = (mu: number) => X0 + ((Math.log10(mu) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * (X1 - X0);

type Body = {
  id: string;
  name: string;
  color: string;
  orbitsSun: boolean;
  round: boolean;
  mu: number | null; // дискриминант на Сотър: маса на тялото / маса на всичко останало в неговата зона
  note: string;
};

const BODIES: Body[] = [
  { id: 'earth', name: 'Земя', color: '#3b82f6', orbitsSun: true, round: true, mu: 1.7e6, note: 'Земята е 1,7 милиона пъти по-масивна от всичко друго, което пресича орбитата ѝ – всички астероиди, които минават близо до нас.' },
  { id: 'jupiter', name: 'Юпитер', color: '#d6a46c', orbitsSun: true, round: true, mu: 6.25e5, note: 'Юпитер не само е „почистил“ орбитата си, но и контролира троянците – те стоят на 60° от него, където им е отредено.' },
  { id: 'mercury', name: 'Меркурий', color: '#a8a29e', orbitsSun: true, round: true, mu: 9.1e4, note: 'Най-малката планета, но и тя е десетки хиляди пъти по-масивна от останалото в своята зона.' },
  { id: 'neptune', name: 'Нептун', color: '#4f7fe0', orbitsSun: true, round: true, mu: 2.4e4, note: 'Плутон пресича орбитата на Нептун, но резонансът 3 : 2 е „разрешение“, дадено от самия Нептун. Нептун е 24 000 пъти по-масивен от всички тела, които пресичат пътя му.' },
  { id: 'ceres', name: 'Церера', color: '#9ca3af', orbitsSun: true, round: true, mu: 0.33, note: 'Церера е кръгла, но е само една трета от масата на пояса на астероидите. Затова е джуджеста планета.' },
  { id: 'pluto', name: 'Плутон', color: '#d6b48a', orbitsSun: true, round: true, mu: 0.077, note: 'Плутон е само ~8% от масата на телата в своята зона на пояса на Кайпер. Той е голям член на пояса, а не негов господар.' },
  { id: 'eris', name: 'Ерида', color: '#e5e7eb', orbitsSun: true, round: true, mu: 0.1, note: 'По-масивна от Плутон, но е само едно от многото тела в разсеяния диск.' },
  { id: 'vesta', name: 'Веста', color: '#78716c', orbitsSun: true, round: false, mu: null, note: 'Почти кръгла, но гигантски удар е отнесъл част от южното ѝ полукълбо (кратера Реасилвия, 500 km). Не е в хидростатично равновесие – затова е астероид, а не джуджеста планета.' },
  { id: 'moon', name: 'Луна', color: '#d4d4d4', orbitsSun: false, round: true, mu: null, note: 'Луната е кръгла и по-голяма от Плутон, но обикаля Земята. Затова е спътник. Същото важи за Ганимед и Титан – по-големи от Меркурий.' },
  { id: 'bennu', name: 'Бену', color: '#57534e', orbitsSun: true, round: false, mu: null, note: 'Купчина развалини с размер 500 m, държана от слаба гравитация. OSIRIS-REx донесе проба от нея на Земята през 2023 г. Малко тяло на Слънчевата система.' },
];

function verdict(b: Body) {
  if (!b.orbitsSun) return { label: 'Спътник', tone: 'text-gray-700 dark:text-gray-300' };
  if (!b.round) return { label: 'Малко тяло', tone: 'text-stone-700 dark:text-stone-300' };
  if (b.mu !== null && b.mu > 100) return { label: 'Планета', tone: 'text-green-700 dark:text-green-400' };
  return { label: 'Джуджеста планета', tone: 'text-blue-700 dark:text-blue-400' };
}

export default function PlanetTest() {
  const [bodyId, setBodyId] = useState('pluto');
  const body = BODIES.find(b => b.id === bodyId)!;
  const v = verdict(body);

  const criteria = [
    { text: 'Обикаля около Слънцето', ok: body.orbitsSun },
    { text: 'Достатъчно масивно, за да е кръгло (хидростатично равновесие)', ok: body.round },
    { text: 'Изчистило е околността на орбитата си', ok: body.mu !== null && body.mu > 100 },
  ];

  const withMu = BODIES.filter(b => b.mu !== null);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-green-300 dark:border-green-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Планета ли е?</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Изберете тяло и проверете трите условия на МАС. Графиката показва колко пъти тялото е по-масивно от всичко останало около
        неговата орбита.
      </p>

      <div className="flex flex-wrap justify-center gap-1 mb-3">
        {BODIES.map(b => (
          <button
            key={b.id}
            onClick={() => setBodyId(b.id)}
            className={`px-3 py-1 rounded text-sm border ${
              b.id === bodyId
                ? 'border-green-500 bg-green-50 text-green-800 dark:bg-green-500/15 dark:text-green-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: b.color }} />
            {b.name}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-center mb-3">
        <ul className="space-y-1 text-sm sm:text-base">
          {criteria.map((c, i) => {
            const skipped = criteria.slice(0, i).some(p => !p.ok);
            return (
              <li key={c.text} className={skipped ? 'opacity-40' : ''}>
                {skipped ? '➖' : c.ok ? '✅' : '❌'} {i + 1}. {c.text}
              </li>
            );
          })}
        </ul>
        <div className={`text-xl font-bold text-center px-4 py-2 rounded-lg bg-gray-100/70 dark:bg-gray-700/50 ${v.tone}`}>{v.label}</div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        {/* Пропастта между двете групи */}
        <rect x={mx(1)} y={14} width={mx(1e4) - mx(1)} height={H - 50} fill="#22c55e" fillOpacity="0.06" />
        <text x={(mx(1) + mx(1e4)) / 2} y={30} fontSize="10" textAnchor="middle" fill="#86efac" fillOpacity="0.8">
          празно – пропаст от 5 порядъка
        </text>

        {TICKS.map(([p, label]) => (
          <g key={p}>
            <line x1={mx(10 ** p)} x2={mx(10 ** p)} y1={14} y2={H - 36} stroke="white" strokeOpacity="0.1" />
            <text x={mx(10 ** p)} y={H - 20} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
              {label}
            </text>
          </g>
        ))}
        <text x={(X0 + X1) / 2} y={H - 4} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.5">
          μ = маса на тялото / маса на всичко останало в зоната му (лог. скала)
        </text>

        {withMu.map((b, i) => {
          const y = 44 + i * 24;
          const active = b.id === bodyId;
          return (
            <g key={b.id} className="cursor-pointer" onClick={() => setBodyId(b.id)}>
              <text x={X0 - 8} y={y + 4} fontSize="11" textAnchor="end" fill="white" fontWeight={active ? 700 : 400}>
                {b.name}
              </text>
              <rect x={X0} y={y - 6} width={mx(b.mu!) - X0} height={12} rx="3" fill={b.mu! > 100 ? '#22c55e' : '#60a5fa'} fillOpacity={active ? 1 : 0.55} />
            </g>
          );
        })}
      </svg>

      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">{body.note}</p>
    </div>
  );
}
