import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';
import { wavelengthCss } from './wavelengthColor';

const C = { x: 240, y: 232 };
const R = 196;

type Source = 'laser' | 'white' | 'hydrogen' | 'sodium';
const SOURCES: { id: Source; name: string }[] = [
  { id: 'laser', name: 'лазер' },
  { id: 'white', name: 'бяла светлина' },
  { id: 'hydrogen', name: 'водород' },
  { id: 'sodium', name: 'натрий' },
];
// Линиите на водорода в Балмеровата серия и жълтият дублет на натрия, nm
const HYDROGEN = [656, 486, 434, 410];
const SODIUM = [589.0, 589.6];
const WHITE = Array.from({ length: 31 }, (_, i) => 400 + i * 10);

const deg = (rad: number) => (rad * 180) / Math.PI;

/** Дифракционна решетка: светлината се отклонява под ъгли, за които d·sin θ = kλ. */
export default function GratingLab() {
  const [source, setSource] = useState<Source>('laser');
  const [nm, setNm] = useState(532);
  const [N, setN] = useState(600);
  const d = 1e6 / N; // период на решетката, nm

  const lines = source === 'laser' ? [nm] : source === 'white' ? WHITE : source === 'hydrogen' ? HYDROGEN : SODIUM;
  const orders = [-3, -2, -1, 1, 2, 3];
  const angle = (lam: number, k: number) => {
    const s = (k * lam) / d;
    return Math.abs(s) < 1 ? Math.asin(s) : null;
  };
  const at = (th: number, r: number) => ({ x: C.x + r * Math.sin(th), y: C.y - r * Math.cos(th) });
  // Надписът за всеки порядък – при средната линия
  const ref = source === 'laser' ? nm : source === 'white' ? 550 : source === 'hydrogen' ? 486 : 589.3;
  const kMax = Math.ceil(d / ref) - 1;
  // Надписите на порядъците – без онези, които биха се застъпили с вече поставен надпис
  const placed = [{ x: C.x, y: C.y - R - 14 }];
  const labels: { k: number; p: { x: number; y: number } }[] = [];
  for (const k of [1, -1, 2, -2, 3, -3]) {
    const th = angle(ref, k);
    if (th === null) continue;
    const q = at(th, R + 16);
    const p = { x: Math.min(Math.max(q.x, 24), 456), y: Math.min(q.y, C.y - 10) };
    if (placed.some(o => Math.abs(o.x - p.x) < 44 && Math.abs(o.y - p.y) < 16)) continue;
    placed.push(p);
    labels.push({ k, p });
  }

  const readout =
    source === 'laser'
      ? [1, 2].map(k => {
          const th = angle(nm, k);
          return { label: `θ${k === 1 ? '₁' : '₂'} =`, value: th === null ? 'няма' : `${fmtNum(deg(th), 1)}°`, tone: 'violet' as const };
        })
      : source === 'hydrogen'
        ? HYDROGEN.map(l => {
            const th = angle(l, 1);
            return { label: `${l} nm:`, value: th === null ? 'няма' : `${fmtNum(deg(th), 1)}°` };
          })
        : source === 'sodium'
          ? SODIUM.map(l => {
              const th = angle(l, 1);
              return { label: `${fmtNum(l, 1)} nm:`, value: th === null ? 'няма' : `${fmtNum(deg(th), 2)}°` };
            })
          : [400, 700].map(l => {
              const th = angle(l, 1);
              return { label: `k = 1, ${l} nm:`, value: th === null ? 'няма' : `${fmtNum(deg(th), 1)}°` };
            });

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {SOURCES.map(s => (
          <DiagramButton key={s.id} active={s.id === source} onClick={() => setSource(s.id)}>
            {s.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 266">
        {/* Полукръглият екран */}
        <path d={`M ${C.x - R} ${C.y} A ${R} ${R} 0 0 1 ${C.x + R} ${C.y}`} fill="none" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="6" />
        {/* Падащият сноп и решетката */}
        <line x1={C.x} y1={C.y + 26} x2={C.x} y2={C.y} stroke={source === 'laser' ? wavelengthCss(nm) : '#9ca3af'} strokeWidth="4" />
        <line x1={C.x - 22} y1={C.y} x2={C.x + 22} y2={C.y} className="stroke-gray-700 dark:stroke-gray-200" strokeWidth="3" strokeDasharray="2 2" />
        {/* Нулевият порядък – всички цветове заедно */}
        <line x1={C.x} y1={C.y} x2={C.x} y2={C.y - R} stroke={source === 'laser' ? wavelengthCss(nm) : '#d1d5db'} strokeWidth="2" opacity={0.6} />
        <circle cx={C.x} cy={C.y - R} r={6} style={{ fill: source === 'laser' ? wavelengthCss(nm) : '#e5e7eb' }} className="stroke-gray-400" />
        <Label p={{ x: C.x, y: C.y - R - 14 }} size={11}>
          k = 0
        </Label>
        {orders.map(k =>
          lines.map(l => {
            const th = angle(l, k);
            if (th === null) return null;
            const p = at(th, R);
            return (
              <g key={`${k}-${l}`}>
                <line x1={C.x} y1={C.y} x2={p.x} y2={p.y} stroke={wavelengthCss(l)} strokeWidth={source === 'white' ? 1 : 1.5} opacity={source === 'white' ? 0.35 : 0.6} />
                <circle cx={p.x} cy={p.y} r={source === 'white' ? 3.5 : 5} style={{ fill: wavelengthCss(l) }} />
              </g>
            );
          }),
        )}
        {labels.map(({ k, p }) => (
          <Label key={k} p={p} size={11}>
            {`k = ${k > 0 ? k : `−${-k}`}`}
          </Label>
        ))}
        <Label p={{ x: C.x + 30, y: C.y + 18 }} size={10} anchor="start">
          {`решетка: ${N} линии/mm, d = ${fmtNum(d / 1000, 2)} µm`}
        </Label>
      </ZoomingSvg>

      <Sliders>
        {source === 'laser' && <Slider label="λ, nm" value={nm} onChange={setNm} min={400} max={700} step={2} tone="violet" />}
        <Slider label="N, /mm" value={N} onChange={setN} min={100} max={1400} step={25} tone="blue" />
      </Sliders>
      <Buttons>
        <DiagramButton active={N === 625} onClick={() => setN(625)}>
          CD (1,6 µm)
        </DiagramButton>
        <DiagramButton active={N === 1350} onClick={() => setN(1350)}>
          DVD (0,74 µm)
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout items={readout} />
      </div>
      <Note tone="violet">
        {kMax < 1
          ? 'Периодът е по-малък от дължината на вълната – вижда се само нулевият порядък.'
          : source === 'sodium'
            ? 'Двете жълти линии на натрия се различават само с 0,6 nm – отделят се едва при решетка с много линии и голям порядък.'
            : `Червеното се отклонява повече от виолетовото – обратно на призмата. Най-високият възможен порядък тук е k = ${kMax}${kMax > 3 ? ' (на схемата – до 3)' : ''}.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Светлината идва отдолу и минава през решетката. Във всяка посока, в която разликата в пътя между съседни процепи е цяло число
        дължини на вълната (d·sin θ = kλ), вълните от всички процепи се усилват. Колкото повече линии на милиметър, толкова по-голям ъгъл. Бутоните
        CD и DVD задават разстоянието между пистите на диска.
      </p>
    </div>
  );
}
