import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

/** Типични плътности (g/cm³) на пластмасите без пълнители; реалните парчета се различават с няколко стотни. */
const PLASTICS = [
  { code: 1, short: 'PET', rho: 1.38, fill: 'fill-sky-200' },
  { code: 2, short: 'HDPE', rho: 0.95, fill: 'fill-amber-200' },
  { code: 3, short: 'PVC', rho: 1.4, fill: 'fill-rose-200' },
  { code: 4, short: 'LDPE', rho: 0.92, fill: 'fill-lime-200' },
  { code: 5, short: 'PP', rho: 0.9, fill: 'fill-violet-200' },
  { code: 6, short: 'PS', rho: 1.05, fill: 'fill-orange-200' },
];

const LIQUIDS = [
  { name: 'спирт и вода', rho: 0.93 },
  { name: 'вода', rho: 1.0 },
  { name: 'наситен разтвор на NaCl', rho: 1.2 },
];

const dec = (v: number) => v.toFixed(2).replace('.', ',');
const TOP = 70; // повърхността на течността
const BOTTOM = 250;

export default function PlasticSortLab() {
  const [rho, setRho] = useState(1.0);
  const float = PLASTICS.filter(p => p.rho < rho - 1e-9);
  const sink = PLASTICS.filter(p => p.rho > rho + 1e-9);
  const hover = PLASTICS.filter(p => Math.abs(p.rho - rho) < 1e-9);

  // Плаващите – на повърхността, потъналите – на дъното, а с равна плътност – във водата
  // По три в ред: плаващите редове растат надолу от повърхността, потъналите – нагоре от дъното
  const place = (group: typeof PLASTICS, y: number, dir: number) =>
    group.map((p, i) => {
      const row = Math.floor(i / 3);
      const inRow = Math.min(3, group.length - row * 3);
      return { p, x: 240 - (inRow * 82) / 2 + (i % 3) * 82 + 2, y: y + dir * row * 28 };
    });
  const items = [...place(float, TOP - 12, 1), ...place(hover, (TOP + BOTTOM) / 2 - 12, 1), ...place(sink, BOTTOM - 26, -1)];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {LIQUIDS.map(l => (
          <DiagramButton key={l.name} active={Math.abs(l.rho - rho) < 1e-9} onClick={() => setRho(l.rho)}>
            {l.name} ({dec(l.rho)})
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 280" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        {/* съдът */}
        <rect x={110} y={TOP} width={260} height={BOTTOM - TOP + 10} className="fill-sky-100 dark:fill-sky-900/50" />
        <path d={`M 110 30 L 110 ${BOTTOM + 10} L 370 ${BOTTOM + 10} L 370 30`} fill="none" className="stroke-gray-500 dark:stroke-gray-300" strokeWidth="3" />
        <text x={378} y={TOP + 4} fontSize="11" className="fill-sky-700 dark:fill-sky-300">
          ρ = {dec(rho)} g/cm³
        </text>
        {items.map(({ p, x, y }) => (
          <g key={p.code}>
            <rect x={x} y={y} width={78} height={24} rx={5} className={`${p.fill} stroke-gray-500`} strokeWidth="1" />
            <text x={x + 39} y={y + 16} fontSize="11" fontWeight="700" textAnchor="middle" className="fill-gray-900">
              {p.code} {p.short}
            </text>
          </g>
        ))}
        <text x={240} y={274} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          числото е кодът за рециклиране в триъгълника от стрелки
        </text>
      </LabSvg>

      <Sliders>
        <Slider label="ρ, g/cm³" value={rho} onChange={v => setRho(Math.round(v * 100) / 100)} min={0.85} max={1.5} step={0.01} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'плуват:', value: float.map(p => `${p.short} (${dec(p.rho)})`).join(', ') || '—', tone: 'emerald' },
            { label: 'потъват:', value: sink.map(p => `${p.short} (${dec(p.rho)})`).join(', ') || '—', tone: 'rose' },
          ]}
        />
      </div>
      <Note tone={Math.abs(rho - 1.39) < 0.015 ? 'amber' : 'emerald'}>
        {Math.abs(rho - 1.39) < 0.015
          ? 'PET и PVC имат почти еднаква плътност. Истинските парчета се различават с няколко стотни и тук разделянето е ненадеждно – затова PVC в PET е голям проблем за рециклирането.'
          : 'Парче плува, когато плътността му е по-малка от тази на течността, и потъва, когато е по-голяма.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 В заводите за рециклиране смлените пластмаси се разделят точно така – във вани с вода или солеви разтвори. Полиолефините (PE и
        PP) плуват във вода, а PET и PVC потъват дори в наситен разтвор на сол. Плътностите са типични стойности; пълнители, пяна и
        оцветители ги променят.
      </p>
    </div>
  );
}
