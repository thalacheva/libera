import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';

// ħ²/(2m) за електрона в eV·nm² и ke² в eV·nm
const KIN = 0.0381;
const KE2 = 1.44;
const A0 = (2 * KIN) / KE2; // ≈ 0,0529 nm

const IONS: { Z: number; name: string }[] = [
  { Z: 1, name: 'H' },
  { Z: 2, name: 'He⁺' },
  { Z: 3, name: 'Li²⁺' },
];

const G = { x0: 56, x1: 462, y0: 16, y1: 248 };

/**
 * Оценка на размера на атома: електрон в област с размер r има импулс поне около ħ/r,
 * т.е. кинетична енергия ħ²/(2mr²). Сборът с потенциалната −Zke²/r има минимум при r = a₀/Z.
 */
export default function AtomSizeLab() {
  const [Z, setZ] = useState(1);
  const [quantum, setQuantum] = useState(true);
  const [rPm, setRPm] = useState(100);

  const rMin = A0 / Z; // nm
  const eMin = -(KE2 * Z) / (2 * rMin); // eV
  const rMax = 3.2 * rMin;
  const yTop = -1.4 * eMin;
  const yBot = 1.8 * eMin;

  const r = rPm / 1000;
  const ek = KIN / (r * r);
  const ep = (-KE2 * Z) / r;
  const e = quantum ? ek + ep : ep;

  const gx = (v: number) => G.x0 + (v / rMax) * (G.x1 - G.x0);
  const gy = (v: number) => G.y0 + ((yTop - v) / (yTop - yBot)) * (G.y1 - G.y0);
  const clampY = (v: number) => Math.min(G.y1 + 40, Math.max(G.y0 - 40, gy(v)));

  const curve = (f: (v: number) => number) =>
    Array.from({ length: 240 }, (_, i) => rMax * (0.02 + (0.98 * i) / 239))
      .map((v, i) => `${i ? 'L' : 'M'} ${gx(v).toFixed(1)} ${clampY(f(v)).toFixed(1)}`)
      .join(' ');

  const pick = (z: number) => {
    setZ(z);
    setRPm(Math.round(100 / z));
  };

  // Деления по енергията – кръгли стойности според мащаба
  const step = Z === 1 ? 10 : Z === 2 ? 20 : 50;
  const ticks: number[] = [];
  for (let v = Math.ceil(yBot / step) * step; v <= yTop; v += step) ticks.push(v);
  const rStep = Z === 1 ? 50 : Z === 2 ? 20 : 10; // pm
  const rTicks: number[] = [];
  for (let v = rStep; v / 1000 < rMax; v += rStep) rTicks.push(v);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {IONS.map(ion => (
          <DiagramButton key={ion.Z} active={ion.Z === Z} onClick={() => pick(ion.Z)}>
            {ion.name}
          </DiagramButton>
        ))}
        <DiagramButton active={!quantum} onClick={() => setQuantum(!quantum)}>
          {quantum ? 'без неопределеност' : 'с неопределеност'}
        </DiagramButton>
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 280">
        <defs>
          <clipPath id="atom-size-clip">
            <rect x={G.x0} y={G.y0} width={G.x1 - G.x0} height={G.y1 - G.y0} />
          </clipPath>
        </defs>
        {ticks.map(v => (
          <g key={v}>
            <line x1={G.x0} y1={gy(v)} x2={G.x1} y2={gy(v)} className="stroke-gray-200 dark:stroke-gray-700" strokeDasharray={v === 0 ? undefined : '3 4'} />
            <Label p={{ x: G.x0 - 6, y: gy(v) }} size={10} weight={500} anchor="end">
              {fmtNum(v, 0)}
            </Label>
          </g>
        ))}
        <line x1={G.x0} y1={G.y0} x2={G.x0} y2={G.y1} className="stroke-gray-500 dark:stroke-gray-400" />
        {rTicks.map(v => (
          <Label key={v} p={{ x: gx(v / 1000), y: G.y1 + 12 }} size={10} weight={500}>
            {String(v)}
          </Label>
        ))}
        <Label p={{ x: G.x1, y: G.y1 + 26 }} size={10} anchor="end">
          r, pm
        </Label>
        <Label p={{ x: G.x0 + 6, y: G.y0 + 2 }} size={10} anchor="start">
          E, eV
        </Label>

        <g clipPath="url(#atom-size-clip)">
          {quantum && <path d={curve(v => KIN / (v * v))} fill="none" className="stroke-blue-500" strokeWidth={2} strokeDasharray="6 4" />}
          <path d={curve(v => (-KE2 * Z) / v)} fill="none" className="stroke-rose-500" strokeWidth={2} strokeDasharray="6 4" />
          {quantum && <path d={curve(v => KIN / (v * v) - (KE2 * Z) / v)} fill="none" className="stroke-violet-600" strokeWidth={2.5} />}
          {quantum && <line x1={gx(rMin)} y1={G.y0} x2={gx(rMin)} y2={G.y1} className="stroke-violet-300 dark:stroke-violet-700" strokeDasharray="3 3" />}
          <line x1={gx(r)} y1={G.y0} x2={gx(r)} y2={G.y1} className="stroke-gray-400" strokeWidth={1} />
          <circle cx={gx(r)} cy={gy(e)} r={5} className="fill-violet-600" />
        </g>
        {quantum && (
          <Label p={{ x: G.x1 - 4, y: gy(KIN / (rMax * rMax * 0.3)) }} size={10} tone="blue" anchor="end">
            кинетична ħ²/(2mr²)
          </Label>
        )}
        <Label p={{ x: G.x1 - 4, y: gy((-KE2 * Z) / rMax) + 12 }} size={10} tone="rose" anchor="end">
          потенциална −Zke²/r
        </Label>
      </ZoomingSvg>

      <Sliders>
        <Slider label="r, pm" value={rPm} onChange={setRPm} min={Math.round(12 / Z)} max={Math.round(165 / Z)} step={1} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            ...(quantum ? [{ label: 'Eк =', value: `${fmtNum(ek, 1)} eV`, tone: 'blue' as const }] : []),
            { label: 'Eп =', value: `${fmtNum(ep, 1)} eV`, tone: 'rose' },
            { label: 'E =', value: `${fmtNum(e, 1)} eV`, tone: 'violet' },
          ]}
        />
      </div>
      <Note tone="violet">
        {!quantum
          ? 'Без неопределеността енергията пада безкрайно, когато r → 0: електронът би трябвало да падне в ядрото.'
          : Math.abs(r - rMin) / rMin < 0.06
            ? `Минимумът: r ≈ ${fmtNum(rMin * 1000, 1)} pm и E ≈ ${fmtNum(eMin, 1)} eV – точно радиусът на Бор и енергията на основното състояние${Z > 1 ? ` (по-малък ${Z} пъти, по-дълбок ${Z * Z} пъти)` : ''}.`
            : r < rMin
              ? 'Притиснатият електрон има голям импулс – кинетичната енергия расте по-бързо, отколкото пада потенциалната.'
              : 'Далеч от ядрото привличането е слабо. Намери r, при което пълната енергия е най-малка.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Това е оценка: приемаме, че електрон в област с размер r има импулс p ≈ ħ/r. Точното решение на уравнението на Шрьодингер дава
        същите r и E – съвпадението е малко щастливо, но порядъкът не е случаен. Сравни трите йона: размерът намалява като 1/Z, а енергията
        расте като Z².
      </p>
    </div>
  );
}
