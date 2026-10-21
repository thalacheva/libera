import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Mutation = 'none' | 'I' | 'O';

const MUTATIONS: { id: Mutation; name: string }[] = [
  { id: 'none', name: 'див тип' },
  { id: 'I', name: 'мутантен репресор (lacI⁻)' },
  { id: 'O', name: 'мутантен оператор (Oᶜ)' },
];

// Участъците от ДНК (x от–до)
const SEG = {
  I: [24, 104],
  CAP: [168, 200],
  P: [200, 246],
  O: [246, 284],
  Z: [284, 424],
  Y: [424, 520],
  A: [520, 610],
} as const;
const DY = 150;

/** Лак оперонът на E. coli: репресор, оператор, CAP и колко се транскрибират гените lacZ, lacY, lacA. */
export default function LacOperonLab() {
  const [lactose, setLactose] = useState(false);
  const [glucose, setGlucose] = useState(true);
  const [mut, setMut] = useState<Mutation>('none');

  const repressorActive = !lactose && mut !== 'I';
  const repressorOnO = repressorActive && mut !== 'O';
  const capBound = !glucose;
  // Условни единици: напълно включен оперон = 100
  const level = repressorOnO ? 1 : capBound ? 100 : 5;
  const transcribing = !repressorOnO;

  let note: string;
  if (mut === 'I' && !lactose)
    note = 'Репресорът не може да се свърже с оператора и генът се транскрибира и без лактоза – „постоянно включен“ (конститутивен) мутант. Клетката хаби енергия за ненужни ензими.';
  else if (mut === 'O' && !lactose)
    note = 'Операторът е променен и активният репресор не го разпознава – генът е включен и без лактоза. Тази мутация действа само върху гените до нея (цис).';
  else if (repressorOnO) note = 'Няма лактоза: репресорът седи на оператора и пречи на РНК полимеразата. Ензимите за лактозата не се правят – не са нужни.';
  else if (!capBound)
    note = 'Има лактоза: алолактозата отделя репресора и пътят е свободен. Но има и глюкоза – цАМФ е малко, CAP не помага и полимеразата рядко започва. Бактерията първо изяжда глюкозата.';
  else note = 'Лактоза има, глюкоза няма: репресорът е свален, а CAP с цАМФ привлича РНК полимеразата към промотора. Оперонът работи с пълна сила.';

  const seg = (k: keyof typeof SEG, label: string, cls: string, italic = true) => {
    const [a, b] = SEG[k];
    const hatched = k === 'O' && mut === 'O';
    return (
      <g>
        <rect x={a} y={DY - 11} width={b - a} height={22} className={cls} strokeWidth={hatched ? 2 : 1} strokeDasharray={hatched ? '4 3' : undefined} />
        <text x={(a + b) / 2} y={DY + 4} fontSize="11" fontStyle={italic ? 'italic' : 'normal'} fontWeight="600" textAnchor="middle" fill="currentColor">
          {label}
        </text>
      </g>
    );
  };

  const oMid = (SEG.O[0] + SEG.O[1]) / 2;
  const capMid = (SEG.CAP[0] + SEG.CAP[1]) / 2;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 76 640 172" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* ДНК */}
        <line x1={14} x2={626} y1={DY} y2={DY} className="stroke-gray-400" strokeWidth={3} />
        {seg('I', mut === 'I' ? 'lacI⁻' : 'lacI', 'fill-slate-200 stroke-slate-500 dark:fill-slate-500/30')}
        {seg('CAP', 'CAP', 'fill-teal-100 stroke-teal-500 dark:fill-teal-500/20', false)}
        {seg('P', 'P', 'fill-gray-200 stroke-gray-500 dark:fill-gray-500/30', false)}
        {seg('O', mut === 'O' ? 'Oᶜ' : 'O', 'fill-rose-100 stroke-rose-500 dark:fill-rose-500/20', false)}
        {seg('Z', 'lacZ', 'fill-amber-100 stroke-amber-500 dark:fill-amber-500/20')}
        {seg('Y', 'lacY', 'fill-amber-100 stroke-amber-500 dark:fill-amber-500/20')}
        {seg('A', 'lacA', 'fill-amber-100 stroke-amber-500 dark:fill-amber-500/20')}
        <g fontSize="10" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          <text x={64} y={DY + 28}>
            ген на репресора
          </text>
          <text x={210} y={DY + 54}>
            промотор
          </text>
          <text x={272} y={DY + 54}>
            оператор
          </text>
          <text x={447} y={DY + 28}>
            структурни гени
          </text>
        </g>

        {/* Репресорът */}
        {repressorOnO ? (
          <g>
            <path d={`M${oMid - 22} ${DY - 12} q0 -26 22 -26 q22 0 22 26 z`} className="fill-rose-400 stroke-rose-700" />
            <text x={oMid} y={DY - 44} fontSize="10.5" textAnchor="middle" className="fill-rose-700 dark:fill-rose-300">
              репресор
            </text>
          </g>
        ) : (
          <g>
            <path d="M42 126 q0 -26 22 -26 q22 0 22 26 z" className="fill-rose-300 stroke-rose-600" opacity={0.8} />
            {lactose && mut !== 'I' && <circle cx={64} cy={114} r={6} className="fill-sky-500 stroke-sky-700" />}
            {mut === 'I' && <path d="M50 126 l6 -8 l6 8 l6 -8 l6 8" className="stroke-rose-800" fill="none" strokeWidth={1.5} />}
            <text x={64} y={92} fontSize="10" textAnchor="middle" className="fill-rose-700 dark:fill-rose-300">
              {mut === 'I' ? 'не се свързва' : lactose ? 'с алолактоза – неактивен' : 'не разпознава Oᶜ'}
            </text>
          </g>
        )}

        {/* CAP с цАМФ */}
        {capBound ? (
          <g>
            <circle cx={capMid} cy={DY - 24} r={13} className="fill-teal-400 stroke-teal-700" />
            <circle cx={capMid + 11} cy={DY - 36} r={5} className="fill-yellow-300 stroke-yellow-600" />
            <text x={capMid - 18} y={DY - 44} fontSize="10" textAnchor="end" className="fill-teal-700 dark:fill-teal-300">
              CAP–цАМФ
            </text>
          </g>
        ) : (
          <g>
            <circle cx={30} cy={232} r={11} className="fill-teal-200 stroke-teal-500" opacity={0.8} />
            <text x={48} y={236} fontSize="10" className="fill-teal-700 dark:fill-teal-300">
              CAP без цАМФ (има глюкоза)
            </text>
          </g>
        )}

        {/* РНК полимераза – под ДНК: на промотора (спряна) или в гените (транскрибира) */}
        <g transform={`translate(${transcribing ? 340 : 223} ${DY + 24})`}>
          <ellipse rx={44} ry={13} className="fill-violet-300/80 stroke-violet-700 dark:fill-violet-500/50" />
          <text y={4} fontSize="9.5" textAnchor="middle" fontWeight="600" fill="currentColor">
            РНК полимераза
          </text>
        </g>
        {transcribing && <path d={`M${SEG.P[1]} ${DY + 24} h40`} className="stroke-violet-500" strokeDasharray="3 3" />}

        {/* иРНК над структурните гени */}
        {transcribing && (
          <g>
            <path
              d={`M${SEG.Z[0]} ${DY - 26} C ${SEG.Z[0] + 80} ${DY - 40}, ${SEG.Y[0]} ${DY - 18}, ${SEG.A[1] - 10} ${DY - 30}`}
              fill="none"
              className="stroke-violet-500"
              strokeWidth={1 + (level / 100) * 5}
              strokeLinecap="round"
            />
            <text x={SEG.Y[0] + 30} y={DY - 50} fontSize="10.5" textAnchor="middle" className="fill-violet-700 dark:fill-violet-300">
              иРНК за трите ензима
            </text>
          </g>
        )}

        {/* Ниво на β-галактозидазата */}
        <text x={380} y={214} fontSize="10.5" fill="currentColor">
          β-галактозидаза
        </text>
        <rect x={380} y={222} width={230} height={14} rx={3} className="fill-gray-100 dark:fill-gray-700" />
        <rect x={380} y={222} width={Math.max(2, (230 * level) / 100)} height={14} rx={3} className="fill-amber-400" />
        <text x={614} y={214} fontSize="10.5" textAnchor="end" fill="currentColor">
          {level}
        </text>
      </LabSvg>

      <Buttons>
        <DiagramButton active={lactose} onClick={() => setLactose(v => !v)}>
          {lactose ? '✓ има лактоза' : 'няма лактоза'}
        </DiagramButton>
        <DiagramButton active={glucose} onClick={() => setGlucose(v => !v)}>
          {glucose ? '✓ има глюкоза' : 'няма глюкоза'}
        </DiagramButton>
      </Buttons>
      <Buttons>
        {MUTATIONS.map(m => (
          <DiagramButton key={m.id} active={mut === m.id} onClick={() => setMut(m.id)}>
            {m.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Readout
        items={[
          { label: 'репресор на оператора', value: repressorOnO ? 'да' : 'не', tone: 'rose' },
          { label: 'CAP на ДНК', value: capBound ? 'да' : 'не', tone: 'emerald' },
          { label: 'транскрипция', value: `${level} усл. ед.`, tone: 'violet' },
        ]}
      />
      <Note tone="violet">{note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Числата са условни: 100 – напълно включен оперон. В действителност разликата между изключен и включен лак оперон е около хиляда
        пъти. Всъщност репресорът се свързва с алолактоза – вещество, което се получава от лактозата в клетката.
      </p>
    </div>
  );
}
