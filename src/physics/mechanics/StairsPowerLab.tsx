import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '../sim';

const G = 9.81;
const FLOOR = 3;
const HP = 735.5;

// За сравнение – приблизителни мощности
const REFERENCES: [string, number][] = [
  ['LED лампа', 10],
  ['крушка с нажежаема жичка', 60],
  ['лаптоп', 50],
  ['1 конска сила', HP],
  ['прахосмукачка', 1500],
  ['чайник', 2000],
];

const P_MAX = 2200;
const BX = { left: 200, right: 462 };
const bx = (P: number) => BX.left + (Math.min(P, P_MAX) / P_MAX) * (BX.right - BX.left);

/** Колко мощност развиваш, когато тичаш по стълбите: работата е mgh, мощността – работата за единица време. */
export default function StairsPowerLab() {
  const [m, setM] = useState(60);
  const [floors, setFloors] = useState(3);
  const [t, setT] = useState(10);
  const h = floors * FLOOR;
  const W = m * G * h;
  const P = W / t;
  // Мускулите превръщат в работа около една четвърт от енергията на храната
  const kcal = W / 0.25 / 4184;

  const stepW = 120 / floors;
  const stairs = Array.from({ length: floors }, (_, i) => `L ${20 + i * stepW} ${220 - (i + 1) * (180 / floors)} L ${20 + (i + 1) * stepW} ${220 - (i + 1) * (180 / floors)}`).join(' ');
  const rows = [...REFERENCES, ['ти', P] as [string, number]].sort((a, b) => a[1] - b[1]);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 240">
        {/* Стълбите */}
        <path d={`M 20 220 ${stairs} L 140 220 Z`} className="fill-gray-200 dark:fill-gray-700" />
        <text x={140 - stepW / 2} y={40 - 14} fontSize={24} textAnchor="middle" dominantBaseline="central">
          🏃
        </text>
        <line x1={160} y1={40} x2={160} y2={220} className="stroke-violet-500" strokeWidth="1.5" />
        <Label p={{ x: 166, y: 130 }} size={12} anchor="start" tone="violet">
          {`${h} m`}
        </Label>

        {/* Мощностите за сравнение */}
        {rows.map(([name, p], i) => {
          const y = 30 + i * 28;
          const me = name === 'ти';
          return (
            <g key={name}>
              <rect x={BX.left} y={y} width={bx(p) - BX.left} height={14} rx={3} className={me ? 'fill-rose-500' : 'fill-gray-300 dark:fill-gray-600'} />
              <Label p={{ x: BX.left + 4, y: y - 6 }} size={11} anchor="start" tone={me ? 'rose' : 'gray'}>
                {`${name} – ${fmtNum(p, 0)} W${p > P_MAX ? ' →' : ''}`}
              </Label>
            </g>
          );
        })}
      </ZoomingSvg>

      <Sliders>
        <Slider label="m, kg" value={m} onChange={setM} min={30} max={100} step={5} tone="blue" />
        <Slider label="етажи" value={floors} onChange={setFloors} min={1} max={10} step={1} tone="violet" />
        <Slider label="t, s" value={t} onChange={setT} min={5} max={120} step={1} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'W = mgh =', value: `${fmtNum(W / 1000, 1)} kJ`, tone: 'violet' },
            { label: 'P = W/t =', value: `${fmtNum(P, 0)} W`, tone: 'rose' },
            { label: '=', value: `${fmtNum(P / HP, 2)} к.с.` },
            { label: 'храна ≈', value: `${fmtNum(kcal, 1)} kcal` },
          ]}
        />
      </div>
      <Note tone="gray">
        {P >= HP
          ? 'Развиваш над една конска сила – но само за кратко. Конската сила е замислена като мощност, която кон поддържа продължително при работа.'
          : `Мощността ти стига за ${fmtNum(Math.floor(P / 60), 0)} крушки по 60 W.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Един етаж е около 3 m. Работата срещу тежестта зависи само от масата и височината, а мощността – и от това колко бързо се качваш.
        Тялото изразходва около 4 пъти повече енергия, отколкото е механичната работа, защото мускулите имат КПД около 25%; останалото става
        топлина.
      </p>
    </div>
  );
}
