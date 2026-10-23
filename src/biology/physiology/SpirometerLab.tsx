import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

type Person = 'man' | 'woman';
/** Приблизителни белодробни обеми на млад възрастен, L: дихателен, резервен вдишван, резервен издишван, остатъчен. */
const PEOPLE: Record<Person, { label: string; tv: number; irv: number; erv: number; rv: number }> = {
  man: { label: 'мъж', tv: 0.5, irv: 3.0, erv: 1.1, rv: 1.2 },
  woman: { label: 'жена', tv: 0.45, irv: 1.9, erv: 0.7, rv: 1.0 },
};
/** Анатомичното мъртво пространство, L. */
const DEAD = 0.15;

type Preset = 'rest' | 'run' | 'shallow';
const PRESETS: Record<Preset, { label: string; tv: number; f: number }> = {
  rest: { label: '😌 покой', tv: 0.5, f: 12 },
  run: { label: '🏃 бягане', tv: 2.0, f: 30 },
  shallow: { label: '😮‍💨 плитко и бързо', tv: 0.25, f: 40 },
};

const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',');

// Чертежът: време 0–40 s, обем 0–7 L
const X0 = 50;
const XW = 440;
const Y0 = 260;
const YH = 230;
const T_MAX = 40;
const V_MAX = 7;
const px = (t: number) => X0 + (t / T_MAX) * XW;
const py = (v: number) => Y0 - (v / V_MAX) * YH;

/** Плавен преход от a към b при s ∈ [0, 1]. */
const ease = (a: number, b: number, s: number) => a + ((b - a) * (1 - Math.cos(Math.PI * s))) / 2;

/** Спирограма: спокойно дишане, по желание – максимално вдишване и издишване; дихателен обем, честота, вентилация. */
export default function SpirometerLab() {
  const [person, setPerson] = useState<Person>('man');
  const [tv, setTv] = useState(0.5);
  const [f, setF] = useState(12);
  const [maneuver, setManeuver] = useState(true);

  const p = PEOPLE[person];
  const vc = p.tv + p.irv + p.erv;
  const tlc = vc + p.rv;
  const frc = p.rv + p.erv;
  // при по-дълбоко дишане вдишването „яде“ от резервния вдишван обем, а издишването – малко и от резервния издишван
  const tvEff = Math.min(tv, vc * 0.85);
  const eev = Math.max(p.rv + 0.1, frc - Math.max(0, tvEff - p.tv) * 0.3);
  const period = 60 / f;
  // маневрата започва в края на издишване, около 14-ата секунда
  const tm = Math.ceil(14 / period) * period;
  const T_IN = 2.5;
  const T_OUT = 5;
  const T_BACK = 1.5;
  const tEnd = tm + T_IN + T_OUT + T_BACK;

  const vol = (t: number) => {
    if (maneuver && t >= tm && t < tEnd) {
      const s = t - tm;
      if (s < T_IN) return ease(eev, tlc, s / T_IN);
      if (s < T_IN + T_OUT) return ease(tlc, p.rv, (s - T_IN) / T_OUT);
      return ease(p.rv, eev, (s - T_IN - T_OUT) / T_BACK);
    }
    const t0 = maneuver && t >= tEnd ? t - tEnd : t;
    return eev + (tvEff * (1 - Math.cos((2 * Math.PI * t0) / period))) / 2;
  };
  const pts: string[] = [];
  for (let k = 0; k <= 800; k++) {
    const t = (k / 800) * T_MAX;
    pts.push(`${px(t).toFixed(1)},${py(vol(t)).toFixed(1)}`);
  }

  const ve = tvEff * f;
  const va = Math.max(0, tvEff - DEAD) * f;

  const bracket = (x: number, a: number, b: number, label: string, color: string, top = false) => (
    <g key={label}>
      <path d={`M ${x - 4} ${py(a)} L ${x} ${py(a)} L ${x} ${py(b)} L ${x - 4} ${py(b)}`} fill="none" stroke={color} strokeWidth={1.8} />
      <text x={top ? x : x + 4} y={top ? py(b) - 6 : (py(a) + py(b)) / 2 + 4} fontSize="11" fill={color} textAnchor={top ? 'middle' : 'start'}>
        {label}
      </text>
    </g>
  );

  const choose = (k: Preset) => {
    setTv(PRESETS[k].tv);
    setF(PRESETS[k].f);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 300" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* мрежа */}
        {Array.from({ length: V_MAX + 1 }, (_, v) => (
          <g key={v}>
            <line x1={X0} x2={X0 + XW} y1={py(v)} y2={py(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={X0 - 6} y={py(v) + 4} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {v}
            </text>
          </g>
        ))}
        {Array.from({ length: T_MAX / 10 + 1 }, (_, k) => (
          <text key={k} x={px(k * 10)} y={Y0 + 16} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {k * 10}
          </text>
        ))}
        <text x={X0 + XW} y={Y0 + 30} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          t, s
        </text>
        <text x={X0 - 40} y={18} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          обем в белите дробове, L
        </text>

        {/* остатъчният обем – спирометърът не го вижда */}
        <rect x={X0} y={py(p.rv)} width={XW} height={py(0) - py(p.rv)} className="fill-gray-300/50 dark:fill-gray-600/50" />
        <text x={X0 + 8} y={py(p.rv / 2) + 4} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          остатъчен обем – не излиза дори при най-силно издишване
        </text>
        <line x1={X0} x2={X0 + XW} y1={py(tlc)} y2={py(tlc)} stroke="#e11d48" strokeDasharray="4 4" />

        <polyline points={pts.join(' ')} fill="none" stroke="#2563eb" strokeWidth={2.2} />

        {/* скоби */}
        {bracket(500, eev, eev + tvEff, 'ДО', '#2563eb')}
        {bracket(500, eev + tvEff, Math.max(eev + tvEff, tlc), 'РВО', '#7c3aed')}
        {bracket(500, p.rv, eev, 'РИО', '#059669')}
        {bracket(500, 0, p.rv, 'ОО', '#6b7280')}
        {bracket(540, p.rv, tlc, 'ЖК', '#e11d48')}
        {bracket(580, 0, p.rv + p.erv, 'ФОК', '#d97706')}
        {bracket(622, 0, tlc, 'ОБК', 'currentColor', true)}
      </LabSvg>

      <Buttons>
        {(Object.keys(PEOPLE) as Person[]).map(k => (
          <DiagramButton key={k} active={person === k} onClick={() => setPerson(k)}>
            {PEOPLE[k].label}
          </DiagramButton>
        ))}
        <DiagramButton active={maneuver} onClick={() => setManeuver(m => !m)}>
          {maneuver ? '✓ максимално вдишване и издишване' : 'само спокойно дишане'}
        </DiagramButton>
      </Buttons>
      <Buttons>
        {(Object.keys(PRESETS) as Preset[]).map(k => (
          <DiagramButton key={k} active={tv === PRESETS[k].tv && f === PRESETS[k].f} onClick={() => choose(k)}>
            {PRESETS[k].label}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="ДО, L" value={tv} onChange={setTv} min={0.2} max={3} step={0.05} tone="blue" />
        <Slider label="f, /min" value={f} onChange={setF} min={6} max={45} step={1} tone="rose" />
      </Sliders>

      <Readout
        items={[
          { label: 'белодробна вентилация', value: `${fmt(ve, 1)} L/min`, tone: 'blue' },
          { label: 'алвеоларна вентилация', value: `${fmt(va, 1)} L/min`, tone: 'emerald' },
          { label: 'стига до алвеолите', value: `${Math.round((va / ve) * 100)} %`, tone: 'violet' },
          { label: 'ЖК / ОБК', value: `${fmt(vc, 1)} / ${fmt(tlc, 1)} L`, tone: 'rose' },
        ]}
      />
      <Formula>
        V̇A = (ДО − МП) · f = ({fmt(tvEff)} − {fmt(DEAD)}) · {f} ≈ {fmt(va, 1)} L/min
      </Formula>
      <Note tone="emerald">
        {tvEff - DEAD < 0.15
          ? 'При плитко и бързо дишане голяма част от всеки дъх само се връща от трахеята и бронхите – мъртвото пространство. Белодробната вентилация може да е голяма, а до алвеолите стига малко въздух.'
          : tvEff >= 1.5
            ? 'При натоварване дихателният обем расте за сметка на резервните обеми, а честотата се увеличава. Мъртвото пространство е малка част от дълбокия дъх.'
            : tv > tvEff
              ? 'Дихателният обем не може да е по-голям от жизнения капацитет – дори при най-тежко натоварване той рядко надминава около половината от него.'
              : 'При спокойно дишане около 150 mL от всеки дъх (мъртвото пространство) не стигат до алвеолите – това е около 30 % от дихателния обем.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 ДО – дихателен обем, РВО – резервен вдишван обем, РИО – резервен издишван обем, ОО – остатъчен обем, ЖК – жизнен капацитет
        (ДО + РВО + РИО), ФОК – функционален остатъчен капацитет (РИО + ОО), ОБК – общ белодробен капацитет, МП – мъртво пространство
        (около 150 mL). Стойностите са приблизителни за млади възрастни – те зависят от ръста, възрастта и тренираността. Сравни
        „плитко и бързо“ с „покой“: белодробната вентилация е почти еднаква, а алвеоларната – не.
      </p>
    </div>
  );
}
