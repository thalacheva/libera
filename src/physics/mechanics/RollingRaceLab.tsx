import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { type Tone, tones } from '~/geometry/diagramMath';
import { SimControls } from '../SimControls';
import { fmtNum, useSimulation } from '../sim';

const G = 9.81;
const LENGTH = 2; // дължина на наклона, m

/** Телата в надпреварата: k = I/(mR²); кубчето се плъзга без триене и не се върти. */
const BODIES: { name: string; k: number; tone: Tone; shape: 'block' | 'sphere' | 'disc' | 'ring' }[] = [
  { name: 'кубче (без триене)', k: 0, tone: 'gray', shape: 'block' },
  { name: 'плътно кълбо', k: 0.4, tone: 'rose', shape: 'sphere' },
  { name: 'плътен цилиндър', k: 0.5, tone: 'blue', shape: 'disc' },
  { name: 'обръч', k: 1, tone: 'amber', shape: 'ring' },
];

const LANE = 30;
const R = 9; // радиус на телата в пиксели

/** Надпревара по наклон: при търкаляне част от енергията отива във въртене, затова тялото с по-малко k е по-бързо. */
export default function RollingRaceLab() {
  const [deg, setDeg] = useState(20);
  const alpha = (deg * Math.PI) / 180;
  const acc = BODIES.map(b => (G * Math.sin(alpha)) / (1 + b.k));
  const finish = acc.map(a => Math.sqrt((2 * LENGTH) / a));
  const tEnd = Math.max(...finish);

  const sim = useSimulation<{ t: number }>(() => ({ t: 0 }), (s, dt) => (s.t >= tEnd ? s : { t: s.t + dt }), { dt: 1 / 500, speed: 0.5 });
  const t = sim.state.t;

  // Наклонът в пиксели – да се побира и при малък, и при голям ъгъл
  const lenPx = Math.min(380, 150 / Math.sin(alpha));
  const dir = { x: Math.cos(alpha), y: Math.sin(alpha) };
  const normal = { x: Math.sin(alpha), y: -Math.cos(alpha) };
  const startOf = (i: number) => ({ x: 50, y: 40 + i * LANE });

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 290">
        {BODIES.map((b, i) => {
          const S = startOf(i);
          const E = { x: S.x + dir.x * lenPx, y: S.y + dir.y * lenPx };
          const s = Math.min(LENGTH, (acc[i] * t * t) / 2);
          const along = (s / LENGTH) * lenPx;
          // Центърът е над наклона, на разстояние R по нормалата
          const c = { x: S.x + dir.x * along + normal.x * R, y: S.y + dir.y * along + normal.y * R };
          const turn = along / R; // ъгъл на завъртане при търкаляне без плъзгане, rad
          const spoke = { x: c.x + R * Math.cos(turn + alpha), y: c.y + R * Math.sin(turn + alpha) };
          const done = t >= finish[i] - 1e-9;
          return (
            <g key={b.name}>
              <line x1={S.x} y1={S.y} x2={E.x} y2={E.y} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" />
              {b.shape === 'block' ? (
                <rect
                  x={-R}
                  y={-R}
                  width={2 * R}
                  height={2 * R}
                  transform={`translate(${c.x} ${c.y}) rotate(${deg})`}
                  className={tones[b.tone].fill}
                />
              ) : (
                <g>
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={b.shape === 'ring' ? R - 2 : R}
                    className={b.shape === 'ring' ? `fill-none ${tones[b.tone].stroke}` : tones[b.tone].fill}
                    strokeWidth={b.shape === 'ring' ? 4 : 0}
                    fillOpacity={b.shape === 'disc' ? 0.75 : 1}
                  />
                  <line x1={c.x} y1={c.y} x2={spoke.x} y2={spoke.y} className="stroke-white dark:stroke-gray-900" strokeWidth="2" />
                  {b.shape === 'ring' && <line x1={c.x} y1={c.y} x2={spoke.x} y2={spoke.y} className={tones[b.tone].stroke} strokeWidth="2" />}
                </g>
              )}
              {done && (
                <Label p={{ x: Math.min(E.x + 14, 470), y: E.y - 6 }} size={11} tone={b.tone} anchor={E.x + 14 > 440 ? 'end' : 'start'}>
                  {`${fmtNum(finish[i], 2)} s`}
                </Label>
              )}
            </g>
          );
        })}
        <Label p={{ x: 60, y: 22 }} size={11} anchor="start">
          {`наклон ${deg}°, дължина 2 m`}
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset()} time={t} />
      <Sliders>
        <Slider
          label="α, °"
          value={deg}
          onChange={d => {
            setDeg(d);
            sim.reset();
          }}
          min={5}
          max={40}
          step={1}
          tone="gray"
        />
      </Sliders>
      <div className="mt-3 space-y-2">
        {BODIES.map((b, i) => (
          <Readout
            key={b.name}
            items={[
              { label: b.name, value: `k = ${fmtNum(b.k, 1)}`, tone: b.tone },
              { label: 'a =', value: `${fmtNum(acc[i], 2)} m/s²` },
              { label: 't =', value: `${fmtNum(finish[i], 2)} s` },
              { label: 'v долу =', value: `${fmtNum(acc[i] * finish[i], 2)} m/s` },
            ]}
          />
        ))}
      </div>
      <Note tone="gray">Редът винаги е един и същ: кубче, кълбо, цилиндър, обръч – при всеки ъгъл, маса и радиус.</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 При търкаляне без плъзгане ускорението е a = g·sin α / (1 + k), където k = I/(mR²) зависи само от формата. Обръчът има цялата
        маса далеч от оста (k = 1) и половината му енергия отива във въртене. Анимацията е забавена 2 пъти.
      </p>
    </div>
  );
}
