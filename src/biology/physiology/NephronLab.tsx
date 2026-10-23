import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

/** Осмотично активни вещества, които бъбреците изхвърлят за денонощие, mOsm (урея, соли…). */
const SOLUTES = 700;

/** Осмолалитет на междуклетъчната течност на дъното на мозъчното вещество, mOsm/kg – с АДХ (a = 1) около 1200. */
const medulla = (a: number) => 600 + 600 * a;
/** Осмолалитет на урината: без АДХ ~60, с много АДХ – колкото на дъното на мозъчното вещество. */
const urineOsm = (a: number) => 60 + (medulla(a) - 60) * a;

type Station = { name: string; x: number; y: number; v: (a: number) => number; osm: (a: number) => number; info: string[] };

const STATIONS: Station[] = [
  {
    name: 'Капсула на Боуман',
    x: 92,
    y: 74,
    v: () => 180,
    osm: () => 300,
    info: [
      'Кръвното налягане в гломерула притиска плазмата през стените на капилярите и капсулата – филтрация.',
      'Филтратът е плазма без клетки и без едрите белтъци: вода, глюкоза, аминокиселини, соли, урея.',
      'Около 125 mL в минута – 180 L за денонощие.',
    ],
  },
  {
    name: 'Проксимално каналче',
    x: 236,
    y: 136,
    v: () => 60,
    osm: () => 300,
    info: [
      'Обратно се поемат около 2/3 от водата и Na⁺, цялата глюкоза и аминокиселините и повечето HCO₃⁻.',
      'Водата следва солите с осмоза, затова концентрацията на филтрата не се променя (300 mOsm/kg).',
      'Секретират се H⁺, NH₄⁺, някои лекарства (пеницилин) и PAH.',
    ],
  },
  {
    name: 'Връх на примката на Хенле',
    x: 258,
    y: 320,
    v: () => 36,
    osm: a => medulla(a),
    info: [
      'Низходящото коляно пропуска вода, но почти не пропуска соли.',
      'Около него междуклетъчната течност е все по-солена – водата излиза с осмоза и филтратът се концентрира.',
      'Концентрацията на върха е колкото на мозъчното вещество около него.',
    ],
  },
  {
    name: 'Начало на дисталното каналче',
    x: 312,
    y: 112,
    v: () => 36,
    osm: () => 100,
    info: [
      'Възходящото коляно не пропуска вода, а дебелата му част активно изпомпва Na⁺ и Cl⁻ навън.',
      'Филтратът се разрежда до около 100 mOsm/kg, а мозъчното вещество се засолява – това е „множителят“.',
      'В дисталното каналче алдостеронът засилва поемането на Na⁺ и отделянето на K⁺.',
    ],
  },
  {
    name: 'Урина',
    x: 430,
    y: 330,
    v: a => SOLUTES / urineOsm(a),
    osm: a => urineOsm(a),
    info: [
      'Събирателната тръбичка минава отново през солената медула.',
      'АДХ вгражда аквапорини в стените ѝ: водата излиза и урината се концентрира почти до осмолалитета на дъното на медулата.',
      'Без АДХ стените не пропускат вода и урината остава разредена и обилна.',
    ],
  },
];

const PRESETS = [
  { name: 'изпих 2 L вода', a: 0.08 },
  { name: 'нормално', a: 0.5 },
  { name: 'жажда', a: 1 },
  { name: 'без АДХ', a: 0 },
];

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

// Мозъчното вещество: от y = 160 (300 mOsm/kg) до y = 340 (дъното)
const MED_TOP = 160;
const MED_BOT = 340;

/** Нефрон: проследи филтрата и виж как АДХ променя количеството и концентрацията на урината. */
export default function NephronLab() {
  const [a, setA] = useState(0.5);
  const [sel, setSel] = useState(4);

  const deep = medulla(a);
  const urine = SOLUTES / urineOsm(a);
  const st = STATIONS[sel];
  // цвят на солеността: по-тъмно = по-солено
  const shade = (osm: number) => Math.min(1, Math.max(0, (osm - 250) / 1000));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 360" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <linearGradient id="nephron-medulla" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f59e0b" stopOpacity={0.08} />
            <stop offset="1" stopColor="#f59e0b" stopOpacity={0.1 + 0.45 * shade(deep)} />
          </linearGradient>
        </defs>
        {/* кора и мозъчно вещество */}
        <rect x={20} y={20} width={450} height={MED_TOP - 20} fill="#fb7185" opacity={0.07} />
        <rect x={20} y={MED_TOP} width={450} height={MED_BOT - MED_TOP} fill="url(#nephron-medulla)" />
        <text x={28} y={36} fontSize="12" className="fill-gray-500 dark:fill-gray-400">кора</text>
        <text x={28} y={MED_TOP + 16} fontSize="12" className="fill-gray-500 dark:fill-gray-400">мозъчно вещество</text>

        {/* скала на осмолалитета вдясно */}
        <text x={490} y={MED_TOP - 22} fontSize="12" fontWeight="700" fill="currentColor">солеността</text>
        <text x={490} y={MED_TOP - 8} fontSize="11" className="fill-gray-500 dark:fill-gray-400">около нефрона</text>
        {[0, 0.5, 1].map(f => {
          const y = MED_TOP + f * (MED_BOT - MED_TOP - 10);
          return (
            <g key={f}>
              <line x1={480} x2={490} y1={y} y2={y} stroke="#d97706" />
              <text x={496} y={y + 4} fontSize="11" fill="#b45309">
                {Math.round(300 + f * (deep - 300))} mOsm/kg
              </text>
            </g>
          );
        })}
        <line x1={480} x2={480} y1={MED_TOP} y2={MED_BOT - 10} stroke="#d97706" strokeWidth={2} />

        {/* кръвоносни съдове към гломерула */}
        <path d="M 30 60 L 70 66" stroke="#dc2626" strokeWidth={5} fill="none" />
        <path d="M 70 86 L 30 96" stroke="#dc2626" strokeWidth={3.5} fill="none" opacity={0.75} />
        {/* капсула и гломерул */}
        <circle cx={92} cy={74} r={26} fill="none" stroke="#9f1239" strokeWidth={3} />
        {[0, 1, 2, 3, 4].map(k => (
          <circle key={k} cx={86 + 7 * Math.cos(k * 1.3)} cy={74 + 7 * Math.sin(k * 1.3)} r={6} fill="none" stroke="#dc2626" strokeWidth={2} />
        ))}
        {/* проксимално каналче */}
        <path d="M 116 66 C 140 40, 160 100, 180 60 S 220 40, 214 90 S 236 110, 236 140" fill="none" stroke="#e11d48" strokeWidth={7} strokeLinecap="round" opacity={0.85} />
        {/* примка на Хенле */}
        <path d="M 236 140 L 236 312 Q 236 330 258 330 Q 280 330 280 312 L 280 140" fill="none" stroke="#e11d48" strokeWidth={6} strokeLinecap="round" opacity={0.85} />
        <path d="M 280 312 L 280 140" fill="none" stroke="#7c2d12" strokeWidth={9} opacity={0.35} />
        {/* дистално каналче */}
        <path d="M 280 140 C 280 100, 320 90, 330 110 S 370 140, 380 90 S 420 70, 430 70" fill="none" stroke="#e11d48" strokeWidth={6} strokeLinecap="round" opacity={0.85} />
        {/* събирателна тръбичка */}
        <path d="M 430 30 L 430 346" fill="none" stroke="#be123c" strokeWidth={10} strokeLinecap="round" opacity={0.75} />

        {/* стрелки: вода и соли излизат */}
        {[180, 220, 260].map(y => (
          <g key={y}>
            <path d={`M 228 ${y} l -18 0 m 6 -5 l -6 5 l 6 5`} stroke="#0284c7" strokeWidth={2} fill="none" />
          </g>
        ))}
        <text x={160} y={244} fontSize="11" fill="#0284c7">H₂O</text>
        {[190, 240, 290].map(y => (
          <path key={y} d={`M 290 ${y} l 18 0 m -6 -5 l 6 5 l -6 5`} stroke="#b45309" strokeWidth={2} fill="none" />
        ))}
        <text x={312} y={244} fontSize="11" fill="#b45309">Na⁺ Cl⁻</text>
        {a > 0.05 &&
          [200, 250, 300].map(y => (
            <path key={y} d={`M 422 ${y} l -18 0 m 6 -5 l -6 5 l 6 5`} stroke="#0284c7" strokeWidth={1 + 2.5 * a} fill="none" />
          ))}
        {a > 0.05 && <text x={358} y={230} fontSize="11" fill="#0284c7">H₂O (АДХ)</text>}

        {/* спирки */}
        {STATIONS.map((s, k) => (
          <g key={s.name} onClick={() => setSel(k)} className="cursor-pointer">
            <circle cx={s.x} cy={s.y} r={13} fill={k === sel ? '#0ea5e9' : 'white'} stroke="#0369a1" strokeWidth={2} />
            <text x={s.x} y={s.y + 4} fontSize="12" fontWeight="700" textAnchor="middle" fill={k === sel ? 'white' : '#0369a1'}>
              {k + 1}
            </text>
          </g>
        ))}
        {/* надписи до спирките */}
        <text x={60} y={124} fontSize="11" fill="currentColor">180 L · 300</text>
        <text x={150} y={150} fontSize="11" fill="currentColor">60 L · 300</text>
        <text x={160} y={348} fontSize="11" fill="currentColor">36 L · {Math.round(deep)}</text>
        <text x={318} y={146} fontSize="11" fill="currentColor">36 L · 100</text>
        <text x={412} y={350} fontSize="11" fontWeight="700" fill="#be123c" textAnchor="end">
          {fmt(urine, urine < 2 ? 2 : 1)} L · {Math.round(urineOsm(a))}
        </text>
        <text x={412} y={336} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">урина за денонощие</text>
      </LabSvg>

      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton key={p.name} active={Math.abs(a - p.a) < 0.001} onClick={() => setA(p.a)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="АДХ, %" value={Math.round(a * 100)} onChange={v => setA(v / 100)} min={0} max={100} step={1} tone="violet" />
      </Sliders>

      <Readout
        items={[
          { label: 'урина', value: `${fmt(urine, 2)} L/ден`, tone: 'rose' },
          { label: 'концентрация', value: `${Math.round(urineOsm(a))} mOsm/kg`, tone: 'amber' },
          { label: 'поето обратно', value: `${fmt((1 - urine / 180) * 100, 1)} %`, tone: 'blue' },
        ]}
      />

      <div className="mt-3 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 p-3 text-sm text-gray-700 dark:text-gray-300">
        <p className="font-semibold mb-1">
          {sel + 1}. {st.name}: {fmt(st.v(a), st.v(a) < 2 ? 2 : 0)} L/ден, {Math.round(st.osm(a))} mOsm/kg
        </p>
        <ul className="list-disc pl-5 space-y-0.5">
          {st.info.map(t => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <Note tone="violet">
        {a < 0.05
          ? 'Без АДХ (както при безвкусния диабет) се отделят 10–12 L разредена урина на ден – човек е постоянно жаден.'
          : a > 0.95
            ? 'При жажда хипофизата отделя много АДХ: под литър урина, около четири пъти по-концентрирана от кръвта.'
            : a < 0.2
              ? 'След много вода (или бира – алкохолът потиска АДХ) урината е обилна и бледа.'
              : 'Количеството урина се определя главно в събирателната тръбичка – от това колко АДХ има в кръвта.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Цъкни номерата по нефрона. Числата са приблизителни, за денонощие (L) и в mOsm/kg. Моделът: бъбреците изхвърлят около {SOLUTES}{' '}
        mOsm разтворени вещества на ден, а урината не може да е по-концентрирана от дъното на мозъчното вещество – затова
        обемът ѝ е {SOLUTES} / концентрацията. АДХ увеличава и солеността на медулата (чрез урея), затова и тя расте с него.
      </p>
    </div>
  );
}
