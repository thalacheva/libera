import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

// Модел на двата „басейна“ в цикъла на Калвин (концентрации в условни единици):
// фиксиране: RuBP + CO₂ → 2 GP със скорост k_f·CO₂·RuBP (РуБисКО);
// редукция и регенерация: от 6 GP (с АТФ и НАДФН от светлината) накрая се връщат 3 RuBP, а 1 G3P излиза – скорост k_r·светлина·GP.
// Тогава RuBP + GP/2 остава постоянно – в клетката има определено количество „въртящ се“ въглерод.
const KF = 0.06;
const KR = 0.04;
const CO2_HIGH = 1.5;
const CO2_LOW = 0.1;
const T_END = 120;
const T_EVENT = 40;
const T_BACK = 85;
const DT = 0.05;

type Kind = 'dark' | 'co2';

function simulate(kind: Kind, back: boolean) {
  let co2 = CO2_HIGH;
  let light = 1;
  let r = 1 / (1 + (KF * co2) / (KR * light));
  let g = 2 * (1 - r);
  const pts: { t: number; r: number; g: number }[] = [];
  for (let i = 0; i * DT <= T_END + 1e-9; i++) {
    const t = i * DT;
    const changed = t >= T_EVENT && !(back && t >= T_BACK);
    co2 = changed && kind === 'co2' ? CO2_LOW : CO2_HIGH;
    light = changed && kind === 'dark' ? 0 : 1;
    if (i % 10 === 0) pts.push({ t, r, g });
    const vf = KF * co2 * r;
    const vr = KR * light * g;
    r += (0.5 * vr - vf) * DT;
    g += (2 * vf - vr) * DT;
  }
  return pts;
}

// Графиката
const GX = 46;
const GW = 290;
const GY = 16;
const GH = 170;
const gx = (t: number) => GX + (t / T_END) * GW;
const gy = (v: number) => GY + GH - (v / 2.1) * GH;
const R_COLOR = '#2563eb';
const G_COLOR = '#ea580c';

// Схемата на цикъла
const CX = 480;
const CY = 112;
const RING = 66;
const node = (deg: number) => ({ x: CX + RING * Math.cos((deg * Math.PI) / 180), y: CY - RING * Math.sin((deg * Math.PI) / 180) });
const RUBP = node(90);
const GP = node(-30);
const G3P = node(210);

const fmt = (v: number) => v.toFixed(2).replace('.', ',');

/** Опитите на Калвин: какво става с RuBP и GP, когато изгасим светлината или намалим CO₂. */
export default function CalvinLab() {
  const [kind, setKind] = useState<Kind>('dark');
  const [back, setBack] = useState(false);
  const [t, setT] = useState(30);

  const pts = simulate(kind, back);
  const now = pts[Math.min(pts.length - 1, Math.round(t / (DT * 10)))];
  const line = (key: 'r' | 'g') => pts.map(p => `${gx(p.t).toFixed(1)},${gy(p[key]).toFixed(1)}`).join(' ');

  const changed = t >= T_EVENT && !(back && t >= T_BACK);
  const dark = changed && kind === 'dark';
  const lowCo2 = changed && kind === 'co2';

  let note: string;
  if (!changed && t < T_EVENT) note = 'Светло и много CO₂: двата басейна са постоянни – RuBP се изразходва точно толкова бързо, колкото се възстановява.';
  else if (!changed) note = 'Условията са пак нормални – басейните се връщат към предишните си стойности.';
  else if (dark) note = 'Без светлина няма АТФ и НАДФН: GP не може да се редуцира и се натрупва, а RuBP продължава да се изразходва от РуБисКО и не се възстановява – намалява.';
  else note = 'Малко CO₂: РуБисКО фиксира бавно, RuBP се натрупва, а GP се изразходва и не се образува ново – намалява.';

  const arrow = (from: { x: number; y: number }, to: { x: number; y: number }, active: boolean) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const a = { x: from.x + ux * 24, y: from.y + uy * 24 };
    const b = { x: to.x - ux * 26, y: to.y - uy * 26 };
    return (
      <line
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        className={active ? 'stroke-gray-600 dark:stroke-gray-300' : 'stroke-gray-300 dark:stroke-gray-600'}
        strokeWidth={2}
        strokeDasharray={active ? undefined : '4 4'}
        markerEnd="url(#calvin-arrow)"
      />
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 600 226" className="w-full h-auto max-w-2xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <marker id="calvin-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="fill-gray-500 dark:fill-gray-300" />
          </marker>
        </defs>

        {/* Фон на интервала с промяната */}
        <rect
          x={gx(T_EVENT)}
          y={GY}
          width={gx(back ? T_BACK : T_END) - gx(T_EVENT)}
          height={GH}
          className={kind === 'dark' ? 'fill-gray-800/10 dark:fill-black/30' : 'fill-sky-500/10'}
        />
        <text x={gx(T_EVENT) + 4} y={GY + 12} fontSize="10.5" className="fill-gray-600 dark:fill-gray-300">
          {kind === 'dark' ? 'тъмно' : 'малко CO₂'}
        </text>
        {/* Оси */}
        <line x1={GX} x2={GX + GW} y1={GY + GH} y2={GY + GH} className="stroke-gray-400" />
        <line x1={GX} x2={GX} y1={GY} y2={GY + GH} className="stroke-gray-400" />
        {[0, 1, 2].map(v => (
          <text key={v} x={GX - 6} y={gy(v) + 4} fontSize="10.5" textAnchor="end" fill="currentColor">
            {v}
          </text>
        ))}
        {[0, 20, 40, 60, 80, 100, 120].map(v => (
          <text key={v} x={gx(v)} y={GY + GH + 15} fontSize="10.5" textAnchor="middle" fill="currentColor">
            {v}
          </text>
        ))}
        <text x={GX + GW} y={GY + GH + 30} fontSize="10.5" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          време, s
        </text>
        <text x={16} y={GY + GH / 2} fontSize="10.5" textAnchor="middle" transform={`rotate(-90 16 ${GY + GH / 2})`} fill="currentColor">
          концентрация
        </text>
        <polyline points={line('r')} fill="none" stroke={R_COLOR} strokeWidth={2.5} />
        <polyline points={line('g')} fill="none" stroke={G_COLOR} strokeWidth={2.5} />
        <line x1={gx(t)} x2={gx(t)} y1={GY} y2={GY + GH} className="stroke-gray-500" />
        <circle cx={gx(t)} cy={gy(now.r)} r={4} fill={R_COLOR} />
        <circle cx={gx(t)} cy={gy(now.g)} r={4} fill={G_COLOR} />

        {/* Схемата на цикъла */}
        {arrow(RUBP, GP, !lowCo2)}
        {arrow(GP, G3P, !dark)}
        {arrow(G3P, RUBP, !dark)}
        <circle cx={RUBP.x} cy={RUBP.y} r={6 + 14 * Math.sqrt(now.r)} fill={R_COLOR} fillOpacity={0.85} />
        <circle cx={GP.x} cy={GP.y} r={6 + 12 * Math.sqrt(now.g / 2)} fill={G_COLOR} fillOpacity={0.85} />
        <circle cx={G3P.x} cy={G3P.y} r={13} fill="#16a34a" fillOpacity={0.85} />
        <text x={RUBP.x + 26} y={RUBP.y - 4} fontSize="11" fontWeight="700" fill={R_COLOR}>
          RuBP (5C)
        </text>
        <text x={GP.x - 4} y={GP.y + 36} fontSize="11" fontWeight="700" textAnchor="middle" fill={G_COLOR}>
          GP (3C)
        </text>
        <text x={G3P.x + 4} y={G3P.y + 30} fontSize="11" fontWeight="700" textAnchor="middle" fill="#16a34a">
          G3P (3C)
        </text>
        <text x={CX + 50} y={CY - 32} fontSize="10" textAnchor="middle" className={lowCo2 ? 'fill-gray-400' : 'fill-sky-700 dark:fill-sky-300'}>
          + CO₂
        </text>
        <text x={CX + 50} y={CY - 20} fontSize="10" textAnchor="middle" className={lowCo2 ? 'fill-gray-400' : 'fill-sky-700 dark:fill-sky-300'}>
          РуБисКО
        </text>
        <text x={CX} y={CY + 52} fontSize="10" textAnchor="middle" className={dark ? 'fill-gray-400' : 'fill-amber-700 dark:fill-amber-300'}>
          АТФ, НАДФН
        </text>
        <text x={CX - 50} y={CY - 26} fontSize="10" textAnchor="middle" className={dark ? 'fill-gray-400' : 'fill-amber-700 dark:fill-amber-300'}>
          АТФ
        </text>
        <text x={G3P.x - 18} y={G3P.y + 4} fontSize="10" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          захари ←
        </text>
      </LabSvg>

      <Sliders>
        <Slider label="t, s" value={t} onChange={setT} min={0} max={T_END} step={1} tone="violet" />
      </Sliders>
      <Buttons>
        <DiagramButton active={kind === 'dark'} onClick={() => setKind('dark')}>
          💡 изгаси светлината
        </DiagramButton>
        <DiagramButton active={kind === 'co2'} onClick={() => setKind('co2')}>
          🫧 намали CO₂
        </DiagramButton>
        <DiagramButton active={back} onClick={() => setBack(v => !v)}>
          {back ? '✓ след 85 s – пак нормално' : 'върни условията след 85 s'}
        </DiagramButton>
      </Buttons>
      <div className="mt-3 flex justify-center gap-6 text-xs sm:text-sm">
        <span style={{ color: R_COLOR }} className="font-medium">
          RuBP: <span className="font-mono">{fmt(now.r)}</span>
        </span>
        <span style={{ color: G_COLOR }} className="font-medium">
          GP: <span className="font-mono">{fmt(now.g)}</span>
        </span>
      </div>
      <Note tone="violet">{note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 RuBP – рибулозобисфосфат (5 въглеродни атома); GP – глицерат-3-фосфат (3-фосфоглицерат); G3P – глицералдехид-3-фосфат
        (триозофосфат). Калвин е измервал басейните, като е давал на водорасли ¹⁴CO₂ и бързо ги е убивал във врящ етанол. Числата са от
        опростен модел, но посоката на промените е като в опитите.
      </p>
    </div>
  );
}
