import { useState } from 'react';
import { MathText } from '~/MathText';
import { num } from '~/functions/functionMath';
import { AngleMark, Buttons, DiagramButton, Dot, Handle, Label, Readout, Segment, ZoomingSvg } from '~/geometry/diagram';
import { tones, type Point, type Tone } from '~/geometry/diagramMath';

// Полуокръжност с диаметър MN = a + b = 10 (в единици); C дели диаметъра на MC = a и CN = b.
const L = 60;
const R_PX = 180;
const O = { x: L + R_PX, y: 230 };
const M = { x: L, y: O.y };
const N = { x: L + 2 * R_PX, y: O.y };
const SUM = 10;
const PX = (2 * R_PX) / SUM; // пиксела на единица

type Step = 'all' | 'am' | 'gm' | 'hm' | 'qm';

const STEPS: { id: Step; label: string }[] = [
  { id: 'all', label: 'Веригата' },
  { id: 'am', label: 'Защо OD = A?' },
  { id: 'gm', label: 'Защо CD = G?' },
  { id: 'hm', label: 'Защо DE = H?' },
  { id: 'qm', label: 'Защо CF = Q?' },
];

const EXPLAIN: Record<Step, string> = {
  all:
    '**Веригата.** $CF$ е хипотенуза в правоъгълния $\\triangle OCF$, а $OF = OD$ е катет в него, затова $Q \\ge A$. $OD$ е хипотенуза в правоъгълния $\\triangle OCD$ с катет $CD$, затова $A \\ge G$. $CD$ е хипотенуза в правоъгълния $\\triangle CED$ с катет $DE$, затова $G \\ge H$.',
  am: '**Средно аритметично.** Диаметърът е $MN = MC + CN = a + b$, а $OD$ е радиус, т.е. половината от диаметъра: $OD = \\frac{a + b}{2} = A$.',
  gm: '**Средно геометрично.** $\\angle MDN = 90^\\circ$, защото е вписан ъгъл, който се опира на диаметъра. В правоъгълния $\\triangle MDN$ отсечката $CD$ е височина към хипотенузата, затова $CD^2 = MC \\cdot CN = ab$ и $CD = \\sqrt{ab} = G$.',
  hm: '**Средно хармонично.** $E$ е петата на перпендикуляра от $C$ към $OD$. В правоъгълния $\\triangle OCD$ (прав ъгъл при $C$) $CE$ е височина към хипотенузата, затова катетът $CD$ е средно геометрично на хипотенузата $OD$ и проекцията си $DE$: $CD^2 = DE \\cdot OD$. Оттук $DE = \\frac{CD^2}{OD} = \\frac{ab}{\\frac{a + b}{2}} = \\frac{2ab}{a + b} = H$.',
  qm: '**Средно квадратично.** $OF$ е радиусът, перпендикулярен на диаметъра, $OF = \\frac{a + b}{2}$, а $OC = \\frac{|a - b|}{2}$. По Питагоровата теорема в $\\triangle OCF$: $CF^2 = \\frac{(a - b)^2}{4} + \\frac{(a + b)^2}{4} = \\frac{a^2 + b^2}{2}$, т.е. $CF = Q$.',
};

/** Запълнен (осветен) триъгълник. */
function Tri({ pts, tone }: { pts: Point[]; tone: Tone }) {
  return <path d={`M ${pts.map(p => `${p.x} ${p.y}`).join(' L ')} Z`} className={`${tones[tone].soft} stroke-none`} />;
}

/** Четирите средни на две числа като отсечки в полуокръжност: Q ≥ A ≥ G ≥ H. */
export function MeansLab() {
  const [a, setA] = useState(2.5);
  const [step, setStep] = useState<Step>('all');
  const b = SUM - a;

  const am = (a + b) / 2;
  const gm = Math.sqrt(a * b);
  const hm = (2 * a * b) / (a + b);
  const qm = Math.sqrt((a * a + b * b) / 2);

  // C – точката от диаметъра, D – върхът на перпендикуляра в C, F – най-горната точка
  const C = { x: L + a * PX, y: O.y };
  const D = { x: C.x, y: O.y - gm * PX };
  const F = { x: O.x, y: O.y - R_PX };
  // E – петата на перпендикуляра от C към радиуса OD (DE = H)
  const ux = (C.x - O.x) / R_PX;
  const uy = (D.y - O.y) / R_PX;
  const t = (C.x - O.x) * ux; // проекцията на OC върху OD
  const E = { x: O.x + t * ux, y: O.y + t * uy };
  // DE лежи върху OD – рисуваме я леко встрани (от страната на дъгата), за да се вижда и цялата OD
  const side = ux <= 0 ? 1 : -1;
  const shift = (p: Point) => ({ x: p.x - side * uy * 6, y: p.y + side * ux * 6 });
  // етикетът на E – от другата страна на OD спрямо C
  const nx = -uy;
  const ny = ux;
  const away = (C.x - E.x) * nx + (C.y - E.y) * ny > 0 ? -1 : 1;
  const Elabel = { x: E.x + away * nx * 14, y: E.y + away * ny * 14 };

  const arc = Array.from({ length: 61 }, (_, i) => {
    const th = Math.PI - (Math.PI * i) / 60;
    return `${i ? 'L' : 'M'} ${(O.x + R_PX * Math.cos(th)).toFixed(1)} ${(O.y - R_PX * Math.sin(th)).toFixed(1)}`;
  }).join(' ');

  const equal = Math.abs(a - b) < 1e-9;
  // когато C е близо до O, раздалечаваме буквите им
  const dx = C.x - O.x;
  const nudge = Math.abs(dx) < 16 ? (dx <= 0 ? 9 : -9) : 0;

  const on = (s: Step) => step === 'all' || step === s;
  const dim = (s: Step, tone: Tone): Tone => (on(s) ? tone : 'gray');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 280">
        {/* осветеният правоъгълен триъгълник */}
        {step === 'gm' && <Tri pts={[M, D, N]} tone="emerald" />}
        {step === 'hm' && !equal && <Tri pts={[O, C, D]} tone="amber" />}
        {step === 'qm' && !equal && <Tri pts={[O, C, F]} tone="rose" />}

        <path d={arc} fill="none" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth={2} />
        <Segment p={M} q={N} tone="gray" width={2} />
        {step === 'am' && (
          <>
            <Segment p={{ x: M.x, y: O.y + 4 }} q={{ x: O.x, y: O.y + 4 }} tone="blue" width={3} />
            <Segment p={{ x: O.x, y: O.y + 4 }} q={{ x: N.x, y: O.y + 4 }} tone="blue" width={3} />
          </>
        )}
        {step === 'gm' && (
          <>
            <Segment p={M} q={D} tone="emerald" width={1.5} dashed />
            <Segment p={D} q={N} tone="emerald" width={1.5} dashed />
          </>
        )}
        <Segment p={O} q={F} tone="gray" width={1} dashed />

        {/* A – радиусът OD */}
        <Segment p={O} q={D} tone={dim('am', 'blue')} width={on('am') ? 3 : 1.5} />
        {/* Q – от C до най-горната точка F */}
        <Segment p={C} q={F} tone={dim('qm', 'rose')} width={on('qm') ? 3 : 1.5} />
        {/* G – перпендикулярът CD */}
        <Segment p={C} q={D} tone={dim('gm', 'emerald')} width={on('gm') ? 3.5 : 1.5} />
        {/* H – DE, проекцията на CD върху радиуса */}
        {!equal && <Segment p={C} q={E} tone="gray" width={1.5} dashed />}
        <Segment p={shift(D)} q={shift(E)} tone={dim('hm', 'amber')} width={on('hm') ? 4 : 2} />

        {/* прави ъгли */}
        {(step === 'gm' || step === 'hm') && !equal && <AngleMark v={C} p={D} q={step === 'gm' ? N : O} tone="gray" r={22} fill={false} />}
        {step === 'gm' && <AngleMark v={D} p={M} q={N} tone="emerald" r={22} fill={false} />}
        {step === 'hm' && !equal && <AngleMark v={E} p={D} q={C} tone="amber" r={18} fill={false} />}
        {(step === 'qm' || step === 'all') && !equal && <AngleMark v={O} p={F} q={C} tone="gray" r={20} fill={false} />}

        <Dot p={M} tone="gray" />
        <Dot p={N} tone="gray" />
        <Dot p={O} tone="gray" />
        <Dot p={D} tone="emerald" />
        <Dot p={F} tone="rose" />
        {!equal && <Dot p={E} tone="amber" r={3.5} />}

        <Label p={{ x: M.x - 12, y: M.y }} size={13}>
          M
        </Label>
        <Label p={{ x: N.x + 12, y: N.y }} size={13}>
          N
        </Label>
        <Label p={{ x: O.x - nudge, y: O.y + 15 }} size={13}>
          O
        </Label>
        <Label p={{ x: C.x + nudge, y: C.y + 15 }} size={13} tone="violet">
          C
        </Label>
        <Label p={{ x: D.x + (C.x < O.x ? -10 : 10), y: D.y - 12 }} size={13} tone="emerald" anchor={C.x < O.x ? 'end' : 'start'}>
          D
        </Label>
        <Label p={{ x: F.x, y: F.y - 12 }} size={13} tone="rose">
          F
        </Label>
        {!equal && (
          <Label p={Elabel} size={13} tone="amber">
            E
          </Label>
        )}
        <Label p={{ x: (M.x + C.x) / 2, y: O.y + 36 }} size={13} tone="ink">
          a = {num(a, 2)}
        </Label>
        <Label p={{ x: (C.x + N.x) / 2, y: O.y + 36 }} size={13} tone="ink">
          b = {num(b, 2)}
        </Label>
        <Handle
          p={C}
          name="C – дели диаметъра на a и b"
          tone="violet"
          onMove={q => {
            const v = Math.round(((q.x - L) / PX) * 4) / 4;
            setA(Math.min(SUM - 0.25, Math.max(0.25, v)));
          }}
        />
      </ZoomingSvg>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'Q = CF =', value: num(qm, 3), tone: 'rose' },
            { label: 'A = OD =', value: num(am, 3), tone: 'blue' },
            { label: 'G = CD =', value: num(gm, 3), tone: 'emerald' },
            { label: 'H = DE =', value: num(hm, 3), tone: 'amber' },
          ]}
        />
        <p className={`mt-2 text-center text-sm font-medium ${tones[equal ? 'emerald' : 'violet'].text}`}>
          {equal
            ? 'При a = b точката C съвпада с O и четирите отсечки са равни: Q = A = G = H = 5.'
            : `${num(qm, 2)} ≥ ${num(am, 2)} ≥ ${num(gm, 2)} ≥ ${num(hm, 2)}`}
        </p>
        <Buttons>
          {STEPS.map(s => (
            <DiagramButton key={s.id} active={step === s.id} onClick={() => setStep(s.id)}>
              {s.label}
            </DiagramButton>
          ))}
        </Buttons>
        <div className="mt-3 rounded-lg bg-gray-50 dark:bg-gray-700/40 p-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
          <MathText>{EXPLAIN[step]}</MathText>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Влачи точката C по диаметъра MN – тя го дели на отсечки с дължини a и b. Натисни бутоните, за да видиш защо всяка отсечка е
        съответното средно.
      </p>
    </div>
  );
}
