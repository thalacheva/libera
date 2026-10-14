import { useState } from 'react';
import { Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { Slider, Sliders } from '~/functions/plot';
import { configuration, ELEMENTS, LETTER, ORDER, position } from './atomShells';

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (v: number) => String(v).split('').map(d => SUP[Number(d)]).join('');

/** Стрелките в клетките на подслоя: първо по една ↑ във всяка клетка, после ↓ (правило на Хунд). */
function arrows(count: number, cells: number) {
  return Array.from({ length: cells }, (_, i) => [i < count, i + cells < count] as const);
}

// Подреждане на диаграмата: всеки подслой е ред от клетки; по-високите енергии са по-горе
const ROW_Y = [244, 214, 184, 154, 124, 94, 64, 34];
const CELL = 20;

/** Попълване на слоевете и подслоевете с електрони за Z = 1…36 и мястото на елемента в периодичната система. */
export default function ShellFillingLab() {
  const [Z, setZ] = useState(8);
  const conf = configuration(Z);
  const [period, group] = position(Z);
  const [symbol, name] = ELEMENTS[Z - 1];
  const text = ORDER.map(([n, l], i) => (conf[i] ? `${n}${LETTER[l]}${sup(conf[i])}` : ''))
    .filter(Boolean)
    // записът по n: 3d преди 4s
    .sort((a, b) => Number(a[0]) - Number(b[0]) || 'spdf'.indexOf(a[1]) - 'spdf'.indexOf(b[1]))
    .join(' ');
  const outerN = Math.max(...ORDER.filter((_, i) => conf[i] > 0).map(([n]) => n));
  const valence = ORDER.reduce((s, [n], i) => s + (n === outerN ? conf[i] : 0), 0);
  const unpaired = ORDER.reduce((s, [, l], i) => {
    const cells = 2 * l + 1;
    return s + arrows(conf[i], cells).filter(([up, down]) => up && !down).length;
  }, 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <ZoomingSvg viewBox="0 0 480 400">
        <Label p={{ x: 10, y: 14 }} size={10} anchor="start">
          енергия ↑
        </Label>
        {ORDER.map(([n, l], i) => {
          const cells = 2 * l + 1;
          const x0 = 70 + (l === 2 ? 0 : l === 1 ? 40 : 80);
          return (
            <g key={`${n}${l}`}>
              <Label p={{ x: 52, y: ROW_Y[i] }} size={12} anchor="end" tone={conf[i] ? 'blue' : 'gray'}>
                {`${n}${LETTER[l]}`}
              </Label>
              {arrows(conf[i], cells).map(([up, down], k) => {
                const x = x0 + k * CELL;
                return (
                  <g key={k}>
                    <rect x={x} y={ROW_Y[i] - CELL / 2} width={CELL} height={CELL} fill="none" className="stroke-gray-400" strokeWidth="1.2" />
                    {up && (
                      <text x={x + 6} y={ROW_Y[i] + 5} fontSize="14" className="fill-blue-600 dark:fill-blue-400" textAnchor="middle">
                        ↑
                      </text>
                    )}
                    {down && (
                      <text x={x + 14} y={ROW_Y[i] + 5} fontSize="14" className="fill-rose-600 dark:fill-rose-400" textAnchor="middle">
                        ↓
                      </text>
                    )}
                  </g>
                );
              })}
              <Label p={{ x: x0 + cells * CELL + 8, y: ROW_Y[i] }} size={10} anchor="start">
                {`${conf[i]}/${2 * cells}`}
              </Label>
            </g>
          );
        })}

        {/* Елементът */}
        <rect x={330} y={70} width={120} height={130} rx={10} className="fill-blue-50 dark:fill-blue-950/50 stroke-blue-300 dark:stroke-blue-700" strokeWidth="1.5" />
        <text x={342} y={92} fontSize="14" className="fill-gray-500 dark:fill-gray-400">
          {Z}
        </text>
        <text x={390} y={150} fontSize="46" fontWeight={700} textAnchor="middle" className="fill-gray-900 dark:fill-white">
          {symbol}
        </text>
        <text x={390} y={185} fontSize="13" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          {name}
        </text>

        {/* Периодичната система до криптона */}
        <Label p={{ x: 240, y: 288 }} size={11}>
          периодичната система (първите 4 периода)
        </Label>
        {ELEMENTS.map(([s], i) => {
          const [p, g] = position(i + 1);
          const w = 25;
          const x = 15 + (g - 1) * w;
          const y = 300 + (p - 1) * 23;
          const active = i + 1 === Z;
          return (
            <g key={s}>
              <rect
                x={x}
                y={y}
                width={w - 2}
                height={21}
                rx={3}
                className={active ? 'fill-blue-500' : i + 1 < Z ? 'fill-blue-100 dark:fill-blue-900/60' : 'fill-gray-100 dark:fill-gray-700'}
              />
              <text x={x + (w - 2) / 2} y={y + 14.5} fontSize="10" fontWeight={600} textAnchor="middle" className={active ? 'fill-white' : 'fill-gray-700 dark:fill-gray-200'}>
                {s}
              </text>
            </g>
          );
        })}
      </ZoomingSvg>
      <Sliders>
        <Slider label="Z" value={Z} onChange={setZ} min={1} max={36} step={1} />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'елемент:', value: `${symbol} – ${name}`, tone: 'blue' },
            { label: 'конфигурация:', value: text, tone: 'violet' },
            { label: 'период, група:', value: `${period}, ${group}` },
            { label: `електрони в слой n = ${outerN}:`, value: valence, tone: 'emerald' },
            { label: 'несдвоени:', value: unpaired, tone: 'amber' },
          ]}
        />
      </div>
      <Note tone={Z === 24 || Z === 29 ? 'rose' : 'emerald'}>
        {Z === 24 || Z === 29
          ? `Изключение: при ${Z === 24 ? 'хрома' : 'медта'} един електрон от 4s отива в 3d – наполовина или изцяло запълненият 3d подслой е по-изгоден.`
          : [2, 10, 18, 36].includes(Z)
            ? 'Благороден газ: всички подслоеве до този са запълнени – атомът почти не влиза в реакции.'
            : Z >= 21 && Z <= 30
              ? 'Преходен метал: запълва се 3d, а отвън остават 4s електроните – затова тези елементи си приличат.'
              : Z === 19 || Z === 20
                ? 'Подслоят 4s има по-ниска енергия от 3d и се запълва пръв.'
                : 'Всяка клетка е орбитала с най-много два електрона с противоположни спинове (принцип на Паули).'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Подслоевете се запълват по реда на енергията – по правилото на Клечковски (по n + l). В един подслой електроните заемат първо
        различни клетки с еднакъв спин (правило на Хунд). Конфигурацията се записва по n, затова 3d стои преди 4s, макар 4s да се запълва
        първо.
      </p>
    </div>
  );
}
