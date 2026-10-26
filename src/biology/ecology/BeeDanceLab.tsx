import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { useSimulation } from '~/physics/sim';

/** Около 1 s вилтене на 1 km (по различни изследвания и подвидове – от около 0,75 до 1,3 s на km). */
const S_PER_KM = 1;
/** Под това разстояние пчелата танцува кръгов танц без посока. */
const ROUND_KM = 0.1;
const MAX_KM = 3;

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');
const norm = (a: number) => ((a % 360) + 360) % 360;
const rad = (a: number) => (a * Math.PI) / 180;

// карта отгоре: север е нагоре, азимутът се мери по часовника от север
const MX = 160;
const MY = 160;
const MR = 130; // 3 km
const onMap = (az: number, r: number) => ({ x: MX + r * Math.sin(rad(az)), y: MY - r * Math.cos(rad(az)) });

// пита (вертикална): нагоре = към слънцето
const CX = 490;
const CY = 160;

/** Шест цветни поляни за режима „разчети танца“. */
const PATCHES = [
  { az: 20, km: 2.4 },
  { az: 75, km: 0.8 },
  { az: 140, km: 1.8 },
  { az: 205, km: 2.7 },
  { az: 255, km: 1.2 },
  { az: 320, km: 2 },
];

/** Ъгълът на танца: от вертикалата по часовника, в интервала −180…180. */
const danceAngle = (food: number, sun: number) => {
  const a = norm(food - sun);
  return a > 180 ? a - 360 : a;
};

const sideText = (a: number) =>
  Math.abs(a) < 0.5 ? 'право нагоре' : Math.abs(Math.abs(a) - 180) < 0.5 ? 'право надолу' : `${fmt(Math.abs(a), 0)}° ${a > 0 ? 'вдясно' : 'вляво'} от вертикалата`;

/** Танцът на пчелите: посоката и разстоянието до храната, „преведени“ върху вертикалната пита. */
export default function BeeDanceLab() {
  const [mode, setMode] = useState<'show' | 'decode'>('show');
  const [sun, setSun] = useState(150);
  const [food, setFood] = useState(240);
  const [km, setKm] = useState(1.5);
  // режим „разчети“
  const [target, setTarget] = useState(2);
  const [guess, setGuess] = useState<number | null>(null);
  const [score, setScore] = useState({ ok: 0, all: 0 });

  const sim = useSimulation(() => ({ t: 0 }), (s, dt) => ({ t: s.t + dt }), { dt: 1 / 60 });

  const fAz = mode === 'show' ? food : PATCHES[target].az;
  const fKm = mode === 'show' ? km : PATCHES[target].km;
  const a = danceAngle(fAz, sun);
  const round = fKm < ROUND_KM;
  const waggle = fKm * S_PER_KM;

  // анимация: вилтене по права линия, после връщане по дъга – веднъж отдясно, веднъж отляво
  const L = 90; // дължина на вилтенето в чертежа
  const back = 1.2; // s за връщане
  const cycle = 2 * (waggle + back);
  const tc = sim.time % cycle;
  const half = tc < waggle + back ? 0 : 1;
  const th = tc - half * (waggle + back);
  // в координати на танца: u – по посоката, v – напреки
  let u: number;
  let v: number;
  if (round) {
    const ph = (sim.time / 1.6) * 2 * Math.PI * (half ? -1 : 1);
    u = 35 * Math.sin(ph);
    v = 35 * (1 - Math.cos(ph)) * (half ? -1 : 1);
  } else if (th < waggle) {
    u = -L / 2 + (th / waggle) * L;
    v = 7 * Math.sin(th * 2 * Math.PI * 13);
  } else {
    const ph = ((th - waggle) / back) * Math.PI;
    u = (L / 2) * Math.cos(ph);
    v = (half ? -1 : 1) * 32 * Math.sin(ph);
  }
  // посоката „нагоре“ е −y; ъгълът a е по часовника
  const ux = Math.sin(rad(a));
  const uy = -Math.cos(rad(a));
  const bx = CX + u * ux - v * uy;
  const by = CY + u * uy + v * ux;
  const end = { x: CX + (L / 2 + 14) * ux, y: CY + (L / 2 + 14) * uy };

  const sunPos = onMap(sun, MR + 14);
  const foodPos = onMap(fAz, (fKm / MAX_KM) * MR);

  const pickPatch = (k: number) => {
    if (mode !== 'decode' || guess !== null) return;
    setGuess(k);
    setScore(s => ({ ok: s.ok + (k === target ? 1 : 0), all: s.all + 1 }));
  };
  const newDance = () => {
    setTarget(t => {
      let n = t;
      while (n === t) n = Math.floor(Math.random() * PATCHES.length);
      return n;
    });
    setSun(60 + Math.round(Math.random() * 24) * 10);
    setGuess(null);
    sim.reset();
    sim.play();
  };

  let msg: string;
  if (mode === 'decode') {
    if (guess === null) msg = 'Разгледай танца и посоката на слънцето и щракни поляната, към която сочи пчелата.';
    else if (guess === target) msg = `Точно! Ъгълът на танца (${sideText(a)}) е ъгълът между слънцето и храната, а ${fmt(waggle, 1)} s вилтене значат около ${fmt(fKm, 1)} km.`;
    else msg = `Не е тази. Завърти посоката на танца от „нагоре“ (= към слънцето) със същия ъгъл: храната е на азимут ${fAz}°, около ${fmt(fKm, 1)} km.`;
  } else if (round) msg = 'Храната е съвсем близо: пчелата танцува кръгов танц. Той казва само „има храна наблизо“, а посоката сестрите намират по миризмата.';
  else if (Math.abs(a) < 0.5) msg = 'Храната е точно към слънцето – вилтенето е право нагоре по питата.';
  else if (Math.abs(Math.abs(a) - 180) < 0.5) msg = 'Храната е точно в обратна посока на слънцето – вилтенето е право надолу.';
  else msg = `Храната е на ${fmt(Math.abs(a), 0)}° ${a > 0 ? 'вдясно (по часовника)' : 'вляво'} от слънцето – толкова е наклонено и вилтенето спрямо вертикалата.`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={mode === 'show'} onClick={() => setMode('show')}>
          покажи танца
        </DiagramButton>
        <DiagramButton
          active={mode === 'decode'}
          onClick={() => {
            setMode('decode');
            newDance();
          }}
        >
          разчети танца
        </DiagramButton>
      </Buttons>

      <LabSvg viewBox="0 0 640 320" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-2">
        {/* карта */}
        <circle cx={MX} cy={MY} r={MR} className="fill-lime-50 dark:fill-lime-950/40" stroke="#84cc16" />
        {[1, 2].map(k => (
          <circle key={k} cx={MX} cy={MY} r={(k / MAX_KM) * MR} fill="none" stroke="#a3e635" strokeDasharray="3 4" />
        ))}
        <text x={MX + 4} y={MY + (1 / MAX_KM) * MR + 11} fontSize="10" className="fill-lime-700 dark:fill-lime-400">1 km</text>
        <text x={MX + 4} y={MY + (2 / MAX_KM) * MR + 11} fontSize="10" className="fill-lime-700 dark:fill-lime-400">2 km</text>
        <text x={MX} y={MY - MR + 14} fontSize="12" fontWeight="700" textAnchor="middle" fill="currentColor">С</text>
        <text x={8} y={20} fontSize="12" fontWeight="700" fill="currentColor">отгоре</text>

        {/* слънце */}
        <line x1={MX} y1={MY} x2={sunPos.x} y2={sunPos.y} stroke="#f59e0b" strokeDasharray="5 4" />
        <circle cx={sunPos.x} cy={sunPos.y} r={11} fill="#fbbf24" stroke="#f59e0b" strokeWidth={2} />

        {mode === 'show' && (
          <>
            <line x1={MX} y1={MY} x2={foodPos.x} y2={foodPos.y} stroke="#e11d48" strokeWidth={2} />
            <text x={foodPos.x} y={foodPos.y + 5} fontSize="16" textAnchor="middle">🌼</text>
          </>
        )}
        {mode === 'decode' &&
          PATCHES.map((p, k) => {
            const q = onMap(p.az, (p.km / MAX_KM) * MR);
            const shown = guess !== null && (k === target || k === guess);
            return (
              <g key={k} onClick={() => pickPatch(k)} className={guess === null ? 'cursor-pointer' : ''}>
                <circle cx={q.x} cy={q.y} r={14} fill={shown ? (k === target ? '#bbf7d0' : '#fecaca') : '#fef9c3'} stroke={shown ? (k === target ? '#16a34a' : '#dc2626') : '#ca8a04'} />
                <text x={q.x} y={q.y + 5} fontSize="14" textAnchor="middle">🌼</text>
              </g>
            );
          })}
        <text x={MX} y={MY + 6} fontSize="18" textAnchor="middle">🏠</text>

        {/* пита */}
        <rect x={360} y={20} width={260} height={280} rx={10} fill="#fde68a" stroke="#d97706" opacity={0.85} />
        <text x={490} y={14} fontSize="12" fontWeight="700" textAnchor="middle" fill="currentColor">вертикалната пита в тъмния кошер</text>
        <line x1={CX} y1={CY} x2={CX} y2={38} stroke="#92400e" strokeDasharray="4 4" />
        <text x={CX + 6} y={42} fontSize="11" fill="#92400e">нагоре = към слънцето</text>
        {!round && (
          <>
            <line x1={CX - (L / 2) * ux} y1={CY - (L / 2) * uy} x2={end.x} y2={end.y} stroke="#e11d48" strokeWidth={2} markerEnd="url(#bee-arrow)" />
            {Math.abs(a) > 0.5 && (
              <path
                d={`M ${CX} ${CY - 50} A 50 50 0 ${Math.abs(a) > 180 ? 1 : 0} ${a > 0 ? 1 : 0} ${CX + 50 * ux} ${CY + 50 * uy}`}
                fill="none"
                stroke="#7c3aed"
                strokeWidth={1.5}
              />
            )}
          </>
        )}
        <defs>
          <marker id="bee-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#e11d48" />
          </marker>
        </defs>
        <ellipse cx={bx} cy={by} rx={7} ry={5} fill="#facc15" stroke="#1f2937" strokeWidth={2} />
        <text x={490} y={290} fontSize="11" textAnchor="middle" fill="#92400e">
          {round ? 'кръгов танц' : `вилтене ≈ ${fmt(waggle, 1)} s`}
        </text>
      </LabSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset()} />

      {mode === 'show' ? (
        <Sliders>
          <Slider label="слънце" value={sun} onChange={setSun} min={0} max={355} step={5} tone="amber" />
          <Slider label="храна" value={food} onChange={setFood} min={0} max={355} step={5} tone="rose" />
          <Slider label="km" value={km} onChange={setKm} min={0.05} max={3} step={0.05} tone="emerald" />
        </Sliders>
      ) : (
        <Buttons>
          <DiagramButton onClick={newDance}>нов танц</DiagramButton>
        </Buttons>
      )}

      <div className="mt-3">
        <Readout
          items={[
            { label: 'азимут на слънцето', value: `${sun}°`, tone: 'amber' },
            ...(mode === 'show' ? [{ label: 'азимут на храната', value: `${fAz}°`, tone: 'rose' as const }] : []),
            { label: 'танц', value: round ? 'кръгов' : sideText(a), tone: 'violet' },
            ...(mode === 'decode' ? [{ label: 'познати', value: `${score.ok} от ${score.all}`, tone: 'emerald' as const }] : []),
          ]}
        />
      </div>
      <Note tone="violet">{msg}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Азимутът се мери от север по посоката на часовниковата стрелка. В тъмния кошер пчелата танцува върху вертикалната пита и
        „превежда“ ъгъла между слънцето и храната в ъгъл между вилтенето и посоката нагоре. Колкото по-далеч е храната, толкова по-дълго
        вилти. Тук е взето около 1 s на 1 km – калибровката е различна при различните подвидове и колонии, а пчелите преценяват
        разстоянието по това колко „картина“ е минала пред очите им по пътя. Пусни анимацията и следи как пчелата се връща ту отляво, ту
        отдясно.
      </p>
    </div>
  );
}
