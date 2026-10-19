import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { gcd } from '~/drill';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { METALS, type Metal, volts } from './redoxData';

const SOLUTION: Record<string, string> = {
  Cu: 'fill-sky-300/70',
  Ni: 'fill-emerald-300/70',
  Fe: 'fill-lime-200/70',
};
const METAL_FILL: Record<string, string> = {
  Cu: 'fill-orange-400',
  Ag: 'fill-gray-200',
  Zn: 'fill-slate-400',
  Mg: 'fill-gray-300',
  Al: 'fill-gray-300',
  Fe: 'fill-stone-500',
  Ni: 'fill-zinc-400',
  Pb: 'fill-slate-500',
};

// Скала на потенциалите под клетката
const S_MIN = -2.5;
const S_MAX = 1;
const sx = (E: number) => 40 + ((E - S_MIN) / (S_MAX - S_MIN)) * 400;

/** Полуклетка: чаша с разтвор на соли на метала и пластинка от метала. */
function HalfCell({ x, m, role }: { x: number; m: Metal; role: 'анод' | 'катод' | null }) {
  return (
    <g>
      <rect x={x} y={110} width={130} height={80} className={SOLUTION[m.s] ?? 'fill-gray-200/70 dark:fill-gray-600/60'} />
      <path d={`M ${x} 80 L ${x} 190 L ${x + 130} 190 L ${x + 130} 80`} fill="none" className="stroke-gray-500 dark:stroke-gray-300" strokeWidth="2" />
      <rect x={x + 50} y={64} width={30} height={110} className={`${METAL_FILL[m.s]} stroke-gray-700`} strokeWidth="1" />
      <text x={x + 65} y={100} fontSize="13" fontWeight="700" textAnchor="middle" className="fill-gray-900">
        {m.s}
      </text>
      <text x={x + 26} y={170} fontSize="11" textAnchor="middle" className="fill-gray-800 dark:fill-gray-900">
        {m.ion}
      </text>
      {role && (
        <text x={x + 65} y={210} fontSize="13" fontWeight="700" textAnchor="middle" className={role === 'анод' ? 'fill-sky-600 dark:fill-sky-400' : 'fill-rose-600 dark:fill-rose-400'}>
          {role} ({role === 'анод' ? '−' : '+'})
        </text>
      )}
    </g>
  );
}

/** Галваничен елемент от два метала: кой е анод, кой е катод и какво е напрежението. */
export default function GalvanicCellLab() {
  const [a, setA] = useState(2); // Zn
  const [b, setB] = useState(6); // Cu
  const L = METALS[a];
  const R = METALS[b];
  const same = a === b;
  const anode = L.E < R.E ? L : R;
  const cathode = L.E < R.E ? R : L;
  const emf = cathode.E - anode.E;
  const leftIsAnode = anode === L;

  // Обща реакция: електроните от анода = електроните към катода
  const lcm = (anode.z * cathode.z) / gcd(anode.z, cathode.z);
  const kA = lcm / anode.z;
  const kC = lcm / cathode.z;
  const k = (n: number) => (n > 1 ? n : '');
  const overall = `${k(kA)}${anode.s} + ${k(kC)}${cathode.ion} → ${k(kA)}${anode.ion} + ${k(kC)}${cathode.s}`;

  const arrow = leftIsAnode ? '→' : '←';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      {[
        ['лява полуклетка', a, setA],
        ['дясна полуклетка', b, setB],
      ].map(([label, value, set]) => (
        <div key={label as string} className="mt-2">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">{label as string}</p>
          <Buttons>
            {METALS.map((m, i) => (
              <DiagramButton key={m.s} active={i === value} onClick={() => (set as (v: number) => void)(i)}>
                {m.s}
              </DiagramButton>
            ))}
          </Buttons>
        </div>
      ))}

      <LabSvg viewBox="0 0 480 290" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {/* проводник и волтметър */}
        <path d="M 105 64 L 105 30 L 215 30 M 265 30 L 375 30 L 375 64" fill="none" className="stroke-gray-600 dark:stroke-gray-300" strokeWidth="2.5" />
        <circle cx={240} cy={30} r={25} className="fill-white stroke-gray-600 dark:fill-gray-900 dark:stroke-gray-300" strokeWidth="2" />
        <text x={240} y={35} fontSize="13" fontWeight="700" textAnchor="middle" fill="currentColor">
          {same ? '0 V' : `${volts(emf)} V`}
        </text>
        {!same && (
          <>
            <text x={160} y={22} fontSize="12" fontWeight="700" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400">
              e⁻ {arrow}
            </text>
            <text x={320} y={22} fontSize="12" fontWeight="700" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400">
              e⁻ {arrow}
            </text>
          </>
        )}
        {/* солеви мост */}
        <path d="M 150 135 L 150 92 L 330 92 L 330 135" fill="none" className="stroke-gray-300 dark:stroke-gray-500" strokeWidth="14" strokeLinejoin="round" />
        <text x={240} y={76} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          солеви мост (KNO₃)
        </text>

        <HalfCell x={40} m={L} role={same ? null : leftIsAnode ? 'анод' : 'катод'} />
        <HalfCell x={310} m={R} role={same ? null : leftIsAnode ? 'катод' : 'анод'} />

        {/* скала на стандартните потенциали */}
        <line x1={sx(S_MIN)} x2={sx(S_MAX)} y1={250} y2={250} className="stroke-gray-400" strokeWidth="2" />
        {[-2, -1, 0, 1].map(v => (
          <g key={v}>
            <line x1={sx(v)} x2={sx(v)} y1={246} y2={254} className="stroke-gray-400" strokeWidth="1.5" />
            <text x={sx(v)} y={282} fontSize="10" textAnchor="middle" className="fill-gray-500">
              {v === 0 ? '0 V' : `${v > 0 ? '+' : '−'}${Math.abs(v)} V`}
            </text>
          </g>
        ))}
        {!same && <line x1={sx(anode.E)} x2={sx(cathode.E)} y1={250} y2={250} className="stroke-amber-500" strokeWidth="5" />}
        {METALS.map(m => {
          const on = m === L || m === R;
          return <circle key={m.s} cx={sx(m.E)} cy={250} r={on ? 5 : 3} className={on ? 'fill-amber-600' : 'fill-gray-400'} />;
        })}
        {[anode, cathode].filter((_, i) => i === 0 || !same).map((m, i) => (
          <text key={m.s} x={sx(m.E)} y={i === 1 && sx(cathode.E) - sx(anode.E) < 26 ? 226 : 240} fontSize="11" fontWeight="700" textAnchor="middle" fill="currentColor">
            {m.s}
          </text>
        ))}
        <text x={sx(S_MIN)} y={268} fontSize="10" className="fill-gray-500">
          E°, V
        </text>
      </LabSvg>

      <div className="mt-3">
        <Readout
          items={
            same
              ? [{ label: 'E =', value: '0 V' }]
              : [
                  { label: 'анод (окисление):', value: `${anode.s} − ${anode.z}e⁻ → ${anode.ion}`, tone: 'blue' },
                  { label: 'катод (редукция):', value: `${cathode.ion} + ${cathode.z}e⁻ → ${cathode.s}`, tone: 'rose' },
                  { label: 'E° =', value: `${volts(cathode.E)} − (${volts(anode.E)}) = ${volts(emf)} V`, tone: 'amber' },
                ]
          }
        />
      </div>
      <Note tone={same ? 'amber' : 'emerald'}>{same ? 'Еднакви електроди не дават напрежение – избери два различни метала.' : `Обща реакция: ${overall}`}</Note>
      {!same && (anode.s === 'Al' || anode.s === 'Mg') && (
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          В реален опит {anode.s === 'Al' ? 'алуминият е покрит с плътен оксиден слой' : 'магнезият реагира и с водата'} и измереното напрежение е
          осезаемо по-малко от теоретичното.
        </p>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Металът с по-нисък (по-отрицателен) стандартен потенциал е по-активен: той се окислява и е анод. Електроните текат по
        проводника от анода към катода, а солевият мост затваря веригата с йони. Числата са стандартните потенциали при 25 °C и
        концентрации 1 mol/L.
      </p>
    </div>
  );
}
