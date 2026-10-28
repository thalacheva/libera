import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { Slider, Sliders } from '~/functions/plot';
import { fmt } from '../geo';

// Моделът на Лоренц (1963): σ = 10, ρ = 28, β = 8/3
type V3 = [number, number, number];
const deriv = ([x, y, z]: V3): V3 => [10 * (y - x), x * (28 - z) - y, x * y - (8 / 3) * z];
const rk4 = (s: V3, h: number): V3 => {
  const add = (a: V3, b: V3, k: number): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
  const k1 = deriv(s);
  const k2 = deriv(add(s, k1, h / 2));
  const k3 = deriv(add(s, k2, h / 2));
  const k4 = deriv(add(s, k3, h));
  return [0, 1, 2].map(i => s[i] + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])) as V3;
};

const DT = 0.01;
const T_MAX = 16;
const STEPS = T_MAX / DT;
const SAVE = 4; // запазваме всяка 4-та стъпка
const MEMBERS = 20;
const SPREAD_LIMIT = 4;

/** Псевдослучайни числа с начално число – еднакви при всяко зареждане. */
const mulberry = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Три начални „ситуации“ – точки от атрактора
const SITUATIONS: V3[] = (() => {
  let s: V3 = [1, 1, 1];
  for (let i = 0; i < 2000; i++) s = rk4(s, DT);
  const out: V3[] = [];
  for (let k = 0; k < 3; k++) {
    out.push(s);
    for (let i = 0; i < 137; i++) s = rk4(s, DT);
  }
  return out;
})();

const ERRORS = [0.1, 0.01, 0.001, 0.0001, 0.00001];

const PX = 50;
const PW = 560;
const PY = 16;
const PH = 240;
const tx = (t: number) => PX + (t / T_MAX) * PW;
const yx = (x: number) => PY + PH / 2 - (x / 22) * (PH / 2);

/** Ансамблова прогноза с модела на Лоренц: малки разлики в началното състояние растат, докато прогнозата стане безполезна. */
export default function EnsembleLab() {
  const [sit, setSit] = useState(0);
  const [errIdx, setErrIdx] = useState(2);
  const [lead, setLead] = useState(4);
  const eps = ERRORS[errIdx];

  const { truth, members, horizon } = useMemo(() => {
    const rnd = mulberry(1234 + sit * 17);
    const gauss = () => Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());
    const start = SITUATIONS[sit];
    let tr: V3 = [start[0] + eps * gauss(), start[1] + eps * gauss(), start[2]];
    let ens: V3[] = Array.from({ length: MEMBERS }, () => [start[0] + eps * gauss(), start[1] + eps * gauss(), start[2]] as V3);
    const truthX = [tr[0]];
    const memX = ens.map(e => [e[0]]);
    let hz: number | null = null;
    for (let i = 1; i <= STEPS; i++) {
      tr = rk4(tr, DT);
      ens = ens.map(e => rk4(e, DT));
      if (hz === null) {
        const m = ens.reduce((a, e) => a + e[0], 0) / MEMBERS;
        const sd = Math.sqrt(ens.reduce((a, e) => a + (e[0] - m) ** 2, 0) / MEMBERS);
        if (sd > SPREAD_LIMIT) hz = i * DT;
      }
      if (i % SAVE === 0) {
        truthX.push(tr[0]);
        ens.forEach((e, k) => memX[k].push(e[0]));
      }
    }
    return { truth: truthX, members: memX, horizon: hz };
  }, [sit, eps]);

  const line = (xs: number[]) => xs.map((x, i) => `${i ? 'L' : 'M'}${tx(i * SAVE * DT).toFixed(1)} ${yx(x).toFixed(1)}`).join('');
  const li = Math.round(lead / (SAVE * DT));
  const warm = members.filter(m => m[li] > 0).length;
  const prob = Math.round((100 * warm) / MEMBERS);
  const truthWarm = truth[li] > 0;
  const skillful = horizon === null || lead < horizon;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 290" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <rect x={PX} y={PY} width={PW} height={PH / 2} className="fill-rose-50 dark:fill-rose-950/40" />
        <rect x={PX} y={PY + PH / 2} width={PW} height={PH / 2} className="fill-sky-50 dark:fill-sky-950/40" />
        {horizon !== null && horizon < T_MAX && (
          <rect x={tx(horizon)} y={PY} width={PX + PW - tx(horizon)} height={PH} className="fill-gray-400/20" />
        )}
        {members.map((m, k) => (
          <path key={k} d={line(m)} fill="none" className="stroke-sky-600/50 dark:stroke-sky-300/50" strokeWidth="1" />
        ))}
        <path d={line(truth)} fill="none" className="stroke-gray-900 dark:stroke-white" strokeWidth="2.2" />
        <line x1={PX} y1={yx(0)} x2={PX + PW} y2={yx(0)} className="stroke-gray-400" strokeDasharray="4 4" />
        <rect x={PX} y={PY} width={PW} height={PH} fill="none" className="stroke-gray-400" />
        {[0, 2, 4, 6, 8, 10, 12, 14, 16].map(t => (
          <text key={t} x={tx(t)} y={PY + PH + 14} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
            {t}
          </text>
        ))}
        <text x={PX + PW / 2} y={PY + PH + 28} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          срок на прогнозата (време на модела)
        </text>
        <text x={PX + 6} y={PY + 14} fontSize="11" className="fill-rose-700 dark:fill-rose-300">
          режим „А“ (x &gt; 0)
        </text>
        <text x={PX + 6} y={PY + PH - 6} fontSize="11" className="fill-sky-700 dark:fill-sky-300">
          режим „Б“ (x &lt; 0)
        </text>
        <text x={14} y={PY + PH / 2} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300" transform={`rotate(-90 14 ${PY + PH / 2})`}>
          x
        </text>
        {horizon !== null && horizon < T_MAX && (
          <text x={tx(horizon) + 4} y={PY + 28} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
            членовете са се разпилели
          </text>
        )}
        <line x1={tx(lead)} y1={PY} x2={tx(lead)} y2={PY + PH} className="stroke-fuchsia-600" strokeWidth="2" />
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Черната линия е „истинското“ време, сините – 20 члена на ансамбъла, пуснати от почти същото начало.
      </p>
      <Buttons>
        {['ситуация 1', 'ситуация 2', 'ситуация 3'].map((name, i) => (
          <DiagramButton key={name} active={sit === i} onClick={() => setSit(i)}>
            {name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {ERRORS.map((e, i) => (
          <DiagramButton key={e} active={errIdx === i} onClick={() => setErrIdx(i)}>
            грешка {fmt(e, Math.max(1, -Math.log10(e)))}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="срок" value={lead} onChange={setLead} min={0} max={T_MAX} step={0.1} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'начална грешка', value: fmt(eps, Math.max(1, -Math.log10(eps))) },
            { label: 'предвидимо до', value: horizon === null ? `над ${T_MAX}` : fmt(horizon, 1), tone: 'violet' },
            { label: 'вероятност за „А“', value: `${prob}%`, tone: 'rose' },
            { label: 'в действителност', value: truthWarm ? '„А“' : '„Б“' },
          ]}
        />
      </div>
      <Note tone={skillful ? 'emerald' : 'amber'}>
        {skillful
          ? 'Членовете още са заедно – прогнозата е уверена.'
          : 'Членовете са се разпилели из двата режима – можем да дадем само вероятност, близка до климатичната.'}
      </Note>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Намали началната грешка 10 пъти и виж с колко се удължава предвидимостта – всеки път с приблизително еднакво време, не 10 пъти.
      </p>
    </div>
  );
}
