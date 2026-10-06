import { useState } from 'react';
import {
  AngleMark,
  Diagram,
  DiagramButton,
  Buttons,
  Formula,
  Handle,
  Label,
  Note,
  Readout,
  Segment,
  SideLabel,
  VertexLabel,
} from './diagram';
import {
  add,
  angleAt,
  dist,
  fmt,
  Point,
  polygonArea,
  scale,
  snap,
  sub,
  tones,
  units,
  UNIT,
} from './diagramMath';

interface InteractiveTriangleProps {
  type: 'angles' | 'exterior' | 'inequality';
}

const NAMES = ['A', 'B', 'C'];

const unitVector = (p: Point) => {
  const len = Math.hypot(p.x, p.y) || 1;
  return { x: p.x / len, y: p.y / len };
};

export function InteractiveTriangle({ type }: InteractiveTriangleProps) {
  const [vertices, setVertices] = useState<Point[]>([
    { x: 100, y: 260 },
    { x: 380, y: 260 },
    { x: 180, y: 80 },
  ]);
  const [showProof, setShowProof] = useState(false);

  const move = (index: number, p: Point) => {
    const next = [...vertices];
    next[index] = snap(p);
    // Не допускаме триъгълникът да се изроди в отсечка
    if (polygonArea(next) < UNIT * UNIT) return;
    setVertices(next);
  };

  const [A, B, C] = vertices;
  const center = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };

  // Закръгляме α и β, а γ допълваме до 180°, за да не се получава 179° или 181° от закръгляването
  const alpha = Math.round(angleAt(A, B, C));
  const beta = Math.round(angleAt(B, A, C));
  const gamma = 180 - alpha - beta;

  const a = units(dist(B, C));
  const b = units(dist(C, A));
  const c = units(dist(A, B));

  const triangle = (
    <polygon
      points={vertices.map(v => `${v.x},${v.y}`).join(' ')}
      className={`${tones.blue.soft} ${tones.blue.stroke}`}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  );

  const handles = vertices.map((v, i) => (
    <g key={NAMES[i]}>
      <VertexLabel p={v} center={center} name={NAMES[i]} />
      <Handle p={v} name={NAMES[i]} onMove={p => move(i, p)} />
    </g>
  ));

  if (type === 'angles') {
    // Права през C, успоредна на AB
    const dir = unitVector(sub(B, A));
    const left = add(C, scale(dir, -70));
    const right = add(C, scale(dir, 70));

    return (
      <Diagram
        hint="Влачи върховете (или използвай Tab и стрелките). Сборът на ъглите винаги остава 180°."
        readout={
          <>
            <Readout
              items={[
                { label: 'α =', value: `${alpha}°`, tone: 'rose' },
                { label: 'β =', value: `${beta}°`, tone: 'emerald' },
                { label: 'γ =', value: `${gamma}°`, tone: 'violet' },
              ]}
            />
            <Formula>
              α + β + γ = {alpha}° + {beta}° + {gamma}° = 180°
            </Formula>
            <Buttons>
              <DiagramButton onClick={() => setShowProof(s => !s)} active={showProof}>
                {showProof ? 'Скрий доказателството' : 'Покажи защо'}
              </DiagramButton>
            </Buttons>
            {showProof && (
              <Note tone="gray">
                Правата през C е успоредна на AB. Ъглите до нея са равни на α и β (кръстни ъгли),
                а заедно с γ образуват изправен ъгъл – 180°.
              </Note>
            )}
          </>
        }
      >
        {triangle}
        <AngleMark v={A} p={B} q={C} tone="rose" label="α" />
        <AngleMark v={B} p={C} q={A} tone="emerald" label="β" />
        <AngleMark v={C} p={A} q={B} tone="violet" label="γ" />
        {showProof && (
          <>
            <Segment p={left} q={right} tone="gray" dashed />
            <AngleMark v={C} p={left} q={A} tone="rose" label="α" r={30} />
            <AngleMark v={C} p={right} q={B} tone="emerald" label="β" r={30} />
          </>
        )}
        {handles}
      </Diagram>
    );
  }

  if (type === 'exterior') {
    // Продължение на BC след върха C
    const D = add(C, scale(unitVector(sub(C, B)), 90));
    const exterior = 180 - gamma;

    return (
      <Diagram
        hint="Външният ъгъл γ₁ при C се образува от страната CA и продължението на BC. Влачи върховете и сравни."
        readout={
          <>
            <Readout
              items={[
                { label: 'α =', value: `${alpha}°`, tone: 'rose' },
                { label: 'β =', value: `${beta}°`, tone: 'emerald' },
                { label: 'γ =', value: `${gamma}°`, tone: 'violet' },
                { label: 'γ₁ =', value: `${exterior}°`, tone: 'amber' },
              ]}
            />
            <Formula>
              γ₁ = α + β = {alpha}° + {beta}° = {exterior}°
            </Formula>
            <Formula>
              γ + γ₁ = {gamma}° + {exterior}° = 180°
            </Formula>
          </>
        }
      >
        {triangle}
        <Segment p={C} q={D} tone="gray" dashed />
        <AngleMark v={A} p={B} q={C} tone="rose" label="α" />
        <AngleMark v={B} p={C} q={A} tone="emerald" label="β" />
        <AngleMark v={C} p={A} q={B} tone="violet" label="γ" r={20} />
        <AngleMark v={C} p={D} q={A} tone="amber" label="γ₁" r={30} />
        {handles}
      </Diagram>
    );
  }

  // Неравенство на триъгълника
  const checks = [
    { side: 'a', value: a, others: ['b', 'c'], sum: b + c, tone: 'rose' as const },
    { side: 'b', value: b, others: ['a', 'c'], sum: a + c, tone: 'emerald' as const },
    { side: 'c', value: c, others: ['a', 'b'], sum: a + b, tone: 'violet' as const },
  ];
  const lengths = { a, b, c };
  const toneOf = { a: 'rose', b: 'emerald', c: 'violet' } as const;
  const maxSum = Math.max(...checks.map(ch => ch.sum));
  const tightest = Math.min(...checks.map(ch => ch.sum - ch.value));

  return (
    <Diagram
      hint="Опитай да „сплескаш“ триъгълника. Колкото по-близо е до отсечка, толкова по-малка е разликата."
      readout={
        <>
          <div className="space-y-2 max-w-md mx-auto">
            {checks.map(ch => (
              <div key={ch.side} className="text-sm">
                <div className="flex justify-between font-mono mb-1">
                  <span className={tones[ch.tone].text}>
                    {ch.side} = {fmt(ch.value)}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    &lt; {ch.others[0]} + {ch.others[1]} = {fmt(ch.sum)} ✓
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor[ch.tone]}`}
                    style={{ width: `${(ch.value / maxSum) * 100}%` }}
                  />
                </div>
                <div className="h-2 mt-0.5 flex rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  {ch.others.map(o => (
                    <div
                      key={o}
                      className={`h-full ${barColor[toneOf[o as keyof typeof toneOf]]} opacity-60`}
                      style={{ width: `${(lengths[o as keyof typeof lengths] / maxSum) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {tightest < 0.5 && (
            <Note tone="amber">Почти отсечка! Сборът на двете страни почти се изравнява с третата.</Note>
          )}
        </>
      }
    >
      {triangle}
      <Segment p={B} q={C} tone="rose" width={4} />
      <Segment p={C} q={A} tone="emerald" width={4} />
      <Segment p={A} q={B} tone="violet" width={4} />
      <SideLabel p={B} q={C} center={center} width={64} tone="rose">a = {fmt(a)}</SideLabel>
      <SideLabel p={C} q={A} center={center} width={64} tone="emerald">b = {fmt(b)}</SideLabel>
      <SideLabel p={A} q={B} center={center} width={64} tone="violet">c = {fmt(c)}</SideLabel>
      <Label p={{ x: 12, y: 14 }} tone="gray" size={12} anchor="start" weight={500}>
        1 квадратче = 1 единица
      </Label>
      {handles}
    </Diagram>
  );
}

const barColor = {
  rose: 'bg-rose-500',
  emerald: 'bg-emerald-500',
  violet: 'bg-violet-500',
};
