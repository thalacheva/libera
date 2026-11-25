import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { CAMERA, COLS, collectedCount, HORIZON, plan, POT, reward, type RewardId, REWARDS, ROWS, TRASH, VASE, WALLS } from './safetyMath';

const CELL = 64;
const cx = (pos: number) => (pos % COLS) * CELL + CELL / 2;
const cy = (pos: number) => Math.floor(pos / COLS) * CELL + CELL / 2;
const num = (v: number) => String(v).replace('-', '−');

const VERDICT: Record<RewardId, string> = {
  camera: 'Роботът отива при камерата и я закрива. Камерата вече не вижда боклук – точно както е поискано. Подът е все така мръсен.',
  pickup: 'Роботът стига до най-близкия боклук през вазата, а после го вдига и го връща на пода, докато му свърши времето: 9 точки за един и същ боклук.',
  collected: 'Всичко е събрано за 12 стъпки – по най-късия път, който минава през вазата. За нея наградата не казва нищо.',
  vase: 'Вазата е цяла, но заобиколният път минава през саксията. Забранихме едно нещо, а не всичко, което не искаме.',
  all: 'Чак сега роботът прави това, което сме имали предвид – за 16 стъпки вместо 12. И само защото в тази стая чупливите неща са точно две.',
};

/** Робот чистач в стая 5 × 4: за избраната награда се показва най-добрият възможен план за 20 стъпки. */
export default function SpecLab() {
  const [id, setId] = useState<RewardId>('camera');
  const [t, setT] = useState(HORIZON);

  const p = plan(id);
  const now = p.states[t];
  const score = p.actions.slice(0, t).reduce((s, a, i) => s + reward(id, p.states[i], a), 0);
  const rule = REWARDS.find(r => r.id === id)!.rule;
  const path = p.states.slice(0, t + 1).map(s => `${cx(s.pos)},${cy(s.pos)}`).join(' ');
  const broken = (now.vase ? 1 : 0) + (now.pot ? 1 : 0);
  const good = collectedCount(now.mask) === 3 && broken === 0 && !now.covered;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <p className="text-xs font-semibold text-center text-gray-600 dark:text-gray-300">За какво получава точки роботът:</p>
      <Buttons>
        {REWARDS.map(r => (
          <DiagramButton key={r.id} active={id === r.id} onClick={() => setId(r.id)}>
            {r.label}
          </DiagramButton>
        ))}
      </Buttons>
      <p className="mt-2 mb-3 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">Награда: {rule}.</p>
      <svg viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`} className="block w-full max-w-sm mx-auto select-none" role="img" aria-label="Стая с робот, три боклука, ваза, саксия и камера">
        {Array.from({ length: COLS * ROWS }, (_, pos) => (
          <rect
            key={pos}
            x={(pos % COLS) * CELL + 1}
            y={Math.floor(pos / COLS) * CELL + 1}
            width={CELL - 2}
            height={CELL - 2}
            rx={6}
            className={WALLS.includes(pos) ? 'fill-gray-400 dark:fill-gray-600' : 'fill-gray-50 stroke-gray-200 dark:fill-gray-900/50 dark:stroke-gray-700'}
          />
        ))}
        <polyline points={path} fill="none" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" className="stroke-fuchsia-400/70" />
        <text x={cx(VASE)} y={cy(VASE) + 10} fontSize="28" textAnchor="middle" opacity={now.vase ? 0.9 : 1}>
          {now.vase ? '💥' : '🏺'}
        </text>
        <text x={cx(POT)} y={cy(POT) + 10} fontSize="28" textAnchor="middle">
          {now.pot ? '💥' : '🪴'}
        </text>
        <text x={cx(CAMERA) - 12} y={cy(CAMERA) + 22} fontSize="20" textAnchor="middle">
          {now.covered ? '🙈' : '📷'}
        </text>
        {TRASH.map((pos, i) => (
          <text key={pos} x={cx(pos) + 12} y={cy(pos) + 22} fontSize="20" textAnchor="middle" opacity={(now.mask >> i) & 1 ? 0.15 : 1}>
            🥤
          </text>
        ))}
        <text x={cx(now.pos) - 4} y={cy(now.pos) + 4} fontSize="28" textAnchor="middle">
          🤖
        </text>
      </svg>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">🥤 боклук · 🏺 ваза · 🪴 саксия · 📷 камера · сивите полета са стена</p>
      <Sliders>
        <Slider label="стъпка" value={t} onChange={setT} min={0} max={HORIZON} step={1} tone="violet" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'точки', value: num(score), tone: 'violet' },
            { label: 'събран боклук', value: `${collectedCount(now.mask)} от 3`, tone: 'emerald' },
            { label: 'счупени неща', value: broken, tone: 'rose' },
            { label: 'камерата', value: now.covered ? 'закрита' : 'гледа', tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={t < HORIZON ? 'gray' : good ? 'emerald' : 'rose'}>{t < HORIZON ? 'Премести плъзгача до стъпка 20, за да видиш целия план.' : VERDICT[id]}</Note>
    </div>
  );
}
