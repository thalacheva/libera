import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';
import { MoleculeGroup } from '../StructuralFormula';
import { CurlyArrow, LonePair, RadicalDot } from './CurlyArrow';
import { type Placed, anchored, at, manual, mid, semi } from './mechanismGeom';

type P = { x: number; y: number };
type Arrow = { from: P; to: P; bend?: number; half?: boolean; startGap?: number; endGap?: number };
type Step = {
  title: string;
  text: string;
  species: Placed[];
  arrows: Arrow[];
  pairs?: { at: P; angle: number }[];
  dots?: { at: P; angle: number }[];
  marks?: { x: number; y: number; t: string }[];
  plus?: P[];
  /** Стрелката на реакцията: от x1 до x2 на височина y, с надпис над нея. */
  reaction: { x1: number; x2: number; y: number; label?: string };
  /** Преходното състояние на SN2 се рисува отделно. */
  ts?: P;
  /** Кой участък от енергийната диаграма (индекси на точките) отговаря на стъпката. */
  segment?: [number, number];
};
type Reaction = { name: string; summary: string; steps: Step[]; profile: { levels: number[]; labels: string[] } };

const B = 48;
const FS = 13;
const opt = (hl?: number[]) => ({ bond: B, fs: FS, hl });
/** Точка над (dy < 0) или под (dy > 0) атома – краят на стрелка, която не бива да минава през надписа. */
const near = (p: Placed, k: number, dy: number, dx = 0) => ({ x: at(p, k).x + dx, y: at(p, k).y + dy });
const midAt = (p: Placed, a: number, b: number, dy: number) => ({ x: mid(p, a, b).x, y: mid(p, a, b).y + dy });
const pl = (smiles: string, k: number, x: number, y: number, hl?: number[]) => anchored(semi(smiles), k, x, y, opt(hl));

// ---------- Радикалово хлориране на метана ----------

const cl2a = pl('ClCl', 0, 70, 100);
const clR1 = pl('[Cl]', 0, 330, 100);
const clR2 = pl('[Cl]', 0, 420, 100);

const cl1 = pl('[Cl]', 0, 40, 100);
const hc = pl('[H]C', 0, 108, 100);
const hcl = pl('[H]Cl', 0, 300, 100);
const me1 = pl('[CH3]', 0, 430, 100);

const me2 = pl('[CH3]', 0, 40, 100);
const cl2b = pl('ClCl', 0, 130, 100);
const mecl = pl('CCl', 0, 305, 100);
const clR3 = pl('[Cl]', 0, 430, 100);

const me3 = pl('[CH3]', 0, 50, 100);
const cl3 = pl('[Cl]', 0, 175, 100);
const mecl2 = pl('CCl', 0, 355, 100);

const chlorination: Reaction = {
  name: 'Хлориране на метан',
  summary: 'CH₄ + Cl₂ → CH₃Cl + HCl (на светлина)',
  profile: { levels: [0, 17, 8, 12, -101], labels: ['CH₄ + Cl·', '', 'CH₃· + HCl', '', 'CH₃Cl + Cl·'] },
  steps: [
    {
      title: '1. Иницииране',
      text: 'Квант светлина разкъсва връзката Cl–Cl хомолитично: всеки атом взима по един електрон от общата двойка. Получават се два хлорни радикала.',
      species: [cl2a, clR1, clR2],
      arrows: [
        { from: midAt(cl2a, 0, 1, -5), to: near(cl2a, 0, -11, 3), bend: -0.9, half: true, startGap: 0, endGap: 1 },
        { from: midAt(cl2a, 0, 1, -5), to: near(cl2a, 1, -11, -3), bend: 0.9, half: true, startGap: 0, endGap: 1 },
      ],
      dots: [
        { at: at(clR1, 0), angle: 0 },
        { at: at(clR2, 0), angle: 0 },
      ],
      plus: [{ x: 375, y: 100 }],
      reaction: { x1: 195, x2: 270, y: 100, label: 'hν' },
    },
    {
      title: '2. Развитие на веригата (а)',
      text: 'Хлорният радикал откъсва водороден атом от метана. Единият електрон на връзката C–H отива при водорода (новата връзка H–Cl), другият остава на въглерода – получава се метилов радикал.',
      species: [cl1, hc, hcl, me1],
      arrows: [
        { from: { x: 53, y: 97 }, to: { x: 78, y: 97 }, bend: 1.6, half: true, startGap: 0, endGap: 1 },
        { from: mid(hc, 0, 1), to: { x: 82, y: 97 }, bend: -1.1, half: true, startGap: 2, endGap: 1 },
        { from: midAt(hc, 0, 1, 5), to: near(hc, 1, 11), bend: -0.8, half: true, startGap: 0, endGap: 1 },
      ],
      dots: [
        { at: at(cl1, 0), angle: 0 },
        { at: at(me1, 0), angle: -90 },
      ],
      plus: [{ x: 388, y: 100 }],
      reaction: { x1: 210, x2: 262, y: 100 },
      segment: [0, 2],
    },
    {
      title: '3. Развитие на веригата (б)',
      text: 'Метиловият радикал откъсва хлорен атом от нова молекула Cl₂. Получава се хлорометан и нов хлорен радикал – той продължава веригата от стъпка 2. Така един квант светлина може да доведе до хиляди превърнати молекули.',
      species: [me2, cl2b, mecl, clR3],
      arrows: [
        { from: { x: 40, y: 87 }, to: { x: 100, y: 97 }, bend: 0.7, half: true, startGap: 2, endGap: 1 },
        { from: mid(cl2b, 0, 1), to: { x: 104, y: 97 }, bend: -1.1, half: true, startGap: 2, endGap: 1 },
        { from: midAt(cl2b, 0, 1, 5), to: near(cl2b, 1, 11), bend: -0.8, half: true, startGap: 0, endGap: 1 },
      ],
      dots: [
        { at: at(me2, 0), angle: -90 },
        { at: at(clR3, 0), angle: 0 },
      ],
      plus: [{ x: 392, y: 100 }],
      reaction: { x1: 215, x2: 265, y: 100 },
      segment: [2, 4],
    },
    {
      title: '4. Прекъсване на веригата',
      text: 'Когато два радикала се срещнат, електроните им образуват връзка и веригата спира. Така се получават и CH₃–CH₃ (от два метилови радикала) и Cl₂. Радикалите са малко, затова прекъсването е рядко събитие.',
      species: [me3, cl3, mecl2],
      arrows: [
        { from: { x: 50, y: 87 }, to: { x: 113, y: 97 }, bend: 0.7, half: true, startGap: 2, endGap: 1 },
        { from: { x: 162, y: 97 }, to: { x: 117, y: 97 }, bend: -0.9, half: true, startGap: 0, endGap: 1 },
      ],
      dots: [
        { at: at(me3, 0), angle: -90 },
        { at: at(cl3, 0), angle: 180 },
      ],
      reaction: { x1: 235, x2: 295, y: 100 },
    },
  ],
};

// ---------- HBr + пропен ----------

const propene = pl('C=CC', 0, 40, 110);
const hbr = pl('[H]Br', 0, 195, 110);
const cat1 = pl('C[CH+]C', 1, 378, 95, [1]);
const brm1 = pl('[Br-]', 0, 410, 150);
const cat2 = pl('C[CH+]C', 1, 90, 85, [1]);
const brm2 = pl('[Br-]', 0, 165, 150);
const bromopropane = pl('CC(Br)C', 1, 375, 80, [2]);

const hbrAddition: Reaction = {
  name: 'HBr + пропен',
  summary: 'CH₂=CH–CH₃ + HBr → CH₃–CHBr–CH₃',
  profile: { levels: [0, 62, 30, 36, -55], labels: ['пропен + HBr', '', 'карбокатион + Br⁻', '', '2-бромопропан'] },
  steps: [
    {
      title: '1. Атака на електрофила',
      text: 'π-електроните на двойната връзка атакуват водорода на HBr (δ+), а електронната двойка на връзката H–Br отива изцяло при брома. Водородът се свързва с крайния въглерод – така се получава по-стабилният, вторичен карбокатион (правило на Марковников).',
      species: [propene, hbr, cat1, brm1],
      arrows: [
        { from: mid(propene, 0, 1), to: at(hbr, 0), bend: 0.4, startGap: 4, endGap: 10 },
        { from: midAt(hbr, 0, 1, 5), to: near(hbr, 1, 11), bend: -0.8, startGap: 0, endGap: 1 },
      ],
      marks: [
        { x: 195, y: 90, t: 'δ+' },
        { x: 243, y: 90, t: 'δ−' },
      ],
      plus: [{ x: 382, y: 150 }],
      reaction: { x1: 268, x2: 302, y: 110 },
      segment: [0, 2],
    },
    {
      title: '2. Атака на нуклеофила',
      text: 'Бромидният йон (нуклеофил) отдава електронна двойка на положително заредения въглерод. Получава се 2-бромопропан. Тази стъпка е бърза – карбокатионът „живее“ много кратко.',
      species: [cat2, brm2, bromopropane],
      arrows: [{ from: { x: 155, y: 141 }, to: at(cat2, 1), bend: -0.45, startGap: 0, endGap: 13 }],
      pairs: [{ at: at(brm2, 0), angle: -140 }],
      reaction: { x1: 225, x2: 295, y: 100 },
      segment: [2, 4],
    },
  ],
};

// ---------- SN2 ----------

const oh1 = pl('[OH-]', 0, 45, 100);
const mebr = pl('CBr', 0, 150, 100);
const methanol = pl('OC', 0, 300, 100);
const brm3 = pl('[Br-]', 0, 445, 100);

const sn2: Reaction = {
  name: 'SN2',
  summary: 'HO⁻ + CH₃Br → CH₃OH + Br⁻',
  profile: { levels: [0, 75, -35], labels: ['HO⁻ + CH₃Br', '', 'CH₃OH + Br⁻'] },
  steps: [
    {
      title: '1. Атака отзад',
      text: 'Хидроксидният йон атакува въглерода (δ+) от страната, противоположна на брома. Едновременно се образува връзката C–O и се къса C–Br: в преходното състояние въглеродът е свързан наполовина и с двата, а трите водорода са в една равнина.',
      species: [oh1, mebr],
      arrows: [
        { from: { x: 52, y: 110 }, to: near(mebr, 0, 11, -2), bend: -0.45, startGap: 0, endGap: 1 },
        { from: midAt(mebr, 0, 1, 5), to: near(mebr, 1, 11), bend: -0.8, startGap: 0, endGap: 1 },
      ],
      pairs: [{ at: at(oh1, 0), angle: 60 }],
      marks: [
        { x: 150, y: 80, t: 'δ+' },
        { x: 198, y: 80, t: 'δ−' },
      ],
      ts: { x: 375, y: 100 },
      reaction: { x1: 225, x2: 278, y: 100 },
      segment: [0, 1],
    },
    {
      title: '2. Бромидът напуска',
      text: 'Бромът отнася електронната двойка и излиза като бромиден йон. Трите водорода се обръщат на другата страна – като чадър при силен вятър. Това е обръщането на Валден: ако въглеродът е хирален, продуктът е с обратна конфигурация.',
      species: [methanol, brm3],
      arrows: [],
      ts: { x: 110, y: 100 },
      plus: [{ x: 405, y: 100 }],
      reaction: { x1: 215, x2: 262, y: 100 },
      segment: [1, 2],
    },
  ],
};

// ---------- SN1 ----------

const tbubr = pl('CC(C)(C)Br', 1, 100, 100);
const tbuCat1 = pl('C[C+](C)C', 1, 345, 90, [1]);
const brm4 = pl('[Br-]', 0, 455, 90);
const tbuCat2 = pl('C[C+](C)C', 1, 95, 105, [1]);
const water1 = pl('O', 0, 205, 45);
const oxonium1 = pl('CC(C)(C)[OH2+]', 1, 355, 100, [4]);
const oxonium2 = anchored(
  manual('CC(C)(C)[OH+][H]', [
    [-1, 0],
    [0, 0],
    [0, 1],
    [0, -1],
    [1, 0],
    [1.7, 0.7],
  ]),
  1,
  80,
  95,
  opt(),
);
const water2 = pl('O', 0, 218, 152);
const tbuoh = pl('CC(C)(C)O', 1, 345, 95, [4]);
const h3o = pl('[OH3+]', 0, 440, 160);

const sn1: Reaction = {
  name: 'SN1',
  summary: '(CH₃)₃CBr + H₂O → (CH₃)₃COH + HBr',
  profile: { levels: [0, 80, 45, 50, 5, 10, -20], labels: ['(CH₃)₃CBr', '', 'карбокатион', '', '', '', '(CH₃)₃COH'] },
  steps: [
    {
      title: '1. Йонизация (бавна)',
      text: 'Връзката C–Br се разкъсва хетеролитично – бромът отнася двойката електрони. Остава третичен карбокатион. Тази стъпка е бавната: скоростта зависи само от концентрацията на халогеналкана, v = k[(CH₃)₃CBr].',
      species: [tbubr, tbuCat1, brm4],
      arrows: [{ from: midAt(tbubr, 1, 4, 5), to: near(tbubr, 4, 11), bend: -0.8, startGap: 0, endGap: 1 }],
      plus: [{ x: 428, y: 90 }],
      reaction: { x1: 195, x2: 255, y: 100 },
      segment: [0, 2],
    },
    {
      title: '2. Атака на нуклеофила (бърза)',
      text: 'Водата отдава електронна двойка на плоския карбокатион. Тя може да дойде отгоре или отдолу с еднаква вероятност – затова от хирален изходен халогеналкан се получава смес от двете огледални форми (рацемат).',
      species: [tbuCat2, water1, oxonium1],
      arrows: [{ from: { x: 196, y: 54 }, to: at(tbuCat2, 1), bend: 0.3, startGap: 0, endGap: 14 }],
      pairs: [{ at: at(water1, 0), angle: 135 }],
      reaction: { x1: 232, x2: 272, y: 100 },
      segment: [2, 4],
    },
    {
      title: '3. Отнемане на протон',
      text: 'Друга молекула вода отнема протон от оксониевия йон. Получава се 2-метилпропан-2-ол, а протонът преминава в H₃O⁺ – разтворът става кисел (HBr).',
      species: [oxonium2, water2, tbuoh, h3o],
      arrows: [
        { from: { x: 214, y: 141 }, to: at(oxonium2, 5), bend: 0.35, startGap: 0, endGap: 9 },
        { from: mid(oxonium2, 4, 5), to: at(oxonium2, 4), bend: -1.2, startGap: 2, endGap: 12 },
      ],
      pairs: [{ at: at(water2, 0), angle: -110 }],
      plus: [{ x: 405, y: 160 }],
      reaction: { x1: 230, x2: 268, y: 95 },
      segment: [4, 6],
    },
  ],
};

// ---------- E2 ----------

const e2sub = anchored(
  manual('CC(Br)C[H]', [
    [-1, 0],
    [0, 0],
    [0, 1],
    [1, 0],
    [1, -1],
  ]),
  1,
  110,
  105,
  opt(),
);
const e2base = anchored(
  manual('[O-][H]', [
    [0, 0],
    [1, 0],
  ]),
  0,
  235,
  57,
  opt(),
);
const small = { bond: 34, fs: 13 };
const propene2 = anchored(semi('CC=C'), 0, 375, 85, small);
const water3 = anchored(semi('O'), 0, 382, 140, small);
const brm5 = anchored(semi('[Br-]'), 0, 445, 140, small);

const e2: Reaction = {
  name: 'E2',
  summary: 'CH₃–CHBr–CH₃ + OH⁻ → CH₃–CH=CH₂ + H₂O + Br⁻',
  profile: { levels: [0, 70, -30], labels: ['2-бромопропан + HO⁻', '', 'пропен + H₂O + Br⁻'] },
  steps: [
    {
      title: 'Една стъпка – три стрелки',
      text: 'Силната основа отнема протон от съседния (β) въглерод. Електронната двойка на C–H става втората връзка C=C, а бромът излиза с двойката на C–Br. Всичко става едновременно; най-лесно е, когато H и Br са от двете страни на молекулата (анти-разположение). Скоростта е v = k[RBr][HO⁻].',
      species: [e2sub, e2base, propene2, water3, brm5],
      arrows: [
        { from: { x: 224, y: 57 }, to: at(e2sub, 4), bend: 0.25, startGap: 0, endGap: 9 },
        { from: mid(e2sub, 3, 4), to: mid(e2sub, 1, 3), bend: -0.8, startGap: 2, endGap: 3 },
        { from: midAt(e2sub, 1, 2, 0), to: near(e2sub, 2, -5, 13), bend: 0.7, startGap: 2, endGap: 1 },
      ],
      pairs: [{ at: at(e2base, 0), angle: 180 }],
      plus: [
        { x: 352, y: 140 },
        { x: 418, y: 140 },
      ],
      reaction: { x1: 300, x2: 340, y: 105, label: 't°' },
      segment: [0, 2],
    },
  ],
};

const REACTIONS = [chlorination, hbrAddition, sn2, sn1, e2];

/** Преходното състояние на SN2: [HO···CH₃···Br]‡ с трите водорода в равнина. */
function Sn2TransitionState({ x, y }: P) {
  const fs = 13;
  return (
    <g fontSize={fs} fontWeight={600}>
      <g className="stroke-current" strokeWidth={1.6}>
        <line x1={x - 44} y1={y} x2={x - 9} y2={y} strokeDasharray="3 3" />
        <line x1={x + 9} y1={y} x2={x + 42} y2={y} strokeDasharray="3 3" />
        <line x1={x} y1={y - 8} x2={x} y2={y - 26} />
        <line x1={x - 6} y1={y + 6} x2={x - 16} y2={y + 22} />
        <line x1={x + 6} y1={y + 6} x2={x + 16} y2={y + 22} />
      </g>
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" className="fill-current">C</text>
      <text x={x} y={y - 34} textAnchor="middle" dominantBaseline="central" className="fill-current">H</text>
      <text x={x - 20} y={y + 30} textAnchor="middle" dominantBaseline="central" className="fill-current">H</text>
      <text x={x + 20} y={y + 30} textAnchor="middle" dominantBaseline="central" className="fill-current">H</text>
      <text x={x - 52} y={y} textAnchor="end" dominantBaseline="central" className="fill-red-600 dark:fill-red-400">HO</text>
      <text x={x + 50} y={y} dominantBaseline="central" className="fill-rose-700 dark:fill-rose-400">Br</text>
      <text x={x - 64} y={y - 18} fontSize={11} textAnchor="middle" className="fill-gray-500">δ−</text>
      <text x={x + 62} y={y - 18} fontSize={11} textAnchor="middle" className="fill-gray-500">δ−</text>
      <path d={`M ${x - 80} ${y - 44} h -5 v 88 h 5 M ${x + 78} ${y - 44} h 5 v 88 h -5`} className="stroke-current" fill="none" strokeWidth={1.4} />
      <text x={x + 88} y={y - 40} fontSize={14} className="fill-current">‡</text>
    </g>
  );
}

/** Енергийна диаграма (схематична): точки – вещества и преходни състояния; оцветен е участъкът на текущата стъпка. */
function Profile({ levels, labels, segment }: { levels: number[]; labels: string[]; segment?: [number, number] }) {
  const n = levels.length;
  const lo = Math.min(...levels);
  const hi = Math.max(...levels);
  const X = (i: number) => 50 + (i * 380) / (n - 1);
  const Y = (e: number) => 92 - ((e - lo) / (hi - lo || 1)) * 70;
  const path = (from: number, to: number) => {
    let d = `M ${X(from)} ${Y(levels[from])}`;
    for (let i = from; i < to; i++) {
      const dx = (X(i + 1) - X(i)) / 2;
      d += ` C ${X(i) + dx} ${Y(levels[i])} ${X(i + 1) - dx} ${Y(levels[i + 1])} ${X(i + 1)} ${Y(levels[i + 1])}`;
    }
    return d;
  };
  return (
    <LabSvg viewBox="0 0 480 130" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-2">
      <line x1={30} y1={8} x2={30} y2={104} className="stroke-gray-400" strokeWidth={1.2} />
      <text x={22} y={56} fontSize={10} textAnchor="middle" className="fill-gray-500" transform="rotate(-90 22 56)">
        енергия
      </text>
      <path d={path(0, n - 1)} fill="none" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth={2} />
      {segment && <path d={path(segment[0], segment[1])} fill="none" className="stroke-amber-500" strokeWidth={4} strokeLinecap="round" />}
      {levels.map((e, i) =>
        labels[i] ? (
          <text key={i} x={Math.min(Math.max(X(i), 62), 420)} y={Math.min(Y(e) + 16, 120)} fontSize={10} textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
            {labels[i]}
          </text>
        ) : (
          <text key={i} x={X(i)} y={Y(e) - 6} fontSize={11} textAnchor="middle" className="fill-gray-500">
            ‡
          </text>
        ),
      )}
    </LabSvg>
  );
}

/** Механизмите стъпка по стъпка: извити стрелки, междинни частици и енергийна диаграма. */
export default function MechanismPlayerLab() {
  const [ri, setRi] = useState(0);
  const [si, setSi] = useState(0);
  const r = REACTIONS[ri];
  const step = r.steps[Math.min(si, r.steps.length - 1)];
  const { reaction: ra } = step;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {REACTIONS.map((x, i) => (
          <DiagramButton
            key={x.name}
            active={i === ri}
            onClick={() => {
              setRi(i);
              setSi(0);
            }}
          >
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="text-center text-sm sm:text-base font-semibold mt-2 text-gray-800 dark:text-gray-100">{r.summary}</p>

      <LabSvg viewBox="0 0 480 190" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-2">
        {step.species.map((p, i) => (
          <MoleculeGroup key={i} mol={p.mol} mode={p.mode} x={p.x} y={p.y} bond={p.bond} fontSize={p.fs} highlightAtoms={p.hl} />
        ))}
        {step.ts && <Sn2TransitionState {...step.ts} />}
        {(step.pairs ?? []).map((q, i) => (
          <LonePair key={i} at={q.at} angle={q.angle} />
        ))}
        {(step.dots ?? []).map((q, i) => (
          <RadicalDot key={i} at={q.at} angle={q.angle} />
        ))}
        {(step.marks ?? []).map((m, i) => (
          <text key={i} x={m.x} y={m.y} fontSize={11} textAnchor="middle" className="fill-gray-500">
            {m.t}
          </text>
        ))}
        {(step.plus ?? []).map((q, i) => (
          <text key={i} x={q.x} y={q.y} fontSize={16} textAnchor="middle" dominantBaseline="central" className="fill-current">
            +
          </text>
        ))}
        <g className="stroke-gray-500" strokeWidth={1.6}>
          <line x1={ra.x1} y1={ra.y} x2={ra.x2} y2={ra.y} />
          <path d={`M ${ra.x2 - 7} ${ra.y - 4} L ${ra.x2} ${ra.y} L ${ra.x2 - 7} ${ra.y + 4}`} fill="none" />
        </g>
        {ra.label && (
          <text x={(ra.x1 + ra.x2) / 2} y={ra.y - 8} fontSize={12} textAnchor="middle" className="fill-gray-500">
            {ra.label}
          </text>
        )}
        {step.arrows.map((a, i) => (
          <CurlyArrow key={i} {...a} />
        ))}
      </LabSvg>

      {r.steps.length > 1 && (
        <Buttons>
          {r.steps.map((s, i) => (
            <DiagramButton key={s.title} active={i === si} onClick={() => setSi(i)}>
              {s.title}
            </DiagramButton>
          ))}
        </Buttons>
      )}
      <Note tone="amber">
        <strong>{step.title}.</strong> {step.text}
      </Note>
      <Profile levels={r.profile.levels} labels={r.profile.labels} segment={step.segment} />
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
        💡 Червените стрелки показват къде отиват електроните: цяла стрелка – двойка електрони, „въдица“ с една кукичка – един
        електрон. Стрелката винаги тръгва от електроните (несвързана двойка, връзка, радикал), а не от атома, който ги приема.
        Енергийната диаграма е схематична; при хлорирането стойностите са приблизителни.
        {segment(step)}
      </p>
    </div>
  );
}

const segment = (s: Step) => (s.segment ? '' : ' Тази стъпка не е на диаграмата – тя показва само двете стъпки на развитие на веригата.');
