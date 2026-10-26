import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

const GENS = 80;

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

/** Печалбите: ястреб срещу ястреб, ястреб срещу гълъб, гълъб срещу ястреб, гълъб срещу гълъб. */
const payoffs = (V: number, C: number) => ({ HH: (V - C) / 2, HD: V, DH: 0, DD: V / 2 });

/** Репликаторна динамика: всеки дял расте пропорционално на средната си приспособеност. */
function simulate(V: number, C: number, p0: number) {
  const P = payoffs(V, C);
  const W0 = C / 2 + 1; // базова приспособеност, за да няма отрицателни стойности
  const out = [p0];
  let p = p0;
  for (let g = 0; g < GENS; g++) {
    const eH = p * P.HH + (1 - p) * P.HD;
    const eD = p * P.DH + (1 - p) * P.DD;
    const mean = p * eH + (1 - p) * eD;
    p = (p * (W0 + eH)) / (W0 + mean);
    out.push(p);
  }
  return out;
}

const X0 = 50;
const X1 = 400;
const Y0 = 270;
const Y1 = 40;
const px = (g: number) => X0 + (g / GENS) * (X1 - X0);
const py = (p: number) => Y0 - p * (Y0 - Y1);

/** Ястреби и гълъби: еволюционно стабилната стратегия при борба за ресурс. */
export default function HawkDoveLab() {
  const [V, setV] = useState(4);
  const [C, setC] = useState(10);
  const [p0, setP0] = useState(0.02);
  const [gen, setGen] = useState(GENS);

  const P = payoffs(V, C);
  const ps = useMemo(() => simulate(V, C, p0), [V, C, p0]);
  const ess = V >= C ? 1 : V / C;
  const p = ps[gen];
  const eH = p * P.HH + (1 - p) * P.HD;
  const eD = p * P.DH + (1 - p) * P.DD;
  const mean = p * eH + (1 - p) * eD;

  const path = ps.map((v, g) => `${g ? 'L' : 'M'} ${px(g).toFixed(1)} ${py(v).toFixed(1)}`).join(' ');
  const nH = Math.round(p * 100);

  let msg: string;
  if (V >= C)
    msg = `Наградата (${V}) е поне колкото цената на нараняването (${C}): да се биеш винаги си струва и ястребите изместват гълъбите напълно.`;
  else
    msg = `Ястребите печелят, докато са рядкост (бият гълъбите), а губят, когато са много (бият се помежду си). Устойчивото състояние е ${fmt(ess * 100, 0)} % ястреби – там двете стратегии носят еднакво. Средната печалба тогава е ${fmt((1 - ess) * V / 2, 2)}, а ако всички бяха гълъби – ${fmt(V / 2, 1)}: ЕСС не е най-доброто за групата.`;

  const cell = (v: number) => fmt(v, 1);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 320" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="currentColor" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="currentColor" />
        {[0, 20, 40, 60, 80].map(v => (
          <g key={v}>
            <line x1={px(v)} x2={px(v)} y1={Y0} y2={Y0 + 4} stroke="currentColor" />
            <text x={px(v)} y={Y0 + 16} fontSize="11" textAnchor="middle" fill="currentColor">{v}</text>
          </g>
        ))}
        {[0, 25, 50, 75, 100].map(v => (
          <g key={v}>
            <line x1={X0 - 4} x2={X1} y1={py(v / 100)} y2={py(v / 100)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={X0 - 8} y={py(v / 100) + 4} fontSize="11" textAnchor="end" fill="currentColor">{v}</text>
          </g>
        ))}
        <text x={(X0 + X1) / 2} y={Y0 + 32} fontSize="12" textAnchor="middle" fill="currentColor">поколение</text>
        <text x={X0 + 4} y={Y1 - 14} fontSize="12" fill="currentColor">% ястреби</text>

        <line x1={X0} x2={X1} y1={py(ess)} y2={py(ess)} stroke="#7c3aed" strokeDasharray="6 4" />
        <text x={X1 - 4} y={py(ess) - 6} fontSize="11" textAnchor="end" fill="#7c3aed">V/C = {fmt(ess * 100, 0)} %</text>
        <path d={path} fill="none" stroke="#e11d48" strokeWidth={3} />
        <line x1={px(gen)} x2={px(gen)} y1={Y0} y2={Y1} stroke="#64748b" strokeDasharray="2 3" />
        <circle cx={px(gen)} cy={py(p)} r={5} fill="#e11d48" />

        {/* таблица на печалбите */}
        <g fontSize="11" fill="currentColor">
          <text x={430} y={30} fontWeight="700">печалба на реда срещу колоната</text>
          <text x={500} y={50} textAnchor="middle">ястреб</text>
          <text x={570} y={50} textAnchor="middle">гълъб</text>
          <text x={430} y={72}>ястреб</text>
          <text x={430} y={94}>гълъб</text>
          <text x={500} y={72} textAnchor="middle" fill="#e11d48">{cell(P.HH)}</text>
          <text x={570} y={72} textAnchor="middle" fill="#e11d48">{cell(P.HD)}</text>
          <text x={500} y={94} textAnchor="middle" fill="#2563eb">{cell(P.DH)}</text>
          <text x={570} y={94} textAnchor="middle" fill="#2563eb">{cell(P.DD)}</text>
        </g>

        {/* 100 птици в избраното поколение */}
        <text x={430} y={124} fontSize="12" fontWeight="700" fill="currentColor">поколение {gen}: 100 птици</text>
        {Array.from({ length: 100 }, (_, k) => (
          <circle key={k} cx={440 + (k % 10) * 17} cy={140 + Math.floor(k / 10) * 15} r={6} fill={k < nH ? '#e11d48' : '#93c5fd'} />
        ))}
        <g fontSize="11" fill="currentColor">
          <circle cx={440} cy={300} r={5} fill="#e11d48" />
          <text x={450} y={304}>ястреби {nH}</text>
          <circle cx={530} cy={300} r={5} fill="#93c5fd" />
          <text x={540} y={304}>гълъби {100 - nH}</text>
        </g>
      </LabSvg>

      <Buttons>
        <DiagramButton active={p0 === 0.02} onClick={() => setP0(0.02)}>
          малко ястреби сред гълъби
        </DiagramButton>
        <DiagramButton active={p0 === 0.98} onClick={() => setP0(0.98)}>
          малко гълъби сред ястреби
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="V" value={V} onChange={setV} min={1} max={16} step={1} tone="emerald" />
        <Slider label="C" value={C} onChange={setC} min={1} max={20} step={1} tone="rose" />
        <Slider label="начало" value={p0} onChange={setP0} min={0.02} max={0.98} step={0.02} tone="gray" />
        <Slider label="покол." value={gen} onChange={setGen} min={0} max={GENS} step={1} tone="violet" />
      </Sliders>

      <div className="mt-3">
        <Readout
          items={[
            { label: 'ястреби', value: `${fmt(p * 100, 1)} %`, tone: 'rose' },
            { label: 'печалба ястреб', value: fmt(eH, 2), tone: 'rose' },
            { label: 'печалба гълъб', value: fmt(eD, 2), tone: 'blue' },
            { label: 'средно', value: fmt(mean, 2), tone: 'violet' },
          ]}
        />
      </div>
      <Formula>
        ЕСС: p* = V / C = {V} / {C} {V >= C ? '≥ 1 → само ястреби' : `= ${fmt(ess, 2)}`}
      </Formula>
      <Note tone="violet">{msg}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Двама съперници се срещат за ресурс със стойност V (храна, територия, женска). „Ястребът“ винаги напада, „гълъбът“ само
        заплашва и бяга, ако бъде нападнат. Два ястреба се бият, единият печели V, другият плаща цена C – средно (V − C)/2. Ястреб срещу
        гълъб: ястребът взима всичко. Два гълъба си поделят ресурса – по V/2. В модела всяко поколение делът на стратегия расте
        пропорционално на нейната средна печалба. Това е опростен модел на Джон Мейнард Смит и Джордж Прайс (1973) – истинските животни
        имат много повече стратегии.
      </p>
    </div>
  );
}
