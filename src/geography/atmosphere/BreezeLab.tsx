import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

type Mode = 'breeze' | 'monsoon';

const MONTHS = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];

/**
 * Приблизителни температури: при бриза – морски бряг през лятото (сушата се нагрява и изстива бързо,
 * морето почти не мени температурата си); при мусона – условна средна температура на сушата в Азия и Индийският океан.
 */
function temps(mode: Mode, t: number) {
  if (mode === 'breeze') {
    const land = 23 + 8 * Math.sin((2 * Math.PI * (t - 9)) / 24);
    const sea = 24 + 0.5 * Math.sin((2 * Math.PI * (t - 12)) / 24);
    return { land, sea };
  }
  const land = 19 + 14 * Math.cos((2 * Math.PI * (t - 7)) / 12);
  const sea = 26.5 + 0.5 * Math.cos((2 * Math.PI * (t - 4.5)) / 12);
  return { land, sea };
}

const GROUND = 250;
const COAST = 320;

/** Термична циркулация: разликата в нагряването на сушата и морето прави разлика в налягането и вятър. */
export default function BreezeLab() {
  const [mode, setMode] = useState<Mode>('breeze');
  const [hour, setHour] = useState(14);
  const [month, setMonth] = useState(7);
  const t = mode === 'breeze' ? hour : month;
  const { land, sea } = temps(mode, t);
  const dT = land - sea;
  // Приземната разлика в налягането – грубо 0,15 hPa на градус при бриза и 0,5 hPa на градус при мусона
  const dp = -dT * (mode === 'breeze' ? 0.15 : 0.5);
  const calm = Math.abs(dT) < 1;
  const s = Math.min(1, Math.abs(dT) / 8); // сила на циркулацията 0…1
  const dir = Math.sign(dT); // +1: приземен вятър от морето към сушата (наляво → надясно)
  const night = mode === 'breeze' && (hour < 6 || hour > 19.5);

  // Изобарни повърхности: над топлото място са по-високо
  const surface = (base: number) => {
    let d = '';
    for (let x = 20; x <= 620; x += 10) {
      const side = Math.tanh((x - COAST) / 70); // −1 над морето, +1 над сушата
      const y = base - side * dT * 1.6;
      d += `${x === 20 ? 'M' : 'L'}${x} ${y.toFixed(1)}`;
    }
    return d;
  };

  // Затворената верига на циркулацията: приземен поток, издигане над топлото, обратен поток високо, спускане над студеното
  const warmX = dir >= 0 ? 470 : 170;
  const coolX = dir >= 0 ? 170 : 470;
  const top = 105;
  const bottom = GROUND - 22;
  const op = calm ? 0 : 0.35 + 0.65 * s;
  const w = 1.5 + 3 * s;

  const head = (x: number, y: number, ang: number) => {
    const k = 7 + 4 * s;
    return `M${x} ${y}L${x - k * Math.cos(ang - 0.5)} ${y - k * Math.sin(ang - 0.5)}L${x - k * Math.cos(ang + 0.5)} ${y - k * Math.sin(ang + 0.5)}Z`;
  };
  const dx = warmX > coolX ? 1 : -1;

  let label: string;
  if (calm) label = 'затишие – сушата и морето са почти еднакво топли';
  else if (mode === 'breeze') label = dT > 0 ? 'морски бриз – духа от морето към сушата' : 'сухоземен (нощен) бриз – духа от сушата към морето';
  else label = dT > 0 ? 'летен мусон – влажен вятър от океана към сушата, проливни дъждове' : 'зимен мусон – сух вятър от сушата към океана';

  const clouds = !calm && dT > 0 && (mode === 'monsoon' || hour >= 11);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 320" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <rect x={0} y={0} width={640} height={GROUND} className={night ? 'fill-slate-700 dark:fill-slate-900' : 'fill-sky-100 dark:fill-slate-800'} />
        {/* Море и суша */}
        <path d={`M0 ${GROUND}H${COAST}V320H0Z`} className="fill-blue-500 dark:fill-blue-800" />
        <path d={`M${COAST} ${GROUND}Q${COAST + 30} ${GROUND - 14} ${COAST + 80} ${GROUND - 10}H640V320H${COAST}Z`} className="fill-lime-700 dark:fill-lime-900" />
        <text x={160} y={GROUND + 42} fontSize="13" textAnchor="middle" className="fill-white">
          {mode === 'breeze' ? 'море' : 'Индийски океан (юг)'}
        </text>
        <text x={480} y={GROUND + 42} fontSize="13" textAnchor="middle" className="fill-white">
          {mode === 'breeze' ? 'суша' : 'Азия (север)'}
        </text>
        {/* Слънце или луна */}
        {night ? <circle cx={600} cy={34} r={12} className="fill-slate-200" /> : <circle cx={600} cy={34} r={14} className="fill-yellow-400" />}

        {/* Изобарни повърхности */}
        {[60, 140].map(b => (
          <path key={b} d={surface(b)} fill="none" strokeDasharray="5 4" className={night ? 'stroke-slate-300' : 'stroke-slate-500 dark:stroke-slate-400'} strokeWidth="1.2" />
        ))}
        <text x={24} y={52} fontSize="10" className={night ? 'fill-slate-200' : 'fill-slate-600 dark:fill-slate-300'}>
          изобарни повърхности
        </text>

        {/* Облаци над издигащия се въздух */}
        {clouds && (
          <g opacity={0.5 + 0.5 * s}>
            {[0, 1, 2].map(i => (
              <g key={i} transform={`translate(${warmX - 50 + i * 50} ${150 + (i % 2) * 10})`}>
                <ellipse rx={26} ry={13} className="fill-white dark:fill-gray-300" />
                <ellipse cx={-14} cy={5} rx={16} ry={10} className="fill-white dark:fill-gray-300" />
                <ellipse cx={16} cy={5} rx={16} ry={10} className="fill-white dark:fill-gray-300" />
                {mode === 'monsoon' && [-12, 0, 12].map(r => <line key={r} x1={r} y1={18} x2={r - 6} y2={42} className="stroke-blue-500" strokeWidth="1.5" />)}
              </g>
            ))}
          </g>
        )}

        {/* Веригата на циркулацията */}
        <g opacity={op} className="text-rose-600 dark:text-rose-400">
          <line x1={coolX + dx * 20} y1={bottom} x2={warmX - dx * 20} y2={bottom} stroke="currentColor" strokeWidth={w} />
          <path d={head(warmX - dx * 20, bottom, dx > 0 ? 0 : Math.PI)} fill="currentColor" />
          <line x1={warmX} y1={bottom - 18} x2={warmX} y2={top + 18} stroke="currentColor" strokeWidth={w} />
          <path d={head(warmX, top + 18, -Math.PI / 2)} fill="currentColor" />
          <line x1={warmX - dx * 20} y1={top} x2={coolX + dx * 20} y2={top} stroke="currentColor" strokeWidth={w} />
          <path d={head(coolX + dx * 20, top, dx > 0 ? Math.PI : 0)} fill="currentColor" />
          <line x1={coolX} y1={top + 18} x2={coolX} y2={bottom - 18} stroke="currentColor" strokeWidth={w} />
          <path d={head(coolX, bottom - 18, Math.PI / 2)} fill="currentColor" />
        </g>
        {!calm && (
          <g fontSize="16" fontWeight="bold" textAnchor="middle">
            <text x={warmX} y={GROUND - 4} className="fill-blue-700 dark:fill-blue-300">
              Н
            </text>
            <text x={coolX} y={GROUND - 4} className="fill-amber-700 dark:fill-amber-300">
              В
            </text>
            <text x={warmX} y={top - 12} className="fill-amber-700 dark:fill-amber-300">
              В
            </text>
            <text x={coolX} y={top - 12} className="fill-blue-700 dark:fill-blue-300">
              Н
            </text>
          </g>
        )}
        {/* Термометри */}
        <g fontSize="12" fontWeight="bold">
          <text x={40} y={GROUND - 8} className={night ? 'fill-white' : 'fill-gray-800 dark:fill-gray-100'}>
            {fmt(sea, 1)} °C
          </text>
          <text x={600} y={GROUND - 8} textAnchor="end" className={night ? 'fill-white' : 'fill-gray-800 dark:fill-gray-100'}>
            {fmt(land, 1)} °C
          </text>
        </g>
        <text x={320} y={24} fontSize="13" fontWeight="bold" textAnchor="middle" className={night ? 'fill-white' : 'fill-gray-700 dark:fill-gray-100'}>
          {mode === 'breeze' ? `${Math.floor(hour)}:${hour % 1 ? '30' : '00'} ч.` : MONTHS[month - 1]}
        </text>
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Н и В – ниско и високо налягане при земята и на височина. Височините и температурите са приблизителни, изобарните повърхности са
        силно преувеличени.
      </p>
      <Buttons>
        <DiagramButton active={mode === 'breeze'} onClick={() => setMode('breeze')}>
          бриз (денонощие)
        </DiagramButton>
        <DiagramButton active={mode === 'monsoon'} onClick={() => setMode('monsoon')}>
          мусон (година)
        </DiagramButton>
      </Buttons>
      <Sliders>
        {mode === 'breeze' ? (
          <Slider label="час" value={hour} onChange={setHour} min={0} max={23.5} step={0.5} tone="amber" />
        ) : (
          <Slider label="месец" value={month} onChange={setMonth} min={1} max={12} step={1} tone="amber" />
        )}
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'суша', value: `${fmt(land, 1)} °C`, tone: 'amber' },
            { label: mode === 'breeze' ? 'море' : 'океан', value: `${fmt(sea, 1)} °C`, tone: 'blue' },
            { label: 'Δp при земята', value: `${dp > 0 ? '+' : ''}${fmt(dp, 1)} hPa над сушата` },
          ]}
        />
      </div>
      <Note tone={calm ? 'emerald' : 'rose'}>{label}</Note>
    </div>
  );
}
