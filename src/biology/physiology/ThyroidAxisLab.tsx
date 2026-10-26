import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

/** Нормалните (средни) стойности: TSH в mU/L и свободен T4 в pmol/L. */
const TSH0 = 1.5;
const FT40 = 16;
const DAYS = 180;
const DT = 0.25; // h
const SAMPLE = 24; // една точка на 6 h
const LN2 = Math.log(2);

type Scenario = 'normal' | 'iodine' | 'graves' | 'hashimoto' | 'pituitary';

const SCENARIOS: { id: Scenario; name: string; iodine: number; tsi: number; cap: number; pit: number }[] = [
  { id: 'normal', name: 'норма', iodine: 100, tsi: 0, cap: 1, pit: 1 },
  { id: 'iodine', name: 'йоден недостиг', iodine: 20, tsi: 0, cap: 1, pit: 1 },
  { id: 'graves', name: 'Базедова болест', iodine: 100, tsi: 1.5, cap: 1, pit: 1 },
  { id: 'hashimoto', name: 'Хашимото', iodine: 100, tsi: 0, cap: 0.08, pit: 1 },
  { id: 'pituitary', name: 'болна хипофиза', iodine: 100, tsi: 0, cap: 1, pit: 0.1 },
];

type Point = { tsh: number; ft4: number; gland: number };

/**
 * Опростен модел на оста хипоталамус – хипофиза – щитовидна жлеза (в стойности спрямо нормата).
 * TSH (полуживот ≈ 1 h) се стреми към pit · h(T4), където h рязко пада при повече T4: двойно повече T4 → около 100 пъти по-малко TSH.
 * T4 (полуживот ≈ 7 дни) се стреми към жлеза · йод · (стимулация от TSH + антитела) + таблетки.
 * Жлезата расте или се свива (за около месец) към размер, пропорционален на стимулацията ѝ.
 */
function simulate(iodine: number, tsi: number, cap: number, pit: number, dose: number) {
  const kx = LN2 / 1;
  const ky = LN2 / 168;
  const kg = 1 / (24 * 30);
  const I = Math.min(iodine, 100) / 100;
  const D = dose / 100; // 100 μg T4 на ден ≈ цялото нормално производство
  let x = 1;
  let y = 1;
  let g = 1;
  const out: Point[] = [];
  const steps = (DAYS * 24) / DT;
  for (let i = 0; i <= steps; i++) {
    if (i % SAMPLE === 0) out.push({ tsh: x * TSH0, ft4: y * FT40, gland: g });
    const h = 1.02 / (Math.pow(Math.max(y, 0), 6.6) + 0.02);
    const s = (x * 3) / (x + 2);
    x += kx * (pit * h - x) * DT;
    y += ky * (g * I * (s + tsi) + D - y) * DT;
    g += kg * (cap * (s + tsi) - g) * DT;
  }
  return out;
}

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');
const fmtTsh = (v: number) => (v < 0.01 ? '< 0,01' : v < 1 ? fmt(v, 2) : fmt(v, 1));

// графиките
const X0 = 50;
const X1 = 400;
const px = (day: number) => X0 + (day / DAYS) * (X1 - X0);
// T4: 0–60 pmol/L
const T_TOP = 24;
const T_BOT = 134;
const pyT = (v: number) => T_BOT - (Math.min(v, 60) / 60) * (T_BOT - T_TOP);
// TSH: логаритмична скала 0,01–100 mU/L
const S_TOP = 176;
const S_BOT = 296;
const pyS = (v: number) => S_BOT - ((Math.log10(Math.min(Math.max(v, 0.01), 100)) + 2) / 4) * (S_BOT - S_TOP);

/** Щитовидната ос: TSH и T4 с отрицателна обратна връзка при йоден недостиг, болести и таблетки тироксин. */
export default function ThyroidAxisLab() {
  const [scenario, setScenario] = useState<Scenario>('iodine');
  const sc = SCENARIOS.find(s => s.id === scenario)!;
  const [iodine, setIodine] = useState(sc.iodine);
  const [dose, setDose] = useState(0);
  const [day, setDay] = useState(DAYS);

  const data = useMemo(() => simulate(iodine, sc.tsi, sc.cap, sc.pit, dose), [iodine, sc, dose]);
  const now = data[Math.round((day / DAYS) * (data.length - 1))];

  const choose = (id: Scenario) => {
    const s = SCENARIOS.find(v => v.id === id)!;
    setScenario(id);
    setIodine(s.iodine);
    setDose(0);
  };

  const path = (f: (p: Point) => number) => data.map((p, k) => `${k ? 'L' : 'M'} ${px((k / (data.length - 1)) * DAYS).toFixed(1)} ${f(p).toFixed(1)}`).join(' ');

  // стрелките в схемата: дебелина според сигнала
  const wTsh = Math.min(1 + 2.5 * Math.sqrt(now.tsh / TSH0), 12);
  const wT4 = Math.min(1 + 2.5 * (now.ft4 / FT40), 12);
  const glandR = 14 * Math.sqrt(now.gland);

  const tshState = now.tsh < 0.4 ? 'нисък' : now.tsh > 4 ? 'висок' : 'нормален';
  const t4State = now.ft4 < 12 ? 'нисък' : now.ft4 > 22 ? 'висок' : 'нормален';

  let note: string;
  if (t4State === 'нормален' && tshState === 'нормален')
    note = now.gland > 1.3 ? 'Хормоните са нормални, но жлезата е уголемена – гуша без нарушена функция.' : 'Хормоните са в нормата – обратната връзка ги държи около зададените стойности.';
  else if (t4State === 'висок' && tshState === 'нисък')
    note = sc.tsi > 0 && dose === 0 ? 'Хипертиреоза: антителата стимулират рецептора за TSH и жлезата работи без контрол; хипофизата почти спира TSH, но това не помага.' : 'Твърде много тироксин: хипофизата спира TSH, а жлезата, останала без стимул, се свива.';
  else if (t4State === 'нисък' && tshState === 'висок')
    note = 'Първична хипотиреоза: жлезата не смогва, затова хипофизата „крещи“ с много TSH.';
  else if (t4State === 'нисък') note = 'Вторична хипотиреоза: T4 е нисък, а TSH не е висок – значи виновна е хипофизата, не щитовидната жлеза.';
  else if (tshState === 'висок') note = 'TSH е повишен, а T4 още е в нормата – жлезата едва компенсира (субклинична хипотиреоза). Тя расте под действието на TSH.';
  else if (tshState === 'нисък') note = 'TSH е потиснат, а T4 още е в нормата – лека излишна стимулация или доза.';
  else note = 'T4 е повишен.';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {SCENARIOS.map(s => (
          <DiagramButton key={s.id} onClick={() => choose(s.id)} active={scenario === s.id}>
            {s.name}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 640 330" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {/* T4 */}
        <rect x={X0} y={pyT(22)} width={X1 - X0} height={pyT(12) - pyT(22)} fill="#10b981" opacity={0.12} />
        <line x1={X0} y1={T_BOT} x2={X1} y2={T_BOT} stroke="currentColor" />
        <line x1={X0} y1={T_TOP} x2={X0} y2={T_BOT} stroke="currentColor" />
        {[0, 20, 40, 60].map(v => (
          <text key={v} x={X0 - 6} y={pyT(v) + 4} fontSize="11" textAnchor="end" fill="currentColor">{v}</text>
        ))}
        <text x={X0 + 4} y={T_TOP - 8} fontSize="12" fill="#7c3aed">свободен T4, pmol/L</text>
        <path d={path(p => pyT(p.ft4))} fill="none" stroke="#7c3aed" strokeWidth={2.5} />

        {/* TSH */}
        <rect x={X0} y={pyS(4)} width={X1 - X0} height={pyS(0.4) - pyS(4)} fill="#10b981" opacity={0.12} />
        <line x1={X0} y1={S_BOT} x2={X1} y2={S_BOT} stroke="currentColor" />
        <line x1={X0} y1={S_TOP} x2={X0} y2={S_BOT} stroke="currentColor" />
        {[0.01, 0.1, 1, 10, 100].map(v => (
          <text key={v} x={X0 - 6} y={pyS(v) + 4} fontSize="11" textAnchor="end" fill="currentColor">{String(v).replace('.', ',')}</text>
        ))}
        <text x={X0 + 4} y={S_TOP - 8} fontSize="12" fill="#e11d48">TSH, mU/L (логаритмична скала)</text>
        <path d={path(p => pyS(p.tsh))} fill="none" stroke="#e11d48" strokeWidth={2.5} />

        {[0, 30, 60, 90, 120, 150, 180].map(d => (
          <text key={d} x={px(d)} y={S_BOT + 16} fontSize="11" textAnchor="middle" fill="currentColor">{d}</text>
        ))}
        <text x={(X0 + X1) / 2} y={S_BOT + 31} fontSize="12" textAnchor="middle" fill="currentColor">дни</text>
        <line x1={px(day)} x2={px(day)} y1={T_TOP} y2={S_BOT} stroke="#64748b" strokeDasharray="3 3" />
        <circle cx={px(day)} cy={pyT(now.ft4)} r={4.5} fill="#7c3aed" />
        <circle cx={px(day)} cy={pyS(now.tsh)} r={4.5} fill="#e11d48" />

        {/* схемата на оста */}
        <g fontSize="12" fill="currentColor">
          <rect x={455} y={20} width={150} height={34} rx={8} fill="#f59e0b" opacity={0.25} />
          <text x={530} y={42} textAnchor="middle">хипоталамус (TRH)</text>
          <line x1={530} y1={54} x2={530} y2={88} stroke="#f59e0b" strokeWidth={3} />
          <ellipse cx={530} cy={104} rx={46} ry={16} fill="#e11d48" opacity={0.2} />
          <text x={530} y={108} textAnchor="middle">хипофиза</text>
          <line x1={530} y1={120} x2={530} y2={205} stroke="#e11d48" strokeWidth={wTsh} strokeLinecap="round" />
          <text x={540} y={168} fill="#e11d48">TSH</text>
          {/* щитовидната жлеза – два дяла */}
          <ellipse cx={530 - glandR * 0.9} cy={230} rx={glandR * 0.8} ry={glandR * 1.3} fill="#7c3aed" opacity={0.35} />
          <ellipse cx={530 + glandR * 0.9} cy={230} rx={glandR * 0.8} ry={glandR * 1.3} fill="#7c3aed" opacity={0.35} />
          <text x={530} y={234} textAnchor="middle" fontSize="11">щитовидна</text>
          {/* обратната връзка */}
          <path d={`M ${560 + glandR} 220 C 625 200, 625 120, 578 106`} fill="none" stroke="#7c3aed" strokeWidth={wT4} strokeLinecap="round" opacity={0.75} />
          <text x={590} y={162} fill="#7c3aed" textAnchor="middle">T4</text>
          <text x={590} y={178} fill="#7c3aed" textAnchor="middle">(−)</text>
          {sc.tsi > 0 && (
            <text x={445} y={196} fill="#0ea5e9" fontSize="11">антитела →</text>
          )}
          {dose > 0 && (
            <text x={530} y={300} textAnchor="middle" fill="#059669" fontSize="11">+ таблетки {dose} μg/ден</text>
          )}
        </g>
      </LabSvg>

      <Sliders>
        <Slider label="йод, %" value={iodine} onChange={setIodine} min={10} max={100} step={5} tone="amber" />
        <Slider label="T4, μg" value={dose} onChange={setDose} min={0} max={200} step={25} tone="emerald" />
        <Slider label="ден" value={day} onChange={setDay} min={0} max={DAYS} step={1} tone="gray" />
      </Sliders>

      <Readout
        items={[
          { label: 'ден', value: day },
          { label: 'TSH', value: `${fmtTsh(now.tsh)} mU/L (${tshState})`, tone: 'rose' },
          { label: 'свободен T4', value: `${fmt(now.ft4)} pmol/L (${t4State})`, tone: 'violet' },
          { label: 'жлезата', value: `× ${fmt(now.gland, 2)}`, tone: 'amber' },
        ]}
      />
      <Note tone="violet">{note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Избери състояние – в ден 0 то започва при здрав човек. „Йод“ е приемът спрямо нужния (около 150 μg на ден), „T4“ –
        таблетки левотироксин (100 μg на ден ≈ колкото жлезата прави сама). Опитай да лекуваш Хашимото с таблетки, докато TSH влезе в
        зелената ивица, или дай таблетки на здрав човек. Моделът е опростен: TSH се разгражда за около час, тироксинът – за около
        седмица, затова T4 се променя бавно, а размерът на жлезата се нагажда за месеци. Зелените ивици са приблизителните нормални граници
        (те се различават по лаборатории).
      </p>
    </div>
  );
}
