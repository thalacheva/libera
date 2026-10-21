import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

const KI = 1; // mmol/L – константа на инхибитора
const S_MAX = 20;

type Inhibitor = 'none' | 'competitive' | 'noncompetitive';

// Графиката
const GX = 54;
const GW = 300;
const GY = 16;
const GH = 190;
const fmt = (v: number, d = 1) => (Number.isInteger(v) ? String(v) : v.toFixed(d).replace('.', ','));

/** Кинетика на Михаелис–Ментен: скорост срещу концентрация на субстрата, с инхибитор и в двойно обратни координати. */
export default function MichaelisMentenLab() {
  const [vmax, setVmax] = useState(80);
  const [km, setKm] = useState(2);
  const [s, setS] = useState(4);
  const [kind, setKind] = useState<Inhibitor>('none');
  const [inh, setInh] = useState(2);
  const [lb, setLb] = useState(false);

  const factor = kind === 'none' ? 1 : 1 + inh / KI;
  const kmApp = kind === 'competitive' ? km * factor : km;
  const vmaxApp = kind === 'noncompetitive' ? vmax / factor : vmax;
  const v = (x: number, V: number, K: number) => (V * x) / (K + x);
  const vNow = v(s, vmaxApp, kmApp);
  const vFree = v(s, vmax, km);

  // Обикновена графика: v от [S]
  const sx = (x: number) => GX + (x / S_MAX) * GW;
  const sy = (y: number) => GY + GH - (y / 100) * GH;
  const curve = (V: number, K: number) =>
    Array.from({ length: 121 }, (_, i) => (i / 120) * S_MAX)
      .map(x => `${sx(x).toFixed(1)},${sy(v(x, V, K)).toFixed(1)}`)
      .join(' ');

  // Двойно обратни координати (Лайнуийвър–Бърк): 1/v = (K/V)(1/[S]) + 1/V
  const X_MIN = -1.2;
  const X_MAX = 2;
  const lines = kind === 'none' ? [[vmax, km]] : [[vmax, km], [vmaxApp, kmApp]];
  const yTop = Math.max(...lines.map(([V, K]) => (K / V) * X_MAX + 1 / V));
  const step = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5].find(st => yTop / st <= 6) ?? 1;
  const Y_MAX = Math.ceil(yTop / step) * step;
  const lx = (x: number) => GX + ((x - X_MIN) / (X_MAX - X_MIN)) * GW;
  const ly = (y: number) => GY + GH - (y / Y_MAX) * GH;
  const lbLine = (V: number, K: number) => {
    const x0 = Math.max(X_MIN, -1 / K);
    return { x1: lx(x0), y1: ly((K / V) * x0 + 1 / V), x2: lx(X_MAX), y2: ly((K / V) * X_MAX + 1 / V) };
  };
  const yTicks = Array.from({ length: Math.round(Y_MAX / step) + 1 }, (_, i) => i * step);

  const color = kind === 'competitive' ? '#2563eb' : kind === 'noncompetitive' ? '#d97706' : '#e11d48';

  let note: string;
  if (kind === 'competitive')
    note = `Конкурентният инхибитор заема активния център. Vmax не се променя – при много субстрат той „изтласква“ инхибитора, но Km расте ${fmt(factor, 2)} пъти. В двойно обратни координати правите се пресичат на оста 1/v.`;
  else if (kind === 'noncompetitive')
    note = `Неконкурентният инхибитор се свързва другаде и изключва част от молекулите на ензима. Vmax пада ${fmt(factor, 2)} пъти и колкото и субстрат да добавим, не се възстановява; Km остава същата. Правите се пресичат на оста 1/[S].`;
  else if (s <= km * 0.3) note = 'При малко субстрат скоростта расте почти право пропорционално на [S] – повечето активни центрове са свободни.';
  else if (s >= km * 6) note = 'При много субстрат почти всички активни центрове са заети – ензимът е наситен и скоростта е близо до Vmax.';
  else note = 'Km е концентрацията, при която скоростта е половината от максималната. Малка Km значи, че ензимът се „насища“ лесно – свързва субстрата здраво.';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 240" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {!lb && (
          <g>
            <line x1={GX} x2={GX + GW} y1={sy(0)} y2={sy(0)} className="stroke-gray-400" />
            <line x1={GX} x2={GX} y1={GY} y2={GY + GH} className="stroke-gray-400" />
            {[0, 20, 40, 60, 80, 100].map(y => (
              <text key={y} x={GX - 6} y={sy(y) + 4} fontSize="11" textAnchor="end" fill="currentColor">
                {y}
              </text>
            ))}
            {[0, 5, 10, 15, 20].map(x => (
              <text key={x} x={sx(x)} y={GY + GH + 15} fontSize="11" textAnchor="middle" fill="currentColor">
                {x}
              </text>
            ))}
            <text x={GX + 6} y={GY + 4} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
              v, μmol/min
            </text>
            <text x={GX + GW} y={GY + GH + 30} fontSize="11" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
              [S], mmol/L
            </text>
            {/* Vmax и Vmax/2 */}
            <line x1={GX} x2={GX + GW} y1={sy(vmaxApp)} y2={sy(vmaxApp)} stroke={color} strokeDasharray="5 4" opacity="0.7" />
            <line x1={GX} x2={sx(Math.min(kmApp, S_MAX))} y1={sy(vmaxApp / 2)} y2={sy(vmaxApp / 2)} stroke={color} strokeDasharray="2 3" opacity="0.7" />
            {kmApp <= S_MAX && <line x1={sx(kmApp)} x2={sx(kmApp)} y1={sy(vmaxApp / 2)} y2={sy(0)} stroke={color} strokeDasharray="2 3" opacity="0.7" />}
            {kmApp <= S_MAX && (
              <text x={sx(kmApp) + 4} y={sy(0) - 6} fontSize="11" fill={color}>
                Km
              </text>
            )}
            <text x={GX + GW - 4} y={sy(vmaxApp) - 5} fontSize="11" textAnchor="end" fill={color}>
              Vmax
            </text>
            {kind !== 'none' && <polyline points={curve(vmax, km)} fill="none" className="stroke-gray-400" strokeWidth="2" strokeDasharray="6 4" />}
            <polyline points={curve(vmaxApp, kmApp)} fill="none" stroke={color} strokeWidth="2.5" />
            <line x1={sx(s)} x2={sx(s)} y1={GY} y2={GY + GH} className="stroke-gray-400" strokeDasharray="3 3" />
            <circle cx={sx(s)} cy={sy(vNow)} r="5" fill={color} stroke="white" strokeWidth="1.5" />
          </g>
        )}
        {lb && (
          <g>
            <line x1={GX} x2={GX + GW} y1={ly(0)} y2={ly(0)} className="stroke-gray-400" />
            <line x1={lx(0)} x2={lx(0)} y1={GY} y2={GY + GH} className="stroke-gray-400" />
            {yTicks.slice(1).map(y => (
              <text key={y} x={lx(0) - 5} y={ly(y) + 4} fontSize="10" textAnchor="end" fill="currentColor">
                {fmt(y, 2)}
              </text>
            ))}
            {[-1, 1, 2].map(x => (
              <text key={x} x={lx(x)} y={ly(0) + 15} fontSize="11" textAnchor="middle" fill="currentColor">
                {String(x).replace('-', '−')}
              </text>
            ))}
            <text x={lx(0) + 6} y={GY + 4} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
              1/v, min/μmol
            </text>
            <text x={GX + GW} y={ly(0) + 30} fontSize="11" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
              1/[S], L/mmol
            </text>
            {lines.map(([V, K], i) => {
              const l = lbLine(V, K);
              const c = i === 0 && kind !== 'none' ? '#9ca3af' : color;
              return (
                <g key={i}>
                  <line {...l} stroke={c} strokeWidth="2.5" strokeDasharray={i === 0 && kind !== 'none' ? '6 4' : undefined} />
                  <circle cx={lx(0)} cy={ly(1 / V)} r="4" fill={c} />
                  {-1 / K >= X_MIN && <circle cx={lx(-1 / K)} cy={ly(0)} r="4" fill={c} />}
                </g>
              );
            })}
            {-1 / kmApp >= X_MIN && (
              <text x={lx(-1 / kmApp)} y={ly(0) - 10} fontSize="11" textAnchor="middle" fill={color}>
                −1/Km
              </text>
            )}
          </g>
        )}
        <g transform="translate(372 40)">
          <text fontSize="11" className="fill-gray-500 dark:fill-gray-400">
            Vmax
          </text>
          <text y={17} fontSize="14" fontWeight="700" fill={color}>
            {fmt(vmaxApp)}
          </text>
          <text y={46} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
            Km, mmol/L
          </text>
          <text y={63} fontSize="14" fontWeight="700" fill={color}>
            {fmt(kmApp)}
          </text>
          <text y={92} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
            v при [S] = {fmt(s)}
          </text>
          <text y={109} fontSize="14" fontWeight="700" fill={color}>
            {fmt(vNow)}
          </text>
          {kind !== 'none' && (
            <text y={128} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
              без инхибитор: {fmt(vFree)}
            </text>
          )}
        </g>
      </LabSvg>

      <Buttons>
        <DiagramButton active={kind === 'none'} onClick={() => setKind('none')}>
          без инхибитор
        </DiagramButton>
        <DiagramButton active={kind === 'competitive'} onClick={() => setKind('competitive')}>
          конкурентен
        </DiagramButton>
        <DiagramButton active={kind === 'noncompetitive'} onClick={() => setKind('noncompetitive')}>
          неконкурентен
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="Vmax" value={vmax} onChange={setVmax} min={20} max={100} step={5} tone="rose" />
        <Slider label="Km" value={km} onChange={setKm} min={1} max={10} step={0.5} tone="rose" />
        <Slider label="[S]" value={s} onChange={setS} min={0} max={S_MAX} step={0.5} tone="blue" />
        {kind !== 'none' && <Slider label="[I]" value={inh} onChange={setInh} min={0} max={5} step={0.5} tone="amber" />}
      </Sliders>
      <Buttons>
        <DiagramButton active={lb} onClick={() => setLb(!lb)}>
          {lb ? '✓ ' : ''}двойно обратни координати
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'v от Vmax на ензима без инхибитор', value: `${Math.round((vNow / vmax) * 100)}%` },
          ]}
        />
      </div>
      <Note tone="violet">{note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Константата на инхибитора е {KI} mmol/L. Сивата пунктирна линия е ензимът без инхибитор. В двойно обратни координати кривата
        става права: пресечната точка с оста 1/v е 1/Vmax, а с оста 1/[S] – −1/Km. Така Vmax и Km се отчитат от опитни точки много
        по-точно, отколкото от извитата крива.
      </p>
    </div>
  );
}
