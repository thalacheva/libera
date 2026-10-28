import LabSvg from '~/LabSvg';

type Layer = {
  h: string;
  from: number;
  to: number;
  color: string;
  note: string;
};

// Дебелините (cm) са типични стойности – в природата варират много.
const PROFILES: {
  name: string;
  zone: string;
  layers: Layer[];
  deep?: string;
}[] = [
  {
    name: 'Подзолиста почва',
    zone: 'тайга',
    layers: [
      { h: 'O', from: 0, to: 8, color: '#5b4330', note: '' },
      { h: 'A', from: 8, to: 15, color: '#6f6a62', note: '' },
      { h: 'E', from: 15, to: 42, color: '#d9d4c8', note: 'измит, сивобял' },
      { h: 'B', from: 42, to: 85, color: '#a8642e', note: 'желязо, ръжда' },
      { h: 'C', from: 85, to: 200, color: '#cdb98f', note: 'пясък, морена' },
    ],
  },
  {
    name: 'Чернозем',
    zone: 'степ и лесостеп',
    layers: [
      {
        h: 'A',
        from: 0,
        to: 80,
        color: '#2b2622',
        note: 'дебел, черен – много хумус',
      },
      { h: 'B', from: 80, to: 125, color: '#6e5a43', note: 'карбонати' },
      { h: 'C', from: 125, to: 200, color: '#d9c38a', note: 'льос' },
    ],
  },
  {
    name: 'Фералитна почва',
    zone: 'влажни тропични гори',
    layers: [
      { h: 'A', from: 0, to: 10, color: '#6b3a24', note: 'тънък' },
      {
        h: 'B',
        from: 10,
        to: 200,
        color: '#b9472a',
        note: 'червен – оксиди на Fe и Al, малко хранителни вещества',
      },
    ],
    deep: 'изветряла скала – метри и десетки метри',
  },
];

const Y0 = 46;
const Y1 = 286;
const yOf = (cm: number) => Y0 + (cm / 200) * (Y1 - Y0);
const COLW = 64;
const XS = [70, 270, 470];

/** Три почвени профила една до друга – схема. */
export default function SoilProfiles() {
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 312" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {[0, 50, 100, 150, 200].map(cm => (
          <g key={cm}>
            <line x1={30} y1={yOf(cm)} x2={36} y2={yOf(cm)} className="stroke-gray-500" />
            <text x={26} y={yOf(cm) + 4} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {cm}
            </text>
          </g>
        ))}
        <text x={8} y={Y1 + 18} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
          cm
        </text>
        {PROFILES.map((p, i) => {
          const x = XS[i];
          return (
            <g key={p.name}>
              <text x={x + COLW / 2 + 30} y={16} fontSize="12" fontWeight="600" textAnchor="middle" className="fill-gray-800 dark:fill-gray-100">
                {p.name}
              </text>
              <text x={x + COLW / 2 + 30} y={32} fontSize="10.5" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
                {p.zone}
              </text>
              {p.layers.map(l => (
                <g key={l.h}>
                  <rect x={x} y={yOf(l.from)} width={COLW} height={yOf(l.to) - yOf(l.from)} fill={l.color} />
                  <text
                    x={yOf(l.to) - yOf(l.from) < 14 ? x - 6 : x + COLW / 2}
                    y={(yOf(l.from) + yOf(l.to)) / 2 + 4}
                    fontSize="12"
                    fontWeight="700"
                    textAnchor={yOf(l.to) - yOf(l.from) < 14 ? 'end' : 'middle'}
                    fill={yOf(l.to) - yOf(l.from) < 14 ? undefined : l.color.startsWith('#c') || l.color.startsWith('#d') ? '#333' : '#fff'}
                    className={yOf(l.to) - yOf(l.from) < 14 ? 'fill-gray-700 dark:fill-gray-200' : undefined}
                  >
                    {l.h}
                  </text>
                  {l.note && l.note.length < 22 && (
                    <text x={x + COLW + 6} y={(yOf(l.from) + yOf(l.to)) / 2 + 4} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
                      {l.note}
                    </text>
                  )}
                </g>
              ))}
              <rect x={x} y={Y0} width={COLW} height={Y1 - Y0} fill="none" className="stroke-gray-500" />
            </g>
          );
        })}
        {/* Дългите бележки – на по няколко реда */}
        <text x={XS[0] + COLW + 6} y={yOf(7) + 4} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
          иглички, тънък A
        </text>
        <text x={XS[1] + COLW + 6} y={yOf(30)} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
          <tspan x={XS[1] + COLW + 6}>дебел, черен –</tspan>
          <tspan x={XS[1] + COLW + 6} dy="13">
            много хумус
          </tspan>
        </text>
        <text x={XS[2] + COLW + 6} y={yOf(80)} fontSize="10" className="fill-gray-600 dark:fill-gray-300">
          <tspan x={XS[2] + COLW + 6}>червен – оксиди</tspan>
          <tspan x={XS[2] + COLW + 6} dy="13">
            на желязото и
          </tspan>
          <tspan x={XS[2] + COLW + 6} dy="13">
            алуминия, малко
          </tspan>
          <tspan x={XS[2] + COLW + 6} dy="13">
            хранителни
          </tspan>
          <tspan x={XS[2] + COLW + 6} dy="13">
            вещества
          </tspan>
        </text>
        <text x={630} y={Y1 + 18} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          ↓ {PROFILES[2].deep}
        </text>
      </LabSvg>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        O – горска постеля, A – хумусен хоризонт, E – хоризонт на измиване, B – хоризонт на натрупване, C – почвообразуващата скала. Дебелините са типични
        стойности.
      </p>
    </div>
  );
}
