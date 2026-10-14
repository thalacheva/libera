import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { fmtNum, useSimulation } from '~/physics/sim';
import { wavelengthCss } from '~/physics/optics/wavelengthColor';

// Отделителна работа в eV (приблизително – зависи от чистотата на повърхността)
const METALS = [
  { name: 'цезий', A: 2.1 },
  { name: 'калий', A: 2.3 },
  { name: 'натрий', A: 2.4 },
  { name: 'цинк', A: 4.3 },
  { name: 'мед', A: 4.7 },
  { name: 'платина', A: 5.6 },
];

/** Малък генератор на псевдослучайни числа с фиксирано семе. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261014);

// Тръбата: катод вляво, анод вдясно; положението на електрона x е от 0 (катод) до 1 (анод)
const K = 96;
const AN = 284;
const tx = (x: number) => K + x * (AN - K);

// Графиката I(U)
const UMIN = -5;
const UMAX = 3;
const G = { left: 56, right: 462, top: 176, bottom: 282 };
const gx = (u: number) => G.left + ((u - UMIN) / (UMAX - UMIN)) * (G.right - G.left);
const gy = (i: number) => G.bottom - i * (G.bottom - G.top);

/** Фототок като част от тока на насищане: линейно намалява до нула при спиращото напрежение. */
function current(U: number, Us: number) {
  if (Us <= 0) return 0;
  if (U <= -Us) return 0;
  if (U < 0) return 0.7 * (1 + U / Us);
  return 1 - 0.3 * Math.exp(-U / 0.5);
}

type Electron = { x: number; v: number; y: number; t: number };

/** Фотоефект: светлина избива електрони от метал; токът зависи от напрежението между електродите. */
export default function PhotoelectricLab() {
  const [metal, setMetal] = useState(0);
  const [nm, setNm] = useState(400);
  const [bright, setBright] = useState(60);
  const [U, setU] = useState(0);

  const A = METALS[metal].A;
  const E = 1240 / nm; // eV
  const Emax = E - A;
  const works = Emax > 0;
  const Isat = 2 * (bright / 100); // µA
  const I = works ? Isat * current(U, Emax) : 0;

  const sim = useSimulation<Electron[]>(
    () => [],
    (es, dt) => {
      const next: Electron[] = [];
      const a = 0.125 * U; // ускорение в единици дължина/s² – кинетичната енергия расте с eU·x
      for (const e of es) {
        const v = e.v + a * dt;
        const x = e.x + v * dt;
        if (x < 0 || x > 1 || e.t > 6) continue;
        next.push({ ...e, x, v, t: e.t + dt });
      }
      const rate = works ? 40 * (bright / 100) : 0;
      if (next.length < 220 && rand() < rate * dt) {
        // кинетичната енергия на излезлия електрон е между 0 и E_max; v = 0,5·√E_k
        const ek = Emax * rand();
        next.push({ x: 0.001, v: Math.max(0.06, 0.5 * Math.sqrt(ek)), y: 50 + 60 * rand(), t: 0 });
      }
      return next;
    },
    { dt: 1 / 120 },
  );

  const beam = nm < 380 ? '#8b5cf6' : wavelengthCss(nm);
  const curve = Array.from({ length: 161 }, (_, i) => UMIN + (i / 160) * (UMAX - UMIN))
    .map((u, i) => `${i ? 'L' : 'M'} ${gx(u).toFixed(1)} ${gy(works ? (Isat / 2) * current(u, Emax) : 0).toFixed(1)}`)
    .join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {METALS.map((m, i) => (
          <DiagramButton key={m.name} active={i === metal} onClick={() => setMetal(i)}>
            {m.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 300">
        {/* Вакуумна тръба */}
        <rect x={64} y={30} width={250} height={100} rx={40} className="fill-sky-50 stroke-gray-400 dark:fill-gray-900 dark:stroke-gray-500" strokeWidth="2" />
        {/* Светлината пада върху катода */}
        {bright > 0 && <polygon points={`150,0 186,0 ${K + 6},104 ${K + 6},44`} style={{ fill: beam }} opacity={0.15 + 0.5 * (bright / 100)} />}
        <Label p={{ x: 196, y: 12 }} size={11} anchor="start">
          {nm < 380 ? `${nm} nm (УВ)` : `${nm} nm`}
        </Label>
        {/* Електроди */}
        <rect x={K - 8} y={44} width={8} height={72} className="fill-gray-500 dark:fill-gray-400" />
        <rect x={AN} y={44} width={8} height={72} className="fill-gray-500 dark:fill-gray-400" />
        <Label p={{ x: K - 4, y: 124 }} size={10}>
          катод
        </Label>
        <Label p={{ x: AN + 4, y: 124 }} size={10}>
          анод
        </Label>
        {/* Електроните */}
        {sim.state.map((e, i) => (
          <circle key={i} cx={tx(e.x)} cy={e.y} r={2.6} className={e.v < 0 ? 'fill-rose-500' : 'fill-sky-600 dark:fill-sky-400'} />
        ))}
        {/* Веригата: източник и амперметър */}
        <g className="stroke-gray-500" strokeWidth="2" fill="none">
          <polyline points={`${K - 4},116 ${K - 4},150 180,150`} />
          <polyline points={`208,150 300,150`} />
          <polyline points={`336,150 380,150 380,80 ${AN + 8},80`} />
        </g>
        <line x1={182} y1={140} x2={182} y2={160} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="2.5" />
        <line x1={190} y1={144} x2={190} y2={156} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="4" />
        <line x1={198} y1={140} x2={198} y2={160} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="2.5" />
        <line x1={206} y1={144} x2={206} y2={156} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="4" />
        <Label p={{ x: 194, y: 166 }} size={10}>
          {`U = ${fmtNum(U, 1)} V`}
        </Label>
        <circle cx={318} cy={150} r={16} className="fill-white stroke-gray-600 dark:fill-gray-800 dark:stroke-gray-300" strokeWidth="2" />
        <Label p={{ x: 318, y: 150 }} size={12} weight={700}>
          µA
        </Label>
        <Label p={{ x: 400, y: 150 }} size={12} anchor="start" tone="amber">
          {`I = ${fmtNum(I, 2)}`}
        </Label>

        {/* Графика I(U) */}
        <line x1={G.left} y1={G.bottom} x2={G.right} y2={G.bottom} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        <line x1={gx(0)} y1={G.top - 4} x2={gx(0)} y2={G.bottom} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        {[-5, -4, -3, -2, -1, 1, 2, 3].map(u => (
          <Label key={u} p={{ x: gx(u), y: G.bottom + 10 }} size={9} weight={500}>
            {u < 0 ? `−${-u}` : String(u)}
          </Label>
        ))}
        <Label p={{ x: G.right, y: G.bottom - 10 }} size={10} anchor="end">
          U, V
        </Label>
        <Label p={{ x: gx(0) + 6, y: G.top + 2 }} size={10} anchor="start">
          I
        </Label>
        {works && Emax < -UMIN && (
          <>
            <line x1={gx(-Emax)} y1={G.top} x2={gx(-Emax)} y2={G.bottom} className="stroke-rose-500" strokeDasharray="4 3" />
            <Label p={{ x: gx(-Emax) - 4, y: G.top + 6 }} size={10} anchor="end" tone="rose">
              {`−U_s = −${fmtNum(Emax, 2)} V`}
            </Label>
          </>
        )}
        <path d={curve} fill="none" className="stroke-amber-500" strokeWidth="2.5" />
        <circle cx={gx(U)} cy={gy(I / 2)} r={5} className="fill-amber-600" />
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset()} />
      <Sliders>
        <Slider label="λ, nm" value={nm} onChange={setNm} min={200} max={700} step={5} tone="violet" />
        <Slider label="яркост, %" value={bright} onChange={setBright} min={0} max={100} step={5} tone="amber" />
        <Slider label="U, V" value={U} onChange={setU} min={UMIN} max={UMAX} step={0.1} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'hf =', value: `${fmtNum(E, 2)} eV`, tone: 'violet' },
            { label: 'A =', value: `${fmtNum(A, 1)} eV` },
            { label: 'E_k,max =', value: works ? `${fmtNum(Emax, 2)} eV` : '—', tone: 'blue' },
            { label: 'λ₀ =', value: `${fmtNum(1240 / A, 0)} nm`, tone: 'rose' },
          ]}
        />
      </div>
      <Note tone={works ? 'emerald' : 'rose'}>
        {!works
          ? `Фотонът носи ${fmtNum(E, 2)} eV – по-малко от отделителната работа ${fmtNum(A, 1)} eV. Няма нито един избит електрон, колкото и ярка да е светлината. Намали λ под ${fmtNum(1240 / A, 0)} nm.`
          : U <= -Emax
            ? `Задържащото поле спира и най-бързите електрони: ${fmtNum(-U, 1)} V ≥ U_s = ${fmtNum(Emax, 2)} V. Токът е нула – така се мери E_k,max.`
            : U < 0
              ? 'Полето спира по-бавните електрони (червени точки – връщат се). Колкото по-голямо е задържащото напрежение, толкова по-малко стигат до анода.'
              : 'Полето помага на електроните. При голямо U всички избити електрони стигат до анода – токът на насищане е пропорционален на яркостта.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Промени яркостта: токът расте, но спиращото напрежение (червената пунктирна линия) остава на мястото си. Промени λ: при по-къси
        вълни спиращото напрежение расте, а над червената граница λ₀ токът изчезва изцяло. Опитай мед или платина – те изискват ултравиолет.
      </p>
    </div>
  );
}
