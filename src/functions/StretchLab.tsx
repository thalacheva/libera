import { useState } from 'react';
import { Buttons, DiagramButton, Formula, Note } from '~/geometry/diagram';
import { num } from './functionMath';
import { Curve, Plot, Slider, Sliders } from './plot';

const BASES = [
  { name: 'x²', f: (x: number) => x * x, parity: 'четна' },
  { name: '|x|', f: Math.abs, parity: 'четна' },
  { name: 'x³', f: (x: number) => x ** 3, parity: 'нечетна' },
  { name: '√x', f: Math.sqrt, parity: 'нито четна, нито нечетна' },
  { name: 'sin x', f: Math.sin, parity: 'нечетна' },
];

const inner = (b: number, base: string) => {
  const bx = b === 1 ? 'x' : b === -1 ? '−x' : `${num(b)}x`;
  if (base === 'x²') return b === 1 ? 'x²' : `(${bx})²`;
  if (base === 'x³') return b === 1 ? 'x³' : `(${bx})³`;
  if (base === '|x|') return `|${bx}|`;
  if (base === '√x') return b === 1 ? '√x' : `√(${bx})`;
  return `sin(${bx})`;
};

/** Разтягане и свиване: y = a · f(b · x). */
export function StretchLab() {
  const [bi, setBi] = useState(4);
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);
  const base = BASES[bi];
  const g = (x: number) => a * base.f(b * x);
  const formula = `${a === 1 ? '' : a === -1 ? '−' : `${num(a)} · `}${inner(b, base.name)}`;

  const notes = [
    Math.abs(a) > 1 && `разтягане ${num(Math.abs(a))} пъти по вертикала`,
    Math.abs(a) < 1 && `свиване ${num(1 / Math.abs(a))} пъти по вертикала`,
    a < 0 && 'отразяване спрямо Ox',
    Math.abs(b) > 1 && `свиване ${num(Math.abs(b))} пъти по хоризонтала`,
    Math.abs(b) < 1 && `разтягане ${num(1 / Math.abs(b))} пъти по хоризонтала`,
    b < 0 && 'отразяване спрямо Oy',
  ].filter(Boolean);

  return (
    <Plot
      x={[-7, 7]}
      y={[-5, 5]}
      hint="Множителят пред функцията (a) действа по вертикала, а множителят пред x (b) – по хоризонтала, но „наобратно“: при b = 2 графиката се свива два пъти."
      readout={
        <>
          <Buttons>
            {BASES.map((x, i) => (
              <DiagramButton key={x.name} active={i === bi} onClick={() => setBi(i)}>
                <span className="font-mono">{x.name}</span>
              </DiagramButton>
            ))}
          </Buttons>
          <Sliders>
            <Slider label="a" value={a} onChange={v => setA(v === 0 ? 0.25 : v)} min={-3} max={3} step={0.25} tone="blue" />
            <Slider label="b" value={b} onChange={v => setB(v === 0 ? 0.25 : v)} min={-3} max={3} step={0.25} tone="amber" />
          </Sliders>
          <Formula>y = {formula}</Formula>
          <Note tone="violet">{notes.length ? notes.join(', ') : 'изходната функция'}</Note>
          <Note tone="gray">
            y = {base.name} е {base.parity}
            {base.parity === 'четна' && ' – f(−x) = f(x), графиката е симетрична спрямо Oy (пробвай b = −1: нищо не се променя!)'}
            {base.parity === 'нечетна' && ' – f(−x) = −f(x), графиката е симетрична спрямо началото'}
            {base.parity.startsWith('нито') && ' – дефиниционната ѝ област не е симетрична'}
          </Note>
        </>
      }
    >
      <Curve f={base.f} tone="gray" width={2} dashed />
      <Curve f={g} tone="blue" />
    </Plot>
  );
}
