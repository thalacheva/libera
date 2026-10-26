import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { SimControls } from '~/physics/SimControls';
import { useSimulation } from '~/physics/sim';

/** Немиелинизирано влакно: v ≈ 1 m/s · √(d / 1 µm) (калмар: 500 µm → около 22 m/s). */
const vBare = (d: number) => Math.sqrt(d);
/** Миелинизирано влакно: v ≈ 6 m/s на µm диаметър (правилото на Хърш). */
const vMyelin = (d: number) => 6 * d;

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');
const fmtT = (ms: number) => (ms < 1000 ? `${fmt(ms, ms < 10 ? 1 : 0)} ms` : `${fmt(ms / 1000, 2)} s`);

// чертеж
const X0 = 70;
const X1 = 600;
const Y_BARE = 80;
const Y_MYEL = 200;
const NODES = 16; // нарисувани възли на Ранвие (в действителност са на около 1 mm един от друг)

/** Провеждане на импулса: немиелинизирано и миелинизирано влакно в надпревара. */
export default function ConductionLab() {
  const [dBare, setDBare] = useState(1);
  const [dMyel, setDMyel] = useState(10);
  const [len, setLen] = useState(1);
  const [slow, setSlow] = useState(50);

  const vb = vBare(dBare);
  const vm = vMyelin(dMyel);
  const tb = (len / vb) * 1000; // ms
  const tm = (len / vm) * 1000;

  // времето в симулацията е в ms; slow – колко ms физично време минават за 1 s на екрана
  const sim = useSimulation(
    () => ({ t: 0 }),
    (s, dt) => ({ t: Math.min(s.t + dt * slow, Math.max(tb, tm) * 1.02) }),
    { dt: 1 / 120 },
  );
  const t = sim.state.t;
  const xb = X0 + Math.min(1, t / tb) * (X1 - X0);
  // при миелинизираното влакно импулсът „прескача“ от възел на възел
  const fm = Math.min(1, t / tm);
  const node = Math.floor(fm * NODES + 1e-9);
  const xm = X0 + (node / NODES) * (X1 - X0);
  const same = vm * vm; // диаметър (µm) на немиелинизирано влакно със същата скорост

  const seg = (X1 - X0) / NODES;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 270" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* неврони: тяло вляво, мускул вдясно */}
        {[Y_BARE, Y_MYEL].map(y => (
          <g key={y}>
            <circle cx={X0 - 26} cy={y} r={18} fill="#fda4af" stroke="#e11d48" />
            <text x={X0 - 26} y={y + 4} fontSize="10" textAnchor="middle" fill="#9f1239">тяло</text>
            <rect x={X1 + 6} y={y - 16} width={24} height={32} rx={8} fill="#fecaca" stroke="#dc2626" />
          </g>
        ))}

        <text x={X0} y={Y_BARE - 30} fontSize="13" fontWeight="700" fill="currentColor">
          без миелин, d = {fmt(dBare)} µm → {fmt(vb)} m/s
        </text>
        <line x1={X0 - 8} x2={X1 + 6} y1={Y_BARE} y2={Y_BARE} stroke="#94a3b8" strokeWidth={Math.min(14, 2 + dBare / 2)} strokeLinecap="round" />
        {t > 0 && <line x1={X0} x2={xb} y1={Y_BARE} y2={Y_BARE} stroke="#fb7185" strokeWidth={Math.min(14, 2 + dBare / 2)} opacity={0.35} />}
        <circle cx={xb} cy={Y_BARE} r={9} fill="#e11d48" opacity={t > 0 ? 0.9 : 0} />

        <text x={X0} y={Y_MYEL - 30} fontSize="13" fontWeight="700" fill="currentColor">
          с миелин, d = {fmt(dMyel)} µm → {fmt(vm, 0)} m/s
        </text>
        <line x1={X0 - 8} x2={X1 + 6} y1={Y_MYEL} y2={Y_MYEL} stroke="#94a3b8" strokeWidth={3} />
        {Array.from({ length: NODES }, (_, k) => (
          <rect key={k} x={X0 + k * seg + 3} y={Y_MYEL - 10} width={seg - 6} height={20} rx={9} fill="#fde68a" stroke="#d97706" />
        ))}
        {Array.from({ length: NODES + 1 }, (_, k) => (
          <circle key={k} cx={X0 + k * seg} cy={Y_MYEL} r={3} fill={t > 0 && k <= node ? '#e11d48' : '#64748b'} />
        ))}
        <circle cx={xm} cy={Y_MYEL} r={9} fill="#e11d48" opacity={t > 0 ? 0.9 : 0} />
        <text x={X0 + seg / 2} y={Y_MYEL + 30} fontSize="11" textAnchor="middle" className="fill-amber-700 dark:fill-amber-400">миелин</text>
        <text x={X0 + seg} y={Y_MYEL + 44} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">възел на Ранвие</text>

        <text x={X0} y={258} fontSize="12" fill="currentColor">
          разстояние {fmt(len, 2)} m · t = {fmtT(t)}
        </text>
        <text x={X1} y={258} fontSize="12" textAnchor="end" fill="currentColor">
          забавяне {slow === 50 ? '1 : 50' : '1 : 1000'}
        </text>
      </LabSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset()} />
      <Buttons>
        <DiagramButton active={slow === 50} onClick={() => setSlow(50)}>
          забавено 50 пъти
        </DiagramButton>
        <DiagramButton active={slow === 1000} onClick={() => setSlow(1000)}>
          забавено 1000 пъти
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="гол, µm" value={dBare} onChange={setDBare} min={0.2} max={20} step={0.1} tone="rose" />
        <Slider label="миелин" value={dMyel} onChange={setDMyel} min={1} max={20} step={0.5} tone="amber" />
        <Slider label="път, m" value={len} onChange={setLen} min={0.1} max={2} step={0.05} tone="blue" />
      </Sliders>

      <Readout
        items={[
          { label: 'без миелин', value: fmtT(tb), tone: 'rose' },
          { label: 'с миелин', value: fmtT(tm), tone: 'amber' },
          { label: 'пъти по-бързо', value: fmt(tm > 0 ? tb / tm : 0), tone: 'violet' },
          { label: 'гол аксон със същата v', value: same >= 1000 ? `${fmt(same / 1000, 1)} mm` : `${fmt(same, 0)} µm`, tone: 'blue' },
        ]}
      />
      <Note tone="amber">
        {vm > vb * 5
          ? `Миелинът прави влакното ${fmt(vm / vb, 0)} пъти по-бързо. За да стигне ${fmt(vm, 0)} m/s без миелин, аксонът би трябвало да е дебел около ${same >= 1000 ? `${fmt(same / 1000, 1)} mm` : `${fmt(same, 0)} µm`} – гръбначният мозък не би побрал хиляди такива влакна.`
          : 'Скоростите са сравними: тънките миелинизирани влакна не са много по-бързи от дебелите голи. Сравни 1 µm без миелин с 10 µm с миелин.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Приблизителни правила: при голите влакна скоростта расте като корен от диаметъра (около 1 m/s при 1 µm, около 22 m/s
        при 500 µm – гигантският аксон на калмара), а при миелинизираните – правопропорционално, около 6 m/s за всеки микрометър
        (влакната за мускулите и за положението на тялото са 12–20 µm и провеждат 70–120 m/s). На чертежа възлите на Ранвие са
        16; в истински нерв са на около 1 mm един от друг – за метър път са около хиляда.
      </p>
    </div>
  );
}
