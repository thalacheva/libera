import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { fmtNum, useSimulation } from '~/physics/sim';

const U = 340; // скорост на звука, m/s
const F0 = 500; // честота на източника, Hz
// Мащаб на анимацията: звукът минава 60 px/s, източникът излъчва „гребен“ на всеки 0,4 s
const SPEED = 60;
const EVERY = 0.4;
const LOOP = 6;
const MID = 105;

/** Ефект на Доплер: движещ се източник „настига“ вълните си отпред и се отдалечава от тях отзад. */
export default function DopplerLab() {
  const [M, setM] = useState(0.5);
  const sim = useSimulation<{ t: number }>(() => ({ t: 0 }), (s, dt) => ({ t: (s.t + dt) % LOOP }), { dt: 1 / 120 });
  const t = sim.state.t;

  // Източникът минава през средата в момента t = LOOP/2
  const xs = (time: number) => 240 + M * SPEED * (time - LOOP / 2);
  const fronts = Array.from({ length: Math.floor(t / EVERY) + 1 }, (_, i) => i * EVERY)
    .map(te => ({ cx: xs(te), r: SPEED * (t - te) }))
    .filter(c => c.r > 0.5 && c.r < 420);
  const src = xs(t);

  const ahead = M < 1 ? F0 / (1 - M) : null;
  const behind = F0 / (1 + M);
  const theta = M > 1 ? Math.asin(1 / M) : null;
  const cone = 400;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 210">
        <defs>
          <clipPath id="doppler-clip">
            <rect width={480} height={210} />
          </clipPath>
        </defs>
        <g clipPath="url(#doppler-clip)">
          {fronts.map((c, i) => (
            <circle key={i} cx={c.cx} cy={MID} r={c.r} fill="none" className="stroke-sky-500" strokeWidth="1.5" opacity={Math.max(0.25, 1 - c.r / 420)} />
          ))}
          {theta !== null && (
            <g className="stroke-rose-500" strokeWidth="2.5">
              <line x1={src} y1={MID} x2={src - cone * Math.cos(theta)} y2={MID - cone * Math.sin(theta)} />
              <line x1={src} y1={MID} x2={src - cone * Math.cos(theta)} y2={MID + cone * Math.sin(theta)} />
            </g>
          )}
          <circle cx={src} cy={MID} r={7} className="fill-rose-500 stroke-white dark:stroke-gray-800" strokeWidth="2" />
        </g>
        <text x={466} y={MID} fontSize={20} textAnchor="middle" dominantBaseline="central">
          👂
        </text>
        <text x={14} y={MID} fontSize={20} textAnchor="middle" dominantBaseline="central" transform={`translate(28 0) scale(-1 1)`}>
          👂
        </text>
        <Label p={{ x: 466, y: MID + 24 }} size={11} anchor="end" tone="violet">
          отпред
        </Label>
        <Label p={{ x: 14, y: MID + 24 }} size={11} anchor="start" tone="blue">
          отзад
        </Label>
        <Label p={{ x: 240, y: 200 }} size={11}>
          {`източник: ${F0} Hz, движи се надясно`}
        </Label>
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset()} />
      <Sliders>
        <Slider label="v/u" value={M} onChange={setM} min={0} max={1.5} step={0.05} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'v =', value: `${fmtNum(M * U, 0)} m/s`, tone: 'rose' },
            { label: 'отпред', value: ahead === null ? (M === 1 ? '∞' : 'ударна вълна') : `${fmtNum(ahead, 0)} Hz`, tone: 'violet' },
            { label: 'отзад', value: `${fmtNum(behind, 0)} Hz`, tone: 'blue' },
            ...(theta !== null ? [{ label: 'θ =', value: `${fmtNum((theta * 180) / Math.PI, 1)}°` }] : []),
          ]}
        />
      </div>
      <Note tone={M >= 1 ? 'rose' : 'gray'}>
        {M === 0
          ? 'Неподвижен източник: гребените са концентрични и всеки чува 500 Hz.'
          : M < 1
            ? 'Отпред гребените са сгъстени – по-висок тон; отзад са разредени – по-нисък.'
            : M === 1
              ? 'При скоростта на звука всички гребени отпред се трупат в една стена – „звуковата бариера“.'
              : 'Източникът изпреварва звука си: гребените се събират в конус – ударна вълна. Отпред не се чува нищо, докато конусът не стигне до теб.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 v е скоростта на източника, u = 340 m/s – на звука. Всеки кръг е гребен, излъчен от мястото, където е бил източникът в онзи момент.
        Отпред чуваме f = f₀·u/(u − v), отзад f = f₀·u/(u + v). Над скоростта на звука половината ъгъл на конуса е sin θ = u/v. Анимацията е
        силно забавена.
      </p>
    </div>
  );
}
