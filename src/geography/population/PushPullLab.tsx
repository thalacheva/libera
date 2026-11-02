import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

const YEARS = 30;
const LA0 = 7; // население (работна сила) на страната на произход, млн.
const LB0 = 60; // на страната на приемане, млн.
const ALPHA = 0.3; // намаляваща възвръщаемост: повече работници – по-ниска заплата
const UB = 5; // безработица в приемащата страна, %
const RATE = 0.03; // каква част от населението тръгва годишно при „печалба“ 1 (ln)
const RETURN = 0.02; // насрещен поток: част от емигрантите, които се връщат годишно
const SENT = 0.1; // каква част от заплатата си емигрантите изпращат у дома

type Year = { t: number; la: number; stock: number; ratio: number; flow: number; remit: number };

function simulate(w0: number, u0: number, cost: number, visas: boolean, war: boolean) {
  const aA = LA0 ** ALPHA;
  const aB = w0 * LB0 ** ALPHA;
  let la = LA0;
  let lb = LB0;
  let stock = 0;
  const out: Year[] = [];
  for (let t = 0; t <= YEARS; t++) {
    const wA = aA * la ** -ALPHA;
    const wB = aB * lb ** -ALPHA;
    const u = Math.max(0, u0 - (100 * (LA0 - la)) / LA0);
    const incA = wA * (1 - u / 100);
    const incB = wB * (1 - UB / 100);
    const gain = Math.log(incB / incA) - cost - (visas ? 0.7 : 0);
    const forced = war && t < 8 ? 0.035 : 0;
    const flow = (RATE * Math.max(0, gain) + forced) * la;
    const back = RETURN * stock;
    const remit = (100 * SENT * stock * wB) / (la * incA);
    out.push({ t, la, stock, ratio: incB / incA, flow: flow - back, remit });
    la -= flow - back;
    lb += flow - back;
    stock += flow - back;
  }
  return out;
}

const L = { x: 46, y: 26, w: 250, h: 220 };
const R = { x: 370, y: 26, w: 250, h: 220 };

/** Изтласкващи и привличащи фактори: модел на трудова миграция между две страни. */
export default function PushPullLab() {
  const [w0, setW0] = useState(3);
  const [u0, setU0] = useState(15);
  const [cost, setCost] = useState(0.4);
  const [visas, setVisas] = useState(false);
  const [war, setWar] = useState(false);

  const sim = simulate(w0, u0, cost, visas, war);
  const last = sim[YEARS];
  const threshold = Math.exp(cost + (visas ? 0.7 : 0));
  const stop = sim.find(y => y.t > 0 && y.flow <= 0.0005 * LA0);
  const yMax = Math.max(4, Math.ceil(Math.max(threshold, ...sim.map(y => y.ratio)) + 0.5));

  const tx = (box: typeof L, t: number) => box.x + (t / YEARS) * box.w;
  const ly = (v: number) => L.y + L.h - (v / 100) * L.h;
  const ry = (v: number) => R.y + R.h - (v / yMax) * R.h;
  const line = (f: (y: Year) => number, box: typeof L, ys: (v: number) => number) =>
    sim.map((y, i) => `${i ? 'L' : 'M'}${tx(box, y.t).toFixed(1)} ${ys(f(y)).toFixed(1)}`).join('');

  const axes = (box: typeof L, ticks: number[], ys: (v: number) => number, unit: string) => (
    <g>
      {ticks.map(v => (
        <g key={v}>
          <line x1={box.x} y1={ys(v)} x2={box.x + box.w} y2={ys(v)} className="stroke-gray-200 dark:stroke-gray-700" />
          <text x={box.x - 5} y={ys(v) + 3} fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
            {fmt(v)}
            {unit}
          </text>
        </g>
      ))}
      {[0, 10, 20, 30].map(t => (
        <text key={t} x={tx(box, t)} y={box.y + box.h + 13} fontSize="9" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          {t}
        </text>
      ))}
      <text x={box.x + box.w} y={box.y + box.h + 26} fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
        години
      </text>
    </g>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 285" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={L.x} y={14} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          Страната на произход (% от началното население)
        </text>
        {axes(
          L,
          [0, 25, 50, 75, 100],
          ly,
          '%'
        )}
        <path d={line(y => (100 * y.la) / LA0, L, ly)} fill="none" className="stroke-sky-600" strokeWidth="2.5" />
        <path d={line(y => (100 * y.stock) / LA0, L, ly)} fill="none" className="stroke-rose-500" strokeWidth="2.5" />
        <text x={tx(L, YEARS) - 4} y={ly((100 * last.la) / LA0) - 6} fontSize="10" textAnchor="end" className="fill-sky-700 dark:fill-sky-300">
          остават
        </text>
        <text x={tx(L, YEARS) - 4} y={ly((100 * last.stock) / LA0) - 6} fontSize="10" textAnchor="end" className="fill-rose-600 dark:fill-rose-300">
          в чужбина
        </text>

        <text x={R.x} y={14} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          Колко пъти повече се печели в чужбина
        </text>
        {axes(
          R,
          Array.from({ length: yMax + 1 }, (_, i) => i).filter(v => yMax <= 6 || v % 2 === 0),
          ry,
          '×'
        )}
        <line x1={R.x} y1={ry(threshold)} x2={R.x + R.w} y2={ry(threshold)} className="stroke-gray-500" strokeDasharray="5 4" />
        <text x={R.x + R.w} y={ry(threshold) - 5} fontSize="10" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          праг: пречките
        </text>
        <path d={line(y => y.ratio, R, ry)} fill="none" className="stroke-amber-500" strokeWidth="2.5" />
      </LabSvg>
      <Buttons>
        <DiagramButton active={!visas} onClick={() => setVisas(false)}>
          свободно движение
        </DiagramButton>
        <DiagramButton active={visas} onClick={() => setVisas(true)}>
          визи и разрешения
        </DiagramButton>
        <DiagramButton active={war} onClick={() => setWar(!war)}>
          {war ? '⚠️ война (вкл.)' : 'война'}
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="заплати" value={w0} onChange={setW0} min={1} max={6} step={0.1} tone="amber" />
        <Slider label="безраб." value={u0} onChange={setU0} min={0} max={30} step={1} tone="rose" />
        <Slider label="пречки" value={cost} onChange={setCost} min={0} max={1.5} step={0.05} tone="gray" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        „заплати“ – колко пъти по-високи са заплатите в приемащата страна в началото; „безраб.“ – безработица у дома, %; „пречки“ – разходи за пътя, езикът,
        раздялата със семейството (в логаритмични единици: 0,4 означава, че хората тръгват чак когато доходът в чужбина е поне e^0,4 ≈ 1,5 пъти по-висок).
        Опростен модел: когато хората заминават, у дома безработицата пада и заплатите растат, а в чужбина – леко спадат. Всяка година около 2% от
        емигрантите се връщат.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'заминали за 30 г.', value: `${fmt((100 * last.stock) / LA0)}%`, tone: 'rose' },
            { label: 'разлика накрая', value: `${fmt(last.ratio, 2)}×`, tone: 'amber' },
            { label: 'преводи', value: `${fmt(last.remit, 1)}% от доходите у дома`, tone: 'emerald' },
            { label: 'потокът спира', value: stop ? `≈ ${stop.t}. година` : 'не спира за 30 г.', tone: 'blue' },
          ]}
        />
      </div>
      <Note tone={war ? 'rose' : last.stock < 0.01 * LA0 ? 'gray' : 'emerald'}>
        {war
          ? 'При война хората бягат независимо от заплатите – това е принудителна миграция. След края ѝ част от тях се връщат.'
          : last.stock < 0.01 * LA0
            ? 'Разликата в доходите не надвишава пречките – почти никой не тръгва.'
            : stop
              ? 'Миграцията сама намалява разликата: у дома безработицата пада и заплатите растат, докато печалбата от заминаването спадне до прага на пречките.'
              : 'Потокът отслабва, но голямата разлика в заплатите не изчезва за десетилетия само от миграцията – нужно е и икономиката у дома да расте.'}
      </Note>
    </div>
  );
}
