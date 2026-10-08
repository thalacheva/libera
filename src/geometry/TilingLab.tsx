import { useState } from 'react';
import { Buttons, Diagram, DiagramButton, Formula, Note } from './diagram';
import { fmt, Point } from './diagramMath';

const C = { x: 240, y: 160 };
const COLORS = ['fill-blue-400/60', 'fill-emerald-400/60', 'fill-amber-400/60', 'fill-rose-400/60', 'fill-violet-400/60', 'fill-sky-400/60'];

const interior = (n: number) => ((n - 2) * 180) / n;

/** Правилен n-ъгълник с връх C, чийто вътрешен ъгъл при C започва от посока θ (в градуси, обратно на часовника). */
function polygonAt(n: number, theta: number, S: number): Point[] {
  const pts: Point[] = [C];
  let dir = theta;
  let p = C;
  for (let i = 1; i < n; i++) {
    p = { x: p.x + S * Math.cos((dir * Math.PI) / 180), y: p.y - S * Math.sin((dir * Math.PI) / 180) };
    pts.push(p);
    dir += 360 / n; // завиваме наляво с външния ъгъл
  }
  return pts;
}

const SINGLE = [3, 4, 5, 6, 7, 8];
const MIXED: { name: string; ns: number[] }[] = [
  { name: '3 · 12 · 12', ns: [3, 12, 12] },
  { name: '4 · 8 · 8', ns: [4, 8, 8] },
  { name: '3 · 6 · 3 · 6', ns: [3, 6, 3, 6] },
  { name: '4 · 6 · 12', ns: [4, 6, 12] },
];

/** Кои правилни многоъгълници покриват равнината около една точка? */
export function TilingLab() {
  const [ns, setNs] = useState<number[]>([6, 6, 6]);
  const [label, setLabel] = useState('6');

  const chooseSingle = (n: number) => {
    const k = Math.floor(360 / interior(n) + 1e-9);
    setNs(Array(k).fill(n));
    setLabel(String(n));
  };

  // Страната се смалява за големите многоъгълници, за да се побират в чертежа
  const maxN = Math.max(...ns);
  const side = maxN >= 12 ? 40 : maxN >= 8 ? 52 : 70;
  let theta = 0;
  const polys = ns.map(n => {
    const pts = polygonAt(n, theta, side);
    theta += interior(n);
    return { n, pts };
  });
  const total = ns.reduce((s, n) => s + interior(n), 0);
  const gap = 360 - total;

  return (
    <Diagram
      grid={false}
      hint="Около всеки връх на паркета ъглите на многоъгълниците трябва да дават точно 360°. Сред правилните многоъгълници от един вид това става само с триъгълници, квадрати и шестоъгълници."
      readout={
        <>
          <Buttons>
            {SINGLE.map(n => (
              <DiagramButton key={n} active={label === String(n)} onClick={() => chooseSingle(n)}>
                {n}-ъгълници
              </DiagramButton>
            ))}
          </Buttons>
          <Buttons>
            {MIXED.map(m => (
              <DiagramButton
                key={m.name}
                active={label === m.name}
                onClick={() => {
                  setNs(m.ns);
                  setLabel(m.name);
                }}
              >
                {m.name}
              </DiagramButton>
            ))}
          </Buttons>
          <Formula>
            {ns.map(n => `${fmt(interior(n))}°`).join(' + ')} = {fmt(total)}°
          </Formula>
          {Math.abs(gap) < 1e-6 ? (
            <Note tone="emerald">Точно 360° – многоъгълниците обикалят точката без празнина и без застъпване.</Note>
          ) : (
            <Note tone="rose">
              Остава празнина от {fmt(gap)}° – следващият {ns[0]}-ъгълник (с ъгъл {fmt(interior(ns[0]))}°) не се побира.
            </Note>
          )}
        </>
      }
    >
      {polys.map(({ pts }, i) => (
        <polygon key={i} points={pts.map(p => `${p.x},${p.y}`).join(' ')} className={`${COLORS[i % COLORS.length]} stroke-gray-700 dark:stroke-gray-200`} strokeWidth="2" strokeLinejoin="round" />
      ))}
      <circle cx={C.x} cy={C.y} r={5} className="fill-gray-900 dark:fill-white" />
    </Diagram>
  );
}
