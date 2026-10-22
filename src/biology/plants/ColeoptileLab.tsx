import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Treatment = 'none' | 'cut' | 'cap' | 'glass' | 'sleeve' | 'gelatin' | 'mica-dark' | 'mica-lit' | 'went';

type Experiment = {
  id: Treatment;
  label: string;
  who: string;
  /** Ъгъл на огъване при светлина отляво (отрицателен – към светлината). */
  angle: number;
  text: string;
};

const EXPERIMENTS: Experiment[] = [
  { id: 'none', label: 'непокътнат', who: 'Дарвин, 1880', angle: -32, text: 'Колеоптилът се огъва към светлината. Огъва се частта под върха, а не самият връх.' },
  { id: 'cut', label: 'отрязан връх', who: 'Дарвин, 1880', angle: 0, text: 'Без върха колеоптилът почти не расте и не се огъва – сигналът идва от върха.' },
  { id: 'cap', label: 'непрозрачна шапчица', who: 'Дарвин, 1880', angle: 0, text: 'Върхът не „вижда“ светлината – колеоптилът расте право. Светлината се усеща от върха.' },
  { id: 'glass', label: 'прозрачна шапчица', who: 'Дарвин, 1880', angle: -32, text: 'Прозрачната шапчица пропуска светлината – огъването е нормално. Значи пречеше тъмнината, а не самата шапчица.' },
  { id: 'sleeve', label: 'покрита основа', who: 'Дарвин, 1880', angle: -32, text: 'Основата е на тъмно, но върхът е открит – огъването е нормално. Сигналът от върха „слиза“ надолу.' },
  { id: 'gelatin', label: 'желатин под върха', who: 'Бойсен-Йенсен, 1913', angle: -30, text: 'Върхът е отрязан и поставен обратно върху желатин. Огъването остава – сигналът е вещество, което минава през желатина.' },
  { id: 'mica-dark', label: 'слюда от сенчестата страна', who: 'Бойсен-Йенсен, 1913', angle: 0, text: 'Слюдата спира веществото от сенчестата страна – огъване няма. Значи то слиза по сенчестата страна.' },
  { id: 'mica-lit', label: 'слюда от осветената страна', who: 'Бойсен-Йенсен, 1913', angle: -32, text: 'Слюда от осветената страна не пречи – веществото и без това слиза по сенчестата.' },
  { id: 'went', label: 'агар встрани (на тъмно)', who: 'Вент, 1928', angle: 0, text: '' },
];

/** Условна чувствителност в линейната област: градуса на един връх. */
const DEG_PER_TIP = 4;
const L = 170; // дължина на колеоптила
const L0 = 60; // долната част не се огъва
const HW = 9; // половин дебелина
const X0 = 220;
const Y0 = 270;

/** Точка от централната линия на разстояние s от основата и отместване d надясно, при общ ъгъл θ (rad, + надясно). */
function frame(theta: number) {
  const n = 80;
  const pts: { x: number; y: number; phi: number }[] = [];
  let x = X0;
  let y = Y0;
  for (let i = 0; i <= n; i++) {
    const s = (i / n) * (L + 10);
    const phi = s <= L0 ? 0 : (theta * Math.min(s - L0, L - L0)) / (L - L0);
    pts.push({ x, y, phi });
    const ds = (L + 10) / n;
    x += Math.sin(phi) * ds;
    y -= Math.cos(phi) * ds;
  }
  return (s: number, d: number) => {
    const k = Math.max(0, Math.min(n, Math.round((s / (L + 10)) * n)));
    const p = pts[k];
    return { x: p.x + Math.cos(p.phi) * d, y: p.y + Math.sin(p.phi) * d };
  };
}

/** Многоъгълник между s1–s2 и отместванията d1–d2. */
function band(at: (s: number, d: number) => { x: number; y: number }, s1: number, s2: number, d1: number, d2: number) {
  const out: string[] = [];
  const m = 16;
  for (let i = 0; i <= m; i++) {
    const p = at(s1 + ((s2 - s1) * i) / m, d1);
    out.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  for (let i = m; i >= 0; i--) {
    const p = at(s1 + ((s2 - s1) * i) / m, d2);
    out.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  return out.join(' ');
}

/** Колеоптил (Дарвин, Бойсен-Йенсен, Вент): къде е сигналът за огъване към светлината. */
export default function ColeoptileLab() {
  const [exp, setExp] = useState<Treatment>('none');
  const [tips, setTips] = useState(3);
  const [after, setAfter] = useState(true);

  const e = EXPERIMENTS.find(x => x.id === exp)!;
  const went = exp === 'went';
  const finalAngle = went ? DEG_PER_TIP * tips : e.angle;
  const angle = after ? finalAngle : 0;
  const at = frame((angle * Math.PI) / 180);
  const tipCut = exp === 'cut' || went;
  const top = tipCut ? L - 22 : L;
  const light = !went;

  // Ауксинът (оранжеви точки): по сенчестата страна при огъване към светлината, по страната на блокчето при Вент
  const dots: { s: number; d: number }[] = [];
  if (exp !== 'cut' && !(went && tips === 0)) {
    const side = went ? -1 : finalAngle < 0 ? 1 : 0; // 1 – дясно (сянка), −1 – ляво, 0 – равномерно
    const stop = exp === 'mica-dark' ? L - 30 : L0 - 10;
    for (let s = top - 8; s > stop; s -= 14) {
      if (side === 0) {
        dots.push({ s, d: -HW / 2 }, { s, d: HW / 2 });
      } else {
        dots.push({ s, d: (side * HW) / 2 });
        if (Math.round(s) % 28 < 14) dots.push({ s: s - 7, d: (side * HW) / 2.4 });
      }
    }
    if (exp === 'mica-dark') for (let s = L - 6; s > L - 30; s -= 10) dots.push({ s, d: HW / 2 });
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 440 300" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <rect x={0} y={0} width={440} height={300} className={light ? 'fill-amber-50/60 dark:fill-gray-900/40' : 'fill-slate-200 dark:fill-slate-900'} />
        {light ? (
          <g>
            <circle cx={36} cy={110} r={18} className="fill-amber-300 stroke-amber-500" strokeWidth={2} />
            {[80, 110, 140].map(y => (
              <g key={y}>
                <line x1={62} y1={y} x2={120} y2={y} className="stroke-amber-500" strokeWidth={2} />
                <path d={`M120,${y} l-8,-4 l0,8 z`} className="fill-amber-500" />
              </g>
            ))}
            <text x={20} y={160} fontSize="13" className="fill-amber-700 dark:fill-amber-300">
              светлина
            </text>
          </g>
        ) : (
          <text x={20} y={30} fontSize="13" className="fill-slate-600 dark:fill-slate-300">
            на тъмно
          </text>
        )}

        {/* Почва */}
        <rect x={150} y={Y0} width={140} height={22} rx={4} className="fill-amber-800/70" />

        {/* Колеоптил */}
        <polygon points={band(at, 0, top, -HW, HW)} className="fill-lime-300 stroke-lime-700 dark:fill-lime-600" strokeWidth={1.5} />
        {!tipCut && (() => {
          const p = at(L, 0);
          return <circle cx={p.x} cy={p.y} r={HW} className="fill-lime-300 stroke-lime-700 dark:fill-lime-600" strokeWidth={1.5} />;
        })()}

        {/* Обработки */}
        {exp === 'cap' && <polygon points={band(at, L - 26, L + 10, -HW - 3, HW + 3)} className="fill-gray-800 dark:fill-gray-950" />}
        {exp === 'glass' && <polygon points={band(at, L - 26, L + 10, -HW - 3, HW + 3)} className="fill-sky-200/40 stroke-sky-500" strokeWidth={1.5} />}
        {exp === 'sleeve' && <polygon points={band(at, 0, L - 40, -HW - 3, HW + 3)} className="fill-gray-700/90 dark:fill-gray-950" />}
        {exp === 'gelatin' && <polygon points={band(at, L - 30, L - 24, -HW - 1, HW + 1)} className="fill-yellow-300 stroke-yellow-600" strokeWidth={1} />}
        {exp === 'mica-dark' && <polygon points={band(at, L - 32, L - 29, 0, HW + 8)} className="fill-slate-500" />}
        {exp === 'mica-lit' && <polygon points={band(at, L - 32, L - 29, -HW - 8, 0)} className="fill-slate-500" />}
        {went && (
          <>
            <polygon points={band(at, L - 22, L - 10, -HW - 2, 0)} className={tips > 0 ? 'fill-orange-200 stroke-orange-500' : 'fill-gray-100 stroke-gray-400'} strokeWidth={1.5} />
            <text x={at(L - 10, -HW).x - 8} y={at(L - 10, -HW).y - 8} fontSize="12" textAnchor="end" className="fill-orange-700 dark:fill-orange-300">
              агар
            </text>
          </>
        )}

        {dots.map((p, i) => {
          const q = at(p.s, p.d);
          return <circle key={i} cx={q.x} cy={q.y} r={2.4} className="fill-orange-500" />;
        })}

        {/* Ъгъл */}
        {after && finalAngle !== 0 && (
          <g>
            <line x1={at(L0, 0).x} y1={at(L0, 0).y} x2={at(L0, 0).x} y2={at(L0, 0).y - 125} className="stroke-gray-400" strokeDasharray="4 4" />
            <text x={340} y={60} fontSize="14" fontWeight={700} className="fill-rose-600 dark:fill-rose-400">
              α = {Math.abs(finalAngle)}°
            </text>
          </g>
        )}
        <text x={430} y={292} fontSize="12" textAnchor="end" className="fill-gray-600 dark:fill-gray-300">
          {after ? 'след около 2 h' : 'в началото'}
        </text>
        <circle cx={300} cy={22} r={4} className="fill-orange-500" />
        <text x={310} y={26} fontSize="12" className="fill-gray-600 dark:fill-gray-300">
          ауксин
        </text>
      </LabSvg>

      <Buttons>
        {EXPERIMENTS.map(x => (
          <DiagramButton key={x.id} active={exp === x.id} onClick={() => setExp(x.id)}>
            {x.label}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={!after} onClick={() => setAfter(false)}>
          в началото
        </DiagramButton>
        <DiagramButton active={after} onClick={() => setAfter(true)}>
          след 2 h
        </DiagramButton>
      </Buttons>
      {went && (
        <Sliders>
          <Slider label="върхове върху агара" value={tips} onChange={setTips} min={0} max={6} step={1} tone="amber" />
        </Sliders>
      )}
      <Readout
        items={[
          { label: 'опит', value: e.who, tone: 'violet' },
          { label: 'огъване', value: finalAngle === 0 ? 'няма' : `${Math.abs(finalAngle)}° ${finalAngle < 0 ? 'към светлината' : 'встрани от агара'}`, tone: 'rose' },
        ]}
      />
      <Note tone="emerald">
        {went
          ? tips === 0
            ? 'Чист агар: огъване няма. Самото блокче не действа – действа веществото от върховете.'
            : `Ауксинът слиза по страната под блокчето, тя расте по-бързо и колеоптилът се огъва на другата страна. Ъгълът расте пропорционално на ауксина: ${tips} ${tips === 1 ? 'връх' : 'върха'} → ${finalAngle}°.`
          : e.text}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Колеоптилът е защитната обвивка на първия лист при житните (Дарвин работи с канарско семе, Вент – с овес). При Вент
        върховете стоят върху агарово блокче, после блокчето се слага встрани върху отрязан колеоптил на тъмно. Ъгълът тук е условен –
        по 4° на връх; при истинските опити пропорционалността важи само при малко ауксин.
      </p>
    </div>
  );
}
