import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

/** Приблизителен праг за различаване на две точки (mm) – закръглени стойности от класическите измервания. */
const REGIONS = [
  { name: 'връх на пръста', mm: 2 },
  { name: 'устна', mm: 5 },
  { name: 'длан', mm: 10 },
  { name: 'чело', mm: 15 },
  { name: 'стъпало', mm: 20 },
  { name: 'предмишница', mm: 35 },
  { name: 'гръб', mm: 40 },
  { name: 'прасец', mm: 45 },
];

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

// чертеж: кожа вляво, стълбчета вдясно
const SX0 = 16;
const SX1 = 396;
const SY0 = 40;
const SY1 = 250;
const BX0 = 500;
const BX1 = 606;

/**
 * Различаване на две точки. Опростен модел: рецептивните полета са в квадратна мрежа със стъпка s = праг / 1,5;
 * всяко острие дразни най-близкото поле, така че две точки се усещат точно от прага нагоре. Две точки се усещат, ако между дразнените полета има поне едно недразнено.
 */
export default function TwoPointLab() {
  const [r, setR] = useState(2);
  const [d, setD] = useState(12);

  const region = REGIONS[r];
  const s = region.mm / 1.5; // стъпка на мрежата, mm
  const view = Math.max(4 * region.mm, d * 1.4 + 2 * s); // ширина на кожата на чертежа, mm
  const k = (SX1 - SX0) / view; // px на mm
  const cy = (SY0 + SY1) / 2;
  const x1 = SX0 + (view / 2 - d / 2) * k;
  const x2 = x1 + d * k;
  // мрежата е подредена така, че първото острие е в центъра на поле; второто дразни най-близкото до себе си поле
  const step = s * k;
  const gap = Math.round(d / s);
  const two = gap >= 2;
  const iMin = -Math.ceil((x1 - SX0) / step) - 1;
  const iMax = Math.ceil((SX1 - x1) / step) + 1;
  const jMax = Math.ceil((SY1 - SY0) / 2 / step) + 1;
  const backRatio = (40 / region.mm) ** 2;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 290" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <clipPath id="tp-skin">
            <rect x={SX0} y={SY0} width={SX1 - SX0} height={SY1 - SY0} rx={10} />
          </clipPath>
        </defs>
        <text x={SX0} y={24} fontSize="13" fontWeight="700" fill="currentColor">
          кожа: {region.name}
        </text>
        <rect x={SX0} y={SY0} width={SX1 - SX0} height={SY1 - SY0} rx={10} fill="#fde2d4" stroke="#e8b4a0" />
        <g clipPath="url(#tp-skin)">
          {Array.from({ length: iMax - iMin + 1 }, (_, a) =>
            Array.from({ length: 2 * jMax + 1 }, (_, b) => {
              const i = iMin + a;
              const j = b - jMax;
              const active = j === 0 && (i === 0 || i === gap);
              return (
                <circle
                  key={`${i}-${j}`}
                  cx={x1 + i * step}
                  cy={cy + j * step}
                  r={step * 0.62}
                  fill={active ? '#e11d48' : '#fb7185'}
                  fillOpacity={active ? 0.45 : 0.08}
                  stroke={active ? '#e11d48' : '#fb7185'}
                  strokeOpacity={active ? 1 : 0.5}
                />
              );
            }),
          )}
        </g>
        {/* пергел */}
        <line x1={x1} y1={cy} x2={(x1 + x2) / 2} y2={SY0 - 2} stroke="#475569" strokeWidth={2} />
        <line x1={x2} y1={cy} x2={(x1 + x2) / 2} y2={SY0 - 2} stroke="#475569" strokeWidth={2} />
        <circle cx={x1} cy={cy} r={4} fill="#0f172a" />
        <circle cx={x2} cy={cy} r={4} fill="#0f172a" />
        {/* мащаб 10 mm */}
        <line x1={SX0 + 8} x2={SX0 + 8 + 10 * k} y1={SY1 + 18} y2={SY1 + 18} stroke="currentColor" strokeWidth={2} />
        <text x={SX0 + 8 + 5 * k} y={SY1 + 34} fontSize="11" textAnchor="middle" fill="currentColor">10 mm</text>
        <text x={SX1} y={SY1 + 30} fontSize="14" fontWeight="700" textAnchor="end" fill={two ? '#059669' : '#d97706'}>
          усещане: {two ? 'две точки' : 'една точка'}
        </text>

        {/* праговете по тялото */}
        <text x={BX0 - 88} y={24} fontSize="12" fontWeight="700" fill="currentColor">праг, mm</text>
        {REGIONS.map((g, i) => {
          const y = 40 + i * 28;
          const w = (g.mm / 45) * (BX1 - BX0);
          return (
            <g key={g.name}>
              <text x={BX0 - 6} y={y + 12} fontSize="11" textAnchor="end" fill={i === r ? '#e11d48' : 'currentColor'} fontWeight={i === r ? 700 : 400}>
                {g.name}
              </text>
              <rect x={BX0} y={y} width={Math.max(w, 2)} height={16} rx={2} fill={i === r ? '#e11d48' : '#94a3b8'} />
              <text x={BX0 + Math.max(w, 2) + 3} y={y + 12} fontSize="10" fill="currentColor">{g.mm}</text>
            </g>
          );
        })}
      </LabSvg>

      <Buttons>
        {REGIONS.map((g, i) => (
          <DiagramButton key={g.name} active={i === r} onClick={() => setR(i)}>
            {g.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="d, mm" value={d} onChange={setD} min={0.5} max={60} step={0.5} tone="rose" />
      </Sliders>
      <Readout
        items={[
          { label: 'разстояние', value: `${fmt(d)} mm`, tone: 'rose' },
          { label: 'праг', value: `≈ ${region.mm} mm`, tone: 'violet' },
          { label: 'полета между', value: Math.max(0, gap - 1), tone: 'blue' },
          { label: 'гъстота спрямо гърба', value: `× ${fmt(backRatio, backRatio < 10 ? 1 : 0)}`, tone: 'emerald' },
        ]}
      />
      <Note tone={two ? 'emerald' : 'amber'}>
        {two
          ? `Двете остриета дразнят полета, между които има недразнено – мозъкът получава два отделни сигнала. На тази кожа рецептивните полета са около ${fmt(backRatio, 0)} пъти по-гъсти, отколкото на гърба.`
          : gap === 1
            ? 'Двете остриета дразнят съседни полета – сигналите се сливат и се усеща една (малко „размазана“) точка.'
            : 'И двете остриета са в едно и също рецептивно поле – мозъкът получава само един сигнал и усеща една точка.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Опит у дома: два молива с остри върхове, разтворени на 1–2 cm, и приятел със затворени очи. Докосни едновременно с двата
        върха или с един – на пръста ще познае почти винаги, на гърба – колкото при хвърляне на монета. Праговете са закръглени
        средни стойности; при различните хора и измервания те се различават. Моделът е опростен: истинските рецептивни полета се
        припокриват и са с различни размери.
      </p>
    </div>
  );
}
