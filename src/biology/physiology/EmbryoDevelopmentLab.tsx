import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

/** Диаметър на човешката зигота, µm. */
const D0 = 100;

const STAGES = [
  { name: 'зигота', n: 0, time: 'ден 0' },
  { name: '2 бластомера', n: 1, time: '≈ 1 ден' },
  { name: '4 бластомера', n: 2, time: '≈ 2 дни' },
  { name: '8 бластомера', n: 3, time: '≈ 3 дни' },
  { name: 'морула', n: 4, time: '≈ 3–4 дни' },
  { name: 'морула', n: 5, time: '≈ 4 дни' },
  { name: 'бластула', n: 7, time: '≈ 5 дни' },
  { name: 'гаструла', n: -1, time: '≈ 3-та седмица' },
  { name: 'неврула', n: -1, time: '≈ 4-та седмица' },
] as const;

type Layer = 'ecto' | 'meso' | 'endo';
const LAYERS: Record<Layer, { name: string; color: string; forms: string }> = {
  ecto: { name: 'ектодерма', color: '#38bdf8', forms: 'кожата (епидермиса), косми и нокти, нервната система, лещата на окото, емайла на зъбите' },
  meso: { name: 'мезодерма', color: '#f43f5e', forms: 'мускулите, костите и хрущялите, сърцето, кръвта и кръвоносните съдове, бъбреците, половите жлези' },
  endo: { name: 'ендодерма', color: '#facc15', forms: 'лигавицата на храносмилателната система, белите дробове, черния дроб, задстомашната и щитовидната жлеза' },
};

const CX = 200;
const CY = 175;
const R = 120;

/** Клетките при браздяването: N кръга в обвивка с постоянен размер (подредени „слънчогледово“). */
function cells(N: number) {
  if (N === 1) return [{ x: CX, y: CY, r: R - 8 }];
  if (N === 2)
    return [
      { x: CX - 56, y: CY, r: 56 },
      { x: CX + 56, y: CY, r: 56 },
    ];
  const r = (R - 6) * Math.sqrt(0.72 / N);
  const out: { x: number; y: number; r: number }[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let k = 0; k < N; k++) {
    const rr = (R - 6 - r) * Math.sqrt((k + 0.5) / N);
    out.push({ x: CX + rr * Math.cos(k * golden), y: CY + rr * Math.sin(k * golden), r });
  }
  return out;
}

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

/** Браздяване → бластула → гаструла → неврула; зародишните листове и какво образуват. */
export default function EmbryoDevelopmentLab() {
  const [stage, setStage] = useState(0);
  const [layer, setLayer] = useState<Layer | null>(null);
  const s = STAGES[stage];
  const cleaving = s.n >= 0 && stage < 6;
  const N = s.n >= 0 ? 2 ** s.n : 0;
  const dCell = s.n >= 0 ? D0 / 2 ** (s.n / 3) : 0;

  const hi = (l: Layer) => (layer === null || layer === l ? 1 : 0.25);
  const ring = (r1: number, r2: number) =>
    `M ${CX - r2} ${CY} A ${r2} ${r2} 0 1 0 ${CX + r2} ${CY} A ${r2} ${r2} 0 1 0 ${CX - r2} ${CY} M ${CX - r1} ${CY} A ${r1} ${r1} 0 1 1 ${CX + r1} ${CY} A ${r1} ${r1} 0 1 1 ${CX - r1} ${CY} Z`;

  let msg: string;
  if (stage === 0) msg = 'Оплодената яйцеклетка – зиготата – е една клетка с диплоиден набор (2n). Обвивката около нея (прозрачната зона) остава със същия размер през следващите дни.';
  else if (cleaving)
    msg = `Браздяване: клетките (бластомерите) се делят митотично, без да растат между деленията. След ${s.n} деления те са ${N}, а всяка е ${N} пъти по-малка по обем – диаметърът ѝ е около ${fmt(dCell, 0)} µm.`;
  else if (stage === 6)
    msg = 'Бластула: кухо топче от клетки с течност в средата (бластоцел). При бозайниците се нарича бластоциста: външните клетки (трофобласт) ще образуват част от плацентата, а от вътрешната клетъчна маса се развива самият зародиш.';
  else if (stage === 7)
    msg = 'Гаструлация: клетки се вгъват навътре през първичната уста (бластопора) и се образуват три зародишни листа. Цъкни върху лист, за да видиш какво ще образува.';
  else msg = 'Неврулация: над хордата ектодермата се удебелява в нервна пластинка, тя се свива в нервна тръба – бъдещият главен и гръбначен мозък. Отстрани мезодермата се нарязва на сомити – бъдещите прешлени и мускули.';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 360" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {stage <= 6 && <circle cx={CX} cy={CY} r={R + 6} fill="none" stroke="#a8a29e" strokeWidth={5} opacity={0.6} />}
        {cleaving &&
          cells(N).map((c, k) => <circle key={k} cx={c.x} cy={c.y} r={c.r} fill="#fecdd3" stroke="#e11d48" strokeWidth={N > 16 ? 1 : 1.5} />)}
        {stage === 0 && (
          <g>
            <circle cx={CX} cy={CY} r={22} fill="#fda4af" stroke="#be123c" />
            <text x={CX} y={CY + 4} fontSize="12" textAnchor="middle" fill="#881337">ядро</text>
          </g>
        )}
        {stage === 6 && (
          <g>
            {Array.from({ length: 40 }, (_, k) => {
              const a = (k / 40) * 2 * Math.PI;
              return <circle key={k} cx={CX + (R - 10) * Math.cos(a)} cy={CY + (R - 10) * Math.sin(a)} r={9.5} fill="#fecdd3" stroke="#e11d48" />;
            })}
            {Array.from({ length: 12 }, (_, k) => (
              <circle key={k} cx={CX - 40 + (k % 6) * 16} cy={CY - 88 + Math.floor(k / 6) * 15} r={8} fill="#fb7185" stroke="#be123c" />
            ))}
            <text x={CX} y={CY + 20} fontSize="12" textAnchor="middle" fill="currentColor">бластоцел</text>
            <text x={CX} y={CY - 40} fontSize="11" textAnchor="middle" fill="#be123c">вътрешна клетъчна маса</text>
          </g>
        )}
        {stage === 7 && (
          <g>
            <path d={ring(R - 18, R)} fill={LAYERS.ecto.color} opacity={hi('ecto')} onClick={() => setLayer('ecto')} style={{ cursor: 'pointer' }} fillRule="evenodd" />
            <path d={ring(R - 34, R - 20)} fill={LAYERS.meso.color} opacity={hi('meso')} onClick={() => setLayer('meso')} style={{ cursor: 'pointer' }} fillRule="evenodd" />
            <path
              d={`M ${CX - 20} ${CY + R - 30} C ${CX - 70} ${CY + 20}, ${CX - 70} ${CY - 60}, ${CX} ${CY - 60} C ${CX + 70} ${CY - 60}, ${CX + 70} ${CY + 20}, ${CX + 20} ${CY + R - 30} Z`}
              fill={LAYERS.endo.color}
              opacity={hi('endo')}
              onClick={() => setLayer('endo')}
              style={{ cursor: 'pointer' }}
            />
            <path
              d={`M ${CX - 8} ${CY + R + 2} C ${CX - 40} ${CY + 10}, ${CX - 40} ${CY - 40}, ${CX} ${CY - 40} C ${CX + 40} ${CY - 40}, ${CX + 40} ${CY + 10}, ${CX + 8} ${CY + R + 2} Z`}
              className="fill-white dark:fill-gray-800"
            />
            <text x={CX} y={CY - 5} fontSize="11" textAnchor="middle" fill="currentColor">първично</text>
            <text x={CX} y={CY + 9} fontSize="11" textAnchor="middle" fill="currentColor">черво</text>
            <text x={CX} y={CY + R + 22} fontSize="11" textAnchor="middle" fill="currentColor">бластопор</text>
          </g>
        )}
        {stage === 8 && (
          <g>
            <ellipse cx={CX} cy={CY} rx={R} ry={R - 15} fill={LAYERS.ecto.color} opacity={hi('ecto')} onClick={() => setLayer('ecto')} style={{ cursor: 'pointer' }} />
            <ellipse cx={CX} cy={CY + 8} rx={R - 16} ry={R - 33} fill={LAYERS.meso.color} opacity={hi('meso')} onClick={() => setLayer('meso')} style={{ cursor: 'pointer' }} />
            <ellipse cx={CX} cy={CY + 30} rx={R - 50} ry={R - 85} fill={LAYERS.endo.color} opacity={hi('endo')} onClick={() => setLayer('endo')} style={{ cursor: 'pointer' }} />
            <ellipse cx={CX} cy={CY + 30} rx={R - 66} ry={R - 100} className="fill-white dark:fill-gray-800" />
            <circle cx={CX} cy={CY - R + 32} r={17} fill={LAYERS.ecto.color} stroke="#0369a1" strokeWidth={2} opacity={hi('ecto')} onClick={() => setLayer('ecto')} style={{ cursor: 'pointer' }} />
            <circle cx={CX} cy={CY - R + 32} r={6} className="fill-white dark:fill-gray-800" />
            <circle cx={CX} cy={CY - 42} r={10} fill="#a3a3a3" />
            {[-1, 1].map(sg => (
              <rect key={sg} x={CX + sg * 62 - 14} y={CY - 58} width={28} height={30} rx={5} fill="#be123c" opacity={0.8 * hi('meso')} />
            ))}
            <text x={CX + 28} y={CY - R + 22} fontSize="11" fill="currentColor">нервна тръба</text>
            <text x={CX + 16} y={CY - 38} fontSize="11" fill="currentColor">хорда</text>
            <text x={CX + 80} y={CY - 40} fontSize="11" fill="currentColor">сомит</text>
            <text x={CX} y={CY + 34} fontSize="11" textAnchor="middle" fill="currentColor">черво</text>
          </g>
        )}

        {/* дясно: числа или листове */}
        {cleaving || stage === 6 ? (
          <g>
            <text x={360} y={60} fontSize="13" fontWeight="700" fill="currentColor">браздяване</text>
            {[0, 1, 2, 3, 4, 5, 6, 7].map(n => {
              const y = 85 + n * 30;
              const active = s.n === n;
              const w = D0 / 2 ** (n / 3);
              return (
                <g key={n} opacity={active ? 1 : 0.55}>
                  <text x={360} y={y + 4} fontSize="12" fill="currentColor" fontWeight={active ? 700 : 400}>
                    {n} дел. → {2 ** n}
                  </text>
                  <rect x={470} y={y - 6} width={w} height={10} rx={2} fill="#e11d48" opacity={active ? 0.9 : 0.4} />
                  <text x={474 + w} y={y + 4} fontSize="11" fill="currentColor">{fmt(D0 / 2 ** (n / 3), 0)} µm</text>
                </g>
              );
            })}
          </g>
        ) : (
          <g>
            <text x={360} y={60} fontSize="13" fontWeight="700" fill="currentColor">зародишни листове</text>
            {(Object.keys(LAYERS) as Layer[]).map((l, k) => (
              <g key={l} onClick={() => setLayer(layer === l ? null : l)} style={{ cursor: 'pointer' }} opacity={hi(l)}>
                <rect x={360} y={80 + k * 34} width={22} height={22} rx={4} fill={LAYERS[l].color} />
                <text x={390} y={96 + k * 34} fontSize="13" fill="currentColor" fontWeight={layer === l ? 700 : 400}>
                  {LAYERS[l].name}
                </text>
              </g>
            ))}
          </g>
        )}
      </LabSvg>

      <Sliders>
        <Slider label="етап" value={stage} onChange={v => setStage(Math.round(v))} min={0} max={STAGES.length - 1} step={1} tone="rose" />
      </Sliders>
      {stage >= 7 && (
        <Buttons>
          {(Object.keys(LAYERS) as Layer[]).map(l => (
            <DiagramButton key={l} active={layer === l} onClick={() => setLayer(layer === l ? null : l)}>
              {LAYERS[l].name}
            </DiagramButton>
          ))}
        </Buttons>
      )}
      <Readout
        items={[
          { label: 'етап', value: s.name, tone: 'rose' },
          { label: 'при човека', value: s.time, tone: 'gray' },
          ...(s.n >= 0 ? [{ label: 'клетки', value: N, tone: 'blue' as const }, { label: 'диаметър на клетка', value: `≈ ${fmt(dCell, 0)} µm`, tone: 'amber' as const }] : []),
        ]}
      />
      <Note tone="rose">{msg}</Note>
      {stage >= 7 && layer && (
        <p className="mt-2 text-center text-sm text-gray-700 dark:text-gray-300">
          <strong>{LAYERS[layer].name}</strong> → {LAYERS[layer].forms}
        </p>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 При браздяването общият обем остава почти същият, затова след n деления всяка клетка има обем V₀/2ⁿ, а диаметърът ѝ е d₀/2^(n/3)
        (d₀ ≈ 100 µm за човека). Рисунките са схеми; при бозайниците деленията не са съвсем синхронни и бластоцистата на 5. ден има около
        100–200 клетки. Гаструлата и неврулата са показани като напречен разрез на гръбначно животно.
      </p>
    </div>
  );
}
