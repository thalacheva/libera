import { useState } from 'react';

const W = 640;
const H = 410;
const CELL_W = 33;
const CELL_H = 30;
const GX = 22;
const GY = 18;

type Source = 'bb' | 'cosmic' | 'lowmass' | 'massive' | 'wd' | 'merger' | 'none';

const SOURCES: Record<Source, { name: string; color: string; text: string }> = {
  bb: { name: 'Големият взрив', color: '#60a5fa', text: 'Първите три минути след Големия взрив: водород, хелий и следи от литий. Нищо по-тежко – Вселената се разширява и изстива твърде бързо.' },
  cosmic: { name: 'Космически лъчи', color: '#e879f9', text: 'Бързи протони удрят ядра на въглерод и кислород в междузвездния газ и ги „натрошават“ на литий, берилий и бор. Затова тези три леки елемента са редки.' },
  lowmass: { name: 'Умиращи звезди с малка маса', color: '#facc15', text: 'Звезди до ~8 M☉ на асимптотичния клон на гигантите: бавното прихващане на неутрони (s-процес) създава стронций, барий, олово. Ветровете им разнасят и въглерод и азот.' },
  massive: { name: 'Експлодиращи масивни звезди', color: '#4ade80', text: 'Свръхнови тип II: кислород, неон, магнезий, силиций, сяра, калций… – всичко, което звездата-лук е синтезирала, плюс част от желязото.' },
  wd: { name: 'Експлодиращи бели джуджета', color: '#f87171', text: 'Свръхнови тип Ia: бяло джудже в двойна система надхвърля границата на Чандрасекар и избухва. Главен източник на желязо, никел и манган.' },
  merger: { name: 'Сливане на неутронни звезди', color: '#a78bfa', text: 'При сливането на две неутронни звезди изхвърленото вещество е залято от неутрони – бързото им прихващане (r-процес) създава злато, платина, йод, уран. Видяно директно през 2017 г. (GW170817).' },
  none: { name: 'Нестабилни', color: '#475569', text: 'Нямат стабилни изотопи. На Земята ги има само като продукти от разпада на уран и торий – или ги създаваме в лаборатория.' },
};

const SYMBOLS =
  'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U'.split(' ');
const NAMES =
  'Водород Хелий Литий Берилий Бор Въглерод Азот Кислород Флуор Неон Натрий Магнезий Алуминий Силиций Фосфор Сяра Хлор Аргон Калий Калций Скандий Титан Ванадий Хром Манган Желязо Кобалт Никел Мед Цинк Галий Германий Арсен Селен Бром Криптон Рубидий Стронций Итрий Цирконий Ниобий Молибден Технеций Рутений Родий Паладий Сребро Кадмий Индий Калай Антимон Телур Йод Ксенон Цезий Барий Лантан Церий Празеодим Неодим Прометий Самарий Европий Гадолиний Тербий Диспрозий Холмий Ербий Тулий Итербий Лутеций Хафний Тантал Волфрам Рений Осмий Иридий Платина Злато Живак Талий Олово Бисмут Полоний Астат Радон Франций Радий Актиний Торий Протактиний Уран'.split(
    ' '
  );

// Главни източници на всеки елемент (първият е основният), опростено по Дж. Джонсън (2019)
const ORIGIN: Source[][] = [
  ['bb'], ['bb', 'massive'], ['bb', 'cosmic', 'lowmass'], ['cosmic'], ['cosmic'], ['lowmass', 'massive'], ['lowmass', 'massive'], ['massive'], ['massive', 'lowmass'], ['massive'],
  ['massive'], ['massive'], ['massive'], ['massive', 'wd'], ['massive'], ['massive', 'wd'], ['massive'], ['massive', 'wd'], ['massive'], ['massive', 'wd'],
  ['massive'], ['massive', 'wd'], ['wd', 'massive'], ['wd', 'massive'], ['wd', 'massive'], ['wd', 'massive'], ['massive', 'wd'], ['wd', 'massive'], ['massive'], ['massive'],
  ['massive', 'lowmass'], ['massive', 'lowmass'], ['massive', 'merger'], ['massive', 'merger'], ['merger', 'massive'], ['lowmass', 'massive'], ['lowmass', 'merger'], ['lowmass'], ['lowmass'], ['lowmass'],
  ['lowmass', 'merger'], ['lowmass', 'merger'], ['none'], ['merger', 'lowmass'], ['merger'], ['merger', 'lowmass'], ['merger', 'lowmass'], ['lowmass', 'merger'], ['lowmass', 'merger'], ['lowmass', 'merger'],
  ['merger', 'lowmass'], ['merger'], ['merger'], ['merger', 'lowmass'], ['merger', 'lowmass'], ['lowmass'], ['lowmass', 'merger'], ['lowmass'], ['lowmass', 'merger'], ['lowmass', 'merger'],
  ['none'], ['merger', 'lowmass'], ['merger'], ['merger'], ['merger'], ['merger'], ['merger'], ['merger'], ['merger'], ['merger', 'lowmass'],
  ['merger'], ['lowmass', 'merger'], ['merger', 'lowmass'], ['lowmass', 'merger'], ['merger'], ['merger'], ['merger'], ['merger'], ['merger'], ['lowmass', 'merger'],
  ['lowmass', 'merger'], ['lowmass', 'merger'], ['lowmass', 'merger'], ['none'], ['none'], ['none'], ['none'], ['none'], ['none'], ['merger'],
  ['none'], ['merger'],
];

const NOTES: Record<number, string> = {
  1: 'Всеки водороден атом в тялото ви е на 13,8 млрд. години – създаден е малко след Големия взрив.',
  6: 'Въглеродът във всяка ваша клетка е изхвърлен от звезди – главно от ветровете на умиращи звезди като бъдещото Слънце.',
  8: 'Кислородът, който дишате, е синтезиран в масивни звезди и разпръснат от свръхнови.',
  20: 'Калцият в костите ви – от свръхнови тип II и Ia.',
  26: 'Желязото в кръвта ви: около две трети от него идва от експлозии на бели джуджета.',
  43: 'През 1952 г. Пол Мерил открива линии на технеций в спектрите на червени гиганти. Технецият се разпада за няколко милиона години – значи е създаден в самите звезди. Това е първото пряко доказателство за звездния синтез.',
  53: 'Йодът в щитовидната ви жлеза идва от сливания на неутронни звезди.',
  79: 'Сливането GW170817 (2017) е изхвърлило вероятно няколко земни маси злато и платина. Златото в един пръстен е създадено в такива катаклизми.',
  92: 'Уранът се разпада бавно – енергията в атомните електроцентрали всъщност е „съхранена“ енергия от сливане на неутронни звезди отпреди милиарди години.',
};

/** Позиция в таблицата: [ред, колона] (редове 8–9 са лантаниди и актиниди). */
function position(z: number): [number, number] {
  if (z === 1) return [0, 0];
  if (z === 2) return [0, 17];
  if (z <= 4) return [1, z - 3];
  if (z <= 10) return [1, z + 7];
  if (z <= 12) return [2, z - 11];
  if (z <= 18) return [2, z - 1];
  if (z <= 36) return [3, z - 19];
  if (z <= 54) return [4, z - 37];
  if (z <= 56) return [5, z - 55];
  if (z <= 71) return [8, z - 55];
  if (z <= 86) return [5, z - 69];
  if (z <= 88) return [6, z - 87];
  return [9, z - 87];
}

export default function CosmicOrigins() {
  const [z, setZ] = useState(26);
  const [focus, setFocus] = useState<Source | null>(null);
  const origin = ORIGIN[z - 1];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-violet-300 dark:border-violet-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Откъде идват елементите</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        Цветът показва главния космически източник на всеки елемент (опростено). Щракнете върху елемент или върху източник в
        легендата.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {SYMBOLS.map((sym, i) => {
          const zz = i + 1;
          const [row, col] = position(zz);
          const x = GX + col * CELL_W;
          const y = GY + row * CELL_H + (row >= 8 ? 10 : 0);
          const src = ORIGIN[i];
          const dim = focus !== null && !src.includes(focus);
          const sel = zz === z;
          return (
            <g key={sym} className="cursor-pointer" onClick={() => setZ(zz)} opacity={dim ? 0.18 : 1}>
              <rect x={x} y={y} width={CELL_W - 2} height={CELL_H - 2} rx="3" fill={SOURCES[src[0]].color} fillOpacity="0.85" stroke={sel ? 'white' : 'none'} strokeWidth="2" />
              {src[1] && <rect x={x} y={y + CELL_H - 7} width={CELL_W - 2} height={5} fill={SOURCES[src[1]].color} />}
              <text x={x + 3} y={y + 9} fontSize="7" fill="#0f172a" fillOpacity="0.7">
                {zz}
              </text>
              <text x={x + (CELL_W - 2) / 2} y={y + 20} fontSize="11" textAnchor="middle" fill="#0f172a" fontWeight="700">
                {sym}
              </text>
            </g>
          );
        })}

        {/* Легенда */}
        {(Object.keys(SOURCES) as Source[]).map((k, i) => {
          const x = GX + (i % 3) * 200;
          const y = H - 50 + Math.floor(i / 3) * 16;
          return (
            <g key={k} className="cursor-pointer" onClick={() => setFocus(f => (f === k ? null : k))} opacity={focus && focus !== k ? 0.4 : 1}>
              <rect x={x} y={y - 9} width={11} height={11} rx="2" fill={SOURCES[k].color} />
              <text x={x + 15} y={y} fontSize="10" fill="white" fontWeight={focus === k ? 700 : 400}>
                {SOURCES[k].name}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 p-3 rounded-lg bg-violet-50 dark:bg-violet-500/10 text-sm sm:text-base">
        <p className="font-semibold mb-1">
          {z}. {NAMES[z - 1]} ({SYMBOLS[z - 1]}) – {origin.map(s => SOURCES[s].name.toLowerCase()).join(', ')}
        </p>
        <p className="mb-1">{NOTES[z] ?? SOURCES[origin[0]].text}</p>
        {focus && <p className="text-gray-600 dark:text-gray-400">{SOURCES[focus].text}</p>}
      </div>
    </div>
  );
}
