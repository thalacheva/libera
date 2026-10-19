import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { gcd } from '~/drill';
import { Buttons, DiagramButton } from '~/geometry/diagram';
import { BALANCE } from './redoxData';

const STEPS = ['Степени на окисление', 'Окисление', 'Редукция', 'Електронен баланс', 'Коефициенти'];

/** Ред частици; от всяка излизат (или в нея влизат) по `e` електрона. */
function ParticleRow({ y, count, e, label, giving }: { y: number; count: number; e: number; label: string; giving: boolean }) {
  const gap = 440 / count;
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const cx = 20 + gap * (i + 0.5);
        return (
          <g key={i}>
            <circle cx={cx} cy={y} r={17} className={giving ? 'fill-sky-200 stroke-sky-600' : 'fill-rose-200 stroke-rose-600'} strokeWidth="1.5" />
            <text x={cx} y={y + 4} fontSize={label.length > 2 ? 10 : 12} fontWeight="700" textAnchor="middle" className="fill-gray-900">
              {label}
            </text>
            {Array.from({ length: e }, (_, k) => {
              // електроните – под частицата при отдаване и над нея при приемане
              const cols = e === 4 ? 2 : Math.min(e, 3);
              const col = k % cols;
              const row = Math.floor(k / cols);
              const ex = cx + (col - (cols - 1) / 2) * 10;
              const ey = giving ? y + 28 + row * 10 : y - 28 - row * 10;
              return <circle key={k} cx={ex} cy={ey} r={3.5} className="fill-amber-500" />;
            })}
          </g>
        );
      })}
    </g>
  );
}

/** Изравняване на окислително-редукционно уравнение с електронен баланс – стъпка по стъпка. */
export default function ElectronBalanceLab() {
  const [ri, setRi] = useState(0);
  const [step, setStep] = useState(0);
  const r = BALANCE[ri];
  const eo = r.oxidation.e;
  const er = r.reduction.e;
  const lcm = (eo * er) / gcd(eo, er);
  const ko = lcm / eo;
  const kr = lcm / er;

  const lines: React.ReactNode[] = [
    <>
      <span className="text-gray-500 dark:text-gray-400">Схема: </span>
      {r.scheme}
    </>,
    <>
      <span className="text-sky-700 dark:text-sky-300">окисление: </span>
      {r.oxidation.text} <span className="text-gray-500 dark:text-gray-400">– редуктор е {r.reducer}</span>
    </>,
    <>
      <span className="text-rose-700 dark:text-rose-300">редукция: </span>
      {r.reduction.text} <span className="text-gray-500 dark:text-gray-400">– окислител е {r.oxidizer}</span>
    </>,
    <>
      НОК({eo}, {er}) = {lcm}: окислението × {ko}, редукцията × {kr}
    </>,
    <>
      <strong>{r.final}</strong>
      <span className="block text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">{r.finish}</span>
    </>,
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {BALANCE.map((x, i) => (
          <DiagramButton
            key={x.name}
            active={i === ri}
            onClick={() => {
              setRi(i);
              setStep(0);
            }}
          >
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 220" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {step < 3 ? (
          <>
            <ParticleRow y={60} count={1} e={eo} label={r.oxidation.particle} giving />
            <ParticleRow y={170} count={1} e={er} label={r.reduction.particle} giving={false} />
            <text x={240} y={118} fontSize="13" textAnchor="middle" className="fill-gray-500">
              {step === 0 ? 'кой отдава и кой приема електрони?' : `една частица отдава ${eo} e⁻, другата приема ${er} e⁻ – не са равни`}
            </text>
          </>
        ) : (
          <>
            <ParticleRow y={40} count={ko} e={eo} label={r.oxidation.particle} giving />
            <ParticleRow y={180} count={kr} e={er} label={r.reduction.particle} giving={false} />
            <text x={240} y={115} fontSize="14" fontWeight="700" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400">
              ↓ {lcm} e⁻ ↓
            </text>
          </>
        )}
        <text x={472} y={16} fontSize="11" textAnchor="end" className="fill-sky-600 dark:fill-sky-400">
          {step >= 3 ? `${ko} × ${r.oxidation.particle}` : 'редуктор'}
        </text>
        <text x={472} y={214} fontSize="11" textAnchor="end" className="fill-rose-600 dark:fill-rose-400">
          {step >= 3 ? `${kr} × ${r.reduction.particle}` : 'окислител'}
        </text>
      </LabSvg>

      <ol className="mt-3 space-y-1.5 text-sm sm:text-base text-gray-800 dark:text-gray-100 max-w-xl mx-auto">
        {lines.slice(0, step + 1).map((l, i) => (
          <li key={i} className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <span className="min-w-0 break-words">{l}</span>
          </li>
        ))}
      </ol>

      <div className="flex justify-center gap-2 mt-3">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="px-3 py-1.5 rounded-lg border text-sm border-gray-200 dark:border-gray-700 disabled:opacity-40 text-gray-700 dark:text-gray-200"
        >
          ← назад
        </button>
        <button
          onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
          disabled={step === STEPS.length - 1}
          className="px-3 py-1.5 rounded-lg border text-sm border-amber-500 bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-200 disabled:opacity-40"
        >
          {step < STEPS.length - 1 ? `напред: ${STEPS[step + 1].toLowerCase()} →` : 'готово ✓'}
        </button>
      </div>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Броят на отдадените електрони трябва да е равен на броя на приетите – електрони не изчезват и не се появяват. Затова двете
        полуреакции се умножават до най-малкото общо кратно на електроните. Оранжевите точки са електроните: отдадените (под сините
        частици) отиват при приемащите (над червените).
      </p>
    </div>
  );
}
