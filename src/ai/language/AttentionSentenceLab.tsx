import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { attentionMatrix, type HeadId, SENTENCES } from './attentionMath';

const W = 640;
const LEFT = 86;
const ARC = 96; // височина на полето за дъгите
const ROW = 26;

/** Изречение с ръчно нагласени заявки и ключове: дъги от избраната дума и цялата матрица на вниманието, за две „глави“. */
export default function AttentionSentenceLab() {
  const [id, setId] = useState(SENTENCES[0].id);
  const [head, setHead] = useState<HeadId>('meaning');
  const sentence = SENTENCES.find(s => s.id === id) ?? SENTENCES[0];
  const [picked, setPicked] = useState(sentence.focus);
  const words = sentence.words;
  const n = words.length;
  const sel = Math.min(picked, n - 1);
  const m = attentionMatrix(sentence, head);
  const slot = (W - LEFT - 6) / n;
  const cx = (j: number) => LEFT + slot * (j + 0.5);
  const wordY = ARC + 18;
  const gridY = wordY + 14;
  const H = gridY + n * ROW + 8;
  const row = m[sel];
  const uniform = Math.max(...row) - Math.min(...row) < 1e-9;
  const best = row.indexOf(Math.max(...row));

  const focusOf = (s: (typeof SENTENCES)[number], h: HeadId) => (h === 'meaning' ? s.focus : s.gfocus);
  const choose = (sid: string) => {
    const s = SENTENCES.find(x => x.id === sid) ?? SENTENCES[0];
    setId(sid);
    setPicked(focusOf(s, head));
  };
  const chooseHead = (h: HeadId) => {
    setHead(h);
    setPicked(focusOf(sentence, h));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Дъги от избраната дума към останалите */}
        {row.map((w, j) => {
          if (j === sel || w < 0.02) return null;
          const a = cx(sel);
          const b = cx(j);
          const lift = Math.min(ARC - 14, 26 + Math.abs(b - a) * 0.22);
          return <path key={`arc${j}`} d={`M ${a} ${ARC} Q ${(a + b) / 2} ${ARC - lift * 1.7} ${b} ${ARC}`} fill="none" className="stroke-fuchsia-500" strokeWidth={0.6 + 9 * w} opacity={0.3 + 0.7 * w} strokeLinecap="round" />;
        })}
        {row[sel] >= 0.02 && <circle cx={cx(sel)} cy={ARC - 14} r={10} fill="none" className="stroke-fuchsia-500" strokeWidth={0.6 + 9 * row[sel]} opacity={0.3 + 0.7 * row[sel]} />}
        {/* Думите – и заглавия на колоните */}
        {words.map((w, j) => (
          <g key={`w${j}`} onClick={() => setPicked(j)} className="cursor-pointer">
            <rect x={cx(j) - slot / 2 + 1} y={ARC + 2} width={slot - 2} height={22} rx={5} className={j === sel ? 'fill-fuchsia-100 stroke-fuchsia-500 dark:fill-fuchsia-900/50' : 'fill-gray-50 stroke-gray-300 dark:fill-gray-900/40 dark:stroke-gray-600'} />
            <text x={cx(j)} y={wordY} fontSize={n > 7 ? 12 : 13} textAnchor="middle" fontWeight={j === sel ? 'bold' : 'normal'} className="fill-gray-900 dark:fill-gray-100">
              {w.text}
            </text>
          </g>
        ))}
        {/* Матрица на вниманието: ред = коя дума пита, колона = към коя гледа */}
        {m.map((r, i) => (
          <g key={`r${i}`} onClick={() => setPicked(i)} className="cursor-pointer">
            <text x={LEFT - 8} y={gridY + i * ROW + 17} fontSize="12" textAnchor="end" fontWeight={i === sel ? 'bold' : 'normal'} className={i === sel ? 'fill-fuchsia-700 dark:fill-fuchsia-300' : 'fill-gray-600 dark:fill-gray-300'}>
              {words[i].text}
            </text>
            {r.map((w, j) => (
              <g key={j}>
                <rect x={cx(j) - slot / 2 + 1} y={gridY + i * ROW + 1} width={slot - 2} height={ROW - 2} className="fill-white dark:fill-gray-900" />
                <rect x={cx(j) - slot / 2 + 1} y={gridY + i * ROW + 1} width={slot - 2} height={ROW - 2} className="fill-fuchsia-600 dark:fill-fuchsia-400" opacity={w} />
                <text x={cx(j)} y={gridY + i * ROW + 17} fontSize="11" textAnchor="middle" className={w > 0.55 ? 'fill-white dark:fill-gray-900' : 'fill-gray-700 dark:fill-gray-200'}>
                  {Math.round(w * 100)}
                </text>
              </g>
            ))}
            {i === sel && <rect x={LEFT} y={gridY + i * ROW} width={W - LEFT - 6} height={ROW} fill="none" className="stroke-fuchsia-600 dark:stroke-fuchsia-300" strokeWidth="2" />}
          </g>
        ))}
      </LabSvg>
      <Buttons>
        {SENTENCES.map(s => (
          <DiagramButton key={s.id} active={s.id === id} onClick={() => choose(s.id)}>
            {s.label}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        <DiagramButton active={head === 'meaning'} onClick={() => chooseHead('meaning')}>
          глава „по смисъл“
        </DiagramButton>
        <DiagramButton active={head === 'grammar'} onClick={() => chooseHead('grammar')}>
          глава „по граматика“
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'пита', value: `„${words[sel].text}“`, tone: 'violet' },
            { label: 'гледа най-много към', value: uniform ? 'всички поравно' : `„${words[best].text}“ – ${Math.round(row[best] * 100)}%`, tone: uniform ? 'gray' : 'rose' },
            { label: 'тегла в матрицата', value: `${n} × ${n} = ${n * n}` },
          ]}
        />
      </div>
      <Note tone={uniform ? 'gray' : 'emerald'}>
        {uniform ? `В тази глава „${words[sel].text}“ не търси нищо (заявката ѝ е нула) и гледа към всички думи поравно. Избери друга дума или другата глава.` : sel === focusOf(sentence, head) ? sentence.note[head === 'meaning' ? 0 : 1] : 'Числата в реда са проценти и сборът им е 100. Докосни друга дума или ред.'}
      </Note>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">Моделът е играчка: заявките и ключовете са нагласени на ръка. В истински модел те се научават от текст и никой не им дава имена.</p>
    </div>
  );
}
