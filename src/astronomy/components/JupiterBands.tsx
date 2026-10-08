import { useState } from 'react';
import { fmt } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 320;
const CX = 170;
const CY = 160;
const R = 140;
const R_KM = 71492;

// Графиката на ветровете вдясно: редовете ѝ съвпадат с ширините на диска
const GX0 = 370;
const GX1 = 620;
const U_MIN = -100;
const U_MAX = 180;
const ux = (u: number) => GX0 + ((u - U_MIN) / (U_MAX - U_MIN)) * (GX1 - GX0);
const latY = (lat: number) => CY - R * Math.sin((lat * Math.PI) / 180);

// Опростен профил на зоналните ветрове (ширина в °, скорост в m/s спрямо въртенето на недрата)
const WIND: [number, number][] = [
  [-80, 0], [-60, 20], [-50, -10], [-43, 35], [-36, -20], [-32, 30], [-26.5, 50], [-17, -60], [-7, 110], [0, 40],
  [7, 120], [17, -30], [23.7, 160], [28, -20], [31, 30], [35, -25], [40, 20], [48, -10], [60, 15], [80, 0],
];

function wind(lat: number) {
  for (let i = 1; i < WIND.length; i++) {
    const [l1, u1] = WIND[i];
    if (lat <= l1) {
      const [l0, u0] = WIND[i - 1];
      return u0 + ((u1 - u0) * (lat - l0)) / (l1 - l0);
    }
  }
  return 0;
}

type Band = { id: string; name: string; from: number; to: number; type: 'zone' | 'belt' | 'polar'; note: string };

const BANDS: Band[] = [
  { id: 'npr', name: 'Северна полярна област', from: 48, to: 90, type: 'polar', note: 'Ивиците изчезват и отстъпват място на хаос от вихри. Juno откри около северния полюс осем циклона, подредени в осмоъгълник около един централен.' },
  { id: 'ntz', name: 'Северна умерена зона', from: 31, to: 48, type: 'zone', note: 'Поредица от по-тесни, по-слаби ивици.' },
  { id: 'ntb', name: 'Северен умерен пояс', from: 24, to: 31, type: 'belt', note: 'На южния му край, при 23,7° с. ш., духа най-бързата струя на Юпитер – около 150–170 m/s (~600 km/h).' },
  { id: 'ntrz', name: 'Северна тропична зона', from: 18, to: 24, type: 'zone', note: 'Светла зона между два пояса.' },
  { id: 'neb', name: 'Северен екваториален пояс', from: 7, to: 18, type: 'belt', note: 'Най-тъмният и постоянен пояс – вижда се дори с малък телескоп. В него се забелязват светкавици, открити от „Вояджър“.' },
  { id: 'ez', name: 'Екваториална зона', from: -7, to: 7, type: 'zone', note: 'Широка светла зона, оградена от две бързи струи на изток.' },
  { id: 'seb', name: 'Южен екваториален пояс', from: -18, to: -7, type: 'belt', note: 'Странен пояс: от време на време за няколко месеца избледнява почти до бяло (последно през 2010 г.), после бурно потъмнява отново.' },
  { id: 'strz', name: 'Южна тропична зона', from: -26, to: -18, type: 'zone', note: 'Тук е Великото червено петно – между струя на запад от север и струя на изток от юг. Двете струи го въртят като лагер, обратно на часовниковата стрелка, с период ~6 дни.' },
  { id: 'stb', name: 'Южен умерен пояс', from: -32, to: -26, type: 'belt', note: 'В него се образува Овал BA („Малкото червено петно“) – от сливането на три бели овала в периода 1998–2000 г. През 2005 г. той почервенява.' },
  { id: 'stz', name: 'Южна умерена зона', from: -46, to: -32, type: 'zone', note: 'Поредица от по-тесни, по-слаби ивици.' },
  { id: 'spr', name: 'Южна полярна област', from: -90, to: -46, type: 'polar', note: 'Около южния полюс Juno намери пет циклона в петоъгълник около един централен (през 2019 г. се появи и шести) – всеки голям колкото континент.' },
];

const BAND_COLOR = { zone: '#efe3cc', belt: '#b98b5e', polar: '#9e9384' };
const TYPE_TEXT = {
  zone: 'Зона: тук газът се издига, разширява се и изстива. Амонякът замръзва в бели, високи облаци.',
  belt: 'Пояс: тук газът се спуска. Той е сух и без високи облаци – виждаме по-дълбоките, по-топли и по-тъмни слоеве. В инфрачервено поясите светят.',
  polar: 'Полярна област: бързото въртене вече не организира вятъра в ивици.',
};

// Размер на Великото червено петно (ширина в km) по години
const GRS_SIZE = [
  { year: 1880, km: 39000 },
  { year: 1979, km: 23300 },
  { year: 1995, km: 20950 },
  { year: 2014, km: 16500 },
];

// „Облачета“ с фиксирани псевдослучайни ширини и дължини
const CLOUDS = (() => {
  let seed = 12345;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: 200 }, () => {
    const lat = -62 + rand() * 124;
    return { lat, lon0: rand() * 360, len: 6 + rand() * 10, u: wind(lat) };
  });
})();

const bandOf = (lat: number) => BANDS.find(b => lat >= b.from && lat < b.to)!;

/** Дъгова скорост в °/ден, която вятър u (m/s) дава на ширина lat. */
const degPerDay = (u: number, lat: number) => (u * 86400 * 360) / (2 * Math.PI * R_KM * 1000 * Math.cos((lat * Math.PI) / 180));

const GRS_LAT = -22;
const GRS_LON = -12;

export default function JupiterBands() {
  const [t, setT] = useState(0); // дни
  const [playing, setPlaying] = useState(false);
  const [bandId, setBandId] = useState('strz');
  const [grsIndex, setGrsIndex] = useState(GRS_SIZE.length - 1);
  const [showEarth, setShowEarth] = useState(false);
  const band = BANDS.find(b => b.id === bandId)!;

  useAnimationFrame(playing, dt => setT(v => v + dt * 2));

  const grs = GRS_SIZE[grsIndex];
  const grsX = CX + R * Math.cos((GRS_LAT * Math.PI) / 180) * Math.sin((GRS_LON * Math.PI) / 180);
  const grsY = latY(GRS_LAT);
  const grsRx = ((grs.km / 2) * R) / R_KM;
  const grsRy = grsRx * 0.62;
  const earthR = (6371 * R) / R_KM;
  const swirl = (t / 6) * 360; // въртене на петното – обратно на часовниковата стрелка

  const centerLat = (Math.max(band.from, -80) + Math.min(band.to, 80)) / 2;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Ивиците и ветровете на Юпитер</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Пуснете времето (1 s = 2 земни дни) и вижте как облаците се носят в редуващи се струи. Скоростите са спрямо въртенето на недрата.
        Щракнете върху ивица.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <defs>
          <clipPath id="jb-disc">
            <ellipse cx={CX} cy={CY} rx={R} ry={R * 0.935} />
          </clipPath>
          <radialGradient id="jb-shade" cx="0.4" cy="0.4" r="0.7">
            <stop offset="0" stopColor="white" stopOpacity="0.12" />
            <stop offset="0.7" stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="black" stopOpacity="0.55" />
          </radialGradient>
        </defs>

        <g clipPath="url(#jb-disc)">
          {/* Ивиците */}
          {BANDS.map(b => (
            <rect
              key={b.id}
              x={CX - R}
              y={latY(b.to)}
              width={2 * R}
              height={latY(b.from) - latY(b.to)}
              fill={BAND_COLOR[b.type]}
              stroke={b.id === bandId ? 'white' : 'none'}
              strokeWidth="1.5"
              className="cursor-pointer"
              onClick={() => setBandId(b.id)}
            />
          ))}

          {/* Облаците, носени от вятъра */}
          {CLOUDS.map((c, i) => {
            const lon = ((((c.lon0 + degPerDay(c.u, c.lat) * t) % 360) + 540) % 360) - 180;
            const lonR = (lon * Math.PI) / 180;
            if (Math.cos(lonR) <= 0.05) return null;
            const latR = (c.lat * Math.PI) / 180;
            const x = CX + R * Math.cos(latR) * Math.sin(lonR);
            const y = latY(c.lat);
            const type = bandOf(c.lat).type;
            return (
              <ellipse
                key={i}
                cx={x}
                cy={y}
                rx={c.len * Math.cos(lonR) * Math.cos(latR) + 1}
                ry={1.6}
                fill={type === 'belt' ? '#7c5434' : '#ffffff'}
                fillOpacity={type === 'belt' ? 0.45 : 0.55}
                pointerEvents="none"
              />
            );
          })}

          {/* Великото червено петно */}
          <g pointerEvents="none">
            <ellipse cx={grsX} cy={grsY} rx={grsRx} ry={grsRy} fill="#c2410c" fillOpacity="0.9" />
            <g transform={`translate(${grsX} ${grsY}) scale(1 0.62) rotate(${-swirl})`}>
              <path d={`M ${-grsRx * 0.7} 0 A ${grsRx * 0.7} ${grsRx * 0.7} 0 0 1 0 ${-grsRx * 0.7}`} fill="none" stroke="#fed7aa" strokeOpacity="0.7" strokeWidth="1.5" />
              <path d={`M ${grsRx * 0.4} 0 A ${grsRx * 0.4} ${grsRx * 0.4} 0 0 1 0 ${grsRx * 0.4}`} fill="none" stroke="#fed7aa" strokeOpacity="0.7" strokeWidth="1.5" />
            </g>
            {showEarth && (
              <g>
                <circle cx={grsX} cy={grsY} r={earthR} fill="#3b82f6" fillOpacity="0.8" stroke="white" strokeWidth="1" />
                <text x={grsX} y={grsY + earthR + 12} fontSize="10" textAnchor="middle" fill="white">
                  Земя
                </text>
              </g>
            )}
          </g>
          <ellipse cx={CX} cy={CY} rx={R} ry={R * 0.935} fill="url(#jb-shade)" pointerEvents="none" />
        </g>

        {/* Профил на вятъра */}
        <line x1={ux(0)} x2={ux(0)} y1={latY(80)} y2={latY(-80)} stroke="white" strokeOpacity="0.35" />
        {[-100, 0, 100].map(u => (
          <text key={u} x={ux(u)} y={H - 6} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
            {u}
          </text>
        ))}
        <text x={GX1} y={H - 6} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.6">
          m/s
        </text>
        {BANDS.map(b => (
          <rect
            key={b.id}
            x={GX0}
            y={latY(Math.min(b.to, 80))}
            width={GX1 - GX0}
            height={latY(Math.max(b.from, -80)) - latY(Math.min(b.to, 80))}
            fill={BAND_COLOR[b.type]}
            fillOpacity={b.id === bandId ? 0.3 : 0.07}
            className="cursor-pointer"
            onClick={() => setBandId(b.id)}
          />
        ))}
        <polyline
          points={Array.from({ length: 161 }, (_, i) => {
            const lat = 80 - i;
            return `${ux(wind(lat))},${latY(lat)}`;
          }).join(' ')}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2"
          pointerEvents="none"
        />
        <text x={ux(-90)} y={latY(80) - 6} fontSize="10" fill="white" fillOpacity="0.6">
          ← на запад
        </text>
        <text x={ux(170)} y={latY(80) - 6} fontSize="10" textAnchor="end" fill="white" fillOpacity="0.6">
          на изток →
        </text>
        {[60, 30, 0, -30, -60].map(l => (
          <text key={l} x={GX0 - 4} y={latY(l) + 3} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.5">
            {l > 0 ? `${l}° с` : l < 0 ? `${-l}° ю` : '0°'}
          </text>
        ))}
      </svg>

      <div className="flex flex-wrap justify-center items-center gap-2 mt-3">
        <button
          onClick={() => setPlaying(p => !p)}
          className="px-4 py-1 rounded bg-orange-600 text-white text-sm hover:bg-orange-700"
        >
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400">ден {fmt(t, 0)}</span>
        <label className="text-sm flex items-center gap-1">
          <input type="checkbox" checked={showEarth} onChange={e => setShowEarth(e.target.checked)} />
          Земята за мащаб
        </label>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-1 mt-2">
        <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">Червеното петно през:</span>
        {GRS_SIZE.map((g, i) => (
          <button
            key={g.year}
            onClick={() => setGrsIndex(i)}
            className={`px-2 py-1 rounded text-xs border ${
              i === grsIndex
                ? 'border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {g.year}
          </button>
        ))}
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
          ширина ~{fmt(grs.km, 0)} km = {fmt(grs.km / 12742, 1)} диаметъра на Земята
        </span>
      </div>

      <div className="mt-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-sm sm:text-base">
        <p className="font-semibold mb-1">
          {band.name} ({fmt(Math.abs(centerLat), 0)}° {centerLat >= 0 ? 'с. ш.' : 'ю. ш.'}, вятър в средата ~{fmt(wind(centerLat), 0)} m/s)
        </p>
        <p className="mb-1">{TYPE_TEXT[band.type]}</p>
        <p>{band.note}</p>
      </div>
    </div>
  );
}
