import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { freezingPoint, salinityFor, sigma } from './seawater';

// T–S диаграма: соленост по хоризонтала, температура по вертикала
const X0 = 52;
const X1 = 470;
const Y0 = 18;
const Y1 = 278;
const S_MAX = 42;
const T_MIN = -2;
const T_MAX = 30;
const xOf = (s: number) => X0 + (s / S_MAX) * (X1 - X0);
const yOf = (t: number) => Y1 - ((t - T_MIN) / (T_MAX - T_MIN)) * (Y1 - Y0);
const sOf = (x: number) => ((x - X0) / (X1 - X0)) * S_MAX;
const tOf = (y: number) => T_MIN + ((Y1 - y) / (Y1 - Y0)) * (T_MAX - T_MIN);

type Water = { name: string; T: number; S: number };
type Preset = { title: string; a: Water; b: Water };

const PRESETS: Preset[] = [
  {
    title: 'Гибралтар',
    a: { name: 'Средиземноморска', T: 13, S: 38.5 },
    b: { name: 'Атлантическа повърхностна', T: 15, S: 36.2 },
  },
  {
    title: 'Черно море',
    a: { name: 'Повърхностна (зимата)', T: 8, S: 18.2 },
    b: { name: 'Дълбока', T: 9, S: 22.3 },
  },
  {
    title: 'Дълбините',
    a: { name: 'Северноатлантическа дълбока', T: 3, S: 34.9 },
    b: { name: 'Антарктическа дънна', T: -0.5, S: 34.7 },
  },
  {
    title: 'Смесване',
    a: { name: 'Студена', T: 0, S: 34.6 },
    b: { name: 'Топла и солена', T: 10, S: 35.9 },
  },
  {
    title: 'Червено и Балтийско',
    a: { name: 'Червено море', T: 22, S: 40 },
    b: { name: 'Балтийско море', T: 10, S: 7 },
  },
];

const SIGMAS = [0, 5, 10, 15, 20, 25, 28, 30];

/** T–S диаграма: две водни маси, тяхната плътност и сместа им – коя потъва под коя. */
export default function TsLab() {
  const [preset, setPreset] = useState(0);
  const [a, setA] = useState<Water>(PRESETS[0].a);
  const [b, setB] = useState<Water>(PRESETS[0].b);
  const [drag, setDrag] = useState<'a' | 'b' | null>(null);

  const isopycnals = useMemo(
    () =>
      SIGMAS.map(sg => {
        const pts: string[] = [];
        for (let i = 0; i <= 64; i++) {
          const t = T_MIN + ((T_MAX - T_MIN) * i) / 64;
          const s = salinityFor(t, sg);
          if (s !== null && s <= S_MAX) pts.push(`${xOf(s).toFixed(1)} ${yOf(t).toFixed(1)}`);
        }
        return { sg, d: pts.length > 1 ? `M${pts.join('L')}` : '' };
      }),
    [],
  );
  const freeze = useMemo(
    () =>
      Array.from({ length: 43 }, (_, s) => `${s ? 'L' : 'M'}${xOf(s).toFixed(1)} ${yOf(Math.max(T_MIN, freezingPoint(s))).toFixed(1)}`).join('') +
      `L${X1} ${Y1}L${X0} ${Y1}Z`,
    [],
  );

  const choose = (i: number) => {
    setPreset(i);
    setA(PRESETS[i].a);
    setB(PRESETS[i].b);
  };

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag) return;
    const m = e.currentTarget.getScreenCTM();
    if (!m) return;
    const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const S = Math.round(Math.max(0, Math.min(S_MAX, sOf(q.x))) * 10) / 10;
    const T = Math.round(Math.max(freezingPoint(S), Math.min(T_MAX, tOf(q.y))) * 10) / 10;
    const set = drag === 'a' ? setA : setB;
    set(w => ({ ...w, T, S }));
    setPreset(-1);
  };
  const grab = (k: 'a' | 'b') => (e: React.PointerEvent) => {
    (e.currentTarget as SVGElement).ownerSVGElement?.setPointerCapture(e.pointerId);
    setDrag(k);
  };

  const sa = sigma(a.T, a.S);
  const sb = sigma(b.T, b.S);
  const mix = { T: (a.T + b.T) / 2, S: (a.S + b.S) / 2 };
  const sm = sigma(mix.T, mix.S);
  const cabbeling = sm > Math.max(sa, sb) + 0.005;
  const heavy = sa > sb ? 'A' : 'B';
  const diff = Math.abs(sa - sb);

  // Стълбът вдясно: водите, подредени по плътност – най-плътната е на дъното
  const layers = [
    { k: 'A', sg: sa, cls: 'fill-rose-200 dark:fill-rose-900/70' },
    { k: 'B', sg: sb, cls: 'fill-sky-200 dark:fill-sky-900/70' },
  ].sort((p, q) => p.sg - q.sg);

  const point = (w: Water, k: 'a' | 'b', cls: string) => (
    <g transform={`translate(${xOf(w.S)} ${yOf(w.T)})`} className="cursor-grab" style={{ touchAction: 'none' }} onPointerDown={grab(k)}>
      <circle r={16} fill="transparent" />
      <circle r={9} className={cls} strokeWidth="2" />
      <text y={4} fontSize="11" fontWeight="bold" textAnchor="middle" className="fill-white pointer-events-none select-none">
        {k.toUpperCase()}
      </text>
    </g>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg
        viewBox="0 0 640 312"
        className="w-full h-auto block select-none text-gray-800 dark:text-gray-100"
        onPointerMove={move}
        onPointerUp={() => setDrag(null)}
        onPointerLeave={() => setDrag(null)}
      >
        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} className="fill-sky-50 dark:fill-slate-900" />
        <path d={freeze} className="fill-cyan-100 dark:fill-cyan-950" />
        {[0, 10, 20, 30, 40].map(s => (
          <g key={s}>
            <line x1={xOf(s)} x2={xOf(s)} y1={Y0} y2={Y1} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={xOf(s)} y={Y1 + 14} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
              {s}
            </text>
          </g>
        ))}
        {[0, 10, 20, 30].map(t => (
          <g key={t}>
            <line x1={X0} x2={X1} y1={yOf(t)} y2={yOf(t)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={X0 - 6} y={yOf(t) + 3} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {t}
            </text>
          </g>
        ))}
        <text x={(X0 + X1) / 2} y={Y1 + 29} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          соленост, ‰
        </text>
        <text
          x={14}
          y={(Y0 + Y1) / 2}
          fontSize="11"
          textAnchor="middle"
          transform={`rotate(-90 14 ${(Y0 + Y1) / 2})`}
          className="fill-gray-600 dark:fill-gray-300"
        >
          температура, °C
        </text>
        {isopycnals.map(({ sg, d }) => {
          const s = salinityFor(T_MAX - 1.5, sg);
          return (
            <g key={sg}>
              <path d={d} fill="none" className="stroke-violet-400/70 dark:stroke-violet-400/60" strokeDasharray="4 3" />
              {s !== null && s < S_MAX - 1 && (
                <text x={xOf(s) + 3} y={yOf(T_MAX - 1.5)} fontSize="9" className="fill-violet-600 dark:fill-violet-300">
                  σ={sg}
                </text>
              )}
            </g>
          );
        })}
        <text x={X0 + 6} y={Y1 - 6} fontSize="9" className="fill-cyan-700 dark:fill-cyan-300">
          лед
        </text>
        <line x1={xOf(a.S)} y1={yOf(a.T)} x2={xOf(b.S)} y2={yOf(b.T)} className="stroke-gray-500 dark:stroke-gray-400" strokeDasharray="2 3" />
        <circle cx={xOf(mix.S)} cy={yOf(mix.T)} r={5} className={cabbeling ? 'fill-amber-500' : 'fill-gray-500 dark:fill-gray-400'} />
        <text x={xOf(mix.S) - 8} y={yOf(mix.T) - 8} fontSize="10" textAnchor="end" className="fill-gray-700 dark:fill-gray-200">
          смес
        </text>
        {point(a, 'a', 'fill-rose-600 stroke-white dark:stroke-slate-900')}
        {point(b, 'b', 'fill-sky-600 stroke-white dark:stroke-slate-900')}

        {/* Стълбът вода */}
        <text x={560} y={Y0 + 8} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          в морето
        </text>
        <rect x={515} y={Y0 + 18} width={90} height={Y1 - Y0 - 18} className="fill-none stroke-gray-400 dark:stroke-gray-500" />
        {layers.map((l, i) => {
          const h = (Y1 - Y0 - 18) / 2;
          const y = Y0 + 18 + i * h;
          return (
            <g key={l.k}>
              <rect x={516} y={y + 1} width={88} height={h - 2} className={l.cls} />
              <text x={560} y={y + h / 2 - 2} fontSize="15" fontWeight="bold" textAnchor="middle" className="fill-gray-800 dark:fill-gray-100">
                {l.k}
              </text>
              <text x={560} y={y + h / 2 + 14} fontSize="10" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
                σ = {fmt(l.sg, 2)}
              </text>
            </g>
          );
        })}
        <text x={560} y={Y1 + 14} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          дъно
        </text>
      </LabSvg>
      <Buttons>
        {PRESETS.map((p, i) => (
          <DiagramButton key={p.title} active={i === preset} onClick={() => choose(i)}>
            {p.title}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            {
              label: `A ${a.name}`,
              value: `${fmt(a.T, 1)} °C, ${fmt(a.S, 1)} ‰, σ ${fmt(sa, 2)}`,
              tone: 'rose',
            },
            {
              label: `B ${b.name}`,
              value: `${fmt(b.T, 1)} °C, ${fmt(b.S, 1)} ‰, σ ${fmt(sb, 2)}`,
              tone: 'blue',
            },
            { label: 'смес 1:1', value: `σ ${fmt(sm, 2)}`, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={cabbeling ? 'amber' : 'violet'}>
        {diff < 0.02
          ? 'Двете води са почти еднакво плътни – лесно се смесват.'
          : `${heavy} е по-плътна с ${fmt(diff, 2)} kg/m³ и потъва под ${heavy === 'A' ? 'B' : 'A'}.`}
        {cabbeling ? ' Сместа е по-плътна и от двете – смесени, водите потъват заедно!' : ''}
      </Note>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Влачи точките A и B. Пунктирите са линии на еднаква плътност σ = ρ − 1000 kg/m³ (по уравнението EOS-80 при повърхностно налягане); в синята ивица долу
        водата замръзва.
      </p>
    </div>
  );
}
