import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { LANDFORMS, contours, hypsoColor, levelsOf, sample } from '../terrain';

const M0 = 12; // карта: квадрат (M0, M0) – (M0 + MS, M0 + MS)
const MS = 296;
const N = 60;
const N3 = 34;
const STEPS = [50, 100, 200];

/** Светлина от северозапад: по-светло към нея, по-тъмно на сянка. */
function shade(rgb: string, k: number) {
  const [r, g, b] = rgb.match(/\d+/g)!.map(Number);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

/** Хоризонтали и тримерен изглед на едни и същи форми на релефа. */
export default function ContourLab() {
  const [k, setK] = useState(0);
  const [step, setStep] = useState(100);
  const [tint, setTint] = useState(true);
  const [probe, setProbe] = useState<{ x: number; y: number } | null>(null);
  const form = LANDFORMS[k];

  const { grid, lines, cells, quads } = useMemo(() => {
    const grid = sample(form.terrain, N);
    const lines = contours(grid, levelsOf(grid, step));
    const n = 30;
    const cells = Array.from({ length: n * n }, (_, c) => {
      const i = c % n;
      const j = Math.floor(c / n);
      return { i, j, n, fill: hypsoColor(form.terrain((i + 0.5) / n, (j + 0.5) / n)) };
    });
    // Тримерен изглед: четириъгълници, рисувани отзад напред
    const g3 = sample(form.terrain, N3);
    const P = (i: number, j: number) => {
      const u = i / N3 - 0.5;
      const v = j / N3 - 0.5;
      return { x: 482 + (u - v) * 200 * 0.72, y: 205 + (u + v) * 200 * 0.36 - g3[j][i] * 0.09 };
    };
    const quads: { d: string; fill: string; depth: number }[] = [];
    for (let j = 0; j < N3; j++)
      for (let i = 0; i < N3; i++) {
        const h = (g3[j][i] + g3[j][i + 1] + g3[j + 1][i] + g3[j + 1][i + 1]) / 4;
        // Светлина от северозапад: склоновете, обърнати на север и запад, са по-светли
        const dx = (g3[j][i + 1] + g3[j + 1][i + 1] - g3[j][i] - g3[j + 1][i]) / 2;
        const dy = (g3[j + 1][i] + g3[j + 1][i + 1] - g3[j][i] - g3[j][i + 1]) / 2;
        const light = 1 - (dx + dy) * 0.004;
        const pts = [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)];
        quads.push({ d: pts.map((p, q) => `${q ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('') + 'Z', fill: shade(hypsoColor(h), Math.max(0.7, Math.min(1.2, light))), depth: i + j });
      }
    quads.sort((a, b) => a.depth - b.depth);
    return { grid, lines, cells, quads };
  }, [form, step]);

  const all = grid.flat();
  const hProbe = probe ? form.terrain(probe.x, probe.y) : null;

  const click = (e: React.MouseEvent<SVGSVGElement>) => {
    const m = e.currentTarget.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const x = (p.x - M0) / MS;
    const y = (p.y - M0) / MS;
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1) setProbe({ x, y });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 320" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100 cursor-crosshair" onClick={click}>
        <rect x={M0} y={M0} width={MS} height={MS} className="fill-white dark:fill-gray-900" />
        {tint &&
          cells.map(c => <rect key={`${c.i}/${c.j}`} x={M0 + (c.i * MS) / c.n} y={M0 + (c.j * MS) / c.n} width={MS / c.n + 0.5} height={MS / c.n + 0.5} fill={c.fill} opacity={0.85} />)}
        <g transform={`translate(${M0} ${M0}) scale(${MS})`}>
          {lines.map(l => (
            <path key={l.level} d={l.d} fill="none" vectorEffect="non-scaling-stroke" className="stroke-amber-900 dark:stroke-amber-200" strokeWidth={l.level % (step * 5) === 0 ? 2 : 0.9} />
          ))}
        </g>
        <rect x={M0} y={M0} width={MS} height={MS} fill="none" className="stroke-gray-500" strokeWidth="1" />
        {probe && hProbe !== null && (
          <g>
            <circle cx={M0 + probe.x * MS} cy={M0 + probe.y * MS} r={4} className="fill-fuchsia-600 stroke-white" strokeWidth="1.5" />
            <text x={M0 + probe.x * MS + (probe.x > 0.75 ? -7 : 7)} y={M0 + probe.y * MS - 6} fontSize="12" fontWeight="bold" textAnchor={probe.x > 0.75 ? 'end' : 'start'} className="fill-gray-900 dark:fill-white">
              {fmt(hProbe)} m
            </text>
          </g>
        )}
        <text x={M0 + MS / 2} y={M0 + MS - 6} fontSize="10" textAnchor="middle" className="fill-gray-600">
          хоризонтали през {step} m, удебелена – през {step * 5} m
        </text>
        {/* Тримерен изглед */}
        {quads.map((q, i) => (
          <path key={i} d={q.d} fill={q.fill} stroke={q.fill} strokeWidth="0.4" />
        ))}
        <text x={482} y={312} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          гледан от юг, височините – преувеличени
        </text>
      </LabSvg>

      <Buttons>
        {LANDFORMS.map((f, i) => (
          <DiagramButton
            key={f.id}
            active={k === i}
            onClick={() => {
              setK(i);
              setProbe(null);
            }}
          >
            {f.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {STEPS.map(s => (
          <DiagramButton key={s} active={step === s} onClick={() => setStep(s)}>
            през {s} m
          </DiagramButton>
        ))}
        <DiagramButton active={tint} onClick={() => setTint(!tint)}>
          🎨 Цветове по височина
        </DiagramButton>
      </Buttons>
      <Note tone="blue">{form.note}</Note>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'най-ниско', value: `${fmt(Math.min(...all))} m` },
            { label: 'най-високо', value: `${fmt(Math.max(...all))} m` },
            { label: 'брой хоризонтали', value: String(lines.length) },
            { label: 'в точката', value: hProbe === null ? 'щракни по картата' : `${fmt(hProbe)} m`, tone: 'rose' },
          ]}
        />
      </div>
    </div>
  );
}
