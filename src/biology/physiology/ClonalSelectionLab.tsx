import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

/** Рецепторът на всеки клон: три „зъбчета“ с височина 1–3 → 27 различни клона. */
const CLONES = Array.from({ length: 27 }, (_, k) => [Math.floor(k / 9) + 1, (Math.floor(k / 3) % 3) + 1, (k % 3) + 1]);

/** Антигените: всеки има епитоп с три „вдлъбнатини“; пасва клонът с допълващите зъбчета (1 ↔ 3, 2 ↔ 2). */
const ANTIGENS = [
  { name: '🦠 бактерия', epitope: [1, 3, 2], color: '#16a34a' },
  { name: '🧫 вирус', epitope: [3, 1, 1], color: '#7c3aed' },
  { name: '🌼 полен', epitope: [2, 2, 3], color: '#d97706' },
];

/** Колко антитела на секунда прави една плазмена клетка (по различни оценки – стотици до няколко хиляди). */
const AB_PER_S = 2000;
/** Деления на ден (около веднъж на 12 часа – грубо). */
const DIV_PER_DAY = 2;
/** Клетки на паметта, останали от първия отговор. */
const MEMORY = 1000;

const matches = (receptor: number[], epitope: number[]) => receptor.every((h, i) => h + epitope[i] === 4);

/** Рецептор (Y-образна „ключалка“) с три зъбчета нагоре. */
function Receptor({ x, y, teeth, color, s = 1 }: { x: number; y: number; teeth: number[]; color: string; s?: number }) {
  const w = 6 * s;
  return (
    <g>
      {teeth.map((h, i) => (
        <rect key={i} x={x + (i - 1.5) * w} y={y - h * 3 * s} width={w - 0.6} height={h * 3 * s} fill={color} />
      ))}
    </g>
  );
}

const fmtBig = (v: number) => {
  if (v < 1e5) return Math.round(v).toLocaleString('bg-BG');
  const e = Math.floor(Math.log10(v));
  return `${(v / 10 ** e).toFixed(1).replace('.', ',')} · 10^${e}`;
};
const sup = (s: string) => s.replace(/\^(\d+)/, (_, d: string) => d.split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]).join(''));

/** Клонална селекция: антигенът „избира“ единствения пасващ клон B-лимфоцити, той се размножава в плазмени клетки и клетки на паметта. */
export default function ClonalSelectionLab() {
  const [ag, setAg] = useState(0);
  const [days, setDays] = useState(0);
  const [memory, setMemory] = useState(false);

  const antigen = ANTIGENS[ag];
  const chosen = CLONES.findIndex(c => matches(c, antigen.epitope));
  // при втори отговор клетките на паметта започват по-рано – първия ден не се губи за откриване и активиране
  const effDays = memory ? Math.min(7, days + 1) : days;
  const divisions = Math.round(effDays * DIV_PER_DAY);
  const start = memory ? MEMORY : 1;
  const cells = start * 2 ** divisions;
  const plasma = days === 0 ? 0 : 0.9 * cells;
  const mem = days === 0 ? (memory ? MEMORY : 0) : 0.1 * cells;
  const abPerS = plasma * AB_PER_S;

  // нарисуваната група клетки – до 64
  const shown = Math.min(64, Math.round(cells));
  const nPlasma = days === 0 ? 0 : Math.round(shown * 0.9);

  let msg: string;
  if (days === 0)
    msg = memory
      ? `Антигенът отново е в тялото. Сега срещу него чакат около ${MEMORY} клетки на паметта от първата среща – а не една. Плъзни дните.`
      : `От милионите различни B-лимфоцити само клонът с рецептор, който пасва на епитопа (тук – № ${chosen + 1}), се свързва с антигена. Другите остават незасегнати – антигенът „избира“ клона, а не го създава.`;
  else if (!memory && divisions < 8)
    msg = 'Избраният лимфоцит (с помощта на T-хелпер) се дели отново и отново. Докато клонът е малък, антителата са още малко – затова при първа среща болестта има време да се развие.';
  else
    msg = `${days} дни: ${sup(fmtBig(cells))} клетки от един и същ клон – всички с еднакъв рецептор. Около 9 от 10 са плазмени клетки, които изливат антитела, а останалите са клетки на паметта.${memory ? ' Тъй като започнахме от клетките на паметта, клонът е хиляди пъти по-голям за същото време – това е вторичният отговор.' : ''}`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 320" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={20} y={22} fontSize="12" fontWeight="700" fill="currentColor">27 наивни клона B-лимфоцити</text>
        {CLONES.map((c, k) => {
          const cx = 40 + (k % 9) * 34;
          const cy = 70 + Math.floor(k / 9) * 70;
          const hit = k === chosen;
          return (
            <g key={k} opacity={hit ? 1 : 0.55}>
              <circle cx={cx} cy={cy} r={13} fill={hit ? '#fde68a' : '#e5e7eb'} stroke={hit ? '#e11d48' : '#9ca3af'} strokeWidth={hit ? 2.5 : 1} />
              <Receptor x={cx} y={cy - 13} teeth={c} color={hit ? '#e11d48' : '#6b7280'} />
              <text x={cx} y={cy + 27} fontSize="9" textAnchor="middle" fill="currentColor">{k + 1}</text>
            </g>
          );
        })}

        {/* антигенът над избрания клон */}
        {(() => {
          const cx = 40 + (chosen % 9) * 34;
          const cy = 70 + Math.floor(chosen / 9) * 70 - 13;
          return (
            <g>
              {antigen.epitope.map((h, i) => (
                <rect key={i} x={cx + (i - 1.5) * 6} y={cy - 13} width={5.4} height={1 + 3 * h} fill={antigen.color} opacity={0.85} />
              ))}
            </g>
          );
        })()}

        {/* епитопът отделно, в увеличение */}
        <text x={20} y={268} fontSize="12" fill="currentColor">епитоп на антигена:</text>
        <g>
          {antigen.epitope.map((h, i) => (
            <rect key={i} x={150 + i * 14} y={244} width={13} height={(1 + 3 * h) * 2} fill={antigen.color} />
          ))}
        </g>
        <text x={205} y={268} fontSize="12" fill="currentColor">рецептор, който пасва:</text>
        <Receptor x={372} y={276} teeth={CLONES[chosen]} color="#e11d48" s={2.2} />

        {/* размножилият се клон */}
        <line x1={335} x2={335} y1={10} y2={240} className="stroke-gray-200 dark:stroke-gray-700" />
        <text x={350} y={22} fontSize="12" fontWeight="700" fill="currentColor">
          клон № {chosen + 1} след {days} {days === 1 ? 'ден' : 'дни'}
        </text>
        {Array.from({ length: shown }, (_, k) => {
          const cx = 365 + (k % 8) * 30;
          const cy = 48 + Math.floor(k / 8) * 26;
          const isPlasma = k < nPlasma;
          return (
            <g key={k}>
              <circle cx={cx} cy={cy} r={isPlasma ? 10 : 9} fill={isPlasma ? '#c4b5fd' : '#6ee7b7'} stroke={isPlasma ? '#7c3aed' : '#059669'} />
              {isPlasma && <text x={cx + 7} y={cy - 6} fontSize="9" fill="#7c3aed">Y</text>}
            </g>
          );
        })}
        {cells > 64 && (
          <text x={485} y={262} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            (показани са 64 от {sup(fmtBig(cells))})
          </text>
        )}
        <g fontSize="11" fill="currentColor">
          <circle cx={360} cy={292} r={6} fill="#c4b5fd" stroke="#7c3aed" />
          <text x={370} y={296}>плазмена клетка</text>
          <circle cx={480} cy={292} r={6} fill="#6ee7b7" stroke="#059669" />
          <text x={490} y={296}>клетка на паметта</text>
        </g>
      </LabSvg>

      <Buttons>
        {ANTIGENS.map((a, k) => (
          <DiagramButton key={a.name} active={ag === k} onClick={() => setAg(k)}>
            {a.name}
          </DiagramButton>
        ))}
        <DiagramButton active={memory} onClick={() => setMemory(m => !m)}>
          🧠 втора среща (има памет)
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="дни" value={days} onChange={setDays} min={0} max={7} step={1} tone="violet" />
      </Sliders>

      <Readout
        items={[
          { label: 'деления', value: String(divisions), tone: 'gray' },
          { label: 'клетки', value: sup(fmtBig(cells)), tone: 'violet' },
          { label: 'памет', value: sup(fmtBig(mem)), tone: 'emerald' },
          { label: 'антитела/s', value: sup(fmtBig(abPerS)), tone: 'rose' },
        ]}
      />
      <Note tone="violet">{msg}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Моделът: рецепторът и епитопът пасват, когато зъбчетата и вдлъбнатините се допълват. Активираният лимфоцит се дели около
        {DIV_PER_DAY === 2 ? ' два пъти' : ` ${DIV_PER_DAY} пъти`} на ден (грубо), 9 от 10 дъщерни клетки стават плазмени и всяка прави около {AB_PER_S} антитела в
        секунда (оценките варират). Истинските клонове са не 27, а милиони до милиарди: тежката верига се сглобява от около 40 V, 25 D и 6 J
        гена (6000 начина), леката – по около 320 начина; заедно 6000 · 320 ≈ 1,9 милиона, а неточните съединения добавят още много пъти
        повече.
      </p>
    </div>
  );
}
