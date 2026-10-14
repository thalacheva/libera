import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum, sig } from '~/physics/sim';

const K0 = 5.123; // √(2mₑ · 1 eV)/ħ в nm⁻¹
const HC_DB = 1.226; // h/√(2mₑ · 1 eV) в nm – дължина на вълната на дьо Бройл при E = 1 eV

// Чертежът: 105 px на нанометър, бариерата започва след 1,6 nm
const PX = 105;
const XL = 16;
const XB = XL + 1.6 * PX;
const XR = 466;
const BASE = 226;
const PER_EV = 22; // px на eV
const AMP = 24;

/** Точна прозрачност на правоъгълна бариера за електрон (E и U в eV, d в nm). */
function transmission(E: number, U: number, d: number) {
  if (Math.abs(E - U) < 1e-9) return 1 / (1 + (K0 * K0 * U * d * d) / (4 * E));
  if (E < U) {
    const s = Math.sinh(K0 * Math.sqrt(U - E) * d);
    return 1 / (1 + (U * U * s * s) / (4 * E * (U - E)));
  }
  const s = Math.sin(K0 * Math.sqrt(E - U) * d);
  return 1 / (1 + (U * U * s * s) / (4 * E * (E - U)));
}

/** Тунелен ефект: електрон срещу правоъгълна бариера – вълната затихва вътре и излиза отслабена отвъд. */
export default function TunnelingLab() {
  const [E, setE] = useState(2); // eV
  const [U, setU] = useState(5); // eV
  const [d, setD] = useState(0.3); // nm

  const k = K0 * Math.sqrt(E); // nm⁻¹
  const over = E >= U;
  const kappa = over ? 0 : K0 * Math.sqrt(U - E);
  const kIn = over ? K0 * Math.sqrt(E - U) : 0;
  const T = transmission(E, U, d);
  const approx = Math.exp(-2 * kappa * d);
  const xE = XB + d * PX;

  const yE = BASE - E * PER_EV;
  const yU = BASE - U * PER_EV;

  // Схематичната вълна: преди бариерата – амплитуда 1, вътре – затихване (или трептене), след нея – амплитуда √T
  const after = Math.sqrt(T);
  const pts: string[] = [];
  for (let x = XL; x <= XR; x += 1.5) {
    const s = (x - XB) / PX; // nm от началото на бариерата
    let v: number;
    if (x < XB) v = Math.cos(k * s);
    else if (x <= xE) v = over ? Math.cos(kIn * s) : Math.exp(-kappa * s);
    else v = after * Math.cos(k * (s - d) + (over ? kIn * d : 0));
    pts.push(`${x.toFixed(1)},${(yE - AMP * v).toFixed(1)}`);
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 262">
        {/* Потенциалът: нула навсякъде, U в бариерата */}
        <rect x={XB} y={yU} width={xE - XB} height={BASE - yU} className="fill-amber-200/70 dark:fill-amber-500/25" />
        <polyline
          points={`${XL},${BASE} ${XB},${BASE} ${XB},${yU} ${xE},${yU} ${xE},${BASE} ${XR},${BASE}`}
          fill="none"
          className="stroke-amber-600 dark:stroke-amber-400"
          strokeWidth="2"
        />
        <Label p={{ x: (XB + xE) / 2, y: yU - 10 }} size={11} tone="amber">
          {`U = ${fmtNum(U, 1)} eV`}
        </Label>

        {/* Енергията на електрона */}
        <line x1={XL} y1={yE} x2={XR} y2={yE} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1" strokeDasharray="5 4" />
        <Label p={{ x: XL + 2, y: yE + 34 }} size={11} anchor="start" tone="blue">
          {`E = ${fmtNum(E, 1)} eV`}
        </Label>

        {/* Вълната */}
        <polyline points={pts.join(' ')} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2.2" />

        {/* Ширината */}
        <line x1={XB} y1={BASE + 14} x2={xE} y2={BASE + 14} className="stroke-gray-500 dark:stroke-gray-400" />
        <Label p={{ x: (XB + xE) / 2, y: BASE + 26 }} size={11}>
          {`d = ${fmtNum(d, 2)} nm`}
        </Label>
        <Label p={{ x: XL + 40, y: BASE + 26 }} size={10} anchor="start">
          падаща вълна →
        </Label>
        <Label p={{ x: XR, y: BASE + 26 }} size={10} anchor="end">
          {`преминала: T = ${T < 0.001 ? sig(T, 2) : `${fmtNum(T * 100, 1)}%`}`}
        </Label>
      </ZoomingSvg>

      <Sliders>
        <Slider label="E, eV" value={E} onChange={setE} min={0.5} max={6} step={0.1} tone="blue" />
        <Slider label="U, eV" value={U} onChange={setU} min={1} max={8} step={0.5} tone="amber" />
        <Slider label="d, nm" value={d} onChange={setD} min={0.1} max={1} step={0.05} tone="gray" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'λ =', value: `${fmtNum(HC_DB / Math.sqrt(E), 2)} nm`, tone: 'violet' },
            ...(over ? [] : [{ label: 'κ =', value: `${fmtNum(kappa, 1)} nm⁻¹`, tone: 'amber' as const }]),
            { label: 'T =', value: sig(T, 3), tone: 'blue' },
            ...(over ? [] : [{ label: 'e^(−2κd) =', value: sig(approx, 3), tone: 'gray' as const }]),
          ]}
        />
      </div>
      <Note tone={over ? 'violet' : 'blue'}>
        {over
          ? 'Енергията е над бариерата – класически електронът минава винаги, но вълната отчасти се отразява и T < 1.'
          : `Класически електронът се отразява винаги. Квантово – минава с вероятност ${T < 0.001 ? sig(T, 2) : `${fmtNum(T * 100, 1)}%`}.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Вълната е нарисувана схематично (без отразената част), но в истински мащаб по дължина. Вътре в бариерата тя не трепти, а затихва
        като e^(−κx). Увеличи d с 0,1 nm: при U − E ≈ 4 eV прозрачността пада около 8 пъти. Сравни точната стойност T с оценката e^(−2κd) –
        при дебела бариера те се различават с множител от порядъка на единица, а самото T се мени с много порядъци.
      </p>
    </div>
  );
}
