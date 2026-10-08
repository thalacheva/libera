import { useState } from 'react';
import { fmt, sci } from './terrestrialData';
import { useAnimationFrame } from './useAnimationFrame';

const W = 640;
const H = 300;
const Y0 = 30; // 15 km
const Y1 = 260; // земята
const X0 = 40;
const X1 = 300;
const L_KM = 15;
const TAU = 2.197; // µs
const C = 0.2998; // km/µs
const NM = 60;
const PERIOD = 80; // µs – мюоните се раждат периодично

function rnd(n: number) {
  const x = Math.sin(n * 19.19 + 5.5) * 43758.5453;
  return x - Math.floor(x);
}
const MUONS = Array.from({ length: NM }, (_, i) => ({ x: X0 + 12 + rnd(i) * (X1 - X0 - 24), birth: rnd(i + 100) * PERIOD, u: -Math.log(1 - rnd(i + 200) * 0.999) }));

type Mode = 'classic' | 'sr';

export default function MuonLab() {
  const [lg, setLg] = useState(Math.log10(1 - 0.995));
  const [mode, setMode] = useState<Mode>('sr');
  const [t, setT] = useState(30);
  const [playing, setPlaying] = useState(false);
  useAnimationFrame(playing, dt => setT(v => v + dt * 20));

  const beta = 1 - 10 ** lg;
  const gamma = 1 / Math.sqrt(1 - beta * beta);
  const v = beta * C; // km/µs
  const life = mode === 'sr' ? gamma * TAU : TAU;
  const dLife = v * life; // средно изминато разстояние, km
  const frac = Math.exp(-L_KM / dLife);
  const fracClassic = Math.exp(-L_KM / (v * TAU));
  const fracSR = Math.exp(-L_KM / (v * gamma * TAU));

  const ky = (km: number) => Y0 + (km / L_KM) * (Y1 - Y0);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-cyan-300 dark:border-cyan-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Мюоните от космическите лъчи</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Космическите лъчи се удрят в горната атмосфера и раждат мюони – нестабилни частици, които живеят средно 2,2 µs. Колко от тях
        стигат до земята?
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <defs>
          <linearGradient id="mu-sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill="url(#mu-sky)" />
        <rect x={X0} y={Y1} width={X1 - X0} height={14} fill="#166534" />
        <text x={X0 - 4} y={Y0 + 4} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.6">
          15 km
        </text>
        <text x={X0 - 4} y={Y1 + 4} fontSize="9" textAnchor="end" fill="white" fillOpacity="0.6">
          0
        </text>
        <text x={(X0 + X1) / 2} y={Y0 - 10} fontSize="9" textAnchor="middle" fill="#fca5a5">
          ✷ удар на космически лъч → мюони
        </text>
        {MUONS.map((m, i) => {
          const age = (((t - m.birth) % PERIOD) + PERIOD) % PERIOD; // µs по земния часовник
          const lt = m.u * life;
          const km = age * v;
          if (km > L_KM) {
            // стигнал до земята
            return km < L_KM + 1.5 && lt * v > L_KM ? <circle key={i} cx={m.x} cy={Y1 + 4} r={3} fill="#86efac" /> : null;
          }
          if (age < lt) return <circle key={i} cx={m.x} cy={ky(km)} r={2.6} fill="#67e8f9" />;
          const since = age - lt;
          return since < 3 ? <circle key={i} cx={m.x} cy={ky(lt * v)} r={2 + since * 2} fill="none" stroke="#fda4af" strokeOpacity={1 - since / 3} /> : null;
        })}

        <g fontSize="11" fill="white" transform="translate(330, 40)">
          <text x={0} y={0} fontSize="13" fontWeight="700" fill={mode === 'sr' ? '#86efac' : '#fca5a5'}>
            {mode === 'sr' ? 'Специална теория на относителността' : 'Класическа физика (без СТО)'}
          </text>
          <text x={0} y={22} fillOpacity="0.85">
            v = {fmt(beta, 5)}c · γ = {fmt(gamma, gamma < 10 ? 2 : 1)}
          </text>
          <text x={0} y={42} fillOpacity="0.85">
            време на живот (за Земята): {fmt(life, life < 10 ? 2 : 0)} µs
          </text>
          <text x={0} y={62} fillOpacity="0.85">
            средно изминат път: {fmt(dLife, dLife < 10 ? 2 : 0)} km
          </text>
          <text x={0} y={88} fontWeight="700" fill="#fde68a">
            до земята стигат: {frac > 0.001 ? `${fmt(frac * 100, 1)}%` : sci(frac, 1)}
          </text>
          <g transform="translate(0, 110)">
            <text x={0} y={0} fontSize="10" fillOpacity="0.6">
              Сравнение на пътищата (мащаб 15 km):
            </text>
            <rect x={0} y={8} width={200} height={8} fill="white" fillOpacity="0.15" />
            <text x={204} y={16} fontSize="9" fillOpacity="0.6">
              атмосфера
            </text>
            <rect x={0} y={24} width={Math.min(200, (v * TAU * 200) / L_KM)} height={8} fill="#fca5a5" />
            <text x={Math.min(200, (v * TAU * 200) / L_KM) + 4} y={32} fontSize="9" fill="#fca5a5">
              без СТО: {fmt(v * TAU * 1000, 0)} m
            </text>
            <rect x={0} y={40} width={Math.min(200, (v * gamma * TAU * 200) / L_KM)} height={8} fill="#86efac" />
            <text x={Math.min(150, (v * gamma * TAU * 200) / L_KM) + 4} y={56 + (v * gamma * TAU > L_KM * 0.75 ? 6 : -8)} fontSize="9" fill="#86efac">
              със СТО: {fmt(v * gamma * TAU, 1)} km
            </text>
          </g>
          <text x={0} y={200} fontSize="10" fillOpacity="0.7">
            За мюона: атмосферата е свита до {fmt(L_KM / gamma, L_KM / gamma < 1 ? 2 : 1)} km
          </text>
          <text x={0} y={216} fontSize="10" fillOpacity="0.7">
            (свиване на дължините) – същият резултат: {fmt(fracSR * 100, 1)}%.
          </text>
        </g>
      </svg>

      <label className="block text-sm font-semibold mt-4 mb-1">Скорост на мюоните: v = {fmt(beta, 5)}c</label>
      <input type="range" min="-5" max="-1" step="0.01" value={lg} onChange={e => setLg(Number(e.target.value))} className="w-full" />
      <div className="flex flex-wrap justify-center items-center gap-1 mt-3">
        <button onClick={() => setPlaying(p => !p)} className="px-4 py-1 rounded bg-cyan-600 text-white text-sm hover:bg-cyan-700">
          {playing ? '⏸ Пауза' : '▶ Пусни'}
        </button>
        {(['classic', 'sr'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-2 py-1 rounded text-xs border ${
              m === mode ? 'border-cyan-500 bg-cyan-50 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {m === 'classic' ? 'без СТО' : 'със СТО'}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        Дори със скоростта на светлината мюон би изминал средно само 660 m за 2,2 µs – без относителността до земята щяха да стигат{' '}
        {fracClassic > 1e-3 ? `${fmt(fracClassic * 100, 2)}%` : 'практически нула'}. А в действителност през всеки квадратен метър всяка
        секунда минават около 170 мюона от космическите лъчи – през дланта ви по един в секунда, точно сега! Това е проверено през 1941 г. (Роси и Хол) и
        прецизно през 1963 г. (Фриш и Смит).
      </p>
    </div>
  );
}
