import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { sig } from '~/physics/sim';
import { nearestNote, useTone } from './audio';

const V_AIR = 343;

type Mode = 'string' | 'open' | 'closed';
const MODES: { id: Mode; name: string }[] = [
  { id: 'string', name: 'струна' },
  { id: 'open', name: 'отворена тръба' },
  { id: 'closed', name: 'затворена тръба' },
];

// Относителни амплитуди на хармониците 1…6 – грубо приближение на тембъра
const TIMBRES = [
  { name: 'чист тон', amps: [1, 0, 0, 0, 0, 0] },
  { name: 'флейта', amps: [1, 0.4, 0.15, 0.06, 0.03, 0.01] },
  { name: 'цигулка', amps: [1, 0.5, 0.33, 0.25, 0.2, 0.17] },
  { name: 'кларинет', amps: [1, 0, 0.5, 0, 0.3, 0] },
];

const L0 = 40; // левият край на струната/тръбата в SVG
const LEN = 300;
const MID = 70;

/** Стоящи вълни в струна и тръби: хармониците, възлите и пучностите и тембърът. */
export default function HarmonicsLab() {
  const [mode, setMode] = useState<Mode>('string');
  const [L, setL] = useState(0.65);
  const [v, setV] = useState(143);
  const [n, setN] = useState(1);
  const [timbre, setTimbre] = useState(0);
  const [single, setSingle] = useState(false);
  const tone = useTone();

  const speed = mode === 'string' ? v : V_AIR;
  // Затворената в единия край тръба има само нечетни хармоници: (2n − 1)·v/(4L)
  const f1 = mode === 'closed' ? speed / (4 * L) : speed / (2 * L);
  const harmonic = (k: number) => (mode === 'closed' ? 2 * k - 1 : k);
  const fn = harmonic(n) * f1;

  // Спектърът: за затворена тръба четните хармоници липсват
  const spectrum = TIMBRES[timbre].amps.map((a, i) => ({ k: i + 1, amp: mode === 'closed' && (i + 1) % 2 === 0 ? 0 : a }));
  const partials = (m: Mode, base: number, k: number, t: number, s: boolean) => {
    if (s) return [{ freq: (m === 'closed' ? 2 * k - 1 : k) * base, amp: 1 }];
    return TIMBRES[t].amps
      .map((a, i) => ({ freq: (i + 1) * base, amp: m === 'closed' && (i + 1) % 2 === 0 ? 0 : a }))
      .filter(p => p.amp > 0);
  };

  // Всяка промяна обновява звука, ако свири
  const apply = (next: Partial<{ mode: Mode; L: number; v: number; n: number; timbre: number; single: boolean }>) => {
    const s = { mode, L, v, n, timbre, single, ...next };
    const sp = s.mode === 'string' ? s.v : V_AIR;
    const base = s.mode === 'closed' ? sp / (4 * s.L) : sp / (2 * s.L);
    tone.update(partials(s.mode, base, s.n, s.timbre, s.single));
  };
  const chooseMode = (m: Mode) => {
    const nL = m === 'string' ? 0.65 : 0.5;
    setMode(m);
    setL(nL);
    apply({ mode: m, L: nL });
  };

  // Форма на стоящата вълна по дължината (0…1): за струна – възли в краищата,
  // за отворена тръба – пучности в краищата, за затворена – възел в затворения (левия) край
  const shape = (x: number) => {
    const k = harmonic(n);
    if (mode === 'string') return Math.sin(k * Math.PI * x);
    if (mode === 'open') return Math.cos(k * Math.PI * x);
    return Math.sin((k * Math.PI * x) / 2);
  };
  const curve = (phase: number) =>
    Array.from({ length: 121 }, (_, i) => {
      const x = i / 120;
      return `${i ? 'L' : 'M'} ${(L0 + x * LEN).toFixed(1)} ${(MID - 26 * phase * shape(x)).toFixed(1)}`;
    }).join(' ');
  // Възлите (в части от дължината): струна – j/k, отворена тръба – (j + ½)/k, затворена – 2j/k
  const k = harmonic(n);
  const nodes =
    mode === 'string'
      ? Array.from({ length: k + 1 }, (_, j) => j / k)
      : mode === 'open'
        ? Array.from({ length: k }, (_, j) => (j + 0.5) / k)
        : Array.from({ length: Math.floor(k / 2) + 1 }, (_, j) => (2 * j) / k);

  const maxAmp = Math.max(...spectrum.map(s => s.amp));
  const note = nearestNote(single ? fn : f1);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {MODES.map(m => (
          <DiagramButton key={m.id} active={m.id === mode} onClick={() => chooseMode(m.id)}>
            {m.name}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 200">
        {mode === 'string' ? (
          <>
            <rect x={L0 - 8} y={MID - 30} width={8} height={60} className="fill-gray-500" />
            <rect x={L0 + LEN} y={MID - 30} width={8} height={60} className="fill-gray-500" />
          </>
        ) : (
          <>
            <line x1={L0} y1={MID - 32} x2={L0 + LEN} y2={MID - 32} className="stroke-gray-500" strokeWidth="3" />
            <line x1={L0} y1={MID + 32} x2={L0 + LEN} y2={MID + 32} className="stroke-gray-500" strokeWidth="3" />
            {mode === 'closed' && <line x1={L0} y1={MID - 33} x2={L0} y2={MID + 33} className="stroke-gray-500" strokeWidth="6" />}
          </>
        )}
        {[1, 0.5, -0.5, -1].map(ph => (
          <path key={ph} d={curve(ph)} fill="none" className="stroke-blue-500" strokeWidth={Math.abs(ph) === 1 ? 2.5 : 1} opacity={Math.abs(ph) === 1 ? 1 : 0.4} />
        ))}
        {nodes.map(x => (
          <circle key={x} cx={L0 + x * LEN} cy={MID} r={4} className="fill-rose-500" />
        ))}
        <Label p={{ x: L0 + LEN / 2, y: 14 }} size={12}>
          {mode === 'string' ? 'отклонение на струната' : 'трептене на въздуха (отместване)'}
        </Label>
        <Label p={{ x: L0 + LEN + 14, y: MID }} size={11} anchor="start" tone="rose">
          ● възли
        </Label>

        {/* Спектър: хармониците като стълбчета */}
        <line x1={40} y1={182} x2={440} y2={182} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
        {spectrum.map(s => {
          const x = 40 + s.k * 60;
          const h = maxAmp ? (s.amp / maxAmp) * 52 : 0;
          return (
            <g key={s.k}>
              <rect x={x - 12} y={182 - h} width={24} height={Math.max(h, 0.5)} className={single ? 'fill-gray-300 dark:fill-gray-600' : 'fill-violet-500/80'} />
              <Label p={{ x, y: 194 }} size={10} weight={500}>
                {`${sig(s.k * f1, 3)}`}
              </Label>
            </g>
          );
        })}
        <Label p={{ x: 40, y: 122 }} size={11} anchor="start" tone="violet">
          {single ? 'спектър (сега свири само избраният хармоник)' : `спектър: ${TIMBRES[timbre].name}, Hz`}
        </Label>
      </ZoomingSvg>

      <Sliders>
        <Slider
          label="L, m"
          value={L}
          onChange={x => {
            setL(x);
            apply({ L: x });
          }}
          min={mode === 'string' ? 0.3 : 0.2}
          max={mode === 'string' ? 1 : 2}
          step={0.01}
          tone="gray"
        />
        {mode === 'string' && (
          <Slider
            label="v, m/s"
            value={v}
            onChange={x => {
              setV(x);
              apply({ v: x });
            }}
            min={60}
            max={400}
            step={1}
            tone="blue"
          />
        )}
        <Slider
          label="n"
          value={n}
          onChange={x => {
            setN(x);
            apply({ n: x });
          }}
          min={1}
          max={5}
          step={1}
          tone="rose"
        />
      </Sliders>
      <Buttons>
        {TIMBRES.map((t, i) => (
          <DiagramButton
            key={t.name}
            active={!single && i === timbre}
            onClick={() => {
              setTimbre(i);
              setSingle(false);
              apply({ timbre: i, single: false });
            }}
          >
            {t.name}
          </DiagramButton>
        ))}
        <DiagramButton
          active={single}
          onClick={() => {
            setSingle(true);
            apply({ single: true });
          }}
        >
          само n-тия хармоник
        </DiagramButton>
      </Buttons>
      <div className="flex flex-wrap justify-center gap-2 mt-3">
        <button
          onClick={() => (tone.playing ? tone.stop() : tone.start(partials(mode, f1, n, timbre, single)))}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition"
        >
          {tone.playing ? '■ Спри' : '▶ Пусни звука'}
        </button>
      </div>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'f₁ =', value: `${sig(f1, 3)} Hz`, tone: 'violet' },
            { label: `f при n = ${n}:`, value: `${sig(fn, 3)} Hz`, tone: 'rose' },
            { label: 'λ =', value: `${sig(speed / fn, 3)} m`, tone: 'blue' },
            { label: 'нота', value: `${note.name} (${note.latin})` },
          ]}
        />
      </div>
      <Note tone="gray">
        {mode === 'string'
          ? `Струна: fₙ = n·v/(2L). По-къса или по-опъната струна (по-голямо v) звучи по-високо.`
          : mode === 'open'
            ? 'Отворена тръба: в двата края има пучности, fₙ = n·v/(2L) – всички хармоници.'
            : 'Затворена в единия край тръба: f = (2n − 1)·v/(4L) – само нечетните хармоници и октава по-нисък основен тон от отворена тръба със същата дължина.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Горе е n-тият вид трептене (за затворената тръба n-тият по ред възможен тон). Отдолу е спектърът – колко силно звучи всеки
        хармоник. Едни и същи хармоници с различни амплитуди дават различен тембър: затова флейтата и цигулката звучат различно на една и
        съща нота. Амплитудите тук са грубо опростени. 🔈 Преди да пуснеш звука, намали силата на устройството.
      </p>
    </div>
  );
}
