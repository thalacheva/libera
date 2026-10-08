import { useState } from 'react';
import { Buttons, Diagram, DiagramButton, Formula, Note, Readout } from './diagram';
import { tones } from './diagramMath';
import { Slider, Sliders } from '~/functions/plot';

const O = { x: 240, y: 160 };
const R = 125;

const polygon = (n: number, r: number, rot: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = rot + (2 * Math.PI * i) / n;
    return `${O.x + r * Math.cos(a)},${O.y + r * Math.sin(a)}`;
  }).join(' ');

/** Методът на Архимед: π е между обиколките на вписания и описания многоъгълник. */
export function PiLab() {
  const [n, setN] = useState(6);
  const low = n * Math.sin(Math.PI / n);
  const high = n * Math.tan(Math.PI / n);
  const rot = -Math.PI / 2;
  // Колко цифри от π са сигурни (съвпадат в двете граници)
  const digits = (() => {
    const a = low.toFixed(6);
    const b = high.toFixed(6);
    let k = 0;
    while (k < a.length && a[k] === b[k]) k++;
    return a.slice(0, k);
  })();

  return (
    <Diagram
      grid={false}
      hint="Архимед удвоява страните: 6, 12, 24, 48, 96. Обиколката на окръжността е между обиколките на вписания (вътрешния) и описания (външния) многоъгълник."
      readout={
        <>
          <Sliders>
            <Slider label="n" value={n} onChange={setN} min={3} max={96} step={1} tone="violet" />
          </Sliders>
          <Buttons>
            {[6, 12, 24, 48, 96].map(k => (
              <DiagramButton key={k} active={k === n} onClick={() => setN(k)}>
                {k}-ъгълник
              </DiagramButton>
            ))}
          </Buttons>
          <Readout
            items={[
              { label: 'вписан: P/d =', value: low.toFixed(5).replace('.', ','), tone: 'blue' },
              { label: 'описан: P/d =', value: high.toFixed(5).replace('.', ','), tone: 'rose' },
            ]}
          />
          <Formula>
            {low.toFixed(4).replace('.', ',')} &lt; π &lt; {high.toFixed(4).replace('.', ',')}
          </Formula>
          <Note tone="violet">{digits.length > 1 ? `Сигурни цифри: ${digits.replace('.', ',')}…` : 'Още нито една сигурна цифра след запетаята.'}</Note>
          {n === 96 && <Note tone="gray">Архимед (III век пр.н.е.) стига дотук и доказва, че 3 10/71 ≈ 3,1408 &lt; π &lt; 3 1/7 ≈ 3,1429 – без десетични дроби и без калкулатор!</Note>}
        </>
      }
    >
      <polygon points={polygon(n, R / Math.cos(Math.PI / n), rot)} className={`${tones.rose.soft} ${tones.rose.stroke}`} strokeWidth="1.5" />
      <circle cx={O.x} cy={O.y} r={R} className="fill-white dark:fill-gray-800 stroke-gray-800 dark:stroke-gray-100" strokeWidth="2" />
      <polygon points={polygon(n, R, rot - Math.PI / n)} className={`${tones.blue.soft} ${tones.blue.stroke}`} strokeWidth="1.5" />
      <circle cx={O.x} cy={O.y} r={3} className="fill-gray-500" />
    </Diagram>
  );
}
