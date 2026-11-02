import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import EuTiles from './EuTiles';
import { EU27, EU_POP, type Country } from './euData';

const N = EU27.length;
const SEATS = EU27.reduce((s, c) => s + c.seats, 0);
const codes = (f: (c: Country) => boolean) => EU27.filter(f).map(c => c.code);

const PRESETS: [string, string[]][] = [
  ['всички', codes(() => true)],
  ['никой', []],
  ['основателките', codes(c => c.eu === 1958)],
  ['най-големите 4', ['DE', 'FR', 'IT', 'ES']],
  ['приети от 2004 г.', codes(c => (c.eu ?? 0) >= 2004)],
  ['еврозоната', codes(c => c.euro !== null)],
];

const BAR_X = 455;
const BAR_W = 175;

function Bar({ y, label, share, need, ok }: { y: number; label: string; share: number; need: number; ok: boolean }) {
  return (
    <g>
      <text x={BAR_X} y={y - 6} fontSize="11" className="fill-gray-700 dark:fill-gray-200">
        {label}
      </text>
      <rect x={BAR_X} y={y} width={BAR_W} height={16} rx={3} className="fill-gray-200 dark:fill-gray-700" />
      <rect x={BAR_X} y={y} width={BAR_W * Math.min(share, 1)} height={16} rx={3} className={ok ? 'fill-emerald-500' : 'fill-rose-400'} />
      <line x1={BAR_X + BAR_W * need} x2={BAR_X + BAR_W * need} y1={y - 3} y2={y + 19} className="stroke-gray-900 dark:stroke-gray-100" strokeWidth="2" />
      <text x={BAR_X + BAR_W * need} y={y + 31} fontSize="9.5" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
        {fmt(need * 100)}%
      </text>
    </g>
  );
}

/** Гласуване в Съвета на ЕС с квалифицирано мнозинство и местата в Европейския парламент. */
export default function VotingLab() {
  const [yes, setYes] = useState<string[]>(PRESETS[4][1]);
  const [last, setLast] = useState<Country>(EU27.find(c => c.code === 'BG')!);

  const toggle = (c: Country) => {
    setYes(yes.includes(c.code) ? yes.filter(k => k !== c.code) : [...yes, c.code]);
    setLast(c);
  };
  const forList = EU27.filter(c => yes.includes(c.code));
  const against = EU27.filter(c => !yes.includes(c.code));
  const nFor = forList.length;
  const popFor = forList.reduce((s, c) => s + c.pop, 0) / EU_POP;
  const popAgainst = 1 - popFor;
  const okStates = nFor >= Math.ceil(0.55 * N);
  const okPop = popFor >= 0.65;
  // Блокиращо малцинство: поне 4 държави с над 35% от населението; ако против са под 4 държави, мнозинството се смята за постигнато
  const blocking = against.length >= 4 && popAgainst > 0.35;
  const fewAgainst = okStates && !okPop && against.length < 4;
  const passed = okStates && (okPop || fewAgainst);
  const seatsFor = forList.reduce((s, c) => s + c.seats, 0);

  const fill = (c: Country) =>
    yes.includes(c.code)
      ? 'fill-emerald-300 stroke-emerald-700 dark:fill-emerald-700 dark:stroke-emerald-300'
      : 'fill-rose-200 stroke-rose-500 dark:fill-rose-900 dark:stroke-rose-400';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 385" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={10} y={18} fontSize="12" className="fill-gray-700 dark:fill-gray-200 font-semibold">
          Щракни страна, за да смениш гласа ѝ: зелено – „за“, червено – „против“
        </text>
        <EuTiles countries={EU27} x0={10} y0={32} fill={fill} sub={c => `${fmt(c.pop * 100 / EU_POP, 1)}%`} onClick={toggle} />

        <Bar y={60} label={`държави „за“: ${nFor} от ${N}`} share={nFor / N} need={0.55} ok={okStates} />
        <Bar y={130} label={`население „за“: ${fmt(popFor * 100, 1)}%`} share={popFor} need={0.65} ok={okPop} />
        <Bar y={200} label={`места в ЕП: ${seatsFor} от ${SEATS}`} share={seatsFor / SEATS} need={0.5} ok={seatsFor > SEATS / 2} />

        <text x={BAR_X} y={268} fontSize="12" className={`font-semibold ${passed ? 'fill-emerald-700 dark:fill-emerald-400' : 'fill-rose-700 dark:fill-rose-400'}`}>
          Съветът: {passed ? 'прието' : 'отхвърлено'}
        </text>
        <text x={BAR_X} y={288} fontSize="10.5" className="fill-gray-600 dark:fill-gray-300">
          {fewAgainst ? 'против са под 4 държави' : passed ? '' : blocking ? 'против е блокиращо малцинство' : !okStates ? 'не стигат държавите' : 'не стига населението'}
        </text>

        <text x={BAR_X} y={320} fontSize="11" className="fill-gray-700 dark:fill-gray-200 font-medium">
          {last.name}
        </text>
        <text x={BAR_X} y={338} fontSize="10.5" className="fill-gray-600 dark:fill-gray-300">
          {last.seats} места в ЕП
        </text>
        <text x={BAR_X} y={355} fontSize="10.5" className="fill-gray-600 dark:fill-gray-300">
          {fmt((last.pop * 1e6) / last.seats / 1000)} хил. жители на едно място
        </text>
      </LabSvg>
      <Buttons>
        {PRESETS.map(([name, list]) => (
          <DiagramButton key={name} active={list.length === yes.length && list.every(k => yes.includes(k))} onClick={() => setYes(list)}>
            {name}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        Процентът под кода е делът от населението на ЕС (Евростат, 1.1.2025 г.; Съветът ползва официално утвърдени данни, които се различават малко).
        Квалифицирано мнозинство: поне 55% от държавите (15 от 27) с поне 65% от населението. Местата в ЕП са за мандат 2024–2029; евродепутатите
        гласуват по политически групи, а не по държави, така че третата лента е само за сравнение.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'държави', value: `${nFor} / ${N}`, tone: okStates ? 'emerald' : 'rose' },
            { label: 'население', value: `${fmt(popFor * 100, 1)}%`, tone: okPop ? 'emerald' : 'rose' },
            { label: 'Съветът', value: passed ? 'прието' : 'отхвърлено', tone: passed ? 'emerald' : 'rose' },
          ]}
        />
      </div>
      <Note tone={passed ? 'emerald' : blocking ? 'rose' : 'amber'}>
        {fewAgainst
          ? `Населението „за“ е под 65%, но против са само ${against.length} държави. Блокиращото малцинство изисква поне 4 – затова решението се смята за прието.`
          : passed
          ? 'Двете условия са изпълнени – и мнозинството от държавите, и мнозинството от гражданите на ЕС стоят зад решението.'
          : blocking
            ? `Против са ${against.length} държави с ${fmt(popAgainst * 100, 1)}% от населението – блокиращо малцинство (поне 4 държави с над 35%). Решението се спира, макар и много държави да са „за“.`
            : !okStates && !okPop
              ? `Не стигат нито държавите (${nFor} от нужните 15), нито населението (${fmt(popFor * 100, 1)}% от нужните 65%).`
              : !okStates
              ? `Населението стига, но трябват поне 15 държави – сега са ${nFor}. Така големите държави не могат да решават сами.`
              : `Държавите стигат, но те представляват само ${fmt(popFor * 100, 1)}% от гражданите – под 65%.`}
      </Note>
    </div>
  );
}
