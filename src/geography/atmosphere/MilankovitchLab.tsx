import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt, rad } from '../geo';

// Стилизирани цикли на Миланкович (чисти синусоиди – истинските са по-сложни) и прост модел на ледовете (Imbrie & Imbrie, 1980).
// t – хиляди години назад от днес.
const S0 = 1361;
const LAT = 65;
const E_NOW = 0.0167;
const EPS_NOW = 23.44;

const ecc = (t: number) => E_NOW + 0.013 * Math.sin((2 * Math.PI * t) / 100);
const obl = (t: number) => EPS_NOW + 0.95 * (Math.cos((2 * Math.PI * (t - 10)) / 41) - Math.cos((2 * Math.PI * -10) / 41));
/** Ъгъл между перихелия и мястото на Земята в лятното слънцестоене на северното полукълбо: 0 – перихелий през юни. */
const prec = (t: number) => Math.PI + (2 * Math.PI * t) / 23;

/** Средна за денонощието инсолация на горната граница на атмосферата в деня на лятното слънцестоене, W/m². */
function summerInsolation(e: number, eps: number, theta: number) {
  const phi = rad(LAT);
  const d = rad(eps);
  const h0 = Math.acos(Math.max(-1, Math.min(1, -Math.tan(phi) * Math.tan(d))));
  const dist = ((1 + e * Math.cos(theta)) / (1 - e * e)) ** 2;
  return (S0 / Math.PI) * dist * (h0 * Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.sin(h0));
}

type Cycles = { e: boolean; eps: boolean; prec: boolean };
const orbit = (t: number, c: Cycles) => ({
  e: c.e ? ecc(t) : E_NOW,
  eps: c.eps ? obl(t) : EPS_NOW,
  theta: c.prec ? prec(t) : Math.PI,
});

const T_MAX = 400;
const STEP = 0.5;

/** Инсолацията и обемът на леда за последните 400 хил. години (моделът тръгва от 800 хил. години назад). */
function series(c: Cycles) {
  const ts: number[] = [];
  for (let t = 800; t >= 0; t -= STEP) ts.push(t);
  const qs = ts.map(t => {
    const o = orbit(t, c);
    return summerInsolation(o.e, o.eps, o.theta);
  });
  const mean = qs.reduce((a, b) => a + b, 0) / qs.length;
  const sd = Math.sqrt(qs.reduce((a, q) => a + (q - mean) ** 2, 0) / qs.length) || 1;
  let v = 0;
  const ice = qs.map(q => {
    const x = -(q - mean) / sd;
    // ледът нараства бавно (42,5 хил. години), а се топи бързо (10,6 хил. години)
    v += ((x - v) / (x > v ? 42.5 : 10.6)) * STEP;
    return v;
  });
  const keep = ts.map((t, i) => ({ t, q: qs[i], ice: ice[i] })).filter(p => p.t <= T_MAX);
  const lo = Math.min(...keep.map(p => p.ice));
  const hi = Math.max(...keep.map(p => p.ice));
  return keep.map(p => ({ ...p, ice: hi > lo ? (p.ice - lo) / (hi - lo) : 0.5 }));
}

const PX = 54;
const PW = 400;
const QY = 20;
const QH = 130;
const IY = 182;
const IH = 100;
const Q_MIN = 445;
const Q_MAX = 545;
const xOf = (t: number) => PX + PW - (t / T_MAX) * PW;
const qy = (q: number) => QY + QH - ((q - Q_MIN) / (Q_MAX - Q_MIN)) * QH;
const iy = (v: number) => IY + IH - v * IH;

const MONTHS = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
/** Месецът на перихелия: днес е около 3 януари, а за 23 хил. години обикаля цялата година. */
function perihelionMonth(theta: number) {
  const day = (((3 - ((theta - Math.PI) / (2 * Math.PI)) * 365) % 365) + 365) % 365;
  let acc = 0;
  for (let m = 0; m < 12; m++) {
    acc += MONTH_DAYS[m];
    if (day < acc) return MONTHS[m];
  }
  return MONTHS[11];
}

const PRESETS = [
  { name: 'днес', t: 0 },
  { name: 'преди 11 хил. г.', t: 11 },
  { name: 'преди 22 хил. г.', t: 22 },
  { name: 'преди 127 хил. г.', t: 127 },
];

/** Циклите на Миланкович: как ексцентрицитетът, наклонът на оста и прецесията менят лятното слънце на 65° с.ш. */
export default function MilankovitchLab() {
  const [t, setT] = useState(0);
  const [cycles, setCycles] = useState<Cycles>({ e: true, eps: true, prec: true });
  const data = useMemo(() => series(cycles), [cycles]);
  const o = orbit(t, cycles);
  const q = summerInsolation(o.e, o.eps, o.theta);
  const qNow = summerInsolation(E_NOW, EPS_NOW, Math.PI);
  const cur = data.reduce((best, p) => (Math.abs(p.t - t) < Math.abs(best.t - t) ? p : best), data[0]);

  const qPath = data.map((p, i) => `${i ? 'L' : 'M'}${xOf(p.t).toFixed(1)} ${qy(p.q).toFixed(1)}`).join('');
  const icePath = data.map((p, i) => `${i ? 'L' : 'M'}${xOf(p.t).toFixed(1)} ${iy(p.ice).toFixed(1)}`).join('');
  const iceArea = `${icePath}L${xOf(0)} ${IY + IH}L${xOf(T_MAX)} ${IY + IH}Z`;

  // Орбита: ексцентрицитетът е преувеличен 6 пъти, за да се вижда
  const cx = 548;
  const cy = 120;
  const a = 62;
  const eShow = Math.min(0.5, o.e * 6);
  const b = a * Math.sqrt(1 - eShow * eShow);
  const c = a * eShow;
  // Слънцето е във фокуса; перихелият е вдясно от него
  const sunX = cx + c;
  const nu = o.theta; // истинска аномалия на Земята в деня на лятното слънцестоене
  const r = (a * (1 - eShow * eShow)) / (1 + eShow * Math.cos(nu));
  const ex = sunX + r * Math.cos(nu);
  const ey = cy - r * Math.sin(nu);
  const tilt = rad(o.eps);
  // В слънцестоенето оста е наклонена към Слънцето
  const toSun = Math.atan2(cy - ey, sunX - ex);
  const axDx = Math.cos(toSun) * Math.sin(tilt) * 16;
  const axDy = -Math.cos(tilt) * 16;

  const toggle = (k: keyof Cycles) => setCycles(s => ({ ...s, [k]: !s[k] }));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 320" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Инсолация */}
        <rect x={PX} y={QY} width={PW} height={QH} className="fill-amber-50 dark:fill-slate-900" />
        {[460, 480, 500, 520, 540].map(v => (
          <g key={v}>
            <line x1={PX} y1={qy(v)} x2={PX + PW} y2={qy(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={PX - 6} y={qy(v) + 3} fontSize="10" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
              {v}
            </text>
          </g>
        ))}
        <line x1={PX} y1={qy(qNow)} x2={PX + PW} y2={qy(qNow)} className="stroke-gray-400" strokeDasharray="4 4" />
        <path d={qPath} fill="none" className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="1.6" />
        <rect x={PX} y={QY} width={PW} height={QH} fill="none" className="stroke-gray-400" />
        <text x={PX + 6} y={QY + 13} fontSize="11" className="fill-amber-800 dark:fill-amber-200">
          лятна инсолация на 65° с.ш., W/m²
        </text>

        {/* Лед */}
        <rect x={PX} y={IY} width={PW} height={IH} className="fill-gray-50 dark:fill-slate-900" />
        <path d={iceArea} className="fill-sky-200/80 dark:fill-sky-800/60" />
        <path d={icePath} fill="none" className="stroke-sky-700 dark:stroke-sky-300" strokeWidth="1.6" />
        <rect x={PX} y={IY} width={PW} height={IH} fill="none" className="stroke-gray-400" />
        <text x={PX + 6} y={IY + 13} fontSize="11" className="fill-sky-800 dark:fill-sky-200">
          лед на сушата (модел) ↑ повече
        </text>

        {[400, 300, 200, 100, 0].map(v => (
          <g key={v}>
            <line x1={xOf(v)} y1={IY + IH} x2={xOf(v)} y2={IY + IH + 5} className="stroke-gray-500" />
            <text x={xOf(v)} y={IY + IH + 17} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              {v === 0 ? 'днес' : v}
            </text>
          </g>
        ))}
        <text x={PX + PW / 2} y={IY + IH + 32} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          хиляди години назад
        </text>

        <line x1={xOf(t)} y1={QY} x2={xOf(t)} y2={IY + IH} className="stroke-fuchsia-600" strokeWidth="1.5" />
        <circle cx={xOf(t)} cy={qy(cur.q)} r={4} className="fill-fuchsia-600" />
        <circle cx={xOf(t)} cy={iy(cur.ice)} r={4} className="fill-fuchsia-600" />

        {/* Орбитата */}
        <text x={cx} y={QY + 10} fontSize="11" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          Земята в лятното слънцестоене
        </text>
        <ellipse cx={cx} cy={cy} rx={a} ry={b} fill="none" className="stroke-gray-400" strokeDasharray="3 3" />
        <circle cx={sunX} cy={cy} r={7} className="fill-yellow-400 stroke-amber-600" />
        <circle cx={cx + a} cy={cy} r={2.5} className="fill-gray-500" />
        <text x={cx + a} y={cy + 14} fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          перихелий
        </text>
        <line x1={ex - axDx} y1={ey - axDy} x2={ex + axDx} y2={ey + axDy} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="1.5" />
        <circle cx={ex} cy={ey} r={6} className="fill-sky-500 stroke-sky-800" />
        <text x={cx} y={cy + b + 20} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          формата е преувеличена 6 пъти
        </text>
        <text x={cx} y={cy + b + 50} fontSize="11" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          <tspan x={cx}>По-силно лятно слънце →</tspan>
          <tspan x={cx} dy="14">снегът се стопява →</tspan>
          <tspan x={cx} dy="14">ледът се свива</tspan>
        </text>
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Циклите тук са чисти синусоиди, а ледът – прост модел, в който той нараства бавно и се топи бързо. Истинските орбитални
        промени са по-сложни.
      </p>
      <Sliders>
        <Slider label="хил. г." value={t} onChange={setT} min={0} max={T_MAX} step={1} tone="violet" />
      </Sliders>
      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton key={p.name} active={t === p.t} onClick={() => setT(p.t)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={cycles.e} onClick={() => toggle('e')}>
          ексцентрицитет (~100 хил. г.)
        </DiagramButton>
        <DiagramButton active={cycles.eps} onClick={() => toggle('eps')}>
          наклон на оста (~41 хил. г.)
        </DiagramButton>
        <DiagramButton active={cycles.prec} onClick={() => toggle('prec')}>
          прецесия (~23 хил. г.)
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'e', value: fmt(o.e, 4) },
            { label: 'наклон', value: `${fmt(o.eps, 2)}°` },
            { label: 'перихелий', value: perihelionMonth(o.theta) },
            { label: 'инсолация', value: `${fmt(q)} W/m²`, tone: 'amber' },
            { label: 'спрямо днес', value: `${q - qNow >= 0 ? '+' : '−'}${fmt(Math.abs(q - qNow))} W/m²`, tone: q >= qNow ? 'rose' : 'blue' },
          ]}
        />
      </div>
      <Note tone={q > qNow + 15 ? 'rose' : q < qNow - 15 ? 'blue' : 'gray'}>
        {q > qNow + 15
          ? 'Лятото на север е по-слънчево от днешното – зимният сняг се стопява и ледените щитове се свиват.'
          : q < qNow - 15
            ? 'Хладно лято на север – част от зимния сняг оцелява и година след година ледът нараства.'
            : 'Лятното слънце е близо до днешното. Изключи цикъл, за да видиш какво допринася той.'}
      </Note>
    </div>
  );
}
