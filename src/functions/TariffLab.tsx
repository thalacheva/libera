import { useState } from 'react';

const W = 600;
const H = 300;
const X0 = 50;
const X1 = 580;
const Y0 = 20;
const Y1 = 250;
const MAX_MIN = 200;
const MAX_EUR = 40;

const fmt = (v: number) => (Math.round(v * 100) / 100).toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Plan = { name: string; fee: number; perMin: number; color: string };

export function TariffLab() {
  const [plans, setPlans] = useState<Plan[]>([
    { name: 'А „Базов“', fee: 5, perMin: 0.1, color: '#2563eb' },
    { name: 'Б „Без такса“', fee: 0, perMin: 0.2, color: '#f59e0b' },
    { name: 'В „Неограничен“', fee: 20, perMin: 0, color: '#16a34a' },
  ]);
  const [minutes, setMinutes] = useState(80);

  const cost = (p: Plan, m: number) => p.fee + p.perMin * m;
  const px = (m: number) => X0 + (m / MAX_MIN) * (X1 - X0);
  const py = (e: number) => Y1 - (e / MAX_EUR) * (Y1 - Y0);
  const costs = plans.map(p => cost(p, minutes));
  const best = costs.indexOf(Math.min(...costs));

  // Кой план е най-евтин по цялата ос – ленти отдолу
  const bands: { from: number; to: number; i: number }[] = [];
  for (let m = 0; m <= MAX_MIN; m += 1) {
    const c = plans.map(p => cost(p, m));
    const i = c.indexOf(Math.min(...c));
    const last = bands[bands.length - 1];
    if (last && last.i === i) last.to = m;
    else bands.push({ from: m, to: m, i });
  }
  // Точки на равенство между двойки планове
  const crossings: { m: number; e: number; label: string }[] = [];
  for (let i = 0; i < plans.length; i++)
    for (let j = i + 1; j < plans.length; j++) {
      const dp = plans[i].perMin - plans[j].perMin;
      if (Math.abs(dp) < 1e-9) continue;
      const m = (plans[j].fee - plans[i].fee) / dp;
      if (m > 0 && m < MAX_MIN) crossings.push({ m, e: cost(plans[i], m), label: `${plans[i].name[0]} = ${plans[j].name[0]}` });
    }

  const update = (i: number, key: 'fee' | 'perMin', v: number) => setPlans(prev => prev.map((p, k) => (k === i ? { ...p, [key]: v } : p)));

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-base sm:text-lg font-bold mb-1 text-center text-gray-800 dark:text-gray-100">📱 Кой абонаментен план е най-изгоден?</h3>
      <p className="text-sm text-center mb-3 text-gray-600 dark:text-gray-400">
        Всеки план е линейна функция: цена = месечна такса + цена на минута · минути. Пресечните точки на правите показват кога два плана
        струват еднакво.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto text-gray-700 dark:text-gray-300">
        <defs>
          <clipPath id="tariff-clip">
            <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} />
          </clipPath>
        </defs>
        {[0, 50, 100, 150, 200].map(m => (
          <g key={m}>
            <line x1={px(m)} x2={px(m)} y1={Y0} y2={Y1} stroke="currentColor" opacity="0.08" />
            <text x={px(m)} y={Y1 + 14} fontSize="10" textAnchor="middle" fill="currentColor" opacity="0.6">
              {m}
            </text>
          </g>
        ))}
        {[0, 10, 20, 30, 40].map(e => (
          <g key={e}>
            <line x1={X0} x2={X1} y1={py(e)} y2={py(e)} stroke="currentColor" opacity="0.08" />
            <text x={X0 - 6} y={py(e) + 3} fontSize="10" textAnchor="end" fill="currentColor" opacity="0.6">
              {e} €
            </text>
          </g>
        ))}
        <line x1={X0} x2={X1} y1={Y1} y2={Y1} stroke="currentColor" strokeWidth="1.2" />
        <line x1={X0} x2={X0} y1={Y0} y2={Y1} stroke="currentColor" strokeWidth="1.2" />
        <text x={X1} y={Y1 + 28} fontSize="10" textAnchor="end" fill="currentColor" opacity="0.7">
          минути за месец
        </text>
        {/* Ленти: най-евтиният план */}
        {bands.map(b => (
          <rect key={b.from} x={px(b.from)} y={Y1 + 32} width={Math.max(px(b.to + 1) - px(b.from), 1)} height={8} fill={plans[b.i].color} opacity="0.8" />
        ))}
        <g clipPath="url(#tariff-clip)">
          {plans.map((p, i) => (
            <line key={p.name} x1={px(0)} y1={py(cost(p, 0))} x2={px(MAX_MIN)} y2={py(cost(p, MAX_MIN))} stroke={p.color} strokeWidth={i === best ? 4 : 2.5} opacity={i === best ? 1 : 0.7} />
          ))}
          {crossings.map(c => (
            <g key={c.label}>
              <circle cx={px(c.m)} cy={py(c.e)} r={4} fill="white" stroke="currentColor" strokeWidth="1.5" />
              <text x={px(c.m) + 6} y={py(c.e) - 6} fontSize="10" fill="currentColor" opacity="0.8">
                {Math.round(c.m)} мин
              </text>
            </g>
          ))}
        </g>
        <line x1={px(minutes)} x2={px(minutes)} y1={Y0} y2={Y1} stroke="#ef4444" strokeDasharray="4 3" />
        {plans.map((p, i) => (
          <circle key={p.name} cx={px(minutes)} cy={py(costs[i])} r={5} fill={p.color} stroke="white" strokeWidth="2" />
        ))}
      </svg>

      <label className="block text-sm font-semibold mt-1">
        Говоря по {minutes} минути на месец
        <input type="range" min="0" max={MAX_MIN} step="5" value={minutes} onChange={e => setMinutes(Number(e.target.value))} className="w-full" />
      </label>

      <div className="grid sm:grid-cols-3 gap-2 mt-3">
        {plans.map((p, i) => (
          <div
            key={p.name}
            className={`rounded-xl border-2 p-3 text-sm ${i === best ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}
          >
            <p className="font-semibold" style={{ color: p.color }}>
              {p.name} {i === best && '✓'}
            </p>
            <p className="font-mono text-xs mb-1">
              y = {fmt(p.fee)} + {fmt(p.perMin)}x
            </p>
            <p className="font-mono">
              {fmt(costs[i])} € за {minutes} мин
            </p>
            <label className="block text-xs mt-1">
              такса {fmt(p.fee)} €
              <input type="range" min="0" max="30" step="1" value={p.fee} onChange={e => update(i, 'fee', Number(e.target.value))} className="w-full" />
            </label>
            <label className="block text-xs">
              минута {fmt(p.perMin)} €
              <input type="range" min="0" max="0.3" step="0.01" value={p.perMin} onChange={e => update(i, 'perMin', Number(e.target.value))} className="w-full" />
            </label>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
        Цветната лента под оста показва кой план е най-евтин при всеки брой минути. Двата плана струват еднакво, когато таксите и минутите
        „се изравнят“: например 5 + 0,1x = 0,2x ⇒ x = 50 минути.
      </p>
    </div>
  );
}
