import { useEffect, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

const R_CAP = 0.5; // радиус на капиляра, mm
const START = 70; // mm – началното място на капката
const T_MAX = 20; // min

const SAMPLES = [
  { name: 'прорастващ грах', rq: 1.0, rate: 2.0, dots: '#65a30d', note: 'Семената на граха са богати на нишесте – дишат въглехидрати, RQ ≈ 1.' },
  { name: 'прорастващ слънчоглед', rq: 0.7, rate: 1.6, dots: '#a16207', note: 'Слънчогледовите семена са богати на мазнини. Мазнините имат малко кислород в молекулата си и за окисляването им трябва повече O₂: RQ ≈ 0,7.' },
  { name: 'дрожди в захарен разтвор', rq: 1.5, rate: 1.0, dots: '#ca8a04', note: 'Дрождите дишат, но част от захарта ферментират – отделят CO₂ без да поемат O₂. Затова RQ > 1 и капката в тръбата с вода се отдалечава.' },
  { name: 'сварен грах (контрола)', rq: 0, rate: 0, dots: '#a3a3a3', note: 'Сварените семена са мъртви и не дишат – капката не мърда. Контролата показва, че движението в другите опити идва от дишането, а не от промени в температурата или налягането.' },
];

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',').replace('-', '−');

// Капилярът: 0 mm при тръбата, 100 mm вдясно
const CX = 175;
const CW = 440;
const cx = (mm: number) => CX + (mm / 100) * CW;

function Setup({ y, label, drop, dotColor, koh }: { y: number; label: string; drop: number; dotColor: string; koh: boolean }) {
  return (
    <g>
      <text x={20} y={y - 38} fontSize="12" fontWeight="700" fill="currentColor">
        {label}
      </text>
      {/* Епруветката */}
      <rect x={20} y={y - 28} width={150} height={56} rx={14} className="fill-sky-50 stroke-gray-400 dark:fill-sky-500/10" strokeWidth={1.5} />
      {/* Течността на дъното: KOH или вода */}
      <rect x={22} y={y + 12} width={146} height={14} rx={6} className={koh ? 'fill-violet-200 dark:fill-violet-500/40' : 'fill-sky-200 dark:fill-sky-500/40'} />
      <text x={95} y={y + 23} fontSize="10" textAnchor="middle" fill="currentColor">
        {koh ? 'KOH' : 'вода'}
      </text>
      {/* Мрежичка и семената */}
      <line x1={26} x2={164} y1={y + 8} y2={y + 8} className="stroke-gray-500" strokeDasharray="2 2" />
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={36 + i * 15} cy={y - 2 - (i % 2) * 8} r={6} fill={dotColor} />
      ))}
      {/* Капилярът със скалата */}
      <rect x={CX - 5} y={y - 4} width={CW + 10} height={8} className="fill-white stroke-gray-400 dark:fill-gray-900" />
      {Array.from({ length: 11 }, (_, i) => (
        <g key={i}>
          <line x1={cx(i * 10)} x2={cx(i * 10)} y1={y + 4} y2={y + 11} className="stroke-gray-500" />
          <text x={cx(i * 10)} y={y + 23} fontSize="10" textAnchor="middle" fill="currentColor">
            {i * 10}
          </text>
        </g>
      ))}
      <rect x={cx(drop) - 5} y={y - 4} width={10} height={8} rx={2} fill="#e11d48" />
      <line x1={cx(START)} x2={cx(START)} y1={y - 12} y2={y - 4} className="stroke-gray-400" strokeDasharray="2 2" />
    </g>
  );
}

/** Респирометър: две тръби – с KOH (поглъща CO₂) и с вода. От движението на капките – консумацията на O₂ и дихателният коефициент. */
export default function RespirometerLab() {
  const [sample, setSample] = useState(0);
  const [temp, setTemp] = useState(25);
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(false);
  const [shown, setShown] = useState(false);

  const s = SAMPLES[sample];
  const q10 = 2 ** ((temp - 25) / 10);
  const o2Rate = s.rate * q10; // mm/min в тръбата с KOH
  const x1 = Math.min(START, o2Rate * t);
  const x2 = Math.max(-(100 - START), Math.min(START, o2Rate * (1 - s.rq) * t));

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setT(v => {
        if (v >= T_MAX) {
          setRunning(false);
          return T_MAX;
        }
        return Math.min(T_MAX, Math.round((v + 0.1) * 10) / 10);
      });
    }, 40);
    return () => clearInterval(id);
  }, [running]);

  const reset = () => {
    setRunning(false);
    setT(0);
    setShown(false);
  };

  const area = Math.PI * R_CAP * R_CAP;
  const vO2 = area * x1;
  const vCO2 = area * (x1 - x2);
  const rq = x1 > 0 ? (x1 - x2) / x1 : null;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 250" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <Setup y={80} label="А: с KOH – капката мери само погълнатия O₂" drop={START - x1} dotColor={s.dots} koh />
        <Setup y={192} label="Б: с вода – капката мери разликата O₂ − CO₂" drop={START - x2} dotColor={s.dots} koh={false} />
        <text x={cx(100)} y={36} fontSize="10.5" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          капиляр, mm
        </text>
      </LabSvg>

      <Buttons>
        {SAMPLES.map((q, i) => (
          <DiagramButton key={q.name} active={sample === i} onClick={() => { setSample(i); reset(); }}>
            {q.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label={`${temp} °C`} value={temp} onChange={v => { setTemp(v); reset(); }} min={5} max={35} step={1} tone="rose" />
        <Slider label={`${fmt(t)} min`} value={t} onChange={v => { setRunning(false); setT(v); }} min={0} max={T_MAX} step={0.5} tone="blue" />
      </Sliders>
      <Buttons>
        <DiagramButton active={running} onClick={() => setRunning(r => !r && t < T_MAX)}>
          {running ? '⏸ Пауза' : '▶ Пусни часовника'}
        </DiagramButton>
        <DiagramButton onClick={reset}>Отначало</DiagramButton>
        <DiagramButton active={shown} onClick={() => setShown(v => !v)}>
          {shown ? 'Скрий сметката' : 'Покажи сметката'}
        </DiagramButton>
      </Buttons>

      <Readout
        items={[
          { label: 'А: x₁', value: `${fmt(x1)} mm`, tone: 'violet' },
          { label: 'Б: x₂', value: `${fmt(x2)} mm`, tone: 'blue' },
          { label: 't', value: `${fmt(t)} min` },
        ]}
      />
      {shown &&
        (t > 0 && x1 > 0 ? (
          <>
            <Formula>
              V(O₂) = πr²·x₁ = 3,14·{fmt(R_CAP)}²·{fmt(x1)} ≈ {fmt(vO2)} mm³ → {fmt(vO2 / t, 2)} mm³/min
            </Formula>
            <Formula>
              V(CO₂) = πr²·(x₁ − x₂) ≈ {fmt(vCO2)} mm³; RQ = (x₁ − x₂) / x₁ ≈ {rq === null ? '–' : fmt(rq, 2)}
            </Formula>
          </>
        ) : (
          <Formula>{t > 0 ? 'Капката не се е преместила – няма дишане.' : 'Пусни часовника.'}</Formula>
        ))}
      <Note tone="violet">{s.note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Радиусът на капиляра е {fmt(R_CAP)} mm. Положително x – капката се е придвижила към епруветката (газът в нея е намалял).
        KOH поглъща отделения CO₂, затова в А намалява само кислородът. Скоростта на дишането се удвоява при +10 °C (Q₁₀ ≈ 2) – колкото
        и при много ензимни реакции. Числата са от модел, не от истински опит.
      </p>
    </div>
  );
}
