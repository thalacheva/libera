import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import { sig } from '~/physics/sim';

const MATERNAL = '#dc2626';
const PATERNAL = '#2563eb';
const LENGTHS = [40, 32, 26, 20];
const ORGANISMS: Record<number, string> = { 4: 'плодова мушица (2n = 8)', 7: 'грах (2n = 14)', 10: 'царевица (2n = 20)', 19: 'котка (2n = 38)', 23: 'човек (2n = 46)', 24: 'шимпанзе (2n = 48)' };

/** Колко различни гамети може да даде един организъм само от случайното разпределение на хромозомите (без кросинговър). */
export default function AssortmentLab() {
  const [n, setN] = useState(3);
  const gametes = 2 ** n;
  const shown = n <= 4;
  const height = shown ? 20 + Math.ceil(gametes / 8) * 104 : 200;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 480 ${height}`} className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {shown ? (
          Array.from({ length: gametes }, (_, g) => {
            const perRow = 8;
            const bw = 54;
            const bh = 92;
            const x = 8 + (g % perRow) * (bw + 4) + (gametes < perRow ? ((perRow - gametes) * (bw + 4)) / 2 : 0);
            const y = 14 + Math.floor(g / perRow) * (bh + 12);
            return (
              <g key={g}>
                <rect x={x} y={y} width={bw} height={bh} rx={10} fill="#fde2e4" stroke="#be123c" strokeWidth="1.5" />
                {Array.from({ length: n }, (_, k) => {
                  // k-тият бит на номера на гаметата казва дали k-тата хромозома е от майката или от бащата
                  const maternal = ((g >> (n - 1 - k)) & 1) === 0;
                  const cx = x + bw / 2 + (k - (n - 1) / 2) * 11;
                  return (
                    <rect
                      key={k}
                      x={cx - 3.5}
                      y={y + bh / 2 - LENGTHS[k] / 2}
                      width={7}
                      height={LENGTHS[k]}
                      rx={3.5}
                      fill={maternal ? MATERNAL : PATERNAL}
                    />
                  );
                })}
              </g>
            );
          })
        ) : (
          <g>
            <text x={240} y={90} fontSize="44" fontWeight="700" textAnchor="middle" fill="currentColor">
              2<tspan dy="-18" fontSize="26">{n}</tspan>
              <tspan dy="18"> = {sig(gametes, 4)}</tspan>
            </text>
            <text x={240} y={130} fontSize="14" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              различни гамети – твърде много, за да ги нарисуваме
            </text>
            {ORGANISMS[n] && (
              <text x={240} y={160} fontSize="14" fontWeight="600" textAnchor="middle" fill="#be123c">
                {ORGANISMS[n]}
              </text>
            )}
          </g>
        )}
      </LabSvg>

      <Sliders>
        <Slider label={`n = ${n}`} value={n} onChange={setN} min={1} max={24} step={1} tone="rose" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'двойки хромозоми', value: n },
            { label: 'гамети', value: sig(gametes, 4) },
            { label: 'зиготи от една двойка родители', value: sig(gametes * gametes, 3) },
          ]}
        />
      </div>
      <Note tone="violet">
        Всяка двойка се подрежда в метафаза I независимо от другите: майчината хромозома може да отиде към единия или към другия полюс.
        Затова при n двойки има 2<sup>n</sup> възможни гамети. Шансът дете да получи от майка си точно нейните хромозоми от баба си е
        само 1 : {sig(gametes, 4)}.
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Червено – хромозомите, които организмът е получил от майка си, синьо – от баща си; двойките се различават по дължина. Кросинговърът добавя още много повече
        комбинации, затова в действителност гаметите на един човек практически никога не са еднакви.
      </p>
    </div>
  );
}
