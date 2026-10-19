import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

// Енергийни коефициенти от етикетите в ЕС (Регламент 1169/2011): kJ/g и kcal/g
const KJ = { carbs: 17, fat: 37, protein: 17 };
const KCAL = { carbs: 4, fat: 9, protein: 4 };

/** Ориентировъчен състав на 100 g (типични стойности от етикети и таблици). */
const FOODS: { name: string; carbs: number; fat: number; protein: number; portion: number }[] = [
  { name: 'прясно мляко 3,6%', carbs: 4.7, fat: 3.6, protein: 3.2, portion: 250 },
  { name: 'бял хляб', carbs: 49, fat: 3.2, protein: 9, portion: 50 },
  { name: 'банан', carbs: 23, fat: 0.3, protein: 1.1, portion: 120 },
  { name: 'бяло саламурено сирене', carbs: 1, fat: 21, protein: 17, portion: 50 },
  { name: 'млечен шоколад', carbs: 57, fat: 30, protein: 7.5, portion: 25 },
  { name: 'орехи', carbs: 7, fat: 65, protein: 15, portion: 30 },
];

const fmt = (v: number) => (Math.round(v * 10) / 10).toString().replace('.', ',');

/** Енергийна стойност на храна от състава ѝ: въглехидрати, мазнини и белтъци. */
export default function FoodEnergyLab() {
  const [fi, setFi] = useState(0);
  const [carbs, setCarbs] = useState(FOODS[0].carbs);
  const [fat, setFat] = useState(FOODS[0].fat);
  const [protein, setProtein] = useState(FOODS[0].protein);
  const [portion, setPortion] = useState(FOODS[0].portion);

  const choose = (i: number) => {
    const f = FOODS[i];
    setFi(i);
    setCarbs(f.carbs);
    setFat(f.fat);
    setProtein(f.protein);
    setPortion(f.portion);
  };
  const over = carbs + fat + protein > 100;

  const k = portion / 100;
  const parts = [
    { key: 'carbs', label: 'въглехидрати', g: carbs * k, kj: KJ.carbs * carbs * k, cls: 'fill-amber-400' },
    { key: 'fat', label: 'мазнини', g: fat * k, kj: KJ.fat * fat * k, cls: 'fill-rose-400' },
    { key: 'protein', label: 'белтъци', g: protein * k, kj: KJ.protein * protein * k, cls: 'fill-sky-400' },
  ];
  const total = parts.reduce((s, p) => s + p.kj, 0);
  const kcal = (KCAL.carbs * carbs + KCAL.fat * fat + KCAL.protein * protein) * k;
  const per100 = KJ.carbs * carbs + KJ.fat * fat + KJ.protein * protein;

  // Лента: 3000 kJ = цялата ширина
  const scale = 400 / Math.max(3000, total);
  let x = 40;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {FOODS.map((f, i) => (
          <DiagramButton key={f.name} active={i === fi} onClick={() => choose(i)}>
            {f.name}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 120" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <text x={40} y={20} fontSize="12" fontWeight="600" fill="currentColor">
          Енергия на порцията ({portion} g): {Math.round(total)} kJ
        </text>
        <rect x={40} y={30} width={400} height={36} className="fill-gray-100 dark:fill-gray-700" />
        {parts.map(p => {
          const w = p.kj * scale;
          const el = (
            <g key={p.key}>
              <rect x={x} y={30} width={w} height={36} className={p.cls} />
              {w > 46 && (
                <text x={x + w / 2} y={53} fontSize="11" fontWeight="700" textAnchor="middle" className="fill-gray-900">
                  {Math.round(p.kj)} kJ
                </text>
              )}
            </g>
          );
          x += w;
          return el;
        })}
        {parts.map((p, i) => (
          <g key={`l${p.key}`}>
            <rect x={40 + i * 135} y={84} width={12} height={12} className={p.cls} />
            <text x={58 + i * 135} y={94} fontSize="11" fill="currentColor">
              {p.label} {fmt(p.g)} g
            </text>
          </g>
        ))}
      </LabSvg>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3">Състав на 100 g (грамове въглехидрати, мазнини и белтъци) и порция в грамове:</p>
      <Sliders>
        <Slider label="въгл." value={carbs} onChange={setCarbs} min={0} max={100} step={0.5} tone="amber" />
        <Slider label="мазн." value={fat} onChange={setFat} min={0} max={100} step={0.5} tone="rose" />
        <Slider label="белт." value={protein} onChange={setProtein} min={0} max={100} step={0.5} tone="blue" />
        <Slider label="порц." value={portion} onChange={setPortion} min={10} max={300} step={5} tone="emerald" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'на 100 g:', value: `${fmt(per100)} kJ`, tone: 'blue' },
            { label: 'порция:', value: `${fmt(total)} kJ ≈ ${fmt(kcal)} kcal`, tone: 'emerald' },
            { label: 'дял на мазнините:', value: total ? `${fmt((100 * parts[1].kj) / total)}% от енергията` : '–' },
          ]}
        />
      </div>
      <Note tone={over ? 'amber' : 'emerald'}>
        {over
          ? 'Сборът е над 100 g на 100 g – такава храна не съществува. Намали някоя съставка.'
          : 'Остатъкът до 100 g е вода, фибри и минерални вещества – те почти не дават енергия.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Етикетите в ЕС смятат с 17 kJ (4 kcal) за грам въглехидрати и белтъци и 37 kJ (9 kcal) за грам мазнини. Затова храните, богати
        на мазнини – ядки, шоколад, олио, – са най-калорични. Съставът тук е ориентировъчен; реалните продукти се различават.
      </p>
    </div>
  );
}
