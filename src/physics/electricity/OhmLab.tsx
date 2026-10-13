import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { fmtNum, useSimulation } from '~/physics/sim';

type Element = { id: string; name: string; umin: number; umax: number; imin: number; imax: number; u0: number; step: number; I: (u: number) => number };

// Лампа 12 V / 0,5 A: студената жичка има около 10 пъти по-малко съпротивление от горещата
const bulb = (u: number) => (u <= 0 ? 0 : u / (2.4 + 21.6 * (u / 12) ** 0.8));
// Силициев диод (идеализиран): I = I₀(e^(U/U_T) − 1)
const diode = (u: number) => 1e-12 * (Math.exp(u / 0.02585) - 1);

const ELEMENTS: Element[] = [
  { id: 'resistor', name: 'резистор 20 Ω', umin: 0, umax: 12, imin: 0, imax: 0.7, u0: 6, step: 0.1, I: u => u / 20 },
  { id: 'bulb', name: 'лампа 12 V', umin: 0, umax: 12, imin: 0, imax: 0.7, u0: 6, step: 0.1, I: bulb },
  { id: 'diode', name: 'диод', umin: -1, umax: 0.7, imin: -0.1, imax: 0.7, u0: 0.6, step: 0.01, I: diode },
];

// Веригата: правоъгълник; батерията е отляво, елементът – горе, амперметърът – вдясно
const BOX = { l: 30, t: 40, r: 190, b: 190 };
const PER = 2 * (BOX.r - BOX.l + BOX.b - BOX.t);
/** Точка по контура, като тръгваме от горния ляв ъгъл по часовниковата стрелка. */
function along(s: number) {
  const w = BOX.r - BOX.l;
  const h = BOX.b - BOX.t;
  let d = ((s % PER) + PER) % PER;
  if (d < w) return { x: BOX.l + d, y: BOX.t };
  d -= w;
  if (d < h) return { x: BOX.r, y: BOX.t + d };
  d -= h;
  if (d < w) return { x: BOX.r - d, y: BOX.b };
  d -= w;
  return { x: BOX.l, y: BOX.b - d };
}

// Графиката I(U)
const G = { l: 262, r: 466, t: 22, b: 192 };

/** Закон на Ом и волт-амперни характеристики: резистор, лампа и диод. */
export default function OhmLab() {
  const [k, setK] = useState(0);
  const el = ELEMENTS[k];
  const [u, setU] = useState(el.u0);
  const I = el.I(u);
  // Електроните се движат обратно на условната посока на тока; скоростта е силно преувеличена
  const sim = useSimulation<{ ph: number }>(() => ({ ph: 0 }), (s, dt) => ({ ph: s.ph - I * 160 * dt }), { dt: 1 / 120 });

  const gx = (v: number) => G.l + ((v - el.umin) / (el.umax - el.umin)) * (G.r - G.l);
  const gy = (i: number) => G.b - ((Math.max(el.imin, Math.min(el.imax, i)) - el.imin) / (el.imax - el.imin)) * (G.b - G.t);
  const curve = Array.from({ length: 121 }, (_, n) => el.umin + ((el.umax - el.umin) * n) / 120)
    .map((v, n) => `${n ? 'L' : 'M'} ${gx(v).toFixed(1)} ${gy(el.I(v)).toFixed(1)}`)
    .join(' ');
  const R = Math.abs(I) > 1e-4 ? u / I : null;
  const glow = el.id === 'bulb' ? Math.min(1, (u * I) / 6) : 0;
  const mid = { x: (BOX.l + BOX.r) / 2, y: BOX.t };

  const choose = (i: number) => {
    setK(i);
    setU(ELEMENTS[i].u0);
    sim.reset();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {ELEMENTS.map((e, i) => (
          <DiagramButton key={e.id} active={i === k} onClick={() => choose(i)}>
            {e.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 220">
        <rect x={BOX.l} y={BOX.t} width={BOX.r - BOX.l} height={BOX.b - BOX.t} fill="none" className="stroke-gray-500 dark:stroke-gray-400" strokeWidth="2" />
        {/* Електрони */}
        {Array.from({ length: 18 }, (_, n) => {
          const p = along((n * PER) / 18 + sim.state.ph);
          return <circle key={n} cx={p.x} cy={p.y} r={3} className="fill-sky-500" />;
        })}
        {/* Батерия – дългата черта е +, горе */}
        <rect x={BOX.l - 16} y={100} width={32} height={30} className="fill-white dark:fill-gray-800" />
        <line x1={BOX.l - 14} y1={108} x2={BOX.l + 14} y2={108} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="3" />
        <line x1={BOX.l - 7} y1={120} x2={BOX.l + 7} y2={120} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="5" />
        <Label p={{ x: BOX.l + 26, y: 106 }} size={12} tone="rose">
          +
        </Label>
        <Label p={{ x: BOX.l + 26, y: 124 }} size={12} tone="blue">
          −
        </Label>
        {/* Елементът */}
        {el.id === 'resistor' && <rect x={mid.x - 26} y={mid.y - 9} width={52} height={18} className="fill-amber-100 stroke-amber-600 dark:fill-amber-900/60" strokeWidth="2" />}
        {el.id === 'bulb' && (
          <g>
            <circle cx={mid.x} cy={mid.y} r={16 + 22 * glow} className="fill-amber-300" opacity={0.15 + 0.55 * glow} />
            <circle cx={mid.x} cy={mid.y} r={14} className="fill-white stroke-gray-600 dark:fill-gray-800" strokeWidth="2" />
            <path d={`M ${mid.x - 9} ${mid.y - 9} L ${mid.x + 9} ${mid.y + 9} M ${mid.x + 9} ${mid.y - 9} L ${mid.x - 9} ${mid.y + 9}`} className="stroke-gray-600" strokeWidth="1.5" />
          </g>
        )}
        {el.id === 'diode' && (
          <g>
            <rect x={mid.x - 18} y={mid.y - 14} width={36} height={28} className="fill-white dark:fill-gray-800" />
            <polygon points={`${mid.x - 12},${mid.y - 12} ${mid.x - 12},${mid.y + 12} ${mid.x + 10},${mid.y}`} className="fill-violet-200 stroke-violet-600 dark:fill-violet-900" strokeWidth="2" />
            <line x1={mid.x + 11} y1={mid.y - 12} x2={mid.x + 11} y2={mid.y + 12} className="stroke-violet-600" strokeWidth="3" />
          </g>
        )}
        {/* Амперметър */}
        <circle cx={BOX.r} cy={115} r={15} className="fill-white stroke-gray-600 dark:fill-gray-800" strokeWidth="2" />
        <Label p={{ x: BOX.r, y: 115 }} size={13}>
          A
        </Label>
        <Label p={{ x: (BOX.l + BOX.r) / 2, y: 210 }} size={11}>
          {`U = ${fmtNum(u, 2)} V,  I = ${fmtNum(I, 3)} A`}
        </Label>

        {/* Волт-амперна характеристика */}
        <line x1={G.l} y1={gy(0)} x2={G.r} y2={gy(0)} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <line x1={gx(Math.max(0, el.umin))} y1={G.t} x2={gx(Math.max(0, el.umin))} y2={G.b} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <path d={curve} fill="none" className="stroke-blue-500" strokeWidth="2.5" />
        <line x1={gx(u)} y1={gy(0)} x2={gx(u)} y2={gy(I)} className="stroke-rose-400" strokeDasharray="3 3" />
        <circle cx={gx(u)} cy={gy(I)} r={5} className="fill-rose-500" />
        <Label p={{ x: gx(Math.max(0, el.umin)) + 6, y: G.t + 4 }} size={11} anchor="start">
          I, A
        </Label>
        <Label p={{ x: G.r, y: Math.min(gy(0) + 28, 212) }} size={11} anchor="end">
          U, V
        </Label>
        <Label p={{ x: gx(Math.max(0, el.umin)) - 4, y: gy(0.5) }} size={10} anchor="end">
          0,5
        </Label>
        <line x1={gx(Math.max(0, el.umin)) - 3} y1={gy(0.5)} x2={gx(Math.max(0, el.umin)) + 3} y2={gy(0.5)} className="stroke-gray-400" />
        <Label p={{ x: gx(el.umax), y: gy(0) + 14 }} size={10} anchor="middle">
          {fmtNum(el.umax, 1)}
        </Label>
        {el.umin < 0 && (
          <Label p={{ x: gx(el.umin) + 8, y: gy(0) + 14 }} size={10}>
            {fmtNum(el.umin, 1)}
          </Label>
        )}
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset()} />
      <Sliders>
        <Slider label="U, V" value={u} onChange={setU} min={el.umin} max={el.umax} step={el.step} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'U =', value: `${fmtNum(u, 2)} V`, tone: 'rose' },
            { label: 'I =', value: `${fmtNum(I, 3)} A`, tone: 'blue' },
            { label: 'R = U/I =', value: R === null ? 'много голямо' : `${fmtNum(R, 1)} Ω` },
          ]}
        />
      </div>
      <Note tone="gray">
        {el.id === 'resistor'
          ? 'Права линия през началото: токът е пропорционален на напрежението – законът на Ом важи.'
          : el.id === 'bulb'
            ? 'Кривата се огъва: жичката се нагорещява и съпротивлението ѝ расте – от около 2,4 Ω студена до 24 Ω при 12 V.'
            : u < 0
              ? 'В обратна посока диодът почти не пропуска ток.'
              : u < 0.55
                ? 'Под около 0,6 V токът е нищожен – диодът още „не е отворен“.'
                : 'Над около 0,6 V токът расте лавинообразно – нужен е ограничаващ резистор.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Сините точки са електрони. Те се движат обратно на условната посока на тока (от + към − по външната верига) и в действителност много по-бавно – под милиметър в секунда. Графиката I(U) се нарича волт-амперна характеристика.
      </p>
    </div>
  );
}
