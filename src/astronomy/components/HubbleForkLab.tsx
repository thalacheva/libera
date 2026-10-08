import { useState } from 'react';
import { GalaxyDrawing, type GalaxyType } from './GalaxyDrawing';

const W = 640;
const H = 390;

const NODES: { type: GalaxyType; x: number; y: number }[] = [
  { type: 'E0', x: 40, y: 85 },
  { type: 'E3', x: 100, y: 85 },
  { type: 'E7', x: 160, y: 85 },
  { type: 'S0', x: 235, y: 85 },
  { type: 'Sa', x: 320, y: 35 },
  { type: 'Sb', x: 405, y: 35 },
  { type: 'Sc', x: 490, y: 35 },
  { type: 'SBa', x: 320, y: 140 },
  { type: 'SBb', x: 405, y: 140 },
  { type: 'SBc', x: 490, y: 140 },
  { type: 'Irr', x: 585, y: 85 },
];

const INFO: Record<GalaxyType, { name: string; example: string; text: string; stars: string; gas: string }> = {
  E0: { name: 'Елиптична E0 (кръгла)', example: 'M87', stars: 'стари, червени', gas: 'почти няма студен газ', text: 'Звездите обикалят в произволни посоки като рояк пчели. Най-големите галактики във Вселената са елиптични – M87 съдържа трилиони звезди и черна дупка от 6,5 млрд. M☉.' },
  E3: { name: 'Елиптична E3', example: 'M49', stars: 'стари, червени', gas: 'горещ, рентгенов газ', text: 'Числото след E е 10 · (1 − b/a), където b/a е отношението на осите на видимия образ. То зависи и от това как гледаме галактиката.' },
  E7: { name: 'Елиптична E7 (най-сплесканата)', example: 'NGC 3115', stars: 'стари', gas: 'малко', text: 'По-сплескани от E7 елиптични галактики не се наблюдават – по-плоските вече имат диск и са S0.' },
  S0: { name: 'Лещовидна S0', example: 'NGC 5866', stars: 'предимно стари', gas: 'малко', text: 'Преходен тип: има диск и издутина като спиралите, но няма ръкави и почти не ражда звезди. Може би спирални галактики, изгубили газа си в гъстите купове.' },
  Sa: { name: 'Спирална Sa', example: 'Сомбреро (M104)', stars: 'много стари в издутината', gas: 'умерено', text: 'Голяма издутина, плътно навити, гладки ръкави.' },
  Sb: { name: 'Спирална Sb', example: 'Андромеда (M31)', stars: 'смесени', gas: 'много', text: 'Средна издутина и по-отворени ръкави. Ръкавите не са твърди: те са вълни на плътност, през които звездите и газът минават – и в сгъстяването се раждат нови звезди.' },
  Sc: { name: 'Спирална Sc', example: 'M33 (Триъгълник)', stars: 'много млади, сини', gas: 'изобилие', text: 'Малка издутина, широко отворени, „накъсани“ ръкави с много ярки мъглявини (розови точки) – там се раждат звезди.' },
  SBa: { name: 'Спирална с пречка SBa', example: 'NGC 4314', stars: 'смесени', gas: 'умерено', text: 'Ръкавите започват от краищата на пречката – издължена структура от звезди през центъра. Около две трети от спиралните галактики имат пречка.' },
  SBb: { name: 'Спирална с пречка SBb', example: 'Млечният път (SBbc)', stars: 'смесени', gas: 'много', text: 'Такава е нашата Галактика: пречката ѝ се простира на ~5 kpc от центъра (Лекция 26). Пречките насочват газа към центъра и хранят черната дупка.' },
  SBc: { name: 'Спирална с пречка SBc', example: 'NGC 1300', stars: 'млади', gas: 'изобилие', text: 'Малка издутина, отворени ръкави, ясно изразена пречка.' },
  Irr: { name: 'Неправилна Irr', example: 'Магелановите облаци', stars: 'много млади', gas: 'изобилие', text: 'Без симетрия. Често малки галактики, разбъркани от приливните сили на по-голяма съседка. Големият Магеланов облак съдържа мъглявината Тарантула – най-активната област на звездообразуване в Местната група.' },
};

export default function HubbleForkLab() {
  const [type, setType] = useState<GalaxyType>('SBb');
  const [tilt, setTilt] = useState(0);
  const info = INFO[type];
  const spiral = type.startsWith('S') && type !== 'S0';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-indigo-300 dark:border-indigo-600 mb-6">
      <h3 className="font-semibold mb-1 text-center">Камертонът на Хъбъл</h3>
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
        През 1926 г. Хъбъл подрежда галактиките по формата им. Щракнете върху тип. Синьо – млади звезди, жълто-оранжево – стари,
        розово – области, в които се раждат звезди.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950 select-none">
        {/* Линиите на камертона */}
        <path d={`M 40 85 H 235 L 320 35 H 490 M 235 85 L 320 140 H 490`} fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="2" />
        {NODES.map(n => (
          <g key={n.type} className="cursor-pointer" onClick={() => setType(n.type)}>
            <circle cx={n.x} cy={n.y} r={27} fill={n.type === type ? '#1e293b' : 'transparent'} stroke={n.type === type ? '#a5b4fc' : 'none'} />
            <GalaxyDrawing type={n.type} cx={n.x} cy={n.y} r={22} id={`fork-${n.type}`} dots={110} />
            <text x={n.x} y={n.y + 38} fontSize="10" textAnchor="middle" fill="white" fillOpacity="0.8" fontWeight={n.type === type ? 700 : 400}>
              {n.type}
            </text>
          </g>
        ))}
        <text x={100} y={150} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.5">
          елиптични
        </text>
        <text x={405} y={190} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.5">
          спирални с пречка
        </text>
        <text x={405} y={10} fontSize="9" textAnchor="middle" fill="white" fillOpacity="0.5">
          обикновени спирални
        </text>

        {/* Голямото изображение */}
        <line x1={20} x2={W - 20} y1={205} y2={205} stroke="white" strokeOpacity="0.08" />
        <GalaxyDrawing type={type} cx={150} cy={298} r={82} id="fork-big" tilt={spiral ? tilt : 0} dots={520} />
        <g fontSize="11" fill="white" transform="translate(290, 232)">
          <text x={0} y={0} fontSize="14" fontWeight="700" fill="#a5b4fc">
            {info.name}
          </text>
          <text x={0} y={24} fillOpacity="0.85">
            пример: {info.example}
          </text>
          <text x={0} y={44} fillOpacity="0.85">
            звезди: {info.stars}
          </text>
          <text x={0} y={64} fillOpacity="0.85">
            газ и прах: {info.gas}
          </text>
          <text x={0} y={92} fontSize="10" fillOpacity="0.55">
            Камертонът не е еволюционна последователност –
          </text>
          <text x={0} y={106} fontSize="10" fillOpacity="0.55">
            галактиките не се превръщат отляво надясно.
          </text>
          <text x={0} y={120} fontSize="10" fillOpacity="0.55">
            Но сливанията на спирални дават елиптични.
          </text>
        </g>
      </svg>

      {spiral && (
        <>
          <label className="block text-sm font-semibold mt-4 mb-1">Наклон към нас: {Math.round(tilt * 80)}°</label>
          <input type="range" min="0" max="1" step="0.01" value={tilt} onChange={e => setTilt(Number(e.target.value))} className="w-full" />
        </>
      )}
      <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">{info.text}</p>
    </div>
  );
}
