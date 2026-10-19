import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { formulaText } from '../formula';

type Salt = { f: string; ion: string; color: string; name: string; lines?: number[]; note: string };

// Линиите (в nm) са на атомите; при Ca, Sr, Ba и Cu цветът идва главно от ивиците на молекули в пламъка (CaOH, SrOH, BaOH, CuCl …)
const SALTS: Salt[] = [
  { f: 'LiCl', ion: 'Li⁺', color: '#d1133a', name: 'карминеночервен', lines: [670.8], note: 'Литият оцветява пламъка карминеночервено – главно от линията при 671 nm.' },
  { f: 'NaCl', ion: 'Na⁺', color: '#ffb300', name: 'жълт', lines: [589.0, 589.6], note: 'Натриевата двойна линия при 589 nm е толкова ярка, че и следи от натрий оцветяват пламъка жълто.' },
  { f: 'KCl', ion: 'K⁺', color: '#b57edc', name: 'бледовиолетов', lines: [766.5, 769.9, 404.4], note: 'Пламъкът на калия е бледовиолетов – линиите му са в двата края на видимия спектър, където окото е слабо чувствително.' },
  { f: 'CaCl2', ion: 'Ca²⁺', color: '#ff5e2b', name: 'керемиденочервен', note: 'Калцият дава оранжево-червен (керемиден) пламък. Цветът идва главно от ивици на молекулата CaOH, а не от отделни атомни линии.' },
  { f: 'SrCl2', ion: 'Sr²⁺', color: '#f01e2c', name: 'яркочервен', note: 'Стронцият дава ярко червен пламък – затова солите му се слагат в червените фойерверки и сигналните ракети.' },
  { f: 'BaCl2', ion: 'Ba²⁺', color: '#a6d936', name: 'жълтозелен', note: 'Барият оцветява пламъка жълтозелено – това е зеленото във фойерверките.' },
  { f: 'CuCl2', ion: 'Cu²⁺', color: '#20c997', name: 'зелен до синьо-зелен', note: 'Медта оцветява пламъка зелено до синьо-зелено (при хлоридите – по-синкаво).' },
];

const NA = SALTS[1];
const COBALT = '#3b4ba8';

/** Смесва два цвята #rrggbb: t = 0 → a, t = 1 → b. */
function mixHex(a: string, b: string, t: number) {
  const ch = (h: string, i: number) => parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16);
  return '#' + [0, 1, 2].map(i => Math.round(ch(a, i) * (1 - t) + ch(b, i) * t).toString(16).padStart(2, '0')).join('');
}

/** Цвят на светлина с дължина на вълната λ (nm) – грубо приближение за чертежа. */
function wavelengthColor(l: number) {
  const hue = l < 440 ? 270 - ((l - 380) / 60) * 30 : l < 490 ? 240 - ((l - 440) / 50) * 60 : l < 510 ? 180 - ((l - 490) / 20) * 60 : l < 580 ? 120 - ((l - 510) / 70) * 60 : l < 645 ? 60 - ((l - 580) / 65) * 60 : 0;
  return `hsl(${hue}, 100%, ${l > 700 ? 40 : 55}%)`;
}

const X0 = 200;
const SX = 0.65; // px на nm: 380 nm → 200, 780 nm → 460
const lx = (l: number) => X0 + (l - 380) * SX;

/** Оцветяване на пламъка: соли на метали, примес от натрий и кобалтово стъкло. */
export default function FlameTestLab() {
  const [si, setSi] = useState(0);
  const [sodium, setSodium] = useState(false);
  const [cobalt, setCobalt] = useState(false);
  const s = SALTS[si];
  const isNa = s === NA;

  // Какъв цвят вижда окото
  let seen = s.color;
  if (sodium && !isNa) seen = mixHex(s.color, NA.color, 0.75);
  if (cobalt) seen = isNa ? mixHex(COBALT, '#000000', 0.3) : s.f === 'KCl' ? '#a1307f' : mixHex(s.color, COBALT, 0.5);

  // Линиите в спектроскопа: кобалтовото стъкло поглъща жълтата натриева светлина
  const lines = [...(s.lines ?? []), ...(sodium && !isNa ? NA.lines! : [])].filter(l => !(cobalt && l > 560 && l < 610));
  const visible = (l: number) => l >= 380 && l <= 780;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {SALTS.map((x, i) => (
          <DiagramButton key={x.f} active={i === si} onClick={() => setSi(i)}>
            {formulaText(x.f)}
          </DiagramButton>
        ))}
      </Buttons>

      <LabSvg viewBox="0 0 480 220" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <defs>
          <radialGradient id="flame-glow" cx="50%" cy="60%" r="60%">
            <stop offset="0%" stopColor={seen} stopOpacity="0.95" />
            <stop offset="100%" stopColor={seen} stopOpacity="0.25" />
          </radialGradient>
        </defs>
        {/* горелката */}
        <rect x={80} y={150} width={20} height={48} className="fill-gray-400 dark:fill-gray-500" />
        <rect x={60} y={196} width={60} height={10} rx={3} className="fill-gray-500 dark:fill-gray-400" />
        <path d="M 90 152 C 56 120, 70 78, 90 30 C 110 78, 124 120, 90 152 Z" fill="url(#flame-glow)" />
        <path d="M 90 150 C 80 136, 82 124, 90 112 C 98 124, 100 136, 90 150 Z" fill="#93b4ff" opacity="0.8" />
        {/* телта със солта */}
        <line x1={160} y1={150} x2={102} y2={112} className="stroke-gray-500 dark:stroke-gray-300" strokeWidth="2" />
        <circle cx={100} cy={111} r={4} fill="none" className="stroke-gray-500 dark:stroke-gray-300" strokeWidth="2" />
        <text x={90} y={20} fontSize="12" fontWeight="600" textAnchor="middle" fill="currentColor">
          {cobalt ? 'през кобалтово стъкло' : 'пламъкът'}
        </text>
        {cobalt && <rect x={52} y={26} width={76} height={128} rx={6} fill={COBALT} opacity="0.18" className="stroke-blue-800" strokeWidth="1" />}

        {/* спектроскопът */}
        <text x={330} y={44} fontSize="12" fontWeight="600" textAnchor="middle" fill="currentColor">
          спектроскоп
        </text>
        <rect x={X0} y={56} width={260} height={40} fill="#111827" />
        {lines.filter(visible).map(l => (
          <rect key={l} x={lx(l) - 1} y={56} width={2.4} height={40} fill={wavelengthColor(l)} />
        ))}
        {[400, 500, 600, 700].map(l => (
          <g key={l}>
            <line x1={lx(l)} x2={lx(l)} y1={96} y2={101} className="stroke-gray-500" />
            <text x={lx(l)} y={113} fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
              {l}
            </text>
          </g>
        ))}
        <text x={460} y={113} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          nm
        </text>
        {!s.lines && (
          <text x={330} y={140} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
            <tspan x={330}>Широки ивици от молекули в пламъка –</tspan>
            <tspan x={330} dy={15}>
              тук не са нарисувани.
            </tspan>
          </text>
        )}
        {s.lines && (
          <text x={330} y={140} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
            {lines.length ? `линии: ${[...new Set(lines.map(l => Math.round(l)))].sort((x, y) => x - y).join(', ')} nm` : 'жълтите линии са погълнати'}
          </text>
        )}
      </LabSvg>

      <Buttons>
        <DiagramButton active={sodium} onClick={() => setSodium(!sodium)}>
          примес от натрий
        </DiagramButton>
        <DiagramButton active={cobalt} onClick={() => setCobalt(!cobalt)}>
          кобалтово стъкло
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'открива се:', value: s.ion, tone: 'blue' },
            { label: 'цвят на пламъка:', value: s.name },
          ]}
        />
      </div>
      <Note tone={sodium && !isNa && !cobalt ? 'amber' : 'emerald'}>
        {sodium && !isNa && !cobalt
          ? 'Следите от натрий (дори от пръстите) правят пламъка жълт и скриват цвета на другия метал. Сложи кобалтово стъкло.'
          : cobalt && s.f === 'KCl'
            ? 'Синьото кобалтово стъкло поглъща жълтата натриева светлина, но пропуска виолетовата и тъмночервената на калия – така калият се вижда и при примес от натрий.'
            : s.note}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 В горещия пламък йоните на метала се превръщат в атоми (или малки молекули), електроните им се възбуждат и при връщането си
        излъчват светлина с точно определени дължини на вълната. Цветовете тук са приблизителни – истинските зависят от горелката и
        концентрацията. Защо атомите излъчват линии, е в урока по физика „Атомът“.
      </p>
    </div>
  );
}
