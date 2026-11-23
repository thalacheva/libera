import { useState } from 'react';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

/** Шест дни: валяло ли е наистина. */
const DAYS: [string, boolean][] = [
  ['понеделник', true],
  ['вторник', false],
  ['сряда', false],
  ['четвъртък', true],
  ['петък', true],
  ['събота', false],
];

const PRESETS: { label: string; p: number[] }[] = [
  { label: 'винаги 50%', p: [50, 50, 50, 50, 50, 50] },
  { label: 'добър синоптик', p: [80, 20, 30, 70, 90, 10] },
  { label: 'уверен и грешен', p: [80, 20, 99, 70, 90, 10] },
  { label: 'всезнаещ', p: [99, 1, 1, 99, 99, 1] },
];

const dec = (v: number, d = 2) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d });

/** Прогнози „вероятност за дъжд“ за шест дни: логаритмична загуба за всеки ден и средно. */
export default function ForecastLab() {
  const [p, setP] = useState(PRESETS[1].p);

  const rows = DAYS.map(([day, rain], i) => {
    const q = p[i] / 100;
    const given = rain ? q : 1 - q; // вероятността, която синоптикът е дал на случилото се
    return { day, rain, q, given, loss: -Math.log(given), right: given > 0.5 };
  });
  const avg = rows.reduce((s, r) => s + r.loss, 0) / rows.length;
  const right = rows.filter(r => r.right).length;
  const worst = rows.reduce((a, r) => (r.loss > a.loss ? r : a), rows[0]);

  const th = 'px-2 py-1.5 text-left font-semibold border-b border-gray-200 dark:border-gray-700';
  const td = 'px-2 py-1.5 border-b border-gray-100 dark:border-gray-800';
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm text-gray-800 dark:text-gray-200">
          <thead>
            <tr>
              <th className={th}>ден</th>
              <th className={th}>прогноза: вероятност за дъжд</th>
              <th className={th}>какво стана</th>
              <th className={`${th} w-1/4`}>загуба −ln p</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.day}>
                <td className={td}>{r.day}</td>
                <td className={td}>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={1}
                      max={99}
                      step={1}
                      value={p[i]}
                      onChange={e => setP(p.map((v, k) => (k === i ? Number(e.target.value) : v)))}
                      className="min-w-0 flex-1 accent-violet-500 cursor-pointer"
                      aria-label={`Вероятност за дъжд в ${r.day}`}
                    />
                    <span className="w-10 text-right font-mono">{p[i]}%</span>
                  </div>
                </td>
                <td className={td}>{r.rain ? '🌧️ валя' : '☀️ не валя'}</td>
                <td className={td}>
                  <div className="flex items-center gap-2">
                    <span className="h-3 flex-1 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
                      <span className={`block h-full ${r.right ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(100, (r.loss / 4.7) * 100)}%` }} />
                    </span>
                    <span className="w-10 text-right font-mono">{dec(r.loss)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Buttons>
        {PRESETS.map(q => (
          <DiagramButton key={q.label} onClick={() => setP(q.p)}>
            {q.label}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'познати дни (над 50% за случилото се)', value: `${right} от 6`, tone: 'blue' },
            { label: 'средна загуба', value: dec(avg, 3), tone: 'violet' },
            { label: 'най-скъпият ден', value: `${worst.day}: ${dec(worst.loss)}`, tone: 'rose' },
          ]}
        />
      </div>
      <Note tone="gray">
        Загубата за един ден зависи само от вероятността, която синоптикът е дал на това, което наистина се е случило. Сравни „добър синоптик“
        и „уверен и грешен“: разликата е в един-единствен ден.
      </Note>
    </div>
  );
}
