import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

const C_IN = 3; // mmol/L вътре в клетката
const C_MAX = 10;

// Нетна скорост на навлизане (условни единици): положителна – навътре, отрицателна – навън
const simple = (c: number) => 0.4 * (c - C_IN);
const facilitated = (c: number) => 3 * (c / (1.5 + c) - C_IN / (1.5 + C_IN));
const active = (c: number, atp: boolean) => (atp ? (3 * c) / (1 + c) : 0);

const KINDS = [
  { name: 'проста дифузия', color: '#2563eb', f: (c: number) => simple(c) },
  { name: 'улеснена дифузия', color: '#16a34a', f: (c: number) => facilitated(c) },
  { name: 'активен транспорт', color: '#db2777', f: (c: number, atp: boolean) => active(c, atp) },
];

const GX = 60;
const GW = 270;
const GY = 16;
const GH = 190;
const Y_MIN = -2.5;
const Y_MAX = 3.5;
const gx = (c: number) => GX + (c / C_MAX) * GW;
const gy = (v: number) => GY + ((Y_MAX - v) / (Y_MAX - Y_MIN)) * GH;
const fmt = (v: number) => v.toFixed(2).replace('.', ',').replace('-', '−');

/** Как скоростта на транспорта зависи от концентрацията навън – за трите вида транспорт. */
export default function TransportRateLab() {
  const [c, setC] = useState(1);
  const [atp, setAtp] = useState(true);

  const curve = (k: number) =>
    Array.from({ length: 101 }, (_, i) => {
      const x = (i / 100) * C_MAX;
      return `${gx(x).toFixed(1)},${gy(KINDS[k].f(x, atp)).toFixed(1)}`;
    }).join(' ');
  const values = KINDS.map(k => k.f(c, atp));

  let note: string;
  if (c < C_IN) note = 'Отвън концентрацията е по-ниска, отколкото вътре: двете дифузии изнасят веществото навън. Само помпата го вкарва – срещу градиента.';
  else if (c > 7) note = 'При висока концентрация простата дифузия продължава да расте, а улеснената почти спира да расте – преносителите са заети (насищане).';
  else note = 'Отвън концентрацията е по-висока: и трите вида вкарват веществото, но с различна скорост.';
  if (!atp) note += ' Без АТФ (напр. при отравяне с цианид) помпата спира, а дифузиите продължават.';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 240" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <line x1={GX} x2={GX + GW} y1={gy(0)} y2={gy(0)} className="stroke-gray-400" />
        <line x1={GX} x2={GX} y1={GY} y2={GY + GH} className="stroke-gray-400" />
        <line x1={gx(C_IN)} x2={gx(C_IN)} y1={GY} y2={GY + GH} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="3 3" />
        <text x={gx(C_IN) + 4} y={GY + 12} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
          = вътре
        </text>
        {[0, 2, 4, 6, 8, 10].map(v => (
          <text key={v} x={gx(v)} y={GY + GH + 15} fontSize="11" textAnchor="middle" fill="currentColor">
            {v}
          </text>
        ))}
        <text x={GX + GW} y={GY + GH + 30} fontSize="11" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          концентрация отвън, mmol/L
        </text>
        <text x={GX - 8} y={gy(3) + 4} fontSize="11" textAnchor="end" fill="currentColor">
          навътре
        </text>
        <text x={GX - 8} y={gy(-1.5) + 4} fontSize="11" textAnchor="end" fill="currentColor">
          навън
        </text>
        {KINDS.map((k, i) => (
          <polyline key={k.name} points={curve(i)} fill="none" stroke={k.color} strokeWidth="2.5" />
        ))}
        <line x1={gx(c)} x2={gx(c)} y1={GY} y2={GY + GH} className="stroke-gray-500" />
        {values.map((v, i) => (
          <circle key={i} cx={gx(c)} cy={gy(v)} r="4.5" fill={KINDS[i].color} />
        ))}
        {KINDS.map((k, i) => (
          <g key={k.name} transform={`translate(350 ${50 + i * 46})`}>
            <rect x={0} y={-9} width={12} height={12} rx={3} fill={k.color} />
            <text x={18} y={1} fontSize="11" fill="currentColor">
              {k.name}
            </text>
            <text x={18} y={17} fontSize="12" fontWeight="700" fill="currentColor">
              {fmt(values[i])}
            </text>
          </g>
        ))}
      </LabSvg>

      <Sliders>
        <Slider label={`Отвън: ${c.toFixed(1).replace('.', ',')}`} value={c} onChange={setC} min={0} max={C_MAX} step={0.1} tone="rose" />
      </Sliders>
      <Buttons>
        <DiagramButton active={atp} onClick={() => setAtp(!atp)}>
          {atp ? '✓ има АТФ' : '✗ няма АТФ (цианид)'}
        </DiagramButton>
      </Buttons>
      <Note tone="violet">{note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Вътре концентрацията е {C_IN} mmol/L. Положителната скорост е навлизане в клетката, отрицателната – излизане. Кривите са от
        опростени модели в условни единици – важна е формата им: права, крива с насищане и крива, която не зависи от вътрешната концентрация.
      </p>
    </div>
  );
}
