import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Solvent = 'water' | 'ethanol';
type Dye = 'yellow' | 'blue' | 'violet' | 'red';

// Rf на всяка боя в двата разтворителя (измислени, но правдоподобни стойности)
const RF: Record<Dye, Record<Solvent, number>> = {
  yellow: { water: 0.88, ethanol: 0.92 },
  blue: { water: 0.58, ethanol: 0.7 },
  violet: { water: 0.55, ethanol: 0.3 },
  red: { water: 0.3, ethanol: 0.55 },
};
const COLOR: Record<Dye, string> = { yellow: '#eab308', blue: '#2563eb', violet: '#7c3aed', red: '#e11d48' };
const DYE_NAME: Record<Dye, string> = { yellow: 'жълта', blue: 'синя', violet: 'виолетова', red: 'червена' };

const LANES: { name: string; dyes: Dye[] }[] = [
  { name: 'бележката', dyes: ['blue', 'yellow'] },
  { name: 'А', dyes: ['blue', 'red'] },
  { name: 'Б', dyes: ['blue', 'yellow'] },
  { name: 'В', dyes: ['violet', 'yellow'] },
];
const ANSWER = 'Б';

// Хартията: стартова линия на y = 200, фронтът стига до 8 cm над нея
const START_Y = 200;
const MAX_CM = 8;
const PX = 170 / MAX_CM;
const T_MAX = 10;
const laneX = (i: number) => 125 + i * 95;
/** Фронтът на разтворителя расте приблизително като корен от времето (капилярно покачване). */
const front = (t: number) => MAX_CM * Math.sqrt(t / T_MAX);
const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

/** Хартиена хроматография: коя химикалка е писала бележката? */
export default function ChromatographyLab() {
  const [solvent, setSolvent] = useState<Solvent>('water');
  const [t, setT] = useState(0);
  const [picked, setPicked] = useState<{ lane: number; dye: Dye } | null>(null);
  const [guess, setGuess] = useState<string | null>(null);

  const d = front(t);
  const spot = (dye: Dye) => RF[dye][solvent] * d;
  const switchSolvent = (s: Solvent) => {
    setSolvent(s);
    setT(0);
    setPicked(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 260" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Хартията, мократа част и разтворителят */}
        <rect x={75} y={14} width={390} height={216} className="fill-white stroke-gray-300 dark:fill-gray-100" strokeWidth="1.5" />
        <rect x={75} y={START_Y - d * PX} width={390} height={230 - START_Y + d * PX} className="fill-sky-200/50" />
        <rect x={60} y={214} width={420} height={22} rx="4" className={solvent === 'water' ? 'fill-sky-300/70' : 'fill-violet-300/70'} />
        {d > 0.05 && <line x1={75} x2={465} y1={START_Y - d * PX} y2={START_Y - d * PX} className="stroke-sky-500" strokeDasharray="5 4" strokeWidth="1.5" />}
        <line x1={75} x2={465} y1={START_Y} y2={START_Y} className="stroke-gray-500" strokeWidth="1" strokeDasharray="2 3" />

        {/* Линийка в сантиметри от стартовата линия */}
        <line x1={50} x2={50} y1={START_Y} y2={START_Y - MAX_CM * PX} className="stroke-gray-500 dark:stroke-gray-400" strokeWidth="1.5" />
        {Array.from({ length: MAX_CM + 1 }, (_, k) => (
          <g key={k}>
            <line x1={44} x2={56} y1={START_Y - k * PX} y2={START_Y - k * PX} className="stroke-gray-500 dark:stroke-gray-400" />
            <text x={38} y={START_Y - k * PX + 4} fontSize="11" textAnchor="end" fill="currentColor">
              {k}
            </text>
          </g>
        ))}
        <text x={20} y={START_Y - MAX_CM * PX - 6} fontSize="11" fill="currentColor">
          cm
        </text>

        {/* Петната */}
        {LANES.map((lane, i) =>
          lane.dyes.map(dye => {
            const s = spot(dye);
            const active = picked?.lane === i && picked.dye === dye;
            return (
              <ellipse
                key={dye}
                cx={laneX(i)}
                cy={START_Y - s * PX}
                rx={10 + 1.5 * Math.sqrt(s)}
                ry={5 + 2.5 * Math.sqrt(s)}
                fill={COLOR[dye]}
                fillOpacity={d > 0.05 ? 0.75 : 0.5}
                className={active ? 'stroke-gray-900' : 'stroke-transparent'}
                strokeWidth="2"
                style={{ cursor: 'pointer' }}
                onClick={() => setPicked({ lane: i, dye })}
              />
            );
          }),
        )}
        {LANES.map((lane, i) => (
          <text key={lane.name} x={laneX(i)} y={252} fontSize="13" fontWeight="600" textAnchor="middle" fill="currentColor">
            {lane.name}
          </text>
        ))}
      </LabSvg>

      <Buttons>
        <DiagramButton active={solvent === 'water'} onClick={() => switchSolvent('water')}>
          разтворител: вода
        </DiagramButton>
        <DiagramButton active={solvent === 'ethanol'} onClick={() => switchSolvent('ethanol')}>
          разтворител: спирт
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="t, min" value={t} onChange={setT} min={0} max={T_MAX} step={0.5} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'фронт:', value: `${fmt(d)} cm`, tone: 'blue' },
            ...(picked && d > 0.05
              ? [
                  { label: `${DYE_NAME[picked.dye]} боя (${LANES[picked.lane].name}):`, value: `${fmt(spot(picked.dye))} cm` },
                  { label: 'Rf =', value: `${fmt(spot(picked.dye))} : ${fmt(d)} = ${fmt(RF[picked.dye][solvent], 2)}`, tone: 'violet' as const },
                ]
              : [{ label: '', value: 'докосни петно, за да го измериш' }]),
          ]}
        />
      </div>

      <p className="mt-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Коя химикалка е писала бележката?</p>
      <Buttons>
        {['А', 'Б', 'В'].map(g => (
          <DiagramButton key={g} active={guess === g} onClick={() => setGuess(g)}>
            {g}
          </DiagramButton>
        ))}
      </Buttons>
      {guess && (
        <Note tone={guess === ANSWER ? 'emerald' : 'rose'}>
          {guess === ANSWER
            ? '✓ Вярно! Мастилото на Б има същите бои като бележката – и в двата разтворителя.'
            : guess === 'В'
              ? solvent === 'water'
                ? '✗ Във вода В и Б наистина изглеждат почти еднакво. Пусни хроматограмата и в спирт.'
                : '✗ В спирт се вижда, че долното петно на В е виолетово и е много по-ниско – в бележката няма такова.'
              : '✗ Сравни височината и цвета на петната с тези на бележката.'}
        </Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Плъзни времето: разтворителят се изкачва по хартията и носи боите с различна скорост. Всяка боя изминава една и съща част от пътя
        на разтворителя – това е <strong>Rf</strong>. То зависи от разтворителя, затова две различни мастила могат да изглеждат еднакво в един
        разтворител и да се различат в друг.
      </p>
    </div>
  );
}
