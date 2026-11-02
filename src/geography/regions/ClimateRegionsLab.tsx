import { useEffect, useId, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import ClimateChart from '../atmosphere/ClimateChart';
import { classify, MONTHS, pUnits, STATIONS } from '../atmosphere/koppen';
import { BULGARIA, bgProjection, reliefImage } from './bulgariaShape';

type Region = 'tc' | 'tr' | 'bs' | 'cm' | 'mt';

const REGIONS: Record<Region, { name: string; cls: string; dot: string }> = {
  tc: { name: 'умереноконтинентален', cls: 'text-blue-700 dark:text-blue-300', dot: 'fill-blue-600' },
  tr: { name: 'преходноконтинентален', cls: 'text-amber-700 dark:text-amber-300', dot: 'fill-amber-500' },
  bs: { name: 'черноморски', cls: 'text-cyan-700 dark:text-cyan-300', dot: 'fill-cyan-500' },
  cm: { name: 'континентално-средиземноморски', cls: 'text-rose-700 dark:text-rose-300', dot: 'fill-rose-500' },
  mt: { name: 'планински', cls: 'text-violet-700 dark:text-violet-300', dot: 'fill-violet-500' },
};

type St = { name: string; lat: number; lon: number; h: number; T: number[]; P: number[]; region: Region; src: string; dy?: number };

const fromKoppen = (name: string, region: Region, dy?: number): St => {
  const s = STATIONS.find(x => x.name === name)!;
  return { name, lat: s.lat, lon: s.lon, h: s.h, T: s.T, P: s.P, region, src: 'закръглени норми', dy };
};

/** Станциите: норми 1991–2020 на NOAA (по данните на НИМХ), за Пловдив – 1952–2000; другите са закръглени норми от урока „Климатите на Земята“. */
const ST: St[] = [
  {
    name: 'Видин',
    lat: 43.99,
    lon: 22.88,
    h: 31,
    T: [-0.2, 1.7, 6.6, 12.4, 17.7, 21.8, 23.7, 23, 17.4, 11.4, 5.7, 0.8],
    P: [41, 40, 43, 44, 56, 51, 55, 44, 44, 51, 46, 50],
    region: 'tc',
    src: '1991–2020',
  },
  fromKoppen('Варна', 'bs'),
  {
    name: 'Бургас',
    lat: 42.5,
    lon: 27.47,
    h: 20,
    T: [3, 4.4, 7.3, 11.2, 16.6, 21.4, 23.7, 23.9, 19.7, 14.6, 9.5, 4.6],
    P: [48, 42, 43, 42, 47, 50, 45, 24, 50, 65, 51, 49],
    region: 'bs',
    src: '1991–2020',
  },
  fromKoppen('София', 'tr', -12),
  {
    name: 'Пловдив',
    lat: 42.14,
    lon: 24.75,
    h: 160,
    T: [1.1, 3.3, 7.6, 12.6, 17.7, 22, 24.4, 24.2, 19.2, 13.2, 7.4, 2.3],
    P: [27, 34, 37, 41, 77, 57, 39, 43, 35, 37, 36, 39],
    region: 'tr',
    src: '1952–2000',
  },
  {
    name: 'Кърджали',
    lat: 41.64,
    lon: 25.37,
    h: 330,
    T: [2.1, 3.8, 7.1, 11.8, 16.7, 20.9, 23.7, 23.8, 19, 13.4, 8.2, 3.5],
    P: [56, 60, 58, 52, 64, 58, 35, 26, 34, 58, 63, 80],
    region: 'cm',
    src: '1991–2020',
  },
  fromKoppen('Сандански', 'cm', 16),
  fromKoppen('Мусала', 'mt', 16),
];

const SEASONS: [string, number[]][] = [
  ['зимата', [11, 0, 1]],
  ['пролетта', [2, 3, 4]],
  ['лятото', [5, 6, 7]],
  ['есента', [8, 9, 10]],
];

function stats(s: St) {
  const Ta = s.T.reduce((a, b) => a + b, 0) / 12;
  const Pa = s.P.reduce((a, b) => a + b, 0);
  const amp = Math.max(...s.T) - Math.min(...s.T);
  const sums = SEASONS.map(([, m]) => m.reduce((a, i) => a + s.P[i], 0));
  const wet = sums.indexOf(Math.max(...sums));
  const wetMonth = s.P.indexOf(Math.max(...s.P));
  return { Ta, Pa, amp, wet, wetMonth, summerShare: sums[2] / Pa, winterShare: sums[0] / Pa, code: classify(s.lat, s.T, s.P).code };
}

const MAP = bgProjection(20, 8, 600);
const OUTLINE = MAP.path(BULGARIA, true);
const MONTH_NAMES = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];

/** Сравнение на климатограми от различните климатични области на България. */
export default function ClimateRegionsLab() {
  const [sel, setSel] = useState<[number, number]>([0, 6]);
  const [next, setNext] = useState(1);
  const [img, setImg] = useState('');
  const clip = useId();
  useEffect(() => setImg(reliefImage(300, 200)), []);

  const pick = (i: number) => {
    if (sel.includes(i)) return;
    const s: [number, number] = [...sel];
    s[next] = i;
    setSel(s);
    setNext(1 - next);
  };

  const pair = sel.map(i => ST[i]);
  const st = pair.map(stats);
  // общ мащаб за двете климатограми
  const allT = pair.flatMap(s => s.T);
  const allP = pair.flatMap(s => s.P.map(pUnits));
  const lo = Math.min(0, Math.floor(Math.min(...allT) / 10) * 10);
  const hi = Math.max(30, Math.ceil(Math.max(...allT, ...allP) / 10) * 10);

  const [A, B] = st;
  const verdict = (() => {
    const [a, b] = pair;
    if (a.region === b.region) return `И двете станции са в една климатична област (${REGIONS[a.region].name}) – разликите идват главно от височината и релефа.`;
    const warm = A.Ta > B.Ta ? 0 : 1;
    const wetW = A.winterShare > B.winterShare ? 0 : 1;
    return `${pair[warm].name} е по-топла средно с ${fmt(Math.abs(A.Ta - B.Ta), 1)} °C. През зимата пада ${fmt(100 * st[wetW].winterShare)}% от валежите в ${pair[wetW].name} срещу ${fmt(100 * st[1 - wetW].winterShare)}% в ${pair[1 - wetW].name}.`;
  })();

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 640 ${MAP.h + 16}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <clipPath id={clip}>
            <path d={OUTLINE} />
          </clipPath>
        </defs>
        <rect x={20} y={8} width={MAP.w} height={MAP.h} rx={6} className="fill-gray-100 dark:fill-gray-900" />
        {img && <image href={img} x={20} y={8} width={MAP.w} height={MAP.h} preserveAspectRatio="none" clipPath={`url(#${clip})`} opacity={0.75} />}
        <path d={OUTLINE} fill="none" className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="1.2" />
        {ST.map((s, i) => {
          const x = MAP.x(s.lon);
          const y = MAP.y(s.lat);
          const k = sel.indexOf(i);
          return (
            <g key={s.name} className="cursor-pointer" onClick={() => pick(i)}>
              <circle cx={x} cy={y} r={16} fill="transparent" />
              <circle cx={x} cy={y} r={k >= 0 ? 9 : 6} className={`${REGIONS[s.region].dot} stroke-white dark:stroke-gray-900`} strokeWidth="2" />
              {k >= 0 && (
                <text x={x} y={y + 3.5} fontSize="10" fontWeight="bold" textAnchor="middle" className="fill-white pointer-events-none">
                  {k ? 'Б' : 'А'}
                </text>
              )}
              <text
                x={x}
                y={y + (s.dy ?? -13)}
                fontSize="12"
                fontWeight={k >= 0 ? 'bold' : 'normal'}
                textAnchor="middle"
                className="fill-gray-900 dark:fill-white pointer-events-none"
                paintOrder="stroke"
                stroke="white"
                strokeWidth="3"
                strokeOpacity="0.7"
              >
                {s.name}
              </text>
            </g>
          );
        })}
      </LabSvg>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
        {(Object.keys(REGIONS) as Region[]).map(r => (
          <span key={r} className={`inline-flex items-center gap-1.5 ${REGIONS[r].cls}`}>
            <svg width="10" height="10" aria-hidden="true">
              <circle cx="5" cy="5" r="5" className={REGIONS[r].dot} />
            </svg>
            {REGIONS[r].name}
          </span>
        ))}
      </div>
      <Buttons>
        {ST.map((s, i) => (
          <DiagramButton key={s.name} active={sel.includes(i)} onClick={() => pick(i)}>
            {s.name}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        {pair.map((s, k) => (
          <div key={s.name} className="min-w-0">
            <ClimateChart T={s.T} P={s.P} lo={lo} hi={hi} title={`${k ? 'Б' : 'А'}: ${s.name}, ${fmt(s.h)} m (${s.src})`} />
            <p className={`text-center text-sm font-medium mt-1 ${REGIONS[s.region].cls}`}>{REGIONS[s.region].name} климат</p>
            <div className="mt-2">
              <Readout
                items={[
                  { label: 'ср. год.', value: `${fmt(st[k].Ta, 1)} °C`, tone: 'rose' },
                  { label: 'амплитуда', value: `${fmt(st[k].amp, 1)} °C`, tone: 'amber' },
                  { label: 'валежи', value: `${fmt(st[k].Pa)} mm`, tone: 'blue' },
                  { label: 'най-влажен', value: MONTH_NAMES[st[k].wetMonth], tone: 'blue' },
                  { label: 'Кьопен', value: st[k].code, tone: 'violet' },
                ]}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Щракни станция на картата или бутон – тя заменя по-старо избраната от двете. Двете климатограми са в един мащаб (10 °C ↔ 20 mm). Месеците:{' '}
        {MONTHS.join(' ')}. Норми: Видин, Бургас и Кърджали – 1991–2020 (NOAA по данни на НИМХ), Пловдив – 1952–2000, останалите – закръглени
        многогодишни стойности.
      </p>
      <Note tone="violet">{verdict}</Note>
      <Note tone="emerald">
        Най-валежният сезон: в {pair[0].name} – {SEASONS[A.wet][0]}, в {pair[1].name} – {SEASONS[B.wet][0]}.{' '}
        {A.wet === 0 || B.wet === 0 || A.wet === 3 || B.wet === 3
          ? 'Максимум през есента и зимата е белег на средиземноморско влияние.'
          : 'Максимум в края на пролетта и през лятото е белег на континенталния климат.'}
      </Note>
    </div>
  );
}
