import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

/** Интервалите с нормална полярност през последните 5,5 млн. години (приблизително), млн. години. */
const NORMAL: [number, number][] = [
  [0, 0.78],
  [0.99, 1.07],
  [1.78, 1.95],
  [2.58, 3.04],
  [3.11, 3.22],
  [3.33, 3.58],
  [4.19, 4.3],
  [4.49, 4.63],
  [4.8, 4.9],
  [4.99, 5.24],
];
const T_MAX = 5.5;
const isNormal = (age: number) => NORMAL.some(([a, b]) => age >= a && age < b);

const CHRONS: [string, number, number][] = [
  ['Брюн', 0, 0.78],
  ['Матуяма', 0.78, 2.58],
  ['Гаус', 2.58, 3.58],
  ['Гилберт', 3.58, 5.5],
];

const RIDGES = [
  { id: 'atl', name: 'Средноатлантически', half: 1.25, hidden: false },
  { id: 'epr', name: 'Източнотихоокеански', half: 7.5, hidden: false },
  { id: 'x', name: '❓ Непознат хребет', half: 3.4, hidden: true },
];

const W = 640;
const CX = W / 2;
/** Еднакъв мащаб за всички хребети: 0,7 px на km. */
const PX_KM = 0.7;

/** Магнитните ивици на океанското дъно: по ширината им се намира скоростта на спрединга. */
export default function MagneticStripesLab() {
  const [r, setR] = useState(0);
  const [probe, setProbe] = useState<number | null>(null);
  const [reveal, setReveal] = useState(false);
  const ridge = RIDGES[r];
  const hidden = ridge.hidden && !reveal;
  // Възраст на дъното на разстояние x km от оста; полускоростта е в cm/година, 1 cm/год = 10 km за 1 млн. години
  const ageAt = (km: number) => Math.abs(km) / (ridge.half * 10);
  const maxKm = (CX - 10) / PX_KM;
  const bmKm = 0.78 * ridge.half * 10;

  // Профил на магнитната аномалия по пътя на кораба (изгладена полярност)
  const xs = Array.from({ length: 301 }, (_, i) => 10 + (i * (W - 20)) / 300);
  const prof = xs.map(x => {
    let s = 0;
    for (let d = -6; d <= 6; d++) {
      const age = ageAt((x + d * 2 - CX) / PX_KM);
      s += age > T_MAX ? 0 : isNormal(age) ? 1 : -1;
    }
    return s / 13;
  });

  const click = (e: React.MouseEvent<SVGSVGElement>) => {
    const m = e.currentTarget.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    if (p.y > 30 && p.y < 160) setProbe((p.x - CX) / PX_KM);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} 300`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100 cursor-crosshair" onClick={click}>
        {/* Ивиците по дъното, гледани отгоре */}
        {xs.slice(1).map((x, i) => {
          const age = ageAt((x - CX) / PX_KM);
          return <rect key={i} x={xs[i]} y={40} width={x - xs[i] + 0.5} height={90} className={age > T_MAX ? 'fill-gray-200 dark:fill-gray-700' : isNormal(age) ? 'fill-gray-900 dark:fill-gray-100' : 'fill-white dark:fill-gray-900'} />;
        })}
        <rect x={10} y={40} width={W - 20} height={90} fill="none" className="stroke-gray-400" />
        <line x1={CX} y1={32} x2={CX} y2={138} className="stroke-red-500" strokeWidth="3" />
        <text x={CX} y={26} fontSize="11" textAnchor="middle" className="fill-red-600 dark:fill-red-400">
          ос на хребета
        </text>
        {/* Мащаб */}
        {[-400, -300, -200, -100, 0, 100, 200, 300, 400].map(km => (
          <g key={km}>
            <line x1={CX + km * PX_KM} y1={130} x2={CX + km * PX_KM} y2={136} className="stroke-gray-500" />
            <text x={CX + km * PX_KM} y={147} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
              {Math.abs(km)}
            </text>
          </g>
        ))}
        <text x={W - 12} y={147} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          km
        </text>
        {probe !== null && Math.abs(probe) < maxKm && (
          <g>
            <line x1={CX + probe * PX_KM} y1={36} x2={CX + probe * PX_KM} y2={134} className="stroke-fuchsia-500" strokeWidth="2" />
            <text x={CX + probe * PX_KM + (probe > 0 ? -4 : 4)} y={56} fontSize="11" fontWeight="bold" textAnchor={probe > 0 ? 'end' : 'start'} className="fill-fuchsia-600">
              {fmt(Math.abs(probe))} km
            </text>
          </g>
        )}
        {/* Профил от магнитометъра на кораба */}
        <text x={12} y={166} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          магнитометър на кораба
        </text>
        <line x1={10} y1={195} x2={W - 10} y2={195} className="stroke-gray-300 dark:stroke-gray-600" />
        <path d={prof.map((v, i) => `${i ? 'L' : 'M'}${xs[i].toFixed(1)} ${(195 - v * 22).toFixed(1)}`).join('')} fill="none" className="stroke-sky-600 dark:stroke-sky-400" strokeWidth="1.8" />
        {/* Скала на магнитната полярност */}
        <text x={12} y={238} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          полярност през последните 5,5 млн. години (черно – като днес)
        </text>
        {Array.from({ length: 220 }, (_, i) => {
          const age = (i / 220) * T_MAX;
          return <rect key={i} x={10 + (i * (W - 20)) / 220} y={246} width={(W - 20) / 220 + 0.4} height={18} className={isNormal(age) ? 'fill-gray-900 dark:fill-gray-100' : 'fill-white dark:fill-gray-900'} />;
        })}
        <rect x={10} y={246} width={W - 20} height={18} fill="none" className="stroke-gray-400" />
        {CHRONS.map(([n, a, b]) => (
          <text key={n} x={10 + (((a + b) / 2) * (W - 20)) / T_MAX} y={280} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
            {n}
          </text>
        ))}
        {[0, 1, 2, 3, 4, 5].map(a => (
          <text key={a} x={10 + (a * (W - 20)) / T_MAX} y={294} fontSize="9" textAnchor="middle" className="fill-gray-400">
            {a}
          </text>
        ))}
      </LabSvg>
      <Buttons>
        {RIDGES.map((x, i) => (
          <DiagramButton
            key={x.id}
            active={r === i}
            onClick={() => {
              setR(i);
              setProbe(null);
              setReveal(false);
            }}
          >
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Щракни по ивиците, за да измериш разстоянието от оста. Последното обръщане на полето (границата Брюн – Матуяма) е преди 0,78 млн. години.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'избрано място', value: probe === null ? '—' : `${fmt(Math.abs(probe))} km от оста` },
            { label: 'възраст там', value: probe === null || hidden ? '?' : `${fmt(ageAt(probe), 2)} млн. г.` },
            { label: 'граница Брюн – Матуяма', value: hidden ? 'измери сам' : `${fmt(bmKm)} km`, tone: 'rose' },
            { label: 'скорост на разширяване', value: hidden ? '?' : `${fmt(ridge.half * 2, 1)} cm/год (по ${fmt(ridge.half, 2)} на всяка страна)`, tone: 'emerald' },
          ]}
        />
      </div>
      {ridge.hidden && (
        <>
          <Note tone="amber">Намери границата Брюн – Матуяма, раздели разстоянието на 0,78 млн. години и пресметни скоростта.</Note>
          <Buttons>
            <DiagramButton active={reveal} onClick={() => setReveal(!reveal)}>
              Покажи отговора
            </DiagramButton>
          </Buttons>
        </>
      )}
    </div>
  );
}
