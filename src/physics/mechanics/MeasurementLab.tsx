import { useState } from 'react';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { SimControls } from '../SimControls';
import { fmtNum, useSimulation } from '../sim';

const G = 9.81;
const LENGTH = 1;
const THETA0 = (8 * Math.PI) / 180;
// При малка амплитуда периодът е 2π√(l/g); поправката за 8° е около 0,1%
const T_TRUE = 2 * Math.PI * Math.sqrt(LENGTH / G) * (1 + THETA0 ** 2 / 16);

type Swing = { th: number; om: number };
type Measurement = { n: number; t: number };

const step = (s: Swing, dt: number): Swing => {
  const om = s.om - (G / LENGTH) * Math.sin(s.th) * dt;
  return { th: s.th + om * dt, om };
};

/** Закъснение на реакцията при натискане на бутон – около 0,2 s с разсейване ±0,1 s. */
function reaction() {
  const u = 1 - Math.random();
  const v = Math.random();
  return 0.2 + 0.1 * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const COUNTS = [1, 5, 10];
const TONES = { 1: 'rose', 5: 'amber', 10: 'emerald' } as const;
const FILL = { 1: 'fill-rose-500', 5: 'fill-amber-500', 10: 'fill-emerald-500' } as const;

// Ос за периода: от 1,5 до 2,5 s
const AX = { left: 236, right: 464 };
const ax = (T: number) => AX.left + (T - 1.5) * (AX.right - AX.left);

/** Измерване на периода на махало с хронометър: защо се мерят много трептения наведнъж. */
export default function MeasurementLab() {
  const sim = useSimulation<Swing>(() => ({ th: THETA0, om: 0 }), step, { dt: 1 / 1000 });
  const [n, setN] = useState(10);
  const [start, setStart] = useState<number | null>(null);
  const [data, setData] = useState<Measurement[]>([]);

  const press = () => {
    if (start === null) {
      sim.play();
      setStart(sim.time);
    } else {
      setData([...data, { n, t: sim.time - start }].slice(-60));
      setStart(null);
    }
  };

  // Десет души мерят наведнъж: всеки закъснява малко при старта и при стопа
  const crowd = () => setData([...data, ...Array.from({ length: 10 }, () => ({ n, t: n * T_TRUE + reaction() - reaction() }))].slice(-60));

  const pivot = { x: 84, y: 20 };
  const len = 160;
  const bob = { x: pivot.x + len * Math.sin(sim.state.th), y: pivot.y + len * Math.cos(sim.state.th) };
  const shown = start === null ? (data.length ? data[data.length - 1].t : 0) : sim.time - start;

  const stats = COUNTS.map(c => {
    const Ts = data.filter(d => d.n === c).map(d => d.t / c);
    if (!Ts.length) return null;
    const mean = Ts.reduce((a, b) => a + b, 0) / Ts.length;
    return { c, count: Ts.length, mean, spread: (Math.max(...Ts) - Math.min(...Ts)) / 2 };
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 230">
        {/* Махало */}
        <line x1={pivot.x - 50} y1={pivot.y} x2={pivot.x + 50} y2={pivot.y} className="stroke-gray-500" strokeWidth="4" />
        <line x1={pivot.x} y1={pivot.y} x2={pivot.x} y2={pivot.y + len + 20} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="4 4" />
        <line x1={pivot.x} y1={pivot.y} x2={bob.x} y2={bob.y} className="stroke-gray-600 dark:stroke-gray-300" strokeWidth="1.5" />
        <circle cx={bob.x} cy={bob.y} r={13} className="fill-blue-500 stroke-white dark:stroke-gray-800" strokeWidth="2" />
        <Label p={{ x: pivot.x, y: 214 }} size={12}>
          l = 1 m
        </Label>

        {/* Хронометър */}
        <rect x={AX.left + 20} y={10} width={150} height={50} rx={10} className="fill-gray-900 dark:fill-gray-950" />
        <text x={AX.left + 95} y={36} fontSize={30} fontFamily="ui-monospace, monospace" textAnchor="middle" dominantBaseline="central" className={start === null ? 'fill-gray-300' : 'fill-emerald-400'}>
          {shown.toFixed(2).replace('.', ',')}
        </text>
        <Label p={{ x: AX.left + 95, y: 74 }} size={12}>
          {start === null ? 'спрян' : `мериш ${n} ${n === 1 ? 'трептене' : 'трептения'}…`}
        </Label>

        {/* Измерените периоди по редове според броя трептения */}
        <line x1={AX.left} y1={192} x2={AX.right} y2={192} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        {[1.5, 1.75, 2, 2.25, 2.5].map(v => (
          <g key={v}>
            <line x1={ax(v)} y1={188} x2={ax(v)} y2={196} className="stroke-gray-400 dark:stroke-gray-500" />
            <Label p={{ x: ax(v), y: 207 }} size={11} weight={500}>
              {fmtNum(v, 2)}
            </Label>
          </g>
        ))}
        <Label p={{ x: AX.right, y: 222 }} size={11} anchor="end">
          T, s
        </Label>
        <line x1={ax(T_TRUE)} y1={92} x2={ax(T_TRUE)} y2={192} className="stroke-blue-500" strokeDasharray="4 3" strokeWidth="1.5" />
        {COUNTS.map((c, row) => (
          <Label key={c} p={{ x: AX.left - 8, y: 108 + row * 28 }} size={12} anchor="end" tone={TONES[c as 1 | 5 | 10]}>
            {`N = ${c}`}
          </Label>
        ))}
        {data.map((d, i) => (
          // Точки извън оста (напр. грешно преброени трептения) не рисуваме
          d.t / d.n >= 1.5 && d.t / d.n <= 2.5 && <circle key={i} cx={ax(d.t / d.n)} cy={108 + COUNTS.indexOf(d.n) * 28} r={5} className={`${FILL[d.n as 1 | 5 | 10]} opacity-70`} />
        ))}
      </ZoomingSvg>

      <SimControls running={sim.running} onToggle={sim.toggle} onReset={() => sim.reset()} />
      <Buttons>
        {COUNTS.map(c => (
          <DiagramButton key={c} active={c === n} onClick={() => start === null && setN(c)}>
            {c === 1 ? '1 трептене' : `${c} трептения`}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="flex flex-wrap justify-center gap-2 mt-3">
        <button onClick={press} className="px-6 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition">
          {start === null ? '⏱ Старт' : '⏹ Стоп'}
        </button>
        <button onClick={crowd} disabled={start !== null} className="px-3 py-2 rounded-lg border text-sm border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-200 disabled:opacity-50">
          👥 10 души мерят
        </button>
        <button onClick={() => setData([])} className="px-3 py-2 rounded-lg border text-sm border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-200">
          Изчисти
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {stats.map(
          s =>
            s && (
              <Readout
                key={s.c}
                items={[
                  { label: `N = ${s.c}:`, value: `${s.count} ${s.count === 1 ? 'измерване' : 'измервания'}`, tone: TONES[s.c as 1 | 5 | 10] },
                  { label: 'T ≈', value: `${fmtNum(s.mean, 3)} s` },
                  ...(s.count > 1 ? [{ label: '±', value: `${fmtNum(s.spread, 3)} s` }] : []),
                ]}
              />
            ),
        )}
      </div>
      <Note tone="blue">{`Истинският период (синята линия) е ${fmtNum(T_TRUE, 3)} s.`}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Натисни „Старт“, когато топчето е в крайно положение, и „Стоп“ след избрания брой пълни трептения (отиване и връщане). Закъснението
        на ръката е около 0,2 s и почти не зависи от това колко дълго мериш – затова при N = 10 грешката на един период е 10 пъти по-малка.
        Бутонът „10 души мерят“ добавя измервания с типично човешко закъснение.
      </p>
    </div>
  );
}
