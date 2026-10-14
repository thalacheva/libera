import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';

type Mode = 'two' | 'watch' | 'one';
const MODES: { id: Mode; name: string }[] = [
  { id: 'two', name: 'две цепнатини' },
  { id: 'watch', name: 'с детектор' },
  { id: 'one', name: 'една цепнатина' },
];

const MID = 140;
const SLIT = { x: 40, gap: 30 }; // цепнатините са на MID ∓ gap
const SCR = { x: 196, top: 24, bottom: 256 };
const PROF = { x0: 210, x1: 318 }; // графиката на вероятността – вертикална, като екрана
const PH = { x: 400, y: 140, scale: 120 }; // диаграмата на амплитудите
const D = 56; // разстояние между светлите ивици, px
const HALF = (SCR.bottom - SCR.top) / 2;

/** Обвивка: далеч от средата до екрана стигат по-малко електрони. */
const env = (Y: number) => Math.exp(-((Y / 130) ** 2));
/** Дължина на всяка от двете амплитуди и фазовата разлика между тях в точка Y. */
const amp = (Y: number) => 0.5 * Math.sqrt(env(Y));
const phase = (Y: number) => (2 * Math.PI * Y) / D;

/** Вероятността да попадне в Y (без нормиране) според режима. */
function prob(Y: number, mode: Mode) {
  const a = amp(Y);
  if (mode === 'one') return a * a;
  if (mode === 'watch') return 2 * a * a;
  return 4 * a * a * Math.cos(phase(Y) / 2) ** 2;
}

/** Стрелка от p в посока ъгъл θ (математически, обратно на часовниковата стрелка) с дължина len. */
function Arrow({ x, y, theta, len, className }: { x: number; y: number; theta: number; len: number; className: string }) {
  const tx = x + len * Math.cos(theta);
  const ty = y - len * Math.sin(theta);
  const head = Math.min(8, len * 0.4);
  const a1 = theta + Math.PI - 0.45;
  const a2 = theta + Math.PI + 0.45;
  return (
    <g className={className}>
      <line x1={x} y1={y} x2={tx} y2={ty} strokeWidth={2.5} stroke="currentColor" />
      {len > 2 && (
        <polygon
          points={`${tx},${ty} ${tx + head * Math.cos(a1)},${ty - head * Math.sin(a1)} ${tx + head * Math.cos(a2)},${ty - head * Math.sin(a2)}`}
          fill="currentColor"
        />
      )}
    </g>
  );
}

/** Вероятностите не се събират – събират се амплитудите. Детекторът „коя цепнатина“ премахва интерференцията. */
export default function AmplitudeLab() {
  const [mode, setMode] = useState<Mode>('two');
  const [Y, setY] = useState(14);

  const a = amp(Y);
  const phi = phase(Y);
  const p1 = a * a;
  const pTwo = 4 * a * a * Math.cos(phi / 2) ** 2;
  const p = prob(Y, mode);

  const curve = (m: Mode) =>
    Array.from({ length: 161 }, (_, i) => -HALF + (i / 160) * 2 * HALF)
      .map((y, i) => `${i ? 'L' : 'M'} ${(PROF.x0 + prob(y, m) * (PROF.x1 - PROF.x0)).toFixed(1)} ${(MID + y).toFixed(1)}`)
      .join(' ');

  const L = a * PH.scale;
  const t1 = -phi / 2;
  const t2 = phi / 2;
  const tip1 = { x: PH.x + L * Math.cos(t1), y: PH.y - L * Math.sin(t1) };
  const sumLen = Math.sqrt(pTwo) * PH.scale;
  const deg = (((((phi * 180) / Math.PI) % 360) + 540) % 360) - 180;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {MODES.map(m => (
          <DiagramButton key={m.id} active={m.id === mode} onClick={() => setMode(m.id)}>
            {m.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 530 280">
        {/* Преграда с цепнатини */}
        <g className="fill-gray-600 dark:fill-gray-300">
          <rect x={SLIT.x - 3} y={14} width={6} height={MID - SLIT.gap - 6 - 14} />
          <rect x={SLIT.x - 3} y={MID - SLIT.gap + 6} width={6} height={2 * SLIT.gap - 12} />
          {mode === 'one' ? (
            <rect x={SLIT.x - 3} y={MID + SLIT.gap - 6} width={6} height={266 - MID - SLIT.gap + 6} />
          ) : (
            <rect x={SLIT.x - 3} y={MID + SLIT.gap + 6} width={6} height={266 - MID - SLIT.gap - 6} />
          )}
        </g>
        <Label p={{ x: SLIT.x - 14, y: MID - SLIT.gap }} size={11} tone="blue">
          1
        </Label>
        {mode !== 'one' && (
          <Label p={{ x: SLIT.x - 14, y: MID + SLIT.gap }} size={11} tone="rose">
            2
          </Label>
        )}
        {mode === 'watch' && (
          <>
            <circle cx={SLIT.x + 14} cy={MID - SLIT.gap} r={5} className="fill-amber-400" />
            <circle cx={SLIT.x + 14} cy={MID + SLIT.gap} r={5} className="fill-amber-400" />
            <Label p={{ x: SLIT.x + 24, y: MID }} size={10} anchor="start" tone="amber">
              детектор
            </Label>
          </>
        )}
        {/* Пътищата до точката P */}
        <line x1={SLIT.x} y1={MID - SLIT.gap} x2={SCR.x} y2={MID + Y} className="stroke-blue-500" strokeWidth={1.5} />
        {mode !== 'one' && <line x1={SLIT.x} y1={MID + SLIT.gap} x2={SCR.x} y2={MID + Y} className="stroke-rose-500" strokeWidth={1.5} />}
        {/* Екран */}
        <line x1={SCR.x} y1={SCR.top} x2={SCR.x} y2={SCR.bottom} className="stroke-gray-500 dark:stroke-gray-400" strokeWidth={3} />
        <circle cx={SCR.x} cy={MID + Y} r={5} className="fill-violet-500" />
        <Label p={{ x: SCR.x - 10, y: MID + Y - 12 }} size={11} tone="violet" anchor="end">
          P
        </Label>

        {/* Вероятността по екрана */}
        <line x1={PROF.x0} y1={SCR.top} x2={PROF.x0} y2={SCR.bottom} className="stroke-gray-300 dark:stroke-gray-600" />
        {mode === 'two' && <path d={curve('watch')} fill="none" className="stroke-gray-400" strokeWidth={1.5} strokeDasharray="4 3" />}
        <path d={curve(mode)} fill="none" className="stroke-violet-500" strokeWidth={2} />
        <line x1={PROF.x0} y1={MID + Y} x2={PROF.x0 + p * (PROF.x1 - PROF.x0)} y2={MID + Y} className="stroke-violet-500" strokeWidth={1} strokeDasharray="2 2" />
        <circle cx={PROF.x0 + p * (PROF.x1 - PROF.x0)} cy={MID + Y} r={4} className="fill-violet-500" />
        <Label p={{ x: (PROF.x0 + PROF.x1) / 2, y: 270 }} size={10}>
          вероятност
        </Label>

        {/* Амплитудите като стрелки */}
        <circle cx={PH.x} cy={PH.y} r={PH.scale} fill="none" className="stroke-gray-200 dark:stroke-gray-700" strokeDasharray="3 4" />
        <circle cx={PH.x} cy={PH.y} r={2.5} className="fill-gray-500" />
        {mode === 'two' && (
          <>
            <Arrow x={PH.x} y={PH.y} theta={t1} len={L} className="text-blue-500" />
            <Arrow x={tip1.x} y={tip1.y} theta={t2} len={L} className="text-rose-500" />
            <Arrow x={PH.x} y={PH.y} theta={Math.cos(phi / 2) >= 0 ? 0 : Math.PI} len={sumLen} className="text-violet-500" />
          </>
        )}
        {mode === 'watch' && (
          <>
            <Arrow x={PH.x} y={PH.y} theta={t1} len={L} className="text-blue-500" />
            <Arrow x={PH.x} y={PH.y} theta={t2} len={L} className="text-rose-500" />
          </>
        )}
        {mode === 'one' && <Arrow x={PH.x} y={PH.y} theta={t1} len={L} className="text-blue-500" />}
        <Label p={{ x: PH.x, y: 270 }} size={10}>
          амплитуди
        </Label>
      </ZoomingSvg>

      <Sliders>
        <Slider label="P" value={Y} onChange={setY} min={-110} max={110} step={1} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'Δφ =', value: `${fmtNum(deg, 0)}°` },
            { label: '|ψ₁|² =', value: fmtNum(p1, 3), tone: 'blue' },
            ...(mode === 'one' ? [] : [{ label: '|ψ₂|² =', value: fmtNum(p1, 3), tone: 'rose' as const }]),
            {
              label: mode === 'two' ? '|ψ₁ + ψ₂|² =' : mode === 'watch' ? '|ψ₁|² + |ψ₂|² =' : 'P =',
              value: fmtNum(p, 3),
              tone: 'violet',
            },
          ]}
        />
      </div>
      <Note tone="violet">
        {mode === 'one'
          ? 'С една цепнатина няма какво да интерферира – вероятността се мени плавно.'
          : mode === 'watch'
            ? 'Детекторът оставя следа коя цепнатина е минал електронът. Амплитудите вече не се събират – събират се вероятностите и ивиците изчезват.'
            : Math.abs(deg) > 150
              ? 'Двете амплитуди сочат почти в противоположни посоки и се унищожават – тук електрон почти никога не попада, макар всяка цепнатина поотделно да го пуска.'
              : Math.abs(deg) < 30
                ? 'Двете амплитуди сочат почти еднакво – сборът им е двойно по-дълъг, а вероятността е 4 пъти по-голяма, отколкото от една цепнатина.'
                : 'Събираме стрелките (амплитудите) и чак тогава повдигаме дължината на сбора на квадрат.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Всяка цепнатина дава амплитуда – стрелка с дължина и посока. Посоката зависи от изминатия път, затова в различните точки на екрана
        стрелките са завъртени различно. Сивата пунктирна крива е сборът на вероятностите – какво бихме очаквали, ако електронът минава през
        едната или през другата цепнатина. Мащабът не е реален: в опитите ивиците са на микрометри една от друга.
      </p>
    </div>
  );
}
