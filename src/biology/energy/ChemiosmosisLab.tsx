import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

/**
 * Опростен модел в стационарно състояние.
 * Изпомпване на H⁺ = E·(1 − p) (колкото по-голям е градиентът p, толкова по-трудно – „дихателен контрол“);
 * връщане = (S + L)·p през АТФ синтазата (S) и през пробивите в мембраната (L).
 * Равенството дава p = E / (E + S + L).
 */
function model(cyanide: boolean, oligomycin: boolean, dnp: number) {
  const E = cyanide ? 0 : 1;
  const S = oligomycin ? 0 : 1;
  const L = 0.1 + dnp;
  const p = E / (E + S + L || 1);
  return { o2: E * (1 - p), gradient: p, atp: S * p, heat: L * p };
}

const NORMAL = model(false, false, 0);
const pct = (v: number, ref: number) => Math.round((v / ref) * 100);

const BARS = [
  { key: 'o2', name: 'консумация на O₂', color: '#2563eb' },
  { key: 'gradient', name: 'градиент на H⁺', color: '#d97706' },
  { key: 'atp', name: 'синтез на АТФ', color: '#e11d48' },
  { key: 'heat', name: 'топлина', color: '#ea580c' },
] as const;

// Мембраната
const MY = 120;
const MH = 26;
const COMPLEXES = [
  { x: 60, name: 'I' },
  { x: 130, name: 'III' },
  { x: 200, name: 'IV' },
];
const SYNTH_X = 300;

/** Дихателната верига и АТФ синтазата: какво правят цианидът, олигомицинът и DNP. */
export default function ChemiosmosisLab() {
  const [cyanide, setCyanide] = useState(false);
  const [oligomycin, setOligomycin] = useState(false);
  const [dnp, setDnp] = useState(0);

  const m = model(cyanide, oligomycin, dnp);
  const values = { o2: m.o2, gradient: m.gradient, atp: m.atp, heat: m.heat };
  const refs = { o2: NORMAL.o2, gradient: NORMAL.gradient, atp: NORMAL.atp, heat: NORMAL.o2 }; // топлината – като дял от нормалния поток на енергия

  // H⁺ в междумембранното пространство – колкото по-голям градиент, толкова повече
  const nH = Math.round(m.gradient * 22);
  const protons = Array.from({ length: nH }, (_, i) => ({ x: 30 + ((i * 37) % 310), y: 40 + ((i * 23) % 50) }));
  const flow = (v: number) => (v < 0.02 ? 0 : 1 + v * 5);

  let note: string;
  if (cyanide) note = 'Цианидът блокира комплекс IV: електроните не стигат до кислорода, веригата спира, H⁺ не се изпомпват. Няма градиент – няма и АТФ. Затова цианидът убива за минути.';
  else if (oligomycin && dnp > 0) note = 'Олигомицинът е запушил АТФ синтазата, но DNP пуска H⁺ обратно през мембраната: веригата пак работи и консумира O₂, но цялата енергия става топлина.';
  else if (oligomycin) note = 'Олигомицинът запушва канала на АТФ синтазата. H⁺ се трупат, градиентът е голям и веригата почти спира – консумацията на O₂ пада, макар кислород да има. Това е дихателният контрол.';
  else if (dnp > 0) note = 'DNP пренася H⁺ през мембраната покрай синтазата (разпрягащ агент). Градиентът спада, веригата работи по-бързо и гори повече „гориво“, но АТФ е по-малко – енергията отива в топлина.';
  else note = 'Нормално: комплексите I, III и IV изпомпват H⁺ навън с енергията на електроните, а H⁺ се връщат през АТФ синтазата и тя прави АТФ.';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 260" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={12} y={22} fontSize="11.5" className="fill-amber-700 dark:fill-amber-300">
          междумембранно пространство
        </text>
        <text x={12} y={244} fontSize="11.5" className="fill-orange-700 dark:fill-orange-300">
          матрикс
        </text>
        {/* Мембраната */}
        <rect x={10} y={MY} width={360} height={MH} className="fill-yellow-100 stroke-yellow-500 dark:fill-yellow-500/20 dark:stroke-yellow-600" />
        {protons.map((q, i) => (
          <text key={i} x={q.x} y={q.y} fontSize="11" fontWeight="700" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400">
            H⁺
          </text>
        ))}

        {/* Комплексите и изпомпването */}
        {COMPLEXES.map(c => (
          <g key={c.name}>
            <rect x={c.x - 22} y={MY - 14} width={44} height={MH + 28} rx={10} className={cyanide && c.name === 'IV' ? 'fill-gray-400 dark:fill-gray-600' : 'fill-violet-400 dark:fill-violet-500'} />
            <text x={c.x} y={MY + MH / 2 + 4} fontSize="12" fontWeight="700" textAnchor="middle" fill="white">
              {c.name}
            </text>
            {flow(m.o2) > 0 && <line x1={c.x} x2={c.x} y1={MY - 18} y2={MY - 40} stroke="#d97706" strokeWidth={flow(m.o2)} markerEnd="url(#cm-up)" />}
          </g>
        ))}
        {cyanide && (
          <text x={200} y={MY + MH + 54} fontSize="11" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
            ☠ CN⁻
          </text>
        )}
        {/* Електроните и кислородът */}
        <text x={60} y={MY + MH + 34} fontSize="11" textAnchor="middle" fill="currentColor">
          НАДН
        </text>
        <path d={`M 60 ${MY + MH + 18} Q 130 ${MY + MH + 30} 190 ${MY + MH + 18}`} fill="none" className="stroke-violet-500" strokeDasharray="4 3" strokeWidth={flow(m.o2) ? 1.5 : 0.5} />
        <text x={232} y={MY + MH + 34} fontSize="11" textAnchor="middle" fill="currentColor">
          O₂ → H₂O
        </text>

        {/* АТФ синтазата */}
        <rect x={SYNTH_X - 12} y={MY - 8} width={24} height={MH + 16} rx={6} className={oligomycin ? 'fill-gray-400 dark:fill-gray-600' : 'fill-rose-500'} />
        <circle cx={SYNTH_X} cy={MY + MH + 26} r={18} className={oligomycin ? 'fill-gray-300 dark:fill-gray-600' : 'fill-rose-300 dark:fill-rose-500/60'} />
        {flow(m.atp) > 0 && <line x1={SYNTH_X + 26} x2={SYNTH_X + 26} y1={MY - 20} y2={MY + MH + 10} stroke="#d97706" strokeWidth={flow(m.atp)} markerEnd="url(#cm-up)" />}
        <text x={SYNTH_X} y={MY - 16} fontSize="11" textAnchor="middle" fill="currentColor">
          АТФ синтаза
        </text>
        <text x={SYNTH_X} y={MY + MH + 64} fontSize="11" textAnchor="middle" fill="currentColor">
          {oligomycin ? 'запушена' : 'АДФ + Ф → АТФ'}
        </text>
        {/* Пробив от DNP */}
        {dnp > 0 && (
          <g>
            <line x1={352} x2={352} y1={MY - 20} y2={MY + MH + 10} stroke="#ea580c" strokeWidth={1 + m.heat * 6} markerEnd="url(#cm-up)" />
            <text x={352} y={MY + MH + 30} fontSize="11" textAnchor="middle" className="fill-orange-600 dark:fill-orange-400">
              DNP
            </text>
          </g>
        )}

        {/* Стълбчетата – в % от нормалното */}
        <text x={505} y={22} fontSize="11.5" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          % от нормалното
        </text>
        {BARS.map((b, i) => {
          const v = pct(values[b.key], refs[b.key]);
          const x = 410 + i * 58;
          const h = Math.min(v, 300) * 0.55;
          return (
            <g key={b.key}>
              <line x1={x - 4} x2={x + 40} y1={200} y2={200} className="stroke-gray-400" />
              <line x1={x - 4} x2={x + 40} y1={200 - 55} y2={200 - 55} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="3 3" />
              <rect x={x + 6} y={200 - h} width={26} height={h} rx={3} fill={b.color} />
              <text x={x + 19} y={192 - h} fontSize="11" fontWeight="700" textAnchor="middle" fill="currentColor">
                {v > 300 ? '>300' : v}
              </text>
              {b.name.split(' ').map((w, j) => (
                <text key={j} x={x + 19} y={216 + j * 13} fontSize="10.5" textAnchor="middle" fill="currentColor">
                  {w}
                </text>
              ))}
            </g>
          );
        })}

        <defs>
          <marker id="cm-up" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#d97706" />
          </marker>
        </defs>
      </LabSvg>

      <Buttons>
        <DiagramButton active={cyanide} onClick={() => setCyanide(v => !v)}>
          {cyanide ? '✓ цианид' : '+ цианид'}
        </DiagramButton>
        <DiagramButton active={oligomycin} onClick={() => setOligomycin(v => !v)}>
          {oligomycin ? '✓ олигомицин' : '+ олигомицин'}
        </DiagramButton>
        <DiagramButton onClick={() => { setCyanide(false); setOligomycin(false); setDnp(0); }}>
          Нормално
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="DNP" value={dnp} onChange={setDnp} min={0} max={3} step={0.1} tone="amber" />
      </Sliders>
      <Note tone="violet">{note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Моделът е опростен и в условни единици: веригата изпомпва H⁺ толкова по-бавно, колкото по-голям е градиентът, а H⁺ се
        връщат през синтазата (→ АТФ) и през мембраната (→ топлина). Стрелките показват потока на H⁺; топлината е от изтичането на H⁺, в % от нормалната консумация на O₂. Опитай олигомицин и след това
        DNP – това е класически опит с изолирани митохондрии, в който консумацията на кислород се мери с кислороден електрод.
      </p>
    </div>
  );
}
