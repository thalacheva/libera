import { useId, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Readout } from '~/geometry/diagram';
import { deg, fmt, rad } from '../geo';
import { PROJECTIONS, fitProjection, landPath, outlinePath, planarArea, projectionById, ringContaining, sphericalAreaKm2, tissotPath, type ProjectionId } from '../projections';

const W = 640;
const H = 330;
const SHORT: Record<ProjectionId, string> = {
  equirect: 'Равнопромежутъчна',
  mercator: 'Меркатор',
  peters: 'Гал–Петерс',
  mollweide: 'Молвайде',
  azimuthal: 'Азимутална',
};

const GREENLAND = ringContaining({ lat: 72, lon: -40 });
const AUSTRALIA = ringContaining({ lat: -25, lon: 134 });
const REAL_RATIO = sphericalAreaKm2(GREENLAND) / sphericalAreaKm2(AUSTRALIA);

const meridian = (lon: number) => Array.from({ length: 91 }, (_, i) => ({ lat: -90 + i * 2, lon }));
const parallel = (lat: number) => Array.from({ length: 181 }, (_, i) => ({ lat, lon: -180 + i * 2 }));

/** Една и съща Земя в пет проекции: окръжностите на Тисо показват изкривяванията. */
export default function ProjectionLab() {
  const [id, setId] = useState<ProjectionId>('mercator');
  const [tissot, setTissot] = useState(true);
  const [lat, setLat] = useState(60);
  const clip = useId();

  const p = projectionById(id);
  const { toScreen } = fitProjection(p, 0, 0, W, H);
  const line = (pts: { lat: number; lon: number }[]) =>
    pts
      .map((q, i) => {
        const s = toScreen(q);
        return `${i ? 'L' : 'M'}${s.x.toFixed(1)} ${s.y.toFixed(1)}`;
      })
      .join('');

  const sc = p.scales(rad(Math.min(lat, 89.9)));
  const area = sc ? sc.h * sc.k : 1;
  const omega = sc ? 2 * deg(Math.asin(Math.abs(sc.h - sc.k) / (sc.h + sc.k))) : null;
  const mapRatio = planarArea(GREENLAND.map(toScreen)) / planarArea(AUSTRALIA.map(toScreen));

  const centers: { lat: number; lon: number }[] = [];
  for (const la of [-60, -30, 0, 30, 60]) for (let lo = -150; lo <= 150; lo += 30) centers.push({ lat: la, lon: lo });
  if (id === 'azimuthal') for (let lo = -150; lo <= 180; lo += 30) centers.push({ lat: 80, lon: lo });

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <clipPath id={clip}>
          <path d={outlinePath(p, toScreen)} />
        </clipPath>
        <path d={outlinePath(p, toScreen)} className="fill-sky-100 stroke-gray-400 dark:fill-slate-900 dark:stroke-gray-500" strokeWidth="1" />
        <g clipPath={`url(#${clip})`}>
          <path d={landPath(p, toScreen)} fillRule="evenodd" className="fill-emerald-200 stroke-emerald-500/60 dark:fill-emerald-900/70 dark:stroke-emerald-600/50" strokeWidth="0.6" />
          {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150, 180].map(lo => (
            <path key={`m${lo}`} d={line(meridian(lo))} fill="none" className="stroke-gray-500/40" strokeWidth="0.7" />
          ))}
          {[-60, -30, 0, 30, 60].map(la => (
            <path key={`p${la}`} d={line(parallel(la))} fill="none" className={la === 0 ? 'stroke-red-500/70' : 'stroke-gray-500/40'} strokeWidth={la === 0 ? 1.2 : 0.7} />
          ))}
          <path d={line(parallel(Math.min(lat, p.maxLat - 0.5)))} fill="none" className="stroke-violet-600 dark:stroke-violet-400" strokeWidth="1.8" strokeDasharray="6 4" />
          {tissot && centers.map(c => <path key={`${c.lat}/${c.lon}`} d={tissotPath(c, 5, toScreen)} className="fill-rose-500/45 stroke-rose-700 dark:fill-rose-400/40 dark:stroke-rose-300" strokeWidth="0.8" />)}
        </g>
      </LabSvg>

      <Buttons>
        {PROJECTIONS.map(q => (
          <DiagramButton key={q.id} active={id === q.id} onClick={() => setId(q.id)}>
            {SHORT[q.id]}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={tissot} onClick={() => setTissot(!tissot)}>
          ⭕ Окръжности на Тисо
        </DiagramButton>
      </Buttons>
      <p className="mt-2 text-center text-sm text-gray-700 dark:text-gray-300">
        <strong>{p.name}</strong> ({p.kind}) – запазва {p.keeps}.
      </p>
      <Sliders>
        <Slider label="φ, °" value={lat} onChange={setLat} min={0} max={80} step={5} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={
            sc
              ? [
                  { label: 'по меридиана', value: `${fmt(sc.h, 2)}×` },
                  { label: 'по паралела', value: `${fmt(sc.k, 2)}×` },
                  { label: 'лицата', value: `${fmt(area, 2)}×`, tone: 'rose' },
                  { label: 'ъгли до', value: `${fmt(omega ?? 0)}°` },
                  { label: 'Гренландия : Австралия', value: `${fmt(mapRatio, 2)} (истински ${fmt(REAL_RATIO, 2)})`, tone: 'emerald' },
                ]
              : [
                  { label: 'лицата', value: '1× навсякъде', tone: 'rose' },
                  { label: 'ъгли', value: 'изкривени към краищата' },
                  { label: 'Гренландия : Австралия', value: `${fmt(mapRatio, 2)} (истински ${fmt(REAL_RATIO, 2)})`, tone: 'emerald' },
                ]
          }
        />
      </div>
    </div>
  );
}
