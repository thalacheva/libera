import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';

const MEDIA = [
  { name: 'въздух', n: 1, fill: 'fill-white dark:fill-gray-800' },
  { name: 'вода', n: 1.33, fill: 'fill-sky-100 dark:fill-sky-950' },
  { name: 'стъкло', n: 1.5, fill: 'fill-teal-100 dark:fill-teal-950' },
  { name: 'диамант', n: 2.42, fill: 'fill-violet-100 dark:fill-violet-950' },
];

const O = { x: 240, y: 140 }; // точката на падане
const L = 125; // дължина на лъчите
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** Отразена част от неполяризирана светлина (формули на Френел). */
function reflectance(n1: number, n2: number, a: number) {
  const s = (n1 / n2) * Math.sin(a);
  if (s >= 1) return 1;
  const b = Math.asin(s);
  const rs = (n1 * Math.cos(a) - n2 * Math.cos(b)) / (n1 * Math.cos(a) + n2 * Math.cos(b));
  const rp = (n1 * Math.cos(b) - n2 * Math.cos(a)) / (n1 * Math.cos(b) + n2 * Math.cos(a));
  return (rs * rs + rp * rp) / 2;
}

/** Дъга за ъгъл от нормалата: from и to са ъгли в SVG (радиани, по часовниковата стрелка от оста x). */
const arcPath = (r: number, from: number, to: number) =>
  `M ${O.x + r * Math.cos(from)} ${O.y + r * Math.sin(from)} A ${r} ${r} 0 0 ${to > from ? 1 : 0} ${O.x + r * Math.cos(to)} ${O.y + r * Math.sin(to)}`;

/** Пречупване на границата на две среди, пълно вътрешно отражение и оптично влакно. */
export default function SnellLab() {
  const [mode, setMode] = useState<'boundary' | 'fibre'>('boundary');
  const [top, setTop] = useState(0);
  const [bottom, setBottom] = useState(2);
  const [alpha, setAlpha] = useState(40);
  const [theta, setTheta] = useState(30);
  const [clad, setClad] = useState(1.46);

  const n1 = MEDIA[top].n;
  const n2 = MEDIA[bottom].n;
  const a = toRad(alpha);
  const s = (n1 / n2) * Math.sin(a);
  const tir = s > 1;
  const b = tir ? null : Math.asin(s);
  const crit = n1 > n2 ? toDeg(Math.asin(n2 / n1)) : null;
  const R = reflectance(n1, n2, a);

  // Посоки в SVG: падащият лъч идва отгоре вляво към O
  const inc = { x: O.x - L * Math.sin(a), y: O.y - L * Math.cos(a) };
  const refl = { x: O.x + L * Math.sin(a), y: O.y - L * Math.cos(a) };
  const refr = b === null ? null : { x: O.x + L * Math.sin(b), y: O.y + L * Math.cos(b) };

  // Оптично влакно: сърцевина n = 1,5 в обвивка с n = clad; лъчът влиза от въздух под ъгъл θ към оста
  const CORE = 1.5;
  const fib = { x0: 40, x1: 456, top: 115, bottom: 165 };
  const inside = Math.asin(Math.sin(toRad(theta)) / CORE);
  const wallAngle = 90 - toDeg(inside); // ъгъл на падане върху стената, от нормалата
  const fibCrit = toDeg(Math.asin(clad / CORE));
  const guided = wallAngle > fibCrit;
  const path: { x: number; y: number }[] = [{ x: fib.x0, y: (fib.top + fib.bottom) / 2 }];
  let leak: { x: number; y: number } | null = null;
  if (theta === 0) path.push({ x: fib.x1, y: (fib.top + fib.bottom) / 2 });
  else {
    let p = path[0];
    let dy = -1; // първо нагоре
    for (let i = 0; i < 60; i++) {
      const wall = dy < 0 ? fib.top : fib.bottom;
      const x = p.x + Math.abs(wall - p.y) / Math.tan(inside);
      if (x >= fib.x1) {
        path.push({ x: fib.x1, y: p.y + (dy * (fib.x1 - p.x) * Math.tan(inside)) });
        break;
      }
      p = { x, y: wall };
      path.push(p);
      if (!guided) {
        // Част от светлината излиза в обвивката: пречупен лъч под ъгъл β от нормалата
        const out = Math.asin(Math.min(1, (CORE / clad) * Math.sin(toRad(wallAngle))));
        leak = { x: p.x + 45 * Math.sin(out), y: p.y + dy * 45 * Math.cos(out) };
        break;
      }
      dy = -dy;
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={mode === 'boundary'} onClick={() => setMode('boundary')}>
          граница на две среди
        </DiagramButton>
        <DiagramButton active={mode === 'fibre'} onClick={() => setMode('fibre')}>
          оптично влакно
        </DiagramButton>
      </Buttons>
      {mode === 'boundary' && (
        <>
          <div className="flex flex-wrap justify-center items-center gap-2 mt-3 text-sm">
            <span className="text-gray-500 dark:text-gray-400 w-12">горе:</span>
            {MEDIA.map((m, i) => (
              <DiagramButton key={m.name} active={i === top} onClick={() => setTop(i)}>
                {m.name}
              </DiagramButton>
            ))}
          </div>
          <div className="flex flex-wrap justify-center items-center gap-2 mt-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400 w-12">долу:</span>
            {MEDIA.map((m, i) => (
              <DiagramButton key={m.name} active={i === bottom} onClick={() => setBottom(i)}>
                {m.name}
              </DiagramButton>
            ))}
          </div>
        </>
      )}

      {mode === 'boundary' ? (
        <ZoomingSvg viewBox="0 0 480 280">
          <rect x={0} y={0} width={480} height={O.y} className={MEDIA[top].fill} />
          <rect x={0} y={O.y} width={480} height={280 - O.y} className={MEDIA[bottom].fill} />
          <line x1={0} y1={O.y} x2={480} y2={O.y} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
          <line x1={O.x} y1={10} x2={O.x} y2={270} className="stroke-gray-400" strokeDasharray="5 4" />
          <Label p={{ x: 12, y: 18 }} size={12} anchor="start">
            {`${MEDIA[top].name}, n₁ = ${fmtNum(n1, 2)}`}
          </Label>
          <Label p={{ x: 12, y: 262 }} size={12} anchor="start">
            {`${MEDIA[bottom].name}, n₂ = ${fmtNum(n2, 2)}`}
          </Label>
          <Label p={{ x: O.x + 6, y: 18 }} size={10} anchor="start">
            нормала
          </Label>

          <line x1={inc.x} y1={inc.y} x2={O.x} y2={O.y} className="stroke-amber-500" strokeWidth="3" />
          <line x1={O.x} y1={O.y} x2={refl.x} y2={refl.y} className="stroke-amber-500" strokeWidth={tir ? 3 : 2} opacity={Math.max(0.2, Math.sqrt(R))} />
          {refr && <line x1={O.x} y1={O.y} x2={refr.x} y2={refr.y} className="stroke-amber-500" strokeWidth="3" opacity={Math.max(0.3, Math.sqrt(1 - R))} />}

          <path d={arcPath(42, -Math.PI / 2, -Math.PI / 2 - a)} fill="none" className="stroke-blue-500" strokeWidth="1.5" />
          <Label p={{ x: O.x - 58 * Math.sin(a / 2), y: O.y - 58 * Math.cos(a / 2) }} size={13} tone="blue">
            α
          </Label>
          {b !== null && b > 0.02 && (
            <>
              <path d={arcPath(42, Math.PI / 2, Math.PI / 2 - b)} fill="none" className="stroke-rose-500" strokeWidth="1.5" />
              <Label p={{ x: O.x + 58 * Math.sin(b / 2), y: O.y + 58 * Math.cos(b / 2) }} size={13} tone="rose">
                β
              </Label>
            </>
          )}
          {crit !== null && (
            <line
              x1={O.x}
              y1={O.y}
              x2={O.x - 110 * Math.sin(toRad(crit))}
              y2={O.y - 110 * Math.cos(toRad(crit))}
              className="stroke-violet-400"
              strokeDasharray="3 4"
              strokeWidth="1.5"
            />
          )}
          {tir && (
            <Label p={{ x: 360, y: 210 }} size={13} tone="rose">
              пълно вътрешно отражение
            </Label>
          )}
        </ZoomingSvg>
      ) : (
        <ZoomingSvg viewBox="0 0 480 246">
          <rect x={fib.x0} y={fib.top - 30} width={fib.x1 - fib.x0} height={fib.bottom - fib.top + 60} rx={6} className="fill-gray-100 dark:fill-gray-700/50" />
          <rect x={fib.x0} y={fib.top} width={fib.x1 - fib.x0} height={fib.bottom - fib.top} className="fill-teal-100 dark:fill-teal-950" />
          <Label p={{ x: 250, y: fib.top - 16 }} size={11}>
            {`обвивка, n = ${fmtNum(clad, 2)}`}
          </Label>
          <Label p={{ x: 250, y: fib.bottom + 46 }} size={11}>
            зеленото е сърцевината, n = 1,5
          </Label>
          {/* Входящ лъч от въздуха */}
          <line
            x1={fib.x0 - 30 * Math.cos(toRad(theta))}
            y1={(fib.top + fib.bottom) / 2 + 30 * Math.sin(toRad(theta))}
            x2={fib.x0}
            y2={(fib.top + fib.bottom) / 2}
            className="stroke-amber-500"
            strokeWidth="2.5"
          />
          <polyline points={path.map(p => `${p.x},${p.y}`).join(' ')} fill="none" className="stroke-amber-500" strokeWidth="2.5" />
          {leak && <line x1={path[path.length - 1].x} y1={path[path.length - 1].y} x2={leak.x} y2={leak.y} className="stroke-rose-500" strokeWidth="2.5" />}
          <Label p={{ x: 250, y: 228 }} size={12} tone={guided ? 'emerald' : 'rose'}>
            {guided ? 'светлината остава в сърцевината' : 'светлината изтича в обвивката'}
          </Label>
        </ZoomingSvg>
      )}

      <Sliders>
        {mode === 'boundary' ? (
          <Slider label="α, °" value={alpha} onChange={setAlpha} min={0} max={89} step={1} tone="blue" />
        ) : (
          <>
            <Slider label="θ, °" value={theta} onChange={setTheta} min={0} max={80} step={1} tone="amber" />
            <Slider label="n обв." value={clad} onChange={setClad} min={1} max={1.49} step={0.01} tone="gray" />
          </>
        )}
      </Sliders>
      <div className="mt-3">
        {mode === 'boundary' ? (
          <Readout
            items={[
              { label: 'α =', value: `${fmtNum(alpha)}°`, tone: 'blue' },
              { label: 'β =', value: b === null ? 'няма' : `${fmtNum(toDeg(b), 1)}°`, tone: 'rose' },
              { label: 'критичен ъгъл', value: crit === null ? 'няма' : `${fmtNum(crit, 1)}°`, tone: 'violet' },
              { label: 'отразено', value: `${fmtNum(R * 100, 0)}%` },
            ]}
          />
        ) : (
          <Readout
            items={[
              { label: 'ъгъл в стъклото', value: `${fmtNum(toDeg(inside), 1)}°`, tone: 'amber' },
              { label: 'падане по стената', value: `${fmtNum(wallAngle, 1)}°` },
              { label: 'критичен ъгъл', value: `${fmtNum(fibCrit, 1)}°`, tone: 'violet' },
            ]}
          />
        )}
      </div>
      <Note tone={mode === 'boundary' ? (tir ? 'rose' : 'gray') : guided ? 'emerald' : 'rose'}>
        {mode === 'boundary'
          ? tir
            ? `α е по-голям от критичния ъгъл ${fmtNum(crit ?? 0, 1)}° – светлината изобщо не излиза и цялата се отразява.`
            : n2 > n1
              ? 'Към оптически по-плътна среда лъчът се пречупва към нормалата (β < α).'
              : n2 < n1
                ? 'Към оптически по-рядка среда лъчът се отклонява от нормалата (β > α). Пунктирът показва критичния ъгъл.'
                : 'Еднакви среди – лъчът минава, без да се пречупва.'
          : guided
            ? 'Ъгълът на падане по стената е по-голям от критичния – пълно вътрешно отражение при всеки удар.'
            : 'Ъгълът по стената е по-малък от критичния – при всеки удар част от светлината се губи.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Ъглите се мерят от нормалата (пунктира, перпендикулярен на границата). Дебелината на отразения лъч показва каква част от
        светлината се отразява – при малки ъгли тя е само няколко процента. Във влакното θ е ъгълът на входящия лъч спрямо оста;
        колкото по-близо е n на обвивката до 1,5, толкова по-тесен е конусът, който влакното „хваща“.
      </p>
    </div>
  );
}
