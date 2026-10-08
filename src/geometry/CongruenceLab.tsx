import { useState } from 'react';
import { AngleMark, Buttons, Diagram, DiagramButton, Note, Segment, SideLabel, VertexLabel } from './diagram';
import { fmt, Point, tones, UNIT } from './diagramMath';
import { Slider, Sliders } from '~/functions/plot';

type Mode = 'SSS' | 'SAS' | 'ASA' | 'SSA';
const MODES: { k: Mode; name: string; text: string }[] = [
  { k: 'SSS', name: 'ССС', text: 'три страни' },
  { k: 'SAS', name: 'СЪС', text: 'две страни и ъгълът между тях' },
  { k: 'ASA', name: 'ЪСЪ', text: 'страна и двата ъгъла до нея' },
  { k: 'SSA', name: 'ССЪ', text: 'две страни и ъгъл срещу едната' },
];

const O = { x: 70, y: 290 };
const toScreen = (p: Point): Point => ({ x: O.x + p.x * UNIT, y: O.y - p.y * UNIT });
const rad = (d: number) => (d * Math.PI) / 180;

/** Определя ли се триъгълникът еднозначно от дадените елементи? */
export function CongruenceLab() {
  const [mode, setMode] = useState<Mode>('SSA');
  const [a, setA] = useState(6);
  const [b, setB] = useState(7);
  const [c, setC] = useState(10);
  const [alpha, setAlpha] = useState(35);
  const [beta, setBeta] = useState(60);

  // Строим A = (0; 0), B = (c; 0); търсим C (едно или две решения)
  let Cs: Point[] = [];
  let problem = '';
  if (mode === 'SSS') {
    if (a + b > c && a + c > b && b + c > a) {
      const x = (b * b + c * c - a * a) / (2 * c);
      Cs = [{ x, y: Math.sqrt(Math.max(b * b - x * x, 0)) }];
    } else problem = 'Неравенството на триъгълника не е изпълнено – такъв триъгълник няма.';
  } else if (mode === 'SAS') {
    Cs = [{ x: b * Math.cos(rad(alpha)), y: b * Math.sin(rad(alpha)) }];
  } else if (mode === 'ASA') {
    const gamma = 180 - alpha - beta;
    if (gamma > 0) {
      const bb = (c * Math.sin(rad(beta))) / Math.sin(rad(gamma));
      Cs = [{ x: bb * Math.cos(rad(alpha)), y: bb * Math.sin(rad(alpha)) }];
    } else problem = 'α + β ≥ 180° – лъчите от A и B не се пресичат.';
  } else {
    // C е на лъча от A под ъгъл α, на разстояние a от B
    const disc = a * a - (c * Math.sin(rad(alpha))) ** 2;
    if (disc >= -1e-9) {
      const base = c * Math.cos(rad(alpha));
      const r = Math.sqrt(Math.max(disc, 0));
      Cs = [base + r, base - r].filter((t, i, arr) => t > 1e-6 && (i === 0 || Math.abs(t - arr[0]) > 1e-6)).map(t => ({ x: t * Math.cos(rad(alpha)), y: t * Math.sin(rad(alpha)) }));
    }
    if (!Cs.length) problem = 'Страната a е твърде къса – не достига до лъча. Няма такъв триъгълник.';
  }

  const A = toScreen({ x: 0, y: 0 });
  const B = toScreen({ x: c, y: 0 });
  const screenC = Cs.map(toScreen);
  const center = screenC[0] ? { x: (A.x + B.x + screenC[0].x) / 3, y: (A.y + B.y + screenC[0].y) / 3 } : { x: (A.x + B.x) / 2, y: A.y - 40 };
  const rayEnd = toScreen({ x: 16 * Math.cos(rad(alpha)), y: 16 * Math.sin(rad(alpha)) });

  const verdict = problem
    ? { tone: 'rose' as const, text: problem }
    : Cs.length === 2
      ? { tone: 'amber' as const, text: 'Два различни триъгълника отговарят на условието! ССЪ не е признак за еднаквост.' }
      : { tone: 'emerald' as const, text: `Триъгълникът е определен еднозначно${mode === 'SSA' ? ' (тук – защото a ≥ c или a = c · sin α)' : ` – ${MODES.find(m => m.k === mode)!.name} е признак за еднаквост`}.` };

  return (
    <Diagram
      grid
      hint="Избери кои елементи на триъгълника са дадени и ги променяй. Ако от тях може да се построи само един триъгълник, всички триъгълници с тези елементи са еднакви."
      readout={
        <>
          <Buttons>
            {MODES.map(m => (
              <DiagramButton key={m.k} active={m.k === mode} onClick={() => setMode(m.k)}>
                {m.name} – {m.text}
              </DiagramButton>
            ))}
          </Buttons>
          <Sliders>
            {mode !== 'SAS' && mode !== 'ASA' && <Slider label="a" value={a} onChange={setA} min={1} max={14} step={0.5} tone="rose" />}
            {(mode === 'SSS' || mode === 'SAS') && <Slider label="b" value={b} onChange={setB} min={1} max={14} step={0.5} tone="emerald" />}
            <Slider label="c" value={c} onChange={setC} min={2} max={16} step={0.5} tone="violet" />
            {mode !== 'SSS' && <Slider label="α" value={alpha} onChange={setAlpha} min={10} max={150} step={1} tone="amber" />}
            {mode === 'ASA' && <Slider label="β" value={beta} onChange={setBeta} min={10} max={150} step={1} tone="blue" />}
          </Sliders>
          <Note tone={verdict.tone}>{verdict.text}</Note>
        </>
      }
    >
      {mode === 'SSA' && (
        <>
          <Segment p={A} q={rayEnd} tone="gray" width={1.5} dashed />
          <circle cx={B.x} cy={B.y} r={a * UNIT} className={`fill-none ${tones.rose.stroke}`} strokeWidth="1.2" strokeDasharray="4 4" strokeOpacity="0.6" />
        </>
      )}
      {screenC.map((C, i) => (
        <polygon
          key={i}
          points={[A, B, C].map(v => `${v.x},${v.y}`).join(' ')}
          className={`${i === 0 ? tones.blue.soft : 'fill-amber-500/10'} ${i === 0 ? tones.blue.stroke : tones.amber.stroke}`}
          strokeWidth="2.5"
          strokeDasharray={i === 1 ? '6 4' : undefined}
        />
      ))}
      <Segment p={A} q={B} tone="violet" width={3} />
      <SideLabel p={A} q={B} center={center} tone="violet">
        c = {fmt(c)}
      </SideLabel>
      {screenC[0] && mode !== 'SAS' && mode !== 'ASA' && (
        <SideLabel p={B} q={screenC[0]} center={center} tone="rose">
          a = {fmt(a)}
        </SideLabel>
      )}
      {screenC[0] && (mode === 'SSS' || mode === 'SAS') && (
        <SideLabel p={A} q={screenC[0]} center={center} tone="emerald">
          b = {fmt(b)}
        </SideLabel>
      )}
      {mode !== 'SSS' && <AngleMark v={A} p={B} q={screenC[0] ?? rayEnd} tone="amber" label={`${alpha}°`} labelDistance={44} />}
      {mode === 'ASA' && screenC[0] && <AngleMark v={B} p={screenC[0]} q={A} tone="blue" label={`${beta}°`} labelDistance={44} />}
      <VertexLabel p={A} center={center} name="A" />
      <VertexLabel p={B} center={center} name="B" />
      {screenC.map((C, i) => (
        <VertexLabel key={i} p={C} center={center} name={i === 0 ? 'C' : 'C′'} />
      ))}
    </Diagram>
  );
}
