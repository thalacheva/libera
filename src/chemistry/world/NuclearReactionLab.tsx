import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Tex } from '~/MathText';
import { Note, Readout } from '~/geometry/diagram';
import { byZ } from '../elements';

type Particle = { label: string; tex: string; A: number; Z: number };

const TARGETS: Particle[] = [
  { label: 'Be-9', tex: '{}^{9}_{4}\\mathrm{Be}', A: 9, Z: 4 },
  { label: 'N-14', tex: '{}^{14}_{7}\\mathrm{N}', A: 14, Z: 7 },
  { label: 'Al-27', tex: '{}^{27}_{13}\\mathrm{Al}', A: 27, Z: 13 },
  { label: 'U-238', tex: '{}^{238}_{92}\\mathrm{U}', A: 238, Z: 92 },
  { label: 'Bi-209', tex: '{}^{209}_{83}\\mathrm{Bi}', A: 209, Z: 83 },
  { label: 'Pu-244', tex: '{}^{244}_{94}\\mathrm{Pu}', A: 244, Z: 94 },
  { label: 'Am-243', tex: '{}^{243}_{95}\\mathrm{Am}', A: 243, Z: 95 },
  { label: 'Cm-248', tex: '{}^{248}_{96}\\mathrm{Cm}', A: 248, Z: 96 },
  { label: 'Bk-249', tex: '{}^{249}_{97}\\mathrm{Bk}', A: 249, Z: 97 },
  { label: 'Cf-249', tex: '{}^{249}_{98}\\mathrm{Cf}', A: 249, Z: 98 },
];

const PROJECTILES: Particle[] = [
  { label: 'неутрон', tex: '{}^{1}_{0}n', A: 1, Z: 0 },
  { label: 'α', tex: '{}^{4}_{2}\\mathrm{He}', A: 4, Z: 2 },
  { label: 'O-18', tex: '{}^{18}_{8}\\mathrm{O}', A: 18, Z: 8 },
  { label: 'Ca-48', tex: '{}^{48}_{20}\\mathrm{Ca}', A: 48, Z: 20 },
  { label: 'Fe-58', tex: '{}^{58}_{26}\\mathrm{Fe}', A: 58, Z: 26 },
  { label: 'Zn-70', tex: '{}^{70}_{30}\\mathrm{Zn}', A: 70, Z: 30 },
];

/** Какво излита: γ, k неутрона или протон. */
const EMITTED: { label: string; tex: string; A: number; Z: number }[] = [
  { label: 'γ', tex: '\\gamma', A: 0, Z: 0 },
  { label: '1 n', tex: '{}^{1}_{0}n', A: 1, Z: 0 },
  { label: '2 n', tex: '2\\,{}^{1}_{0}n', A: 2, Z: 0 },
  { label: '3 n', tex: '3\\,{}^{1}_{0}n', A: 3, Z: 0 },
  { label: '4 n', tex: '4\\,{}^{1}_{0}n', A: 4, Z: 0 },
  { label: 'p', tex: '{}^{1}_{1}p', A: 1, Z: 1 },
];

// Исторически реакции: [мишена, снаряд, излъчено] → бележка
const HISTORY: Record<string, string> = {
  'N-14|α|p': 'Ръдърфорд, 1919 г. – първото изкуствено превръщане на един елемент в друг.',
  'Be-9|α|1 n': 'Чадуик, 1932 г. – така е открит неутронът.',
  'Al-27|α|1 n': 'Ирен и Фредерик Жолио-Кюри, 1934 г. – полученият фосфор-30 е радиоактивен: първата изкуствена радиоактивност (Нобелова награда, 1935 г.).',
  'U-238|неутрон|γ': 'Макмилън и Абелсън, 1940 г.: уран-239 търпи две β⁻-разпадания и дава нептуний-239, а след това плутоний-239 – първите трансуранови елементи.',
  'Cf-249|O-18|4 n': 'Беркли, 1974 г. (Гиорсо, Сийборг) – сиборгий-263. Елементът е кръстен на Глен Сийборг още приживе.',
  'Bi-209|Fe-58|1 n': 'GSI, Дармщат, 1982 г. – майтнерий, кръстен на Лизе Майтнер.',
  'Bi-209|Zn-70|1 n': 'RIKEN, Япония, 2004 г. – нихоний, първият елемент, открит в Азия. За 9 години са получени само 3 атома.',
  'Pu-244|Ca-48|3 n': 'Дубна, 1998–1999 г. – флеровий.',
  'Cm-248|Ca-48|4 n': 'Дубна, 2000 г. – ливерморий-292.',
  'Am-243|Ca-48|3 n': 'Дубна, 2003 г. – московий.',
  'Bk-249|Ca-48|3 n': 'Дубна, 2010 г. – тенесин. Мишената от беркелий е произведена в САЩ.',
  'Cf-249|Ca-48|3 n': 'Дубна, 2002–2006 г. – оганесон, най-тежкият известен елемент, кръстен на Юрий Оганесян.',
};

const btn = (active: boolean) =>
  `px-2.5 py-1 rounded-md text-xs sm:text-sm border transition-colors ${active ? 'bg-amber-100 border-amber-400 text-amber-900 dark:bg-amber-900/40 dark:border-amber-500 dark:text-amber-100' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'}`;

function Row({ title, items, value, onChange }: { title: string; items: { label: string }[]; value: number; onChange: (i: number) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2">
      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 w-full sm:w-auto text-center">{title}</span>
      {items.map((x, i) => (
        <button key={x.label} type="button" className={btn(i === value)} onClick={() => onChange(i)}>
          {x.label}
        </button>
      ))}
    </div>
  );
}

/** Кръгче-ядро с радиус ~ A^(1/3). */
function Ball({ x, y, A, label, cls }: { x: number; y: number; A: number; label: string; cls: string }) {
  const r = Math.max(7, 6 * Math.cbrt(A));
  return (
    <g>
      <circle cx={x} cy={y} r={r} className={cls} />
      <text x={x} y={y + r + 14} fontSize="11" textAnchor="middle" className="fill-current">
        {label}
      </text>
    </g>
  );
}

/** Ядрени реакции: мишена + снаряд → съставно ядро → продукт + излетели частици. */
export default function NuclearReactionLab() {
  const [ti, setTi] = useState(9);
  const [pi, setPi] = useState(3);
  const [ei, setEi] = useState(3);
  const t = TARGETS[ti];
  const p = PROJECTILES[pi];
  const e = EMITTED[ei];
  const cA = t.A + p.A;
  const cZ = t.Z + p.Z;
  const A = cA - e.A;
  const Z = cZ - e.Z;
  const known = Z >= 1 && Z <= 118;
  const el = known ? byZ(Z) : null;
  const sym = el ? el.symbol : '?';
  const note = HISTORY[`${t.label}|${p.label}|${e.label}`];
  const eq = `${t.tex} + ${p.tex} \\to {}^{${A}}_{${Z}}\\mathrm{${sym}} + ${e.tex}`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Row title="мишена:" items={TARGETS} value={ti} onChange={setTi} />
      <Row title="снаряд:" items={PROJECTILES} value={pi} onChange={setPi} />
      <Row title="излитат:" items={EMITTED} value={ei} onChange={setEi} />

      <LabSvg viewBox="0 0 480 150" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-2">
        <Ball x={50} y={60} A={t.A} label={t.label} cls="fill-sky-300 dark:fill-sky-600" />
        <text x={100} y={66} fontSize="18" textAnchor="middle" className="fill-gray-500">
          +
        </text>
        <Ball x={138} y={60} A={p.A} label={p.label} cls="fill-rose-300 dark:fill-rose-600" />
        <text x={190} y={66} fontSize="18" textAnchor="middle" className="fill-gray-500">
          →
        </text>
        <Ball x={250} y={60} A={cA} label={`съставно ядро, A = ${cA}`} cls="fill-violet-300 dark:fill-violet-600" />
        <text x={315} y={66} fontSize="18" textAnchor="middle" className="fill-gray-500">
          →
        </text>
        <Ball x={378} y={60} A={A} label={el ? `${el.symbol}-${A}` : `Z = ${Z}`} cls="fill-amber-300 dark:fill-amber-500" />
        {Array.from({ length: e.label.endsWith('n') ? e.A : 0 }, (_, k) => (
          <circle key={k} cx={438 + (k % 2) * 16} cy={40 + Math.floor(k / 2) * 18} r={5} className="fill-gray-400" />
        ))}
        {e.label === 'p' && <circle cx={440} cy={44} r={5} className="fill-rose-400" />}
        {e.label === 'γ' && (
          <path d="M 425 40 q 5 -8 10 0 t 10 0 t 10 0" fill="none" className="stroke-amber-500" strokeWidth="2" />
        )}
      </LabSvg>

      <div className="text-center my-3 overflow-x-auto">
        <Tex block>{eq}</Tex>
      </div>
      <Readout
        items={[
          { label: 'запазване:', value: `A: ${t.A} + ${p.A} = ${A} + ${e.A};  Z: ${t.Z} + ${p.Z} = ${Z} + ${e.Z}` },
          { label: 'продукт:', value: el ? `${el.name} (Z = ${Z})` : `елемент ${Z} – още не е получен`, tone: 'amber' },
        ]}
      />
      {note ? (
        <Note tone="emerald">{note}</Note>
      ) : (
        <Note tone={known ? 'blue' : 'amber'}>
          {known
            ? 'Уравнението е изравнено. Дали реакцията наистина върви и колко често, зависи от енергията на снаряда – при тежките ядра излизат само единични атоми.'
            : 'Елементи след оганесона (Z = 118) още не са получени – опитите за 119 и 120 продължават.'}
        </Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Свръхтежките елементи 114–118 са получени в Дубна с „горещо сливане“: тежка мишена от актиноид и снаряд калций-48 (рядък
        изотоп с много неутрони). Съставното ядро е силно възбудено и се охлажда, като изпуска 3–4 неутрона. Опитай да намериш
        историческите реакции – при тях се появява зелена бележка.
      </p>
    </div>
  );
}
