import { useState } from 'react';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum, useSimulation } from '../sim';

const G = 9.81;
const RULER = 0.3;
const PX = 8; // пиксела на сантиметър

type Ruler = { wait: number; y: number; v: number };
type Phase = 'idle' | 'running' | 'caught' | 'early';
type Shown = 'idle' | 'waiting' | 'falling' | 'missed' | 'caught' | 'early';

/** Време на падане от разстоянието: d = gt²/2 ⇒ t = √(2d/g). */
const fallTime = (d: number) => Math.sqrt((2 * d) / G);

const step = (s: Ruler, dt: number): Ruler => {
  if (s.wait > 0) return { ...s, wait: s.wait - dt };
  if (s.y > RULER + 0.05) return s;
  return { wait: 0, y: s.y + s.v * dt + (G * dt * dt) / 2, v: s.v + G * dt };
};

/** Тест за реакция с падаща линийка: колкото по-късно я хванеш, толкова повече е паднала. */
export default function ReactionRulerLab() {
  const sim = useSimulation<Ruler>(() => ({ wait: 0, y: 0, v: 0 }), step, { dt: 1 / 1000 });
  const [phase, setPhase] = useState<Phase>('idle');
  const [results, setResults] = useState<number[]>([]);
  const { wait } = sim.state;
  // След хващане показваме точно записаното положение – анимацията може да мръдне още един кадър
  const y = phase === 'caught' ? results[results.length - 1] : sim.state.y;

  // Докато опитът тече, етапът следва от симулацията; ако линийката падне цялата, опитът е пропуснат
  const shown: Shown = phase !== 'running' ? phase : wait > 0 ? 'waiting' : y > RULER ? 'missed' : 'falling';

  const start = () => {
    // Случайно чакане 1–3 s, за да не можеш да предвидиш момента
    sim.reset({ wait: 1 + 2 * Math.random(), y: 0, v: 0 });
    sim.play();
    setPhase('running');
  };
  const catchIt = () => {
    if (shown === 'waiting') {
      sim.pause();
      setPhase('early');
    } else if (shown === 'falling') {
      sim.pause();
      setPhase('caught');
      setResults([...results, sim.state.y].slice(-8));
    }
  };

  const top = 20;
  const offset = Math.min(y, RULER + 0.05) * 100 * PX;
  const marks = Array.from({ length: 31 }, (_, i) => i);
  const avg = results.length ? results.reduce((s, r) => s + r, 0) / results.length : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 300">
        <g transform={`translate(0 ${offset})`}>
          <rect x={150} y={top} width={60} height={RULER * 100 * PX} rx={3} className="fill-amber-100 stroke-amber-500 dark:fill-amber-900/40" strokeWidth="1.5" />
          {marks.map(cm => (
            <g key={cm}>
              <line x1={150} y1={top + (30 - cm) * PX} x2={150 + (cm % 5 === 0 ? 16 : 8)} y2={top + (30 - cm) * PX} className="stroke-amber-700 dark:stroke-amber-400" />
              {cm % 5 === 0 && (
                <text x={172} y={top + (30 - cm) * PX} fontSize={10} dominantBaseline="central" className="fill-amber-800 dark:fill-amber-300">
                  {cm}
                </text>
              )}
            </g>
          ))}
          {/* Времето, за което линийката пада до това деление */}
          {[0.1, 0.15, 0.2, 0.25].map(t => {
            const cm = (G * t * t * 100) / 2;
            return (
              <g key={t}>
                <line x1={196} y1={top + (30 - cm) * PX} x2={210} y2={top + (30 - cm) * PX} className="stroke-blue-500" strokeWidth="2" />
                <text x={214} y={top + (30 - cm) * PX} fontSize={10} dominantBaseline="central" className="fill-blue-600 dark:fill-blue-400">
                  {`${t * 1000} ms`}
                </text>
              </g>
            );
          })}
        </g>
        {/* Пръстите – долният край на линийката започва при тях */}
        <rect x={120} y={top + RULER * 100 * PX - 6} width={120} height={12} rx={6} className={shown === 'caught' ? 'fill-emerald-500/70' : 'fill-gray-400/60'} />
        <text x={110} y={top + RULER * 100 * PX} fontSize={22} textAnchor="end" dominantBaseline="central">
          ✋
        </text>
        <Label p={{ x: 360, y: 60 }} size={14} tone={shown === 'caught' ? 'emerald' : shown === 'idle' ? 'gray' : 'rose'}>
          {
            {
              idle: 'Натисни „Готов“',
              waiting: 'Внимание…',
              falling: 'Хвани я!',
              caught: `${fmtNum(y * 100, 1)} cm`,
              early: 'Твърде рано!',
              missed: 'Изпусна я!',
            }[shown]
          }
        </Label>
        {shown === 'caught' && (
          <Label p={{ x: 360, y: 88 }} size={22} tone="blue">
            {`${fmtNum(fallTime(y) * 1000, 0)} ms`}
          </Label>
        )}
        <Label p={{ x: 360, y: 250 }} size={11}>
          d = gt²/2
        </Label>
      </ZoomingSvg>

      <div className="flex flex-wrap justify-center gap-2 mt-3">
        <button onClick={start} disabled={shown === 'waiting' || shown === 'falling'} className="px-4 py-2 rounded-lg border text-sm border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-200 disabled:opacity-50">
          {shown === 'idle' ? 'Готов' : 'Отново'}
        </button>
        <button onClick={catchIt} disabled={shown !== 'waiting' && shown !== 'falling'} className="px-8 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition disabled:opacity-50">
          ✊ Хвани!
        </button>
      </div>
      {results.length > 0 && (
        <div className="mt-3">
          <Readout
            items={[
              { label: 'опити', value: String(results.length) },
              { label: 'последен', value: `${fmtNum(fallTime(results[results.length - 1]) * 1000, 0)} ms`, tone: 'blue' },
              { label: 'среден път', value: `${fmtNum(avg * 100, 1)} cm` },
              { label: 'най-добър', value: `${fmtNum(fallTime(Math.min(...results)) * 1000, 0)} ms`, tone: 'emerald' },
            ]}
          />
        </div>
      )}
      <Note tone="gray">Линийката пада свободно: за 0,1 s изминава само 4,9 cm, а за 0,2 s – вече 19,6 cm.</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Натисни „Готов“ и след случайно чакане линийката ще падне – натисни „Хвани!“ възможно най-бързо. От изминатия път пресмятаме
        времето: <i>t</i> = √(2<i>d</i>/<i>g</i>). На екран реакцията е малко по-бавна, отколкото с истинска линийка, защото има закъснение
        и от мишката и монитора. Пробвай с приятел и истинска 30-сантиметрова линийка!
      </p>
    </div>
  );
}
