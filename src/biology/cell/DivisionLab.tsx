import { type ReactNode, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Mode = 'mitosis' | 'meiosis';

// Клетка с 2n = 4: дълга двойка A и къса двойка B; майчините хромозоми са червени, бащините – сини
const COLOR = { Am: '#dc2626', Bm: '#f87171', Ap: '#2563eb', Bp: '#60a5fa' };
const LEN = { A: 56, B: 34 };
type Id = keyof typeof COLOR;
const lenOf = (id: Id) => LEN[id[0] as 'A' | 'B'];

/**
 * Хромозома с център (x, y): една или две хроматиди, по желание завъртяна.
 * tips – цвят на върха на лявата и дясната хроматида след кросинговър (null – без обмяна).
 */
function Chrom({
  id,
  x,
  y,
  two = true,
  rot = 0,
  tips = [null, null],
  thin = false,
}: {
  id: Id;
  x: number;
  y: number;
  two?: boolean;
  rot?: number;
  tips?: [string | null, string | null];
  thin?: boolean;
}) {
  const L = lenOf(id);
  const w = thin ? 3 : 7;
  const gap = thin ? 2 : 4.5;
  const offsets = two ? [-gap, gap] : [0];
  return (
    <g transform={`rotate(${rot} ${x} ${y})`} opacity={thin ? 0.75 : 1}>
      {offsets.map((dx, k) => (
        <g key={k}>
          <rect x={x + dx - w / 2} y={y - L / 2} width={w} height={L} rx={w / 2} fill={COLOR[id]} />
          {tips[two ? k : 0] && <rect x={x + dx - w / 2} y={y - L / 2} width={w} height={L * 0.3} rx={w / 2} fill={tips[two ? k : 0]!} />}
        </g>
      ))}
      {!thin && <circle cx={x} cy={y} r={two ? 4 : 3} fill="#1f2937" />}
    </g>
  );
}

const Spindle = ({ from, to }: { from: [number, number]; to: [number, number][] }) => (
  <g>
    {to.map(([x, y], i) => (
      <line key={i} x1={from[0]} y1={from[1]} x2={x} y2={y} stroke="#9ca3af" strokeWidth="1" />
    ))}
    <circle cx={from[0]} cy={from[1]} r={5} fill="#57534e" />
  </g>
);

const Cell = ({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fde2e4" stroke="#be123c" strokeWidth="2.5" />
);
const Nucleus = ({ cx, cy, r, dashed = false }: { cx: number; cy: number; r: number; dashed?: boolean }) => (
  <circle cx={cx} cy={cy} r={r} fill="#ede9fe" stroke="#6d28d9" strokeWidth="2" strokeDasharray={dashed ? '6 5' : undefined} />
);

type Step = { name: string; n: string; c: string; text: string; draw: (flip: boolean) => ReactNode };

const BIG = { cx: 240, cy: 130, rx: 205, ry: 115 };
const crossA: [string | null, string | null] = [null, COLOR.Ap]; // дясната хроматида на майчината A има бащин връх
const crossAp: [string | null, string | null] = [COLOR.Am, null];

const MITOSIS: Step[] = [
  {
    name: 'Интерфаза (G1)',
    n: '2n = 4',
    c: '2c',
    text: 'Клетката расте и работи. ДНК е разпусната като тънки нишки (хроматин) – отделни хромозоми не се виждат под микроскоп.',
    draw: () => (
      <g>
        <Cell {...BIG} />
        <Nucleus cx={240} cy={130} r={72} />
        <Chrom id="Am" x={205} y={110} two={false} rot={30} thin />
        <Chrom id="Ap" x={270} y={150} two={false} rot={-40} thin />
        <Chrom id="Bm" x={262} y={95} two={false} rot={70} thin />
        <Chrom id="Bp" x={212} y={160} two={false} rot={-15} thin />
      </g>
    ),
  },
  {
    name: 'Интерфаза (S и G2)',
    n: '2n = 4',
    c: '4c',
    text: 'В S-периода ДНК се удвоява: всяка хромозома вече е от две еднакви сестрински хроматиди, свързани в центромерата. Броят на хромозомите е същият, а ДНК е двойно повече.',
    draw: () => (
      <g>
        <Cell {...BIG} />
        <Nucleus cx={240} cy={130} r={72} />
        <Chrom id="Am" x={205} y={110} rot={30} thin />
        <Chrom id="Ap" x={270} y={150} rot={-40} thin />
        <Chrom id="Bm" x={262} y={95} rot={70} thin />
        <Chrom id="Bp" x={212} y={160} rot={-15} thin />
      </g>
    ),
  },
  {
    name: 'Профаза',
    n: '2n = 4',
    c: '4c',
    text: 'Хромозомите се спирализират и стават дебели и видими. Ядрената обвивка се разпада, а от двата полюса започва да расте делителното вретено от микротръбички.',
    draw: () => (
      <g>
        <Cell {...BIG} />
        <Nucleus cx={240} cy={130} r={72} dashed />
        <Chrom id="Am" x={205} y={110} rot={30} />
        <Chrom id="Ap" x={272} y={152} rot={-40} />
        <Chrom id="Bm" x={262} y={92} rot={70} />
        <Chrom id="Bp" x={212} y={165} rot={-15} />
        <circle cx={60} cy={130} r={5} fill="#57534e" />
        <circle cx={420} cy={130} r={5} fill="#57534e" />
      </g>
    ),
  },
  {
    name: 'Метафаза',
    n: '2n = 4',
    c: '4c',
    text: 'Хромозомите се подреждат в екваториалната равнина. Нишки на вретеното от двата полюса се закачват за центромерата на всяка хромозома – по една от всяка страна.',
    draw: () => {
      const ys: [Id, number][] = [
        ['Am', 58],
        ['Bm', 113],
        ['Ap', 165],
        ['Bp', 215],
      ];
      return (
        <g>
          <Cell {...BIG} />
          <line x1={240} x2={240} y1={22} y2={238} stroke="#a8a29e" strokeDasharray="4 4" />
          <Spindle from={[60, 130]} to={ys.map(([, y]) => [235, y])} />
          <Spindle from={[420, 130]} to={ys.map(([, y]) => [245, y])} />
          {ys.map(([id, y]) => (
            <Chrom key={id} id={id} x={240} y={y} />
          ))}
        </g>
      );
    },
  },
  {
    name: 'Анафаза',
    n: '4n = 8',
    c: '4c',
    text: 'Центромерите се разделят и сестринските хроматиди се дърпат към противоположните полюси. Всяка хроматида вече е самостоятелна хромозома – за миг в клетката има 8 хромозоми.',
    draw: () => {
      const ys: [Id, number][] = [
        ['Am', 58],
        ['Bm', 112],
        ['Ap', 162],
        ['Bp', 212],
      ];
      return (
        <g>
          <Cell {...BIG} />
          <Spindle from={[60, 130]} to={ys.map(([, y]) => [150, y])} />
          <Spindle from={[420, 130]} to={ys.map(([, y]) => [330, y])} />
          {ys.map(([id, y]) => (
            <g key={id}>
              <Chrom id={id} x={150} y={y} two={false} />
              <Chrom id={id} x={330} y={y} two={false} />
            </g>
          ))}
        </g>
      );
    },
  },
  {
    name: 'Телофаза и цитокинеза',
    n: '2 × 2n',
    c: '2 × 2c',
    text: 'Около всяка група хромозоми се образува ядро, хромозомите се разпускат. Цитоплазмата се разделя: при животните с прищъпване (бразда), при растенията – с клетъчна пластинка в средата.',
    draw: () => (
      <g>
        <path d="M240 50 C330 -5 462 35 462 130 C462 225 330 265 240 210 C150 265 18 225 18 130 C18 35 150 -5 240 50 Z" fill="#fde2e4" stroke="#be123c" strokeWidth="2.5" />
        {[135, 345].map(cx => (
          <g key={cx}>
            <Nucleus cx={cx} cy={130} r={55} />
            <Chrom id="Am" x={cx - 20} y={115} two={false} rot={20} thin />
            <Chrom id="Ap" x={cx + 18} y={140} two={false} rot={-30} thin />
            <Chrom id="Bm" x={cx + 12} y={100} two={false} rot={60} thin />
            <Chrom id="Bp" x={cx - 14} y={155} two={false} rot={-10} thin />
          </g>
        ))}
      </g>
    ),
  },
  {
    name: 'Две дъщерни клетки',
    n: '2n = 4 във всяка',
    c: '2c във всяка',
    text: 'Две клетки с еднакви хромозоми – копия на майчината клетка. Така расте тялото, заздравяват рани и се подменят старите клетки.',
    draw: () => (
      <g>
        {[125, 355].map(cx => (
          <g key={cx}>
            <Cell cx={cx} cy={130} rx={105} ry={95} />
            <Nucleus cx={cx} cy={130} r={52} />
            <Chrom id="Am" x={cx - 20} y={115} two={false} rot={20} thin />
            <Chrom id="Ap" x={cx + 18} y={140} two={false} rot={-30} thin />
            <Chrom id="Bm" x={cx + 12} y={100} two={false} rot={60} thin />
            <Chrom id="Bp" x={cx - 14} y={155} two={false} rot={-10} thin />
          </g>
        ))}
      </g>
    ),
  },
];

/** Коя хромозома от двойка B отива наляво в метафаза I (зависи от случайната ориентация). */
const bLeft = (flip: boolean): Id => (flip ? 'Bp' : 'Bm');
const bRight = (flip: boolean): Id => (flip ? 'Bm' : 'Bp');

const MEIOSIS: Step[] = [
  MITOSIS[0],
  MITOSIS[1],
  {
    name: 'Профаза I и кросинговър',
    n: '2n = 4',
    c: '4c',
    text: 'Хомоложните хромозоми (майчина и бащина от една двойка) се долепват по цялата си дължина – две хромозоми, четири хроматиди. Несестрински хроматиди си разменят участъци: кросинговър. Така се получават нови комбинации от гени.',
    draw: () => (
      <g>
        <Cell {...BIG} />
        <Nucleus cx={240} cy={130} r={80} dashed />
        <Chrom id="Am" x={196} y={112} tips={crossA} />
        <Chrom id="Ap" x={214} y={112} tips={crossAp} />
        <Chrom id="Bm" x={262} y={162} />
        <Chrom id="Bp" x={280} y={162} />
      </g>
    ),
  },
  {
    name: 'Метафаза I',
    n: '2n = 4',
    c: '4c',
    text: 'В екватора се подреждат ДВОЙКИТЕ хомоложни хромозоми, а не отделни хромозоми. Коя хромозома от двойката е от коя страна, е случайно – смени ориентацията с бутона.',
    draw: flip => (
      <g>
        <Cell {...BIG} />
        <line x1={240} x2={240} y1={22} y2={238} stroke="#a8a29e" strokeDasharray="4 4" />
        <Spindle from={[60, 130]} to={[[220, 80], [220, 175]]} />
        <Spindle from={[420, 130]} to={[[260, 80], [260, 175]]} />
        <Chrom id="Am" x={226} y={80} tips={crossA} />
        <Chrom id="Ap" x={254} y={80} tips={crossAp} />
        <Chrom id={bLeft(flip)} x={226} y={175} />
        <Chrom id={bRight(flip)} x={254} y={175} />
      </g>
    ),
  },
  {
    name: 'Анафаза I',
    n: '2 × n',
    c: '4c',
    text: 'Хомоложните хромозоми се разделят и отиват към различни полюси. Сестринските хроматиди остават заедно! Броят на хромозомите във всяка половина се намалява наполовина – затова мейоза I се нарича редукционно делене.',
    draw: flip => (
      <g>
        <Cell {...BIG} />
        <Spindle from={[60, 130]} to={[[150, 85], [150, 170]]} />
        <Spindle from={[420, 130]} to={[[330, 85], [330, 170]]} />
        <Chrom id="Am" x={150} y={85} tips={crossA} />
        <Chrom id="Ap" x={330} y={85} tips={crossAp} />
        <Chrom id={bLeft(flip)} x={150} y={170} />
        <Chrom id={bRight(flip)} x={330} y={170} />
      </g>
    ),
  },
  {
    name: 'Телофаза I',
    n: 'n = 2 във всяка',
    c: '2c във всяка',
    text: 'Получават се две клетки с по една хромозома от всяка двойка – хаплоидни. Но всяка хромозома още е от две хроматиди (и след кросинговъра те вече не са съвсем еднакви).',
    draw: flip => (
      <g>
        {[125, 355].map((cx, i) => (
          <g key={cx}>
            <Cell cx={cx} cy={130} rx={105} ry={100} />
            <Chrom id={i === 0 ? 'Am' : 'Ap'} x={cx} y={98} tips={i === 0 ? crossA : crossAp} />
            <Chrom id={i === 0 ? bLeft(flip) : bRight(flip)} x={cx} y={168} />
          </g>
        ))}
      </g>
    ),
  },
  {
    name: 'Метафаза II',
    n: 'n = 2 във всяка',
    c: '2c във всяка',
    text: 'Мейоза II прилича на митоза: във всяка клетка хромозомите се подреждат в екватора, а вретеното се закачва за центромерите им. Преди нея ДНК не се удвоява.',
    draw: flip => (
      <g>
        {[125, 355].map((cx, i) => (
          <g key={cx}>
            <Cell cx={cx} cy={130} rx={105} ry={100} />
            <Spindle from={[cx - 85, 130]} to={[[cx - 5, 98], [cx - 5, 168]]} />
            <Spindle from={[cx + 85, 130]} to={[[cx + 5, 98], [cx + 5, 168]]} />
            <Chrom id={i === 0 ? 'Am' : 'Ap'} x={cx} y={98} tips={i === 0 ? crossA : crossAp} />
            <Chrom id={i === 0 ? bLeft(flip) : bRight(flip)} x={cx} y={168} />
          </g>
        ))}
      </g>
    ),
  },
  {
    name: 'Анафаза II',
    n: '2 × n във всяка',
    c: '2c във всяка',
    text: 'Сестринските хроматиди най-после се разделят и отиват към полюсите – като в анафазата на митозата.',
    draw: flip => (
      <g>
        {[125, 355].map((cx, i) => {
          const a: Id = i === 0 ? 'Am' : 'Ap';
          const b = i === 0 ? bLeft(flip) : bRight(flip);
          const tips = i === 0 ? crossA : crossAp;
          return (
            <g key={cx}>
              <Cell cx={cx} cy={130} rx={105} ry={100} />
              <Chrom id={a} x={cx - 45} y={100} two={false} tips={[tips[0], null]} />
              <Chrom id={a} x={cx + 45} y={100} two={false} tips={[tips[1], null]} />
              <Chrom id={b} x={cx - 45} y={165} two={false} />
              <Chrom id={b} x={cx + 45} y={165} two={false} />
            </g>
          );
        })}
      </g>
    ),
  },
  {
    name: 'Четири гамети',
    n: 'n = 2 във всяка',
    c: 'c във всяка',
    text: 'От една клетка се получават четири хаплоидни клетки и няма две еднакви: заради случайната ориентация в метафаза I и заради кросинговъра. При оплождането две гамети отново дават 2n.',
    draw: flip => (
      <g>
        {[0, 1, 2, 3].map(k => {
          const cx = 62 + k * 119;
          const left = k < 2;
          const a: Id = left ? 'Am' : 'Ap';
          const b = left ? bLeft(flip) : bRight(flip);
          const tips = left ? crossA : crossAp;
          return (
            <g key={k}>
              <circle cx={cx} cy={130} r={54} fill="#fde2e4" stroke="#be123c" strokeWidth="2.5" />
              <Chrom id={a} x={cx - 14} y={130} two={false} tips={[tips[k % 2], null]} />
              <Chrom id={b} x={cx + 16} y={130} two={false} />
            </g>
          );
        })}
      </g>
    ),
  },
];

/** Стъпка по стъпка през митозата и мейозата с 2n = 4 хромозоми. */
export default function DivisionLab() {
  const [mode, setMode] = useState<Mode>('mitosis');
  const [step, setStep] = useState(0);
  const [flip, setFlip] = useState(false);
  const steps = mode === 'mitosis' ? MITOSIS : MEIOSIS;
  const s = steps[step];

  const choose = (m: Mode) => {
    setMode(m);
    setStep(0);
    setFlip(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 260" className="w-full h-auto max-w-xl mx-auto block select-none">
        {s.draw(flip)}
      </LabSvg>
      <p className="text-center font-semibold text-gray-900 dark:text-gray-100 mt-2">
        {step + 1}. {s.name}
      </p>
      <div className="mt-2">
        <Readout
          items={[
            { label: 'хромозоми', value: s.n },
            { label: 'ДНК', value: s.c },
          ]}
        />
      </div>
      <Buttons>
        <DiagramButton active={mode === 'mitosis'} onClick={() => choose('mitosis')}>
          митоза
        </DiagramButton>
        <DiagramButton active={mode === 'meiosis'} onClick={() => choose('meiosis')}>
          мейоза
        </DiagramButton>
      </Buttons>
      <Buttons>
        <DiagramButton onClick={() => setStep(Math.max(0, step - 1))}>← Назад</DiagramButton>
        <DiagramButton onClick={() => setStep(Math.min(steps.length - 1, step + 1))}>Напред →</DiagramButton>
        {mode === 'meiosis' && step >= 3 && <DiagramButton onClick={() => setFlip(!flip)}>🔄 смени ориентацията на двойка B</DiagramButton>}
      </Buttons>
      <Note tone="violet">{s.text}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Червено – хромозомите от майката, синьо – от бащата; дългата и късата двойка са хомоложни двойки. „c“ е количеството ДНК в
        хаплоиден набор хромозоми без удвояване.
      </p>
    </div>
  );
}
