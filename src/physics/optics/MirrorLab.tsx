import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Handle, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import type { Point } from '~/geometry/diagramMath';
import { fmtNum } from '~/physics/sim';

const MX = 250; // плоското огледало е отвесно при x = MX
const TOP = 30;
const BOTTOM = 250;
const AXIS = 140; // главна оптична ос на сферичните огледала
const HEIGHTS = [-75, -50, -25, 25, 50, 75];

type Mode = 'plane' | 'concave' | 'convex';

const deg = (rad: number) => (rad * 180) / Math.PI;

/** Отражение на посоката d спрямо единична нормала n. */
const reflect = (d: Point, n: Point): Point => {
  const k = 2 * (d.x * n.x + d.y * n.y);
  return { x: d.x - k * n.x, y: d.y - k * n.y };
};

/** Плоско огледало (образ, равни ъгли) и сферични огледала (фокус). */
export default function MirrorLab() {
  const [mode, setMode] = useState<Mode>('plane');
  const [obj, setObj] = useState<Point>({ x: 120, y: 90 });
  const [eye, setEye] = useState<Point>({ x: 90, y: 210 });
  const [R, setR] = useState(220);

  // Предметът и окото са пред огледалото (вляво от него)
  const clamp = (p: Point): Point => ({ x: Math.min(MX - 30, Math.max(20, p.x)), y: Math.min(BOTTOM - 10, Math.max(TOP + 10, p.y)) });

  // Образът е симетричен на предмета спрямо огледалото
  const img = { x: 2 * MX - obj.x, y: obj.y };
  // Лъчът към окото изглежда, че идва от образа: пресичаме правата образ–око с огледалото
  const t = (MX - eye.x) / (img.x - eye.x);
  const M = { x: MX, y: eye.y + t * (img.y - eye.y) };
  const hits = M.y >= TOP && M.y <= BOTTOM;
  const angle = deg(Math.atan2(Math.abs(obj.y - M.y), MX - obj.x));

  // Сферично огледало с радиус R: вдлъбнато – центърът е вляво от върха, изпъкнало – вдясно.
  // Върхът на изпъкналото е по-наляво, за да се вижда мнимият фокус зад него.
  const VERTEX = mode === 'concave' ? 420 : 300;
  const f = R / 2;
  const rays = HEIGHTS.map(h => {
    const y = AXIS + h;
    if (mode === 'concave') {
      const C = { x: VERTEX - R, y: AXIS };
      const P = { x: C.x + Math.sqrt(R * R - h * h), y };
      const n = { x: (C.x - P.x) / R, y: (C.y - P.y) / R };
      const r = reflect({ x: 1, y: 0 }, n);
      // Отразеният лъч стига малко след оста
      const s = Math.abs(h / r.y) * 1.35;
      return { P, end: { x: P.x + r.x * s, y: P.y + r.y * s }, back: null };
    }
    const C = { x: VERTEX + R, y: AXIS };
    const P = { x: C.x - Math.sqrt(R * R - h * h), y };
    const n = { x: (P.x - C.x) / R, y: (P.y - C.y) / R };
    const r = reflect({ x: 1, y: 0 }, n);
    const s = 220;
    // Продължението назад (зад огледалото) сочи към мнимия фокус
    const sb = Math.abs(h / r.y);
    return { P, end: { x: P.x + r.x * s, y: P.y + r.y * s }, back: { x: P.x - r.x * sb, y: P.y - r.y * sb } };
  });
  const arc = (sign: 1 | -1) => {
    const C = { x: VERTEX - sign * R, y: AXIS };
    const pts = Array.from({ length: 41 }, (_, i) => {
      const h = -90 + (i / 40) * 180;
      return `${i ? 'L' : 'M'} ${(C.x + sign * Math.sqrt(R * R - h * h)).toFixed(1)} ${(AXIS + h).toFixed(1)}`;
    });
    return pts.join(' ');
  };
  const focus = mode === 'concave' ? VERTEX - f : VERTEX + f;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={mode === 'plane'} onClick={() => setMode('plane')}>
          плоско
        </DiagramButton>
        <DiagramButton active={mode === 'concave'} onClick={() => setMode('concave')}>
          вдлъбнато
        </DiagramButton>
        <DiagramButton active={mode === 'convex'} onClick={() => setMode('convex')}>
          изпъкнало
        </DiagramButton>
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 280">
        {mode === 'plane' ? (
          <>
            <rect x={MX} y={TOP} width={8} height={BOTTOM - TOP} className="fill-sky-200 dark:fill-sky-900" />
            <line x1={MX} y1={TOP} x2={MX} y2={BOTTOM} className="stroke-sky-600" strokeWidth="3" />
            <Label p={{ x: MX + 40, y: BOTTOM + 14 }} size={11}>
              огледало
            </Label>
            {/* Образът – мним, зад огледалото */}
            <circle cx={img.x} cy={img.y} r={7} className="fill-rose-300 dark:fill-rose-800" />
            <Label p={{ x: img.x + 4, y: img.y - 20 }} size={11} tone="rose">
              образ
            </Label>
            <line x1={obj.x} y1={obj.y} x2={img.x} y2={img.y} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="2 4" />
            {hits ? (
              <>
                <line x1={M.x - 70} y1={M.y} x2={M.x} y2={M.y} className="stroke-gray-400" strokeDasharray="4 4" />
                <line x1={obj.x} y1={obj.y} x2={M.x} y2={M.y} className="stroke-amber-500" strokeWidth="2.5" />
                <line x1={M.x} y1={M.y} x2={eye.x} y2={eye.y} className="stroke-amber-500" strokeWidth="2.5" />
                <line x1={M.x} y1={M.y} x2={img.x} y2={img.y} className="stroke-amber-400" strokeWidth="1.5" strokeDasharray="5 4" />
              </>
            ) : null}
            <Label p={{ x: obj.x, y: obj.y - 20 }} size={11} tone="blue">
              предмет
            </Label>
            <Label p={{ x: eye.x, y: eye.y + 20 }} size={11} tone="emerald">
              око
            </Label>
            <Handle p={obj} onMove={p => setObj(clamp(p))} name="предмет" tone="blue" />
            <Handle p={eye} onMove={p => setEye(clamp(p))} name="око" tone="emerald" />
          </>
        ) : (
          <>
            <line x1={20} y1={AXIS} x2={470} y2={AXIS} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="6 4" />
            <path d={arc(mode === 'concave' ? 1 : -1)} fill="none" className="stroke-sky-600" strokeWidth="4" />
            {rays.map(({ P, end, back }, i) => (
              <g key={i}>
                <line x1={20} y1={P.y} x2={P.x} y2={P.y} className="stroke-amber-500" strokeWidth="2" />
                <line x1={P.x} y1={P.y} x2={end.x} y2={end.y} className="stroke-amber-500" strokeWidth="2" />
                {back && <line x1={P.x} y1={P.y} x2={back.x} y2={back.y} className="stroke-amber-400" strokeWidth="1.2" strokeDasharray="4 4" />}
              </g>
            ))}
            {focus <= 470 && (
              <>
                <circle cx={focus} cy={AXIS} r={5} className="fill-rose-500" />
                <Label p={{ x: focus, y: AXIS + 108 }} size={12} tone="rose">
                  {mode === 'concave' ? 'F' : 'F (мним)'}
                </Label>
                <line x1={focus} y1={AXIS + 6} x2={focus} y2={AXIS + 96} className="stroke-rose-300" strokeDasharray="2 3" />
              </>
            )}
            <Label p={{ x: 60, y: 24 }} size={11}>
              успоредни лъчи
            </Label>
          </>
        )}
      </ZoomingSvg>

      {mode === 'plane' ? (
        <>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'падащ ъгъл', value: hits ? `${fmtNum(angle, 1)}°` : '—', tone: 'amber' },
                { label: 'отразен ъгъл', value: hits ? `${fmtNum(angle, 1)}°` : '—', tone: 'amber' },
                { label: 'предмет–огледало', value: `${fmtNum((MX - obj.x) / 20, 1)} m`, tone: 'blue' },
                { label: 'образ–огледало', value: `${fmtNum((img.x - MX) / 20, 1)} m`, tone: 'rose' },
              ]}
            />
          </div>
          <Note tone={hits ? 'emerald' : 'amber'}>
            {hits
              ? 'Окото вижда предмета в посоката на образа – лъчът сякаш идва иззад огледалото.'
              : 'Лъчът към окото трябва да се отрази извън огледалото – оттук окото не вижда образа.'}
          </Note>
        </>
      ) : (
        <>
          <Sliders>
            <Slider label="R, cm" value={R / 20} onChange={v => setR(v * 20)} min={6} max={12} step={0.5} tone="blue" />
          </Sliders>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'R =', value: `${fmtNum(R / 20, 1)} cm`, tone: 'blue' },
                { label: 'f = R/2 =', value: `${fmtNum(f / 20, 2)} cm`, tone: 'rose' },
              ]}
            />
          </div>
          <Note tone="gray">
            {mode === 'concave'
              ? 'Вдлъбнатото огледало събира успоредните лъчи във фокуса. Външните лъчи пресичат оста малко по-близо – затова в телескопите се ползват параболични огледала.'
              : 'Изпъкналото огледало разсейва лъчите – продълженията им назад минават през мнимия фокус. Затова то показва по-широк изглед.'}
          </Note>
        </>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 {mode === 'plane'
          ? 'Премести синята точка (предмета) и зелената (окото). Ъглите се мерят от нормалата – пунктира, перпендикулярен на огледалото. 20 px на чертежа са 1 m.'
          : 'Лъчите идват успоредно на главната оптична ос (пунктира). Промени радиуса на кривината R и виж как се мести фокусът F на разстояние R/2 от огледалото.'}
      </p>
    </div>
  );
}
