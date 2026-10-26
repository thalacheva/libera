import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Sp = { id: string; name: string; x: number; y: number; prey: string[]; color: string };

/** Опростена хранителна мрежа на Черно море: 17 вида и групи, позициите са по трофичното ниво в пълната мрежа. */
const SPECIES: Sp[] = [
  { id: 'phyto', name: 'фитопланктон', x: 170, y: 350, prey: [], color: '#16a34a' },
  { id: 'algae', name: 'водорасли', x: 470, y: 350, prey: [], color: '#16a34a' },
  { id: 'zoo', name: 'зоопланктон', x: 130, y: 270, prey: ['phyto'], color: '#0891b2' },
  { id: 'mussel', name: 'миди', x: 300, y: 270, prey: ['phyto'], color: '#0891b2' },
  { id: 'benthos', name: 'червеи и рачета', x: 500, y: 270, prey: ['algae'], color: '#0891b2' },
  { id: 'aurelia', name: 'медуза', x: 45, y: 190, prey: ['zoo'], color: '#7c3aed' },
  { id: 'mnem', name: 'мнемиопсис', x: 135, y: 190, prey: ['zoo'], color: '#7c3aed' },
  { id: 'anchovy', name: 'хамсия', x: 235, y: 190, prey: ['zoo'], color: '#2563eb' },
  { id: 'sprat', name: 'цаца', x: 330, y: 190, prey: ['zoo'], color: '#2563eb' },
  { id: 'rapana', name: 'рапана', x: 430, y: 190, prey: ['mussel'], color: '#b45309' },
  { id: 'goby', name: 'попче', x: 560, y: 190, prey: ['benthos'], color: '#2563eb' },
  { id: 'beroe', name: 'берое', x: 95, y: 110, prey: ['mnem'], color: '#7c3aed' },
  { id: 'horse', name: 'сафрид', x: 330, y: 136, prey: ['anchovy', 'sprat', 'zoo'], color: '#2563eb' },
  { id: 'gull', name: 'чайка', x: 455, y: 136, prey: ['anchovy', 'sprat', 'mussel'], color: '#64748b' },
  { id: 'turbot', name: 'калкан', x: 560, y: 110, prey: ['anchovy', 'sprat', 'goby'], color: '#2563eb' },
  { id: 'bonito', name: 'паламуд', x: 220, y: 90, prey: ['anchovy', 'sprat', 'horse'], color: '#2563eb' },
  { id: 'dolphin', name: 'делфин', x: 390, y: 50, prey: ['anchovy', 'sprat', 'horse', 'turbot', 'bonito', 'goby'], color: '#334155' },
];
const BY_ID = Object.fromEntries(SPECIES.map(s => [s.id, s]));
const predatorsOf = (id: string) => SPECIES.filter(s => s.prey.includes(id)).map(s => s.id);

const PRESETS: { name: string; removed: string[]; note: string }[] = [
  { name: 'цялата мрежа', removed: [], note: '' },
  { name: 'без фитопланктон', removed: ['phyto'], note: 'Без продуцента в основата изчезва почти всичко над него – остава само веригата, която започва от дънните водорасли.' },
  { name: 'без берое', removed: ['beroe'], note: 'Така е било през 80-те години: мнемиопсисът няма хищник и се размножава масово, изяжда зоопланктона и хайвера – хамсията остава без храна.' },
  { name: 'преулов', removed: ['anchovy', 'sprat'], note: 'Без хамсията и цацата хищниците над тях остават с по-малко храна, а зоопланктонът – без два от консументите си.' },
];

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');
/** Ширина на етикета според името. */
const wOf = (name: string) => Math.max(64, name.length * 6.6 + 14);

/** Хранителна мрежа: махни вид и виж кои изчезват след него, кои се размножават и как се менят трофичните нива. */
export default function FoodWebLab() {
  const [removed, setRemoved] = useState<string[]>([]);
  const [sel, setSel] = useState('anchovy');
  const [presetNote, setPresetNote] = useState('');

  // вторично изчезване: консумент, на когото не е останала никаква храна
  const gone = new Set(removed);
  const extinct = new Set<string>();
  for (let changed = true; changed; ) {
    changed = false;
    for (const s of SPECIES) {
      if (!gone.has(s.id) && s.prey.length && s.prey.every(p => gone.has(p))) {
        gone.add(s.id);
        extinct.add(s.id);
        changed = true;
      }
    }
  }
  const alive = SPECIES.filter(s => !gone.has(s.id));

  // трофично ниво: 1 + средното ниво на оцелялата храна
  const tl: Record<string, number> = {};
  const level = (id: string): number => {
    if (tl[id] !== undefined) return tl[id];
    const food = BY_ID[id].prey.filter(p => !gone.has(p));
    tl[id] = food.length ? 1 + food.reduce((a, p) => a + level(p), 0) / food.length : 1;
    return tl[id];
  };
  // най-дълга верига (брой звена)
  const chain: Record<string, number> = {};
  const longest = (id: string): number => {
    if (chain[id] !== undefined) return chain[id];
    const food = BY_ID[id].prey.filter(p => !gone.has(p));
    chain[id] = food.length ? 1 + Math.max(...food.map(longest)) : 1;
    return chain[id];
  };
  const maxChain = alive.length ? Math.max(...alive.map(s => longest(s.id))) : 0;
  const links = alive.reduce((a, s) => a + s.prey.filter(p => !gone.has(p)).length, 0);

  const status = (id: string) => {
    if (removed.includes(id)) return 'removed';
    if (extinct.has(id)) return 'extinct';
    const lostPrey = BY_ID[id].prey.some(p => gone.has(p));
    const lostPred = predatorsOf(id).some(p => gone.has(p));
    if (lostPrey && lostPred) return 'mixed';
    if (lostPrey) return 'down';
    if (lostPred) return 'up';
    return 'ok';
  };
  const mark = { removed: '✕', extinct: '†', mixed: '↕', down: '↓', up: '↑', ok: '' } as const;

  const toggle = (id: string) => {
    setSel(id);
    setPresetNote('');
    setRemoved(r => (r.includes(id) ? r.filter(x => x !== id) : [...r, id]));
  };

  const s = BY_ID[sel];
  const st = status(sel);
  const names = (ids: string[]) => (ids.length ? ids.map(i => BY_ID[i].name).join(', ') : '–');
  let info: string;
  if (st === 'removed') info = `Махнахме „${s.name}“ от мрежата. Щракни отново, за да го върнеш.`;
  else if (st === 'extinct') info = `„${s.name}“ изчезва, защото не е останало нищо от храната: ${names(s.prey)}. Това е вторично изчезване.`;
  else
    info = `„${s.name}“: трофично ниво ${fmt(level(sel))}. Храни се с: ${names(s.prey.filter(p => !gone.has(p)))}. Хищници: ${names(predatorsOf(sel).filter(p => !gone.has(p)))}.${
      st === 'up' ? ' Някой от хищниците е изчезнал – числеността може да се увеличи.' : ''
    }${st === 'down' ? ' Част от храната е изчезнала – числеността вероятно ще намалее.' : ''}${st === 'mixed' ? ' Загубила е и храна, и хищници – резултатът зависи от силата на връзките.' : ''}`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 380" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {[1, 2, 3, 4].map(n => (
          <g key={n}>
            <line x1={0} x2={640} y1={350 - (n - 1) * 80} y2={350 - (n - 1) * 80} className="stroke-gray-100 dark:stroke-gray-700" strokeDasharray="3 5" />
            <text x={4} y={350 - (n - 1) * 80 - 14} fontSize="10" className="fill-gray-400">
              ниво {n}
            </text>
          </g>
        ))}
        <defs>
          <marker id="fw-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#94a3b8" />
          </marker>
        </defs>
        {SPECIES.flatMap(pred =>
          pred.prey.map(p => {
            const a = BY_ID[p];
            const off = gone.has(p) || gone.has(pred.id);
            const hot = sel === p || sel === pred.id;
            return (
              <line
                key={`${p}-${pred.id}`}
                x1={a.x}
                y1={a.y - 10}
                x2={pred.x}
                y2={pred.y + 12}
                stroke={hot && !off ? '#e11d48' : '#94a3b8'}
                strokeWidth={hot && !off ? 2 : 1.2}
                strokeDasharray={off ? '3 4' : undefined}
                opacity={off ? 0.35 : 0.9}
                markerEnd="url(#fw-arrow)"
              />
            );
          })
        )}
        {SPECIES.map(sp => {
          const stt = status(sp.id);
          const off = stt === 'removed' || stt === 'extinct';
          const W = wOf(sp.name);
          return (
            <g key={sp.id} onClick={() => toggle(sp.id)} className="cursor-pointer">
              <rect
                x={sp.x - W / 2}
                y={sp.y - 10}
                width={W}
                height={22}
                rx={11}
                fill={off ? '#e5e7eb' : sp.color}
                opacity={off ? 0.5 : 1}
                stroke={sel === sp.id ? '#e11d48' : 'none'}
                strokeWidth={2.5}
              />
              <text x={sp.x} y={sp.y + 5} fontSize="11" textAnchor="middle" fill={off ? '#6b7280' : '#fff'} fontWeight="600">
                {sp.name}
              </text>
              {mark[stt] && (
                <text x={sp.x + W / 2 + 2} y={sp.y + 5} fontSize="14" fontWeight="700" fill={stt === 'up' ? '#059669' : stt === 'ok' ? 'none' : stt === 'removed' ? '#6b7280' : '#e11d48'}>
                  {mark[stt]}
                </text>
              )}
            </g>
          );
        })}
      </LabSvg>

      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton
            key={p.name}
            active={removed.length === p.removed.length && p.removed.every(r => removed.includes(r))}
            onClick={() => {
              setRemoved(p.removed);
              setPresetNote(p.note);
              if (p.removed[0]) setSel(p.removed[0] === 'beroe' ? 'mnem' : p.removed[0]);
            }}
          >
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>

      <Readout
        items={[
          { label: 'видове', value: `${alive.length} от ${SPECIES.length}`, tone: 'emerald' },
          { label: 'изчезнали вторично', value: extinct.size, tone: 'rose' },
          { label: 'връзки', value: links, tone: 'blue' },
          { label: 'най-дълга верига', value: `${maxChain} звена`, tone: 'violet' },
        ]}
      />
      <Note tone="blue">{info}</Note>
      {presetNote && <Note tone="rose">{presetNote}</Note>}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Щракни върху вид, за да го махнеш или върнеш. Стрелките сочат накъдето тече енергията – от храната към яжещия. † – изчезнал,
        защото не му е останала храна; ↑ – загубил хищник; ↓ – загубил част от храната си. Трофичното ниво на всеки консумент е 1 + средното
        ниво на храната му, затова не е цяло число. Мрежата е силно опростена: истинската има стотици видове, а детритът и бактериите,
        които разграждат мъртвата органика, не са показани.
      </p>
    </div>
  );
}
