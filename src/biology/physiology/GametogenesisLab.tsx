import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Mode = 'cell' | 'life';

/** Етапи – мъжки и женски ред. */
const STEPS = [
  {
    male: 'сперматогоний',
    female: 'оогоний',
    ploidy: '2n',
    note: 'Изходните клетки се делят митотично. Сперматогониите се делят цял живот след пубертета, а оогониите – само преди раждането.',
    when: ['от пубертета до старостта', 'само в ембриона'],
  },
  {
    male: 'първичен сперматоцит',
    female: 'първичен ооцит',
    ploidy: '2n',
    note: 'ДНК е удвоена и започва мейоза I. Първичните ооцити спират в профаза I още преди раждането и чакат така до 12 до около 50 години.',
    when: ['няколко дни', 'спира в профаза I за години'],
  },
  {
    male: '2 вторични сперматоцита',
    female: 'вторичен ооцит + 1 полярно телце',
    ploidy: 'n',
    note: 'Мейоза I разделя хомоложните хромозоми. При жената делението е неравно: почти цялата цитоплазма остава в ооцита, а полярното телце е мъничко. Мейоза I завършва малко преди овулацията и ооцитът спира отново – в метафаза II.',
    when: ['около 3 седмици от началото на мейоза I', 'точно преди овулацията'],
  },
  {
    male: '4 сперматиди',
    female: 'яйцеклетка + полярни телца',
    ploidy: 'n',
    note: 'Мейоза II разделя хроматидите. При жената тя завършва само ако сперматозоид влезе в ооцита – отделя се второ полярно телце. Първото понякога също се дели, затова полярните телца са 2 или 3. Те загиват.',
    when: ['часове', 'само при оплождане'],
  },
  {
    male: '4 сперматозоида',
    female: '1 яйцеклетка',
    ploidy: 'n',
    note: 'Сперматидите се превръщат в сперматозоиди: оформя се камшиче, акрозома с ензими и митохондрии около средната част, а повечето цитоплазма се изхвърля. От една клетка – 4 подвижни мънички гамети при мъжа и 1 огромна, богата на запаси гамета при жената.',
    when: ['общо ≈ 64–74 дни', 'общо от 12 до ≈ 50 години'],
  },
] as const;

/** Брой ооцити в двата яйчника (приблизително; по литературни данни). Възраст в години, 20. седмица на бременността ≈ −0,38. */
const OOCYTES: [number, number][] = [
  [-0.38, 7e6],
  [0, 1.5e6],
  [12, 3e5],
  [37, 2.5e4],
  [51, 1e3],
];

function oocytes(age: number) {
  for (let k = 1; k < OOCYTES.length; k++) {
    const [a0, n0] = OOCYTES[k - 1];
    const [a1, n1] = OOCYTES[k];
    if (age <= a1) return Math.exp(Math.log(n0) + ((age - a0) / (a1 - a0)) * (Math.log(n1) - Math.log(n0)));
  }
  return 1e3 * Math.exp(-(age - 51) * 0.5);
}

const MALE = '#0ea5e9';
const FEMALE = '#e11d48';
const big = (v: number) => {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1).replace('.', ',')} млрд.`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1).replace('.', ',')} млн.`;
  if (v >= 1e4) return `${Math.round(v / 1000)} хил.`;
  return String(Math.round(v));
};

// графиката за живота
const GX0 = 70;
const GX1 = 610;
const GY0 = 290;
const GY1 = 40;
const gx = (a: number) => GX0 + ((a + 1) / 56) * (GX1 - GX0);
const gy = (n: number) => GY0 - ((Math.log10(Math.max(n, 100)) - 2) / 5) * (GY0 - GY1);

function Sperm({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={7} ry={5} fill={MALE} />
      <path d={`M ${x + 7} ${y} q 8 -6 16 0 t 16 0 t 16 0`} fill="none" stroke={MALE} strokeWidth={1.5} />
    </g>
  );
}

/** Сперматогенеза и оогенеза: една клетка стъпка по стъпка и броят на гаметите през живота. */
export default function GametogenesisLab() {
  const [mode, setMode] = useState<Mode>('cell');
  const [step, setStep] = useState(0);
  const [age, setAge] = useState(25);
  const s = STEPS[step];

  const lifeOocytes = oocytes(age);
  const ovulated = Math.max(0, Math.min(age, 51) - 13) * 13;
  const sperm = Math.max(0, age - 13) * 365 * 1.2e8;

  const curve = Array.from({ length: 200 }, (_, k) => -0.38 + (k * 54) / 199)
    .map((a, k) => `${k ? 'L' : 'M'} ${gx(a).toFixed(1)} ${gy(oocytes(a)).toFixed(1)}`)
    .join(' ');

  // мъжкият ред: клетки на всяка стъпка
  const maleCells = step === 0 || step === 1 ? 1 : step === 2 ? 2 : 4;
  const polar = step < 2 ? 0 : step === 2 ? 1 : 3;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 330" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {mode === 'cell' ? (
          <g>
            <text x={160} y={30} fontSize="14" fontWeight="700" textAnchor="middle" fill={MALE}>♂ сперматогенеза</text>
            <text x={480} y={30} fontSize="14" fontWeight="700" textAnchor="middle" fill={FEMALE}>♀ оогенеза</text>
            <line x1={320} x2={320} y1={20} y2={300} className="stroke-gray-200 dark:stroke-gray-700" />

            {/* мъжки */}
            {Array.from({ length: maleCells }, (_, k) => {
              const x = maleCells === 1 ? 160 : 160 + (k - (maleCells - 1) / 2) * 70;
              const y = 160;
              if (step === 4) return <Sperm key={k} x={x - 15} y={y} />;
              const r = step === 0 ? 30 : step === 1 ? 36 : step === 2 ? 26 : 19;
              return (
                <g key={k}>
                  <circle cx={x} cy={y} r={r} fill={MALE} opacity={0.18} stroke={MALE} strokeWidth={1.5} />
                  <text x={x} y={y + 4} fontSize="12" textAnchor="middle" fill="currentColor">{s.ploidy}</text>
                </g>
              );
            })}

            {/* женски */}
            <g>
                <circle cx={460} cy={160} r={step === 0 ? 30 : step === 1 ? 60 : 72} fill={FEMALE} opacity={0.15} stroke={FEMALE} strokeWidth={1.5} />
                <text x={460} y={164} fontSize="12" textAnchor="middle" fill="currentColor">{step === 4 ? 'n' : s.ploidy}</text>
                {Array.from({ length: polar }, (_, k) => (
                  <g key={k}>
                    <circle cx={560 + (k % 2) * 26} cy={110 + Math.floor(k / 2) * 30} r={9} fill={FEMALE} opacity={step === 4 ? 0.08 : 0.3} stroke={FEMALE} strokeDasharray={step === 4 ? '2 2' : undefined} />
                  </g>
                ))}
                {polar > 0 && (
                  <text x={573} y={step === 2 ? 140 : 170} fontSize="11" textAnchor="middle" fill="currentColor">
                    полярн{polar === 1 ? 'о телце' : 'и телца'}
                  </text>
                )}
            </g>

            <text x={160} y={262} fontSize="13" textAnchor="middle" fontWeight="700" fill="currentColor">{s.male}</text>
            <text x={480} y={262} fontSize="13" textAnchor="middle" fontWeight="700" fill="currentColor">{s.female}</text>
            <text x={160} y={284} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">{s.when[0]}</text>
            <text x={480} y={284} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">{s.when[1]}</text>
          </g>
        ) : (
          <g>
            <line x1={GX0} y1={GY0} x2={GX1} y2={GY0} stroke="currentColor" />
            <line x1={GX0} y1={GY0} x2={GX0} y2={GY1} stroke="currentColor" />
            {[2, 3, 4, 5, 6, 7].map(p => (
              <g key={p}>
                <line x1={GX0 - 4} x2={GX1} y1={gy(10 ** p)} y2={gy(10 ** p)} className="stroke-gray-200 dark:stroke-gray-700" />
                <text x={GX0 - 8} y={gy(10 ** p) + 4} fontSize="11" textAnchor="end" fill="currentColor">10{'⁰¹²³⁴⁵⁶⁷'[p]}</text>
              </g>
            ))}
            {[0, 10, 20, 30, 40, 50].map(a => (
              <g key={a}>
                <line x1={gx(a)} x2={gx(a)} y1={GY0} y2={GY0 + 4} stroke="currentColor" />
                <text x={gx(a)} y={GY0 + 16} fontSize="11" textAnchor="middle" fill="currentColor">{a}</text>
              </g>
            ))}
            <text x={GX1} y={GY0 + 32} fontSize="12" textAnchor="end" fill="currentColor">възраст, години</text>
            <text x={GX0 + 4} y={GY1 - 14} fontSize="12" fill="currentColor">ооцити в яйчниците (логаритмична скала)</text>
            <rect x={gx(13)} y={GY1} width={gx(51) - gx(13)} height={GY0 - GY1} fill={FEMALE} opacity={0.06} />
            <text x={(gx(13) + gx(51)) / 2} y={GY0 - 8} fontSize="11" textAnchor="middle" fill={FEMALE}>овулации ≈ 13 на година</text>
            <path d={curve} fill="none" stroke={FEMALE} strokeWidth={3} />
            <line x1={gx(age)} x2={gx(age)} y1={GY0} y2={GY1} stroke="#64748b" strokeDasharray="3 3" />
            <circle cx={gx(age)} cy={gy(lifeOocytes)} r={5} fill={FEMALE} />
          </g>
        )}
      </LabSvg>

      <Buttons>
        <DiagramButton active={mode === 'cell'} onClick={() => setMode('cell')}>
          една клетка
        </DiagramButton>
        <DiagramButton active={mode === 'life'} onClick={() => setMode('life')}>
          през живота
        </DiagramButton>
      </Buttons>
      <Sliders>
        {mode === 'cell' ? (
          <Slider label="стъпка" value={step} onChange={v => setStep(Math.round(v))} min={0} max={STEPS.length - 1} step={1} tone="rose" />
        ) : (
          <Slider label="възраст" value={age} onChange={setAge} min={0} max={55} step={1} tone="rose" />
        )}
      </Sliders>
      {mode === 'cell' ? (
        <>
          <Readout
            items={[
              { label: '♂ клетки', value: step === 4 ? '4 сперматозоида' : maleCells, tone: 'blue' },
              { label: '♀ гамети', value: step >= 3 ? 1 : '–', tone: 'rose' },
              { label: 'полярни телца', value: polar === 3 ? '2 или 3' : polar, tone: 'gray' },
              { label: 'набор', value: s.ploidy, tone: 'violet' },
            ]}
          />
          <Note tone="rose">{s.note}</Note>
        </>
      ) : (
        <>
          <Readout
            items={[
              { label: 'ооцити', value: `≈ ${big(lifeOocytes)}`, tone: 'rose' },
              { label: 'овулирали досега', value: `≈ ${big(ovulated)}`, tone: 'amber' },
              { label: '♂ сперматозоиди досега', value: `≈ ${big(sperm)}`, tone: 'blue' },
            ]}
          />
          <Note tone="rose">
            {age < 13
              ? 'Още преди раждането ооцитите са най-много – милиони. После броят им само намалява: повечето загиват, без изобщо да узреят.'
              : age <= 51
                ? `От всички ооцити само около 400–500 ще овулират през живота. Мъжът на същата възраст е образувал около ${big(sperm)} сперматозоида.`
                : 'Около 50-годишна възраст ооцитите са останали около хиляда, циклите спират – менопауза. Сперматозоиди се образуват и в старостта, макар и по-малко.'}
          </Note>
        </>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Числата са средни и приблизителни (в литературата се срещат различни оценки): около 7 милиона ооцита в 20-ата седмица на
        бременността, 1–2 милиона при раждането, около 300 000 при пубертета и около 1000 при менопаузата. За мъжа е прието около
        120 милиона сперматозоида на ден (над 1000 в секунда) от около 13-годишна възраст.
      </p>
    </div>
  );
}
