import { useMemo, useState } from 'react';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { Slider, Sliders } from '~/functions/plot';

type Mode = 'classic' | 'one' | 'zz' | 'zx' | 'zxz';

const MODES: { id: Mode; label: string }[] = [
  { id: 'classic', label: 'класическо очакване' },
  { id: 'one', label: 'опитът (1922 г.)' },
  { id: 'zz', label: 'z, после z' },
  { id: 'zx', label: 'z, после x' },
  { id: 'zxz', label: 'z, x, после z' },
];

/** Магнитите по пътя на снопа: ос и кой изход продължава (другият е спрян). */
const CHAIN: Record<Mode, { axis: 'z' | 'x'; keep: '+' | '−' | 'both' }[]> = {
  classic: [{ axis: 'z', keep: 'both' }],
  one: [{ axis: 'z', keep: 'both' }],
  zz: [{ axis: 'z', keep: '+' }, { axis: 'z', keep: 'both' }],
  zx: [{ axis: 'z', keep: '+' }, { axis: 'x', keep: 'both' }],
  zxz: [{ axis: 'z', keep: '+' }, { axis: 'x', keep: '+' }, { axis: 'z', keep: 'both' }],
};

const ATOMS = 1000;
const DOTS = 500;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** Нормално разпределено число (Бокс–Мюлер). */
const gauss = (rand: () => number) => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());

// Екранът (изглед отпред)
const SC = { x: 405, y: 105, half: 62 };

/** Опитът на Щерн и Герлах: сноп сребърни атоми в нееднородно магнитно поле и последователни магнити. */
export default function SternGerlachLab() {
  const [mode, setMode] = useState<Mode>('one');
  const [g, setG] = useState(1);
  const chain = CHAIN[mode];
  const last = chain[chain.length - 1];
  // Колко атома стигат до последния магнит: всеки филтър пропуска половината
  const arriving = ATOMS / 2 ** (chain.length - 1);
  const split = 42 * g;

  // Точките на екрана – едни и същи при всяко рендериране
  const dots = useMemo(() => {
    const rand = mulberry32(7 + MODES.findIndex(m => m.id === mode));
    const n = Math.round((DOTS * arriving) / ATOMS);
    return Array.from({ length: n }, () => {
      const [wide, narrow] = [7 * gauss(rand), 4 * gauss(rand)];
      // Магнитните моменти са насочени произволно: cos θ е равномерно разпределен в [−1; 1]
      if (mode === 'classic') return { cz: 2 * rand() - 1, cx: 0, dx: wide, dy: narrow };
      const sign = rand() < 0.5 ? 1 : -1;
      return last.axis === 'z' ? { cz: sign, cx: 0, dx: wide, dy: narrow } : { cz: 0, cx: sign, dx: narrow, dy: wide };
    });
  }, [mode, arriving, last.axis]);

  const up = mode === 'zz' ? arriving : mode === 'classic' ? null : arriving / 2;
  const down = mode === 'zz' ? 0 : mode === 'classic' ? null : arriving / 2;

  // Схемата: пещ → магнити → екран
  const y0 = 105;
  const boxW = 46;
  const gap = (300 - 60) / chain.length;
  const bx = (i: number) => 70 + i * gap;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {MODES.map(m => (
          <DiagramButton key={m.id} active={m.id === mode} onClick={() => setMode(m.id)}>
            {m.label}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 210">
        {/* Пещ */}
        <rect x={10} y={y0 - 16} width={34} height={32} rx={4} className="fill-amber-200 dark:fill-amber-800 stroke-amber-500" strokeWidth="1.5" />
        <Label p={{ x: 27, y: y0 + 30 }} size={10}>
          Ag
        </Label>
        <line x1={44} y1={y0} x2={bx(0)} y2={y0} className="stroke-blue-500" strokeWidth="3" />
        {chain.map((m, i) => {
          const x = bx(i);
          const next = i + 1 < chain.length ? bx(i + 1) : 340;
          const spread = m.axis === 'z' ? Math.max(split, 4) * 0.5 : Math.max(split, 4) * 0.35;
          const out = [
            { sign: '+' as const, dy: -spread },
            { sign: '−' as const, dy: spread },
          ];
          return (
            <g key={i}>
              <rect x={x} y={y0 - 26} width={boxW} height={52} rx={5} className="fill-gray-100 dark:fill-gray-700 stroke-gray-500" strokeWidth="1.5" />
              <path d={`M ${x + 6} ${y0 - 26} L ${x + boxW / 2} ${y0 - 10} L ${x + boxW - 6} ${y0 - 26} Z`} className="fill-rose-400" />
              <rect x={x + 6} y={y0 + 14} width={boxW - 12} height={12} className="fill-sky-400" />
              <Label p={{ x: x + boxW / 2, y: y0 - 36 }} size={11} tone="violet">
                {m.axis === 'z' ? 'SG z' : 'SG x'}
              </Label>
              {mode === 'classic' ? (
                <path d={`M ${x + boxW} ${y0} L ${next} ${y0 - spread} L ${next} ${y0 + spread} Z`} className="fill-blue-500/30" />
              ) : (
                out.map(o => {
                  const blocked = m.keep !== 'both' && m.keep !== o.sign;
                  const end = blocked ? x + boxW + 22 : next;
                  const endY = blocked ? y0 + o.dy * 0.6 : i + 1 < chain.length ? y0 : y0 + o.dy;
                  return (
                    <g key={o.sign}>
                      <line
                        x1={x + boxW}
                        y1={y0}
                        x2={end}
                        y2={endY}
                        className={o.sign === '+' ? 'stroke-blue-500' : 'stroke-rose-500'}
                        strokeWidth="2.5"
                        strokeDasharray={m.axis === 'x' ? '6 3' : undefined}
                      />
                      {blocked && <rect x={end - 2} y={endY - 8} width={5} height={16} className="fill-gray-700 dark:fill-gray-300" />}
                      <Label p={{ x: x + boxW + 10, y: y0 + o.dy * 0.6 + (o.dy < 0 ? -9 : 9) }} size={9}>
                        {`${o.sign}${m.axis}`}
                      </Label>
                    </g>
                  );
                })
              )}
            </g>
          );
        })}
        <Label p={{ x: 340, y: y0 + 74 }} size={10} anchor="end">
          {`${ATOMS} атома от пещта`}
        </Label>

        {/* Екранът отпред */}
        <rect x={SC.x - SC.half} y={SC.y - SC.half} width={2 * SC.half} height={2 * SC.half} rx={6} className="fill-gray-50 dark:fill-gray-900 stroke-gray-400" strokeWidth="1.2" />
        <Label p={{ x: SC.x, y: SC.y - SC.half - 12 }} size={10}>
          екранът
        </Label>
        <Label p={{ x: SC.x - SC.half + 8, y: SC.y - SC.half + 10 }} size={9} anchor="start">
          z↑
        </Label>
        <Label p={{ x: SC.x + SC.half - 8, y: SC.y + SC.half - 10 }} size={9} anchor="end">
          x→
        </Label>
        {dots.map((d, i) => (
          <circle key={i} cx={SC.x + d.cx * split + d.dx} cy={SC.y - d.cz * split + d.dy} r={1.3} className="fill-blue-600 dark:fill-blue-400" opacity={0.7} />
        ))}
      </ZoomingSvg>
      <Sliders>
        <Slider label="∂B/∂z" value={g} onChange={setG} min={0} max={1} step={0.05} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={
            up === null || down === null
              ? [{ label: 'очакване:', value: 'непрекъсната ивица', tone: 'amber' }]
              : [
                  { label: 'до последния магнит:', value: `${arriving}`, tone: 'blue' },
                  { label: last.axis === 'z' ? '+z (горе):' : '+x (вдясно):', value: `≈ ${up}`, tone: 'emerald' },
                  { label: last.axis === 'z' ? '−z (долу):' : '−x (вляво):', value: `≈ ${down}`, tone: 'rose' },
                ]
          }
        />
      </div>
      <Note tone={mode === 'classic' ? 'amber' : 'violet'}>
        {mode === 'classic'
          ? 'Ако магнитните моменти на атомите сочеха във всички посоки, всеки щеше да се отклони различно – на екрана щеше да има непрекъсната ивица.'
          : mode === 'one'
            ? 'Опитът показва само две петна: проекцията на магнитния момент върху z има само две стойности – „нагоре“ и „надолу“.'
            : mode === 'zz'
              ? 'Атомите, излезли „+z“ от първия магнит, излизат „+z“ и от втория – всичките. Състоянието е запомнено.'
              : mode === 'zx'
                ? 'Атоми с „+z“ в магнит по x се делят по равно: за x-проекцията им няма определена стойност.'
                : 'Изненадата: след измерване по x атомите „забравят“ +z – третият магнит отново ги дели наполовина.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Нееднородното поле дърпа атома нагоре или надолу според проекцията на магнитния му момент. При среброто моментът идва от спина на
        единствения външен електрон. Плъзгачът намалява градиента на полето – при ∂B/∂z = 0 няма сила и няма разделяне. С пунктир е
        разделянето по x – то е перпендикулярно на чертежа.
      </p>
    </div>
  );
}
