import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Flask = 'open' | 'sealed' | 'swan';
type Event = { kind: 'break' | 'tilt'; day: number } | null;

const FLASKS: { id: Flask; label: string }[] = [
  { id: 'open', label: 'отворена колба' },
  { id: 'sealed', label: 'запоена колба' },
  { id: 'swan', label: 'колба с „гъша шия“' },
];
const DAYS = 20;

// Колбата: кълбо с център (CX, CY), бульонът е под нивото LEVEL
const CX = 170;
const CY = 175;
const R = 58;
const LEVEL = 168;
const SWAN = `M${CX} ${CY - R + 4} L${CX} 72 C${CX} 30 245 30 245 78 L245 150 C245 196 305 196 305 150 L305 58`;
const BROKEN = `M${CX} ${CY - R + 4} L${CX} 64`;
const STRAIGHT = `M${CX} ${CY - R + 4} L${CX} 46`;

/** Псевдослучайно число в [0, 1) – еднакво при prerender и в браузъра. */
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
// Точките на микробите в бульона (в долната част на кълбото)
const SPECKS = Array.from({ length: 70 }, (_, i) => {
  const a = rand(i) * Math.PI;
  const r = Math.sqrt(rand(i + 100)) * (R - 8);
  return { x: CX + r * Math.cos(a), y: CY + 4 + r * Math.sin(a) * 0.9 };
}).filter(p => p.y > LEVEL + 3);

/** От кой ден в бульона има микроби (Infinity – никога). */
function contaminationDay(flask: Flask, boiled: boolean, event: Event) {
  if (!boiled) return 0;
  if (flask === 'open') return 1;
  if (flask === 'sealed') return Infinity;
  return event ? event.day + (event.kind === 'break' ? 0.5 : 0) : Infinity;
}

/** Колко е мътен бульонът: 0 – бистър, 1 – съвсем мътен. Микробите се нароят за 2–4 дни. */
const turbidity = (day: number, from: number) => (day <= from ? 0 : 1 - Math.exp(-((day - from) ** 2) / 5));

/** Опитът на Пастьор: самозараждане ли е, или микробите идват отвън? */
export default function PasteurLab() {
  const [flask, setFlask] = useState<Flask>('swan');
  const [boiled, setBoiled] = useState(true);
  const [day, setDay] = useState(0);
  const [event, setEvent] = useState<Event>(null);

  const reset = (f: Flask, b: boolean) => {
    setFlask(f);
    setBoiled(b);
    setDay(0);
    setEvent(null);
  };

  const from = contaminationDay(flask, boiled, event);
  const tau = turbidity(day, from);
  const specks = SPECKS.slice(0, Math.round(tau * SPECKS.length));
  const broken = event?.kind === 'break' && day >= event.day;
  const tilted = event?.kind === 'tilt' && day >= event.day;
  // Прахът, който се е утаил в извивката на шийката (въздухът влиза през цялото време)
  const dust = flask === 'swan' && !broken ? Math.min(14, Math.round(day * 0.8)) : 0;
  const canAct = flask === 'swan' && boiled && !event && day > 0 && day < DAYS - 3;
  const neck = flask === 'swan' ? (broken ? BROKEN : SWAN) : STRAIGHT;
  const dustFalls = (flask === 'open' || broken) && day > 0;

  let note: string;
  let tone: 'emerald' | 'rose' | 'violet' | 'amber' = 'violet';
  if (day === 0) note = 'Премести плъзгача на дните и гледай бульона.';
  else if (!boiled) {
    note = 'Бульонът не е сварен – микробите са в него от самото начало. Такъв опит не доказва нищо: трябва да започнем със стерилен бульон.';
    tone = 'amber';
  } else if (flask === 'open') {
    note = 'Прахът от въздуха пада в бульона и носи микроби – след няколко дни той се размътва. Но привържениците на самозараждането казват: „Животът се заражда от въздуха.“';
    tone = 'rose';
  } else if (flask === 'sealed') {
    note = 'Бульонът остава бистър. Критиците обаче възразяват: „Няма свеж въздух – затова не се заражда живот.“ Този опит не отговаря на възражението.';
    tone = 'amber';
  } else if (broken) {
    note = 'Шийката е отчупена и прахът пада направо в бульона – след ден-два той се размътва. Значи микробите идват с праха, а не се зараждат сами.';
    tone = 'rose';
  } else if (tilted) {
    note = 'Бульонът докосна праха в извивката и го отнесе в колбата – след ден-два се размътва. Микробите са били в праха.';
    tone = 'rose';
  } else {
    note = 'Въздухът влиза свободно, но прахът се утаява в извивката на шийката. Бульонът остава бистър – седмици, месеци, дори години. Опитай да отчупиш шийката или да наклониш колбата.';
    tone = 'emerald';
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 266" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <defs>
          <clipPath id="pasteur-body">
            <circle cx={CX} cy={CY} r={R - 3} />
          </clipPath>
        </defs>

        {/* Стъклото: дебела сива линия, а отвътре – по-тънка в цвета на фона */}
        <path d={neck} fill="none" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="22" strokeLinecap="butt" />
        <circle cx={CX} cy={CY} r={R} className="fill-white stroke-gray-400 dark:fill-gray-800 dark:stroke-gray-500" strokeWidth="3" />
        <path d={neck} fill="none" className="stroke-white dark:stroke-gray-800" strokeWidth="16" strokeLinecap="butt" />
        {flask === 'sealed' && <circle cx={CX} cy={46} r={11} className="fill-gray-400 dark:fill-gray-500" />}
        {broken && <path d={`M${CX - 11} 64 L${CX - 5} 58 L${CX} 64 L${CX + 5} 57 L${CX + 11} 64`} fill="none" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" />}

        {/* Бульонът и микробите */}
        <g clipPath="url(#pasteur-body)">
          <rect x={CX - R} y={LEVEL} width={2 * R} height={R + 20} fill="#fcd34d" opacity="0.55" />
          <rect x={CX - R} y={LEVEL} width={2 * R} height={R + 20} fill="#e7e5e4" opacity={tau * 0.85} />
          {specks.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="1.6" fill="#78716c" />
          ))}
        </g>

        {/* Прахът в извивката и падащият прах */}
        {Array.from({ length: dust }, (_, i) => (
          <circle key={i} cx={265 + rand(i + 300) * 22} cy={182 - rand(i + 400) * 6} r="2" fill="#78716c" />
        ))}
        {tilted && <circle cx={275} cy={184} r="5" fill="#fcd34d" opacity="0.8" />}
        {dustFalls &&
          [0, 1, 2, 3, 4].map(i => {
            const top = flask === 'open' ? 10 : 30;
            const y = top + ((day * 37 + i * 23) % 70);
            return <circle key={i} cx={CX - 6 + rand(i + 500) * 12} cy={y} r="2" fill="#78716c" />;
          })}

        {/* Надписи */}
        <text x={470} y={34} fontSize="22" fontWeight="700" textAnchor="end" fill="currentColor">
          ден {day}
        </text>
        <text x={470} y={58} fontSize="13" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          {boiled ? 'бульонът е сварен' : 'бульонът не е сварен'}
        </text>
        <text x={CX} y={CY + R + 16} fontSize="13" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          {tau < 0.05 ? 'бистър бульон' : tau < 0.6 ? 'бульонът се размътва' : 'мътен – пълен с микроби'}
        </text>
        {flask === 'swan' && !broken && (
          <text x={275} y={214} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
            прахът спира тук
          </text>
        )}
      </LabSvg>

      <Buttons>
        {FLASKS.map(f => (
          <DiagramButton key={f.id} active={flask === f.id} onClick={() => reset(f.id, boiled)}>
            {f.label}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={boiled} onClick={() => reset(flask, true)}>
          сварен бульон
        </DiagramButton>
        <DiagramButton active={!boiled} onClick={() => reset(flask, false)}>
          несварен бульон
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label={`Дни: ${day}`} value={day} onChange={setDay} min={0} max={DAYS} step={1} />
      </Sliders>
      {canAct && (
        <Buttons>
          <DiagramButton onClick={() => setEvent({ kind: 'break', day })}>✂️ Отчупи шийката</DiagramButton>
          <DiagramButton onClick={() => setEvent({ kind: 'tilt', day })}>↘️ Наклони колбата</DiagramButton>
        </Buttons>
      )}
      <div className="mt-3">
        <Readout
          items={[
            { label: 'мътност', value: `${Math.round(tau * 100)}%` },
            { label: 'микроби от', value: from === Infinity ? 'няма' : `ден ${Math.ceil(from)}` },
          ]}
        />
      </div>
      <Note tone={tone}>{note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Смени вида на колбата или бульона – опитът започва отначало. Добрият опит изключва всички обяснения освен едно: само колбата с
        „гъша шия“ пуска въздуха, но спира праха.
      </p>
    </div>
  );
}
