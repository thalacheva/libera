import { useId, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Readout } from '~/geometry/diagram';
import { deg, fmt, greatCircleKm, type LatLon } from '../geo';
import { centroid, fitProjection, landPath, moveOnSphere, planarArea, projectionById, ringContaining, sphericalAreaKm2 } from '../projections';

const W = 640;
const H = 400;
const MERCATOR = projectionById('mercator');
const { toScreen, scale, box } = fitProjection(MERCATOR, 0, 0, W, H, 0);
const LAND_PATH = landPath(MERCATOR, toScreen);

const SHAPES = [
  { name: 'Гренландия', at: { lat: 72, lon: -40 } },
  { name: 'Австралия', at: { lat: -25, lon: 134 } },
  { name: 'Мадагаскар', at: { lat: -19, lon: 46.9 } },
].map(s => {
  const pts = ringContaining(s.at);
  const center = centroid(pts);
  // Докъде може да се мести, без да прехвърли полюса (и без да излезе отвъд 82° на картата)
  const radius = Math.max(...pts.map(q => greatCircleKm(center, q))) / 111.19;
  return { name: s.name, pts, center, km2: sphericalAreaKm2(pts), maxLat: Math.floor(82 - radius) };
});

/** Дължините без скок през ±180°, близо до lon0. */
const unwrap = (pts: LatLon[], lon0: number) =>
  pts.map(q => {
    let lon = q.lon;
    while (lon - lon0 > 180) lon -= 360;
    while (lon - lon0 < -180) lon += 360;
    return { ...q, lon };
  });

const pathOf = (pts: LatLon[]) =>
  pts
    .map((q, i) => {
      const s = toScreen(q);
      return `${i ? 'L' : 'M'}${s.x.toFixed(1)} ${s.y.toFixed(1)}`;
    })
    .join('') + 'Z';

/** „Истинският размер“: местим държава по сферата и гледаме колко голяма изглежда на картата на Меркатор. */
export default function TrueSizeLab() {
  const [k, setK] = useState(0);
  const [lat, setLat] = useState(0);
  const [lon, setLon] = useState(20);
  const clip = useId();
  const shape = SHAPES[k];

  const moved = unwrap(moveOnSphere(shape.pts, shape.center, { lat, lon }), lon);
  const atEquator = unwrap(moveOnSphere(shape.pts, shape.center, { lat: 0, lon }), lon);
  const grow = planarArea(moved.map(toScreen)) / planarArea(atEquator.map(toScreen));
  const shown = pathOf(moved) + pathOf(moved.map(q => ({ ...q, lon: q.lon - 360 }))) + pathOf(moved.map(q => ({ ...q, lon: q.lon + 360 })));

  // Щракване по картата премества областта там (обратната проекция на Меркатор)
  const place = (e: React.MouseEvent<SVGSVGElement>) => {
    const m = e.currentTarget.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const x = (p.x - (box.x + box.w / 2)) / scale;
    const y = (box.y + box.h / 2 - p.y) / scale;
    setLon(Math.round(deg(x)));
    setLat(Math.max(-shape.maxLat, Math.min(shape.maxLat, Math.round(deg(Math.atan(Math.sinh(y)))))));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100 cursor-crosshair" onClick={place}>
        <clipPath id={clip}>
          <rect x={box.x} y={box.y} width={box.w} height={box.h} />
        </clipPath>
        <rect x={box.x} y={box.y} width={box.w} height={box.h} className="fill-sky-100 dark:fill-slate-900" />
        <g clipPath={`url(#${clip})`}>
          <path d={LAND_PATH} fillRule="evenodd" className="fill-emerald-200 stroke-emerald-500/60 dark:fill-emerald-900/70 dark:stroke-emerald-600/50" strokeWidth="0.6" />
          {[-60, -30, 0, 30, 60].map(la => {
            const y = toScreen({ lat: la, lon: 0 }).y;
            return <line key={la} x1={box.x} y1={y} x2={box.x + box.w} y2={y} className={la === 0 ? 'stroke-red-500/70' : 'stroke-gray-500/40'} strokeWidth={la === 0 ? 1.2 : 0.7} />;
          })}
          <path d={pathOf(shape.pts)} className="fill-none stroke-gray-700 dark:stroke-gray-200" strokeWidth="1.5" strokeDasharray="4 3" />
          <path d={shown} fillRule="evenodd" className="fill-fuchsia-500/55 stroke-fuchsia-700 dark:fill-fuchsia-400/50 dark:stroke-fuchsia-300" strokeWidth="1.5" />
        </g>
        {[-60, -30, 30, 60].map(la => (
          <text key={la} x={box.x + 4} y={toScreen({ lat: la, lon: 0 }).y - 3} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
            {Math.abs(la)}° {la > 0 ? 'с.ш.' : 'ю.ш.'}
          </text>
        ))}
      </LabSvg>

      <Buttons>
        {SHAPES.map((s, i) => (
          <DiagramButton
            key={s.name}
            active={k === i}
            onClick={() => {
              setK(i);
              setLat(v => Math.max(-s.maxLat, Math.min(s.maxLat, v)));
            }}
          >
            {s.name}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">Щракни по картата или премести плъзгачите. С пунктир е истинското място.</p>
      <Sliders>
        <Slider label="φ, °" value={lat} onChange={setLat} min={-shape.maxLat} max={shape.maxLat} step={1} tone="violet" />
        <Slider label="λ, °" value={lon} onChange={setLon} min={-180} max={180} step={1} tone="emerald" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'истинска площ', value: `≈ ${fmt(shape.km2 / 1e6, 2)} млн. km²` },
            { label: 'на картата', value: `${fmt(grow, 1)}× по-голяма, отколкото на екватора`, tone: 'rose' },
          ]}
        />
      </div>
    </div>
  );
}
