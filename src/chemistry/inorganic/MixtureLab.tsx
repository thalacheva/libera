import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type M = { s: string; M: number; /** молове H₂ на мол метал с HCl */ k: number; fill: string };
const METAL: Record<string, M> = {
  Zn: { s: 'Zn', M: 65, k: 1, fill: 'fill-slate-400' },
  Cu: { s: 'Cu', M: 63.5, k: 0, fill: 'fill-orange-400' },
  Mg: { s: 'Mg', M: 24, k: 1, fill: 'fill-gray-300' },
  Al: { s: 'Al', M: 27, k: 1.5, fill: 'fill-sky-300' },
  Fe: { s: 'Fe', M: 56, k: 1, fill: 'fill-stone-400' },
};
const PAIRS: { a: string; b: string; name: string }[] = [
  { a: 'Zn', b: 'Cu', name: 'месинг (Zn + Cu)' },
  { a: 'Fe', b: 'Cu', name: 'Fe + Cu' },
  { a: 'Mg', b: 'Al', name: 'Mg + Al' },
  { a: 'Al', b: 'Cu', name: 'Al + Cu' },
];

const VMAX = 25;
const CY0 = 190; // дъно на газовата бюрета
const CY1 = 30; // 25 L
const cy = (V: number) => CY0 - (V / VMAX) * (CY0 - CY1);
const fmt = (v: number, d = 2) => (Math.round(v * 10 ** d) / 10 ** d).toString().replace('.', ',');

/** Смес от два метала и излишък солна киселина: обемът на водорода издава състава. */
export default function MixtureLab() {
  const [pi, setPi] = useState(0);
  const [inverse, setInverse] = useState(false);
  const [m, setM] = useState(10);
  const [wa, setWa] = useState(40);
  const [Vgiven, setVgiven] = useState(1.12);
  const { a: as, b: bs } = PAIRS[pi];
  const A = METAL[as];
  const B = METAL[bs];

  // Права задача: състав → обем. Обратна: обем → състав (линейна система с две неизвестни).
  let ma = (m * wa) / 100;
  let ok = true;
  if (inverse) {
    const nH2 = Vgiven / 22.4;
    const x = (nH2 - (m * B.k) / B.M) / (A.k / A.M - B.k / B.M);
    ok = x >= -1e-9 && x <= m + 1e-9;
    ma = Math.min(m, Math.max(0, x));
  }
  const mb = m - ma;
  const Va = (ma / A.M) * A.k * 22.4;
  const Vb = (mb / B.M) * B.k * 22.4;
  const V = Va + Vb;
  // Обемът, ако цялата смес е само от единия или само от другия метал
  const allA = (m / A.M) * A.k * 22.4;
  const allB = (m / B.M) * B.k * 22.4;
  const range = [Math.min(allA, allB), Math.max(allA, allB)];
  const barW = 180;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {PAIRS.map((p, i) => (
          <DiagramButton
            key={p.name}
            active={i === pi}
            onClick={() => {
              setPi(i);
              // В обратната задача започваме от сместа 50 : 50 – обемът винаги е възможен
              const [x, y] = [METAL[p.a], METAL[p.b]];
              setVgiven(Math.round(((m / 2 / x.M) * x.k + (m / 2 / y.M) * y.k) * 22.4 * 10) / 10);
            }}
          >
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={!inverse} onClick={() => setInverse(false)}>
          състав → обем на H₂
        </DiagramButton>
        <DiagramButton
          active={inverse}
          onClick={() => {
            setInverse(true);
            setVgiven(Math.round(V * 10) / 10);
          }}
        >
          обем на H₂ → състав
        </DiagramButton>
      </Buttons>

      <LabSvg viewBox="0 0 480 210" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {/* сместа */}
        <text x={30} y={52} fontSize="12" fontWeight="600" fill="currentColor">
          смес: {fmt(m, 1)} g
        </text>
        <rect x={30} y={62} width={(barW * ma) / m} height={40} className={A.fill} />
        <rect x={30 + (barW * ma) / m} y={62} width={(barW * mb) / m} height={40} className={B.fill} />
        <rect x={30} y={62} width={barW} height={40} fill="none" className="stroke-gray-600 dark:stroke-gray-300" strokeWidth="1.5" />
        {ma / m > 0.18 && (
          <text x={30 + (barW * ma) / m / 2} y={87} fontSize="13" fontWeight="700" textAnchor="middle" className="fill-gray-900">
            {A.s}
          </text>
        )}
        {mb / m > 0.18 && (
          <text x={30 + (barW * ma) / m + (barW * mb) / m / 2} y={87} fontSize="13" fontWeight="700" textAnchor="middle" className="fill-gray-900">
            {B.s}
          </text>
        )}
        <text x={30} y={124} fontSize="12" fill="currentColor">
          {A.s}: {fmt(ma)} g → {fmt(Va)} L H₂
        </text>
        <text x={30} y={142} fontSize="12" fill="currentColor">
          {B.s}: {fmt(mb)} g → {B.k ? `${fmt(Vb)} L H₂` : 'не реагира'}
        </text>
        <text x={30} y={172} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          + излишък солна киселина
        </text>
        <text x={240} y={95} fontSize="22" textAnchor="middle" className="fill-gray-400">
          →
        </text>

        {/* газовата бюрета */}
        <text x={330} y={20} fontSize="12" fontWeight="600" textAnchor="middle" fill="currentColor">
          H₂ (н.у.)
        </text>
        {Va > 0 && <rect x={300} y={cy(Math.min(Va, VMAX))} width={60} height={CY0 - cy(Math.min(Va, VMAX))} className={A.fill} opacity={0.8} />}
        {Vb > 0 && <rect x={300} y={cy(Math.min(V, VMAX))} width={60} height={cy(Math.min(Va, VMAX)) - cy(Math.min(V, VMAX))} className={B.fill} opacity={0.8} />}
        <rect x={300} y={CY1} width={60} height={CY0 - CY1} fill="none" className="stroke-gray-600 dark:stroke-gray-300" strokeWidth="1.5" />
        {[0, 5, 10, 15, 20, 25].map(v => (
          <g key={v}>
            <line x1={360} x2={368} y1={cy(v)} y2={cy(v)} className="stroke-gray-500" />
            <text x={372} y={cy(v) + 4} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
              {v} L
            </text>
          </g>
        ))}
        {inverse && <line x1={292} x2={368} y1={cy(Math.min(Vgiven, VMAX))} y2={cy(Math.min(Vgiven, VMAX))} className="stroke-rose-500" strokeWidth="2" strokeDasharray="5 3" />}
      </LabSvg>

      <Sliders>
        <Slider label="маса на сместа, g" value={m} onChange={setM} min={1} max={20} step={0.5} tone="gray" />
        {inverse ? (
          <Slider label="измерен обем H₂, L" value={Vgiven} onChange={setVgiven} min={0} max={VMAX} step={0.02} tone="rose" />
        ) : (
          <Slider label={`${A.s} в сместа, %`} value={wa} onChange={setWa} min={0} max={100} step={5} tone="amber" />
        )}
      </Sliders>

      <div className="mt-3">
        <Readout
          items={
            inverse
              ? [
                  { label: `m(${A.s}) =`, value: `${fmt(ma)} g`, tone: 'amber' },
                  { label: `w(${A.s}) =`, value: `${fmt((ma / m) * 100, 1)}%`, tone: 'amber' },
                  { label: `w(${B.s}) =`, value: `${fmt((mb / m) * 100, 1)}%` },
                ]
              : [
                  { label: 'V(H₂) =', value: `${fmt(V)} L`, tone: 'blue' },
                  { label: 'n(H₂) =', value: `${fmt(V / 22.4, 3)} mol` },
                ]
          }
        />
      </div>
      <Note tone={ok ? 'emerald' : 'rose'}>
        {!ok
          ? `Такъв обем е невъзможен: ${fmt(m, 1)} g от тази смес дават между ${fmt(range[0])} и ${fmt(range[1])} L водород.`
          : B.k === 0
            ? `${B.s} не реагира със солна киселина, затова целият водород идва от ${A.s}: n(${A.s}) = ${A.k === 1 ? 'n(H₂)' : `n(H₂) / ${fmt(A.k, 1)}`}.`
            : `И двата метала реагират. Ако m(${A.s}) = x, системата е x + y = m и ${A.k === 1 ? '' : fmt(A.k, 1) + '·'}x/${A.M} + ${B.k === 1 ? '' : fmt(B.k, 1) + '·'}y/${B.M} = n(H₂).`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Така се проверява съставът на сплави и смеси: проба се разтваря в киселина и се мери отделеният водород. Ако единият метал не
        реагира (като медта), задачата е с едно неизвестно; ако реагират и двата – трябва система от две уравнения: за масата и за
        водорода.
      </p>
    </div>
  );
}
