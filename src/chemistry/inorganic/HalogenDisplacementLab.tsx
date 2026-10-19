import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Halogen = { x: string; name: string; e0: number; water: string; hexane: string; waterName: string; hexaneName: string };

// Стандартни електродни потенциали X₂/X⁻ (V) и цветовете на халогена във вода и в хексан
const HALOGENS: Halogen[] = [
  { x: 'Cl', name: 'хлорна вода', e0: 1.36, water: '#e4f2a6', hexane: '#eef7c8', waterName: 'бледо жълтозелена', hexaneName: 'почти безцветен' },
  { x: 'Br', name: 'бромна вода', e0: 1.09, water: '#f2a541', hexane: '#e8622a', waterName: 'жълтооранжева', hexaneName: 'оранжевочервен' },
  { x: 'I', name: 'йодна вода', e0: 0.54, water: '#b9772c', hexane: '#9b4dca', waterName: 'жълтокафява', hexaneName: 'виолетов' },
];
const SALTS = ['KCl', 'KBr', 'KI'];
const SUB = (x: string) => `${x}₂`;
const WATER = '#e3f1fb';

/** Епруветка с течни слоеве (отдолу нагоре). */
function Tube({ x, layers, label }: { x: number; layers: { color: string; h: number }[]; label: string }) {
  const top = 40;
  const bottom = 178;
  const w = 34;
  let y = bottom;
  return (
    <g>
      <defs>
        <clipPath id={`tube-${x}`}>
          <path d={`M ${x} ${top} L ${x} ${bottom - w / 2} A ${w / 2} ${w / 2} 0 0 0 ${x + w} ${bottom - w / 2} L ${x + w} ${top} Z`} />
        </clipPath>
      </defs>
      <g clipPath={`url(#tube-${x})`}>
        {layers.map((l, i) => {
          y -= l.h;
          return <rect key={i} x={x} y={y} width={w} height={l.h + 0.5} fill={l.color} />;
        })}
      </g>
      <path
        d={`M ${x} ${top - 4} L ${x} ${bottom - w / 2} A ${w / 2} ${w / 2} 0 0 0 ${x + w} ${bottom - w / 2} L ${x + w} ${top - 4}`}
        fill="none"
        className="stroke-gray-500 dark:stroke-gray-300"
        strokeWidth="1.5"
      />
      <text x={x + w / 2} y={bottom + 16} fontSize="11" textAnchor="middle" fill="currentColor">
        {label}
      </text>
    </g>
  );
}

/** Халоген + разтвор на халогенид: кой халоген измества кой. */
export default function HalogenDisplacementLab() {
  const [hi, setHi] = useState(0);
  const [si, setSi] = useState(1);
  const [hexane, setHexane] = useState(true);
  const h = HALOGENS[hi];
  const s = HALOGENS[si];
  const reacts = h.e0 > s.e0;
  // В епруветката остава халогенът, който е свободен след реакцията
  const free = reacts ? s : h;

  const result = hexane
    ? [
        { color: free.water, h: 52 },
        { color: free.hexane, h: 30 },
      ]
    : [{ color: free.water, h: 82 }];

  const cell = (r: number, c: number) => HALOGENS[r].e0 > HALOGENS[c].e0;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {HALOGENS.map((x, i) => (
          <DiagramButton key={x.x} active={i === hi} onClick={() => setHi(i)}>
            {x.name} ({SUB(x.x)})
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {SALTS.map((x, i) => (
          <DiagramButton key={x} active={i === si} onClick={() => setSi(i)}>
            разтвор на {x}
          </DiagramButton>
        ))}
        <DiagramButton active={hexane} onClick={() => setHexane(!hexane)}>
          {hexane ? '✓ ' : ''}добави хексан
        </DiagramButton>
      </Buttons>

      <LabSvg viewBox="0 0 480 210" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <Tube x={20} layers={[{ color: h.water, h: 70 }]} label={SUB(h.x)} />
        <text x={70} y={110} fontSize="18" textAnchor="middle" className="fill-gray-500">
          +
        </text>
        <Tube x={86} layers={[{ color: WATER, h: 70 }]} label={SALTS[si]} />
        <text x={154} y={112} fontSize="18" textAnchor="middle" className="fill-gray-500">
          →
        </text>
        <Tube x={176} layers={hexane ? [result[0], result[1]] : result} label="след разклащане" />
        {hexane && (
          <text x={216} y={115} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
            ← хексан
          </text>
        )}
        {hexane && (
          <text x={216} y={156} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
            ← вода
          </text>
        )}

        {/* Таблица на всички комбинации */}
        <text x={385} y={22} fontSize="11" fontWeight="600" textAnchor="middle" fill="currentColor">
          протича ли реакция?
        </text>
        {SALTS.map((x, c) => (
          <text key={x} x={330 + c * 50} y={48} fontSize="11" textAnchor="middle" fill="currentColor">
            {x}
          </text>
        ))}
        {HALOGENS.map((x, r) => (
          <g key={x.x}>
            <text x={292} y={78 + r * 40} fontSize="11" textAnchor="end" fill="currentColor">
              {SUB(x.x)}
            </text>
            {SALTS.map((_, c) => {
              const active = r === hi && c === si;
              return (
                <g key={c} onClick={() => {
                    setHi(r);
                    setSi(c);
                  }} className="cursor-pointer">
                  <rect
                    x={308 + c * 50}
                    y={58 + r * 40}
                    width={44}
                    height={32}
                    rx={5}
                    className={cell(r, c) ? 'fill-emerald-100 dark:fill-emerald-900/50' : 'fill-gray-100 dark:fill-gray-700'}
                    stroke={active ? '#d97706' : 'none'}
                    strokeWidth={active ? 2.5 : 0}
                  />
                  <text x={330 + c * 50} y={79 + r * 40} fontSize="14" textAnchor="middle" className={cell(r, c) ? 'fill-emerald-700 dark:fill-emerald-300' : 'fill-gray-400'}>
                    {cell(r, c) ? '✓' : '—'}
                  </text>
                </g>
              );
            })}
          </g>
        ))}
        <text x={385} y={198} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          щракни на клетка, за да я избереш
        </text>
      </LabSvg>

      <div className="mt-3">
        <Readout
          items={[
            { label: `E°(${SUB(h.x)}/${h.x}⁻) =`, value: `${h.e0.toFixed(2).replace('.', ',')} V`, tone: 'amber' },
            { label: `E°(${SUB(s.x)}/${s.x}⁻) =`, value: `${s.e0.toFixed(2).replace('.', ',')} V`, tone: 'blue' },
          ]}
        />
      </div>
      <Note tone={reacts ? 'emerald' : 'amber'}>
        {reacts
          ? `${SUB(h.x)} + 2K${s.x} → 2K${h.x} + ${SUB(s.x)}. ${SUB(h.x)} е по-силен окислител и „взима“ електроните на ${s.x}⁻. Водата става ${s.waterName}${hexane ? `, а хексанът извлича ${SUB(s.x)} и е ${s.hexaneName}` : ''}.`
          : hi === si
            ? `Халогенът и халогенидът са от един и същ елемент – няма какво да се измести.`
            : `Не протича: ${SUB(h.x)} е по-слаб окислител от ${SUB(s.x)} и не може да отнеме електроните на ${s.x}⁻. Цветът е на добавения ${SUB(h.x)}.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Хексанът не се смесва с водата и е по-лек от нея, затова е отгоре. Халогените се разтварят в него по-добре, отколкото във вода, и
        цветът се вижда ясно – така се различава бромът от йода. По-нагоре в групата халогенът е по-силен окислител: F₂ &gt; Cl₂ &gt; Br₂
        &gt; I₂. Цветовете на рисунката са приблизителни.
      </p>
    </div>
  );
}
