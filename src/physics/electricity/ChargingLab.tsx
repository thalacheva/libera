import { useState } from 'react';
import { Buttons, DiagramButton, Label, Note, ZoomingSvg } from '~/geometry/diagram';

type Mode = 'contact' | 'induction';

/**
 * Едно състояние на опита: къде е пръчката, заземен ли е електроскопът и излишните заряди по топчето и листчетата
 * (за отрицателна пръчка; при положителна знаците се обръщат). Текстовете са [отрицателна, положителна] пръчка.
 */
type Step = { text: [string, string]; rod: 'away' | 'near' | 'touch'; ground: boolean; knob: number; leaves: number; flow?: [string, string] };

const NEUTRAL = 'Електроскопът е неутрален: положителните и отрицателните заряди в него са по равно. Листчетата висят.';

const STEPS: Record<Mode, Step[]> = {
  contact: [
    { text: [NEUTRAL, NEUTRAL], rod: 'away', ground: false, knob: 0, leaves: 0 },
    {
      text: [
        'Допираме заредената пръчка до топчето. Част от излишните ѝ електрони преминават в електроскопа и се разпределят по него.',
        'Допираме заредената пръчка до топчето. Тя привлича електрони и част от тях преминават от електроскопа в нея – в електроскопа остава недостиг на електрони.',
      ],
      rod: 'touch',
      ground: false,
      knob: -1,
      leaves: -2,
      flow: ['e⁻ от пръчката', 'e⁻ към пръчката'],
    },
    {
      text: [
        'Махаме пръчката. Електроскопът остава зареден отрицателно – със същия знак като пръчката, а еднаквите заряди в листчетата ги разтварят.',
        'Махаме пръчката. Електроскопът остава зареден положително – със същия знак като пръчката, а еднаквите заряди в листчетата ги разтварят.',
      ],
      rod: 'away',
      ground: false,
      knob: -1,
      leaves: -2,
    },
  ],
  induction: [
    { text: [NEUTRAL, NEUTRAL], rod: 'away', ground: false, knob: 0, leaves: 0 },
    {
      text: [
        'Приближаваме пръчката, без да докосваме. Тя отблъсква електроните надолу към листчетата: горе остава положителен заряд, долу – отрицателен. Листчетата се разтварят, макар общият заряд да е нула.',
        'Приближаваме пръчката, без да докосваме. Тя привлича електроните нагоре към топчето: горе става отрицателен заряд, долу – положителен. Листчетата се разтварят, макар общият заряд да е нула.',
      ],
      rod: 'near',
      ground: false,
      knob: 3,
      leaves: -3,
    },
    {
      text: [
        'Докосваме топчето с пръст (заземяваме). Отблъснатите електрони избягват през тялото ни към земята и листчетата падат.',
        'Докосваме топчето с пръст (заземяваме). Привлечени от пръчката, електрони идват от земята през тялото ни, неутрализират листчетата и те падат.',
      ],
      rod: 'near',
      ground: true,
      knob: 3,
      leaves: 0,
      flow: ['e⁻ към земята', 'e⁻ от земята'],
    },
    {
      text: [
        'Махаме пръста, докато пръчката още е близо. Електроните вече нямат откъде да се върнат.',
        'Махаме пръста, докато пръчката още е близо. Дошлите електрони вече нямат накъде да избягат.',
      ],
      rod: 'near',
      ground: false,
      knob: 3,
      leaves: 0,
    },
    {
      text: [
        'Махаме пръчката. Излишният положителен заряд се разпределя по целия електроскоп и листчетата пак се разтварят – зарядът е с обратен знак на пръчката.',
        'Махаме пръчката. Излишният отрицателен заряд се разпределя по целия електроскоп и листчетата пак се разтварят – зарядът е с обратен знак на пръчката.',
      ],
      rod: 'away',
      ground: false,
      knob: 1,
      leaves: 2,
    },
  ],
};

const STEM_X = 240;
const KNOB = { x: STEM_X, y: 92 };
const PIVOT = { x: STEM_X, y: 196 };
const LEAF = 58;

/** Зареждане на електроскоп чрез допир и чрез индукция – стъпка по стъпка. */
export default function ChargingLab() {
  const [mode, setMode] = useState<Mode>('induction');
  const [sign, setSign] = useState<1 | -1>(-1);
  const [i, setI] = useState(0);
  const steps = STEPS[mode];
  const s = steps[i];
  // Знаците в STEPS са за отрицателна пръчка
  const knob = s.knob * -sign;
  const leaves = s.leaves * -sign;
  const angle = Math.min(48, Math.abs(leaves) * 15);

  const choose = (m: Mode) => {
    setMode(m);
    setI(0);
  };

  const symbols = (n: number, at: (k: number) => { x: number; y: number }) =>
    Array.from({ length: Math.abs(n) }, (_, k) => {
      const p = at(k);
      return (
        <text key={k} x={p.x} y={p.y} fontSize={14} fontWeight={700} textAnchor="middle" dominantBaseline="central" className={n > 0 ? 'fill-rose-600 dark:fill-rose-400' : 'fill-blue-600 dark:fill-blue-400'}>
          {n > 0 ? '+' : '−'}
        </text>
      );
    });

  const leafEnd = (side: number) => ({
    x: PIVOT.x + side * LEAF * Math.sin((angle * Math.PI) / 180),
    y: PIVOT.y + LEAF * Math.cos((angle * Math.PI) / 180),
  });

  // Пръчката – наклонена над топчето; при допир върхът ѝ е на топчето
  const tip = s.rod === 'touch' ? { x: KNOB.x + 12, y: KNOB.y - 12 } : s.rod === 'near' ? { x: KNOB.x + 30, y: KNOB.y - 32 } : null;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={mode === 'contact'} onClick={() => choose('contact')}>
          чрез допир
        </DiagramButton>
        <DiagramButton active={mode === 'induction'} onClick={() => choose('induction')}>
          чрез индукция
        </DiagramButton>
        <DiagramButton active={sign === -1} onClick={() => setSign(-1)}>
          ебонитова пръчка (−)
        </DiagramButton>
        <DiagramButton active={sign === 1} onClick={() => setSign(1)}>
          стъклена пръчка (+)
        </DiagramButton>
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 290">
        {/* Стъкленият съд */}
        <rect x={STEM_X - 90} y={150} width={180} height={120} rx={14} className="fill-sky-50/60 stroke-gray-400 dark:fill-sky-950/30" strokeWidth="2" />
        <line x1={STEM_X} y1={KNOB.y} x2={STEM_X} y2={PIVOT.y} className="stroke-gray-500" strokeWidth="5" />
        <circle cx={KNOB.x} cy={KNOB.y} r={20} className="fill-gray-300 stroke-gray-500 dark:fill-gray-600" strokeWidth="2" />
        {symbols(knob, k => ({ x: KNOB.x + ((k % 3) - 1) * 11, y: KNOB.y + (k < 3 ? -4 : 8) }))}
        {[-1, 1].map(side => {
          const e = leafEnd(side);
          return (
            <g key={side}>
              <line x1={PIVOT.x} y1={PIVOT.y} x2={e.x} y2={e.y} className="stroke-amber-500" strokeWidth="5" strokeLinecap="round" />
              {symbols(side < 0 ? Math.trunc(leaves / 2) : leaves - Math.trunc(leaves / 2), k => ({
                x: PIVOT.x + side * (16 + k * 14) * Math.sin((angle * Math.PI) / 180) + side * 12,
                y: PIVOT.y + (16 + k * 14) * Math.cos((angle * Math.PI) / 180),
              }))}
            </g>
          );
        })}
        <Label p={{ x: STEM_X + 100, y: 260 }} size={11} anchor="start">
          {`ъгъл ${angle}°`}
        </Label>

        {/* Пръчката */}
        {tip && (
          <g>
            <line x1={tip.x} y1={tip.y} x2={tip.x + 110} y2={tip.y - 45} className={sign < 0 ? 'stroke-gray-800 dark:stroke-gray-300' : 'stroke-sky-300'} strokeWidth="12" strokeLinecap="round" />
            {Array.from({ length: 5 }, (_, k) => (
              <text
                key={k}
                x={tip.x + 18 + k * 20}
                y={tip.y - 7 - k * 8.2 - 12}
                fontSize={13}
                fontWeight={700}
                textAnchor="middle"
                dominantBaseline="central"
                className={sign > 0 ? 'fill-rose-600 dark:fill-rose-400' : 'fill-blue-600 dark:fill-blue-400'}
              >
                {sign > 0 ? '+' : '−'}
              </text>
            ))}
          </g>
        )}

        {/* Заземяване през пръста */}
        {s.ground && (
          <g>
            <line x1={KNOB.x - 20} y1={KNOB.y} x2={110} y2={KNOB.y} className="stroke-gray-500" strokeWidth="2" />
            <line x1={110} y1={KNOB.y} x2={110} y2={262} className="stroke-gray-500" strokeWidth="2" />
            {[0, 1, 2].map(k => (
              <line key={k} x1={110 - 16 + k * 5} y1={262 + k * 6} x2={110 + 16 - k * 5} y2={262 + k * 6} className="stroke-gray-500" strokeWidth="2" />
            ))}
            <text x={KNOB.x - 34} y={KNOB.y - 2} fontSize={22} textAnchor="middle" dominantBaseline="central">
              👉
            </text>
            <Label p={{ x: 104, y: 170 }} size={11} anchor="end">
              земя
            </Label>
          </g>
        )}
        {s.flow && (
          <Label p={{ x: s.ground ? 72 : STEM_X + 100, y: s.ground ? 140 : 52 }} size={12} tone="blue" anchor={s.ground ? 'middle' : 'start'}>
            {s.flow[sign < 0 ? 0 : 1]}
          </Label>
        )}
        <Label p={{ x: 20, y: 20 }} size={12} anchor="start">
          {`стъпка ${i + 1} от ${steps.length}`}
        </Label>
      </ZoomingSvg>

      <div className="flex flex-wrap justify-center gap-2 mt-3">
        <button
          onClick={() => setI(Math.max(0, i - 1))}
          disabled={i === 0}
          className="px-3 py-1.5 rounded-lg border text-sm border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-200 disabled:opacity-50"
        >
          ← Назад
        </button>
        <button
          onClick={() => setI(Math.min(steps.length - 1, i + 1))}
          disabled={i === steps.length - 1}
          className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          Следваща стъпка →
        </button>
      </div>
      <p className="mt-3 text-center text-sm sm:text-base text-gray-700 dark:text-gray-200">{s.text[sign < 0 ? 0 : 1]}</p>
      <Note tone="gray">
        {i === steps.length - 1
          ? mode === 'contact'
            ? 'При допир електроскопът получава заряд със същия знак като пръчката.'
            : 'При индукция електроскопът получава заряд с обратен знак – без пръчката да го докосне.'
          : 'Натисни „Следваща стъпка“.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Показани са само излишните заряди. В металите се движат електроните – положителните ядра остават на място. Ъгълът между
        листчетата расте със заряда в тях.
      </p>
    </div>
  );
}
