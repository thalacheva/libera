import { useState } from 'react';
import { fmt } from './terrestrialData';

const W = 640;
const H = 330;
const X0 = 130;
const X1 = 625;
const LOG_MIN = -6; // ~0,2 AU
const LOG_MAX = 10.2; // ~15 Gpc
const lx = (pc: number) => X0 + ((Math.log10(pc) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * (X1 - X0);
const ROW = 23;
const Y0 = 28;
const H0_LADDER = 73.0; // km/s/Mpc – по стълбата (SH0ES)
const H0_CMB = 67.4; // km/s/Mpc – от реликтовото излъчване (Planck)

type Rung = { id: string; name: string; from: number; to: number; color: string; calibratedBy?: string; text: string };

const RUNGS: Rung[] = [
  { id: 'radar', name: 'Радар', from: 1e-6, to: 3e-4, color: '#94a3b8', text: 'Радиоимпулс до Венера, Марс или астероид и обратно. Измерва AU с точност до метри – основата на всичко останало.' },
  { id: 'parallax', name: 'Паралакс (Gaia)', from: 1, to: 1e4, color: '#60a5fa', calibratedBy: 'radar', text: 'Чиста геометрия: базата е орбитата на Земята (2 AU). Gaia измери паралаксите на ~1,5 милиарда звезди – първото стъпало до звездите.' },
  { id: 'ms', name: 'Главна посл. на купове', from: 40, to: 5e4, color: '#22d3ee', calibratedBy: 'parallax', text: 'Подреждане по главната последователност (Лекция 19). Калибрира се с купове, чиито звезди имат паралакси – Хиади и Плеяди.' },
  { id: 'eb', name: 'Затъмняващи двойни', from: 1e3, to: 1e6, color: '#a78bfa', calibratedBy: 'parallax', text: 'От кривата на блясъка и скоростите следват истинските радиуси, от температурата – светимостта (Лекция 22). Дават разстоянието до Големия Магеланов облак с точност 1%.' },
  { id: 'cepheid', name: 'Цефеиди', from: 1e3, to: 4e7, color: '#fbbf24', calibratedBy: 'parallax', text: 'Зависимостта на Левит (Лекция 23), калибрирана с паралакси на цефеиди в Галактиката и с Магелановия облак.' },
  { id: 'trgb', name: 'Връх на гигантите', from: 1e4, to: 3e7, color: '#fb923c', calibratedBy: 'parallax', text: 'Независима от цефеидите калибровка за свръхновите. Работи и в галактики без млади звезди.' },
  { id: 'maser', name: 'Мазери (NGC 4258)', from: 5e6, to: 1e8, color: '#f472b6', text: 'Облаци вода, които обикалят около черна дупка в центъра на галактиката NGC 4258. Скоростта им (от Доплер) и ъгловото им движение дават геометрично разстояние 7,6 Mpc – втора котва на стълбата.' },
  { id: 'snia', name: 'Свръхнови Ia', from: 5e6, to: 1e10, color: '#f87171', calibratedBy: 'cepheid', text: 'Калибрират се в ~40 близки галактики, където има и цефеиди. Виждат се на милиарди светлинни години – с тях през 1998 г. е открито ускореното разширение (Лекция 29).' },
  { id: 'tf', name: 'Тъли–Фишър', from: 1e6, to: 2e8, color: '#86efac', calibratedBy: 'cepheid', text: 'Връзката между скоростта на въртене и светимостта на спиралните галактики.' },
  { id: 'gw', name: 'Гравитационни вълни', from: 4e7, to: 1e10, color: '#e879f9', text: '„Стандартни сирени“: формата на сигнала от сливане на неутронни звезди дава директно разстоянието, без никаква стълба. GW170817 даде H₀ ≈ 70 km/s/Mpc – още неточно, но напълно независимо.' },
  { id: 'hubble', name: 'Закон на Хъбъл', from: 1e7, to: 1.5e10, color: '#fca5a5', calibratedBy: 'snia', text: 'v = H₀ · d: по червеното отместване на спектъра на галактиката (Лекция 28). Работи, ако знаем H₀ – а него го дава стълбата.' },
];

const TARGETS = [
  { name: 'Голям Магеланов облак', d: 49.6e3 },
  { name: 'Андромеда', d: 765e3 },
  { name: 'куп Дева', d: 16.5e6 },
  { name: 'свръхнова Ia', d: 1e9 },
];

const fmtD = (pc: number) => (pc < 0.01 ? `${fmt(pc * 206265, 0)} AU` : pc < 1e3 ? `${fmt(pc, 0)} pc` : pc < 1e6 ? `${fmt(pc / 1e3, 1)} kpc` : pc < 1e9 ? `${fmt(pc / 1e6, 1)} Mpc` : `${fmt(pc / 1e9, 2)} Gpc`);

export default function LadderLab() {
  const [sel, setSel] = useState('cepheid');
  const [bias, setBias] = useState(0); // % грешка в калибровката на паралаксите
  const rung = RUNGS.find(r => r.id === sel)!;
  const f = 1 + bias / 100;
  const h0 = H0_LADDER / f;
  const chain = (() => {
    const out: string[] = [];
    let r: Rung | undefined = rung;
    while (r) {
      out.unshift(r.name);
      r = RUNGS.find(x => x.id === r!.calibratedBy);
    }
    return out;
  })();
  const dependsOnParallax = chain.includes('Паралакс (Gaia)');

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-indigo-300 dark:border-indigo-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Стълбата на разстоянията</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Всеки метод работи в определен интервал. Там, където два метода се застъпват, по-близкият калибрира по-далечния. Щракнете
        върху стъпало и вижте на какво се крепи.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {[-5, -2, 0, 3, 6, 9].map(p => (
          <g key={p}>
            <line x1={lx(10 ** p)} x2={lx(10 ** p)} y1={Y0 - 8} y2={Y0 + RUNGS.length * ROW} stroke="white" strokeOpacity="0.07" />
            <text x={lx(10 ** p)} y={Y0 - 12} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.5">
              {p === -5 ? '2 AU' : p === -2 ? '2000 AU' : fmtD(10 ** p)}
            </text>
          </g>
        ))}
        {RUNGS.map((r, i) => {
          const y = Y0 + i * ROW;
          const inChain = chain.includes(r.name);
          return (
            <g key={r.id} className="cursor-pointer" onClick={() => setSel(r.id)}>
              <text x={X0 - 6} y={y + 13} fontSize="10" textAnchor="end" fill={inChain ? 'white' : '#94a3b8'} fontWeight={r.id === sel ? 700 : 400}>
                {r.name}
              </text>
              <rect x={lx(r.from)} y={y + 3} width={lx(r.to) - lx(r.from)} height={14} rx="7" fill={r.color} fillOpacity={inChain ? 0.85 : 0.3} stroke={r.id === sel ? 'white' : 'none'} />
            </g>
          );
        })}
        {/* Стрелки на калибровката по веригата */}
        {RUNGS.filter(r => r.calibratedBy && chain.includes(r.name)).map(r => {
          const from = RUNGS.findIndex(x => x.id === r.calibratedBy);
          const to = RUNGS.indexOf(r);
          const prev = RUNGS[from];
          const x = (Math.max(lx(r.from), lx(prev.from)) + Math.min(lx(r.to), lx(prev.to))) / 2;
          return <line key={r.id} x1={x} x2={x} y1={Y0 + from * ROW + 17} y2={Y0 + to * ROW + 3} stroke="white" strokeWidth="1.5" strokeDasharray="2 2" markerEnd="url(#ld-arrow)" />;
        })}
        <defs>
          <marker id="ld-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="white" />
          </marker>
        </defs>
        <text x={X0} y={H - 12} fontSize="10" fill="white" fillOpacity="0.7">
          веригата: {chain.join(' → ')}
        </text>
      </svg>

      <div className="mt-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-sm sm:text-base">
        <p>
          <strong>{rung.name}</strong> ({fmtD(rung.from)} – {fmtD(rung.to)}): {rung.text}
        </p>
      </div>

      <label className="block text-sm font-semibold mt-4 mb-1">
        Систематична грешка в калибровката на паралаксите: {bias > 0 ? '+' : ''}
        {fmt(bias, 1)}%
      </label>
      <input type="range" min="-10" max="10" step="0.1" value={bias} onChange={e => setBias(Number(e.target.value))} className="w-full" />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 text-center text-sm">
        {TARGETS.map(t => (
          <div key={t.name} className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">{t.name}</div>
            <div className="font-semibold">{fmtD(t.d * f)}</div>
          </div>
        ))}
        <div className="bg-gray-100/70 dark:bg-gray-800/70 p-2 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400">H₀ от стълбата</div>
          <div className="font-semibold" style={{ color: Math.abs(h0 - H0_CMB) < 1 ? '#16a34a' : undefined }}>
            {fmt(h0, 1)} km/s/Mpc
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        {dependsOnParallax || bias === 0
          ? `Една и съща грешка в първото стъпало се пренася във всички следващи: всички разстояния растат с ${fmt(bias, 1)}%, а H₀ = v / d намалява. Стълбата дава H₀ ≈ ${fmt(H0_LADDER, 1)}, а реликтовото излъчване – ${fmt(H0_CMB, 1)} km/s/Mpc. За да се съгласят, паралаксите трябва да са сгрешени с ~+8% – а Gaia ги знае с точност по-добра от 1%. Това е „напрежението на Хъбъл“ – една от големите загадки на днешната космология (Лекция 28).`
          : 'Този метод не зависи от паралаксите – той е независима проверка на стълбата.'}
      </p>
    </div>
  );
}
