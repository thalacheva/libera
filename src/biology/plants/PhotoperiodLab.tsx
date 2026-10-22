import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Flash = 'none' | 'R' | 'FR' | 'R-FR' | 'R-FR-R';

const FLASHES: { id: Flash; label: string }[] = [
  { id: 'none', label: 'без светкавица' },
  { id: 'R', label: 'червена' },
  { id: 'FR', label: 'далечна червена' },
  { id: 'R-FR', label: 'червена → далечна' },
  { id: 'R-FR-R', label: 'червена → далечна → червена' },
];

/** Условни критични нощи (зависят от вида и сорта). */
const SDP_NIGHT = 10;
const LDP_NIGHT = 11;

const fmt = (v: number) => String(Math.round(v * 10) / 10).replace('.', ',');

/** Дял на фитохрома във формата Pfr през денонощието (условен модел). */
function pfrCurve(day: number, flash: Flash) {
  const mid = day + (24 - day) / 2;
  const pts: [number, number][] = [];
  let p = 0.6;
  let flashed = false;
  const dt = 0.1;
  for (let t = 0; t <= 24 + 1e-9; t += dt) {
    if (t <= day) p = 0.6;
    else {
      p += (0.05 - p) * (1 - Math.exp(-dt / 3)); // бавно връщане в Pr на тъмно
      if (flash !== 'none' && !flashed && t >= mid - 1e-9) {
        flashed = true;
        p = flash.endsWith('FR') ? 0.03 : 0.75;
      }
    }
    pts.push([t, p]);
  }
  return pts;
}

/** Фотопериодизъм: дължина на нощта, прекъсване на нощта и фитохромът. */
export default function PhotoperiodLab() {
  const [day, setDay] = useState(14);
  const [flash, setFlash] = useState<Flash>('none');

  const night = 24 - day;
  const broken = flash === 'R' || flash === 'R-FR-R';
  const longestDark = broken ? night / 2 : night;
  const sdp = longestDark >= SDP_NIGHT;
  const ldp = longestDark <= LDP_NIGHT;

  const X = (t: number) => 40 + (t / 24) * 380;
  const Y = (p: number) => 200 - p * 110;
  const pts = pfrCurve(day, flash);
  const mid = day + night / 2;

  const card = (title: string, ok: boolean, rule: string) => (
    <div className={`rounded-lg border p-2 text-center text-xs sm:text-sm ${ok ? 'border-pink-400 bg-pink-50 dark:bg-pink-500/10' : 'border-gray-200 dark:border-gray-700'}`}>
      <div className="font-semibold text-gray-800 dark:text-gray-100">{title}</div>
      <div className="text-gray-500 dark:text-gray-400">{rule}</div>
      <div className="mt-1 text-base">{ok ? '🌸 цъфти' : '🌿 не цъфти'}</div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 440 240" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Денонощие */}
        <rect x={X(0)} y={22} width={X(day) - X(0)} height={30} className="fill-amber-200 dark:fill-amber-400/70" />
        <rect x={X(day)} y={22} width={X(24) - X(day)} height={30} className="fill-slate-800 dark:fill-slate-950" />
        <text x={(X(0) + X(day)) / 2} y={42} fontSize="13" textAnchor="middle" className="fill-amber-900">
          ден {fmt(day)} h
        </text>
        <text x={(X(day) + X(24)) / 2} y={42} fontSize="13" textAnchor="middle" className="fill-slate-100">
          нощ {fmt(night)} h
        </text>
        {flash !== 'none' && (
          <g>
            <rect x={X(mid) - 3} y={18} width={6} height={38} className={flash.endsWith('FR') ? 'fill-red-900 stroke-red-300' : 'fill-red-500 stroke-white'} strokeWidth={1} />
            <text x={X(mid)} y={13} fontSize="11" textAnchor="middle" className="fill-red-600 dark:fill-red-400">
              светкавица
            </text>
          </g>
        )}
        {[0, 6, 12, 18, 24].map(t => (
          <text key={t} x={X(t)} y={68} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            {t}
          </text>
        ))}
        <text x={X(24)} y={80} fontSize="10.5" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          часа от изгрева
        </text>

        {/* Pfr */}
        <line x1={X(0)} y1={Y(0)} x2={X(24)} y2={Y(0)} className="stroke-gray-300 dark:stroke-gray-600" />
        <line x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(0.8)} className="stroke-gray-300 dark:stroke-gray-600" />
        {[0, 0.5].map(v => (
          <text key={v} x={X(0) - 5} y={Y(v) + 4} fontSize="10.5" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
            {String(v).replace('.', ',')}
          </text>
        ))}
        <polyline points={pts.map(([t, p]) => `${X(t).toFixed(1)},${Y(p).toFixed(1)}`).join(' ')} fill="none" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth={2.2} />
        <text x={X(0) + 6} y={Y(0.8) + 4} fontSize="12" className="fill-rose-700 dark:fill-rose-300">
          дял на фитохрома като Pfr
        </text>
        <text x={X(24)} y={232} fontSize="11.5" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          най-дълга непрекъсната тъмнина: {fmt(longestDark)} h
        </text>
      </LabSvg>

      <Sliders>
        <Slider label="ден, h" value={day} onChange={setDay} min={6} max={20} step={0.5} tone="amber" />
      </Sliders>
      <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-300">Светкавица в средата на нощта:</p>
      <Buttons>
        {FLASHES.map(f => (
          <DiagramButton key={f.id} active={flash === f.id} onClick={() => setFlash(f.id)}>
            {f.label}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="grid grid-cols-3 gap-2 mt-3 max-w-lg mx-auto">
        {card('къс ден (хризантема)', sdp, `нощ ≥ ${SDP_NIGHT} h`)}
        {card('дълъг ден (спанак)', ldp, `нощ ≤ ${LDP_NIGHT} h`)}
        {card('неутрално (домат)', true, 'не зависи')}
      </div>
      <Readout
        items={[
          { label: 'нощ', value: `${fmt(night)} h`, tone: 'blue' },
          { label: 'най-дълга тъмнина', value: `${fmt(longestDark)} h`, tone: 'violet' },
        ]}
      />
      <Note tone="violet">
        {flash === 'none'
          ? sdp && ldp
            ? 'При тази нощ цъфтят и двете растения – „къс“ и „дълъг“ ден се отнасят до критичната нощ на всеки вид, а не до 12 часа.'
            : 'Растенията „мерят“ непрекъснатата тъмнина, а не дължината на деня.'
          : broken
            ? 'Последната светкавица е червена: Pfr се връща високо и нощта е „прекъсната“ на две половини.'
            : 'Последната светкавица е далечна червена: Pfr пада и растението „смята“ нощта за непрекъсната.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Червената светлина (около 660 nm) превръща фитохрома Pr в активния Pfr, далечната червена (около 730 nm) – обратно. На
        тъмно Pfr бавно се връща в Pr. Решава последната светкавица. Критичните нощи (10 и 11 h) и кривата на Pfr са условни – при
        различните видове и сортове са различни.
      </p>
    </div>
  );
}
