import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Mode = 'lytic' | 'lysogenic';

type Step = { title: string; text: string; time: string };

const LYTIC: Step[] = [
  { title: '1. Прикрепване', text: 'Опашните нишки на фага разпознават рецептори по повърхността на бактерията и се закрепват.', time: '0 min' },
  { title: '2. Впръскване', text: 'Опашката се свива като спринцовка и вкарва ДНК на фага в клетката. Белтъчната обвивка остава отвън.', time: '≈ 1 min' },
  { title: '3. Синтез', text: 'Гените на фага поемат клетката: ДНК на бактерията се разгражда, рибозомите ѝ правят белтъци на фага, а ДНК на фага се копира много пъти.', time: '≈ 2–12 min' },
  { title: '4. Сглобяване', text: 'Глави, опашки и ДНК се сглобяват в нови фаги. Отвън още не се вижда нищо – това е „скритият“ (еклипс) период.', time: '≈ 12–22 min' },
  { title: '5. Лизис', text: 'Ензимът лизозим на фага разрушава клетъчната стена, бактерията се пръсва и освобождава около 100–200 нови фага.', time: '≈ 25 min' },
];

const LYSOGENIC: Step[] = [
  LYTIC[0],
  LYTIC[1],
  { title: '3. Вграждане', text: 'ДНК на фага се затваря в кръг и се вгражда в хромозомата на бактерията. Вграденият фаг се нарича профаг – гените му мълчат.', time: '' },
  { title: '4. Делене', text: 'Бактерията живее и се дели нормално. При всяко делене профагът се копира заедно с хромозомата – всички потомци го носят.', time: 'много поколения' },
  { title: '5. Индукция', text: 'Ако ДНК на бактерията се повреди (например от ултравиолетова светлина), профагът се изрязва и започва литичен цикъл – стъпки 3–5 отляво.', time: '' },
];

const CX = 320;
const CY = 140;

/** Фаг тип Т4: глава (шестоъгълник), опашка и нишки. Върхът на опашката е в (x, y), главата е нагоре при rot = 0. */
function Phage({ x, y, rot = 0, s = 1, empty = false, opacity = 1 }: { x: number; y: number; rot?: number; s?: number; empty?: boolean; opacity?: number }) {
  const hex = [0, 60, 120, 180, 240, 300].map(a => {
    const r = (a * Math.PI) / 180;
    return `${(Math.sin(r) * 10).toFixed(1)},${(-34 - Math.cos(r) * 10).toFixed(1)}`;
  });
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
      <polygon points={hex.join(' ')} className={empty ? 'fill-white dark:fill-gray-800 stroke-violet-500' : 'fill-violet-200 dark:fill-violet-900 stroke-violet-600'} strokeWidth={1.5} />
      {!empty && <path d="M-4,-36 q4,-4 8,0 q-4,4 -8,0" fill="none" stroke="#e11d48" strokeWidth={1.5} />}
      <rect x={-2.5} y={-24} width={5} height={20} className="fill-violet-400 dark:fill-violet-600" />
      <path d="M-2,-4 L-10,4 M2,-4 L10,4 M-1,-4 L-5,6 M1,-4 L5,6" className="stroke-violet-600 dark:stroke-violet-400" strokeWidth={1.3} />
    </g>
  );
}

/** Бактерия: обвивка, хромозома (синя) и по желание – вграден профаг (червен) или свободна ДНК на фага. */
function Cell({ x, y, w, h, prophage, broken = false }: { x: number; y: number; w: number; h: number; prophage: boolean; broken?: boolean }) {
  const rx = w * 0.3;
  const ry = h * 0.28;
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx={h / 2}
        className="fill-amber-50 dark:fill-amber-900/30 stroke-amber-600"
        strokeWidth={3}
        strokeDasharray={broken ? '14 10' : undefined}
      />
      {!broken && (
        <>
          <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="none" className="stroke-blue-500" strokeWidth={3} />
          {prophage && <path d={`M${x + rx * Math.cos(-0.5)},${y + ry * Math.sin(-0.5)} A${rx},${ry} 0 0 1 ${x + rx * Math.cos(0.5)},${y + ry * Math.sin(0.5)}`} fill="none" stroke="#e11d48" strokeWidth={5} />}
        </>
      )}
    </g>
  );
}

/** Литичен и лизогенен цикъл на бактериофаг – стъпка по стъпка, с индукция от UV светлина. */
export default function PhageCycleLab() {
  const [mode, setMode] = useState<Mode>('lytic');
  const [step, setStep] = useState(0);
  /** След индукция лизогенният цикъл продължава като литичен от стъпка 3. */
  const [induced, setInduced] = useState(false);

  const steps = mode === 'lytic' || induced ? LYTIC : LYSOGENIC;
  const cur = steps[step];
  const lyticNow = mode === 'lytic' || induced;

  const choose = (m: Mode) => {
    setMode(m);
    setStep(0);
    setInduced(false);
  };
  const next = () => setStep(s => Math.min(4, s + 1));
  const prev = () => {
    if (induced && step <= 2) {
      setInduced(false);
      setStep(4);
      return;
    }
    setStep(s => Math.max(0, s - 1));
  };
  const uv = () => {
    setInduced(true);
    setStep(2);
  };

  // Колко нови фага се виждат вътре в клетката
  const inside = lyticNow && step === 3 ? 12 : 0;
  const W = 300;
  const H = 130;
  const top = CY - H / 2;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 290" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={20} y={22} fontSize="13" fontWeight="700" fill="currentColor">
          {lyticNow ? 'Литичен цикъл' : 'Лизогенен цикъл'}
          {induced ? ' (след индукция)' : ''}: {cur.title}
        </text>

        {!lyticNow && step === 3 ? (
          <>
            <Cell x={CX - 150} y={CY + 5} w={240} h={110} prophage />
            <Cell x={CX + 150} y={CY + 5} w={240} h={110} prophage />
            <text x={CX} y={CY + 90} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              и двете дъщерни клетки носят профага
            </text>
          </>
        ) : (
          <Cell x={CX} y={CY} w={W} h={H} prophage={!lyticNow && step >= 2} broken={lyticNow && step === 4} />
        )}

        {/* Фагът отвън – прикрепен към горната страна */}
        {step <= 1 && <Phage x={CX + 40} y={top - 1} empty={step === 1} />}
        {step >= 2 && step <= 3 && !(mode === 'lysogenic' && !induced && step === 3) && <Phage x={CX + 40} y={top - 1} empty opacity={0.5} />}

        {/* ДНК на фага, влизаща в клетката */}
        {step === 1 && <path d={`M${CX + 40},${top + 3} q12,18 -6,30 q-18,12 4,24`} fill="none" stroke="#e11d48" strokeWidth={2.5} />}

        {/* Синтез: много копия на ДНК на фага и части; хромозомата е разградена (пунктир) */}
        {lyticNow && step === 2 && (
          <g>
            {[-110, -70, -30, 10, 50, 90].map((dx, k) => (
              <path key={dx} d={`M${CX + dx},${CY + (k % 2 ? 22 : -22)} q8,-8 16,0 q8,8 16,0`} fill="none" stroke="#e11d48" strokeWidth={2.5} />
            ))}
            {[-90, -40, 30, 80].map(dx => (
              <polygon key={dx} points={`${CX + dx},${CY + 40} ${CX + dx + 8},${CY + 35} ${CX + dx + 16},${CY + 40} ${CX + dx + 16},${CY + 50} ${CX + dx + 8},${CY + 55} ${CX + dx},${CY + 50}`} className="fill-violet-200 dark:fill-violet-900 stroke-violet-500" />
            ))}
          </g>
        )}
        {/* Сглобените фаги вътре */}
        {Array.from({ length: inside }, (_, k) => (
          <Phage key={k} x={CX - 115 + (k % 6) * 46} y={CY - 8 + Math.floor(k / 6) * 50} s={0.6} />
        ))}
        {/* Лизис: фагите излизат навън */}
        {lyticNow &&
          step === 4 &&
          Array.from({ length: 22 }, (_, k) => {
            const a = (k / 22) * 2 * Math.PI;
            const r = 120 + (k % 3) * 18;
            return <Phage key={k} x={CX + Math.cos(a) * r * 1.35} y={CY + Math.sin(a) * r * 0.62 + 15} rot={(a * 180) / Math.PI + 90} s={0.55} />;
          })}

        <text x={20} y={278} fontSize="11.5" className="fill-gray-500 dark:fill-gray-400">
          синьо – хромозома на бактерията · червено – ДНК на фага{!lyticNow && step >= 2 ? ' (профаг)' : ''}
        </text>
      </LabSvg>

      <Buttons>
        <DiagramButton active={mode === 'lytic'} onClick={() => choose('lytic')}>
          литичен цикъл
        </DiagramButton>
        <DiagramButton active={mode === 'lysogenic'} onClick={() => choose('lysogenic')}>
          лизогенен цикъл
        </DiagramButton>
      </Buttons>
      <Buttons>
        <DiagramButton onClick={prev}>◀ назад</DiagramButton>
        <DiagramButton onClick={next}>напред ▶</DiagramButton>
        {mode === 'lysogenic' && !induced && step >= 3 && <DiagramButton onClick={uv}>☀️ UV светлина</DiagramButton>}
      </Buttons>
      <Readout
        items={[
          { label: 'стъпка', value: `${step + 1} от 5`, tone: 'violet' },
          ...(cur.time ? [{ label: 'време', value: cur.time, tone: 'blue' as const }] : []),
        ]}
      />
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 text-center max-w-2xl mx-auto">{cur.text}</p>
      <Note tone="violet">
        {lyticNow
          ? step === 4
            ? 'Около 25 минути след заразяването: от една бактерия – около 100 фага, всеки готов да зарази нова клетка.'
            : 'Литичният цикъл завършва със смъртта на клетката.'
          : step === 4
            ? 'Натисни „☀️ UV светлина“, за да предизвикаш индукция.'
            : 'При лизогенията вирусът „спи“ в ДНК на клетката и се унаследява от потомците ѝ.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Времената са за фаг Т4 в <em>E. coli</em> при 37 °C. Т4 има само литичен цикъл; лизогенен цикъл имат „умерените“ фаги като
        фаг ламбда. Мащабът е условен: истинската бактерия е около 2 µm, а фагът – около 0,2 µm.
      </p>
    </div>
  );
}
