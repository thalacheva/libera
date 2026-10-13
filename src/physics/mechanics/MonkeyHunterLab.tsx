import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '../SimControls';
import { fmtNum, useSimulation } from '../sim';

const G = 9.81;
const O = { x: 36, y: 272 };
const PX = 9.2; // пиксела на метър
const sx = (x: number) => O.x + x * PX;
const sy = (y: number) => O.y - y * PX;

/** „Маймуната и ловецът“: стрелата е насочена право към маймуната, а тя се пуска от клона в момента на изстрела. */
export default function MonkeyHunterLab() {
  const [v0, setV0] = useState(25);
  const [D, setD] = useState(30);
  const [H, setH] = useState(18);
  const [holds, setHolds] = useState(false);

  const alpha = Math.atan2(H, D);
  const [vx, vy] = [v0 * Math.cos(alpha), v0 * Math.sin(alpha)];
  const tReach = D / vx;
  // Ако стрелата падне на земята преди дървото, полетът свършва там
  const tGround = (2 * vy) / G;
  const tEnd = Math.min(tReach, tGround);
  const drop = (G * tReach * tReach) / 2;
  const reaches = tReach <= tGround;

  const step = (s: { t: number }, dt: number) => ({ t: Math.min(s.t + dt, tEnd) });
  const sim = useSimulation(() => ({ t: 0 }), step, { dt: 1 / 240 });
  const t = Math.min(sim.state.t, tEnd);
  const fall = (G * t * t) / 2;
  const dart = { x: vx * t, y: vy * t - fall };
  const monkeyY = holds ? H : Math.max(H - fall, 0);
  const restart = () => sim.reset({ t: 0 });
  const set = (f: (n: number) => void) => (n: number) => {
    f(n);
    restart();
  };

  // Посока на стрелата – по скоростта
  const [dvx, dvy] = [vx, vy - G * t];
  const len = Math.hypot(dvx, dvy);
  const tail = { x: sx(dart.x) - (dvx / len) * 16, y: sy(dart.y) + (dvy / len) * 16 };
  const done = t >= tEnd - 1e-9;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton
          active={!holds}
          onClick={() => {
            setHolds(false);
            restart();
          }}
        >
          маймуната се пуска
        </DiagramButton>
        <DiagramButton
          active={holds}
          onClick={() => {
            setHolds(true);
            restart();
          }}
        >
          маймуната се държи
        </DiagramButton>
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 300">
        <line x1={0} y1={O.y} x2={480} y2={O.y} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        {/* Дървото */}
        <rect x={sx(D) - 4} y={sy(H) - 6} width={8} height={O.y - sy(H) + 6} className="fill-amber-700/70" />
        <line x1={sx(D) - 24} y1={sy(H) - 6} x2={sx(D) + 4} y2={sy(H) - 6} className="stroke-amber-700/70" strokeWidth="5" strokeLinecap="round" />
        {/* Линията на прицелване и „падането“ спрямо нея */}
        <line x1={O.x} y1={O.y} x2={sx(D)} y2={sy(H)} className="stroke-gray-400" strokeDasharray="5 4" />
        {t > 0 && (
          <>
            <line x1={sx(dart.x)} y1={sy(dart.y + fall)} x2={sx(dart.x)} y2={sy(dart.y)} className="stroke-rose-500" strokeWidth="2" strokeDasharray="3 3" />
            {!holds && <line x1={sx(D) - 14} y1={sy(H)} x2={sx(D) - 14} y2={sy(monkeyY)} className="stroke-rose-500" strokeWidth="2" strokeDasharray="3 3" />}
          </>
        )}
        <path
          d={Array.from({ length: 61 }, (_, i) => (i / 60) * tEnd)
            .map((s, i) => `${i ? 'L' : 'M'} ${sx(vx * s).toFixed(1)} ${sy(vy * s - (G * s * s) / 2).toFixed(1)}`)
            .join(' ')}
          fill="none"
          className="stroke-blue-300 dark:stroke-blue-700"
          strokeWidth="1.5"
        />
        <text x={sx(D) - 14} y={sy(monkeyY) + 4} fontSize={24} textAnchor="middle" dominantBaseline="central">
          🐒
        </text>
        <line x1={tail.x} y1={tail.y} x2={sx(dart.x)} y2={sy(dart.y)} className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="3" strokeLinecap="round" />
        <circle cx={sx(dart.x)} cy={sy(dart.y)} r={3} className="fill-blue-600 dark:fill-blue-400" />
        <polygon points={`${O.x - 10},${O.y} ${O.x + 10},${O.y} ${O.x},${O.y - 14}`} className="fill-gray-600" />
        <Label p={{ x: (O.x + sx(D)) / 2, y: O.y + 14 }} size={11}>
          {`${D} m`}
        </Label>
        <Label p={{ x: sx(D) + 14, y: (O.y + sy(H)) / 2 }} size={11} anchor="start">
          {`${H} m`}
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={restart} time={t} />
      <Sliders>
        <Slider label="v₀, m/s" value={v0} onChange={set(setV0)} min={10} max={40} step={1} tone="blue" />
        <Slider label="D, m" value={D} onChange={set(setD)} min={10} max={45} step={1} tone="gray" />
        <Slider label="h, m" value={H} onChange={set(setH)} min={5} max={25} step={1} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'до дървото за', value: reaches ? `${fmtNum(tReach, 2)} s` : '—', tone: 'blue' },
            { label: 'падане за това време', value: reaches ? `${fmtNum(drop, 2)} m` : '—', tone: 'rose' },
            { label: 'срещат се на', value: reaches && !holds ? `${fmtNum(H - drop, 2)} m` : '—' },
          ]}
        />
      </div>
      <Note tone={!reaches ? 'amber' : holds ? 'rose' : 'emerald'}>
        {!reaches
          ? 'Стрелата е твърде бавна – пада на земята, преди да стигне дървото (а и маймуната вече е долу).'
          : holds
            ? `Маймуната остава на клона – стрелата минава ${fmtNum(drop, 2)} m под нея.`
            : done
              ? 'Улучена! И стрелата, и маймуната са паднали с еднакво разстояние под линията на прицелване.'
              : 'Пусни стрелата и гледай двете червени отсечки – те растат еднакво.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 D е разстоянието до дървото, h – височината на клона. Ловецът се цели право в маймуната, а тя се пуска от клона в мига на изстрела. Без гравитация стрелата би летяла по пунктира, а
        маймуната би висяла във въздуха. Гравитацията дърпа и двете еднакво – с <i>gt</i>²/2 надолу – затова стрелата винаги уцелва, стига
        да стигне до дървото, преди маймуната да падне на земята. (Опитът се показва с безопасна мишена, не с истинска маймуна!)
      </p>
    </div>
  );
}
