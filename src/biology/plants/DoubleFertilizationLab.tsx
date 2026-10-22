import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

const SPECIES = [
  { name: 'грах', n2: 14 },
  { name: 'царевица', n2: 20 },
  { name: 'ориз', n2: 24 },
  { name: 'пшеница', n2: 42 },
];

const STEPS = [
  { title: '1. Опрашване', text: 'Поленовото зърно попада на близалцето. В него има две клетки: вегетативна (ще направи тръбичката) и генеративна, която се дели митотично на две спермии (мъжки гамети).' },
  { title: '2. Поленова тръбичка', text: 'Вегетативната клетка израства в поленова тръбичка, която минава през стълбчето до семепъпката и влиза през микропиле (отвора ѝ). Тя носи двете спермии.' },
  { title: '3. Зародишна торбичка', text: 'В семепъпката от една мегаспора след три митотични делби се образува зародишната торбичка: 7 клетки с 8 хаплоидни ядра. Всички ядра са с еднакви гени – копия на ядрото на мегаспората.' },
  { title: '4. Двойно оплождане', text: 'Едната спермия се слива с яйцеклетката → зигота (2n). Другата се слива с двете полярни ядра на централната клетка → първична клетка на ендосперма (3n).' },
  { title: '5. Семе и плод', text: 'Зиготата става зародиш (2n), централната клетка – хранителна тъкан ендосперм (3n), обвивките на семепъпката – семенна обвивка, а стената на яйчника – стена на плода (и двете са 2n, тъкани на майката).' },
];

type G = 'A' | 'a';
const sort = (s: string) => s.split('').sort().join('');

/** Двойно оплождане при покритосеменните: плоидност, брой хромозоми и генотип на всяка клетка. */
export default function DoubleFertilizationLab() {
  const [step, setStep] = useState(0);
  const [sp, setSp] = useState(1);
  const [mother, setMother] = useState<'AA' | 'Aa' | 'aa'>('aa');
  const [megaAllele, setMegaAllele] = useState<G>('a');
  const [pollen, setPollen] = useState<G>('A');

  const n2 = SPECIES[sp].n2;
  const n = n2 / 2;
  const m: G = mother === 'AA' ? 'A' : mother === 'aa' ? 'a' : megaAllele;
  const zyg = sort(m + pollen);
  const endo = sort(m + m + pollen);

  const rows: [string, string, number, string, number[]][] = [
    ['спермия (×2)', 'n', n, pollen, [0, 1, 3]],
    ['вегетативна клетка', 'n', n, pollen, [0, 1]],
    ['яйцеклетка', 'n', n, m, [2, 3]],
    ['централна клетка', 'n + n', n2, m + m, [2, 3]],
    ['синергиди, антиподи', 'n', n, m, [2]],
    ['зигота → зародиш', '2n', n2, zyg, [3, 4]],
    ['ендосперм', '3n', 3 * n, endo, [3, 4]],
    ['семенна обвивка', '2n', n2, mother, [4]],
    ['стена на плода', '2n', n2, mother, [4]],
  ];

  const mc = 'fill-violet-200 stroke-violet-600 dark:fill-violet-800';
  const pc = 'fill-sky-200 stroke-sky-600 dark:fill-sky-800';
  const lbl = 'fill-gray-800 dark:fill-gray-100';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 440 300" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={10} y={20} fontSize="13" fontWeight={700} fill="currentColor">
          {STEPS[step].title}
        </text>

        {step <= 1 ? (
          <g>
            {/* Плодник: близалце, стълбче, яйчник със семепъпка */}
            <ellipse cx={150} cy={52} rx={34} ry={12} className="fill-lime-200 stroke-lime-700" strokeWidth={1.5} />
            <path d="M138,62 L136,190 Q100,200 100,235 Q100,285 150,285 Q200,285 200,235 Q200,200 164,190 L162,62 Z" className="fill-lime-100 stroke-lime-700 dark:fill-lime-900/40" strokeWidth={1.5} />
            <ellipse cx={150} cy={242} rx={22} ry={28} className="fill-pink-100 stroke-pink-500 dark:fill-pink-900/40" strokeWidth={1.5} />
            <ellipse cx={150} cy={246} rx={11} ry={17} className="fill-white stroke-violet-500 dark:fill-gray-800" strokeWidth={1.2} />
            {/* Поленово зърно */}
            <circle cx={150} cy={36} r={11} className="fill-yellow-300 stroke-yellow-700" strokeWidth={1.5} />
            {step === 1 && <path d="M150,46 C152,90 146,140 151,180 C154,205 150,215 150,228" fill="none" className="stroke-sky-500" strokeWidth={3} />}
            <circle cx={step === 1 ? 148 : 146} cy={step === 1 ? 222 : 34} r={3} className={pc} />
            <circle cx={step === 1 ? 154 : 154} cy={step === 1 ? 216 : 38} r={3} className={pc} />
            <text x={196} y={56} fontSize="12" className={lbl}>близалце</text>
            <text x={170} y={130} fontSize="12" className={lbl}>стълбче</text>
            <text x={206} y={240} fontSize="12" className={lbl}>яйчник</text>
            <text x={206} y={256} fontSize="12" className="fill-pink-700 dark:fill-pink-300">семепъпка</text>
            <text x={190} y={30} fontSize="12" className="fill-yellow-700 dark:fill-yellow-300">поленово зърно</text>
            <text x={262} y={110} fontSize="12" className="fill-sky-700 dark:fill-sky-300">
              {step === 1 ? '← поленова тръбичка с' : 'в зърното: вегетативна'}
            </text>
            <text x={262} y={126} fontSize="12" className="fill-sky-700 dark:fill-sky-300">
              {step === 1 ? 'двете спермии' : 'и генеративна клетка'}
            </text>
          </g>
        ) : step <= 3 ? (
          <g>
            {/* Семепъпка (обвивки) и зародишна торбичка; микропиле отгоре */}
            <path d="M200,40 Q110,50 110,165 Q110,285 220,285 Q330,285 330,165 Q330,50 240,40" fill="none" className="stroke-pink-500" strokeWidth={8} />
            <ellipse cx={220} cy={165} rx={80} ry={105} className="fill-amber-50 stroke-amber-600 dark:fill-amber-900/30" strokeWidth={1.5} />
            {/* Поленова тръбичка */}
            {step === 3 && <path d="M220,10 L220,62" className="stroke-sky-500" strokeWidth={4} />}
            {/* Яйцеклетка и синергиди при микропилето */}
            <circle cx={198} cy={84} r={13} className="fill-violet-100 stroke-violet-500 dark:fill-violet-900/50" strokeWidth={1.2} />
            <circle cx={242} cy={84} r={13} className="fill-violet-100 stroke-violet-500 dark:fill-violet-900/50" strokeWidth={1.2} />
            <circle cx={220} cy={108} r={16} className={step === 3 ? 'fill-rose-200 stroke-rose-600 dark:fill-rose-900' : mc} strokeWidth={1.5} />
            {/* Централна клетка с двете полярни ядра */}
            <circle cx={208} cy={170} r={8} className={step === 3 ? 'fill-orange-300 stroke-orange-600' : mc} strokeWidth={1.2} />
            {step === 2 && <circle cx={232} cy={170} r={8} className={mc} strokeWidth={1.2} />}
            {step === 3 && <circle cx={222} cy={170} r={11} className="fill-orange-300 stroke-orange-600" strokeWidth={1.2} />}
            {/* Антиподи */}
            {[196, 220, 244].map(x => (
              <circle key={x} cx={x} cy={248} r={10} className="fill-violet-100 stroke-violet-500 dark:fill-violet-900/50" strokeWidth={1.2} />
            ))}
            {step === 3 && (
              <>
                <circle cx={226} cy={100} r={4} className={pc} />
                <path d="M224,120 Q240,140 226,158" fill="none" className="stroke-sky-500" strokeWidth={1.5} strokeDasharray="3 3" />
              </>
            )}
            <text x={10} y={112} fontSize="12" className={lbl}>{step === 3 ? `зигота 2n · ${zyg}` : `яйцеклетка n · ${m}`}</text>
            <line x1={150} y1={108} x2={202} y2={108} className="stroke-gray-400" />
            <text x={10} y={84} fontSize="12" className={lbl}>синергиди n</text>
            <line x1={84} y1={80} x2={184} y2={84} className="stroke-gray-400" />
            <text x={340} y={166} fontSize="12" className={lbl}>{step === 3 ? 'ендосперм' : 'централна'}</text>
            <text x={340} y={182} fontSize="12" className={lbl}>{step === 3 ? `3n · ${endo}` : `клетка n + n`}</text>
            <line x1={338} y1={172} x2={240} y2={170} className="stroke-gray-400" />
            <text x={340} y={252} fontSize="12" className={lbl}>антиподи n</text>
            <text x={250} y={30} fontSize="12" className="fill-pink-700 dark:fill-pink-300">микропиле</text>
            <text x={10} y={290} fontSize="11" className="fill-gray-500 dark:fill-gray-400">розово – обвивки на семепъпката (тъкан на майката, 2n)</text>
          </g>
        ) : (
          <g>
            {/* Семе: обвивка, ендосперм, зародиш */}
            <ellipse cx={200} cy={165} rx={120} ry={110} className="fill-amber-700 dark:fill-amber-800" />
            <ellipse cx={200} cy={165} rx={110} ry={100} className="fill-amber-100 dark:fill-amber-200" />
            <path d="M200,80 q-28,10 -26,40 q2,26 26,30 q24,-4 26,-30 q2,-30 -26,-40 z" className="fill-lime-400 stroke-lime-700" strokeWidth={1.5} />
            <text x={200} y={120} fontSize="12" textAnchor="middle" className="fill-lime-950">зародиш</text>
            <text x={200} y={205} fontSize="13" textAnchor="middle" className="fill-amber-900">ендосперм 3n · {endo}</text>
            <text x={200} y={135} fontSize="12" textAnchor="middle" className="fill-lime-950">2n · {zyg}</text>
            <text x={330} y={70} fontSize="12" className={lbl}>семенна обвивка</text>
            <text x={330} y={86} fontSize="12" className={lbl}>2n · {mother}</text>
            <line x1={328} y1={78} x2={290} y2={98} className="stroke-gray-400" />
          </g>
        )}
      </LabSvg>

      <Buttons>
        <DiagramButton onClick={() => setStep(s => Math.max(0, s - 1))}>◀ назад</DiagramButton>
        <DiagramButton onClick={() => setStep(s => Math.min(4, s + 1))}>напред ▶</DiagramButton>
      </Buttons>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 text-center max-w-2xl mx-auto">{STEPS[step].text}</p>

      <div className="mt-3 grid gap-1 text-sm text-gray-700 dark:text-gray-300 max-w-lg mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span>вид:</span>
          {SPECIES.map((s, i) => (
            <DiagramButton key={s.name} active={sp === i} onClick={() => setSp(i)}>
              {s.name}
            </DiagramButton>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
          <span>майка:</span>
          {(['AA', 'Aa', 'aa'] as const).map(g => (
            <DiagramButton key={g} active={mother === g} onClick={() => setMother(g)}>
              {g}
            </DiagramButton>
          ))}
          {mother === 'Aa' && (
            <>
              <span>мегаспора:</span>
              {(['A', 'a'] as const).map(g => (
                <DiagramButton key={g} active={megaAllele === g} onClick={() => setMegaAllele(g)}>
                  {g}
                </DiagramButton>
              ))}
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
          <span>прашец:</span>
          {(['A', 'a'] as const).map(g => (
            <DiagramButton key={g} active={pollen === g} onClick={() => setPollen(g)}>
              {g}
            </DiagramButton>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="mx-auto text-xs sm:text-sm text-gray-700 dark:text-gray-300 border-collapse">
          <thead>
            <tr className="text-left border-b border-gray-300 dark:border-gray-600">
              <th className="py-1 pr-3">клетка / тъкан</th>
              <th className="py-1 pr-3">плоидност</th>
              <th className="py-1 pr-3">хромозоми</th>
              <th className="py-1">генотип</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, pl, c, g, when]) => (
              <tr key={name} className={`border-b border-gray-200 dark:border-gray-700 ${when.includes(step) ? 'bg-rose-50 dark:bg-rose-500/10 font-semibold' : ''}`}>
                <td className="py-1 pr-3">{name}</td>
                <td className="py-1 pr-3">{pl}</td>
                <td className="py-1 pr-3">{c}</td>
                <td className="py-1 font-mono">{g.length > 1 && name !== 'централна клетка' ? sort(g) : g}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Readout
        items={[
          { label: '2n', value: n2, tone: 'violet' },
          { label: 'ендосперм', value: `${3 * n} хромозоми`, tone: 'amber' },
        ]}
      />
      <Note tone="rose">
        Ендоспермът получава две копия от майката (полярните ядра {m} и {m}) и едно от бащата (спермия {pollen}) – затова е {endo}.
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Двойното оплождане е открито от Сергей Навашин през 1898 г. Има го само при покритосеменните. Семенната обвивка и стената
        на плода са тъкани на майката – техният генотип не зависи от прашеца. Чертежът е схематичен: при повечето растения
        семепъпката е обърната и микропилето гледа към основата ѝ.
      </p>
    </div>
  );
}
