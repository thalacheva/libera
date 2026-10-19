import LabSvg from '~/LabSvg';

const txt = 'fill-current';
const oxy = 'fill-red-600 dark:fill-red-400';

/** Проекция на Фишер за D-глюкозата: хоризонталните връзки сочат към нас, вертикалните – назад. */
function Fischer() {
  const cx = 70;
  const ys = [50, 80, 110, 140];
  // [вляво, вдясно] за C2…C5 на D-глюкозата
  const sides: [string, string][] = [
    ['H', 'OH'],
    ['HO', 'H'],
    ['H', 'OH'],
    ['H', 'OH'],
  ];
  return (
    <g fontSize="13" fontWeight="600">
      <text x={cx} y={26} textAnchor="middle" className={txt}>
        CHO
      </text>
      <line x1={cx} x2={cx} y1={32} y2={158} className="stroke-current" strokeWidth="1.6" />
      {ys.map((y, i) => (
        <g key={y}>
          <line x1={cx - 28} x2={cx + 28} y1={y} y2={y} className="stroke-current" strokeWidth="1.6" />
          <text x={cx - 32} y={y + 4} textAnchor="end" className={sides[i][0] === 'H' ? txt : oxy}>
            {sides[i][0]}
          </text>
          <text x={cx + 32} y={y + 4} className={sides[i][1] === 'H' ? txt : oxy}>
            {sides[i][1]}
          </text>
        </g>
      ))}
      <text x={cx} y={174} textAnchor="middle" className={txt}>
        CH₂OH
      </text>
      <text x={cx} y={196} fontSize="12" fontWeight="400" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
        отворена верига
      </text>
    </g>
  );
}

/** Формула на Хауърт за D-глюкопиранозата; α – OH при C1 надолу, β – нагоре. */
function Haworth({ ox, beta }: { ox: number; beta: boolean }) {
  const C4 = { x: ox + 10, y: 85 };
  const C5 = { x: ox + 40, y: 50 };
  const O = { x: ox + 92, y: 50 };
  const C1 = { x: ox + 122, y: 85 };
  const C2 = { x: ox + 92, y: 120 };
  const C3 = { x: ox + 40, y: 120 };
  const L = 26;
  const S = 14; // към вътрешността на пръстена връзките са къси, за да не се застъпват надписите
  // [атом, нагоре, надолу, дължина нагоре, дължина надолу]
  const subs: [{ x: number; y: number }, string, string, number, number][] = [
    [C1, beta ? 'OH' : 'H', beta ? 'H' : 'OH', L, L],
    [C2, 'H', 'OH', S, L],
    [C3, 'OH', 'H', S, L],
    [C4, 'H', 'OH', L, L],
    [C5, 'CH₂OH', 'H', L, S],
  ];
  const back = 'stroke-current';
  return (
    <g fontSize="13" fontWeight="600">
      {/* задните ръбове – тънки, предните – дебели (към нас) */}
      <path d={`M ${C4.x} ${C4.y} L ${C5.x} ${C5.y} L ${O.x - 9} ${O.y}`} fill="none" className={back} strokeWidth="1.6" />
      <path d={`M ${O.x + 6} ${O.y + 6} L ${C1.x} ${C1.y}`} fill="none" className={back} strokeWidth="1.6" />
      <path d={`M ${C1.x} ${C1.y} L ${C2.x} ${C2.y} L ${C3.x} ${C3.y} L ${C4.x} ${C4.y}`} fill="none" className={back} strokeWidth="5" strokeLinejoin="round" />
      <text x={O.x} y={O.y + 5} textAnchor="middle" className={oxy}>
        O
      </text>
      {subs.map(([p, up, down, lu, ld], i) => (
        <g key={i}>
          <line x1={p.x} x2={p.x} y1={p.y - lu} y2={p.y + ld} className="stroke-current" strokeWidth="1.4" />
          <text x={p.x} y={p.y - lu - 4} textAnchor="middle" className={up === 'H' ? txt : oxy}>
            {up}
          </text>
          <text x={p.x} y={p.y + ld + 13} textAnchor="middle" className={down === 'H' ? txt : oxy}>
            {down}
          </text>
        </g>
      ))}
      <text x={C1.x + 8} y={C1.y + 4} fontSize="10" fontWeight="400" className="fill-gray-500 dark:fill-gray-400">
        1
      </text>
      <text x={ox + 66} y={196} fontSize="12" fontWeight="400" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
        {beta ? 'β-глюкоза' : 'α-глюкоза'}
      </text>
    </g>
  );
}

/** Трите форми на D-глюкозата: отворена верига и двата пръстена. */
export default function GlucoseForms() {
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 480 205" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <Fischer />
        <text x={150} y={100} fontSize="18" textAnchor="middle" className="fill-gray-500">
          ⇌
        </text>
        <Haworth ox={172} beta={false} />
        <Haworth ox={330} beta />
      </LabSvg>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
        💡 Във вода трите форми непрекъснато преминават една в друга: около 36% α, около 64% β и съвсем малко отворена верига. Групите,
        които във Фишеровата проекция са вдясно, в пръстена (формулата на Хауърт) сочат надолу. Дебелите ръбове са към нас.
      </p>
    </div>
  );
}
