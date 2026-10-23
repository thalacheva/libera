import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

/** Енергийна стойност, kJ/g. */
const KJ = { carbs: 17, fat: 37, protein: 17 };
/** Енергия в 1 kg мастна тъкан, kJ (около 7700 kcal – груба оценка). */
const FAT_TISSUE = 32000;
const KCAL = 4.184;

const PAL = [
  { v: 1.4, name: 'заседнал' },
  { v: 1.6, name: 'умерено активен' },
  { v: 1.8, name: 'активен' },
  { v: 2.0, name: 'спортист' },
];

/** Основна обмяна по Мифлин – Сейнт Жор, kcal на ден (за възрастни; при подрастващи – само ориентир). */
const bmrKcal = (m: number, h: number, age: number, male: boolean) => 10 * m + 6.25 * h - 5 * age + (male ? 5 : -161);

const fmt = (v: number, d = 0) => v.toFixed(d).replace('.', ',').replace('-', '−');

function bmiClass(b: number) {
  if (b < 18.5) return 'поднормено тегло';
  if (b < 25) return 'нормално тегло';
  if (b < 30) return 'наднормено тегло';
  return 'затлъстяване';
}

/** Енергиен баланс: колко изразходва тялото и колко получава с храната. */
export default function EnergyBalanceLab() {
  const [male, setMale] = useState(true);
  const [age, setAge] = useState(17);
  const [m, setM] = useState(65);
  const [h, setH] = useState(175);
  const [pal, setPal] = useState(1.6);
  const [carbs, setCarbs] = useState(330);
  const [fat, setFat] = useState(85);
  const [protein, setProtein] = useState(90);

  const bmr = bmrKcal(m, h, age, male) * KCAL;
  const spent = bmr * pal;
  const parts = [
    { name: 'въглехидрати', kj: carbs * KJ.carbs, color: '#f59e0b', rec: [45, 65] },
    { name: 'мазнини', kj: fat * KJ.fat, color: '#0ea5e9', rec: [20, 35] },
    { name: 'белтъци', kj: protein * KJ.protein, color: '#e11d48', rec: [10, 35] },
  ];
  const eaten = parts.reduce((s, p) => s + p.kj, 0);
  const balance = eaten - spent;
  const perWeek = (balance * 7) / FAT_TISSUE; // kg
  const bmi = m / (h / 100) ** 2;

  // ленти: 0 … 20 000 kJ
  const SC = 420 / 20000;
  let acc = 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 230" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={20} y={22} fontSize="12" fontWeight="700" fill="currentColor">
          Енергия за един ден, kJ
        </text>
        {/* изразходвана */}
        <text x={130} y={58} fontSize="12" textAnchor="end" fill="currentColor">
          изразходвана
        </text>
        <rect x={140} y={40} width={bmr * SC} height={26} fill="#a855f7" opacity={0.85} />
        <rect x={140 + bmr * SC} y={40} width={(spent - bmr) * SC} height={26} fill="#a855f7" opacity={0.4} />
        <text x={146} y={58} fontSize="11" fill="white" fontWeight="700">
          основна обмяна
        </text>
        <text x={140 + spent * SC + 6} y={58} fontSize="12" fontWeight="700" fill="currentColor">
          {fmt(spent)}
        </text>
        {/* приета */}
        <text x={130} y={104} fontSize="12" textAnchor="end" fill="currentColor">
          приета
        </text>
        {parts.map(p => {
          const x = 140 + acc * SC;
          acc += p.kj;
          return <rect key={p.name} x={x} y={86} width={p.kj * SC} height={26} fill={p.color} opacity={0.85} />;
        })}
        <text x={140 + eaten * SC + 6} y={104} fontSize="12" fontWeight="700" fill="currentColor">
          {fmt(eaten)}
        </text>
        {[0, 5000, 10000, 15000, 20000].map(v => (
          <g key={v}>
            <line x1={140 + v * SC} x2={140 + v * SC} y1={34} y2={122} className="stroke-gray-200 dark:stroke-gray-700" strokeDasharray="3 3" />
            <text x={140 + v * SC} y={136} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
              {v.toLocaleString('bg-BG')}
            </text>
          </g>
        ))}

        {/* дял на веществата спрямо препоръките */}
        <text x={20} y={166} fontSize="12" fontWeight="700" fill="currentColor">
          Дял от енергията и препоръчаният диапазон
        </text>
        {parts.map((p, k) => {
          const x = 20 + k * 205;
          const share = (p.kj / eaten) * 100;
          const ok = share >= p.rec[0] && share <= p.rec[1];
          const w = 180;
          return (
            <g key={p.name} transform={`translate(${x} 178)`}>
              <rect width={w} height={14} className="fill-gray-100 dark:fill-gray-700" />
              <rect x={(p.rec[0] / 100) * w} width={((p.rec[1] - p.rec[0]) / 100) * w} height={14} fill="#10b981" opacity={0.3} />
              <rect x={(Math.min(share, 100) / 100) * w - 2} y={-3} width={4} height={20} fill={p.color} />
              <text x={0} y={34} fontSize="11" fill={ok ? 'currentColor' : '#e11d48'}>
                {p.name}: {fmt(share)} % ({p.rec[0]}–{p.rec[1]})
              </text>
            </g>
          );
        })}
      </LabSvg>

      <Buttons>
        <DiagramButton active={male} onClick={() => setMale(true)}>
          момче / мъж
        </DiagramButton>
        <DiagramButton active={!male} onClick={() => setMale(false)}>
          момиче / жена
        </DiagramButton>
        {PAL.map(p => (
          <DiagramButton key={p.v} active={pal === p.v} onClick={() => setPal(p.v)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="възраст" value={age} onChange={setAge} min={14} max={70} step={1} tone="gray" />
        <Slider label="m, kg" value={m} onChange={setM} min={40} max={120} step={1} tone="violet" />
        <Slider label="h, cm" value={h} onChange={setH} min={145} max={200} step={1} tone="violet" />
        <Slider label="въгл. g" value={carbs} onChange={setCarbs} min={50} max={600} step={10} tone="amber" />
        <Slider label="мазн. g" value={fat} onChange={setFat} min={10} max={200} step={5} tone="blue" />
        <Slider label="белт. g" value={protein} onChange={setProtein} min={20} max={200} step={5} tone="rose" />
      </Sliders>

      <div className="mt-3">
        <Readout
          items={[
            { label: 'основна обмяна', value: `${fmt(bmr)} kJ (${fmt(bmr / KCAL)} kcal)`, tone: 'violet' },
            { label: 'баланс', value: `${balance > 0 ? '+' : ''}${fmt(balance)} kJ/ден`, tone: balance > 0 ? 'rose' : 'emerald' },
            { label: 'ИТМ', value: `${fmt(bmi, 1)} – ${bmiClass(bmi)}`, tone: 'blue' },
          ]}
        />
      </div>
      <Formula>
        Δm ≈ {balance > 0 ? '+' : ''}
        {fmt(balance)} · 7 / 32 000 ≈ {perWeek > 0 ? '+' : ''}
        {fmt(perWeek, 2)} kg на седмица
      </Formula>
      <Note tone={Math.abs(balance) < 400 ? 'emerald' : 'rose'}>
        {Math.abs(balance) < 400
          ? 'Приетата и изразходваната енергия са почти равни – теглото остава почти същото.'
          : balance > 0
            ? 'Излишната енергия се запасява – главно като мазнина в мастната тъкан.'
            : 'Тялото взема липсващата енергия от запасите си – първо от гликогена, после от мазнините.'}
        {age < 18 && ' Подрастващите растат, затова тяхната оценка е само ориентир, а ИТМ при тях се сравнява с таблици за възрастта.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Основната обмяна е по формулата на Мифлин – Сейнт Жор (в kcal: 10m + 6,25h − 5·години + 5 за мъже, − 161 за жени), умножена по
        4,184 за kJ. Общият разход е основната обмяна по коефициента на физическа активност. Енергия от храната: 17 kJ/g въглехидрати и
        белтъци, 37 kJ/g мазнини. 1 kg мастна тъкан – грубо 32 000 kJ. Всички числа са приблизителни.
      </p>
    </div>
  );
}
