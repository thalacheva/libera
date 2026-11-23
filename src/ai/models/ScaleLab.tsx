import { useState } from 'react';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';
import { scaler, type Scaling } from './scaling';

const PEOPLE: [string, number, number][] = [
  ['Ани', 1.62, 52],
  ['Борис', 1.79, 77],
  ['Вяра', 1.55, 68],
  ['Георги', 1.95, 72],
  ['Дара', 1.7, 58],
  ['Емил', 1.83, 92],
  ['Жана', 1.75, 74],
  ['Захари', 1.68, 71],
];
/** Новият човек, за когото търсим най-подобния. */
const QUERY: [string, number, number] = ['Новият', 1.8, 70];

const SCALINGS: { id: Scaling; label: string }[] = [
  { id: 'none', label: 'без нормализиране' },
  { id: 'minmax', label: 'мин–макс' },
  { id: 'zscore', label: 'стандартизиране' },
];

const dec = (v: number, d: number) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d });

/** Един и същ въпрос – „кой прилича най-много на новия?“ – с ръст в метри или сантиметри, със и без нормализиране. */
export default function ScaleLab() {
  const [cm, setCm] = useState(false);
  const [scaling, setScaling] = useState<Scaling>('none');

  const k = cm ? 100 : 1;
  const all = [...PEOPLE, QUERY];
  const fh = scaler(scaling, all.map(p => p[1] * k));
  const fm = scaler(scaling, all.map(p => p[2]));
  const qh = fh(QUERY[1] * k);
  const qm = fm(QUERY[2]);

  const rows = PEOPLE.map(([name, h, m]) => {
    const dh = (fh(h * k) - qh) ** 2;
    const dm = (fm(m) - qm) ** 2;
    return { name, h, m, dh, dm, d: Math.sqrt(dh + dm) };
  }).sort((a, b) => a.d - b.d);
  const digits = scaling === 'none' ? (cm ? 1 : 2) : 2;

  const th = 'px-2 py-1.5 text-left font-semibold border-b border-gray-200 dark:border-gray-700';
  const td = 'px-2 py-1.5 border-b border-gray-100 dark:border-gray-800';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <p className="mb-2 text-center text-sm sm:text-base text-gray-800 dark:text-gray-200">
        Новият: ръст <strong>{cm ? '180 cm' : '1,80 m'}</strong>, маса <strong>70 kg</strong>. Кой от осемте прилича най-много на него?
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className={th}>име</th>
              <th className={th}>ръст, {cm ? 'cm' : 'm'}</th>
              <th className={th}>маса, kg</th>
              <th className={`${th} w-2/5`}>от какво идва разстоянието</th>
              <th className={`${th} text-right`}>разстояние</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const total = r.dh + r.dm || 1;
              return (
                <tr key={r.name} className={i === 0 ? 'bg-fuchsia-50 dark:bg-fuchsia-500/15' : ''}>
                  <td className={`${td} ${i === 0 ? 'font-semibold' : ''}`}>{r.name}</td>
                  <td className={`${td} font-mono`}>{cm ? Math.round(r.h * 100) : dec(r.h, 2)}</td>
                  <td className={`${td} font-mono`}>{r.m}</td>
                  <td className={td}>
                    <div className="flex h-3 w-full overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
                      <div className="bg-blue-500" style={{ width: `${(r.dh / total) * 100}%` }} />
                      <div className="bg-amber-500" style={{ width: `${(r.dm / total) * 100}%` }} />
                    </div>
                  </td>
                  <td className={`${td} text-right font-mono`}>{dec(r.d, digits)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500 align-middle" /> дял на разликата в ръста ·{' '}
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-500 align-middle" /> дял на разликата в масата
      </p>

      <Buttons>
        <DiagramButton active={!cm} onClick={() => setCm(false)}>
          ръст в метри
        </DiagramButton>
        <DiagramButton active={cm} onClick={() => setCm(true)}>
          ръст в сантиметри
        </DiagramButton>
      </Buttons>
      <Buttons>
        {SCALINGS.map(s => (
          <DiagramButton key={s.id} active={scaling === s.id} onClick={() => setScaling(s.id)}>
            {s.label}
          </DiagramButton>
        ))}
      </Buttons>
      <Note tone={scaling === 'none' ? 'amber' : 'emerald'}>
        {scaling === 'none'
          ? cm
            ? `В сантиметри най-близък е ${rows[0].name}. Нищо в хората не се е променило – само мерната единица.`
            : `В метри най-близък е ${rows[0].name}: ръстът почти не участва, защото разликите в него са стотни, а в масата – цели килограми.`
          : `След нормализиране най-близък е ${rows[0].name} – и в метри, и в сантиметри. Двата признака тежат еднакво.`}
      </Note>
    </div>
  );
}
