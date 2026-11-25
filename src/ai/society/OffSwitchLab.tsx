import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import { offSwitch, pdf } from './safetyMath';

const dec = (v: number, d = 2) => v.toLocaleString('bg-BG', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');
const W = 320;
const H = 120;
const sx = (u: number) => ((u + 4) / 8) * W;

/** Играта с копчето за изключване: машина, несигурна за ползата U от действието си, сравнява три възможности. */
export default function OffSwitchLab() {
  const [mu, setMu] = useState(0.5);
  const [sigma, setSigma] = useState(1);
  const [error, setError] = useState(0);

  const r = offSwitch(mu, sigma, error);
  const s = Math.max(sigma, 0.03);
  const peak = pdf(0) / s;
  const sy = (d: number) => H - 14 - (d / peak) * (H - 24);
  const curve = (from: number, to: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 80; i++) {
      const u = from + ((to - from) * i) / 80;
      pts.push(`${sx(u)},${sy(pdf((u - mu) / s) / s)}`);
    }
    return `${sx(from)},${H - 14} ${pts.join(' ')} ${sx(to)},${H - 14}`;
  };
  const rows: { key: 'act' | 'off' | 'defer'; label: string; value: number }[] = [
    { key: 'act', label: 'действа направо', value: r.act },
    { key: 'off', label: 'изключва се сама', value: r.off },
    { key: 'defer', label: 'пита човека', value: r.defer },
  ];
  const scale = Math.max(0.5, ...rows.map(x => Math.abs(x.value)));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <p className="text-xs font-semibold text-center mb-1 text-gray-600 dark:text-gray-300">Какво мисли машината за ползата U от действието си</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full max-w-md mx-auto select-none" role="img" aria-label="Разпределение на ползата според машината">
        <polygon points={curve(-4, 0)} className="fill-rose-300/70 dark:fill-rose-500/40" />
        <polygon points={curve(0, 4)} className="fill-emerald-300/70 dark:fill-emerald-500/40" />
        <line x1={0} y1={H - 14} x2={W} y2={H - 14} className="stroke-gray-400" />
        <line x1={sx(0)} y1={6} x2={sx(0)} y2={H - 10} className="stroke-gray-500" strokeDasharray="4 3" />
        {[-4, -2, 0, 2, 4].map(v => (
          <text key={v} x={Math.min(W - 6, Math.max(6, sx(v)))} y={H - 2} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
            {String(v).replace('-', '−')}
          </text>
        ))}
        <text x={sx(-2.6)} y={16} fontSize="10" textAnchor="middle" className="fill-rose-700 dark:fill-rose-300">
          вреда (U &lt; 0)
        </text>
        <text x={sx(2.6)} y={16} fontSize="10" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300">
          полза (U &gt; 0)
        </text>
      </svg>
      <Sliders>
        <Slider label="средно" value={mu} onChange={setMu} min={-2} max={2} step={0.1} tone="violet" />
        <Slider label="σ" value={sigma} onChange={setSigma} min={0} max={2} step={0.1} tone="amber" />
        <Slider label="грешка" value={error} onChange={setError} min={0} max={0.5} step={0.05} tone="rose" />
      </Sliders>
      <p className="mt-3 mb-1 text-xs font-semibold text-center text-gray-600 dark:text-gray-300">Очаквана полза от всяка възможност</p>
      <div className="max-w-md mx-auto space-y-1">
        {rows.map(x => (
          <div key={x.key} className={`flex items-center gap-2 text-sm ${r.best === x.key ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
            <span className="w-32 shrink-0">{x.label}</span>
            <div className="flex-1 min-w-0 h-5 flex">
              <div className="w-1/2 h-full flex justify-end bg-gray-100 dark:bg-gray-900/60 rounded-l">
                {x.value < 0 && <div className="h-full bg-rose-400 rounded-l" style={{ width: `${(-x.value / scale) * 100}%` }} />}
              </div>
              <div className="w-1/2 h-full bg-gray-100 dark:bg-gray-900/60 rounded-r border-l border-gray-400">
                {x.value > 0 && <div className={`h-full rounded-r ${r.best === x.key ? 'bg-fuchsia-500' : 'bg-gray-400'}`} style={{ width: `${(x.value / scale) * 100}%` }} />}
              </div>
            </div>
            <span className="w-12 shrink-0 text-right font-mono text-xs">{dec(x.value)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'шанс действието да вреди', value: `${dec(r.harmChance * 100, 0)}%`, tone: 'rose' },
            { label: 'печалба от питането', value: dec(r.defer - Math.max(r.act, 0)), tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={r.best === 'defer' ? 'emerald' : sigma === 0 ? 'amber' : 'rose'}>
        {r.best === 'defer'
          ? 'Машината сама има полза да остави копчето на човека: той ще спре точно случаите, в които тя би навредила.'
          : sigma === 0
            ? 'Машина, напълно сигурна в целта си, не печели нищо от човека – за нея копчето е само пречка или излишна стъпка.'
            : 'Човекът греши твърде често спрямо това, колко е несигурна машината: по нейната сметка е по-добре да не го пита.'}
      </Note>
    </div>
  );
}
