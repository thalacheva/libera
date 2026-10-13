import { useId, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum, sig } from '~/physics/sim';
import { wavelengthCss } from './wavelengthColor';

const A = 0.08; // ширина на всяка цепнатина, mm
const Y_MAX = 15; // половин височина на екрана, mm
const MID = 140;
const PX = 120 / Y_MAX; // пиксела на милиметър по екрана
const BAR = 50; // преградата с цепнатините
const SCR = 348; // левият край на екрана

/** sin(x)/x с граница 1 при x → 0. */
const sinc = (x: number) => (Math.abs(x) < 1e-9 ? 1 : Math.sin(x) / x);

/** Опитът на Юнг: две цепнатини, интерференчни ивици на екрана и (при една цепнатина) дифракция. */
export default function DoubleSlitLab() {
  const clipId = useId();
  const [nm, setNm] = useState(600);
  const [d, setD] = useState(0.4);
  const [L, setL] = useState(2);
  const [two, setTwo] = useState(true);

  // λL в mm²: λ[nm] · 10⁻⁶ mm/nm · L[m] · 1000 mm/m
  const lamL = nm * 1e-6 * L * 1000;
  const intensity = (y: number) => {
    const env = sinc((Math.PI * A * y) / lamL) ** 2;
    return two ? Math.cos((Math.PI * d * y) / lamL) ** 2 * env : env;
  };
  const dy = lamL / d;
  const central = (2 * lamL) / A;

  // Цепнатините в схемата – не в мащаб
  const gap = 14 + d * 30;
  const slits = two ? [MID - gap / 2, MID + gap / 2] : [MID];
  const lamPx = 9 + ((nm - 380) / 370) * 9;
  const color = wavelengthCss(nm);

  const rows = Array.from({ length: 241 }, (_, i) => MID - 120 + i);
  const curve = rows.map(py => `${(404 + intensity((MID - py) / PX) * 62).toFixed(1)},${py}`).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={two} onClick={() => setTwo(true)}>
          две цепнатини
        </DiagramButton>
        <DiagramButton active={!two} onClick={() => setTwo(false)}>
          една цепнатина
        </DiagramButton>
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 290">
        <defs>
          <clipPath id={clipId}>
            <rect x={BAR} y={MID - 120} width={SCR - BAR - 6} height={240} />
          </clipPath>
        </defs>
        <rect x={BAR} y={MID - 120} width={SCR - BAR} height={240} className="fill-gray-900" />
        {/* Вълновите фронтове от всяка цепнатина */}
        <g clipPath={`url(#${clipId})`}>
          {slits.map(sy =>
            Array.from({ length: 34 }, (_, k) => (
              <circle key={`${sy}-${k}`} cx={BAR} cy={sy} r={(k + 1) * lamPx} fill="none" stroke={color} strokeWidth="1.5" opacity={0.45} />
            )),
          )}
        </g>
        {/* Източник и преграда */}
        <circle cx={18} cy={MID} r={7} style={{ fill: color }} />
        <line x1={25} y1={MID} x2={BAR} y2={MID} stroke={color} strokeWidth="3" />
        {(() => {
          const parts: [number, number][] = [];
          let y = MID - 120;
          for (const sy of slits) {
            parts.push([y, sy - 4]);
            y = sy + 4;
          }
          parts.push([y, MID + 120]);
          return parts.map(([a, b]) => <line key={a} x1={BAR} y1={a} x2={BAR} y2={b} className="stroke-gray-500 dark:stroke-gray-300" strokeWidth="5" />);
        })()}
        {/* Екранът: ивиците в истински мащаб */}
        {rows.map(py => (
          <rect key={py} x={SCR} y={py} width={16} height={1.2} style={{ fill: wavelengthCss(nm, intensity((MID - py) / PX)) }} />
        ))}
        <rect x={SCR} y={MID - 120} width={16} height={240} fill="none" className="stroke-gray-400" />
        {[-10, -5, 0, 5, 10].map(v => (
          <Label key={v} p={{ x: 370, y: MID - v * PX }} size={10} weight={500} anchor="start">
            {String(v).replace('-', '−')}
          </Label>
        ))}
        <Label p={{ x: 366, y: 10 }} size={10} anchor="start">
          y, mm
        </Label>
        {/* Интензитетът по екрана */}
        <line x1={404} y1={MID - 120} x2={404} y2={MID + 120} className="stroke-gray-400 dark:stroke-gray-500" />
        <polyline points={curve} fill="none" stroke={color} strokeWidth="2" />
        <Label p={{ x: 470, y: 10 }} size={10} anchor="end">
          I
        </Label>
        <Label p={{ x: BAR, y: 274 }} size={10}>
          {two ? 'цепнатини' : 'цепнатина'}
        </Label>
        <Label p={{ x: (BAR + SCR) / 2, y: 274 }} size={10}>
          {`L = ${fmtNum(L, 1)} m (схемата не е в мащаб)`}
        </Label>
        <Label p={{ x: SCR + 8, y: 274 }} size={10}>
          екран
        </Label>
      </ZoomingSvg>

      <Sliders>
        <Slider label="λ, nm" value={nm} onChange={setNm} min={380} max={750} step={10} tone="violet" />
        {two && <Slider label="d, mm" value={d} onChange={setD} min={0.2} max={0.8} step={0.05} tone="blue" />}
        <Slider label="L, m" value={L} onChange={setL} min={1} max={3} step={0.1} tone="gray" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={
            two
              ? [
                  { label: 'Δy = λL/d =', value: `${sig(dy, 3)} mm`, tone: 'blue' },
                  { label: 'ивици на екрана ≈', value: String(2 * Math.floor(Y_MAX / dy) + 1) },
                ]
              : [
                  { label: 'a =', value: `${fmtNum(A, 2)} mm` },
                  { label: 'централен максимум 2λL/a =', value: `${sig(central, 3)} mm`, tone: 'violet' },
                ]
          }
        />
      </div>
      <Note tone={two ? 'blue' : 'violet'}>
        {two
          ? 'Червената светлина дава по-широки ивици от синята; по-близките цепнатини – също.'
          : 'При една цепнатина остава широко централно петно – дифракция. Яркостта е нормирана: истинската е 4 пъти по-слаба.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Вълните от двете цепнатини се срещат на екрана. Там, където разликата в пътищата е цяло число дължини на вълната, те се усилват
        (светли ивици), а където е половин дължина повече – гасят (тъмни). Ивиците и графиката вдясно са пресметнати в истински мащаб;
        фронтовете отляво са само схема – истинската дължина на вълната е под микрометър. Всяка цепнатина е широка 0,08 mm.
      </p>
    </div>
  );
}
