import { useEffect, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { AMINO, bg, complement, complementRna, translate } from './geneticCode';

// Първите 9 кодона на гена за β-глобин (кодиращата верига, 5′→3′)
const NORMAL = 'ATGGTGCATCTGACTCCTGAGGAGAAG';
const MAX_LEN = 33;

const PRESETS: { name: string; seq: string; note: string }[] = [
  { name: 'нормален ген', seq: NORMAL, note: 'Началото на гена за β-веригата на хемоглобина. Първият кодон АУГ е стартовият – метионин.' },
  {
    name: 'ЦТГ → ЦТЦ',
    seq: NORMAL.slice(0, 11) + 'C' + NORMAL.slice(12),
    note: 'ЦУГ и ЦУЦ кодират левцин – белтъкът не се променя. Кодът е изроден и много замени на третата база са мълчащи.',
  },
  {
    name: 'ГАГ → ГТГ (сърповидноклетъчна анемия)',
    seq: NORMAL.slice(0, 19) + 'T' + NORMAL.slice(20),
    note: 'Глутаминовата киселина (заредена, хидрофилна) става валин (хидрофобен). Хемоглобинът без кислород се слепва във влакна и еритроцитите стават сърповидни.',
  },
  {
    name: 'ААГ → ТАГ',
    seq: NORMAL.slice(0, 24) + 'T' + NORMAL.slice(25),
    note: 'Кодонът за лизин става стоп кодон УАГ – транслацията спира рано и белтъкът е скъсен. Такива мутации обикновено изключват белтъка.',
  },
  {
    name: 'изтрий 1 нуклеотид',
    seq: NORMAL.slice(0, 7) + NORMAL.slice(8),
    note: 'Без един нуклеотид всички кодони след него се четат „изместени“ – променят се всички следващи аминокиселини, а често скоро се появява и стоп кодон.',
  },
];

type Kind = { label: string; tone: 'emerald' | 'amber' | 'rose' | 'violet' | 'blue' };

/** Какъв е видът мутация спрямо нормалния ген. */
function classify(seq: string): Kind {
  if (seq === NORMAL) return { label: 'няма мутация', tone: 'emerald' };
  const p0 = translate(NORMAL);
  const p = translate(seq);
  const diffLen = seq.length - NORMAL.length;
  if (diffLen % 3 !== 0) return { label: 'изместване на рамката на четене', tone: 'rose' };
  if (p.includes('*') && !p0.includes('*')) return { label: 'нонсенс – ранен стоп кодон', tone: 'rose' };
  if (diffLen !== 0) return { label: diffLen > 0 ? 'вмъкнат цял кодон' : 'изтрит цял кодон', tone: 'amber' };
  const changed = p.filter((a, i) => a !== p0[i]).length;
  if (changed === 0) return { label: 'мълчаща – белтъкът е същият', tone: 'emerald' };
  return { label: changed === 1 ? 'мисенс – една аминокиселина е друга' : `мисенс – ${changed} аминокиселини са други`, tone: 'amber' };
}

const X0 = 46;

/** От ДНК през иРНК до белтък: кликни нуклеотид и го смени, изтрий или вмъкни – и виж какво става с белтъка. */
export default function TranslationLab() {
  const [seq, setSeq] = useState(NORMAL);
  const [sel, setSel] = useState<number | null>(null);
  const [step, setStep] = useState(9);
  const [running, setRunning] = useState(false);
  const [note, setNote] = useState(PRESETS[0].note);

  const protein = translate(seq);
  const normal = translate(NORMAL);
  const nCodons = protein.length;
  const shown = Math.min(step, nCodons);
  const kind = classify(seq);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setStep(s => {
        if (s >= nCodons) {
          setRunning(false);
          return s;
        }
        return s + 1;
      });
    }, 700);
    return () => clearInterval(id);
  }, [running, nCodons]);

  const w = Math.min(19, 560 / Math.max(seq.length, 27));
  const nx = (i: number) => X0 + i * w;
  const rowH = 18;

  const apply = (next: string, text: string) => {
    setSeq(next);
    setSel(null);
    setNote(text);
    setStep(translate(next).length);
    setRunning(false);
  };

  const replace = (b: string) => {
    if (sel === null) return;
    apply(seq.slice(0, sel) + b + seq.slice(sel + 1), 'Замяна на една база (точкова мутация). Виж дали аминокиселината се е променила.');
  };
  const remove = () => {
    if (sel === null || seq.length <= 6) return;
    apply(seq.slice(0, sel) + seq.slice(sel + 1), 'Изтрит нуклеотид. Ако броят на изтритите не е кратен на 3, рамката на четене се измества.');
  };
  const insert = () => {
    if (sel === null || seq.length >= MAX_LEN) return;
    apply(seq.slice(0, sel) + 'A' + seq.slice(sel), 'Вмъкнат нуклеотид А преди избрания. Рамката на четене се измества.');
  };

  // Кодонът под рибозомата
  const cur = shown > 0 && shown <= nCodons ? shown - 1 : null;
  const mrna = seq.replace(/T/g, 'U');

  const yCod = 30;
  const yTem = yCod + rowH + 10;
  const yRna = 132;
  const yTrna = yRna + rowH + 14;
  const yProt = 252;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 290" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* ДНК: двете вериги */}
        <text x={X0} y={yCod - 8} fontSize="11" fontWeight="700" fill="currentColor">
          ДНК – кодираща верига (кликни база)
        </text>
        <text x={X0 - 6} y={yCod + 13} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          5′
        </text>
        <text x={nx(seq.length) + 6} y={yCod + 13} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
          3′
        </text>
        <text x={X0 - 6} y={yTem + 13} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
          3′
        </text>
        <text x={nx(seq.length) + 6} y={yTem + 13} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
          5′
        </text>
        {[...seq].map((b, i) => (
          <g key={i} onClick={() => setSel(sel === i ? null : i)} className="cursor-pointer">
            <rect
              x={nx(i) + 0.5}
              y={yCod}
              width={w - 1}
              height={rowH}
              rx={3}
              className={sel === i ? 'fill-amber-300 stroke-amber-600 dark:fill-amber-500/60' : 'fill-sky-100 stroke-sky-400 dark:fill-sky-500/20'}
              strokeWidth={sel === i ? 2 : 1}
            />
            <text x={nx(i) + w / 2} y={yCod + 13} fontSize="11" fontWeight="600" textAnchor="middle" fill="currentColor">
              {bg(b)}
            </text>
            <line x1={nx(i) + w / 2} x2={nx(i) + w / 2} y1={yCod + rowH} y2={yTem} className="stroke-gray-400" strokeDasharray="2 2" />
            <rect x={nx(i) + 0.5} y={yTem} width={w - 1} height={rowH} rx={3} className="fill-slate-100 stroke-slate-400 dark:fill-slate-500/20" />
            <text x={nx(i) + w / 2} y={yTem + 13} fontSize="11" textAnchor="middle" fill="currentColor">
              {bg(complement(b))}
            </text>
          </g>
        ))}
        <text x={X0} y={yTem + rowH + 14} fontSize="10.5" className="fill-gray-500 dark:fill-gray-400">
          матрична верига – по нея РНК полимеразата строи иРНК
        </text>

        {/* иРНК с кодоните */}
        <text x={X0} y={yRna - 8} fontSize="11" fontWeight="700" fill="currentColor">
          иРНК (5′→3′)
        </text>
        {Array.from({ length: Math.floor(seq.length / 3) }, (_, c) => (
          <rect
            key={c}
            x={nx(c * 3)}
            y={yRna - 2}
            width={3 * w}
            height={rowH + 4}
            rx={4}
            className={c % 2 === 0 ? 'fill-violet-100 dark:fill-violet-500/20' : 'fill-violet-50 dark:fill-violet-500/10'}
          />
        ))}
        {[...mrna].map((b, i) => (
          <text key={i} x={nx(i) + w / 2} y={yRna + 13} fontSize="11" fontWeight="600" textAnchor="middle" className="fill-violet-700 dark:fill-violet-300">
            {bg(b)}
          </text>
        ))}

        {/* Рибозома и тРНК над текущия кодон */}
        {cur !== null && (
          <g>
            <ellipse cx={nx(cur * 3) + 1.5 * w} cy={yRna + 9} rx={2.6 * w} ry={22} className="fill-amber-200/40 stroke-amber-500 dark:fill-amber-400/15" strokeWidth={1.5} />
            {protein[cur] !== '*' ? (
              <>
                {[0, 1, 2].map(k => (
                  <g key={k}>
                    <rect x={nx(cur * 3 + k) + 0.5} y={yTrna} width={w - 1} height={rowH} rx={3} className="fill-emerald-100 stroke-emerald-500 dark:fill-emerald-500/20" />
                    <text x={nx(cur * 3 + k) + w / 2} y={yTrna + 13} fontSize="11" textAnchor="middle" fill="currentColor">
                      {bg(complementRna(mrna[cur * 3 + k]))}
                    </text>
                  </g>
                ))}
                {nx(cur * 3 + 3) + 140 < 636 ? (
                  <text x={nx(cur * 3 + 3) + 6} y={yTrna + 13} fontSize="10.5" className="fill-emerald-700 dark:fill-emerald-300">
                    тРНК, антикодон 3′→5′
                  </text>
                ) : (
                  <text x={nx(cur * 3) - 6} y={yTrna + 13} fontSize="10.5" textAnchor="end" className="fill-emerald-700 dark:fill-emerald-300">
                    тРНК, антикодон 3′→5′
                  </text>
                )}
              </>
            ) : (
              <text x={nx(cur * 3) + 1.5 * w} y={yTrna + 13} fontSize="10.5" textAnchor="middle" className="fill-rose-600 dark:fill-rose-400">
                стоп – няма тРНК
              </text>
            )}
          </g>
        )}

        {/* Белтъкът */}
        <text x={X0} y={yProt - 26} fontSize="11" fontWeight="700" fill="currentColor">
          белтък
        </text>
        {protein.slice(0, shown).map((a, c) => {
          const x = nx(c * 3) + 1.5 * w;
          const changed = a !== normal[c];
          return (
            <g key={c}>
              {c > 0 && <line x1={x - 3 * w + 15} x2={x - 15} y1={yProt} y2={yProt} className="stroke-gray-400" strokeWidth={2} />}
              <circle
                cx={x}
                cy={yProt}
                r={15}
                className={
                  a === '*'
                    ? 'fill-gray-200 stroke-gray-500 dark:fill-gray-600'
                    : changed
                      ? 'fill-rose-200 stroke-rose-600 dark:fill-rose-500/40'
                      : 'fill-amber-100 stroke-amber-500 dark:fill-amber-500/20'
                }
                strokeWidth={changed ? 2 : 1}
              />
              <text x={x} y={yProt + 4} fontSize="10" fontWeight="600" textAnchor="middle" fill="currentColor">
                {AMINO[a].abbr}
              </text>
            </g>
          );
        })}
        {shown === nCodons && protein[nCodons - 1] !== '*' && (
          <text x={nx(nCodons * 3) + 4} y={yProt + 4} fontSize="12" className="fill-gray-500 dark:fill-gray-400">
            …
          </text>
        )}
      </LabSvg>

      <Buttons>
        {PRESETS.map(p => (
          <DiagramButton key={p.name} active={seq === p.seq} onClick={() => apply(p.seq, p.note)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {['A', 'T', 'G', 'C'].map(b => (
          <DiagramButton key={b} onClick={() => replace(b)}>
            {sel === null ? `→ ${bg(b)}` : `${bg(seq[sel])} → ${bg(b)}`}
          </DiagramButton>
        ))}
        <DiagramButton onClick={remove}>изтрий</DiagramButton>
        <DiagramButton onClick={insert}>вмъкни А</DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label={`кодон ${shown}`} value={shown} onChange={v => { setRunning(false); setStep(v); }} min={0} max={nCodons} step={1} tone="violet" />
      </Sliders>
      <Buttons>
        <DiagramButton active={running} onClick={() => { if (!running && shown >= nCodons) setStep(0); setRunning(r => !r); }}>
          {running ? '⏸ Пауза' : '▶ Транслирай'}
        </DiagramButton>
      </Buttons>

      <Readout
        items={[
          { label: 'нуклеотиди', value: seq.length },
          { label: 'аминокиселини', value: protein.filter(a => a !== '*').length, tone: 'amber' },
          { label: 'мутация', value: kind.label, tone: kind.tone },
        ]}
      />
      {cur !== null && (
        <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-2">
          Кодон {cur + 1}: {bg(mrna.slice(cur * 3, cur * 3 + 3))} → {AMINO[protein[cur]].name}
        </p>
      )}
      <Note tone="violet">{sel === null ? note : `Избрана е база ${sel + 1} (${bg(seq[sel])}). Смени я, изтрий я или вмъкни А преди нея.`}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Показани са първите 9 кодона на гена за β-глобин. Розово са аминокиселините, различни от нормалния белтък. иРНК повтаря кодиращата
        верига, но с У вместо Т.
      </p>
    </div>
  );
}
