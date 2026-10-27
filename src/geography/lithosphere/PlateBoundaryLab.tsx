import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

type Kind = 'divergent' | 'subduction' | 'collision' | 'transform';
const KINDS: { id: Kind; name: string; note: string }[] = [
  { id: 'divergent', name: 'Разходяща', note: 'Плочите се раздалечават; магма от мантията запълва пролуката и създава нова океанска кора. Двете точки са били заедно при хребета.' },
  { id: 'subduction', name: 'Субдукция', note: 'Тежката океанска плоча потъва под континента. Над мястото, където е на около 100 km дълбочина, излиза магма – верига вулкани.' },
  { id: 'collision', name: 'Сблъсък', note: 'Две континентални плочи са твърде леки, за да потънат: кората се нагъва и удебелява – растат планини като Хималаите.' },
  { id: 'transform', name: 'Трансформна', note: 'Плочите се плъзгат една покрай друга (изглед отгоре). Кора не се създава и не се унищожава, но разломът е земетръсен.' },
];

const W = 640;
const SEA = 70; // морско ниво
const PX_KM = 0.3; // хоризонтален мащаб на разрезите: px на km

/** Разрези на трите вида граници между плочите и как се движат с времето. */
export default function PlateBoundaryLab() {
  const [kind, setKind] = useState<Kind>('divergent');
  const [v, setV] = useState(5);
  const [t, setT] = useState(4);
  const k = KINDS.find(x => x.id === kind)!;

  // 1 cm/година за 1 млн. години = 10 km
  const shiftKm = v * t * 10;
  const shift = shiftKm * PX_KM;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} 280`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {kind === 'divergent' && <Divergent shift={shift} />}
        {kind === 'subduction' && <Subduction shift={shift} />}
        {kind === 'collision' && <Collision shift={shift} />}
        {kind === 'transform' && <Transform shift={shift} />}
        <text x={W - 10} y={272} fontSize="11" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          {kind === 'transform' ? 'изглед отгоре' : 'разрез; дебелините са преувеличени'}
        </text>
      </LabSvg>
      <Buttons>
        {KINDS.map(x => (
          <DiagramButton key={x.id} active={kind === x.id} onClick={() => setKind(x.id)}>
            {x.name}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">Плъзгачите: скорост на плочите една спрямо друга (cm/год) и изминало време (млн. години).</p>
      <Sliders>
        <Slider label="cm/год" value={v} onChange={setV} min={1} max={10} step={0.5} tone="amber" />
        <Slider label="млн. г." value={t} onChange={setT} min={0} max={10} step={0.5} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'преместване', value: `${fmt(shiftKm)} km`, tone: 'rose' },
            { label: 'за 1 година', value: `${fmt(v, 1)} cm` },
            { label: 'за човешки живот (80 г.)', value: `${fmt(v * 0.8, 1)} m` },
          ]}
        />
      </div>
      <Note tone="blue">{k.note}</Note>
    </div>
  );
}

const crust = 'fill-stone-500 dark:fill-stone-500';
const ocean = 'fill-sky-300/70 dark:fill-sky-800/70';
const mantle = 'fill-orange-200 dark:fill-orange-900/60';
const cont = 'fill-amber-700/80 dark:fill-amber-700/70';

function Arrow({ x, y, dir, label }: { x: number; y: number; dir: 1 | -1; label?: string }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x + dir * 40} y2={y} className="stroke-gray-900 dark:stroke-white" strokeWidth="2.5" />
      <path d={`M${x + dir * 40} ${y - 6} L${x + dir * 50} ${y} L${x + dir * 40} ${y + 6}Z`} className="fill-gray-900 dark:fill-white" />
      {label && (
        <text x={x + dir * 25} y={y - 9} fontSize="11" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          {label}
        </text>
      )}
    </g>
  );
}

function Divergent({ shift }: { shift: number }) {
  const cx = W / 2;
  // Ивици по възраст: всеки 1 млн. години е отделна ивица; кората се движи с плочата
  const bands = Array.from({ length: 24 }, (_, i) => i);
  return (
    <g>
      <rect x={0} y={130} width={W} height={130} className={mantle} />
      <rect x={0} y={20} width={W} height={SEA + 20} className={ocean} />
      {bands.map(i => {
        const w = 14;
        return (
          <g key={i}>
            <rect x={cx + i * w} y={95} width={w} height={35} className={i % 2 ? 'fill-stone-600' : 'fill-stone-400'} />
            <rect x={cx - (i + 1) * w} y={95} width={w} height={35} className={i % 2 ? 'fill-stone-600' : 'fill-stone-400'} />
          </g>
        );
      })}
      <path d={`M${cx - 60} 95 Q${cx} 70 ${cx + 60} 95Z`} className="fill-stone-500" />
      <path d={`M${cx} 250 C${cx - 10} 200 ${cx + 10} 160 ${cx} 98`} fill="none" className="stroke-red-500" strokeWidth="5" strokeDasharray="9 5" />
      <text x={cx} y={60} fontSize="12" textAnchor="middle" className="fill-gray-800 dark:fill-gray-100">
        средноокеански хребет
      </text>
      {/* Две точки, които са били заедно при хребета */}
      {[-1, 1].map(s => (
        <g key={s}>
          <circle cx={cx + (s * shift) / 2} cy={92} r={6} className="fill-fuchsia-600 stroke-white" strokeWidth="1.5" />
        </g>
      ))}
      <Arrow x={130} y={115} dir={-1} />
      <Arrow x={W - 130} y={115} dir={1} />
      <text x={20} y={200} fontSize="12" className="fill-gray-700 dark:fill-gray-200">
        мантия (астеносфера)
      </text>
    </g>
  );
}

function Subduction({ shift }: { shift: number }) {
  const trench = 380;
  const dip = Math.PI / 6;
  // Подводна планина, която пътува към рова и после потъва по плочата
  const s0 = 240 + shift;
  const along = Math.max(0, s0 - trench);
  const mx = s0 <= trench ? s0 : trench + along * Math.cos(dip);
  const my = s0 <= trench ? 92 : 92 + along * Math.sin(dip);
  const arcX = trench + 100 / Math.tan(dip) * 0.6;
  return (
    <g>
      <rect x={0} y={110} width={W} height={150} className={mantle} />
      <rect x={0} y={20} width={trench + 20} height={SEA + 20} className={ocean} />
      {/* Океанската плоча: хоризонтално до рова, после надолу под 30° */}
      <path d={`M0 95 L${trench} 95 L${trench + 260 * Math.cos(dip)} ${95 + 260 * Math.sin(dip)} L${trench + 260 * Math.cos(dip) - 15} ${95 + 260 * Math.sin(dip) + 25} L${trench - 18} 125 L0 125Z`} className={crust} />
      {/* Континентът */}
      <path d={`M${trench + 10} 90 L${trench + 40} 60 L${arcX - 20} 50 L${arcX} 22 L${arcX + 20} 50 L${W} 55 L${W} 150 L${trench + 160} 150 Z`} className={cont} />
      <path d={`M${arcX} 140 C${arcX - 10} 100 ${arcX + 8} 70 ${arcX} 26`} fill="none" className="stroke-red-500" strokeWidth="4" strokeDasharray="8 5" />
      <text x={arcX + 10} y={18} fontSize="11" className="fill-gray-800 dark:fill-gray-100">
        вулканична дъга
      </text>
      <text x={trench - 10} y={110} fontSize="11" textAnchor="end" className="fill-gray-800 dark:fill-gray-100">
        ров
      </text>
      {/* Огнища на земетресения по потъващата плоча */}
      {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((f, i) => (
        <circle key={i} cx={trench + f * 240 * Math.cos(dip) + (i % 2 ? 6 : -4)} cy={100 + f * 240 * Math.sin(dip)} r={3.5} className="fill-yellow-400 stroke-amber-700" strokeWidth="1" />
      ))}
      <path d={`M${mx - 14} ${my} L${mx} ${my - 18} L${mx + 14} ${my}Z`} className="fill-fuchsia-600 stroke-white" strokeWidth="1.2" />
      <Arrow x={70} y={140} dir={1} label="океанска плоча" />
      <text x={W - 10} y={140} fontSize="11" textAnchor="end" className="fill-white">
        континентална плоча
      </text>
    </g>
  );
}

function Collision({ shift }: { shift: number }) {
  const cx = W / 2;
  // Съкращението на кората се превръща в издигане и удебеляване
  const h = Math.min(70, shift * 0.45);
  const root = Math.min(70, shift * 0.45);
  const wl = 160 - Math.min(60, shift * 0.2);
  return (
    <g>
      <rect x={0} y={130} width={W} height={130} className={mantle} />
      <path d={`M0 80 L${cx - wl} 80 C${cx - 50} 80 ${cx - 30} ${78 - h} ${cx} ${76 - h} C${cx + 30} ${78 - h} ${cx + 50} 80 ${cx + wl} 80 L${W} 80 L${W} 140 L${cx + wl} 140 C${cx + 50} 140 ${cx + 30} ${142 + root} ${cx} ${144 + root} C${cx - 30} ${142 + root} ${cx - 50} 140 ${cx - wl} 140 L0 140Z`} className={cont} />
      {Array.from({ length: 5 }, (_, i) => (
        <path key={i} d={`M${cx - 120 + i * 10} ${95 + i * 8} C${cx - 40} ${80 + i * 8 - h * 0.8} ${cx + 40} ${80 + i * 8 - h * 0.8} ${cx + 120 - i * 10} ${95 + i * 8}`} fill="none" className="stroke-amber-950/40" strokeWidth="1.2" />
      ))}
      <text x={cx} y={60 - h} fontSize="12" textAnchor="middle" className="fill-gray-800 dark:fill-gray-100">
        нагънати планини
      </text>
      <text x={cx} y={175 + root} fontSize="11" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
        „корен“ на планината
      </text>
      <Arrow x={80} y={110} dir={1} />
      <Arrow x={W - 80} y={110} dir={-1} />
      <text x={20} y={70} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
        континент
      </text>
      <text x={W - 20} y={70} fontSize="11" textAnchor="end" className="fill-gray-700 dark:fill-gray-200">
        континент
      </text>
    </g>
  );
}

function Transform({ shift }: { shift: number }) {
  const fy = 140;
  const off = Math.min(shift, 280);
  return (
    <g>
      <rect x={20} y={30} width={W - 40} height={fy - 30} className="fill-lime-100 dark:fill-lime-900/40" />
      <rect x={20} y={fy} width={W - 40} height={fy - 30} className="fill-amber-100 dark:fill-amber-900/40" />
      <line x1={20} y1={fy} x2={W - 20} y2={fy} className="stroke-red-600" strokeWidth="3" />
      {/* Река, пресечена от разлома: долната част е отместена */}
      <path d={`M${200 + off / 2} 30 C${215 + off / 2} 70 ${185 + off / 2} 110 ${200 + off / 2} ${fy}`} fill="none" className="stroke-blue-600" strokeWidth="5" />
      <path d={`M${200 - off / 2} ${fy} C${215 - off / 2} 170 ${185 - off / 2} 220 ${200 - off / 2} 250`} fill="none" className="stroke-blue-600" strokeWidth="5" />
      <Arrow x={W - 110} y={80} dir={1} />
      <Arrow x={110} y={200} dir={-1} />
      <text x={W - 30} y={fy - 8} fontSize="12" textAnchor="end" className="fill-red-700 dark:fill-red-300">
        трансформен разлом
      </text>
      <text x={30} y={50} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
        плоча 1
      </text>
      <text x={30} y={240} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
        плоча 2
      </text>
      {off >= 280 && (
        <text x={W / 2} y={262} fontSize="11" textAnchor="middle" className="fill-gray-500">
          (отместването излиза извън чертежа)
        </text>
      )}
    </g>
  );
}
