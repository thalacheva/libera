import { useEffect, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

const MAX_CYCLES = 35;
/** Колко копия „побират“ праймерите и нуклеотидите в епруветката – оттам идва платото. */
const N_MAX = 1e12;
/** Прагът, при който флуоресценцията се забелязва (qPCR). */
const THRESHOLD = 1e10;

const STEPS = [
  { name: 'денатурация', temp: 95, dur: 30, color: '#e11d48' },
  { name: 'праймери', temp: 55, dur: 30, color: '#2563eb' },
  { name: 'удължаване', temp: 72, dur: 60, color: '#059669' },
];
const CYCLE_S = STEPS.reduce((s, x) => s + x.dur, 0);

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (k: number) => String(k).split('').map(c => SUP[Number(c)]).join('');
/** Голямо число: 12 345 или 1,23·10¹⁰. */
function big(v: number) {
  if (v < 1e5) return Math.round(v).toLocaleString('bg-BG').replace(/\s/g, ' ');
  const k = Math.floor(Math.log10(v));
  return `${(v / 10 ** k).toFixed(2).replace('.', ',')}·10${sup(k)}`;
}
const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

/** Броят копия след всеки цикъл: N₍ₖ₊₁₎ = Nₖ·(1 + E·(1 − Nₖ/Nmax)). */
function series(n0: number, eff: number) {
  const out = [n0];
  for (let k = 0; k < MAX_CYCLES; k++) {
    const n = out[k];
    out.push(n * (1 + eff * (1 - n / N_MAX)));
  }
  return out;
}

/** Прагов цикъл Ct – първото (дробно) място, където кривата стига прага (в логаритмичен мащаб). */
function ct(ns: number[]) {
  for (let k = 0; k + 1 < ns.length; k++) {
    if (ns[k] < THRESHOLD && ns[k + 1] >= THRESHOLD) {
      const a = Math.log10(ns[k]);
      const b = Math.log10(ns[k + 1]);
      return k + (Math.log10(THRESHOLD) - a) / (b - a);
    }
  }
  return null;
}

// Графиката на копията
const PX = 70;
const PW = 530;
const PY = 150;
const PH = 150;
const px = (c: number) => PX + (c / MAX_CYCLES) * PW;
const py = (n: number) => PY + PH - (Math.log10(Math.max(1, n)) / 12) * PH;

// Температурният профил на един цикъл
const TX = 70;
const TW = 530;
const tx = (s: number) => TX + (s / CYCLE_S) * TW;
const ty = (temp: number) => 112 - ((temp - 40) / 60) * 80;

/** PCR: температурният цикъл и броят копия – експоненциален растеж, плато и прагов цикъл. */
export default function PcrLab() {
  const [n0, setN0] = useState(1);
  const [eff, setEff] = useState(1);
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState(0); // 0..1 в текущия цикъл
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setPhase(p => {
        const next = p + 0.05;
        if (next >= 1) {
          setCycle(c => {
            if (c + 1 >= MAX_CYCLES) setRunning(false);
            return Math.min(MAX_CYCLES, c + 1);
          });
          return 0;
        }
        return next;
      });
    }, 40);
    return () => clearInterval(id);
  }, [running]);

  const ns = series(n0, eff);
  const n = ns[cycle];
  const ctValue = ct(ns);
  const path = ns.map((v, k) => `${k === 0 ? 'M' : 'L'}${px(k).toFixed(1)},${py(v).toFixed(1)}`).join(' ');

  // Профилът: рампи по 6 s между стъпките
  const prof: [number, number][] = [];
  let s0 = 0;
  STEPS.forEach(st => {
    prof.push([s0 + 6, st.temp], [s0 + st.dur, st.temp]);
    s0 += st.dur;
  });
  prof.unshift([0, STEPS[STEPS.length - 1].temp]);
  const profPath = prof.map(([s, temp], i) => `${i === 0 ? 'M' : 'L'}${tx(s).toFixed(1)},${ty(temp).toFixed(1)}`).join(' ');
  const nowS = phase * CYCLE_S;
  let acc = 0;
  let stepIdx = 0;
  for (let i = 0; i < STEPS.length; i++) {
    if (nowS >= acc) stepIdx = i;
    acc += STEPS[i].dur;
  }
  const nowTemp = (() => {
    for (let i = 1; i < prof.length; i++) {
      const [sa, ta] = prof[i - 1];
      const [sb, tb] = prof[i];
      if (nowS <= sb) return sb === sa ? tb : ta + ((nowS - sa) / (sb - sa)) * (tb - ta);
    }
    return prof[prof.length - 1][1];
  })();

  const reset = () => {
    setRunning(false);
    setCycle(0);
    setPhase(0);
  };
  const ideal = eff === 1 && cycle <= 20;
  const pow = 2 ** cycle;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 330" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Профилът на един цикъл */}
        <text x={20} y={18} fontSize="12" fontWeight="700" fill="currentColor">
          Цикъл {Math.min(cycle + 1, MAX_CYCLES)}: {STEPS[stepIdx].name}, {Math.round(nowTemp)} °C
        </text>
        {[55, 72, 95].map(temp => (
          <g key={temp}>
            <line x1={TX} x2={TX + TW} y1={ty(temp)} y2={ty(temp)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={TX - 6} y={ty(temp) + 3.5} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {temp} °C
            </text>
          </g>
        ))}
        <path d={profPath} fill="none" className="stroke-gray-400" strokeWidth={2.5} />
        {STEPS.map((st, i) => {
          const a = STEPS.slice(0, i).reduce((s, x) => s + x.dur, 0);
          return (
            <text key={st.name} x={tx(a + st.dur / 2)} y={ty(st.temp) - 7} fontSize="10.5" textAnchor="middle" fill={st.color} fontWeight={i === stepIdx ? 700 : 400}>
              {st.name}
            </text>
          );
        })}
        <circle cx={tx(nowS)} cy={ty(nowTemp)} r={6} fill={STEPS[stepIdx].color} className="stroke-white dark:stroke-gray-800" strokeWidth={2} />

        {/* Броят копия */}
        <text x={20} y={PY - 14} fontSize="12" fontWeight="700" fill="currentColor">
          Брой копия (логаритмичен мащаб)
        </text>
        {[0, 3, 6, 9, 12].map(k => (
          <g key={k}>
            <line x1={PX} x2={PX + PW} y1={py(10 ** k)} y2={py(10 ** k)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={PX - 6} y={py(10 ** k) + 3.5} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {k === 0 ? '1' : `10${sup(k)}`}
            </text>
          </g>
        ))}
        {[0, 5, 10, 15, 20, 25, 30, 35].map(c => (
          <text key={c} x={px(c)} y={PY + PH + 14} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {c}
          </text>
        ))}
        <text x={PX + PW} y={PY + PH + 27} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          цикъл
        </text>
        <line x1={PX} x2={PX + PW} y1={py(THRESHOLD)} y2={py(THRESHOLD)} stroke="#f59e0b" strokeDasharray="5 4" />
        <text x={PX + 4} y={py(THRESHOLD) - 4} fontSize="10" fill="#d97706">
          праг
        </text>
        <path d={path} fill="none" className="stroke-violet-300 dark:stroke-violet-800" strokeWidth={2} />
        <path
          d={ns.slice(0, cycle + 1).map((v, k) => `${k === 0 ? 'M' : 'L'}${px(k).toFixed(1)},${py(v).toFixed(1)}`).join(' ')}
          fill="none"
          className="stroke-violet-600 dark:stroke-violet-400"
          strokeWidth={3}
        />
        {ctValue !== null && (
          <g>
            <line x1={px(ctValue)} x2={px(ctValue)} y1={py(THRESHOLD)} y2={PY + PH} stroke="#d97706" strokeDasharray="2 3" />
            <text x={px(ctValue) + 4} y={PY + PH - 6} fontSize="10" fill="#d97706">
              Ct
            </text>
          </g>
        )}
        <circle cx={px(cycle)} cy={py(n)} r={5} className="fill-violet-600 dark:fill-violet-400" />
      </LabSvg>

      <Buttons>
        {[1, 100, 10000].map(v => (
          <DiagramButton key={v} active={n0 === v} onClick={() => { setN0(v); reset(); }}>
            в началото: {big(v)} {v === 1 ? 'молекула' : 'молекули'}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="E" value={eff} onChange={v => { setEff(v); }} min={0.6} max={1} step={0.05} tone="violet" />
        <Slider label="цикъл" value={cycle} onChange={v => { setRunning(false); setPhase(0); setCycle(v); }} min={0} max={MAX_CYCLES} step={1} tone="blue" />
      </Sliders>
      <Buttons>
        <DiagramButton active={running} onClick={() => setRunning(r => !r && cycle < MAX_CYCLES)}>
          {running ? '⏸ Пауза' : '▶ Пусни машината'}
        </DiagramButton>
        <DiagramButton onClick={reset}>Отначало</DiagramButton>
      </Buttons>

      <Readout
        items={[
          { label: 'цикли', value: cycle, tone: 'blue' },
          { label: 'копия', value: big(n), tone: 'violet' },
          { label: 'Ct', value: ctValue === null ? '–' : fmt(ctValue), tone: 'amber' },
          { label: 'време', value: `${Math.round((cycle * CYCLE_S) / 60)} min` },
        ]}
      />
      {ideal ? (
        <Formula>
          На всяка начална молекула: 2{sup(cycle)} = {big(pow)} двойни вериги; с точната дължина (от праймер до праймер): 2{sup(cycle)} − 2·{cycle} ={' '}
          {big(Math.max(0, pow - 2 * cycle))}
        </Formula>
      ) : (
        <Formula>
          {eff < 1 ? `При ефективност E всеки цикъл умножава по (1 + E) = ${fmt(1 + eff, 2)}, а не по 2.` : 'След около 25 цикъла праймерите и нуклеотидите намаляват и кривата излиза на плато.'}
        </Formula>
      )}
      <Note tone="violet">
        {ctValue === null
          ? 'Кривата още не е стигнала прага.'
          : `Кривата пресича прага при цикъл ${fmt(ctValue)}. Повече ДНК в началото → по-ранен Ct: 100 пъти повече молекули дават Ct с около 6,6 цикъла по-малко (2 на степен 6,6 ≈ 100).`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Един цикъл: 30 s при 95 °C (веригите се разделят), 30 s при 55 °C (праймерите се свързват), 60 s при 72 °C (Taq полимеразата
        удължава). Моделът е опростен: всеки цикъл добавя E·N·(1 − N/Nmax) копия. При qPCR апаратът мери флуоресценцията след всеки цикъл и
        отчита Ct – колкото по-рано, толкова повече ДНК е имало в пробата.
      </p>
    </div>
  );
}
