import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

const W = 640;
const H = 300;
const TOKENS = ['Котката', 'спи', 'на', 'дивана'];
const IDS = [4127, 913, 27, 6650];
const COLS = [110, 250, 390, 530];
const CELLS = 6;
const BOX = { w: 44, top: 84, cell: 20 };

type Step = { name: string; table: string; text: string };
const STEPS: Step[] = [
  { name: 'токени', table: '4 номера', text: 'Текстът е нарязан на токени и всеки е заменен с номера си в речника. (Тук за простота една дума е един токен, а номерата са измислени.)' },
  { name: 'вграждане', table: '4 × d', text: 'Всеки номер избира един ред от таблицата с вгражданията. Вече имаме по един вектор с d числа за всяка позиция – това е потокът.' },
  { name: '+ позиция', table: '4 × d', text: 'Към всеки вектор се прибавя кодът на позицията му. Сега „Котката“ на първо място и „Котката“ на трето място биха били различни вектори.' },
  { name: 'внимание', table: '4 × d', text: 'Единственото място, където позициите си говорят. Всяка събира сведения от себе си и от тези преди нея (дъгите) и получава вектор-добавка.' },
  { name: '+ към потока', table: '4 × d', text: 'Пряка връзка: добавката от вниманието се прибавя към потока, не го замества. Старото съдържание остава.' },
  { name: 'мрежа с прав ход', table: 'd → 4d → d', text: 'Малка мрежа с един скрит слой обработва всяка позиция поотделно, с едни и същи тегла. Тук позициите не се виждат една друга.' },
  { name: '+ към потока', table: '4 × d', text: 'Втората пряка връзка: и добавката от малката мрежа се прибавя към потока. С това един блок е свършил; следващият прави същото със свои тегла.' },
  { name: 'изход', table: 'd → V оценки', text: 'След последния блок векторът на всяка позиция се превръща в по една оценка за всеки токен от речника. Софтмакс ги прави вероятности за следващия токен.' },
];

/** Измислени, но винаги едни и същи „стойности“ на клетките – само за да се вижда кога потокът се променя. */
const cellValue = (stage: number, col: number, i: number) => Math.sin(12.9898 * (col + 1) + 78.233 * (i + 1) + 37.719 * stage);

function Vector({ x, y, stage, col, tone }: { x: number; y: number; stage: number; col: number; tone: 'stream' | 'update' }) {
  return (
    <g>
      {Array.from({ length: CELLS }, (_, i) => {
        const v = cellValue(stage, col, i);
        return <rect key={i} x={x - BOX.w / 2} y={y + i * BOX.cell} width={BOX.w} height={BOX.cell} opacity={0.25 + 0.75 * Math.abs(v)} className={tone === 'update' ? (v >= 0 ? 'fill-violet-500' : 'fill-amber-400') : v >= 0 ? 'fill-rose-500' : 'fill-blue-500'} />;
      })}
      <rect x={x - BOX.w / 2} y={y} width={BOX.w} height={CELLS * BOX.cell} fill="none" className={tone === 'update' ? 'stroke-violet-600 dark:stroke-violet-300' : 'stroke-gray-600 dark:stroke-gray-300'} strokeWidth="1.5" />
    </g>
  );
}

/** Потокът от вектори през един блок на трансформъра, стъпка по стъпка. */
export default function TransformerBlockLab() {
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  // Състояние на потока: 0 – вграждане, 1 – с позиция, 2 – след вниманието, 3 – след малката мрежа
  const stage = step <= 1 ? 0 : step <= 3 ? 1 : step <= 5 ? 2 : 3;
  const update = step === 3 || step === 5;
  const bottom = BOX.top + CELLS * BOX.cell;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {TOKENS.map((t, c) => (
          <g key={c}>
            <text x={COLS[c]} y={24} fontSize="15" fontWeight="bold" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100">
              {t}
            </text>
            <text x={COLS[c]} y={44} fontSize="12" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
              позиция {c + 1}
            </text>
            {step === 0 ? (
              <>
                <rect x={COLS[c] - 34} y={BOX.top + 40} width={68} height={34} rx={6} className="fill-blue-50 stroke-blue-500 dark:fill-blue-950/60 dark:stroke-blue-400" strokeWidth="1.5" />
                <text x={COLS[c]} y={BOX.top + 63} fontSize="15" fontFamily="monospace" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100">
                  {IDS[c]}
                </text>
              </>
            ) : (
              <Vector x={COLS[c] - (update ? 26 : 0)} y={BOX.top} stage={stage} col={c} tone="stream" />
            )}
            {update && (
              <>
                <text x={COLS[c]} y={BOX.top + 66} fontSize="16" fontWeight="bold" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
                  +
                </text>
                <Vector x={COLS[c] + 26} y={BOX.top} stage={10 + step} col={c} tone="update" />
              </>
            )}
            {step === 2 && (
              <text x={COLS[c]} y={bottom + 20} fontSize="12" textAnchor="middle" className="fill-fuchsia-700 dark:fill-fuchsia-300">
                + код на място {c + 1}
              </text>
            )}
            {step === 5 && (
              <text x={COLS[c]} y={bottom + 20} fontSize="12" textAnchor="middle" className="fill-violet-700 dark:fill-violet-300">
                собствена сметка
              </text>
            )}
          </g>
        ))}
        {step === 3 &&
          COLS.flatMap((to, r) =>
            COLS.slice(0, r).map((from, c) => (
              <path key={`${r}-${c}`} d={`M ${from - 26} ${BOX.top - 4} Q ${(from + to) / 2} ${BOX.top - 34 - 9 * (r - c)} ${to + 26} ${BOX.top - 4}`} fill="none" className="stroke-violet-500 dark:stroke-violet-300" strokeWidth="1.6" opacity="0.8" />
            ))
          )}
        {step === 3 && (
          <text x={W / 2} y={bottom + 20} fontSize="12" textAnchor="middle" className="fill-violet-700 dark:fill-violet-300">
            всяка позиция гледа само наляво – към себе си и към предишните
          </text>
        )}
        {step === 7 && (
          <>
            <line x1={COLS[3]} y1={bottom + 4} x2={COLS[3]} y2={bottom + 22} className="stroke-amber-500" strokeWidth="2.5" />
            <text x={COLS[3]} y={bottom + 38} fontSize="12" textAnchor="end" className="fill-amber-700 dark:fill-amber-300">
              оценки за всички V токена → софтмакс → следващият токен
            </text>
          </>
        )}
        <text x={W / 2} y={H - 8} fontSize="12" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          цветовете са измислени стойности – важното е кога и къде се променят
        </text>
      </LabSvg>
      <Buttons>
        <DiagramButton onClick={() => setStep(Math.max(0, step - 1))}>← назад</DiagramButton>
        <DiagramButton onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}>напред →</DiagramButton>
        <DiagramButton onClick={() => setStep(0)}>отначало</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'стъпка', value: `${step + 1} от ${STEPS.length}` },
            { label: 'действие', value: s.name, tone: 'violet' },
            { label: 'размер', value: s.table, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone="gray">{s.text}</Note>
    </div>
  );
}
