import { useState } from 'react';
import {
  AngleMark,
  Buttons,
  Diagram,
  DiagramButton,
  Dot,
  Formula,
  Handle,
  Label,
  Note,
  Readout,
  Segment,
  TickMark,
  VertexLabel,
} from './diagram';
import {
  arcPath as arcPathAt,
  dist,
  fmt,
  mid,
  norm360,
  Point,
  polar,
  polarAngle,
  toRad,
  tones,
  units,
  UNIT,
} from './diagramMath';

interface InteractiveCircleProps {
  type: 'basic' | 'chord' | 'arc' | 'sector' | 'area-circumference' | 'radian';
}

const O = { x: 240, y: 160 };
const MIN_R = 2 * UNIT;
const MAX_R = 7 * UNIT;

const rad = toRad;
const norm = norm360;
const at = (r: number, deg: number): Point => polar(O, r, deg);

/** Ъгълът на точка спрямо центъра, закръглен до цял градус. */
const angleOf = (p: Point) => Math.round(polarAngle(O, p)) % 360;

/** Радиус, закръглен до цяла единица от мрежата. */
const radiusOf = (p: Point) =>
  Math.min(MAX_R, Math.max(MIN_R, Math.round(dist(O, p) / UNIT) * UNIT));

const arcPath = (r: number, from: number, to: number, closed = false) =>
  arcPathAt(O, r, from, to, closed);

/** Окръжността с центъра O. Надписът „O“ се поставя срещу точката away, за да не застъпва линиите. */
function Circle({ r, away }: { r: number; away?: Point }) {
  let label = { x: O.x - 12, y: O.y + 14 };
  if (away && dist(O, away) > 1) {
    const k = 18 / dist(O, away);
    label = { x: O.x - (away.x - O.x) * k, y: O.y - (away.y - O.y) * k };
  }
  return (
    <>
      <circle cx={O.x} cy={O.y} r={r} className={`${tones.blue.soft} ${tones.blue.stroke}`} strokeWidth="2.5" />
      <Dot p={O} tone="gray" r={4} />
      <Label p={label} tone="ink" size={16} weight={700}>O</Label>
    </>
  );
}

/** Централният ъгъл от φ1 до φ2 – дъга около центъра и надпис. */
function CentralAngle({ from, to, r }: { from: number; to: number; r: number }) {
  const span = norm(to - from);
  const rr = Math.min(28, r * 0.35);
  const bis = from + span / 2;
  return (
    <>
      <path d={arcPath(rr, from, to, true)} className={`${tones.amber.soft} stroke-none`} />
      <path d={arcPath(rr, from, to)} className={`fill-none ${tones.amber.stroke}`} strokeWidth="2" />
      <Label p={at(rr + 18, bis)} tone="amber" size={14}>α</Label>
    </>
  );
}

function PointHandle({ r, deg, name, onMove }: { r: number; deg: number; name: string; onMove: (p: Point) => void }) {
  const p = at(r, deg);
  return (
    <>
      <VertexLabel p={p} center={O} name={name} />
      <Handle p={p} name={name} onMove={onMove} />
    </>
  );
}

// ---------- Център, радиус и диаметър ----------

function Basic() {
  const [r, setR] = useState(5 * UNIT);
  const [phi, setPhi] = useState(35);

  const A = at(r, phi);
  // Диаметърът е начертан в друга посока, за да не се застъпва с радиуса
  const M = at(r, phi + 130);
  const N = at(r, phi + 310);
  const ru = units(r);

  return (
    <Diagram
      hint="Влачи точката A, за да промениш радиуса. Всеки диаметър е два пъти по-дълъг от радиуса."
      readout={
        <>
          <Readout
            items={[
              { label: 'r =', value: fmt(ru), tone: 'rose' },
              { label: 'd =', value: fmt(2 * ru), tone: 'emerald' },
            ]}
          />
          <Formula>d = 2r = 2 · {fmt(ru)} = {fmt(2 * ru)}</Formula>
        </>
      }
    >
      <Circle r={r} away={A} />
      <Segment p={M} q={N} tone="emerald" width={3} />
      <Label p={at(r * 0.55, phi + 142)} tone="emerald" size={15}>d</Label>
      <Segment p={O} q={A} tone="rose" width={3} />
      <Label p={at(r / 2, phi + 14)} tone="rose" size={15}>r</Label>
      <PointHandle
        r={r}
        deg={phi}
        name="A"
        onMove={p => {
          setR(radiusOf(p));
          setPhi(angleOf(p));
        }}
      />
    </Diagram>
  );
}

// ---------- Хорда ----------

function Chord() {
  const r = 6 * UNIT;
  const [phiA, setPhiA] = useState(200);
  const [phiB, setPhiB] = useState(330);

  const A = at(r, phiA);
  const B = at(r, phiB);
  const M = mid(A, B);
  const ab = units(dist(A, B));
  const om = units(dist(O, M));
  const isDiameter = om < 0.05;

  return (
    <Diagram
      hint="Влачи краищата на хордата. Перпендикулярът от центъра винаги я разполовява."
      readout={
        <>
          <Readout
            items={[
              { label: 'r =', value: fmt(units(r)) },
              { label: 'AB =', value: fmt(ab, 2), tone: 'rose' },
              { label: 'OM =', value: fmt(om, 2), tone: 'emerald' },
              { label: 'AM = MB =', value: fmt(ab / 2, 2) },
            ]}
          />
          <Formula>
            AM² + OM² = r² → {fmt(ab / 2, 2)}² + {fmt(om, 2)}² = {fmt(units(r) ** 2, 1)}
          </Formula>
          {isDiameter && <Note>Хордата минава през центъра – това е диаметър, най-дългата хорда!</Note>}
        </>
      }
    >
      <Circle r={r} away={M} />
      <Segment p={O} q={A} tone="gray" dashed width={1.5} />
      <Segment p={O} q={B} tone="gray" dashed width={1.5} />
      <Segment p={A} q={B} tone="rose" width={3.5} />
      <TickMark p={A} q={M} />
      <TickMark p={M} q={B} />
      {!isDiameter && (
        <>
          <Segment p={O} q={M} tone="emerald" width={2.5} />
          <AngleMark v={M} p={O} q={B} tone="emerald" r={16} />
        </>
      )}
      <Dot p={M} tone="emerald" />
      <Label p={{ x: M.x + (M.x >= O.x ? 14 : -14), y: M.y + (M.y >= O.y ? 14 : -14) }} tone="emerald" size={15}>M</Label>
      <PointHandle r={r} deg={phiA} name="A" onMove={p => setPhiA(angleOf(p))} />
      <PointHandle r={r} deg={phiB} name="B" onMove={p => setPhiB(angleOf(p))} />
    </Diagram>
  );
}

// ---------- Дъга и сектор ----------

function ArcOrSector({ sector }: { sector: boolean }) {
  const r = 6 * UNIT;
  const [phiA, setPhiA] = useState(20);
  const [phiB, setPhiB] = useState(120);

  const alpha = norm(phiB - phiA);
  const ru = units(r);
  const length = (Math.PI * ru * alpha) / 180;
  const area = (Math.PI * ru * ru * alpha) / 360;

  return (
    <Diagram
      hint={`Влачи точките A и B. ${sector ? 'Секторът' : 'Дъгата'} е α/360° от ${sector ? 'целия кръг' : 'цялата окръжност'}.`}
      readout={
        <>
          <Readout
            items={[
              { label: 'r =', value: fmt(ru) },
              { label: 'α =', value: `${alpha}°`, tone: 'amber' },
              { label: 'α/360° ≈', value: fmt(alpha / 360, 3) },
            ]}
          />
          {sector ? (
            <Formula>
              S = πr² · α/360° = π · {fmt(ru)}² · {alpha}/360 ≈ {fmt(area, 2)}
            </Formula>
          ) : (
            <Formula>
              l = 2πr · α/360° = 2π · {fmt(ru)} · {alpha}/360 ≈ {fmt(length, 2)}
            </Formula>
          )}
        </>
      }
    >
      <Circle r={r} away={at(r, phiA + alpha / 2)} />
      {sector && <path d={arcPath(r, phiA, phiB, true)} className={`${tones.rose.soft} ${tones.rose.stroke}`} strokeWidth="2" />}
      <Segment p={O} q={at(r, phiA)} tone={sector ? 'rose' : 'gray'} width={sector ? 2.5 : 1.5} dashed={!sector} />
      <Segment p={O} q={at(r, phiB)} tone={sector ? 'rose' : 'gray'} width={sector ? 2.5 : 1.5} dashed={!sector} />
      {!sector && <path d={arcPath(r, phiA, phiB)} className={`fill-none ${tones.rose.stroke}`} strokeWidth="6" strokeLinecap="round" />}
      <CentralAngle from={phiA} to={phiB} r={r} />
      <Label p={at(r + 22, phiA + alpha / 2)} tone="rose" size={15}>{sector ? 'S' : 'l'}</Label>
      <PointHandle r={r} deg={phiA} name="A" onMove={p => setPhiA(angleOf(p))} />
      <PointHandle r={r} deg={phiB} name="B" onMove={p => setPhiB(angleOf(p))} />
    </Diagram>
  );
}

// ---------- Дължина и лице ----------

function AreaCircumference() {
  const [r, setR] = useState(4 * UNIT);
  const [phi, setPhi] = useState(30);
  const ru = units(r);
  const C = 2 * Math.PI * ru;
  const S = Math.PI * ru * ru;

  return (
    <Diagram
      hint="Влачи точката A. Дължината и лицето се менят, но отношението C : d винаги е π."
      readout={
        <>
          <Readout
            items={[
              { label: 'r =', value: fmt(ru), tone: 'rose' },
              { label: 'd =', value: fmt(2 * ru) },
              { label: 'C ≈', value: fmt(C, 2), tone: 'blue' },
              { label: 'S ≈', value: fmt(S, 2), tone: 'blue' },
            ]}
          />
          <Formula>C = 2πr = 2π · {fmt(ru)} ≈ {fmt(C, 2)}</Formula>
          <Formula>S = πr² = π · {fmt(ru)}² ≈ {fmt(S, 2)}</Formula>
          <Formula>C : d = {fmt(C, 2)} : {fmt(2 * ru)} = π ≈ 3,14159</Formula>
        </>
      }
    >
      <circle cx={O.x} cy={O.y} r={r} className={`${tones.blue.soft} ${tones.blue.stroke}`} strokeWidth="4" />
      <Dot p={O} tone="gray" r={4} />
      <Label p={{ x: O.x - 12, y: O.y + 14 }} tone="ink" size={16} weight={700}>O</Label>
      <Segment p={O} q={at(r, phi)} tone="rose" width={3} />
      <Label p={at(r / 2, phi + 16)} tone="rose" size={15}>r</Label>
      <PointHandle
        r={r}
        deg={phi}
        name="A"
        onMove={p => {
          setR(radiusOf(p));
          setPhi(angleOf(p));
        }}
      />
    </Diagram>
  );
}

// ---------- Радиан ----------

const ONE_RADIAN = 180 / Math.PI;

function Radian() {
  const r = 6 * UNIT;
  const [phiA, setPhiA] = useState(-20);
  const [alpha, setAlpha] = useState(80);
  const phiB = phiA + alpha;

  const ru = units(r);
  const radians = rad(alpha);
  const length = radians * ru;
  const isOne = Math.abs(alpha - ONE_RADIAN) < 0.6;

  return (
    <Diagram
      hint="Влачи точката B, докато дъгата стане равна на радиуса – или натисни бутон."
      readout={
        <>
          <Readout
            items={[
              { label: 'r =', value: fmt(ru), tone: 'violet' },
              { label: 'α =', value: `${fmt(alpha, 1)}°`, tone: 'amber' },
              { label: 'α =', value: `${fmt(radians, 3)} rad`, tone: 'amber' },
              { label: 'l =', value: fmt(length, 2), tone: 'rose' },
            ]}
          />
          <Formula>
            l = α · r = {fmt(radians, 3)} · {fmt(ru)} ≈ {fmt(length, 2)}
          </Formula>
          {isOne && <Note>Дъгата е равна на радиуса – това е точно 1 радиан ≈ 57,3°!</Note>}
          <Buttons>
            <DiagramButton onClick={() => setAlpha(ONE_RADIAN)} active={isOne}>1 rad</DiagramButton>
            <DiagramButton onClick={() => setAlpha(90)} active={alpha === 90}>π/2 rad = 90°</DiagramButton>
            <DiagramButton onClick={() => setAlpha(180)} active={alpha === 180}>π rad = 180°</DiagramButton>
          </Buttons>
        </>
      }
    >
      <Circle r={r} away={at(r, phiA + alpha / 2)} />
      <path d={arcPath(r, phiA, phiB)} className={`fill-none ${tones.rose.stroke}`} strokeWidth="6" strokeLinecap="round" />
      <Segment p={O} q={at(r, phiA)} tone="violet" width={3} />
      <Segment p={O} q={at(r, phiB)} tone="gray" width={2} />
      <Label p={at(r / 2, phiA - 12)} tone="violet" size={15}>r</Label>
      <Label p={at(r + 22, phiA + alpha / 2)} tone="rose" size={15}>l</Label>
      <CentralAngle from={phiA} to={phiB} r={r} />
      <PointHandle
        r={r}
        deg={phiA}
        name="A"
        onMove={p => setPhiA(angleOf(p))}
      />
      <PointHandle
        r={r}
        deg={phiB}
        name="B"
        onMove={p => {
          const a = norm(angleOf(p) - phiA);
          if (a > 0) setAlpha(a);
        }}
      />
    </Diagram>
  );
}

export function InteractiveCircle({ type }: InteractiveCircleProps) {
  switch (type) {
    case 'basic':
      return <Basic />;
    case 'chord':
      return <Chord />;
    case 'arc':
      return <ArcOrSector sector={false} />;
    case 'sector':
      return <ArcOrSector sector />;
    case 'area-circumference':
      return <AreaCircumference />;
    case 'radian':
      return <Radian />;
  }
}
