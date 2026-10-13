import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import type { Point } from '~/geometry/diagramMath';
import { fmtNum } from '~/physics/sim';

// Цветове с дължина на вълната (nm); показателят на пречупване зависи от нея
const COLORS = [
  { name: 'червено', nm: 700, hex: '#e11d48' },
  { name: 'оранжево', nm: 620, hex: '#f97316' },
  { name: 'жълто', nm: 580, hex: '#eab308' },
  { name: 'зелено', nm: 530, hex: '#22c55e' },
  { name: 'синьо', nm: 470, hex: '#3b82f6' },
  { name: 'виолетово', nm: 410, hex: '#8b5cf6' },
];

/** Стъкло (близко до BK7) по формулата на Коши: n = A + B/λ². */
const nGlass = (nm: number, boost = 1) => 1.5046 + (boost * 0.0042) / (nm / 1000) ** 2;
/** Вода: от около 1,331 за червено до 1,343 за виолетово (линейно приближение). */
const nWater = (nm: number) => 1.331 + ((700 - nm) / 300) * 0.012;

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;
const dot = (a: Point, b: Point) => a.x * b.x + a.y * b.y;
const norm = (a: Point): Point => {
  const l = Math.hypot(a.x, a.y);
  return { x: a.x / l, y: a.y / l };
};

/** Пречупване на единичния вектор d през граница с нормала n (към идващата светлина); null при пълно отражение. */
function refract(d: Point, n: Point, eta: number): Point | null {
  let nn = n;
  let c = -dot(nn, d);
  if (c < 0) {
    nn = { x: -n.x, y: -n.y };
    c = -c;
  }
  const k = 1 - eta * eta * (1 - c * c);
  if (k < 0) return null;
  const f = eta * c - Math.sqrt(k);
  return norm({ x: eta * d.x + f * nn.x, y: eta * d.y + f * nn.y });
}
const reflect = (d: Point, n: Point): Point => {
  const k = 2 * dot(d, n);
  return { x: d.x - k * n.x, y: d.y - k * n.y };
};

/** Пресичане на лъч p + t·d с отсечката a–b (t > 0). */
function hitSegment(p: Point, d: Point, a: Point, b: Point) {
  const e = { x: b.x - a.x, y: b.y - a.y };
  const den = d.x * e.y - d.y * e.x;
  if (Math.abs(den) < 1e-9) return null;
  const w = { x: a.x - p.x, y: a.y - p.y };
  const t = (w.x * e.y - w.y * e.x) / den;
  const u = (w.x * d.y - w.y * d.x) / den;
  return t > 1e-6 && u >= 0 && u <= 1 ? { x: p.x + t * d.x, y: p.y + t * d.y } : null;
}

// Призма: равностранен триъгълник с връх нагоре
const P_TOP = { x: 230, y: 40 };
const P_LEFT = { x: 230 - 100, y: 40 + 173.2 };
const P_RIGHT = { x: 230 + 100, y: 40 + 173.2 };

// Капка: кръг с център C и радиус R
const C = { x: 170, y: 150 };
const R = 95;

/** Ъгъл на дъгата (от точката, противоположна на Слънцето) за лъч с ъгъл на падане i и показател n. */
const bowAngle = (iDeg: number, n: number) => {
  const r = toDeg(Math.asin(Math.sin(toRad(iDeg)) / n));
  return 180 - (180 + 2 * iDeg - 4 * r);
};

/** Разлагане на бялата светлина в призма и ход на лъча в дъждовна капка. */
export default function PrismRainbowLab() {
  const [mode, setMode] = useState<'prism' | 'drop'>('prism');
  const [inc, setInc] = useState(50);
  const [i, setI] = useState(59);
  // Истинското разсейване е само около 1,5° – по желание го преувеличаваме на чертежа
  const [boost, setBoost] = useState(1);

  // ---- Призма: лъч към средата на лявата стена, под ъгъл inc от нормалата
  const mid = { x: (P_TOP.x + P_LEFT.x) / 2, y: (P_TOP.y + P_LEFT.y) / 2 };
  const nLeft = norm({ x: P_TOP.y - P_LEFT.y, y: -(P_TOP.x - P_LEFT.x) }); // навън (наляво-нагоре)
  const nRight = norm({ x: P_RIGHT.y - P_TOP.y, y: -(P_RIGHT.x - P_TOP.x) }); // навън (надясно-нагоре)
  // Посоката на падащия лъч: завъртаме −n под ъгъл inc (отдолу на нормалата)
  const a = toRad(inc);
  const inward = { x: -nLeft.x, y: -nLeft.y };
  const dIn = norm({ x: inward.x * Math.cos(a) + inward.y * Math.sin(a), y: -inward.x * Math.sin(a) + inward.y * Math.cos(a) });
  const start = { x: mid.x - dIn.x * 120, y: mid.y - dIn.y * 120 };
  const raysFor = (k: number) => COLORS.map(c => {
    const n = nGlass(c.nm, k);
    const d1 = refract(dIn, nLeft, 1 / n);
    if (!d1) return null;
    const q = hitSegment(mid, d1, P_TOP, P_RIGHT) ?? hitSegment(mid, d1, P_LEFT, P_RIGHT);
    if (!q) return null;
    const onRight = hitSegment(mid, d1, P_TOP, P_RIGHT) !== null;
    const d2 = onRight ? refract(d1, nRight, n) : null;
    const dev = d2 ? toDeg(Math.acos(Math.max(-1, Math.min(1, dot(dIn, d2))))) : null;
    return { c, n, q, d2, dev };
  });
  // На чертежа – с избраното преувеличение, в отчитането – истинските стойности
  const prismRays = raysFor(boost);
  const realRays = raysFor(1);

  // ---- Капка: хоризонтален лъч отляво, на височина b = R·sin i над центъра
  const drop = (n: number) => {
    const sinI = Math.sin(toRad(i));
    const p1 = { x: C.x - R * Math.cos(toRad(i)), y: C.y - R * sinI };
    const d0 = { x: 1, y: 0 };
    const n1 = { x: (p1.x - C.x) / R, y: (p1.y - C.y) / R };
    const d1 = refract(d0, n1, 1 / n)!;
    const t1 = -2 * dot({ x: p1.x - C.x, y: p1.y - C.y }, d1);
    const p2 = { x: p1.x + t1 * d1.x, y: p1.y + t1 * d1.y };
    const n2 = { x: (p2.x - C.x) / R, y: (p2.y - C.y) / R };
    const d2 = reflect(d1, n2);
    const t2 = -2 * dot({ x: p2.x - C.x, y: p2.y - C.y }, d2);
    const p3 = { x: p2.x + t2 * d2.x, y: p2.y + t2 * d2.y };
    const n3 = { x: (p3.x - C.x) / R, y: (p3.y - C.y) / R };
    const d3 = refract(d2, n3, n) ?? d2;
    return { p1, p2, p3, d3, angle: bowAngle(i, n) };
  };
  const red = drop(nWater(700));
  const violet = drop(nWater(410));
  const maxRed = Math.max(...Array.from({ length: 900 }, (_, k) => bowAngle(k / 10, nWater(700))));
  const maxViolet = Math.max(...Array.from({ length: 900 }, (_, k) => bowAngle(k / 10, nWater(410))));

  // Малка графика: ъгъл на дъгата спрямо i
  const G = { left: 330, right: 466, top: 40, bottom: 225 };
  const gx = (iDeg: number) => G.left + (iDeg / 90) * (G.right - G.left);
  const gy = (ang: number) => G.bottom - (ang / 45) * (G.bottom - G.top);
  const curve = (n: number) =>
    Array.from({ length: 91 }, (_, k) => `${k ? 'L' : 'M'} ${gx(k).toFixed(1)} ${gy(Math.max(0, bowAngle(k, n))).toFixed(1)}`).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={mode === 'prism'} onClick={() => setMode('prism')}>
          призма
        </DiagramButton>
        <DiagramButton active={mode === 'drop'} onClick={() => setMode('drop')}>
          дъждовна капка
        </DiagramButton>
      </Buttons>

      {mode === 'prism' ? (
        <ZoomingSvg viewBox="0 0 480 254">
          <polygon points={`${P_TOP.x},${P_TOP.y} ${P_LEFT.x},${P_LEFT.y} ${P_RIGHT.x},${P_RIGHT.y}`} className="fill-teal-50 stroke-teal-500 dark:fill-teal-950" strokeWidth="2" />
          <line x1={start.x} y1={start.y} x2={mid.x} y2={mid.y} className="stroke-gray-500 dark:stroke-gray-300" strokeWidth="4" />
          <Label p={{ x: start.x + 10, y: start.y + 16 }} size={11} anchor="start">
            бяла светлина
          </Label>
          {prismRays.map(
            r =>
              r && (
                <g key={r.c.nm}>
                  <line x1={mid.x} y1={mid.y} x2={r.q.x} y2={r.q.y} stroke={r.c.hex} strokeWidth="1.5" opacity={0.8} />
                  {r.d2 && <line x1={r.q.x} y1={r.q.y} x2={r.q.x + r.d2.x * 140} y2={r.q.y + r.d2.y * 140} stroke={r.c.hex} strokeWidth="3" />}
                </g>
              ),
          )}
          <Label p={{ x: 230, y: 230 }} size={11}>
            стъклена призма
          </Label>
        </ZoomingSvg>
      ) : (
        <ZoomingSvg viewBox="0 0 480 260">
          <circle cx={C.x} cy={C.y} r={R} className="fill-sky-100 stroke-sky-400 dark:fill-sky-950" strokeWidth="2" />
          <line x1={10} y1={red.p1.y} x2={red.p1.x} y2={red.p1.y} className="stroke-gray-500 dark:stroke-gray-300" strokeWidth="3" />
          <Label p={{ x: 14, y: red.p1.y - 12 }} size={11} anchor="start">
            Слънце →
          </Label>
          {[
            [red, '#e11d48'],
            [violet, '#8b5cf6'],
          ].map(([ray, hex]) => {
            const r = ray as typeof red;
            return (
              <g key={hex as string}>
                <polyline points={`${r.p1.x},${r.p1.y} ${r.p2.x},${r.p2.y} ${r.p3.x},${r.p3.y}`} fill="none" stroke={hex as string} strokeWidth="1.8" />
                <line x1={r.p3.x} y1={r.p3.y} x2={r.p3.x + r.d3.x * 120} y2={r.p3.y + r.d3.y * 120} stroke={hex as string} strokeWidth="2.5" />
              </g>
            );
          })}
          {/* Графика: ъгъл спрямо обратната на слънчевите лъчи посока */}
          <line x1={G.left} y1={G.bottom} x2={G.right} y2={G.bottom} className="stroke-gray-400" />
          <line x1={G.left} y1={G.bottom} x2={G.left} y2={G.top} className="stroke-gray-400" />
          <path d={curve(nWater(700))} fill="none" stroke="#e11d48" strokeWidth="2" />
          <path d={curve(nWater(410))} fill="none" stroke="#8b5cf6" strokeWidth="2" />
          <line x1={G.left} y1={gy(42)} x2={G.right} y2={gy(42)} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="3 3" />
          <circle cx={gx(i)} cy={gy(Math.max(0, red.angle))} r={4} fill="#e11d48" />
          <Label p={{ x: G.left - 4, y: gy(42) }} size={10} anchor="end">
            42°
          </Label>
          <Label p={{ x: G.left - 4, y: G.bottom }} size={10} anchor="end">
            0°
          </Label>
          <Label p={{ x: G.left, y: G.bottom + 13 }} size={10}>
            0°
          </Label>
          <Label p={{ x: G.right, y: G.bottom + 13 }} size={10}>
            90°
          </Label>
          <Label p={{ x: (G.left + G.right) / 2, y: G.bottom + 13 }} size={10}>
            ъгъл i
          </Label>
          <Label p={{ x: (G.left + G.right) / 2, y: G.top - 14 }} size={10}>
            ъгъл на дъгата
          </Label>
        </ZoomingSvg>
      )}

      <Sliders>
        {mode === 'prism' ? (
          <Slider label="α, °" value={inc} onChange={setInc} min={28} max={75} step={1} tone="gray" />
        ) : (
          <Slider label="i, °" value={i} onChange={setI} min={5} max={89} step={1} tone="blue" />
        )}
      </Sliders>
      {mode === 'prism' && (
        <Buttons>
          <DiagramButton active={boost === 1} onClick={() => setBoost(1)}>
            истинско разсейване
          </DiagramButton>
          <DiagramButton active={boost === 8} onClick={() => setBoost(8)}>
            преувеличено ×8
          </DiagramButton>
        </Buttons>
      )}
      <div className="mt-3">
        {mode === 'prism' ? (
          <Readout
            items={[
              { label: 'n червено', value: fmtNum(nGlass(700), 4), tone: 'rose' },
              { label: 'n виолетово', value: fmtNum(nGlass(410), 4), tone: 'violet' },
              {
                label: 'отклонение',
                value:
                  realRays[0]?.dev != null && realRays[5]?.dev != null
                    ? `${fmtNum(realRays[0].dev, 1)}° … ${fmtNum(realRays[5].dev, 1)}°`
                    : '—',
              },
            ]}
          />
        ) : (
          <Readout
            items={[
              { label: 'червено', value: `${fmtNum(red.angle, 1)}°`, tone: 'rose' },
              { label: 'виолетово', value: `${fmtNum(violet.angle, 1)}°`, tone: 'violet' },
              { label: 'най-много', value: `${fmtNum(maxRed, 1)}° и ${fmtNum(maxViolet, 1)}°` },
            ]}
          />
        )}
      </div>
      <Note tone="gray">
        {mode === 'prism'
          ? prismRays.some(r => !r?.d2)
            ? 'При толкова малък ъгъл част от цветовете не излизат от втората стена – там има пълно вътрешно отражение.'
            : 'Виолетовата светлина има по-голям показател на пречупване и се отклонява най-силно, червената – най-слабо.'
          : Math.abs(red.angle - maxRed) < 0.6
            ? 'Около i ≈ 59° ъгълът почти не се мени – много лъчи излизат в една посока. Там е дъгата: червеното на 42°, виолетовото на 41°.'
            : 'Премести i към 59°: там ъгълът на изходящия лъч е най-голям и лъчите се натрупват – това прави дъгата ярка.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 {mode === 'prism'
          ? 'α е ъгълът на падане (от нормалата) върху лявата стена. Стойностите на n са за обикновено оптично стъкло. Истинското ветрило от цветове е тясно (около 1,5°), затова на чертежа може да го преувеличиш 8 пъти; числата отдолу винаги са истинските.'
          : 'Слънчевите лъчи влизат в капката, отразяват се веднъж от задната ѝ стена и излизат. Ъгълът на дъгата се мери от точката, противоположна на Слънцето (сянката на главата ти). Графиката показва този ъгъл за червено и виолетово в зависимост от това къде лъчът влиза в капката.'}
      </p>
    </div>
  );
}
