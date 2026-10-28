import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

type Mode = 'basin' | 'coast';
type Items = Parameters<typeof Readout>[0]['items'];
type View = { svg: React.ReactNode; items: Items; note: string; bad: boolean };

const W = 640;
const H = 300;
const pts = (f: (x: number) => number, x0 = 0, x1 = W, n = 64) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const x = x0 + ((x1 - x0) * k) / n;
    return `${x.toFixed(1)},${f(x).toFixed(1)}`;
  });

// ---------- Артезиански басейн ----------
// 1 px по вертикала = 2 m
const M_PER_PX = 2;
const ground = (x: number) => (x < 220 ? 40 + (70 * (1 - Math.cos((Math.PI * x) / 220))) / 2 : 110);
/** Горна граница на напорния пласт: излиза на повърхността в хълмовете (x ≈ 60) и потъва надясно. */
const confTop = (x: number) => Math.max(ground(x), 20 + 0.42 * x);
const confBottom = (x: number) => 50 + 0.42 * x;
const UNCONF_X = 300; // безнапорният пласт е в равнината вдясно оттук
const UNCONF_BOTTOM = 140; // дъното му
const SHALLOW_X = 380;
const SHALLOW_DEPTH = 26; // px под терена – дъно на плиткия кладенец
const ART_X = 520;
const R = 230; // радиус на депресионната фуния, px

function basin(rain: number, pump: number): View {
  const yRech = 58 + (100 - rain) * 0.3;
  const cone = (x: number) => {
    const d = Math.max(Math.abs(x - ART_X), 6);
    return d >= R ? 0 : (pump * 0.5 * Math.log(R / d)) / Math.log(R / 6);
  };
  const piezo = (x: number) => yRech + 0.075 * (x - 60) + cone(x);
  const wt = (x: number) => ground(x) + 8 + (100 - rain) * 0.25;
  const headAbove = (ground(ART_X) - piezo(ART_X)) * M_PER_PX;
  const flows = headAbove > 0;
  const shallowWater = wt(SHALLOW_X) < ground(SHALLOW_X) + SHALLOW_DEPTH;

  const groundPath = `M0 ${H}L${pts(ground).join('L')}L${W} ${H}Z`;
  const confPath = `M${pts(confTop, 40).join('L')}L${pts(confBottom, 40).reverse().join('L')}Z`;

  const svg = (
    <>
      <rect x={0} y={0} width={W} height={H} className="fill-sky-50 dark:fill-slate-900" />
      <path d={groundPath} className="fill-stone-400 dark:fill-stone-600" />
      {/* Безнапорен пласт в равнината с подземните води под нивото */}
      <rect
        x={UNCONF_X}
        y={ground(UNCONF_X)}
        width={W - UNCONF_X}
        height={UNCONF_BOTTOM - ground(UNCONF_X)}
        className="fill-amber-100 dark:fill-amber-950/60"
      />
      <path
        d={`M${pts(x => Math.max(wt(x), ground(x)), UNCONF_X).join('L')}L${W} ${UNCONF_BOTTOM}L${UNCONF_X} ${UNCONF_BOTTOM}Z`}
        className="fill-sky-300/60 dark:fill-sky-700/50"
      />
      <path d={confPath} className="fill-sky-500/70 dark:fill-sky-600/60" />
      <path d={`M${pts(confBottom, 40).join('L')}L${W} ${H}L40 ${H}Z`} className="fill-stone-500 dark:fill-stone-700" />
      <text x={630} y={UNCONF_BOTTOM + 40} fontSize="11" textAnchor="end" className="fill-white">
        глина (водоупор)
      </text>
      <text x={250} y={confTop(250) + 19} fontSize="11" className="fill-white" transform={`rotate(22.8 250 ${confTop(250) + 19})`}>
        напорен водоносен пласт
      </text>
      <text x={630} y={UNCONF_BOTTOM - 8} fontSize="11" textAnchor="end" className="fill-sky-900 dark:fill-sky-100">
        безнапорен пласт
      </text>

      {/* Ниво на подземните води и пиезометрично ниво */}
      <polyline points={pts(wt, UNCONF_X).join(' ')} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="1.5" />
      <polyline points={pts(piezo, 40).join(' ')} fill="none" className="stroke-violet-600 dark:stroke-violet-400" strokeWidth="2" strokeDasharray="6 4" />
      <text x={150} y={piezo(150) - 6} fontSize="11" className="fill-violet-700 dark:fill-violet-300">
        пиезометрично ниво
      </text>

      {/* Валеж над хълмовете – тук пластът се подхранва */}
      {Array.from({ length: Math.round(rain / 20) }, (_, k) => 30 + k * 18).map(x => (
        <line key={x} x1={x} y1={8} x2={x - 5} y2={22} className="stroke-sky-600 dark:stroke-sky-400" strokeWidth="1.4" />
      ))}
      <text x={10} y={ground(10) + 16} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
        подхранване
      </text>

      {/* Плитък кладенец */}
      <rect
        x={SHALLOW_X - 5}
        y={ground(SHALLOW_X) - 12}
        width={10}
        height={SHALLOW_DEPTH + 12}
        className="fill-white stroke-gray-600 dark:fill-gray-800 dark:stroke-gray-300"
      />
      {shallowWater && (
        <rect x={SHALLOW_X - 4} y={wt(SHALLOW_X)} width={8} height={ground(SHALLOW_X) + SHALLOW_DEPTH - wt(SHALLOW_X)} className="fill-blue-500" />
      )}
      <text x={SHALLOW_X} y={ground(SHALLOW_X) - 16} fontSize="11" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
        кладенец
      </text>

      {/* Артезиански кладенец */}
      <rect
        x={ART_X - 5}
        y={ground(ART_X) - 12}
        width={10}
        height={confTop(ART_X) - ground(ART_X) + 22}
        className="fill-white stroke-gray-600 dark:fill-gray-800 dark:stroke-gray-300"
      />
      <rect
        x={ART_X - 4}
        y={Math.max(piezo(ART_X), ground(ART_X) - 12)}
        width={8}
        height={confTop(ART_X) + 22 - Math.max(piezo(ART_X), ground(ART_X) - 12)}
        className="fill-blue-500"
      />
      {flows && (
        <path
          d={`M${ART_X} ${ground(ART_X) - 12} q-14 -${Math.min(30, 6 + headAbove / 3)} -28 ${10} M${ART_X} ${ground(ART_X) - 12} q14 -${Math.min(30, 6 + headAbove / 3)} 28 ${10}`}
          fill="none"
          className="stroke-blue-500"
          strokeWidth="2.5"
        />
      )}
      <text x={ART_X} y={ground(ART_X) - 50} fontSize="11" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
        артезиански кладенец
      </text>
    </>
  );
  return {
    svg,
    items: [
      {
        label: 'плитък кладенец',
        value: shallowWater ? 'има вода' : 'пресъхнал',
        tone: shallowWater ? 'blue' : 'rose',
      },
      {
        label: 'напор над терена',
        value: `${fmt(headAbove)} m`,
        tone: 'violet',
      },
      {
        label: 'артезиански',
        value: flows ? 'самоизлива се' : 'трябва помпа',
        tone: flows ? 'emerald' : 'rose',
      },
    ],
    note: flows
      ? `Пиезометричното ниво е на ${fmt(headAbove)} m над терена – водата сама блика от кладенеца.`
      : 'Пиезометричното ниво е под терена: водата се качва в тръбата, но не стига до повърхността – трябва помпа.',
    bad: !flows,
  };
}

// ---------- Морски бряг ----------
const SEA_Y = 110;
const SHORE = 450;
const UP = 12; // px на метър над морското ниво (преувеличено 10 пъти)
const DOWN = 1.2; // px на метър под морското ниво
const WELL_X = 240;
const WELL_DEPTH = 35; // m под морското ниво

function coast(rain: number, pump: number): View {
  const hMax = 0.6 + (2.4 * rain) / 150;
  const h0 = (x: number) => (x >= SHORE ? 0 : hMax * Math.sqrt((SHORE - x) / SHORE));
  const s = (x: number) => {
    const d = Math.abs(x - WELL_X) / 110;
    return d >= 1 ? 0 : (pump / 100) * 1.1 * (1 - d) ** 2;
  };
  const h = (x: number) => Math.max(0.02, h0(x) - s(x));
  const iface = (x: number) => 40 * h(x);
  const hw = h(WELL_X);
  const salty = iface(WELL_X) <= WELL_DEPTH;
  const landY = (x: number) => SEA_Y - (x >= SHORE ? 0 : 5 * UP * ((SHORE - x) / SHORE) ** 0.7);

  const wtPts = pts(x => SEA_Y - h(x) * UP, 0, SHORE, 90);
  const ifPts = pts(x => SEA_Y + iface(x) * DOWN, 0, SHORE, 90);

  const svg = (
    <>
      <rect x={0} y={0} width={W} height={H} className="fill-sky-50 dark:fill-slate-900" />
      <rect x={0} y={SEA_Y} width={W} height={H - SEA_Y} className="fill-teal-700/70 dark:fill-teal-900" />
      <rect x={SHORE} y={SEA_Y} width={W - SHORE} height={H - SEA_Y} className="fill-blue-700/70 dark:fill-blue-900" />
      <path d={`M${wtPts.join('L')}L${ifPts.reverse().join('L')}Z`} className="fill-sky-300 dark:fill-sky-600" />
      <path
        d={`M0 ${landY(0)}L${pts(landY, 0, SHORE + 30, 60).join('L')}L${SHORE + 30} ${SEA_Y}L${SHORE} ${SEA_Y}L${wtPts.join('L')}Z`}
        className="fill-amber-100/80 dark:fill-amber-950/70"
      />
      <polyline points={pts(x => SEA_Y - h(x) * UP, 0, SHORE, 90).join(' ')} fill="none" className="stroke-blue-600 dark:stroke-blue-300" strokeWidth="1.5" />
      <polyline
        points={pts(x => SEA_Y + iface(x) * DOWN, 0, SHORE, 90).join(' ')}
        fill="none"
        className="stroke-rose-600 dark:stroke-rose-400"
        strokeWidth="2"
        strokeDasharray="6 4"
      />
      <text x={SHORE + 70} y={SEA_Y - 8} fontSize="11" className="fill-blue-700 dark:fill-blue-300">
        море
      </text>
      <text x={20} y={SEA_Y + iface(20) * DOWN - 8} fontSize="11" className="fill-sky-900 dark:fill-sky-100">
        сладка вода
      </text>
      <text x={20} y={H - 12} fontSize="11" className="fill-white">
        солена вода
      </text>
      <text x={330} y={SEA_Y + iface(330) * DOWN + 16} fontSize="11" className="fill-rose-100">
        граница сладка/солена
      </text>
      {/* Кладенецът */}
      <rect
        x={WELL_X - 5}
        y={landY(WELL_X) - 14}
        width={10}
        height={SEA_Y + WELL_DEPTH * DOWN - landY(WELL_X) + 14}
        className="fill-white stroke-gray-600 dark:fill-gray-800 dark:stroke-gray-300"
      />
      <rect x={WELL_X - 4} y={SEA_Y - hw * UP} width={8} height={WELL_DEPTH * DOWN + hw * UP} className={salty ? 'fill-teal-600' : 'fill-blue-500'} />
      <text
        x={WELL_X}
        y={landY(WELL_X) - 20}
        fontSize="11"
        textAnchor="middle"
        className={salty ? 'fill-rose-600 dark:fill-rose-400' : 'fill-gray-700 dark:fill-gray-200'}
      >
        кладенец{salty ? ' – солен!' : ''}
      </text>
    </>
  );
  return {
    svg,
    items: [
      { label: 'h при кладенеца', value: `${fmt(hw, 2)} m`, tone: 'blue' },
      {
        label: 'граница сладка/солена',
        value: `${fmt(40 * hw)} m под м. н.`,
        tone: 'rose',
      },
      { label: 'дъно на кладенеца', value: `${WELL_DEPTH} m под м. н.` },
    ],
    note: salty
      ? `Границата се е вдигнала до ${fmt(40 * hw)} m под морското ниво – над дъното на кладенеца. Той вади солена вода.`
      : `Водното ниво е ${fmt(hw, 2)} m над морето, затова сладката вода стига до ${fmt(40 * hw)} m под него (40 пъти по-дълбоко).`,
    bad: salty,
  };
}

/** Водоносни пластове: артезиански басейн и проникване на морска вода при брега. */
export default function AquiferLab() {
  const [mode, setMode] = useState<Mode>('basin');
  const [rain, setRain] = useState(100);
  const [pump, setPump] = useState(0);

  const view = mode === 'basin' ? basin(rain, pump) : coast(rain, pump);
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={mode === 'basin'} onClick={() => setMode('basin')}>
          Артезиански басейн
        </DiagramButton>
        <DiagramButton active={mode === 'coast'} onClick={() => setMode('coast')}>
          Морски бряг
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
          {view.svg}
        </LabSvg>
      </div>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        {mode === 'basin'
          ? 'Напорният пласт се подхранва в хълмовете, където излиза на повърхността. Водата в него е притисната под глината – в кладенеца тя се издига до пиезометричното ниво (виолетовата линия).'
          : 'Сладката вода „плува“ върху по-тежката морска. Височините над морското ниво са увеличени 10 пъти спрямо дълбочините – иначе водното ниво не би се видяло.'}
      </p>
      <Sliders>
        <Slider label="валеж, %" value={rain} onChange={setRain} min={20} max={150} step={5} tone="blue" />
        <Slider label="помпа" value={pump} onChange={setPump} min={0} max={100} step={5} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout items={view.items} />
      </div>
      <Note tone={view.bad ? 'rose' : 'emerald'}>{view.note}</Note>
    </div>
  );
}
