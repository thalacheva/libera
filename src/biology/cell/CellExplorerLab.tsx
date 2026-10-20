import { type ReactNode, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

type CellType = 'animal' | 'plant' | 'bacterium';
type Part =
  | 'membrane'
  | 'cytoplasm'
  | 'nucleus'
  | 'nucleolus'
  | 'rer'
  | 'ser'
  | 'ribosomes'
  | 'golgi'
  | 'mitochondria'
  | 'lysosomes'
  | 'centrioles'
  | 'chloroplasts'
  | 'vacuole'
  | 'wall'
  | 'nucleoid'
  | 'plasmids'
  | 'flagellum';

const INFO: Record<Part, { name: string; fn: string }> = {
  membrane: { name: 'клетъчна мембрана', fn: 'Тънка двойна мембрана от фосфолипиди и белтъци. Отделя клетката от средата и решава кои вещества да влязат и излязат.' },
  cytoplasm: { name: 'цитоплазма', fn: 'Гелообразното съдържимо на клетката между мембраната и ядрото. В нея стават много от реакциите и „плуват“ органелите.' },
  nucleus: { name: 'ядро', fn: 'Пази ДНК – наследствената информация – и управлява клетката. Обвито е с двойна мембрана с пори, през които минават РНК и белтъци.' },
  nucleolus: { name: 'ядърце', fn: 'Плътно телце в ядрото, където се сглобяват частите на рибозомите.' },
  rer: { name: 'грапава ендоплазмена мрежа', fn: 'Система от мембранни канали, покрити с рибозоми. Тук се синтезират белтъците, които клетката изнася навън или вгражда в мембраните.' },
  ser: { name: 'гладка ендоплазмена мрежа', fn: 'Канали без рибозоми. Синтезират липиди, обезвреждат отрови (много е в чернодробните клетки) и пазят калциеви йони в мускулите.' },
  ribosomes: { name: 'рибозоми', fn: 'Мънички „машини“ от РНК и белтък, които сглобяват белтъците по инструкциите от ДНК. Нямат мембрана и ги има във всички клетки.' },
  golgi: { name: 'апарат на Голджи', fn: 'Купчина плоски мембранни торбички. Довършва, сортира и опакова белтъците и липидите в мехурчета и ги изпраща по местата им – „пощата“ на клетката.' },
  mitochondria: { name: 'митохондрии', fn: 'Тук при клетъчното дишане от глюкозата и кислорода се получава АТФ – енергията за клетката. Имат двойна мембрана, своя ДНК и свои рибозоми.' },
  lysosomes: { name: 'лизозоми', fn: 'Мехурчета с храносмилателни ензими. Разграждат храната, погълната от клетката, износените органели и бактериите.' },
  centrioles: { name: 'центриоли', fn: 'Две къси цилиндърчета от микротръбички, перпендикулярни едно на друго. Помагат за организирането на делителното вретено при делене на животинската клетка.' },
  chloroplasts: { name: 'хлоропласти', fn: 'Пластиди със зеления пигмент хлорофил. В тях става фотосинтезата – от CO₂ и вода със светлина се получава глюкоза. Имат двойна мембрана и своя ДНК.' },
  vacuole: { name: 'централна вакуола', fn: 'Голям мехур с клетъчен сок, който може да заема до 90% от обема. Пази вода и вещества и чрез налягането си държи клетката стегната (тургор).' },
  wall: { name: 'клетъчна стена', fn: 'Здрава обвивка извън мембраната, която пази клетката и ѝ дава форма. При растенията е от целулоза, при гъбите – от хитин, при бактериите – от пептидогликан (муреин).' },
  nucleoid: { name: 'нуклеоид', fn: 'Областта, в която е кръговата ДНК на бактерията. Не е обвита с мембрана – бактерията няма истинско ядро.' },
  plasmids: { name: 'плазмиди', fn: 'Малки кръгови молекули ДНК извън нуклеоида. Често носят гени за устойчивост на антибиотици и бактериите си ги предават.' },
  flagellum: { name: 'камшиче', fn: 'Дълга нишка, която се върти като витло и движи бактерията. Камшичетата на еукариотите (напр. на сперматозоида) са устроени съвсем различно.' },
};

const PARTS: Record<CellType, Part[]> = {
  animal: ['membrane', 'cytoplasm', 'nucleus', 'nucleolus', 'rer', 'ser', 'ribosomes', 'golgi', 'mitochondria', 'lysosomes', 'centrioles'],
  plant: ['wall', 'membrane', 'cytoplasm', 'vacuole', 'nucleus', 'nucleolus', 'rer', 'ribosomes', 'golgi', 'mitochondria', 'chloroplasts'],
  bacterium: ['wall', 'membrane', 'cytoplasm', 'nucleoid', 'plasmids', 'ribosomes', 'flagellum'],
};

const CELLS: { id: CellType; label: string }[] = [
  { id: 'animal', label: 'животинска клетка' },
  { id: 'plant', label: 'растителна клетка' },
  { id: 'bacterium', label: 'бактерия' },
];

/** Митохондрия: овал с кристи. */
const mito = (x: number, y: number, rot: number, key: string) => (
  <g key={key} transform={`rotate(${rot} ${x} ${y})`}>
    <ellipse cx={x} cy={y} rx={26} ry={12} fill="#fdba74" stroke="#c2410c" strokeWidth="2" />
    <path d={`M${x - 18} ${y} l5 -7 l5 14 l5 -14 l5 14 l5 -14 l5 14 l3 -7`} fill="none" stroke="#c2410c" strokeWidth="1.5" />
  </g>
);
/** Хлоропласт: зелен овал с купчинки грана. */
const chloro = (x: number, y: number, rot: number, key: string) => (
  <g key={key} transform={`rotate(${rot} ${x} ${y})`}>
    <ellipse cx={x} cy={y} rx={24} ry={12} fill="#4ade80" stroke="#15803d" strokeWidth="2" />
    {[-12, 0, 12].map(dx => (
      <rect key={dx} x={x + dx - 4} y={y - 6} width={8} height={12} rx={2} fill="#15803d" />
    ))}
  </g>
);
/** Апарат на Голджи: извити торбички и мехурчета. */
const golgi = (x: number, y: number) => (
  <g>
    {[0, 9, 18, 27].map(d => (
      <path key={d} d={`M${x - 30 + d / 3} ${y + d} Q${x} ${y - 16 + d} ${x + 30 - d / 3} ${y + d}`} fill="none" stroke="#d97706" strokeWidth="5" strokeLinecap="round" />
    ))}
    <circle cx={x + 38} cy={y + 8} r={4} fill="#fbbf24" stroke="#d97706" />
    <circle cx={x + 34} cy={y + 30} r={4} fill="#fbbf24" stroke="#d97706" />
  </g>
);
/** Грапава ЕПМ: дъги около ядрото с рибозоми по тях. */
const rer = (cx: number, cy: number, radii: number[], from: number, to: number) => (
  <g>
    {radii.map(r => {
      const p = (a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
      const [x1, y1] = p(from);
      const [x2, y2] = p(to);
      const dots = Array.from({ length: Math.round(((to - from) * r) / 400) }, (_, i) => p(from + ((i + 0.5) * (to - from)) / Math.round(((to - from) * r) / 400)));
      return (
        <g key={r}>
          <path d={`M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`} fill="none" stroke="#2563eb" strokeWidth="4" />
          {dots.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={2} fill="#1e3a8a" />
          ))}
        </g>
      );
    })}
  </g>
);
const dots = (pts: [number, number][]) => (
  <g>
    {pts.map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={2.2} fill="#1e3a8a" />
    ))}
  </g>
);

/** Формите на всяка органела в чертежа на клетката (по реда, в който се рисуват). */
function drawing(cell: CellType): [Part, ReactNode][] {
  if (cell === 'animal') {
    return [
      ['cytoplasm', <ellipse cx={240} cy={150} rx={215} ry={128} fill="#fde2e4" />],
      ['ser', <path d="M70 200 q15 -15 30 0 t30 0 t30 0 M75 220 q15 -15 30 0 t30 0" fill="none" stroke="#0891b2" strokeWidth="5" strokeLinecap="round" />],
      ['rer', rer(190, 150, [62, 72, 82], -70, 70)],
      ['nucleus', <g><circle cx={190} cy={150} r={50} fill="#ddd6fe" stroke="#6d28d9" strokeWidth="3" /><circle cx={190} cy={150} r={45} fill="none" stroke="#6d28d9" strokeWidth="1" strokeDasharray="6 4" /></g>],
      ['nucleolus', <circle cx={178} cy={140} r={14} fill="#6d28d9" />],
      ['golgi', golgi(340, 75)],
      ['mitochondria', <g>{[mito(370, 200, -20, 'a'), mito(105, 100, 30, 'b'), mito(275, 238, 5, 'c')]}</g>],
      ['lysosomes', <g><circle cx={405} cy={135} r={10} fill="#a3e635" stroke="#4d7c0f" strokeWidth="2" /><circle cx={130} cy={250} r={9} fill="#a3e635" stroke="#4d7c0f" strokeWidth="2" /></g>],
      ['centrioles', <g><rect x={300} y={162} width={22} height={8} rx={2} fill="#78716c" /><rect x={322} y={150} width={8} height={22} rx={2} fill="#78716c" /></g>],
      ['ribosomes', dots([[300, 120], [315, 128], [395, 95], [380, 110], [250, 60], [262, 70], [120, 160], [110, 175], [340, 255], [355, 248], [420, 170], [230, 255]])],
      ['membrane', <g><ellipse cx={240} cy={150} rx={215} ry={128} fill="none" stroke="#be123c" strokeWidth="4" /><ellipse cx={240} cy={150} rx={215} ry={128} fill="none" stroke="transparent" strokeWidth="14" /></g>],
    ];
  }
  if (cell === 'plant') {
    return [
      ['wall', <rect x={14} y={14} width={452} height={272} rx={16} fill="#86efac" stroke="#15803d" strokeWidth="3" />],
      ['cytoplasm', <rect x={26} y={26} width={428} height={248} rx={10} fill="#ecfccb" />],
      ['vacuole', <rect x={170} y={60} width={230} height={170} rx={60} fill="#bae6fd" stroke="#0284c7" strokeWidth="2" />],
      ['rer', rer(85, 105, [44, 52], -20, 110)],
      ['nucleus', <g><circle cx={85} cy={105} r={36} fill="#ddd6fe" stroke="#6d28d9" strokeWidth="3" /></g>],
      ['nucleolus', <circle cx={78} cy={98} r={10} fill="#6d28d9" />],
      ['golgi', golgi(85, 205)],
      ['mitochondria', <g>{[mito(405, 242, 10, 'a'), mito(140, 250, -10, 'b')]}</g>],
      ['chloroplasts', <g>{[chloro(220, 42, 0, 'a'), chloro(320, 42, 0, 'b'), chloro(428, 110, 90, 'c'), chloro(428, 185, 90, 'd'), chloro(300, 255, 0, 'e'), chloro(200, 255, 0, 'f')]}</g>],
      ['ribosomes', dots([[140, 60], [150, 75], [130, 165], [145, 172], [380, 250], [260, 45], [420, 60], [150, 225]])],
      ['membrane', <g><rect x={26} y={26} width={428} height={248} rx={10} fill="none" stroke="#be123c" strokeWidth="3" /><rect x={26} y={26} width={428} height={248} rx={10} fill="none" stroke="transparent" strokeWidth="10" /></g>],
    ];
  }
  return [
    ['flagellum', <path d="M400 150 q12 -18 24 0 t24 0 t24 0" fill="none" stroke="#57534e" strokeWidth="3" />],
    ['wall', <rect x={50} y={78} width={355} height={144} rx={72} fill="#e7e5e4" stroke="#57534e" strokeWidth="3" />],
    ['cytoplasm', <rect x={62} y={90} width={331} height={120} rx={60} fill="#fef3c7" />],
    ['nucleoid', <path d="M170 150 c10 -40 40 30 60 -10 s30 40 50 0 s30 -30 40 10 s-30 40 -50 10 s-40 30 -60 0 s-50 20 -40 -10" fill="none" stroke="#7c3aed" strokeWidth="3" />],
    ['plasmids', <g><circle cx={120} cy={125} r={11} fill="none" stroke="#db2777" strokeWidth="3" /><circle cx={350} cy={180} r={9} fill="none" stroke="#db2777" strokeWidth="3" /></g>],
    ['ribosomes', dots([[100, 165], [112, 180], [140, 190], [330, 115], [345, 128], [362, 140], [200, 110], [300, 195], [250, 112], [150, 110]])],
    ['membrane', <g><rect x={62} y={90} width={331} height={120} rx={60} fill="none" stroke="#be123c" strokeWidth="3" /><rect x={62} y={90} width={331} height={120} rx={60} fill="none" stroke="transparent" strokeWidth="10" /></g>],
  ];
}

/** Разгледай клетката: посочи органела и прочети за какво служи – или намери поисканата органела. */
export default function CellExplorerLab() {
  const [cell, setCell] = useState<CellType>('animal');
  const [selected, setSelected] = useState<Part | null>(null);
  const [quiz, setQuiz] = useState(false);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [last, setLast] = useState<{ part: Part; ok: boolean } | null>(null);
  const [missed, setMissed] = useState(false);

  const parts = PARTS[cell];
  const target = parts[step % parts.length];
  const finished = quiz && step >= parts.length;

  const choose = (c: CellType, q = quiz) => {
    setCell(c);
    setSelected(null);
    setQuiz(q);
    setStep(0);
    setScore(0);
    setLast(null);
    setMissed(false);
  };
  const click = (p: Part) => {
    if (!quiz) {
      setSelected(p);
      return;
    }
    if (finished) return;
    const ok = p === target;
    setLast({ part: p, ok });
    if (ok) {
      if (!missed) setScore(score + 1);
      setMissed(false);
      setStep(step + 1);
    } else setMissed(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 300" className="w-full h-auto max-w-xl mx-auto block select-none">
        {drawing(cell).map(([part, node]) => (
          <g
            key={part}
            onClick={() => click(part)}
            className="cursor-pointer"
            pointerEvents={part === 'membrane' ? 'stroke' : 'visiblePainted'}
            opacity={!quiz && selected && selected !== part && part !== 'cytoplasm' && part !== 'wall' ? 0.35 : 1}
          >
            {node}
          </g>
        ))}
      </LabSvg>

      <Buttons>
        {CELLS.map(c => (
          <DiagramButton key={c.id} active={cell === c.id} onClick={() => choose(c.id)}>
            {c.label}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={!quiz} onClick={() => choose(cell, false)}>
          🔍 разгледай
        </DiagramButton>
        <DiagramButton active={quiz} onClick={() => choose(cell, true)}>
          🎯 намери органелата
        </DiagramButton>
      </Buttons>

      {!quiz && (
        <>
          <Buttons>
            {parts.map(p => (
              <DiagramButton key={p} active={selected === p} onClick={() => setSelected(p)}>
                {INFO[p].name}
              </DiagramButton>
            ))}
          </Buttons>
          {selected ? (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/60 p-3 text-sm sm:text-base text-gray-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-gray-200">
              <p className="font-semibold text-rose-700 dark:text-rose-300 mb-1">{INFO[selected].name}</p>
              <p>{INFO[selected].fn}</p>
            </div>
          ) : (
            <Note tone="violet">Посочи част от клетката на чертежа или с бутоните.</Note>
          )}
        </>
      )}
      {quiz && !finished && (
        <Note tone={last ? (last.ok ? 'emerald' : 'rose') : 'violet'}>
          {last && (last.ok ? '✓ Точно! ' : `✗ Това е ${INFO[last.part].name}. `)}
          Посочи: <strong>{INFO[target].name}</strong> ({step + 1} от {parts.length})
        </Note>
      )}
      {finished && (
        <Note tone="violet">
          Намери {score} от {parts.length} от първия опит. Опитай с другите клетки!
        </Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Чертежът е схема, не е в мащаб: бактерията е около 10 пъти по-малка от животинската клетка, а рибозомите са много по-дребни, отколкото
        изглеждат тук. Ендоплазмената мрежа и мембраната на ядрото всъщност са свързани.
      </p>
    </div>
  );
}
