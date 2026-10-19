import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { FAMILIES, signed, solveOxidation, supSigned } from './redoxData';

const MIN = -4;
const MAX = 7;
const X0 = 36;
const STEP = 37; // px на единица; −4 → 36, +7 → 443
const xOf = (v: number) => X0 + (v - MIN) * STEP;

/** Дроб като текст: 8/3 → „+8/3“. */
function fracText(v: number) {
  if (Number.isInteger(v)) return signed(v);
  for (let d = 2; d <= 6; d++) {
    const n = Math.round(v * d);
    if (Math.abs(n / d - v) < 1e-9) return `${n > 0 ? '+' : '−'}${Math.abs(n)}/${d}`;
  }
  return v.toFixed(2);
}

/** Стълбица на степените на окисление: всички съединения на един елемент, подредени от −4 до +7. */
export default function OxidationLadderLab() {
  const [fi, setFi] = useState(0);
  const [si, setSi] = useState(FAMILIES[0].species.length - 1);
  const fam = FAMILIES[fi];
  const sp = fam.species[Math.min(si, fam.species.length - 1)];
  const sol = solveOxidation(sp);

  // Етикетите – на редове, за да не се застъпват
  const rowsEnd: number[] = [];
  const placed = fam.species
    .map((s, i) => ({ s, i, ox: solveOxidation(s).ox }))
    .sort((a, b) => a.ox - b.ox)
    .map(p => {
      const label = fam.el === '*' ? `${p.s.text}: ${p.s.el}` : p.s.text;
      const w = label.length * 7.5 + 14;
      const x = xOf(p.ox);
      let row = 0;
      while (rowsEnd[row] !== undefined && rowsEnd[row] > x - w / 2 - 4) row++;
      rowsEnd[row] = x + w / 2;
      return { ...p, label, x, w, row };
    });
  const AXIS_Y = 64 + rowsEnd.length * 30;

  const values = fam.species.map(s => solveOxidation(s).ox);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const role =
    fam.el === '*'
      ? null
      : sol.ox === lo
        ? 'Това е най-ниската степен на елемента тук: той може само да отдава електрони – тук е само редуктор.'
        : sol.ox === hi
          ? 'Това е най-високата степен тук: елементът може само да приема електрони – тук е само окислител.'
          : 'Междинна степен: според партньора частицата може да е и окислител, и редуктор.';

  const terms = sol.parts.map(p => `${p.count > 1 ? `${p.count} · ` : ''}(${signed(p.ox)})`);
  const unknown = `${sol.n > 1 ? `${sol.n}x` : 'x'}`;
  const equation = `${[...terms, unknown].join(' + ')} = ${signed(sol.charge)}`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {FAMILIES.map((f, i) => (
          <DiagramButton
            key={f.el}
            active={i === fi}
            onClick={() => {
              setFi(i);
              setSi(f.species.length - 1);
            }}
          >
            {f.el === '*' ? 'изключения' : `${f.el} – ${f.name}`}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox={`0 0 480 ${AXIS_Y + 50}`} className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <defs>
          <linearGradient id="ox-ladder" x1="0" x2="1">
            <stop offset="0" stopColor="#38bdf8" />
            <stop offset="0.36" stopColor="#d1d5db" />
            <stop offset="1" stopColor="#f43f5e" />
          </linearGradient>
        </defs>
        <rect x={xOf(MIN) - 8} y={AXIS_Y - 4} width={xOf(MAX) - xOf(MIN) + 16} height={8} rx={4} fill="url(#ox-ladder)" />
        {Array.from({ length: MAX - MIN + 1 }, (_, k) => MIN + k).map(v => (
          <g key={v}>
            <line x1={xOf(v)} x2={xOf(v)} y1={AXIS_Y - 8} y2={AXIS_Y + 8} className="stroke-gray-500" strokeWidth="1.5" />
            <text x={xOf(v)} y={AXIS_Y + 24} fontSize="12" textAnchor="middle" fill="currentColor">
              {signed(v)}
            </text>
          </g>
        ))}
        <text x={xOf(MIN) - 8} y={AXIS_Y + 42} fontSize="11" className="fill-sky-600 dark:fill-sky-400">
          ← приема електрони (редукция)
        </text>
        <text x={xOf(MAX) + 8} y={AXIS_Y + 42} fontSize="11" textAnchor="end" className="fill-rose-600 dark:fill-rose-400">
          отдава електрони (окисление) →
        </text>

        {placed.map(p => {
          const y = AXIS_Y - 30 - p.row * 30;
          const active = p.s === sp;
          return (
            <g key={p.s.text} onClick={() => setSi(p.i)} className="cursor-pointer">
              <line x1={p.x} x2={p.x} y1={y + 10} y2={AXIS_Y - 6} className="stroke-gray-400" strokeWidth="1" strokeDasharray="2 2" />
              <rect
                x={p.x - p.w / 2}
                y={y - 12}
                width={p.w}
                height={22}
                rx={6}
                className={active ? 'fill-amber-300 stroke-amber-600' : 'fill-gray-100 stroke-gray-300 dark:fill-gray-700 dark:stroke-gray-500'}
                strokeWidth="1.5"
              />
              <text x={p.x} y={y + 4} fontSize="13" fontWeight="600" textAnchor="middle" className={active ? 'fill-gray-900' : ''} fill={active ? undefined : 'currentColor'}>
                {p.label}
              </text>
            </g>
          );
        })}
        <text x={8} y={18} fontSize="11" className="fill-gray-500">
          Щракни върху формула
        </text>
      </LabSvg>

      <Buttons>
        {fam.species.map((s, i) => (
          <DiagramButton key={s.text} active={s === sp} onClick={() => setSi(i)}>
            {s.text}
          </DiagramButton>
        ))}
      </Buttons>

      <div className="mt-3">
        <Readout
          items={[
            { label: 'известни:', value: sol.parts.length ? sol.parts.map(p => `${p.el}${supSigned(p.ox)}`).join(', ') : 'няма – просто вещество', tone: 'blue' },
            { label: 'уравнение:', value: equation },
            { label: `${sp.el}:`, value: fracText(sol.ox), tone: 'rose' },
          ]}
        />
      </div>
      <Note tone="amber">{sp.note ?? role ?? ''}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Сборът от степените на окисление на всички атоми е равен на заряда на частицата (0 за неутрална молекула). Затова от известните
        степени (H +1, O −2, алкални метали +1, флуор −1) намираме неизвестната. Колкото по-надясно е частицата, толкова повече електрони
        „е отдал“ елементът.
      </p>
    </div>
  );
}
