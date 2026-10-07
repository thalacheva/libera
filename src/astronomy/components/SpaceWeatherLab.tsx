import { useState } from 'react';

const AU_KM = 1.496e8;
const W = 640;
const H = 200;
const SUN_X = 40;
const EARTH_X = 600;
const LANE = 60;

const FLARES = [
  { id: 'C', flux: '10⁻⁶ W/m²', note: 'слабо – почти без последствия', protons: false },
  { id: 'M', flux: '10⁻⁵ W/m²', note: 'средно – кратки радиосмущения в полярните области', protons: true },
  { id: 'X', flux: '≥ 10⁻⁴ W/m²', note: 'силно – прекъсване на късовълновата радиовръзка на осветената половина на Земята', protons: true },
];

const PRESETS = [
  { label: 'Спокоен вятър', flare: 'C', speed: 400, kp: 2 },
  { label: 'Умерена буря', flare: 'M', speed: 800, kp: 6 },
  { label: 'Май 2024', flare: 'X', speed: 1200, kp: 9 },
  { label: 'Хелоуин 2003', flare: 'X', speed: 2000, kp: 9 },
  { label: 'Карингтън 1859', flare: 'X', speed: 2360, kp: 9 },
];

// Часове по логаритмичната ос: от 1 минута до 7 дни
const T_MIN = 1 / 60;
const T_MAX = 168;
const TX0 = 30;
const TX1 = 610;
const tx = (h: number) => TX0 + ((Math.log10(Math.max(h, T_MIN)) - Math.log10(T_MIN)) / (Math.log10(T_MAX) - Math.log10(T_MIN))) * (TX1 - TX0);

// Полярна карта: центърът е геомагнитният полюс, ръбът – 35° геомагнитна ширина
const MAP = 300;
const MC = MAP / 2;
const LAT_EDGE = 35;
const mr = (lat: number) => ((90 - lat) / (90 - LAT_EDGE)) * (MC - 12);

const CITIES = [
  { name: 'Тромсьо', lat: 67, angle: 100 },
  { name: 'Рейкявик', lat: 64, angle: 150 },
  { name: 'Осло', lat: 59, angle: 80 },
  { name: 'Лондон', lat: 54, angle: 115 },
  { name: 'Берлин', lat: 50, angle: 92 },
  { name: 'София', lat: 39, angle: 75 },
];

const fmtH = (h: number) => (h < 1 ? `${Math.round(h * 60)} min` : h < 48 ? `${h.toFixed(1).replace('.', ',')} h` : `${(h / 24).toFixed(1).replace('.', ',')} дни`);

export default function SpaceWeatherLab() {
  const [flare, setFlare] = useState('X');
  const [speed, setSpeed] = useState(1200);
  const [kpStorm, setKpStorm] = useState(9);
  const [hours, setHours] = useState(0.05);

  const arrival = AU_KM / speed / 3600;
  const light = 8.3 / 60;
  const protons = FLARES.find(f => f.id === flare)!.protons;
  const protonTime = 0.5;
  const arrived = hours >= arrival;
  const kp = arrived ? kpStorm : 2;
  const ovalLat = 67 - 2.2 * kp; // екваториалната граница на овала над главата
  const horizonLat = ovalLat - 9; // докъде сиянието се вижда ниско над северния хоризонт

  const cmeX = SUN_X + (EARTH_X - SUN_X) * Math.min(1, hours / arrival);
  const protonX = SUN_X + (EARTH_X - SUN_X) * Math.min(1, hours / protonTime);
  const lightArrived = hours >= light;

  const events = [
    { t: light, label: 'светлина и рентген', color: '#fde047', show: true },
    { t: protonTime, label: 'бързи протони', color: '#f87171', show: protons },
    { t: arrival, label: 'облакът (CME)', color: '#c084fc', show: true },
  ];

  const sofia = CITIES.find(c => c.name === 'София')!;
  const sofiaStatus = sofia.lat >= ovalLat ? 'над главата' : sofia.lat >= horizonLat ? 'ниско над северния хоризонт' : 'не се вижда';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Космическо време: от изригването до сиянието</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Изберете събитие и плъзнете времето след изригването. Светлината пристига първа, после частиците, а накрая облакът плазма, който
        разтърсва магнитосферата.
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => {
              setFlare(p.flare);
              setSpeed(p.speed);
              setKpStorm(p.kp);
              setHours(0.05);
            }}
            className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-gray-700"
          >
            {p.label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-900 select-none">
        <defs>
          <radialGradient id="sw-sun">
            <stop offset="0.4" stopColor="#fde68a" />
            <stop offset="1" stopColor="#f59e0b" />
          </radialGradient>
        </defs>
        {/* Слънце – Земя (разстоянието не е в мащаб спрямо размерите) */}
        <circle cx={SUN_X} cy={LANE} r={26} fill="url(#sw-sun)" />
        <circle cx={EARTH_X} cy={LANE} r={9} fill="#3b82f6" stroke={lightArrived ? '#fde047' : 'none'} strokeWidth="2" />
        <path d={`M ${EARTH_X - 22} ${LANE - 26} Q ${EARTH_X - 34} ${LANE} ${EARTH_X - 22} ${LANE + 26}`} fill="none" stroke="#60a5fa" strokeOpacity={arrived ? 0.9 : 0.4} strokeWidth="2" />
        <text x={EARTH_X} y={LANE + 30} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.7">
          Земя
        </text>
        {lightArrived && <line x1={SUN_X + 26} x2={EARTH_X - 10} y1={LANE} y2={LANE} stroke="#fde047" strokeOpacity="0.35" strokeWidth="2" />}
        {protons && hours > 0 &&
          Array.from({ length: 8 }, (_, i) => (
            <circle key={i} cx={Math.min(EARTH_X - 12, protonX - i * 9)} cy={LANE - 14 + (i % 3) * 14} r={2.2} fill="#f87171" opacity={protonX - i * 9 > SUN_X + 26 ? 1 : 0} />
          ))}
        {hours > 0 && cmeX < EARTH_X - 4 && (
          <path
            d={`M ${cmeX - 18} ${LANE - 40} Q ${cmeX + 14} ${LANE} ${cmeX - 18} ${LANE + 40}`}
            fill="#c084fc"
            fillOpacity="0.25"
            stroke="#c084fc"
            strokeWidth="2.5"
          />
        )}

        {/* Времева ос */}
        <line x1={TX0} x2={TX1} y1={150} y2={150} stroke="white" strokeOpacity="0.4" />
        {[
          [1 / 60, '1 min'],
          [1, '1 h'],
          [24, '1 ден'],
          [168, '7 дни'],
        ].map(([t, label]) => (
          <g key={label as string}>
            <line x1={tx(t as number)} x2={tx(t as number)} y1={146} y2={154} stroke="white" strokeOpacity="0.5" />
            <text x={tx(t as number)} y={168} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.6">
              {label}
            </text>
          </g>
        ))}
        {events
          .filter(e => e.show)
          .map((e, i) => (
            <g key={e.label}>
              <circle cx={tx(e.t)} cy={150} r={6} fill={hours >= e.t ? e.color : '#0f172a'} stroke={e.color} strokeWidth="2" />
              <text x={tx(e.t)} y={128 - (i % 2) * 14} fontSize="10" textAnchor="middle" fill={e.color}>
                {e.label} · {fmtH(e.t)}
              </text>
            </g>
          ))}
        <line x1={tx(hours)} x2={tx(hours)} y1={108} y2={186} stroke="white" strokeDasharray="3 3" />
        <text x={tx(hours)} y={196} fontSize="10" textAnchor="middle" fill="white">
          {fmtH(hours)}
        </text>
      </svg>

      <label className="block mt-3">
        <span className="block text-xs font-semibold mb-1">Време след изригването: {fmtH(hours)}</span>
        <input
          type="range"
          min={Math.log10(T_MIN)}
          max={Math.log10(T_MAX)}
          step={0.005}
          value={Math.log10(hours)}
          onChange={e => setHours(10 ** Number(e.target.value))}
          className="w-full"
        />
      </label>

      <div className="grid sm:grid-cols-2 gap-4 mt-3 items-start">
        <div className="space-y-3 text-sm">
          <div>
            <span className="block text-xs font-semibold mb-1">Клас на изригването (рентгенов поток)</span>
            <div className="flex gap-1">
              {FLARES.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFlare(f.id)}
                  className={`flex-1 px-2 py-1 rounded border text-xs ${
                    flare === f.id ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {f.id} · {f.flux}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{FLARES.find(f => f.id === flare)!.note}</p>
          </div>
          <label className="block">
            <span className="block text-xs font-semibold mb-1">Скорост на CME: {speed} km/s → пристига след {fmtH(arrival)}</span>
            <input type="range" min={300} max={3000} step={50} value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-full" />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold mb-1">Сила на бурята при пристигане: Kp = {kpStorm}</span>
            <input type="range" min={0} max={9} step={1} value={kpStorm} onChange={e => setKpStorm(Number(e.target.value))} className="w-full" />
          </label>
          <div className={`p-3 rounded-lg ${arrived && kp >= 5 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-100/70 dark:bg-gray-900/40'}`}>
            <p className="font-semibold">
              Сега: Kp = {kp} {arrived ? (kp >= 5 ? `– геомагнитна буря G${Math.min(5, kp - 4)}` : '– без буря') : '– облакът още пътува'}
            </p>
            <p className="mt-1 text-gray-700 dark:text-gray-300">
              Полярно сияние в София: <strong>{sofiaStatus}</strong>
            </p>
          </div>
        </div>

        <svg viewBox={`0 0 ${MAP} ${MAP}`} className="w-full h-auto max-w-xs mx-auto rounded-lg bg-slate-900 select-none">
          {[40, 50, 60, 70, 80].map(lat => (
            <g key={lat}>
              <circle cx={MC} cy={MC} r={mr(lat)} fill="none" stroke="white" strokeOpacity="0.12" />
              <text x={MC + 3} y={MC - mr(lat) + 10} fontSize="8" fill="white" fillOpacity="0.4">
                {lat}°
              </text>
            </g>
          ))}
          {/* Зона, от която сиянието се вижда ниско на хоризонта */}
          <circle cx={MC} cy={MC} r={mr(horizonLat)} fill="none" stroke="#4ade80" strokeOpacity="0.4" strokeDasharray="4 4" strokeWidth="1.5" />
          {/* Аврорален овал */}
          <circle
            cx={MC}
            cy={MC}
            r={(mr(ovalLat) + mr(ovalLat + 6)) / 2}
            fill="none"
            stroke={kp >= 8 ? '#f87171' : '#4ade80'}
            strokeOpacity="0.55"
            strokeWidth={Math.max(6, mr(ovalLat) - mr(ovalLat + 6))}
          />
          <circle cx={MC} cy={MC} r={3} fill="white" />
          {CITIES.map(c => {
            const a = (c.angle * Math.PI) / 180;
            const x = MC + mr(c.lat) * Math.cos(a);
            const y = MC + mr(c.lat) * Math.sin(a);
            return (
              <g key={c.name}>
                <circle cx={x} cy={y} r={3.5} fill={c.name === 'София' ? '#fbbf24' : 'white'} />
                <text x={x + 6} y={y + 4} fontSize="10" fill={c.name === 'София' ? '#fbbf24' : 'white'} fillOpacity="0.85">
                  {c.name}
                </text>
              </g>
            );
          })}
          <text x={MC} y={MAP - 6} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.6">
            геомагнитни ширини (приблизително)
          </text>
        </svg>
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Зелената ивица е авроралният овал; пунктирът показва докъде сиянието се вижда ниско над хоризонта. Червеното сияние на ~300 km
        височина се вижда най-далеч. При Kp = 9 през май 2024 г. то бе снимано и в България.
      </p>
    </div>
  );
}
