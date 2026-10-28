import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

// Универсалното уравнение за загуба на почва (USLE): A = R·K·LS·C·P, t/ha годишно.
const COVERS = [
  { name: 'гола почва', C: 1 },
  { name: 'царевица', C: 0.4 },
  { name: 'пшеница', C: 0.15 },
  { name: 'ливада', C: 0.02 },
  { name: 'гора', C: 0.002 },
];
const PRACTICES = [
  { name: 'без мерки', P: 1 },
  { name: 'оран по хоризонталите', P: 0.6 },
  { name: 'ивици', P: 0.3 },
  { name: 'тераси', P: 0.12 },
];
const SOILS = [
  { name: 'песъчлива', K: 0.02 },
  { name: 'глинеста', K: 0.03 },
  { name: 'льосова', K: 0.05 },
];

/** Фактор на склона: дължина λ (m) и наклон s (%). */
function lsFactor(s: number, lambda: number) {
  const th = Math.atan(s / 100);
  const m = s >= 5 ? 0.5 : s >= 3.5 ? 0.4 : s >= 1 ? 0.3 : 0.2;
  return (lambda / 22.13) ** m * (65.41 * Math.sin(th) ** 2 + 4.56 * Math.sin(th) + 0.065);
}

const RHO = 1.3; // обемна плътност на почвата, t/m³
const FORMATION = 1; // колко почва се образува годишно, t/ha – порядъкът по оценки за Европа

/** Ерозия на почвата на нива по склон – модел по уравнението USLE. */
export default function ErosionLab() {
  const [s, setS] = useState(10);
  const [lambda, setLambda] = useState(100);
  const [R, setR] = useState(800);
  const [ci, setCi] = useState(1);
  const [pi, setPi] = useState(0);
  const [ki, setKi] = useState(1);

  const LS = lsFactor(s, lambda);
  const A = R * SOILS[ki].K * LS * COVERS[ci].C * PRACTICES[pi].P;
  const mm = A / (10 * RHO);
  const years = mm > 0 ? 200 / mm : Infinity;

  // Склонът в истински наклон
  const th = Math.atan(s / 100);
  const len = 330;
  const x0 = 30;
  const y0 = 80;
  const x1 = x0 + len * Math.cos(th);
  const y1 = y0 + len * Math.sin(th);
  const dx = Math.cos(th);
  const dy = Math.sin(th);
  const cover = COVERS[ci].name;
  const terraces = PRACTICES[pi].name === 'тераси';
  const along = Array.from({ length: 12 }, (_, i) => (i + 0.5) / 12);

  // Стълбчета: загуба срещу образуване, логаритмична скала 0,01…1000 t/ha
  const BX = 430;
  const BY0 = 290;
  const BH = 240;
  const logY = (v: number) => BY0 - ((Math.log10(Math.max(v, 0.01)) + 2) / 5) * BH;

  const drops = Math.round(4 + R / 120);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 320" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        {/* Дъжд */}
        {Array.from({ length: drops }, (_, i) => {
          const x = 40 + ((i * 97) % 330);
          const y = 12 + ((i * 37) % 40);
          return <line key={i} x1={x} y1={y} x2={x - 3} y2={y + 10} className="stroke-sky-500" strokeWidth="1.5" />;
        })}
        {/* Почвата и склонът */}
        {terraces ? (
          <path
            d={
              `M${x0} ${y0} ` +
              Array.from({ length: 6 }, (_, i) => {
                const xa = x0 + ((i + 1) * (x1 - x0)) / 6;
                const ya = y0 + (i * (y1 - y0)) / 6;
                return `L${xa.toFixed(1)} ${ya.toFixed(1)} L${xa.toFixed(1)} ${(ya + (y1 - y0) / 6).toFixed(1)}`;
              }).join(' ') +
              ` L${x1} ${y1 + 40} L${x0} ${y1 + 40} Z`
            }
            className="fill-amber-800/70 dark:fill-amber-900/80"
          />
        ) : (
          <path d={`M${x0} ${y0} L${x1} ${y1} L${x1} ${y1 + 40} L${x0} ${y1 + 40} Z`} className="fill-amber-800/70 dark:fill-amber-900/80" />
        )}
        {/* Растителността */}
        {cover !== 'гола почва' &&
          along.map(u => {
            const x = x0 + u * (x1 - x0);
            const y = terraces ? y0 + Math.floor(u * 6) * ((y1 - y0) / 6) : y0 + u * (y1 - y0);
            if (cover === 'гора')
              return (
                <g key={u}>
                  <line x1={x} y1={y} x2={x} y2={y - 16} className="stroke-amber-900" strokeWidth="2" />
                  <circle cx={x} cy={y - 22} r={10} className="fill-green-700" />
                </g>
              );
            if (cover === 'ливада') return <path key={u} d={`M${x - 12} ${y} q6 -10 12 0 q6 -10 12 0`} className="fill-green-500" />;
            const tall = cover === 'царевица' ? 18 : 9;
            return (
              <g key={u}>
                <line x1={x} y1={y} x2={x} y2={y - tall} className={cover === 'царевица' ? 'stroke-green-600' : 'stroke-yellow-500'} strokeWidth="2" />
                <line
                  x1={x + 8}
                  y1={y + 8 * Math.tan(th)}
                  x2={x + 8}
                  y2={y + 8 * Math.tan(th) - tall}
                  className={cover === 'царевица' ? 'stroke-green-600' : 'stroke-yellow-500'}
                  strokeWidth="2"
                />
              </g>
            );
          })}
        {/* Отнесената почва */}
        <path
          d={`M${x1 - 30 * dx} ${y1 - 30 * dy + 6} Q ${x1 + 10} ${y1 + 4}, ${x1 + 50} ${y1 + 22}`}
          fill="none"
          className="stroke-amber-600"
          strokeWidth={Math.min(14, 1 + Math.log10(1 + A) * 4)}
          strokeLinecap="round"
          opacity={0.85}
        />
        <text x={x0} y={y1 + 60} fontSize="11" className="fill-gray-600 dark:fill-gray-300">
          наклон {fmt(s)}% ({fmt((th * 180) / Math.PI, 1)}°), дължина {fmt(lambda)} m
        </text>

        {/* Загуба срещу образуване */}
        {[0.01, 0.1, 1, 10, 100, 1000].map(v => (
          <g key={v}>
            <line x1={BX - 4} y1={logY(v)} x2={BX + 170} y2={logY(v)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={BX - 8} y={logY(v) + 4} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {fmt(v, v < 1 ? 2 : 0)}
            </text>
          </g>
        ))}
        <text x={BX + 85} y={BY0 - BH - 18} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          t/ha за година (лог. скала)
        </text>
        <rect x={BX + 15} y={logY(A)} width={60} height={BY0 - logY(A)} className={A > FORMATION ? 'fill-rose-500' : 'fill-emerald-500'} />
        <rect x={BX + 100} y={logY(FORMATION)} width={60} height={BY0 - logY(FORMATION)} className="fill-emerald-600/70" />
        <text x={BX + 45} y={BY0 + 14} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          отнася се
        </text>
        <text x={BX + 130} y={BY0 + 14} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          образува се
        </text>
      </LabSvg>
      <Buttons>
        {COVERS.map((c, i) => (
          <DiagramButton key={c.name} active={i === ci} onClick={() => setCi(i)}>
            {c.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {PRACTICES.map((p, i) => (
          <DiagramButton key={p.name} active={i === pi} onClick={() => setPi(i)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {SOILS.map((p, i) => (
          <DiagramButton key={p.name} active={i === ki} onClick={() => setKi(i)}>
            {p.name}
          </DiagramButton>
        ))}
      </Buttons>
      <Sliders>
        <Slider label="s, %" value={s} onChange={setS} min={1} max={40} step={1} tone="amber" />
        <Slider label="λ, m" value={lambda} onChange={setLambda} min={10} max={300} step={10} tone="gray" />
        <Slider label="R" value={R} onChange={setR} min={300} max={2000} step={50} tone="blue" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        s – наклон на склона, λ – дължина на склона, R – колко силни са дъждовете (ерозионна сила, MJ·mm/(ha·h) за година; в България – около 500–1500). Моделът
        е USLE; коефициентите на почвата, растителността и мерките са типични стойности.
      </p>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'LS', value: fmt(LS, 2), tone: 'amber' },
            {
              label: 'A',
              value: `${fmt(A, A < 1 ? 2 : 1)} t/ha год.`,
              tone: 'rose',
            },
            {
              label: 'слой',
              value: `${fmt(mm, mm < 0.1 ? 3 : 2)} mm/год.`,
              tone: 'violet',
            },
            {
              label: '20 cm за',
              value: years > 1e5 ? 'над 100 000 год.' : `≈ ${fmt(years > 1000 ? Math.round(years / 100) * 100 : Math.round(years))} год.`,
              tone: 'blue',
            },
          ]}
        />
      </div>
      <Note tone={A > FORMATION ? 'rose' : 'emerald'}>
        {A > FORMATION
          ? `Почвата се губи около ${fmt(A / FORMATION, 0)} пъти по-бързо, отколкото се образува.`
          : 'Загубата не надвишава образуването на нова почва – почвата се запазва.'}
      </Note>
    </div>
  );
}
