import { useId, useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';

const W = 480;
const H = 232;
const NEAR = 250; // разстояние на най-добро виждане, mm
const LEFT = 18;
const RIGHT = 462;
const CLIP = { top: 6, bottom: H - 34 };

type Pt = { x: number; y: number };

/** Права от точка с наклон m (в mm), начертана от x1 до x2 чрез функция за преобразуване в SVG. */
const along = (p: Pt, m: number, x: number): Pt => ({ x, y: p.y + m * (x - p.x) });

/** Лупа и микроскоп: ход на лъчите през една или две лещи. */
export default function MicroscopeLab() {
  const clipId = useId();
  const [mode, setMode] = useState<'micro' | 'loupe'>('micro');
  const [fOb, setFOb] = useState(6);
  const [fOk, setFOk] = useState(25);
  const [tube, setTube] = useState(160);
  const [fL, setFL] = useState(50);

  // ---------- Микроскоп (всичко в mm, крайният образ – на 25 cm от окуляра) ----------
  const sep = fOb + tube + fOk; // разстояние между обектива и окуляра
  const dOk = 1 / (1 / fOk + 1 / NEAR); // междинният образ е малко преди фокуса на окуляра
  const dImg1 = sep - dOk; // междинният образ от обектива
  const dOb = (fOb * dImg1) / (dImg1 - fOb); // предметът – малко зад фокуса на обектива
  const mOb = dImg1 / dOb;
  const mOk = NEAR / dOk;
  const mTotal = mOb * mOk;
  const mApprox = (tube / fOb) * (NEAR / fOk);

  // ---------- Лупа ----------
  const dL = 1 / (1 / fL + 1 / NEAR);
  const gL = 1 + NEAR / fL;

  // Мащаби: по хоризонтала всичко се събира в чертежа, по вертикала – увеличен мащаб
  const axisY = mode === 'micro' ? 96 : 182;
  const total = mode === 'micro' ? dOb + sep : NEAR + 40;
  const kx = (RIGHT - LEFT - 30) / total;
  const objX = mode === 'micro' ? LEFT + 6 : RIGHT - 70 - dL * kx;
  const hObj = mode === 'micro' ? 70 / mOb : 14; // височина на предмета, px
  const X = (xmm: number) => objX + xmm * kx;
  const Y = (ypx: number) => axisY - ypx; // височините са направо в px

  // Лъчите се пресмятат в смесени единици: x в mm, y в px; наклонът е px/mm – правите остават прави
  type Seg = { a: Pt; b: Pt; dashed?: boolean; tone: string };
  const segs: Seg[] = [];
  let note = '';
  if (mode === 'micro') {
    const xOb = dOb;
    const xOk = dOb + sep;
    const tip: Pt = { x: 0, y: hObj };
    // Лъч 1: успореден → през F′ на обектива
    const a1: Pt = { x: xOb, y: hObj };
    const m1 = -hObj / fOb;
    // Лъч 2: през центъра на обектива
    const m2 = -hObj / dOb;
    const rays = [
      { first: a1, m: m1, tone: 'stroke-rose-500', pre: [tip, a1] as [Pt, Pt] },
      { first: { x: xOb, y: 0 }, m: m2, tone: 'stroke-emerald-500', pre: [tip, { x: xOb, y: 0 }] as [Pt, Pt] },
    ];
    for (const r of rays) {
      segs.push({ a: r.pre[0], b: r.pre[1], tone: r.tone });
      const atOk = along(r.first, r.m, xOk);
      segs.push({ a: r.first, b: atOk, tone: r.tone });
      // Пречупване в окуляра: m′ = m − y/f
      const mOut = r.m - atOk.y / fOk;
      segs.push({ a: atOk, b: along(atOk, mOut, xOk + 60), tone: r.tone });
      // Продължение назад към крайния (въображаем) образ
      segs.push({ a: atOk, b: along(atOk, mOut, xOk - NEAR), dashed: true, tone: r.tone.replace('500', '300') });
    }
    note = `Обективът дава реален, обърнат и увеличен ${fmtNum(mOb, 1)} пъти междинен образ; окулярът го разглежда като лупа и увеличава още ${fmtNum(mOk, 1)} пъти.`;
  } else {
    const tip: Pt = { x: 0, y: hObj };
    const xL = dL;
    const a1: Pt = { x: xL, y: hObj };
    const m1 = -hObj / fL;
    const m2 = -hObj / dL;
    segs.push({ a: tip, b: a1, tone: 'stroke-rose-500' });
    segs.push({ a: a1, b: along(a1, m1, xL + 60), tone: 'stroke-rose-500' });
    segs.push({ a: a1, b: along(a1, m1, xL - NEAR), dashed: true, tone: 'stroke-rose-300' });
    segs.push({ a: tip, b: along({ x: xL, y: 0 }, m2, xL + 60), tone: 'stroke-emerald-500' });
    segs.push({ a: tip, b: along({ x: xL, y: 0 }, m2, xL - NEAR), dashed: true, tone: 'stroke-emerald-300' });
    note = 'Предметът е между лещата и фокуса. Окото вижда прав, увеличен, въображаем образ на 25 cm.';
  }

  const lens = (xmm: number, half: number, name: string) => (
    <g key={name}>
      <path d={`M ${X(xmm)} ${axisY - half} Q ${X(xmm) + 10} ${axisY} ${X(xmm)} ${axisY + half} Q ${X(xmm) - 10} ${axisY} ${X(xmm)} ${axisY - half} Z`} className="fill-sky-200/60 stroke-sky-500 dark:fill-sky-800/40" strokeWidth="1.5" />
      <Label p={{ x: X(xmm), y: Math.max(14, axisY - half - 12) }} size={11} tone="blue">
        {name}
      </Label>
    </g>
  );
  const arrow = (xmm: number, hpx: number, tone: string, dashed = false) => {
    const x = X(xmm);
    const y = Y(hpx);
    const dir = hpx >= 0 ? 1 : -1;
    return (
      <g className={tone}>
        <line x1={x} y1={axisY} x2={x} y2={y + dir * 6} stroke="currentColor" strokeWidth="2.5" strokeDasharray={dashed ? '4 3' : undefined} />
        <polygon points={`${x},${y} ${x - 5},${y + dir * 8} ${x + 5},${y + dir * 8}`} fill="currentColor" />
      </g>
    );
  };

  const imgX = mode === 'micro' ? dOb + dImg1 : dL - NEAR;
  const imgH = mode === 'micro' ? -hObj * mOb : hObj * gL;
  const finalX = mode === 'micro' ? dOb + sep - NEAR : imgX;
  const finalVisible = mode === 'loupe' && X(finalX) > LEFT && Y(imgH) > CLIP.top;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={mode === 'micro'} onClick={() => setMode('micro')}>
          микроскоп
        </DiagramButton>
        <DiagramButton active={mode === 'loupe'} onClick={() => setMode('loupe')}>
          лупа
        </DiagramButton>
      </Buttons>
      <ZoomingSvg viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <clipPath id={clipId}>
            <rect x={LEFT - 12} y={CLIP.top} width={RIGHT - LEFT + 24} height={CLIP.bottom - CLIP.top} />
          </clipPath>
        </defs>
        <line x1={LEFT - 10} y1={axisY} x2={RIGHT + 10} y2={axisY} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.2" />
        <g clipPath={`url(#${clipId})`}>
          {segs.map((s, i) => (
            <line key={i} x1={X(s.a.x)} y1={Y(s.a.y)} x2={X(s.b.x)} y2={Y(s.b.y)} className={s.tone} strokeWidth={s.dashed ? 1.4 : 2} strokeDasharray={s.dashed ? '5 4' : undefined} />
          ))}
          {mode === 'micro' && arrow(imgX, imgH, 'text-blue-600 dark:text-blue-400')}
          {finalVisible && arrow(finalX, imgH, 'text-violet-500', true)}
        </g>
        {arrow(0, hObj, 'text-gray-800 dark:text-gray-100')}
        {mode === 'micro' ? (
          <>
            {lens(dOb, 46, 'обектив')}
            {lens(dOb + sep, 58, 'окуляр')}
            <Label p={{ x: X(imgX), y: Math.min(Y(imgH) + 14, CLIP.bottom - 4) }} size={11} tone="blue">
              междинен образ
            </Label>
            <Label p={{ x: X(0) + 4, y: axisY + 16 }} size={11} anchor="start">
              предмет
            </Label>
          </>
        ) : (
          <>
            {lens(dL, 60, 'лупа')}
            <Label p={{ x: X(0), y: axisY + 14 }} size={11}>
              предмет
            </Label>
            {finalVisible && (
              <Label p={{ x: X(finalX) + 8, y: axisY - 14 }} size={11} tone="violet" anchor="start">
                образ (въображаем)
              </Label>
            )}
          </>
        )}
        <text x={RIGHT + 2} y={axisY} fontSize={18} textAnchor="end" dominantBaseline="central">
          👁️
        </text>
        <Label p={{ x: W / 2, y: H - 14 }} size={11} tone="gray">
          вертикалният мащаб е увеличен
        </Label>
      </ZoomingSvg>

      <Sliders>
        {mode === 'micro' ? (
          <>
            <Slider label="f_об" value={fOb} onChange={setFOb} min={4} max={10} step={1} tone="blue" />
            <Slider label="f_ок" value={fOk} onChange={setFOk} min={15} max={40} step={5} tone="violet" />
            <Slider label="L, mm" value={tube} onChange={setTube} min={120} max={180} step={10} tone="gray" />
          </>
        ) : (
          <Slider label="f, mm" value={fL} onChange={setFL} min={25} max={100} step={5} tone="blue" />
        )}
      </Sliders>
      <div className="mt-3">
        <Readout
          items={
            mode === 'micro'
              ? [
                  { label: 'обектив ×', value: fmtNum(mOb, 1), tone: 'blue' },
                  { label: 'окуляр ×', value: fmtNum(mOk, 1), tone: 'violet' },
                  { label: 'общо ×', value: fmtNum(mTotal, 0) },
                  { label: '(L/f_об)·(250/f_ок) ≈', value: fmtNum(mApprox, 0) },
                ]
              : [
                  { label: 'предметът на', value: `${fmtNum(dL, 1)} mm` },
                  { label: 'Γ = 1 + 250/f =', value: fmtNum(gL, 1), tone: 'violet' },
                  { label: 'образ в ∞: 250/f =', value: fmtNum(NEAR / fL, 1) },
                ]
          }
        />
      </div>
      <Note tone="blue">{note}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Фокусните разстояния f_об и f_ок и дължината L са в милиметри. Крайният образ е на 25 cm пред окуляра – извън чертежа. Червеният лъч тръгва успореден на оста, зеленият минава през центъра на първата леща. L е оптичната дължина на тубуса – между
        задния фокус на обектива и предния фокус на окуляра. Пунктирът е продължението на лъчите назад: там окото „вижда“ крайния образ.
      </p>
    </div>
  );
}
