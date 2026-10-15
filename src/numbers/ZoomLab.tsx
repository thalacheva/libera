import { useState } from 'react';
import { Buttons, DiagramButton, Note } from '~/geometry/diagram';

// Цифрите са записани като текст – така няма грешки от закръгляне при силно увеличение.
const NUMBERS = [
  { name: '√2', whole: 1, digits: '414213562373', kind: 'irrational' },
  { name: 'π', whole: 3, digits: '141592653589', kind: 'irrational' },
  { name: '1/7', whole: 0, digits: '142857142857', kind: 'periodic' },
  { name: '3/8', whole: 0, digits: '375', kind: 'finite' },
] as const;

const MAX_ZOOM = 7;
const W = 440;
const L = 30;
const R = W - 30;
const AXIS = 62;
const step = (R - L) / 10;

/** Лупа на числовата ос: всяко увеличение ×10 открива още една цифра на числото. */
export default function ZoomLab() {
  const [which, setWhich] = useState(0);
  const [zoom, setZoom] = useState(0);
  const n = NUMBERS[which];
  const digits = n.digits.padEnd(MAX_ZOOM + 2, '0');

  const left = `${n.whole}${zoom > 0 ? ',' + digits.slice(0, zoom) : ''}`;
  // Следващото деление е left + цифра; точката е между деленията според следващите цифри.
  const nextDigit = Number(digits[zoom]);
  const offset = Number(`${digits[zoom]}.${digits.slice(zoom + 1, zoom + 4)}`);
  const x = L + offset * step;
  const onTick = n.kind === 'finite' && digits.slice(zoom + 1).replace(/0/g, '') === '';
  const tickLabel = (k: number) => (zoom === 0 ? `${n.whole},${k}` : `…${k}`);
  const known = `${n.whole},${digits.slice(0, zoom + 1)}`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {NUMBERS.map((m, i) => (
          <DiagramButton
            key={m.name}
            active={i === which}
            onClick={() => {
              setWhich(i);
              setZoom(0);
            }}
          >
            {m.name}
          </DiagramButton>
        ))}
      </Buttons>

      <svg viewBox={`0 0 ${W} 110`} className="w-full h-auto max-w-xl mx-auto block mt-3 select-none text-gray-800 dark:text-gray-100">
        <text x={L - 10} y={22} fontSize="17" textAnchor="start" fill="currentColor" fontWeight="600">
          {left}
        </text>
        <text x={W / 2} y={22} fontSize="15" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
          {zoom === 0 ? 'деления по 0,1' : `деления по 0,${'0'.repeat(zoom)}1`}
        </text>
        <line x1={L - 10} x2={R + 10} y1={AXIS} y2={AXIS} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" />
        {Array.from({ length: 11 }, (_, k) => (
          <g key={k}>
            <line
              x1={L + k * step}
              x2={L + k * step}
              y1={AXIS - (k % 5 === 0 ? 10 : 6)}
              y2={AXIS + (k % 5 === 0 ? 10 : 6)}
              className="stroke-gray-500 dark:stroke-gray-400"
              strokeWidth={k % 5 === 0 ? 2 : 1.5}
            />
            {k > 0 && k < 10 && (
              <text x={L + k * step} y={AXIS + 30} fontSize="16" textAnchor="middle" fill="currentColor" opacity={k === nextDigit ? 1 : 0.55} fontWeight={k === nextDigit ? 700 : 400}>
                {tickLabel(k)}
              </text>
            )}
          </g>
        ))}
        {/* отсечката, в която е числото – тя става следващият кадър */}
        {!onTick && <rect x={L + nextDigit * step} y={AXIS - 4} width={step} height={8} rx="2" className="fill-amber-400/60" />}
        <circle cx={x} cy={AXIS} r="7" className={onTick ? 'fill-emerald-500' : 'fill-rose-500'} stroke="white" strokeWidth="2" />
        <text x={x} y={AXIS - 14} fontSize="17" fontWeight="700" textAnchor="middle" className={onTick ? 'fill-emerald-600 dark:fill-emerald-400' : 'fill-rose-600 dark:fill-rose-400'}>
          {n.name}
        </text>
      </svg>

      <Buttons>
        <DiagramButton onClick={() => setZoom(Math.max(0, zoom - 1))}>− Намали</DiagramButton>
        <DiagramButton onClick={() => setZoom(Math.min(MAX_ZOOM, zoom + 1))}>Увеличи ×10 +</DiagramButton>
      </Buttons>
      <Note tone={onTick ? 'emerald' : n.kind === 'irrational' ? 'rose' : 'violet'}>
        {onTick
          ? `${n.name} попадна точно върху деление: ${n.name} = ${n.whole},${n.digits}. Крайната десетична дроб свършва – по-нататък има само нули.`
          : zoom === MAX_ZOOM
            ? n.kind === 'periodic'
              ? `${n.name} = ${known}… – групата 142857 се повтаря безкрай: периодична дроб, т.е. рационално число.`
              : `${n.name} = ${known}… Доказано е, че ${n.name} е ирационално: цифрите никога не свършват и никога не започват да се повтарят периодично.`
            : `Увеличение ×${(10 ** zoom).toLocaleString('bg-BG')}: ${n.name} е в жълтата отсечка, значи ${n.name} = ${known}… Натисни „Увеличи“ за следващата цифра.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Всеки кадър е жълтата отсечка от предишния, увеличена 10 пъти. Крайна дроб (3/8) рано или късно попада точно на деление, а 1/7, √2 и π –
        никога. Разликата между 1/7 и √2 е, че цифрите на 1/7 се повтарят.
      </p>
    </div>
  );
}
