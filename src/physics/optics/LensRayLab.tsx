import { useId, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';

const W = 480;
const H = 236;
const LENS_X = 250; // лещата
const AXIS_Y = 112; // оптичната ос
const PX = 6; // пиксела на сантиметър
const CLIP = { left: 6, right: W - 6, top: 6, bottom: H - 30 };

const sx = (x: number) => LENS_X + x * PX;
const sy = (y: number) => AXIS_Y - y * PX;

/** Права през две точки (в сантиметри), начертана в SVG координати. */
function Ray({ x1, y1, x2, y2, dashed = false, tone = 'stroke-amber-500' }: { x1: number; y1: number; x2: number; y2: number; dashed?: boolean; tone?: string }) {
  return <line x1={sx(x1)} y1={sy(y1)} x2={sx(x2)} y2={sy(y2)} className={tone} strokeWidth={dashed ? 1.5 : 2} strokeDasharray={dashed ? '5 4' : undefined} />;
}

/** Стрелка-предмет или образ: от оста до височина h при координата x (в cm). */
function ObjArrow({ x, h, tone, dashed = false }: { x: number; h: number; tone: string; dashed?: boolean }) {
  const X = sx(x);
  const Y = sy(h);
  const dir = h >= 0 ? 1 : -1;
  return (
    <g className={tone}>
      <line x1={X} y1={AXIS_Y} x2={X} y2={Y + dir * 7} stroke="currentColor" strokeWidth="3" strokeDasharray={dashed ? '5 3' : undefined} />
      <polygon points={`${X},${Y} ${X - 6},${Y + dir * 9} ${X + 6},${Y + dir * 9}`} fill="currentColor" />
    </g>
  );
}

/** Леща: събирателна или разсейвателна; три характерни лъча и образът. */
export default function LensRayLab() {
  const clipId = useId();
  const [kind, setKind] = useState<'conv' | 'div'>('conv');
  const [fAbs, setFAbs] = useState(10);
  const [d, setD] = useState(25);
  const [h, setH] = useState(3);
  const f = kind === 'conv' ? fAbs : -fAbs;

  // Формула на лещата: 1/f = 1/d + 1/d' (реален образ – d' > 0, въображаем – d' < 0)
  const atInfinity = Math.abs(d - f) < 1e-9;
  const dImg = atInfinity ? Infinity : (f * d) / (d - f);
  const hImg = atInfinity ? 0 : (-h * dImg) / d;
  const gamma = atInfinity ? Infinity : Math.abs(dImg) / d;
  const real = dImg > 0;
  const inView = !atInfinity && sx(dImg) > CLIP.left + 4 && sx(dImg) < CLIP.right - 4 && sy(hImg) > CLIP.top && sy(hImg) < CLIP.bottom;

  // Изходящите лъчи след лещата: y(x) за x > 0
  const xEnd = (CLIP.right - LENS_X) / PX + 2;
  const xStart = (CLIP.left - LENS_X) / PX - 2;
  const y1 = (x: number) => h * (1 - x / f); // успореден лъч → през F'
  const y2 = (x: number) => (-h * x) / d; // през центъра
  const y3 = (-h * f) / (d - f); // през F → успореден

  const marks = [-2 * fAbs, -fAbs, fAbs, 2 * fAbs].filter(x => sx(x) > 14 && sx(x) < W - 14);
  const markName = (x: number) => {
    const two = Math.abs(Math.abs(x) - 2 * fAbs) < 1e-9 ? '2' : '';
    return x < 0 ? `${two}F` : `${two}F′`;
  };

  const describe = atInfinity
    ? 'Предметът е във фокуса: лъчите излизат успоредни – образ няма (той е „в безкрайност“).'
    : `${real ? 'Реален, обърнат' : 'Въображаем, прав'}, ${gamma > 1.0001 ? 'увеличен' : gamma < 0.9999 ? 'умален' : 'със същия размер'}.`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={kind === 'conv'} onClick={() => setKind('conv')}>
          събирателна леща
        </DiagramButton>
        <DiagramButton active={kind === 'div'} onClick={() => setKind('div')}>
          разсейвателна леща
        </DiagramButton>
      </Buttons>
      <ZoomingSvg viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <clipPath id={clipId}>
            <rect x={CLIP.left} y={CLIP.top} width={CLIP.right - CLIP.left} height={CLIP.bottom - CLIP.top} />
          </clipPath>
        </defs>
        {/* Оптичната ос */}
        <line x1={CLIP.left} y1={AXIS_Y} x2={CLIP.right} y2={AXIS_Y} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.2" />
        {/* Лещата */}
        {kind === 'conv' ? (
          <path d={`M ${LENS_X} ${AXIS_Y - 92} Q ${LENS_X + 14} ${AXIS_Y} ${LENS_X} ${AXIS_Y + 92} Q ${LENS_X - 14} ${AXIS_Y} ${LENS_X} ${AXIS_Y - 92} Z`} className="fill-sky-200/60 stroke-sky-500 dark:fill-sky-800/40" strokeWidth="1.5" />
        ) : (
          <path d={`M ${LENS_X - 9} ${AXIS_Y - 92} L ${LENS_X + 9} ${AXIS_Y - 92} Q ${LENS_X + 2} ${AXIS_Y} ${LENS_X + 9} ${AXIS_Y + 92} L ${LENS_X - 9} ${AXIS_Y + 92} Q ${LENS_X - 2} ${AXIS_Y} ${LENS_X - 9} ${AXIS_Y - 92} Z`} className="fill-sky-200/60 stroke-sky-500 dark:fill-sky-800/40" strokeWidth="1.5" />
        )}
        {/* Фокуси */}
        {marks.map(x => (
          <g key={x}>
            <circle cx={sx(x)} cy={AXIS_Y} r={3} className="fill-gray-600 dark:fill-gray-300" />
            {/* Надписът отива над оста, ако под нея на същото място е обърнатият образ */}
            <Label p={{ x: sx(x), y: inView && hImg < 0 && Math.abs(sx(x) - sx(dImg)) < 16 ? AXIS_Y - 12 : AXIS_Y + 14 }} size={11}>
              {markName(x)}
            </Label>
          </g>
        ))}

        <g clipPath={`url(#${clipId})`}>
          {/* 1. Успореден на оста → след лещата през F′ (при разсейвателна – продължението му минава през F′) */}
          <Ray x1={-d} y1={h} x2={0} y2={h} tone="stroke-rose-500" />
          <Ray x1={0} y1={h} x2={xEnd} y2={y1(xEnd)} tone="stroke-rose-500" />
          {/* 2. През оптичния център – не се пречупва */}
          <Ray x1={-d} y1={h} x2={xEnd} y2={y2(xEnd)} tone="stroke-emerald-500" />
          {/* 3. Към F → след лещата успореден на оста */}
          {!atInfinity && (
            <>
              <Ray x1={-d} y1={h} x2={0} y2={y3} tone="stroke-violet-500" />
              <Ray x1={0} y1={y3} x2={xEnd} y2={y3} tone="stroke-violet-500" />
            </>
          )}
          {/* Продълженията назад при въображаем образ */}
          {!atInfinity && !real && (
            <>
              <Ray x1={0} y1={h} x2={Math.max(dImg, xStart)} y2={y1(Math.max(dImg, xStart))} dashed tone="stroke-rose-400" />
              <Ray x1={0} y1={y3} x2={Math.max(dImg, xStart)} y2={y3} dashed tone="stroke-violet-400" />
              {dImg < -d && <Ray x1={-d} y1={h} x2={Math.max(dImg, xStart)} y2={y2(Math.max(dImg, xStart))} dashed tone="stroke-emerald-400" />}
            </>
          )}
          {/* При разсейвателна леща: пунктир от F′ до лещата за първия лъч */}
          {kind === 'div' && <Ray x1={f} y1={0} x2={0} y2={h} dashed tone="stroke-rose-300" />}
          {inView && <ObjArrow x={dImg} h={hImg} tone={real ? 'text-blue-600 dark:text-blue-400' : 'text-blue-400'} dashed={!real} />}
        </g>
        <ObjArrow x={-d} h={h} tone="text-gray-800 dark:text-gray-100" />
        <Label p={{ x: sx(-d), y: sy(h) - 12 }} size={11}>
          предмет
        </Label>
        {inView && (
          <Label p={{ x: sx(dImg), y: hImg >= 0 ? sy(hImg) - 12 : Math.min(sy(hImg) + 14, CLIP.bottom - 4) }} size={11} tone="blue">
            образ
          </Label>
        )}
        <Label p={{ x: W / 2, y: H - 12 }} size={11} tone={inView ? 'gray' : 'amber'}>
          {atInfinity ? 'образът е в безкрайност' : inView ? `d = ${fmtNum(d, 1)} cm, d′ = ${fmtNum(dImg, 1)} cm` : 'образът е извън чертежа'}
        </Label>
      </ZoomingSvg>

      <Sliders>
        <Slider label="d, cm" value={d} onChange={setD} min={2} max={40} step={0.5} tone="gray" />
        <Slider label="h, cm" value={h} onChange={setH} min={1} max={4} step={0.5} tone="gray" />
        <Slider label="|f|, cm" value={fAbs} onChange={setFAbs} min={5} max={15} step={1} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'f =', value: `${fmtNum(f)} cm`, tone: 'blue' },
            { label: "d' =", value: atInfinity ? '∞' : `${fmtNum(dImg, 1)} cm` },
            { label: 'Γ =', value: atInfinity ? '∞' : fmtNum(gamma, 2) },
            { label: 'D =', value: `${fmtNum(100 / f, 1)} dpt`, tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={atInfinity ? 'amber' : real ? 'blue' : 'violet'}>{describe}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Червеният лъч е успореден на оста и след лещата минава през F′, зеленият минава през центъра без да се пречупва, а виолетовият
        минава през F и излиза успореден. Плътна стрелка – реален образ (може да се хване на екран), пунктирна – въображаем (виждаме го само
        през лещата). Мащаб: 6 px на сантиметър.
      </p>
    </div>
  );
}
