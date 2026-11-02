import LabSvg from '~/LabSvg';

// Класическите модели на вътрешния строеж на града (по Бърджес, Хойт, Харис и Улман), опростени.
const ZONES = [
  { id: 1, name: 'централна делова зона', fill: '#e11d48' },
  { id: 2, name: 'лека промишленост, складове', fill: '#f59e0b' },
  { id: 3, name: 'жилища на работници', fill: '#fde68a' },
  { id: 4, name: 'жилища на средната класа', fill: '#86efac' },
  { id: 5, name: 'богати жилища, пътуващи', fill: '#60a5fa' },
  { id: 6, name: 'тежка промишленост', fill: '#78716c' },
  { id: 7, name: 'второстепенен център', fill: '#c084fc' },
];
const Z = Object.fromEntries(ZONES.map(z => [z.id, z.fill]));

const sector = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number, rr: number) => `${(cx + rr * Math.cos((a * Math.PI) / 180)).toFixed(1)} ${(cy - rr * Math.sin((a * Math.PI) / 180)).toFixed(1)}`;
  return `M${cx} ${cy} L${p(a0, r)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 0 ${p(a1, r)} Z`;
};

/** Три модела на градската структура – статична схема. */
export default function UrbanModels() {
  const R = 82;
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 300" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Бърджес */}
        <g>
          {[5, 4, 3, 2, 1].map(z => (
            <circle key={z} cx={110} cy={110} r={(R * z) / 5} fill={Z[z]} stroke="#fff" strokeWidth="1" />
          ))}
          <text x={110} y={218} fontSize="12" textAnchor="middle" className="fill-current font-semibold">
            концентрични зони
          </text>
          <text x={110} y={233} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            Бърджес, 1925
          </text>
        </g>
        {/* Хойт */}
        <g>
          <circle cx={320} cy={110} r={R} fill={Z[3]} stroke="#fff" />
          <path d={sector(320, 110, R, 60, 95)} fill={Z[2]} stroke="#fff" />
          <path d={sector(320, 110, R, 245, 280)} fill={Z[2]} stroke="#fff" />
          <path d={sector(320, 110, R, 95, 150)} fill={Z[4]} stroke="#fff" />
          <path d={sector(320, 110, R, 0, 60)} fill={Z[4]} stroke="#fff" />
          <path d={sector(320, 110, R, 150, 195)} fill={Z[5]} stroke="#fff" />
          <circle cx={320} cy={110} r={R / 5} fill={Z[1]} stroke="#fff" />
          <text x={320} y={218} fontSize="12" textAnchor="middle" className="fill-current font-semibold">
            сектори
          </text>
          <text x={320} y={233} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            Хойт, 1939
          </text>
        </g>
        {/* Харис и Улман */}
        <g>
          <rect x={448} y={28} width={164} height={164} rx="6" fill={Z[4]} stroke="#fff" />
          <path d="M448 28 h80 v60 h-30 v40 h-50 Z" fill={Z[3]} stroke="#fff" />
          <path d="M560 28 h52 v90 h-30 v-40 h-22 Z" fill={Z[5]} stroke="#fff" />
          <rect x={508} y={78} width={34} height={30} fill={Z[1]} stroke="#fff" />
          <rect x={478} y={58} width={30} height={22} fill={Z[2]} stroke="#fff" />
          <rect x={456} y={140} width={46} height={44} fill={Z[6]} stroke="#fff" />
          <rect x={566} y={142} width={30} height={26} fill={Z[7]} stroke="#fff" />
          <text x={530} y={218} fontSize="12" textAnchor="middle" className="fill-current font-semibold">
            много ядра
          </text>
          <text x={530} y={233} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
            Харис и Улман, 1945
          </text>
        </g>
        {/* Легенда */}
        {ZONES.map((z, i) => (
          <g key={z.id} transform={`translate(${20 + (i % 3) * 205}, ${248 + Math.floor(i / 3) * 18})`}>
            <rect width="12" height="12" fill={z.fill} rx="2" />
            <text x="17" y="10" fontSize="10" className="fill-gray-700 dark:fill-gray-200">
              {z.name}
            </text>
          </g>
        ))}
      </LabSvg>
    </div>
  );
}
