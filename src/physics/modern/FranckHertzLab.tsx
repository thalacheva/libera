import { useMemo, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';

type Gas = 'Hg' | 'Ne';
const GASES: Record<Gas, { name: string; dE: number; uMax: number; step: number; glow: string }> = {
  Hg: { name: 'живачни пари', dE: 4.9, uMax: 30, step: 0.1, glow: '#8b5cf6' },
  Ne: { name: 'неон', dE: 18.7, uMax: 80, step: 0.5, glow: '#f97316' },
};
const UR = 1.5; // спиращо напрежение между решетката и колектора, V

// Тръбата: катод K, решетка G, колектор A
const T = { k: 40, g: 400, a: 444, y: 46, h: 22 };
// Графика на енергията на електрона по пътя му
const EG = { top: 92, bottom: 150 };
// Графика I(U)
const IG = { left: 44, right: 462, top: 178, bottom: 300 };

/** Ток през колектора в относителни единици (идеализиран модел с малко размиване). */
function current(U: number, dE: number) {
  if (U <= 0) return 0;
  let sum = 0;
  let wSum = 0;
  // Енергиите на електроните са малко различни – осредняваме с гаусово тегло около U
  for (let i = -30; i <= 30; i++) {
    const w = Math.exp(-((i / 12) ** 2));
    wSum += w;
    const u = U + i * 0.008 * dE;
    if (u <= 0) continue;
    const rest = u - Math.floor(u / dE) * dE; // енергията след последния нееластичен удар, eV
    sum += (w * u ** 1.5) / (1 + Math.exp(-(rest - UR) / 0.3));
  }
  return sum / wSum;
}

/** Опитът на Франк и Херц: електроните губят енергия на порции – точно колкото е първото възбудено ниво на атома. */
export default function FranckHertzLab() {
  const [gas, setGas] = useState<Gas>('Hg');
  const g = GASES[gas];
  const [U, setU] = useState(12);
  const u = Math.min(U, g.uMax);

  const { path, iMax } = useMemo(() => {
    const pts = Array.from({ length: 301 }, (_, i) => (i / 300) * g.uMax).map(v => [v, current(v, g.dE)] as const);
    const max = Math.max(...pts.map(p => p[1]));
    const d = pts
      .map(([v, I], i) => `${i ? 'L' : 'M'} ${(IG.left + (v / g.uMax) * (IG.right - IG.left)).toFixed(1)} ${(IG.bottom - (I / max) * (IG.bottom - IG.top - 8)).toFixed(1)}`)
      .join(' ');
    return { path: d, iMax: max };
  }, [g]);

  // Удари: електронът набира dE на всеки отрязък с дължина dE/U от пътя K → G
  const hits = Math.floor(u / g.dE);
  const zones = Array.from({ length: hits }, (_, i) => T.k + (((i + 1) * g.dE) / u) * (T.g - T.k));
  const rest = u - hits * g.dE;
  const reaches = rest > UR;
  const I = current(u, g.dE) / iMax;

  // Енергията на електрона по пътя: расте линейно и пада до нула при всеки удар
  const ey = (E: number) => EG.bottom - (E / g.dE) * (EG.bottom - EG.top);
  const saw = [`M ${T.k} ${EG.bottom}`];
  zones.forEach(x => saw.push(`L ${x.toFixed(1)} ${EG.top}`, `L ${x.toFixed(1)} ${EG.bottom}`));
  saw.push(`L ${T.g} ${ey(rest).toFixed(1)}`);

  const ix = (v: number) => IG.left + (v / g.uMax) * (IG.right - IG.left);
  const ticks = Array.from({ length: Math.floor(g.uMax / g.dE) }, (_, i) => (i + 1) * g.dE);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {(Object.keys(GASES) as Gas[]).map(k => (
          <DiagramButton
            key={k}
            active={k === gas}
            onClick={() => {
              setGas(k);
              setU(Math.min(U, GASES[k].uMax));
            }}
          >
            {GASES[k].name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 324">
        {/* Тръбата */}
        <rect x={T.k - 14} y={T.y - T.h - 6} width={T.a - T.k + 26} height={2 * T.h + 12} rx={16} className="fill-gray-50 dark:fill-gray-900/40 stroke-gray-300 dark:stroke-gray-600" />
        {zones.map((x, i) => (
          <rect key={i} x={x - 4} y={T.y - T.h} width={8} height={2 * T.h} rx={4} fill={g.glow} opacity={gas === 'Ne' ? 0.75 : 0.35} />
        ))}
        <line x1={T.k} y1={T.y - T.h} x2={T.k} y2={T.y + T.h} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="4" />
        <line x1={T.g} y1={T.y - T.h} x2={T.g} y2={T.y + T.h} className="stroke-gray-500" strokeWidth="2" strokeDasharray="3 3" />
        <line x1={T.a} y1={T.y - T.h} x2={T.a} y2={T.y + T.h} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="4" />
        <Label p={{ x: T.k, y: T.y + T.h + 14 }} size={10}>
          K
        </Label>
        <Label p={{ x: T.g, y: T.y + T.h + 14 }} size={10}>
          G
        </Label>
        <Label p={{ x: T.a, y: T.y + T.h + 14 }} size={10}>
          A
        </Label>
        <Label p={{ x: (T.k + T.g) / 2, y: 10 }} size={10}>
          {`ускоряващо напрежение ${fmtNum(u, 1)} V`}
        </Label>
        <Label p={{ x: (T.g + T.a) / 2, y: 10 }} size={10}>
          {`−${fmtNum(UR, 1)} V`}
        </Label>

        {/* Енергията на електрона по пътя */}
        <line x1={T.k} y1={EG.top} x2={T.g} y2={EG.top} className="stroke-rose-300" strokeWidth="1" strokeDasharray="4 3" />
        <Label p={{ x: T.g + 6, y: EG.top }} size={10} tone="rose" anchor="start">
          {`${fmtNum(g.dE, 1)} eV`}
        </Label>
        <line x1={T.k} y1={ey(UR)} x2={T.g} y2={ey(UR)} className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="1" strokeDasharray="2 3" />
        <Label p={{ x: T.g + 6, y: ey(UR) }} size={10} anchor="start">
          {`${fmtNum(UR, 1)} eV`}
        </Label>
        <line x1={T.k} y1={EG.bottom} x2={T.g} y2={EG.bottom} className="stroke-gray-400" strokeWidth="1" />
        <path d={saw.join(' ')} fill="none" className="stroke-blue-500" strokeWidth="2" />
        <Label p={{ x: T.k - 4, y: (EG.top + EG.bottom) / 2 }} size={10} tone="blue" anchor="end">
          E
        </Label>

        {/* Ток през колектора */}
        <line x1={IG.left} y1={IG.bottom} x2={IG.right} y2={IG.bottom} className="stroke-gray-400" strokeWidth="1.5" />
        <line x1={IG.left} y1={IG.bottom} x2={IG.left} y2={IG.top} className="stroke-gray-400" strokeWidth="1.5" />
        {ticks.map(v => (
          <g key={v}>
            <line x1={ix(v)} y1={IG.top + 4} x2={ix(v)} y2={IG.bottom} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" />
            <Label p={{ x: ix(v), y: IG.bottom + 11 }} size={9}>
              {fmtNum(v, 1)}
            </Label>
          </g>
        ))}
        <path d={path} fill="none" className="stroke-emerald-500" strokeWidth="2" />
        <circle cx={ix(u)} cy={IG.bottom - I * (IG.bottom - IG.top - 8)} r={5} className="fill-emerald-600 stroke-white dark:stroke-gray-800" strokeWidth="2" />
        <Label p={{ x: IG.left + 6, y: IG.top + 4 }} size={11} tone="emerald" anchor="start">
          I
        </Label>
        <Label p={{ x: IG.right, y: IG.bottom - 10 }} size={11} anchor="end">
          U, V
        </Label>
      </ZoomingSvg>

      <Sliders>
        <Slider label="U, V" value={u} onChange={setU} min={0} max={g.uMax} step={g.step} tone="emerald" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'удари:', value: String(hits), tone: 'rose' },
            { label: 'E пред G =', value: `${fmtNum(rest, 1)} eV`, tone: 'blue' },
            { label: 'I ≈', value: `${fmtNum(I * 100, 0)} %`, tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone={reaches ? 'emerald' : 'rose'}>
        {hits === 0
          ? `Под ${fmtNum(g.dE, 1)} V ударите са еластични – електроните не губят енергия и токът расте.`
          : reaches
            ? `Електронът е възбудил ${hits} атом${hits === 1 ? '' : 'а'} и пак има достатъчно енергия да преодолее спирачното поле – токът расте.`
            : `Току-що след удар електронът има само ${fmtNum(rest, 1)} eV – не може да преодолее ${fmtNum(UR, 1)} V до колектора и токът пада.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Горе е тръбата: електроните излизат от катода K и се ускоряват до решетката G, а между G и колектора A има малко спирачно
        напрежение. В средата е енергията на електрона по пътя: при {fmtNum(g.dE, 1)} eV той възбужда атом и губи цялата натрупана енергия.
        Там газът свети ({gas === 'Hg' ? 'при живака – в ултравиолетовото, 254 nm, затова зоните са невидими' : 'при неона – в оранжево-червено'}).
        Долу е токът: спадовете се повтарят през {fmtNum(g.dE, 1)} V. Моделът е идеализиран – в истинската тръба кривата е изместена с
        контактната потенциална разлика.
      </p>
    </div>
  );
}
