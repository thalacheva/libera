import { useState } from 'react';
import { BODIES, surfaceGravity } from './physics';

const EARTH = BODIES.find(b => b.id === 'earth')!;
const EARTH_G = surfaceGravity(EARTH);
const JUMP_ON_EARTH = 0.5; // m

const ALTITUDES = [
  { label: 'Връх Мусала', km: 2.9 },
  { label: 'Самолет', km: 11 },
  { label: 'МКС', km: 408 },
  { label: 'GPS спътници', km: 20_200 },
  { label: 'Геостационарна орбита', km: 35_786 },
  { label: 'Луната', km: 378_000 },
];

export default function WeightOnWorlds() {
  const [mass, setMass] = useState(60);
  const [altitude, setAltitude] = useState(408);

  const gAtAltitude =
    EARTH_G * (EARTH.radius / (EARTH.radius + altitude * 1000)) ** 2;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-emerald-300 dark:border-emerald-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">
        Колко тежите на други светове?
      </h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Масата ви е една и съща навсякъде. Променя се теглото – силата, с която
        тялото ви привлича.
      </p>

      <label className="block text-sm font-semibold mb-1">
        Вашата маса: {mass} kg
      </label>
      <input
        type="range"
        min="20"
        max="120"
        value={mass}
        onChange={e => setMass(Number(e.target.value))}
        className="w-full mb-4"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {BODIES.map(body => {
          const g = surfaceGravity(body);
          const jump = (JUMP_ON_EARTH * EARTH_G) / g;
          return (
            <div
              key={body.id}
              className={`p-3 rounded-lg border ${
                body.id === 'earth'
                  ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{body.icon}</span>
                <span className="font-semibold">{body.name}</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                g = {g.toFixed(2).replace('.', ',')} m/s² (
                {(g / EARTH_G).toFixed(2).replace('.', ',')} g⊕)
              </div>
              <div className="font-mono font-bold">
                {Math.round(mass * g)} N
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {body.id === 'sun' ||
                body.id === 'jupiter' ||
                body.id === 'saturn'
                  ? 'Няма твърда повърхност 🙃'
                  : `Скок: ${jump < 10 ? jump.toFixed(1).replace('.', ',') : Math.round(jump)} m`}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">А ако се издигнем над Земята?</h4>
        <label className="block text-sm mb-1">
          Височина: {altitude.toLocaleString('bg-BG')} km
        </label>
        <input
          type="range"
          min="0"
          max="40000"
          step="1"
          value={Math.min(altitude, 40000)}
          onChange={e => setAltitude(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex flex-wrap gap-1 mt-2">
          {ALTITUDES.map(a => (
            <button
              key={a.label}
              onClick={() => setAltitude(a.km)}
              className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700"
            >
              {a.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-blue-600"
              style={{ width: `${(gAtAltitude / EARTH_G) * 100}%` }}
            />
          </div>
          <span className="font-mono text-sm w-40 text-right">
            g = {gAtAltitude.toFixed(gAtAltitude < 1 ? 3 : 2).replace('.', ',')}{' '}
            m/s²
          </span>
        </div>
        <p className="text-sm mt-2">
          g(h) = g₀ · (R / (R + h))² ={' '}
          <strong>
            {((gAtAltitude / EARTH_G) * 100).toFixed(1).replace('.', ',')}%
          </strong>{' '}
          от земното.
          {altitude >= 300 &&
            altitude <= 500 &&
            ' Астронавтите на МКС не са „без гравитация“ – те просто падат свободно заедно със станцията!'}
        </p>
      </div>
    </div>
  );
}
