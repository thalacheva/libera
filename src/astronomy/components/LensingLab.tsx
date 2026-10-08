import { useState } from 'react';
import { fmt } from './terrestrialData';

const W = 640;
const H = 300;
const VX = 20;
const VY = 20;
const VW = 360;
const VH = 260;
const NX = 100;
const NY = 72;
const FOV = 6; // ширина на изгледа в единици θ₀

export default function LensingLab() {
  const [bx, setBx] = useState(0.6);
  const [by, setBy] = useState(0.2);
  const [mass, setMass] = useState(1);
  const [model, setModel] = useState<'point' | 'sis'>('point');
  const rs = 0.35; // радиус на източника
  const thetaE = Math.sqrt(mass); // радиус на Айнщайн (в единици θ₀)

  const cellW = VW / NX;
  const cellH = VH / NY;
  const scale = VW / FOV; // px на единица ъгъл
  const cells: { x: number; y: number; c: string }[] = [];
  let lensedArea = 0;
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      const tx = (i + 0.5 - NX / 2) * (FOV / NX);
      const ty = (NY / 2 - j - 0.5) * ((VH / scale) / NY);
      const r = Math.hypot(tx, ty) + 1e-6;
      // Уравнението на лещата: β = θ − α(θ)
      const alpha = model === 'point' ? (thetaE * thetaE) / r : thetaE;
      const sx = tx - (alpha * tx) / r;
      const sy = ty - (alpha * ty) / r;
      const d = Math.hypot(sx - bx, sy - by);
      if (d < rs) {
        const f = 1 - d / rs;
        const arm = 0.5 + 0.5 * Math.cos(3 * Math.atan2(sy - by, sx - bx) - 8 * d);
        const b = Math.round(150 + 105 * f);
        cells.push({ x: VX + i * cellW, y: VY + j * cellH, c: `rgb(${Math.round(90 + 80 * f * arm)}, ${Math.round(140 + 60 * f)}, ${b})` });
        lensedArea += 1;
      }
    }
  }
  const sourceArea = (Math.PI * rs * rs) / ((FOV / NX) * ((VH / scale) / NY));
  const magnification = lensedArea / sourceArea;
  const beta = Math.hypot(bx, by);

  const cx = VX + VW / 2;
  const cy = VY + VH / 2;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-sky-300 dark:border-sky-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Гравитационна леща</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Масивна галактика или куп (в центъра) огъва светлината на далечна галактика зад нея. Преместете далечната галактика: когато е
        точно зад лещата, образът ѝ се превръща в пръстен на Айнщайн.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        <rect x={VX} y={VY} width={VW} height={VH} fill="#020617" rx="6" />
        {cells.map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width={cellW + 0.4} height={cellH + 0.4} fill={c.c} />
        ))}
        {/* Лещата */}
        <circle cx={cx} cy={cy} r={18} fill="#fde68a" fillOpacity="0.25" />
        <circle cx={cx} cy={cy} r={6} fill="#fef3c7" fillOpacity="0.85" />
        {/* Радиус на Айнщайн и истинското място на източника */}
        <circle cx={cx} cy={cy} r={thetaE * scale} fill="none" stroke="#fbbf24" strokeOpacity="0.5" strokeDasharray="4 4" />
        <circle cx={cx + bx * scale} cy={cy - by * scale} r={rs * scale} fill="none" stroke="#f472b6" strokeOpacity="0.7" strokeDasharray="3 3" />
        <text x={cx + bx * scale} y={cy - by * scale - rs * scale - 4} fontSize="9" textAnchor="middle" fill="#f9a8d4">
          истинско място
        </text>

        <g fontSize="11" fill="white" transform="translate(400, 40)">
          <text x={0} y={0} fontSize="13" fontWeight="700" fill="#7dd3fc">
            {model === 'point' ? 'Точкова маса' : 'Масивен ореол (куп)'}
          </text>
          <text x={0} y={24} fillOpacity="0.85">
            радиус на Айнщайн θ_E = {fmt(thetaE, 2)}
          </text>
          <text x={0} y={42} fillOpacity="0.85">
            отместване на източника β = {fmt(beta, 2)}
          </text>
          <text x={0} y={68} fill="#fde68a" fontWeight="700">
            увеличение на блясъка ≈ {fmt(magnification, 1)}×
          </text>
          <text x={0} y={94} fontSize="10" fillOpacity="0.65">
            {beta < 0.08 ? 'пръстен на Айнщайн!' : beta < thetaE ? 'два образа – дъга и противообраз' : 'слабо изкривяване'}
          </text>
          <text x={0} y={124} fontSize="10" fillOpacity="0.55">
            Жълт пунктир – радиус на Айнщайн:
          </text>
          <text x={0} y={138} fontSize="10" fillOpacity="0.55">
            θ_E = √(4GM/c² · D_ls / (D_l D_s))
          </text>
          <text x={0} y={164} fontSize="10" fillOpacity="0.55">
            Ъгълът расте като √M – по образите
          </text>
          <text x={0} y={178} fontSize="10" fillOpacity="0.55">
            претегляме лещата, включително
          </text>
          <text x={0} y={192} fontSize="10" fillOpacity="0.55">
            тъмната ѝ материя.
          </text>
        </g>
      </svg>

      <div className="grid sm:grid-cols-3 gap-x-4">
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Източник: хоризонтално {fmt(bx, 2)}</label>
          <input type="range" min="-2.5" max="2.5" step="0.01" value={bx} onChange={e => setBx(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Източник: вертикално {fmt(by, 2)}</label>
          <input type="range" min="-1.6" max="1.6" step="0.01" value={by} onChange={e => setBy(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mt-3 mb-1">Маса на лещата: ×{fmt(mass, 2)}</label>
          <input type="range" min="0.2" max="3" step="0.01" value={mass} onChange={e => setMass(Number(e.target.value))} className="w-full" />
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-1 mt-3">
        <button
          onClick={() => {
            setBx(0);
            setBy(0);
          }}
          className="px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          точно зад лещата
        </button>
        {(['point', 'sis'] as const).map(m => (
          <button
            key={m}
            onClick={() => setModel(m)}
            className={`px-2 py-1 rounded text-xs border ${
              m === model ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {m === 'point' ? 'точкова маса (звезда, черна дупка)' : 'разпределена маса (галактика, куп)'}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        Общата теория на относителността предсказва, че масата огъва пространството и с него – пътя на светлината. Ъгълът е два пъти
        по-голям от нютоновия: α = 4GM / (c² b). През 1919 г. Едингтън го измерва за светлината на звезди край Слънцето по време на пълно
        затъмнение – и Айнщайн става световно известен. Днес по лещите се правят карти на тъмната материя в куповете.
      </p>
    </div>
  );
}
