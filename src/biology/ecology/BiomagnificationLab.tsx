import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

const LEVELS = ['вода', 'планктон', 'малки риби', 'хищни риби', 'рибоядни птици'];
const COLORS = ['#38bdf8', '#16a34a', '#0891b2', '#2563eb', '#e11d48'];

type Preset = { id: string; name: string; water: number; lgBcf: number; keep: number; grow: number; seen?: number[]; note: string };

const PRESETS: Preset[] = [
  {
    id: 'ddt',
    name: 'ДДТ',
    water: 0.00005,
    lgBcf: 2.9,
    keep: 80,
    grow: 10,
    seen: [0.00005, 0.04, 0.5, 2, 25],
    note: 'ДДТ се разтваря в мазнините, не в кръвта, и почти не се разгражда: животното го задържа и го трупа през целия си живот. Точките са закръглени измервания от едно устие на река край Лонг Айлънд (Удуел и сътрудници, 1967 г.).',
  },
  {
    id: 'hg',
    name: 'метилживак',
    water: 0.0000001,
    lgBcf: 5,
    keep: 90,
    grow: 10,
    note: 'Метилживакът се свързва с белтъците на мускулите и се изхвърля бавно. Числата са примерни. Нормата в ЕС за повечето риби е 0,5 mg/kg, а за едрите хищни (риба тон, риба меч) – 1 mg/kg: затова бременните жени се съветват да ядат по-малко едра хищна риба.',
  },
  {
    id: 'soluble',
    name: 'водоразтворимо',
    water: 0.00005,
    lgBcf: 1,
    keep: 5,
    grow: 10,
    note: 'Вещество, което се разтваря във вода и бързо се изхвърля с урината: животното задържа малка част от погълнатото и концентрацията надолу по веригата дори намалява. Затова опасни са устойчивите мастноразтворими вещества.',
  },
];

const Y_TOP = 3; // lg(1000 ppm)
const Y_BOT = -8;
const X0 = 70;
const Y0 = 300;
const Y1 = 30;
const py = (lg: number) => Y0 - ((Math.min(Y_TOP, Math.max(Y_BOT, lg)) - Y_BOT) / (Y_TOP - Y_BOT)) * (Y0 - Y1);
const colX = (k: number) => X0 + 50 + k * 112;

/** Число в ppm: малките – със степен на десетта. */
const ppm = (v: number) => {
  if (v >= 1000) return String(Number(v.toPrecision(3))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  if (v >= 0.01) return Number(v.toPrecision(3)).toString().replace('.', ',');
  const e = Math.floor(Math.log10(v));
  const m = v / 10 ** e;
  return `${Number(m.toFixed(1)).toString().replace('.', ',')}·10${String(e).replace('-', '⁻').replace(/\d/g, c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)])}`;
};

/** Биомагнификация: концентрация на отрова по хранителната верига – вода → планктон → риби → птици. */
export default function BiomagnificationLab() {
  const [pid, setPid] = useState('ddt');
  const p = PRESETS.find(x => x.id === pid)!;
  const [lgBcf, setLgBcf] = useState(p.lgBcf);
  const [keep, setKeep] = useState(p.keep);
  const [grow, setGrow] = useState(p.grow);

  const choose = (x: Preset) => {
    setPid(x.id);
    setLgBcf(x.lgBcf);
    setKeep(x.keep);
    setGrow(x.grow);
  };

  const bmf = keep / grow;
  const conc = [p.water, p.water * 10 ** lgBcf];
  for (let k = 0; k < 3; k++) conc.push(conc[conc.length - 1] * bmf);
  const total = conc[4] / conc[0];

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 340" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <line x1={X0} y1={Y0} x2={620} y2={Y0} stroke="currentColor" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="currentColor" />
        {Array.from({ length: Y_TOP - Y_BOT + 1 }, (_, k) => Y_BOT + k).map(e => (
          <g key={e}>
            <line x1={X0 - 4} x2={620} y1={py(e)} y2={py(e)} className="stroke-gray-200 dark:stroke-gray-700" />
            {e % 2 === 0 || e === Y_TOP ? (
              <text x={X0 - 8} y={py(e) + 4} fontSize="10" textAnchor="end" fill="currentColor">
                {e >= 0 ? String(10 ** e) : `10${String(e).replace('-', '⁻').replace(/\d/g, c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)])}`}
              </text>
            ) : null}
          </g>
        ))}
        <text x={X0 - 56} y={Y1 - 12} fontSize="11" fill="currentColor">
          ppm (mg/kg)
        </text>
        {pid === 'hg' && (
          <g>
            <line x1={X0} x2={620} y1={py(Math.log10(0.5))} y2={py(Math.log10(0.5))} stroke="#f59e0b" strokeDasharray="6 4" strokeWidth={1.5} />
            <text x={616} y={py(Math.log10(0.5)) - 4} fontSize="10" textAnchor="end" fill="#d97706">
              норма за риба в ЕС: 0,5
            </text>
          </g>
        )}
        {conc.map((c, k) => {
          const x = colX(k);
          const yTop = py(Math.log10(c));
          return (
            <g key={k}>
              <rect x={x - 28} y={yTop} width={56} height={Y0 - yTop} rx={3} fill={COLORS[k]} opacity={0.8} />
              <text x={x} y={yTop - 6} fontSize="11" fontWeight="600" textAnchor="middle" fill="currentColor">
                {ppm(c)}
              </text>
              <text x={x} y={Y0 + 16} fontSize="11" textAnchor="middle" fill="currentColor">
                {LEVELS[k]}
              </text>
              {p.seen && pid === 'ddt' && (
                <circle cx={x + 18} cy={py(Math.log10(p.seen[k]))} r={5} fill="#fff" stroke="#111827" strokeWidth={2} />
              )}
            </g>
          );
        })}
        {pid === 'ddt' && (
          <g fontSize="10" fill="currentColor">
            <circle cx={X0 + 14} cy={Y0 + 32} r={4} fill="#fff" stroke="#111827" strokeWidth={2} />
            <text x={X0 + 22} y={Y0 + 36}>измерено (Удуел и сътр., 1967)</text>
          </g>
        )}
      </LabSvg>

      <Buttons>
        {PRESETS.map(x => (
          <DiagramButton key={x.id} active={pid === x.id} onClick={() => choose(x)}>
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="lg BCF" value={lgBcf} onChange={setLgBcf} min={0} max={6} step={0.1} tone="emerald" />
        <Slider label="задържа" value={keep} onChange={setKeep} min={0} max={100} step={5} tone="rose" />
        <Slider label="растеж" value={grow} onChange={setGrow} min={3} max={25} step={1} tone="blue" />
      </Sliders>
      <Readout
        items={[
          { label: 'BCF (планктон/вода)', value: ppm(10 ** lgBcf), tone: 'emerald' },
          { label: 'BMF на ниво', value: Number(bmf.toFixed(2)).toString().replace('.', ','), tone: bmf > 1 ? 'rose' : 'emerald' },
          { label: 'птици/вода', value: `${ppm(total)} пъти`, tone: 'violet' },
        ]}
      />
      <Formula>
        BMF = задържана част / ефективност на растежа = {keep} % / {grow} % = {Number(bmf.toFixed(2)).toString().replace('.', ',')}
      </Formula>
      <Note tone={bmf > 1 ? 'rose' : 'emerald'}>{p.note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Планктонът поема веществото направо от водата (коефициент на биоконцентрация BCF). Всеки консумент, за да натрупа 1 kg тяло,
        изяжда около 1/(ефективност на растежа) kg храна – при 10 % това са 10 kg. Ако задържи 80 % от отровата в тях, концентрацията в
        тялото му става 0,8 · 10 = 8 пъти по-висока от тази в храната (BMF). Моделът е опростен: рибите поемат отрова и през хрилете, а
        концентрацията зависи от възрастта, мазнините и вида.
      </p>
    </div>
  );
}
