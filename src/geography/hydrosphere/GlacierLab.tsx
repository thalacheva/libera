import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';

// Опростена долина: леглото пада равномерно от 3000 m с 100 m на километър
const Z_TOP = 3000;
const SLOPE = 0.1;
const LEN = 22_000; // m
const ELA_TODAY = 2600;
/** Пластичен лед (Най): дебелина H = √(2τ/(ρg) · (L − x)), τ ≈ 100 kPa → 2τ/(ρg) ≈ 22 m. */
const NYE = 22.2;

const xOf = (m: number) => 20 + (m / LEN) * 600;
const yOf = (z: number) => 280 - ((z - 600) / 2800) * 260;
const bed = (m: number) => Z_TOP - SLOPE * m;

/** Линията на равновесие при промяна на температурата (ΔT) и на снеговалежа (в % от днешния). */
const elaOf = (dT: number, snow: number) => ELA_TODAY + 130 * dT - 4 * (snow - 100);
/** При линейно нарастващо топене и равен наклон ледникът е в равновесие, когато линията на равновесие е по средата му по височина. */
const lengthOf = (ela: number) => Math.min(LEN, Math.max(0, (2 * (Z_TOP - ela)) / SLOPE));

/** Баланс на масата на планински ледник: къде се натрупва и къде се топи ледът и докъде стига езикът. */
export default function GlacierLab() {
  const [dT, setDT] = useState(0);
  const [snow, setSnow] = useState(100);

  const ela = elaOf(dT, snow);
  const len = lengthOf(ela);
  const len0 = lengthOf(ELA_TODAY);
  const thick = (m: number) => (m >= len ? 0 : Math.sqrt(NYE * (len - m)) * Math.sqrt(Math.min(1, (m + 300) / 1500)));
  const surf = (m: number) => bed(m) + thick(m);
  const xEla = (Z_TOP - ela) / SLOPE;
  const gone = len < 200;

  const n = 80;
  const bedPts = Array.from({ length: n + 1 }, (_, k) => (LEN * k) / n).map(m => `${xOf(m).toFixed(1)},${yOf(bed(m)).toFixed(1)}`);
  const icePts = (from: number, to: number) =>
    Array.from({ length: 41 }, (_, k) => from + ((to - from) * k) / 40).map(m => `${xOf(m).toFixed(1)},${yOf(surf(m)).toFixed(1)}`);
  const iceBed = (from: number, to: number) =>
    Array.from({ length: 41 }, (_, k) => to - ((to - from) * k) / 40).map(m => `${xOf(m).toFixed(1)},${yOf(bed(m)).toFixed(1)}`);

  // Потокът лед през напречното сечение расте до линията на равновесие и после намалява; скоростта е поток / дебелина
  const flux = (m: number) => (Z_TOP - ela) * m - (SLOPE * m * m) / 2;
  const arrows =
    len < 2500
      ? []
      : Array.from({ length: 7 }, (_, k) => ((k + 1) / 8) * len).map(m => ({
          m,
          u: flux(m) / Math.max(thick(m), 20),
        }));
  const uMax = Math.max(1, ...arrows.map(a => a.u));

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 300" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <rect x={0} y={0} width={640} height={300} className="fill-sky-50 dark:fill-slate-900" />
        {[1000, 1500, 2000, 2500, 3000].map(z => (
          <g key={z}>
            <line x1={20} y1={yOf(z)} x2={640} y2={yOf(z)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={636} y={yOf(z) - 3} fontSize="10" textAnchor="end" className="fill-gray-500 dark:fill-gray-400">
              {fmt(z)} m
            </text>
          </g>
        ))}
        <path
          d={`M${bedPts.join('L')}L620 300L20 300Z`}
          className="fill-stone-300 stroke-stone-600 dark:fill-stone-700 dark:stroke-stone-400"
          strokeWidth="1.5"
        />

        {!gone && (
          <>
            {/* Зона на натрупване (над линията на равновесие) и зона на топене */}
            <path
              d={`M${icePts(0, Math.min(xEla, len)).join('L')}L${iceBed(0, Math.min(xEla, len)).join('L')}Z`}
              className="fill-white stroke-sky-400"
              strokeWidth="1"
            />
            {xEla < len && (
              <path
                d={`M${icePts(xEla, len).join('L')}L${iceBed(xEla, len).join('L')}Z`}
                className="fill-sky-200 stroke-sky-500 dark:fill-sky-300"
                strokeWidth="1"
              />
            )}
            {arrows.map(({ m, u }) => {
              const x = xOf(m);
              const y = yOf(bed(m) + thick(m) * 0.55);
              const l = (6 + (22 * u) / uMax) * Math.min(1, len / 6000);
              const dx = l * 0.96;
              const dy = l * 0.27;
              return (
                <line
                  key={m}
                  x1={x - dx / 2}
                  y1={y - dy / 2}
                  x2={x + dx / 2}
                  y2={y + dy / 2}
                  className="stroke-blue-700"
                  strokeWidth="1.8"
                  markerEnd="url(#glacier-a)"
                />
              );
            })}
          </>
        )}
        <defs>
          <marker id="glacier-a" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0 0 L6 3 L0 6 Z" className="fill-blue-700" />
          </marker>
        </defs>

        {/* Линията на равновесие */}
        <line x1={20} y1={yOf(ela)} x2={620} y2={yOf(ela)} className="stroke-violet-600 dark:stroke-violet-400" strokeWidth="1.5" strokeDasharray="6 4" />
        {!gone && xEla > 1500 && (
          <text x={xOf(xEla / 2)} y={yOf(surf(xEla / 2)) - 10} fontSize="11" textAnchor="middle" className="fill-sky-800 dark:fill-sky-200">
            натрупване
          </text>
        )}
        {!gone && xEla < len - 1500 && (
          <text x={xOf((xEla + len) / 2)} y={yOf(surf((xEla + len) / 2)) - 10} fontSize="11" textAnchor="middle" className="fill-sky-800 dark:fill-sky-200">
            топене
          </text>
        )}

        {/* Днешната челна морена */}
        <path d={`M${xOf(len0) - 7} ${yOf(bed(len0))} l7 -9 l7 9 Z`} className="fill-stone-500 dark:fill-stone-300" />
        <text x={xOf(len0)} y={yOf(bed(len0)) + 16} fontSize="10" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          днес
        </text>
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Опростен модел: над линията на равновесие (виолетовия пунктир) годишно се натрупва повече сняг, отколкото се топи, под нея – обратно. Стрелките показват
        скоростта на леда – най-бърз е около линията на равновесие. Вертикалният мащаб е увеличен около 3,5 пъти.
      </p>
      <Sliders>
        <Slider label="ΔT, °C" value={dT} onChange={setDT} min={-4} max={3} step={0.5} tone="rose" />
        <Slider label="сняг, %" value={snow} onChange={setSnow} min={50} max={150} step={10} tone="blue" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            {
              label: 'линия на равновесие',
              value: `${fmt(ela)} m`,
              tone: 'violet',
            },
            {
              label: 'дължина',
              value: `${fmt(len / 1000, 1)} km`,
              tone: 'blue',
            },
            { label: 'език на', value: gone ? '—' : `${fmt(bed(len))} m` },
            {
              label: 'спрямо днес',
              value: `${len >= len0 ? '+' : '−'}${fmt(Math.abs(len - len0) / 1000, 1)} km`,
              tone: len >= len0 ? 'emerald' : 'rose',
            },
          ]}
        />
      </div>
      <Note tone={gone ? 'rose' : len >= len0 ? 'emerald' : 'amber'}>
        {gone
          ? 'Линията на равновесие е над най-високата точка на долината – целият сняг се стопява всяко лято и ледникът изчезва.'
          : len > len0 + 100
            ? 'Ледникът напредва и избутва нова челна морена надолу по долината.'
            : len < len0 - 100
              ? 'Ледникът се оттегля – отпред остава празно корито и морената от днешния му край.'
              : 'Натрупването и топенето са в равновесие: езикът стои на място, макар ледът да тече непрекъснато надолу.'}
      </Note>
    </div>
  );
}
