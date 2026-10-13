import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { Arrow, SimControls } from '../SimControls';
import { fmtNum, useSimulation } from '../sim';

const TRACK = 10; // дължина на релсата, m
const CART = 0.8; // дължина на количката, m
const X1 = 2;
const X2 = 6.5;

type Carts = { x1: number; v1: number; x2: number; v2: number; hit: boolean };

/** Скорости след удар с коефициент на възстановяване e (0 – нееластичен, 1 – еластичен). */
function after(m1: number, m2: number, u1: number, u2: number, e: number) {
  const p = m1 * u1 + m2 * u2;
  return [(p - m2 * e * (u1 - u2)) / (m1 + m2), (p + m1 * e * (u1 - u2)) / (m1 + m2)];
}

const px = (x: number) => 20 + (x / TRACK) * 440;

/** Две колички на релса: импулсът се запазва при всеки удар, а кинетичната енергия – само при еластичния. */
export default function CollisionLab() {
  const [m1, setM1] = useState(2);
  const [m2, setM2] = useState(1);
  const [u1, setU1] = useState(2);
  const [u2, setU2] = useState(-1);
  const [e, setE] = useState(1);

  const [w1, w2] = after(m1, m2, u1, u2, e);
  const meet = u1 > u2;

  const step = (s: Carts, dt: number): Carts => {
    // Количка, стигнала края на релсата, спира симулацията
    if (s.x1 < 0 || s.x2 + CART > TRACK) return s;
    let { v1, v2, hit } = s;
    if (!hit && s.x2 - s.x1 <= CART && v1 > v2) {
      [v1, v2] = [w1, w2];
      hit = true;
    }
    return { x1: s.x1 + v1 * dt, v1, x2: s.x2 + v2 * dt, v2, hit };
  };
  const init = (): Carts => ({ x1: X1, v1: u1, x2: X2, v2: u2, hit: false });
  const sim = useSimulation<Carts>(init, step, { dt: 1 / 500 });
  const restart = () => sim.reset();
  // Масите и e влияят само на удара; началните скорости – и на началното състояние
  const set = (f: (n: number) => void, start?: 'v1' | 'v2') => (n: number) => {
    f(n);
    sim.reset(start ? { ...init(), [start]: n } : init());
  };

  const { x1, v1, x2, v2 } = sim.state;
  // Центърът на масата се движи с постоянна скорост – и преди, и след удара
  const xc = (m1 * (x1 + CART / 2) + m2 * (x2 + CART / 2)) / (m1 + m2);
  const p = m1 * u1 + m2 * u2;
  const K0 = (m1 * u1 * u1 + m2 * u2 * u2) / 2;
  const K1 = meet ? (m1 * w1 * w1 + m2 * w2 * w2) / 2 : K0;
  const bar = (K: number) => (K0 > 0 ? (K / Math.max(K0, 0.01)) * 300 : 0);
  const cartW = (CART / TRACK) * 440;
  const h = (m: number) => 18 + m * 6;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 220">
        <line x1={px(0)} y1={100} x2={px(TRACK)} y2={100} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="3" />
        {[0, 2, 4, 6, 8, 10].map(m => (
          <Label key={m} p={{ x: px(m), y: 114 }} size={10} weight={500}>
            {String(m)}
          </Label>
        ))}
        {[
          { x: x1, v: v1, m: m1, cls: 'fill-blue-500', tone: 'blue' as const, name: 'm₁' },
          { x: x2, v: v2, m: m2, cls: 'fill-rose-500', tone: 'rose' as const, name: 'm₂' },
        ].map(c => (
          <g key={c.name}>
            <rect x={px(c.x)} y={100 - h(c.m) - 4} width={cartW} height={h(c.m)} rx={4} className={c.cls} />
            <circle cx={px(c.x) + 8} cy={100} r={4} className="fill-gray-600 dark:fill-gray-300" />
            <circle cx={px(c.x) + cartW - 8} cy={100} r={4} className="fill-gray-600 dark:fill-gray-300" />
            <text x={px(c.x) + cartW / 2} y={100 - h(c.m) / 2 - 4} fontSize={12} fontWeight={700} textAnchor="middle" dominantBaseline="central" className="fill-white">
              {c.name}
            </text>
            <Arrow from={{ x: px(c.x) + cartW / 2, y: 30 }} to={{ x: px(c.x) + cartW / 2 + c.v * 14, y: 30 }} tone={c.tone} />
          </g>
        ))}
        {/* Център на масата */}
        <polygon points={`${px(xc)},120 ${px(xc) - 6},130 ${px(xc) + 6},130`} className="fill-amber-500" />
        <Label p={{ x: px(xc), y: 140 }} size={10} tone="amber">
          ЦМ
        </Label>

        {/* Кинетична енергия преди и след */}
        <Label p={{ x: 20, y: 168 }} size={11} anchor="start">
          Eₖ преди
        </Label>
        <rect x={92} y={161} width={bar(K0)} height={14} className="fill-violet-500/70" />
        <Label p={{ x: 20, y: 196 }} size={11} anchor="start">
          Eₖ след
        </Label>
        <rect x={92} y={189} width={bar(K1)} height={14} className="fill-violet-500/70" />
        <rect x={92 + bar(K1)} y={189} width={bar(K0) - bar(K1)} height={14} className="fill-gray-300 dark:fill-gray-600" />
        {K0 - K1 > 0.01 && (
          <Label p={{ x: 92 + bar(K1) + (bar(K0) - bar(K1)) / 2, y: 196 }} size={10}>
            топлина
          </Label>
        )}
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={restart} />
      <Sliders>
        <Slider label="m₁, kg" value={m1} onChange={set(setM1)} min={0.5} max={4} step={0.5} tone="blue" />
        <Slider label="v₁, m/s" value={u1} onChange={set(setU1, 'v1')} min={-3} max={3} step={0.5} tone="blue" />
        <Slider label="m₂, kg" value={m2} onChange={set(setM2)} min={0.5} max={4} step={0.5} tone="rose" />
        <Slider label="v₂, m/s" value={u2} onChange={set(setU2, 'v2')} min={-3} max={3} step={0.5} tone="rose" />
        <Slider label="e" value={e} onChange={set(setE)} min={0} max={1} step={0.1} tone="violet" />
      </Sliders>
      <div className="mt-3 space-y-2">
        <Readout
          items={[
            { label: 'след: v₁′ =', value: meet ? `${fmtNum(w1, 2)} m/s` : '—', tone: 'blue' },
            { label: 'v₂′ =', value: meet ? `${fmtNum(w2, 2)} m/s` : '—', tone: 'rose' },
          ]}
        />
        <Readout
          items={[
            { label: 'p =', value: `${fmtNum(p, 2)} kg·m/s (преди и след)`, tone: 'amber' },
            { label: 'Eₖ:', value: `${fmtNum(K0, 2)} → ${fmtNum(K1, 2)} J`, tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={meet ? (e === 1 ? 'emerald' : 'amber') : 'gray'}>
        {!meet
          ? 'Количките не се приближават една към друга – удар няма да има.'
          : e === 1
            ? 'Еластичен удар: запазват се и импулсът, и кинетичната енергия.'
            : e === 0
              ? `Напълно нееластичен удар: количките продължават заедно, губят се ${fmtNum(((K0 - K1) / K0) * 100, 0)}% от кинетичната енергия.`
              : `Частично еластичен удар: импулсът се запазва, а ${fmtNum(((K0 - K1) / K0) * 100, 0)}% от кинетичната енергия става топлина и деформация.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Положителната скорост е надясно. Коефициентът на възстановяване e показва каква част от скоростта на приближаване става скорост на
        раздалечаване. Жълтото триъгълниче е центърът на масата: ударът изобщо не променя движението му. Пробвай равни маси, e = 1 и спряла
        втора количка.
      </p>
    </div>
  );
}
