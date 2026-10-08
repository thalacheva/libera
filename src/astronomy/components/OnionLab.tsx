import { useState } from 'react';
import { BINDING, BURNING } from './evolutionData';
import { fmt } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 320;
const CX = 150;
const CY = 160;
const RMAX = 135;
// Графиката на енергията на връзка
const GX0 = 330;
const GX1 = 620;
const GY0 = 30;
const GY1 = 270;
const A_MAX = 240;
const E_MAX = 9.2;
const gx = (A: number) => GX0 + (Math.sqrt(A) / Math.sqrt(A_MAX)) * (GX1 - GX0); // √A – за да се виждат леките ядра
const gy = (e: number) => GY1 - (e / E_MAX) * (GY1 - GY0);

// Слоеве отвън навътре (радиусите са схематични)
const LAYERS = [
  { id: 'H', r: 1.0, color: '#fde68a', name: 'водородна обвивка', burning: 0 },
  { id: 'He', r: 0.62, color: '#fdba74', name: 'хелий', burning: 1 },
  { id: 'C', r: 0.47, color: '#f87171', name: 'въглерод', burning: 2 },
  { id: 'Ne', r: 0.37, color: '#c084fc', name: 'неон', burning: 3 },
  { id: 'O', r: 0.28, color: '#60a5fa', name: 'кислород', burning: 4 },
  { id: 'Si', r: 0.19, color: '#94a3b8', name: 'силиций', burning: 5 },
  { id: 'Fe', r: 0.1, color: '#475569', name: 'желязно ядро', burning: -1 },
];

const HIGHLIGHT: Record<string, string[]> = {
  H: ['¹H', '⁴He'],
  He: ['⁴He', '¹²C', '¹⁶O'],
  C: ['¹²C', '²⁰Ne', '²⁴Mg'],
  Ne: ['²⁰Ne', '¹⁶O', '²⁴Mg'],
  O: ['¹⁶O', '²⁸Si', '³²S'],
  Si: ['²⁸Si', '⁵⁶Fe'],
  Fe: ['⁵⁶Fe', '⁶²Ni'],
};

const CURVE = BINDING.map(b => `${gx(b.A)},${gy(b.e)}`).join(' ');

export default function OnionLab() {
  const [layerId, setLayerId] = useState('Si');
  const [collapse, setCollapse] = useState(0); // 0 … 1 – фаза на колапса
  const [running, setRunning] = useState(false);
  const layer = LAYERS.find(l => l.id === layerId)!;
  const burning = layer.burning >= 0 ? BURNING[layer.burning] : null;
  const marks = HIGHLIGHT[layerId];

  useAnimationFrame(running && collapse < 1, dt => setCollapse(v => Math.min(1, v + dt * 0.35)));

  // 0–0,3: ядрото се свива; 0,3–1: ударната вълна тръгва навън
  const coreShrink = collapse < 0.3 ? 1 - (collapse / 0.3) * 0.75 : 0.25;
  const shock = collapse > 0.3 ? ((collapse - 0.3) / 0.7) * RMAX * 1.15 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-red-300 dark:border-red-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Звезда-лук и краят при желязото</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Разрез на звезда от 25 M☉ малко преди смъртта ѝ (не в мащаб: желязното ядро е колкото Земята, а звездата – около 1000 R☉).
        Щракнете върху слой. Вдясно: колко здраво е свързан всеки нуклон в ядрото.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {LAYERS.map(l => (
          <circle
            key={l.id}
            cx={CX}
            cy={CY}
            r={l.id === 'Fe' ? RMAX * l.r * coreShrink : RMAX * l.r}
            fill={l.color}
            fillOpacity={collapse > 0.3 && RMAX * l.r < shock ? 0.35 : 0.9}
            stroke={l.id === layerId ? 'white' : '#0f172a'}
            strokeWidth={l.id === layerId ? 2 : 1}
            className="cursor-pointer"
            onClick={() => setLayerId(l.id)}
          />
        ))}
        {LAYERS.slice(1).map((l, i) => (
          <text key={l.id} x={CX + (RMAX * (l.r + (LAYERS[i + 2]?.r ?? 0))) / 2} y={CY + 4} fontSize="10" textAnchor="middle" fill="#0f172a" fontWeight="700" pointerEvents="none">
            {l.id}
          </text>
        ))}
        <text x={CX} y={CY - RMAX * 0.78} fontSize="10" textAnchor="middle" fill="#0f172a" fontWeight="700" pointerEvents="none">
          H
        </text>
        {shock > 0 && <circle cx={CX} cy={CY} r={shock} fill="none" stroke="white" strokeWidth="3" strokeOpacity={1 - collapse * 0.6} />}
        {collapse >= 1 && (
          <text x={CX} y={CY + RMAX + 18} fontSize="11" textAnchor="middle" fill="#fde68a" fontWeight="700">
            💥 свръхнова!
          </text>
        )}

        {/* Енергия на връзка на нуклон */}
        <line x1={GX0} x2={GX1} y1={GY1} y2={GY1} stroke="white" strokeOpacity="0.35" />
        <line x1={GX0} x2={GX0} y1={GY0} y2={GY1} stroke="white" strokeOpacity="0.35" />
        {[2, 4, 6, 8].map(e => (
          <text key={e} x={GX0 - 4} y={gy(e) + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.55">
            {e}
          </text>
        ))}
        <text x={GX0 + 4} y={GY0 - 8} fontSize="9" fill="white" fillOpacity="0.6">
          MeV на нуклон
        </text>
        {[1, 4, 16, 56, 120, 238].map(A => (
          <text key={A} x={gx(A)} y={GY1 + 13} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
            {A}
          </text>
        ))}
        <text x={(GX0 + GX1) / 2} y={GY1 + 26} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.55">
          масово число A (брой нуклони)
        </text>
        <rect x={gx(50)} y={GY0} width={gx(66) - gx(50)} height={GY1 - GY0} fill="#94a3b8" fillOpacity="0.1" />
        <polyline points={CURVE} fill="none" stroke="#fbbf24" strokeWidth="2" />
        {BINDING.map(b => {
          const on = marks.includes(b.sym);
          return (
            <g key={b.sym}>
              <circle cx={gx(b.A)} cy={gy(b.e)} r={on ? 5 : 2.5} fill={on ? '#f472b6' : '#fbbf24'} />
              {(on || ['⁴He', '⁵⁶Fe', '²³⁸U'].includes(b.sym)) && (
                <text x={gx(b.A) + (b.A > 200 ? -4 : 4)} y={gy(b.e) - 7} fontSize="9" textAnchor={b.A > 200 ? 'end' : 'start'} fill={on ? '#f9a8d4' : '#fde68a'}>
                  {b.sym}
                </text>
              )}
            </g>
          );
        })}
        <text x={gx(8)} y={gy(4.5)} fontSize="9" fill="#86efac">
          синтез → енергия
        </text>
        <text x={gx(130)} y={gy(6.8)} fontSize="9" fill="#93c5fd">
          ← делене → енергия
        </text>
        <text x={gx(58)} y={GY1 - 6} fontSize="9" textAnchor="middle" fill="#cbd5e1">
          желязо
        </text>
      </svg>

      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        {LAYERS.map(l => (
          <button
            key={l.id}
            onClick={() => setLayerId(l.id)}
            className={`px-2 py-1 rounded text-xs border ${
              l.id === layerId
                ? 'border-red-500 bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: l.color }} />
            {l.name}
          </button>
        ))}
        <button
          onClick={() => {
            setCollapse(0);
            setRunning(true);
          }}
          className="ml-2 px-4 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700"
        >
          💥 Колапс на ядрото
        </button>
      </div>

      <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-sm sm:text-base">
        {burning ? (
          <p>
            <strong>Горене на {burning.fuel}</strong> → {burning.products}. Нужна температура: {burning.T}. Продължителност в ядрото:{' '}
            <strong>{burning.duration}</strong>. Всяко следващо гориво дава по-малко енергия, а звездата губи все повече енергия чрез
            неутрино – затова фазите стават все по-кратки.
          </p>
        ) : (
          <p>
            <strong>Желязото е задънена улица.</strong> Ядрата около ⁵⁶Fe и ⁶²Ni са най-здраво свързани ({fmt(8.79, 2)} MeV на нуклон).
            Синтезът на по-тежки ядра не освобождава, а поглъща енергия. Когато желязното ядро надхвърли ~1,4 M☉ (границата на
            Чандрасекар), налягането на електроните не може да го удържи. За по-малко от секунда то колапсира от размера на Земята
            до кълбо от неутрони с диаметър ~20 km.
          </p>
        )}
        {collapse > 0 && (
          <p className="mt-2">
            {collapse < 0.3
              ? 'Ядрото пада към центъра с ~25% от скоростта на светлината…'
              : collapse < 1
                ? 'Неутронното ядро е твърдо като стена: падащото вещество отскача, а поток от неутрино (99% от енергията!) подхранва ударната вълна.'
                : 'Ударната вълна разкъсва звездата. Обвивката отлита с ~10 000 km/s и обогатява Галактиката с кислород, силиций, калций и желязо. В центъра остава неутронна звезда или черна дупка (Лекция 21).'}
          </p>
        )}
      </div>
    </div>
  );
}
