import { useState } from 'react';
import { fmt } from './terrestrialData';

const W = 640;
const H = 300;
const CX = 180;
const CY = 150;
// Спектър
const SX0 = 380;
const SX1 = 620;
const SY0 = 60;
const SY1 = 200;

function classify(theta: number, loud: boolean) {
  if (theta < 12) return loud ? { name: 'Блазар', type: 'blazar' as const } : { name: 'Сейфертова галактика тип 1 (отгоре)', type: 't1' as const };
  if (theta < 45) return loud ? { name: 'Радиоквазар', type: 't1' as const } : { name: 'Квазар / Сейферт тип 1', type: 't1' as const };
  return loud ? { name: 'Радиогалактика', type: 't2' as const } : { name: 'Сейфертова галактика тип 2', type: 't2' as const };
}

const TEXT = {
  blazar: 'Гледаме право в джета. Частиците в него летят почти със скоростта на светлината и излъчването им е насочено напред – усилено стотици пъти. Спектърът е почти без линии, а блясъкът се мени за часове.',
  t1: 'Виждаме директно горещия акреционен диск и облаците близо до черната дупка. Те обикалят с хиляди km/s и линиите им са широки – доплеровото разширение издава скоростта, а оттам и масата на черната дупка.',
  t2: 'Прашният тор закрива центъра. Виждаме само по-далечните, бавни облаци – и тесни линии. Широките линии се показват само в поляризирана, разсеяна светлина: доказателство, че отвътре всичко е същото.',
};

export default function AGNLab() {
  const [theta, setTheta] = useState(30);
  const [loud, setLoud] = useState(true);
  const cls = classify(theta, loud);
  const th = (theta * Math.PI) / 180;
  const eye = { x: CX + 135 * Math.sin(th), y: CY - 135 * Math.cos(th) };

  const spectrum = Array.from({ length: 201 }, (_, i) => {
    const lam = 630 + (i / 200) * 52; // nm
    const cont = cls.type === 'blazar' ? 0.9 - (lam - 630) * 0.002 : 0.35;
    const broad = cls.type === 't1' ? 0.45 * Math.exp(-(((lam - 656.3) / 6) ** 2)) : 0;
    const narrow = cls.type === 'blazar' ? 0.03 * Math.exp(-(((lam - 656.3) / 0.5) ** 2)) : 0.5 * Math.exp(-(((lam - 656.3) / 0.45) ** 2)) + 0.18 * Math.exp(-(((lam - 658.4) / 0.45) ** 2)) + 0.06 * Math.exp(-(((lam - 654.8) / 0.45) ** 2));
    const y = cont + broad + narrow;
    return `${SX0 + (i / 200) * (SX1 - SX0)},${SY1 - y * (SY1 - SY0) * 0.95}`;
  }).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-fuchsia-300 dark:border-fuchsia-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Едно чудовище, много лица</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Квазари, блазари, сейфертови и радиогалактики са едно и също: свръхмасивна черна дупка с акреционен диск, прашен тор и (понякога)
        джетове. Различното е от кой ъгъл гледаме. Завъртете наблюдателя.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {/* Тесни линии – далечни облаци в конусите */}
        <path d={`M ${CX} ${CY} L ${CX - 70} ${CY - 110} L ${CX + 70} ${CY - 110} Z`} fill="#a78bfa" fillOpacity="0.12" />
        <path d={`M ${CX} ${CY} L ${CX - 70} ${CY + 110} L ${CX + 70} ${CY + 110} Z`} fill="#a78bfa" fillOpacity="0.12" />
        {[
          [-30, -80],
          [25, -95],
          [-15, -60],
          [40, -70],
          [-35, 85],
          [20, 95],
          [5, 65],
        ].map(([x, y], i) => (
          <circle key={i} cx={CX + x} cy={CY + y} r="4" fill="#c4b5fd" fillOpacity="0.6" />
        ))}
        {/* Джетове */}
        {loud && (
          <g>
            <path d={`M ${CX - 3} ${CY} L ${CX - 8} ${CY - 140} L ${CX + 8} ${CY - 140} L ${CX + 3} ${CY} Z`} fill="#38bdf8" fillOpacity="0.7" />
            <path d={`M ${CX - 3} ${CY} L ${CX - 8} ${CY + 140} L ${CX + 8} ${CY + 140} L ${CX + 3} ${CY} Z`} fill="#38bdf8" fillOpacity="0.7" />
          </g>
        )}
        {/* Тор */}
        <ellipse cx={CX - 62} cy={CY} rx={36} ry={24} fill="#78350f" fillOpacity="0.85" />
        <ellipse cx={CX + 62} cy={CY} rx={36} ry={24} fill="#78350f" fillOpacity="0.85" />
        {/* Широки линии – бързи облаци близо до центъра */}
        {[-18, -10, 10, 18].map((x, i) => (
          <circle key={i} cx={CX + x} cy={CY + (i % 2 ? -8 : 8)} r="2.5" fill="#fca5a5" />
        ))}
        {/* Акреционен диск и черна дупка */}
        <ellipse cx={CX} cy={CY} rx={24} ry={4} fill="#fde68a" />
        <circle cx={CX} cy={CY} r="3" fill="black" stroke="#fde68a" strokeWidth="0.5" />

        {/* Наблюдателят */}
        <line x1={CX} y1={CY} x2={eye.x} y2={eye.y} stroke="#4ade80" strokeDasharray="4 3" />
        <text x={eye.x + 4} y={eye.y} fontSize="16">
          👁️
        </text>
        <text x={14} y={20} fontSize="10" fill="white" fillOpacity="0.55">
          изглед отстрани (не в мащаб)
        </text>
        <text x={CX + 100} y={CY + 4} fontSize="9" fill="#fbbf24" fillOpacity="0.9">
          прашен тор
        </text>
        <text x={CX + 12} y={CY - 125} fontSize="9" fill="#7dd3fc">
          джет
        </text>
        <text x={CX - 95} y={CY - 98} fontSize="9" fill="#c4b5fd">
          тесни линии
        </text>

        {/* Спектър */}
        <text x={SX0} y={SY0 - 28} fontSize="13" fontWeight="700" fill="#f0abfc">
          {cls.name}
        </text>
        <text x={SX0} y={SY0 - 12} fontSize="10" fill="white" fillOpacity="0.7">
          ъгъл спрямо джета: {fmt(theta, 0)}°
        </text>
        <rect x={SX0} y={SY0} width={SX1 - SX0} height={SY1 - SY0} fill="#0b1120" stroke="white" strokeOpacity="0.2" />
        <polyline points={spectrum} fill="none" stroke="#fca5a5" strokeWidth="1.8" />
        <text x={SX0 + (SX1 - SX0) * (26.3 / 52)} y={SY1 + 14} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.6">
          Hα
        </text>
        <text x={SX1} y={SY1 + 28} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.5">
          дължина на вълната →
        </text>
        <text x={SX0} y={SY1 + 28} fontSize="9" fill="white" fillOpacity="0.5">
          спектър около Hα
        </text>
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">Ъгъл между зрителния лъч и джета: {theta}°</label>
      <input type="range" min="0" max="90" value={theta} onChange={e => setTheta(Number(e.target.value))} className="w-full" />
      <div className="flex justify-center mt-2">
        <label className="text-sm flex items-center gap-1">
          <input type="checkbox" checked={loud} onChange={e => setLoud(e.target.checked)} />
          има мощни джетове (радиоярък)
        </label>
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">{TEXT[cls.type]}</p>
    </div>
  );
}
