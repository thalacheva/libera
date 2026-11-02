import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

/** ПЧР 2025 на ПРООН – данни за 2023 г.: продължителност на живота, очаквани и средни години обучение, БНД на човек (хил. $ по ППС от 2021 г.), ИЧР */
const COUNTRIES: {
  name: string;
  le: number;
  eys: number;
  mys: number;
  gni: number;
  hdi: number;
  row: number;
}[] = [
  {
    name: 'Исландия',
    le: 82.7,
    eys: 18.9,
    mys: 13.9,
    gni: 69.1,
    hdi: 0.972,
    row: 0,
  },
  {
    name: 'Норвегия',
    le: 83.3,
    eys: 18.8,
    mys: 13.1,
    gni: 112.7,
    hdi: 0.97,
    row: 2,
  },
  {
    name: 'Германия',
    le: 81.4,
    eys: 17.3,
    mys: 14.3,
    gni: 64.1,
    hdi: 0.959,
    row: 0,
  },
  {
    name: 'САЩ',
    le: 79.3,
    eys: 15.9,
    mys: 13.9,
    gni: 73.7,
    hdi: 0.938,
    row: 1,
  },
  {
    name: 'Япония',
    le: 84.7,
    eys: 15.5,
    mys: 12.7,
    gni: 47.8,
    hdi: 0.925,
    row: 0,
  },
  {
    name: 'Гърция',
    le: 81.9,
    eys: 20.8,
    mys: 11.6,
    gni: 35.8,
    hdi: 0.908,
    row: 3,
  },
  {
    name: 'Турция',
    le: 77.2,
    eys: 19.8,
    mys: 9.0,
    gni: 34.5,
    hdi: 0.853,
    row: 1,
  },
  {
    name: 'България',
    le: 75.6,
    eys: 15.3,
    mys: 11.5,
    gni: 32.2,
    hdi: 0.845,
    row: 2,
  },
  {
    name: 'Китай',
    le: 78.0,
    eys: 15.5,
    mys: 8.0,
    gni: 22.0,
    hdi: 0.797,
    row: 1,
  },
  {
    name: 'Свят',
    le: 73.4,
    eys: 13.0,
    mys: 8.8,
    gni: 20.3,
    hdi: 0.756,
    row: 2,
  },
  {
    name: 'Индия',
    le: 72.0,
    eys: 13.0,
    mys: 6.9,
    gni: 9.0,
    hdi: 0.685,
    row: 1,
  },
  {
    name: 'Нигерия',
    le: 54.5,
    eys: 10.5,
    mys: 7.6,
    gni: 5.6,
    hdi: 0.56,
    row: 2,
  },
  { name: 'Нигер', le: 61.2, eys: 8.3, mys: 1.4, gni: 1.6, hdi: 0.419, row: 1 },
  {
    name: 'Южен Судан',
    le: 57.6,
    eys: 5.6,
    mys: 5.7,
    gni: 0.69,
    hdi: 0.388,
    row: 2,
  },
];

const PRESETS = ['Норвегия', 'България', 'Китай', 'Индия', 'Нигер', 'Свят'];

const clamp = (v: number) => Math.max(0, Math.min(1, v));
function hdiParts(le: number, eys: number, mys: number, gniK: number) {
  const health = clamp((le - 20) / 65);
  const edu = (clamp(eys / 18) + clamp(mys / 15)) / 2;
  const income = clamp(
    (Math.log(gniK * 1000) - Math.log(100)) / (Math.log(75_000) - Math.log(100))
  );
  return {
    health,
    edu,
    income,
    hdi: Math.cbrt(health * edu * income),
    mean: (health + edu + income) / 3,
  };
}

const category = (h: number) =>
  h >= 0.8
    ? 'много висок'
    : h >= 0.7
      ? 'висок'
      : h >= 0.55
        ? 'среден'
        : 'нисък';

// Скала на ИЧР долу
const S0 = 0.35;
const S1 = 1;
const SX = (h: number) => 30 + ((h - S0) / (S1 - S0)) * 580;
const BANDS: [number, number, string][] = [
  [0.35, 0.55, 'fill-rose-100 dark:fill-rose-950'],
  [0.55, 0.7, 'fill-amber-100 dark:fill-amber-950'],
  [0.7, 0.8, 'fill-sky-100 dark:fill-sky-950'],
  [0.8, 1, 'fill-emerald-100 dark:fill-emerald-950'],
];

/** Индекс на човешкото развитие: три измерения, граници (goalposts) и средно геометрично. */
export default function HdiLab() {
  const [le, setLe] = useState(75.6);
  const [eys, setEys] = useState(15.3);
  const [mys, setMys] = useState(11.5);
  const [gni, setGni] = useState(32);
  const p = hdiParts(le, eys, mys, gni);
  const set = (name: string) => {
    const c = COUNTRIES.find(q => q.name === name);
    if (!c) return;
    setLe(c.le);
    setEys(c.eys);
    setMys(c.mys);
    setGni(c.gni);
  };
  const active = COUNTRIES.find(
    c =>
      Math.abs(c.le - le) < 0.05 &&
      Math.abs(c.eys - eys) < 0.05 &&
      Math.abs(c.mys - mys) < 0.05
  );

  const bars: [string, number, string][] = [
    ['здраве', p.health, 'fill-rose-500'],
    ['образование', p.edu, 'fill-violet-500'],
    ['доход', p.income, 'fill-amber-500'],
    ['ИЧР', p.hdi, 'fill-emerald-600'],
  ];
  const BX = 120;
  const BW = 400;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg
        viewBox="0 0 640 304"
        className="w-full h-auto block select-none text-gray-800 dark:text-gray-100"
      >
        {/* Индексите */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => (
          <g key={t}>
            <line
              x1={BX + t * BW}
              y1={14}
              x2={BX + t * BW}
              y2={166}
              className="stroke-gray-200 dark:stroke-gray-700"
            />
            <text
              x={BX + t * BW}
              y={180}
              fontSize="9.5"
              textAnchor="middle"
              className="fill-gray-500 dark:fill-gray-400"
            >
              {fmt(t, 2)}
            </text>
          </g>
        ))}
        {bars.map(([label, v, cls], k) => (
          <g key={label}>
            <text
              x={BX - 8}
              y={34 + k * 38}
              fontSize="11.5"
              textAnchor="end"
              className={`fill-gray-700 dark:fill-gray-200 ${k === 3 ? 'font-semibold' : ''}`}
            >
              {label}
            </text>
            <rect
              x={BX}
              y={20 + k * 38}
              width={Math.max(1, v * BW)}
              height={22}
              rx={3}
              className={cls}
            />
            <text
              x={BX + v * BW + 6}
              y={35 + k * 38}
              fontSize="11.5"
              className="fill-gray-900 dark:fill-gray-100 font-medium"
            >
              {fmt(v, 3)}
            </text>
          </g>
        ))}
        {/* Средно аритметично за сравнение */}
        <line
          x1={BX + p.mean * BW}
          y1={128}
          x2={BX + p.mean * BW}
          y2={170}
          className="stroke-gray-900 dark:stroke-gray-100"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
        <text
          x={BX + p.mean * BW}
          y={124}
          fontSize="9.5"
          textAnchor="middle"
          className="fill-gray-700 dark:fill-gray-200"
        >
          средно аритметично {fmt(p.mean, 3)}
        </text>

        {/* Скала на ИЧР с държавите */}
        {BANDS.map(([a, b, cls]) => (
          <rect
            key={a}
            x={SX(a)}
            y={212}
            width={SX(b) - SX(a)}
            height={30}
            className={cls}
          />
        ))}
        {[0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map(t => (
          <text
            key={t}
            x={SX(t)}
            y={256}
            fontSize="9"
            textAnchor="middle"
            className="fill-gray-500 dark:fill-gray-400"
          >
            {fmt(t, 1)}
          </text>
        ))}
        {['нисък', 'среден', 'висок', 'много висок'].map((t, k) => (
          <text
            key={t}
            x={(SX(BANDS[k][0]) + SX(BANDS[k][1])) / 2}
            y={208}
            fontSize="9"
            textAnchor="middle"
            className="fill-gray-500 dark:fill-gray-400"
          >
            {t}
          </text>
        ))}
        {COUNTRIES.map(c => (
          <g key={c.name}>
            <circle
              cx={SX(c.hdi)}
              cy={227}
              r={3}
              className="fill-gray-600 dark:fill-gray-300"
            />
            <title>{`${c.name}: ${fmt(c.hdi, 3)}`}</title>
            {c.row > 0 && (
              <text
                x={SX(c.hdi)}
                y={258 + c.row * 12}
                fontSize="8.5"
                textAnchor={c.hdi > 0.95 ? 'end' : 'middle'}
                className={`${c.name === 'България' ? 'fill-emerald-700 dark:fill-emerald-300 font-semibold' : 'fill-gray-500 dark:fill-gray-400'}`}
              >
                {c.name}
              </text>
            )}
          </g>
        ))}
        <circle
          cx={SX(Math.max(S0, p.hdi))}
          cy={227}
          r={6}
          className="fill-emerald-500 stroke-white dark:stroke-gray-900"
          strokeWidth="2"
        />
      </LabSvg>
      <Buttons>
        {PRESETS.map(n => (
          <DiagramButton
            key={n}
            active={active?.name === n}
            onClick={() => set(n)}
          >
            {n}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider
          label="живот"
          value={le}
          onChange={setLe}
          min={40}
          max={88}
          step={0.1}
          tone="rose"
        />
        <Slider
          label="очакв."
          value={eys}
          onChange={setEys}
          min={2}
          max={22}
          step={0.1}
          tone="violet"
        />
        <Slider
          label="средни"
          value={mys}
          onChange={setMys}
          min={0.5}
          max={15}
          step={0.1}
          tone="violet"
        />
        <Slider
          label="БНД"
          value={gni}
          onChange={setGni}
          min={0.5}
          max={120}
          step={0.5}
          tone="amber"
        />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        живот – очаквана продължителност на живота при раждане (години); очакв.
        и средни – очаквани години обучение за детето днес и средни години
        обучение на възрастните; БНД – брутен национален доход на човек в хиляди
        долара по ППС. Точките на скалата са по Доклада за човешкото развитие
        2025 (данни за 2023 г.).
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'ИЧР', value: fmt(p.hdi, 3), tone: 'emerald' },
            { label: 'категория', value: category(p.hdi), tone: 'blue' },
            { label: 'аритм. средно', value: fmt(p.mean, 3), tone: 'gray' },
            {
              label: 'най-слабо',
              value:
                p.health <= p.edu && p.health <= p.income
                  ? 'здраве'
                  : p.edu <= p.income
                    ? 'образование'
                    : 'доход',
              tone: 'rose',
            },
          ]}
        />
      </div>
      <Note tone={p.hdi >= 0.8 ? 'emerald' : p.hdi >= 0.55 ? 'amber' : 'rose'}>
        {p.mean - p.hdi > 0.02
          ? `Средното геометрично (${fmt(p.hdi, 3)}) е по-ниско от аритметичното (${fmt(p.mean, 3)}): слабото измерение тегли надолу и не може да се „компенсира“ изцяло с другите.`
          : 'Трите индекса са близки, затова средното геометрично почти съвпада с аритметичното.'}{' '}
        {gni >= 75
          ? 'Над 75 000 $ индексът на дохода е 1 – по-нататъшното забогатяване не вдига ИЧР.'
          : 'Доходът влиза с логаритъм: удвояването му вдига индекса на дохода винаги с около 0,105, независимо от началото.'}
      </Note>
    </div>
  );
}
