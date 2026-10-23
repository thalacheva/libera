import { useRef, useState } from 'react';
import { useAnimationFrame } from '~/astronomy/components/useAnimationFrame';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

// Обща площ на напречното сечение на всеки вид съдове (по учебника на Гайтън) и спад на налягането в покой.
// Спадовете са приблизителни – подбрани са така, че при 5 L/min средното налягане в аортата е ≈ 93 mmHg,
// а в дясното предсърдие ≈ 3 mmHg.
const SEGMENTS = [
  { name: 'аорта', short: 'аорта', area: 2.5, drop: 2, d: '≈ 2–2,5 cm' },
  { name: 'малки артерии', short: 'артерии', area: 20, drop: 12, d: '≈ 0,1–4 mm' },
  { name: 'артериоли', short: 'артериоли', area: 40, drop: 45, d: '≈ 10–100 µm' },
  { name: 'капиляри', short: 'капиляри', area: 2500, drop: 18, d: '≈ 5–10 µm' },
  { name: 'венули', short: 'венули', area: 250, drop: 6, d: '≈ 10–100 µm' },
  { name: 'малки вени', short: 'вени', area: 80, drop: 5, d: '≈ 1–5 mm' },
  { name: 'кухи вени', short: 'кухи вени', area: 8, drop: 2, d: '≈ 2–3 cm' },
];
const P_RA = 3; // mmHg в дясното предсърдие
const ART = 2; // индекс на артериолите
const CAP_LEN = 0.5; // дължина на капиляр, mm

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

const X0 = 74;
const DX = 84;
const cx = (i: number) => X0 + i * DX;

/** Съдовото дърво: обща площ на сечението, скорост и налягане по пътя на кръвта; свиване на артериолите. */
export default function VesselTreeLab() {
  const [co, setCo] = useState(5); // L/min
  const [radius, setRadius] = useState(100); // % от нормалния радиус на артериолите
  const [sel, setSel] = useState(3);
  const [t, setT] = useState(0);
  const tRef = useRef(0);

  useAnimationFrame(true, dt => {
    tRef.current += dt;
    setT(tRef.current);
  });

  const q = (co * 1000) / 60; // cm³/s
  const f = radius / 100;
  // съпротивления, mmHg·min/L
  const res = SEGMENTS.map((s, i) => (s.drop / 5) * (i === ART ? 1 / f ** 4 : 1));
  const drops = res.map(r => r * co);
  const pIn: number[] = [];
  let p = P_RA + drops.reduce((a, b) => a + b, 0);
  const map = p;
  drops.forEach(d => {
    pIn.push(p);
    p -= d;
  });
  const v = SEGMENTS.map(s => q / s.area); // cm/s
  const tpr = (map - P_RA) / co;

  // графики
  const A_BASE = 120;
  const A_H = 80;
  const ay = (a: number) => A_BASE - (Math.log10(a) / 4) * A_H; // 1–10 000 cm²
  const V_TOP = 150;
  const V_H = 60;
  const VMAX = 100;
  const vyy = (u: number) => V_TOP + V_H * (1 - Math.min(u, VMAX) / VMAX);
  const P_TOP = 270;
  const P_H = 80;
  const PMAX = 200;
  const pyy = (u: number) => P_TOP + P_H * (1 - Math.min(u, PMAX) / PMAX);

  const pressurePath = SEGMENTS.map((_, i) => `${i ? 'L' : 'M'}${cx(i) - DX / 2} ${pyy(pIn[i])} L${cx(i) + DX / 2} ${pyy(pIn[i] - drops[i])}`).join(' ');
  const velPath = v.map((u, i) => `${i ? 'L' : 'M'}${cx(i)} ${vyy(u)}`).join(' ');

  const s = SEGMENTS[sel];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 372" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {SEGMENTS.map((seg, i) => (
          <g key={seg.name} onClick={() => setSel(i)} className="cursor-pointer">
            <rect x={cx(i) - DX / 2 + 2} y={12} width={DX - 4} height={350} rx={6} fill={i === sel ? '#fb7185' : 'transparent'} opacity={0.1} />
            <text x={cx(i)} y={24} fontSize="11" textAnchor="middle" fontWeight={i === sel ? 700 : 400} fill="currentColor">
              {seg.short}
            </text>
            {/* обща площ */}
            <rect x={cx(i) - 18} y={ay(seg.area)} width={36} height={A_BASE - ay(seg.area)} fill={i < 3 ? '#f43f5e' : i === 3 ? '#a855f7' : '#3b82f6'} opacity={0.75} />
            <text x={cx(i)} y={ay(seg.area) - 4} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              {fmt(seg.area, seg.area < 10 ? 1 : 0)}
            </text>
            {/* поток от точки: скоростта на екрана е пропорционална на корен от истинската, за да се вижда и в капилярите */}
            {[0, 1, 2].map(k => {
              const speed = 14 * Math.sqrt(v[i]);
              const y = V_TOP + V_H + 8 + ((k * 7 + t * speed) % 20) - 2;
              return <circle key={k} cx={cx(i) - 10 + k * 10} cy={y} r={2.5} fill="#e11d48" opacity={0.7} />;
            })}
          </g>
        ))}
        <text x={8} y={40} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
          обща
        </text>
        <text x={8} y={52} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
          площ, cm²
        </text>
        <line x1={30} x2={620} y1={A_BASE} y2={A_BASE} className="stroke-gray-300 dark:stroke-gray-600" />

        {/* скорост */}
        <text x={36} y={V_TOP - 10} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
          скорост v, cm/s
        </text>
        {[0, 50, 100].map(u => (
          <g key={u}>
            <line x1={36} x2={620} y1={vyy(u)} y2={vyy(u)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={30} y={vyy(u) + 4} fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {u}
            </text>
          </g>
        ))}
        <path d={velPath} fill="none" stroke="#059669" strokeWidth={2} />
        {v.map((u, i) => (
          <g key={i}>
            <circle cx={cx(i)} cy={vyy(u)} r={3.5} fill="#059669" />
            <text x={cx(i) + 6} y={vyy(u) - 5} fontSize="9" fill="#059669">
              {u >= 1 ? fmt(u, u >= 10 ? 0 : 1) : fmt(u, 3)}
            </text>
          </g>
        ))}

        {/* налягане */}
        <text x={36} y={P_TOP - 12} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
          средно налягане p, mmHg
        </text>
        {[0, 100, 200].map(u => (
          <g key={u}>
            <line x1={36} x2={620} y1={pyy(u)} y2={pyy(u)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={30} y={pyy(u) + 4} fontSize="9" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {u}
            </text>
          </g>
        ))}
        <path d={pressurePath} fill="none" stroke="#2563eb" strokeWidth={2.5} />
        <text x={cx(0) - DX / 2 + 4} y={pyy(map) - 6} fontSize="10" fill="#2563eb">
          {fmt(map, 0)}
        </text>
        <text x={cx(6) + DX / 2 - 4} y={pyy(P_RA) - 6} fontSize="10" textAnchor="end" fill="#2563eb">
          {P_RA}
        </text>
      </LabSvg>

      <Buttons>
        {SEGMENTS.map((seg, i) => (
          <DiagramButton key={seg.name} active={sel === i} onClick={() => setSel(i)}>
            {seg.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="L/min" value={co} onChange={setCo} min={3} max={15} step={0.5} tone="rose" />
        <Slider label="артериоли" value={radius} onChange={setRadius} min={70} max={130} step={1} tone="violet" />
      </Sliders>

      <Readout
        items={[
          { label: s.name, value: `${fmt(s.area, s.area < 10 ? 1 : 0)} cm² общо, всеки ${s.d}`, tone: 'violet' },
          { label: 'скорост', value: v[sel] >= 1 ? `${fmt(v[sel])} cm/s` : `${fmt(v[sel] * 10, 2)} mm/s`, tone: 'emerald' },
          { label: 'налягане', value: `${fmt(pIn[sel], 0)} → ${fmt(pIn[sel] - drops[sel], 0)} mmHg`, tone: 'blue' },
          sel === 3
            ? { label: 'време в капиляра', value: `${fmt(CAP_LEN / (v[3] * 10))} s`, tone: 'amber' }
            : { label: 'общо съпротивление', value: `${fmt(tpr, 1)} mmHg·min/L`, tone: 'amber' },
        ]}
      />
      <Formula>
        Q = A · v → v = {fmt(q, 0)} cm³/s : {fmt(s.area, s.area < 10 ? 1 : 0)} cm² = {v[sel] >= 1 ? `${fmt(v[sel])} cm/s` : `${fmt(v[sel], 3)} cm/s`} · средно налягане = Q · R + {P_RA} = {fmt(map, 0)} mmHg
      </Formula>
      <Note tone="rose">
        {radius <= 85
          ? `Радиусът на артериолите е само ${radius} %, но съпротивлението им е ${fmt(1 / f ** 4)} пъти по-голямо (r⁴!) – налягането в аортата скача, а в капилярите пада.`
          : radius >= 115
            ? 'Разширените артериоли (както при горещина или в работещ мускул) пропускат кръвта по-лесно – налягането в аортата пада.'
            : sel === 3
              ? 'Всеки капиляр е тънък, но те са милиарди – общото им сечение е около 1000 пъти по-голямо от аортата и кръвта почти спира. Така има време за обмен.'
              : sel === ART
                ? 'Най-големият спад на налягането е в артериолите – те са „крановете“, с които тялото разпределя кръвта.'
                : 'Целият поток минава през всяко ниво: колкото по-голямо е общото сечение, толкова по-бавна е кръвта (Q = A · v).'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Площите са общите за всички съдове от вида (по учебника на Гайтън), спадовете на налягането – приблизителни. Свий
        артериолите с 15 % и виж как се мени налягането; после увеличи минутния обем, както при бягане. Точките под графиката се
        движат пропорционално на корен квадратен от скоростта – иначе в капилярите изобщо не биха помръднали.
      </p>
    </div>
  );
}
