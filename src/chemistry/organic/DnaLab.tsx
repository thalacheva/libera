import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

type Base = 'A' | 'T' | 'G' | 'C';
const PAIR: Record<Base, Base> = { A: 'T', T: 'A', G: 'C', C: 'G' };
const NAME: Record<Base, string> = { A: 'аденин', T: 'тимин', G: 'гуанин', C: 'цитозин' };
const FILL: Record<Base, string> = { A: 'fill-rose-300', T: 'fill-amber-300', G: 'fill-emerald-300', C: 'fill-sky-300' };
const MAX = 12;
const START: Base[] = ['A', 'T', 'G', 'C', 'G', 'A', 'T', 'T', 'C', 'G'];

const fmt = (v: number) => (Math.round(v * 10) / 10).toString().replace('.', ',');

/** Двойна спирала „разгъната“ като стълба: въвеждаш едната верига, другата се строи по комплементарност. */
export default function DnaLab() {
  const [strand, setStrand] = useState<Base[]>(START);
  const n = strand.length;
  const comp = strand.map(b => PAIR[b]);
  const all = [...strand, ...comp];
  const pct = (b: Base) => (all.length ? (100 * all.filter(x => x === b).length) / all.length : 0);
  const at = strand.filter(b => b === 'A' || b === 'T').length;
  const gc = n - at;
  const hBonds = 2 * at + 3 * gc;

  const step = 34;
  const x0 = (480 - Math.max(n, 1) * step) / 2;
  const random = () => setStrand(Array.from({ length: 10 }, () => (['A', 'T', 'G', 'C'] as Base[])[Math.floor(Math.random() * 4)]));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {(['A', 'T', 'G', 'C'] as Base[]).map(b => (
          <DiagramButton key={b} onClick={() => setStrand(s => (s.length < MAX ? [...s, b] : s))}>
            + {b} ({NAME[b]})
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton onClick={() => setStrand(s => s.slice(0, -1))}>← махни</DiagramButton>
        <DiagramButton onClick={random}>случайна верига</DiagramButton>
      </Buttons>

      <LabSvg viewBox="0 0 480 190" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <text x={8} y={42} fontSize="12" fontWeight="600" fill="currentColor">
          5′
        </text>
        <text x={458} y={42} fontSize="12" fontWeight="600" fill="currentColor">
          3′
        </text>
        <text x={8} y={156} fontSize="12" fontWeight="600" fill="currentColor">
          3′
        </text>
        <text x={458} y={156} fontSize="12" fontWeight="600" fill="currentColor">
          5′
        </text>
        {/* гръбнаците: захар–фосфат */}
        {n > 0 && (
          <>
            <line x1={x0 - 4} x2={x0 + n * step + 4} y1={24} y2={24} className="stroke-gray-500" strokeWidth="5" strokeLinecap="round" />
            <line x1={x0 - 4} x2={x0 + n * step + 4} y1={166} y2={166} className="stroke-gray-500" strokeWidth="5" strokeLinecap="round" />
          </>
        )}
        {strand.map((b, i) => {
          const cx = x0 + i * step + step / 2;
          const c = comp[i];
          const k = b === 'A' || b === 'T' ? 2 : 3;
          return (
            <g key={i}>
              <line x1={cx} x2={cx} y1={24} y2={38} className="stroke-gray-500" strokeWidth="2" />
              <line x1={cx} x2={cx} y1={152} y2={166} className="stroke-gray-500" strokeWidth="2" />
              <rect x={cx - 14} y={38} width={28} height={36} rx={4} className={FILL[b]} />
              <rect x={cx - 14} y={116} width={28} height={36} rx={4} className={FILL[c]} />
              <text x={cx} y={61} fontSize="15" fontWeight="700" textAnchor="middle" className="fill-gray-900">
                {b}
              </text>
              <text x={cx} y={139} fontSize="15" fontWeight="700" textAnchor="middle" className="fill-gray-900">
                {c}
              </text>
              {/* водородни връзки – пунктир */}
              {Array.from({ length: k }, (_, j) => {
                const dx = (j - (k - 1) / 2) * 7;
                return <line key={j} x1={cx + dx} x2={cx + dx} y1={78} y2={112} className="stroke-sky-600 dark:stroke-sky-400" strokeWidth="1.6" strokeDasharray="3 3" />;
              })}
            </g>
          );
        })}
        {n === 0 && (
          <text x={240} y={100} fontSize="13" textAnchor="middle" className="fill-gray-500">
            Добави нуклеотиди с бутоните
          </text>
        )}
      </LabSvg>

      <div className="mt-3">
        <Readout
          items={[
            { label: 'верига:', value: `5′-${strand.join('') || '…'}-3′`, tone: 'blue' },
            { label: 'комплементарна:', value: `3′-${comp.join('') || '…'}-5′`, tone: 'rose' },
            { label: 'A / T / G / C:', value: `${fmt(pct('A'))}% / ${fmt(pct('T'))}% / ${fmt(pct('G'))}% / ${fmt(pct('C'))}%` },
            { label: 'водородни връзки:', value: `${at} · 2 + ${gc} · 3 = ${hBonds}`, tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone="emerald">
        {n === 0
          ? 'Празна верига.'
          : `В двойната верига A = T и G = C (правило на Чаргаф). Двойките G–C са ${fmt(n ? (100 * gc) / n : 0)}% – колкото повече са, толкова по-трудно се „разтапя“ ДНК при нагряване.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Двете вериги са антипаралелни: едната върви 5′→3′, другата 3′→5′. Аденинът се свързва с тимина с две водородни връзки, а
        гуанинът с цитозина – с три. Затова процентите в едната верига могат да са всякакви, но в двойната спирала винаги %A = %T и %G = %C.
      </p>
    </div>
  );
}
