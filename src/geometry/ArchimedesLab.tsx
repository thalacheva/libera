import { useState } from 'react';
import { num } from '~/functions/functionMath';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note } from './diagram';

type Mode = 'cone' | 'sphere';
const W = 600;
const H = 250;

/** Обемите на конус, сфера и цилиндър с еднакъв радиус и височина 2r се отнасят 1 : 2 : 3. */
export function ArchimedesLab() {
  const [mode, setMode] = useState<Mode>('sphere');
  const [r, setR] = useState(3);
  const [h, setH] = useState(8);
  const height = mode === 'sphere' ? 2 * r : h;

  const vCyl = Math.PI * r * r * height;
  const vCone = vCyl / 3;
  const vSph = (4 / 3) * Math.PI * r ** 3;
  const bars = [
    { name: 'конус', v: vCone, frac: '⅓ πr²h', cls: 'fill-amber-500' },
    ...(mode === 'sphere' ? [{ name: 'сфера', v: vSph, frac: '⁴⁄₃ πr³', cls: 'fill-rose-500' }] : []),
    { name: 'цилиндър', v: vCyl, frac: 'πr²h', cls: 'fill-sky-500' },
  ];

  // Страничен разрез вляво
  const k = Math.min(18, 190 / Math.max(2 * r, height));
  const cx = 130;
  const base = H - 30;
  const top = base - height * k;
  const maxV = vCyl;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
      <Buttons>
        <DiagramButton active={mode === 'sphere'} onClick={() => setMode('sphere')}>
          сфера в цилиндър (h = 2r)
        </DiagramButton>
        <DiagramButton active={mode === 'cone'} onClick={() => setMode('cone')}>
          конус и цилиндър
        </DiagramButton>
      </Buttons>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto mt-3 text-gray-700 dark:text-gray-300">
        {/* Цилиндър */}
        <rect x={cx - r * k} y={top} width={2 * r * k} height={height * k} className="fill-sky-500/15 stroke-sky-500" strokeWidth="2" />
        <ellipse cx={cx} cy={top} rx={r * k} ry={r * k * 0.25} className="fill-sky-500/10 stroke-sky-500" strokeWidth="1.5" />
        <ellipse cx={cx} cy={base} rx={r * k} ry={r * k * 0.25} className="fill-none stroke-sky-500" strokeWidth="1.5" />
        {/* Конус */}
        <polygon points={`${cx - r * k},${base} ${cx + r * k},${base} ${cx},${top}`} className="fill-amber-500/25 stroke-amber-500" strokeWidth="2" />
        {mode === 'sphere' && <circle cx={cx} cy={(top + base) / 2} r={r * k} className="fill-rose-500/20 stroke-rose-500" strokeWidth="2" />}

        {/* Стълбове с обемите */}
        {bars.map((b, i) => {
          const x = 300 + i * 95;
          const bh = (b.v / maxV) * 170;
          return (
            <g key={b.name}>
              <rect x={x} y={base - bh} width={60} height={bh} rx={4} className={b.cls} />
              <text x={x + 30} y={base - bh - 8} fontSize="13" textAnchor="middle" fill="currentColor" fontWeight="700">
                {num(b.v, 1)}
              </text>
              <text x={x + 30} y={base + 18} fontSize="13" textAnchor="middle" fill="currentColor">
                {b.name}
              </text>
            </g>
          );
        })}
      </svg>

      <Sliders>
        <Slider label="r" value={r} onChange={setR} min={1} max={5} step={0.5} tone="rose" />
        {mode === 'cone' && <Slider label="h" value={h} onChange={setH} min={1} max={10} step={0.5} tone="blue" />}
      </Sliders>

      {mode === 'sphere' ? (
        <>
          <Formula>
            V(конус) : V(сфера) : V(цилиндър) = ⅔πr³ : ⁴⁄₃πr³ : 2πr³ = 1 : 2 : 3
          </Formula>
          <Note tone="rose">Сферата заема точно ⅔ от описания около нея цилиндър – и лицето ѝ 4πr² е ⅔ от пълната повърхнина на цилиндъра 6πr².</Note>
        </>
      ) : (
        <>
          <Formula>
            V(цилиндър) = πr²h = {num(vCyl, 2)}; &nbsp; V(конус) = ⅓πr²h = {num(vCone, 2)}
          </Formula>
          <Note tone="amber">При каквито и да е r и h конусът е точно ⅓ от цилиндъра със същата основа и височина.</Note>
        </>
      )}
    </div>
  );
}
