import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

const T_END = 12; // min
const DT = 0.005; // min
const ADR_HALF = 2.5; // полуживот на адреналина в кръвта, min

type Opts = { dose: number; on: number; blocker: boolean; toxin: boolean; pde: boolean };
type Sample = { t: number; occ: number; g: number; camp: number; rate: number };

/**
 * Опростен модел на каскадата в чернодробна клетка (min, стойности без мерни единици):
 * адреналинът заема рецепторите → G-белтъкът се включва и сам се изключва (разгражда своя ГТФ) →
 * аденилатциклазата прави цАМФ, който фосфодиестеразата (ФДЕ) разгражда → глюкозата излиза със скорост c / (c + 1).
 */
function simulate({ dose, on, blocker, toxin, pde }: Opts) {
  const koff = toxin ? 0 : 4;
  const p = pde ? 0.75 : 3;
  let g = 0;
  let c = 0;
  let glucose = 0;
  const out: Sample[] = [];
  const steps = Math.round(T_END / DT);
  for (let i = 0; i <= steps; i++) {
    const t = i * DT;
    const e = t < on ? dose : dose * Math.pow(2, -(t - on) / ADR_HALF);
    const occ = (e / (e + 1)) * (blocker ? 0.1 : 1);
    const rate = c / (c + 1);
    if (i % 10 === 0) out.push({ t, occ, g, camp: c, rate });
    g += (4 * occ * (1 - g) - koff * g) * DT;
    c += (10 * g - p * c) * DT;
    glucose += rate * DT;
  }
  return { out, glucose };
}

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

const X0 = 50;
const X1 = 400;
const px = (t: number) => X0 + (t / T_END) * (X1 - X0);
const A_TOP = 28;
const A_BOT = 140;
const B_TOP = 178;
const B_BOT = 290;

const LADDER = [
  { name: 'адреналин', n: '1' },
  { name: 'активна аденилатциклаза', n: '10²' },
  { name: 'цАМФ', n: '10⁴' },
  { name: 'активна протеинкиназа A', n: '10⁴' },
  { name: 'фосфорилаза-киназа', n: '10⁵' },
  { name: 'гликоген-фосфорилаза', n: '10⁶' },
  { name: 'глюкоза-1-фосфат', n: '10⁸' },
];

/** Вторичен посредник: адреналин → G-белтък → цАМФ → глюкоза от гликогена; блокер, холерен токсин, инхибитор на ФДЕ. */
export default function CascadeLab() {
  const [dose, setDose] = useState(3);
  const [on, setOn] = useState(2);
  const [blocker, setBlocker] = useState(false);
  const [toxin, setToxin] = useState(false);
  const [pde, setPde] = useState(false);

  const run = useMemo(() => simulate({ dose, on, blocker, toxin, pde }), [dose, on, blocker, toxin, pde]);
  const control = useMemo(() => simulate({ dose, on, blocker: false, toxin: false, pde: false }), [dose, on]);
  const data = run.out;
  const cMax = Math.max(4, ...data.map(s => s.camp)) * 1.05;
  const pyA = (v: number) => A_BOT - v * (A_BOT - A_TOP);
  const pyB = (v: number) => B_BOT - (v / cMax) * (B_BOT - B_TOP);
  const path = (f: (s: Sample) => number) => data.map((s, k) => `${k ? 'L' : 'M'} ${px(s.t).toFixed(1)} ${f(s).toFixed(1)}`).join(' ');

  const last = data[data.length - 1];
  const peak = Math.max(...data.map(s => s.camp));
  const ratio = run.glucose / control.glucose;

  let note: string;
  if (blocker) note = 'Рецепторите са блокирани: адреналинът е в кръвта, но клетката почти не го „чува“ – сигналът спира още на мембраната.';
  else if (toxin) note = 'Холерният токсин „заключва“ G-белтъка включен: цАМФ остава висок и след като адреналинът изчезне. В клетките на червата това изкарва навън соли и вода – тежката диария при холера.';
  else if (pde) note = 'ФДЕ е потисната: цАМФ се разгражда по-бавно, нивото му е по-високо и сигналът продължава по-дълго.';
  else note = 'Когато адреналинът изчезне, сигналът угасва за минути: G-белтъкът сам се изключва, а ФДЕ разгражда цАМФ. Каскадата е силна, но и лесно спира.';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 330" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* горе: рецептори и G-белтък */}
        <line x1={X0} y1={A_BOT} x2={X1} y2={A_BOT} stroke="currentColor" />
        <line x1={X0} y1={A_TOP} x2={X0} y2={A_BOT} stroke="currentColor" />
        {[0, 50, 100].map(v => (
          <text key={v} x={X0 - 6} y={pyA(v / 100) + 4} fontSize="11" textAnchor="end" fill="currentColor">{v} %</text>
        ))}
        <rect x={px(0)} y={A_TOP} width={px(on) - px(0)} height={A_BOT - A_TOP} fill="#f59e0b" opacity={0.1} />
        <path d={path(s => pyA(s.occ))} fill="none" stroke="#f59e0b" strokeWidth={2.5} />
        <path d={path(s => pyA(s.g))} fill="none" stroke="#0ea5e9" strokeWidth={2.5} />
        <text x={X0 + 6} y={A_TOP - 8} fontSize="12" fill="#d97706">заети рецептори</text>
        <text x={X0 + 130} y={A_TOP - 8} fontSize="12" fill="#0284c7">активни G-белтъци</text>

        {/* долу: цАМФ и скорост на отделяне на глюкоза */}
        <line x1={X0} y1={B_BOT} x2={X1} y2={B_BOT} stroke="currentColor" />
        <line x1={X0} y1={B_TOP} x2={X0} y2={B_BOT} stroke="currentColor" />
        <path d={path(s => pyB(s.camp))} fill="none" stroke="#7c3aed" strokeWidth={2.5} />
        <path d={path(s => B_BOT - s.rate * (B_BOT - B_TOP))} fill="none" stroke="#e11d48" strokeWidth={2} strokeDasharray="6 3" />
        <text x={X0 + 6} y={B_TOP - 8} fontSize="12" fill="#7c3aed">цАМФ</text>
        <text x={X0 + 60} y={B_TOP - 8} fontSize="12" fill="#e11d48">отделяне на глюкоза (- -)</text>
        {[0, 2, 4, 6, 8, 10, 12].map(t => (
          <text key={t} x={px(t)} y={B_BOT + 16} fontSize="11" textAnchor="middle" fill="currentColor">{t}</text>
        ))}
        <text x={(X0 + X1) / 2} y={B_BOT + 31} fontSize="12" textAnchor="middle" fill="currentColor">време, min</text>

        {/* стълбата на усилването */}
        <text x={430} y={24} fontSize="12" fontWeight="700" fill="currentColor">усилване (по учебниците)</text>
        {LADDER.map((s, k) => {
          const y = 48 + k * 40;
          const w = 22 + k * 8;
          return (
            <g key={s.name}>
              <rect x={430} y={y - 14} width={w} height={20} rx={4} fill={k === 2 ? '#7c3aed' : k === 6 ? '#e11d48' : '#94a3b8'} opacity={0.35} />
              <text x={434} y={y} fontSize="12" fontWeight="700" fill="currentColor">{s.n}</text>
              <text x={430 + w + 6} y={y} fontSize="11" fill="currentColor">{s.name}</text>
              {k < LADDER.length - 1 && <text x={440} y={y + 20} fontSize="11" className="fill-gray-400">↓</text>}
            </g>
          );
        })}
      </LabSvg>

      <Buttons>
        <DiagramButton onClick={() => setBlocker(b => !b)} active={blocker}>
          блокер на рецептора
        </DiagramButton>
        <DiagramButton onClick={() => setToxin(b => !b)} active={toxin}>
          холерен токсин
        </DiagramButton>
        <DiagramButton onClick={() => setPde(b => !b)} active={pde}>
          инхибитор на ФДЕ
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="доза" value={dose} onChange={setDose} min={0.5} max={10} step={0.5} tone="amber" />
        <Slider label="време" value={on} onChange={setOn} min={0.5} max={6} step={0.5} tone="gray" />
      </Sliders>

      <Readout
        items={[
          { label: 'връх на цАМФ', value: fmt(peak, 2), tone: 'violet' },
          { label: 'цАМФ в края', value: fmt(last.camp, 2), tone: 'violet' },
          { label: 'глюкоза', value: `× ${fmt(ratio, 2)} спрямо нормата`, tone: 'rose' },
        ]}
      />
      <Note tone="violet">{note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 „Доза“ е концентрацията на адреналина спрямо тази, при която са заети половината рецептори, а „време“ – колко минути дълго жлезата го
        отделя (жълтата ивица); после той изчезва с полуживот около 2,5 min. Моделът е опростен и стойностите на цАМФ са условни.
        Числата в стълбата са порядъците от учебниците – колко молекули се включват на всяко стъпало за една молекула адреналин; в
        реалната клетка зависят от много неща. Холерният токсин всъщност действа в клетките на червата, а не на черния дроб – тук само
        показва какво става, когато G-белтъкът не може да се изключи.
      </p>
    </div>
  );
}
