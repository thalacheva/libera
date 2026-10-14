import { useState } from 'react';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';
import { wavelengthCss } from '~/physics/optics/wavelengthColor';

const H = 6.63e-34;
const E = 1.6e-19;
const C = 3e8;

// Линиите на живачната лампа, nm (Миликан също мери с живачна дъга)
const LINES = [579, 546, 436, 405, 365, 313, 254];
// Малка „грешка на измерването“ във V – еднаква при всяко зареждане
const NOISE = [0.03, -0.02, 0.02, -0.03, 0.01, 0.02, -0.02];

const METALS = [
  { name: 'натрий', A: 2.4 },
  { name: 'калций', A: 2.9 },
  { name: 'цинк', A: 4.3 },
];

// Графика: f в 10¹⁴ Hz по x, U_s във V по y
const FMAX = 13;
const UMIN = -5;
const UMAX = 3.2;
const G = { left: 50, right: 462, top: 16, bottom: 250 };
const gx = (f: number) => G.left + (f / FMAX) * (G.right - G.left);
const gy = (u: number) => G.bottom - ((u - UMIN) / (UMAX - UMIN)) * (G.bottom - G.top);

/** Опитът на Миликан: спиращото напрежение расте линейно с честотата; наклонът е h/e. */
export default function StoppingVoltageLab() {
  const [metal, setMetal] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const A = METALS[metal].A;

  const freq = (nm: number) => C / (nm * 1e-9) / 1e14; // 10¹⁴ Hz
  const measure = (i: number) => {
    const us = (H * freq(LINES[i]) * 1e14) / E - A;
    return us > 0 ? Math.max(0, us + NOISE[i]) : 0;
  };
  const points = done.map(i => ({ i, f: freq(LINES[i]), u: measure(i), on: (H * freq(LINES[i]) * 1e14) / E > A }));
  const fit = points.filter(p => p.on);

  // Права по метода на най-малките квадрати
  let slope = 0;
  let icpt = 0;
  if (fit.length >= 2) {
    const n = fit.length;
    const mx = fit.reduce((s, p) => s + p.f, 0) / n;
    const my = fit.reduce((s, p) => s + p.u, 0) / n;
    const sxx = fit.reduce((s, p) => s + (p.f - mx) ** 2, 0);
    const sxy = fit.reduce((s, p) => s + (p.f - mx) * (p.u - my), 0);
    slope = sxx > 0 ? sxy / sxx : 0;
    icpt = my - slope * mx;
  }
  const hFit = slope * 1e-14 * E; // J·s
  const f0 = slope > 0 ? -icpt / slope : 0;

  const toggle = (i: number) => setDone(d => (d.includes(i) ? d.filter(x => x !== i) : [...d, i]));
  const choose = (m: number) => {
    setMetal(m);
    setDone([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {METALS.map((m, i) => (
          <DiagramButton key={m.name} active={i === metal} onClick={() => choose(i)}>
            {m.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 280">
        {/* Мрежа и оси */}
        {[2, 4, 6, 8, 10, 12].map(f => (
          <g key={f}>
            <line x1={gx(f)} y1={G.top} x2={gx(f)} y2={G.bottom} className="stroke-gray-100 dark:stroke-gray-700/50" />
            <Label p={{ x: gx(f), y: G.bottom + 12 }} size={10} weight={500}>
              {String(f)}
            </Label>
          </g>
        ))}
        {[-4, -3, -2, -1, 1, 2, 3].map(u => (
          <g key={u}>
            <line x1={G.left} y1={gy(u)} x2={G.right} y2={gy(u)} className="stroke-gray-100 dark:stroke-gray-700/50" />
            <Label p={{ x: G.left - 6, y: gy(u) }} size={10} weight={500} anchor="end">
              {u < 0 ? `−${-u}` : String(u)}
            </Label>
          </g>
        ))}
        <line x1={G.left} y1={gy(0)} x2={G.right} y2={gy(0)} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <line x1={G.left} y1={G.top} x2={G.left} y2={G.bottom} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <Label p={{ x: G.left - 6, y: gy(0) }} size={10} weight={500} anchor="end">
          0
        </Label>
        <Label p={{ x: G.right, y: gy(0) - 10 }} size={10} anchor="end">
          f, 10¹⁴ Hz
        </Label>
        <Label p={{ x: G.left + 6, y: G.top + 6 }} size={10} anchor="start">
          U_s, V
        </Label>

        {/* Правата и продължението ѝ до f = 0 */}
        {fit.length >= 2 && slope > 0 && (
          <>
            <line x1={gx(0)} y1={gy(icpt)} x2={gx(f0)} y2={gy(0)} className="stroke-violet-500" strokeWidth="1.5" strokeDasharray="5 4" />
            <line x1={gx(f0)} y1={gy(0)} x2={gx(FMAX)} y2={gy(Math.min(UMAX, icpt + slope * FMAX))} className="stroke-violet-500" strokeWidth="2.5" />
            <circle cx={gx(0)} cy={gy(icpt)} r={4} className="fill-rose-500" />
            <Label p={{ x: gx(0) + 8, y: gy(icpt) + 2 }} size={10} anchor="start" tone="rose">
              {`−A/e = ${fmtNum(icpt, 2)} V`}
            </Label>
            <circle cx={gx(f0)} cy={gy(0)} r={4} className="fill-amber-500" />
            <Label p={{ x: gx(f0), y: gy(0) + 14 }} size={10} tone="amber">
              {`f₀ = ${fmtNum(f0, 1)}`}
            </Label>
          </>
        )}
        {points.map(p => (
          <circle
            key={p.i}
            cx={gx(p.f)}
            cy={gy(p.u)}
            r={6}
            style={p.on ? { fill: LINES[p.i] < 380 ? '#8b5cf6' : wavelengthCss(LINES[p.i]) } : undefined}
            className={p.on ? 'stroke-gray-700 dark:stroke-gray-200' : 'fill-white stroke-gray-500 dark:fill-gray-800'}
            strokeWidth="1.5"
          />
        ))}
      </ZoomingSvg>

      <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2">Линии на живачната лампа – натисни, за да измериш:</p>
      <Buttons>
        {LINES.map((nm, i) => (
          <DiagramButton key={nm} active={done.includes(i)} onClick={() => toggle(i)}>
            <span className="inline-block w-2.5 h-2.5 rounded-full mr-1 align-middle" style={{ background: nm < 380 ? '#8b5cf6' : wavelengthCss(nm) }} />
            {nm} nm
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton onClick={() => setDone(LINES.map((_, i) => i))}>измери всички</DiagramButton>
        <DiagramButton onClick={() => setDone([])}>изчисти</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={
            fit.length >= 2
              ? [
                  { label: 'наклон h/e =', value: `${fmtNum(slope * 10, 2)} · 10⁻¹⁵ V·s`, tone: 'violet' },
                  { label: 'h =', value: `${fmtNum(hFit * 1e34, 2)} · 10⁻³⁴ J·s`, tone: 'violet' },
                  { label: 'A =', value: `${fmtNum(-icpt, 2)} eV`, tone: 'rose' },
                  { label: 'λ₀ =', value: f0 > 0 ? `${fmtNum(3e8 / (f0 * 1e14) * 1e9, 0)} nm` : '—', tone: 'amber' },
                ]
              : [{ label: 'точки за правата:', value: `${fit.length} от поне 2` }]
          }
        />
      </div>
      <Note tone="violet">
        {points.some(p => !p.on)
          ? 'Празните кръгчета са линии с честота под червената граница – при тях няма ток и не участват в правата.'
          : fit.length < 2
            ? 'Измери поне две линии, които избиват електрони, за да прекараш права.'
            : 'Наклонът на правата е един и същ за всеки метал – това е h/e. Различно е само къде правата пресича осите.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 От уравнението на Айнщайн eU_s = hf − A следва U_s = (h/e)·f − A/e – права линия. Смени метала: правите са успоредни. Продължи
        правата до f = 0 – пресечната точка с вертикалната ос дава −A/e, а с хоризонталната – червената граница f₀. Цинкът „вижда“ само
        ултравиолетовата линия 254 nm – с една точка права не се прекарва.
      </p>
    </div>
  );
}
