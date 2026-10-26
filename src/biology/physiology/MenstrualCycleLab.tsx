import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Mode = 'cycle' | 'pregnancy' | 'pill';

const DAYS = 28;
const gauss = (d: number, mu: number, s: number) => Math.exp(-((d - mu) ** 2) / (2 * s * s));
const rise = (d: number, at: number, w: number) => 1 / (1 + Math.exp(-(d - at) / w));

/** Относителни нива (0–1) на хормоните в ден d (1–28). Моделът е качествен – формата на кривите, не точни стойности. */
function levels(d: number, mode: Mode) {
  if (mode === 'pill') {
    // таблетката дава постоянни синтетични естроген и прогестин → ФСХ и ЛХ са потиснати
    return { fsh: 0.18, lh: 0.15, e: 0.35, p: 0.45, hcg: 0 };
  }
  const fsh = 0.2 + 0.25 * gauss(d, 3, 3) + 0.4 * gauss(d, 13.5, 0.8) - 0.08 * rise(d, 16, 1) * (1 - rise(d, 26, 1));
  const lh = 0.15 + 0.85 * gauss(d, 13.5, 0.75);
  let e = 0.12 + 0.85 * gauss(d, 12.5, 2.2) + 0.42 * gauss(d, 21, 3);
  let p = 0.04 + 0.92 * gauss(d, 21, 3) * rise(d, 15, 0.8);
  let hcg = 0;
  if (mode === 'pregnancy') {
    // от имплантацията (около 21. ден) зародишът отделя hCG и жълтото тяло не загива
    const w = rise(d, 21, 0.7);
    hcg = w * Math.min(1, 0.06 * 2 ** ((d - 21) / 2));
    e = e * (1 - w) + 0.6 * w;
    p = p * (1 - w) + 0.96 * w;
  }
  return { fsh, lh, e, p, hcg };
}

/** Дебелина на лигавицата на матката, mm (приблизително). */
function endometrium(d: number, mode: Mode) {
  if (mode === 'pill') return 4;
  if (d <= 5) return 9 - 7 * ((d - 1) / 4);
  if (d <= 14) return 2 + (8 * (d - 5)) / 9;
  if (mode === 'pregnancy' || d <= 25) return Math.min(12, 10 + (d - 14) * 0.3);
  return 12 - (d - 25) * 0.6;
}

const X0 = 50;
const X1 = 610;
const Y0 = 230;
const Y1 = 40;
const px = (d: number) => X0 + ((d - 1) / (DAYS - 1)) * (X1 - X0);
const py = (v: number) => Y0 - v * (Y0 - Y1);

const CURVES = [
  { key: 'fsh', name: 'ФСХ', color: '#0ea5e9' },
  { key: 'lh', name: 'ЛХ', color: '#8b5cf6' },
  { key: 'e', name: 'естроген', color: '#e11d48' },
  { key: 'p', name: 'прогестерон', color: '#f59e0b' },
] as const;

/** Менструален цикъл: хормони на хипофизата и яйчника, яйчник и лигавица на матката по дни. */
export default function MenstrualCycleLab() {
  const [day, setDay] = useState(10);
  const [mode, setMode] = useState<Mode>('cycle');

  const xs = Array.from({ length: 271 }, (_, k) => 1 + k * 0.1);
  const pathOf = (f: (d: number) => number) => xs.map((d, k) => `${k ? 'L' : 'M'} ${px(d).toFixed(1)} ${py(f(d)).toFixed(1)}`).join(' ');
  const thick = endometrium(day, mode);

  // яйчникът: доминантен фоликул расте до ~20 mm, спуква се на 14. ден, после жълто тяло
  const ovulated = mode !== 'pill' && day >= 14;
  const follicle = mode === 'pill' ? 4 : day < 14 ? 4 + (16 * (day - 1)) / 13 : 0;
  const lutealAlive = mode === 'pregnancy' || day < 25;
  const luteum = !ovulated ? 0 : lutealAlive ? Math.min(14, 6 + (day - 14) * 1.5) : Math.max(4, 14 - (day - 25) * 3);

  let phase: string;
  if (mode === 'pill') phase = 'потисната овулация';
  else if (day <= 5) phase = 'менструация';
  else if (day < 14) phase = 'фоликулна фаза';
  else if (day === 14) phase = 'овулация';
  else phase = mode === 'pregnancy' && day >= 21 ? 'бременност' : 'лутеална фаза';

  let msg: string;
  if (mode === 'pill')
    msg = 'Хапчето държи естрогена и прогестина постоянни и умерени. Чрез отрицателна обратна връзка хипоталамусът и хипофизата отделят малко ФСХ и ЛХ – фоликулът не узрява, няма пик на ЛХ и няма овулация.';
  else if (day <= 5) msg = 'Естрогенът и прогестеронът са ниски – лигавицата на матката се отлепя (менструация). Ниските хормони пускат ФСХ малко нагоре и нови фоликули започват да растат.';
  else if (day < 12) msg = 'Растящият фоликул отделя все повече естроген. Той удебелява лигавицата и засега потиска ФСХ и ЛХ – отрицателна обратна връзка.';
  else if (day < 14) msg = 'Естрогенът е висок от около два дни – обратната връзка се обръща в положителна: хипофизата изсипва пик от ЛХ (и ФСХ).';
  else if (day === 14) msg = 'Около 10–12 часа след върха на ЛХ зрелият фоликул се спуква и пуска яйцеклетката (по-точно вторичния ооцит) – овулация. Тя може да бъде оплодена в следващите 12–24 часа.';
  else if (mode === 'pregnancy' && day >= 21)
    msg = 'Зародишът се е имплантирал и отделя hCG. Той поддържа жълтото тяло – прогестеронът остава висок, лигавицата не се отлепя и менструация няма. На hCG в урината се основава тестът за бременност.';
  else if (day < 25) msg = 'Остатъкът от фоликула става жълто тяло и отделя прогестерон (и естроген). Прогестеронът подготвя лигавицата за зародиш и потиска ФСХ и ЛХ.';
  else msg = 'Няма бременност – след около 10–12 дни жълтото тяло загива. Прогестеронът спада и лигавицата скоро ще се отлепи: започва нов цикъл.';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 400" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* фази */}
        {mode !== 'pill' && (
          <>
            <rect x={px(1)} y={Y1} width={px(5) - px(1)} height={Y0 - Y1} fill="#e11d48" opacity={0.08} />
            <rect x={px(13.5)} y={Y1} width={px(14.5) - px(13.5)} height={Y0 - Y1} fill="#8b5cf6" opacity={0.1} />
          </>
        )}
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="currentColor" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="currentColor" />
        {[1, 5, 10, 14, 20, 25, 28].map(v => (
          <g key={v}>
            <line x1={px(v)} x2={px(v)} y1={Y0} y2={Y0 + 4} stroke="currentColor" />
            <text x={px(v)} y={Y0 + 16} fontSize="11" textAnchor="middle" fill="currentColor">{v}</text>
          </g>
        ))}
        <text x={X0} y={Y1 - 22} fontSize="12" fill="currentColor">ниво на хормона (относително)</text>
        <text x={X1} y={Y0 + 30} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">ден от цикъла</text>

        {CURVES.map(c => (
          <path key={c.key} d={pathOf(d => levels(d, mode)[c.key])} fill="none" stroke={c.color} strokeWidth={2.5} />
        ))}
        {mode === 'pregnancy' && <path d={pathOf(d => levels(d, mode).hcg)} fill="none" stroke="#10b981" strokeWidth={2.5} strokeDasharray="6 3" />}
        {CURVES.map((c, k) => (
          <g key={c.key}>
            <rect x={X0 + 10 + k * 110} y={Y1 - 4} width={14} height={4} fill={c.color} />
            <text x={X0 + 28 + k * 110} y={Y1} fontSize="11" fill="currentColor">{c.name}</text>
          </g>
        ))}
        {mode === 'pregnancy' && (
          <text x={X0 + 450} y={Y1} fontSize="11" fill="#10b981">— hCG</text>
        )}
        <line x1={px(day)} x2={px(day)} y1={Y0} y2={Y1} stroke="#64748b" strokeDasharray="3 3" />

        {/* яйчник */}
        <text x={60} y={268} fontSize="12" fontWeight="700" fill="currentColor">яйчник</text>
        <ellipse cx={130} cy={330} rx={70} ry={45} fill="#fda4af" opacity={0.35} stroke="#e11d48" />
        {[[95, 310], [110, 350], [160, 352], [85, 335]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={4} fill="none" stroke="#e11d48" opacity={0.6} />
        ))}
        {follicle > 0 && (
          <g>
            <circle cx={145} cy={322} r={follicle} fill="#fff1f2" stroke="#e11d48" strokeWidth={1.5} />
            <circle cx={145 + follicle * 0.4} cy={322 - follicle * 0.3} r={2.5} fill="#e11d48" />
          </g>
        )}
        {luteum > 0 && <circle cx={145} cy={322} r={luteum} fill={lutealAlive ? '#facc15' : '#e5e7eb'} stroke={lutealAlive ? '#ca8a04' : '#9ca3af'} />}
        {mode !== 'pill' && day === 14 && (
          <g>
            <circle cx={215} cy={290} r={5} fill="#e11d48" />
            <path d="M 165 305 L 208 292" stroke="#e11d48" strokeDasharray="3 2" />
          </g>
        )}
        <text x={130} y={392} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          {follicle > 0 && mode !== 'pill' ? 'расте фоликул' : luteum > 0 ? (lutealAlive ? 'жълто тяло' : 'жълтото тяло загива') : 'фоликулите не узряват'}
        </text>

        {/* лигавица на матката */}
        <text x={300} y={268} fontSize="12" fontWeight="700" fill="currentColor">лигавица на матката</text>
        <rect x={300} y={360} width={300} height={14} rx={3} fill="#be123c" opacity={0.7} />
        <rect x={300} y={360 - thick * 6} width={300} height={thick * 6} rx={3} fill="#fb7185" opacity={0.55} />
        {mode !== 'pill' && day <= 5 &&
          [330, 380, 440, 500, 560].map(x => <circle key={x} cx={x} cy={350 - thick * 6} r={3} fill="#be123c" />)}
        <text x={605} y={356 - thick * 6} fontSize="11" textAnchor="end" fill="currentColor">
          ≈ {thick.toFixed(0)} mm
        </text>
      </LabSvg>

      <Buttons>
        <DiagramButton active={mode === 'cycle'} onClick={() => setMode('cycle')}>
          без бременност
        </DiagramButton>
        <DiagramButton active={mode === 'pregnancy'} onClick={() => setMode('pregnancy')}>
          🤰 оплождане на 14. ден
        </DiagramButton>
        <DiagramButton active={mode === 'pill'} onClick={() => setMode('pill')}>
          💊 хормонално хапче
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="ден" value={day} onChange={setDay} min={1} max={DAYS} step={1} tone="rose" />
      </Sliders>
      <Readout
        items={[
          { label: 'ден', value: day, tone: 'gray' },
          { label: 'фаза', value: phase, tone: 'rose' },
          { label: 'лигавица', value: `≈ ${thick.toFixed(0)} mm`, tone: 'amber' },
        ]}
      />
      <Note tone="rose">{msg}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Кривите показват само формата – кога всеки хормон расте и спада, не точните концентрации. Хипофизата отделя ФСХ и ЛХ, яйчникът –
        естроген и прогестерон. Дължината на цикъла е различна при различните жени (обикновено 21–35 дни); по-постоянна е втората половина
        – около 14 дни от овулацията до менструацията.
      </p>
    </div>
  );
}
