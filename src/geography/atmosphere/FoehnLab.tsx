import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import { dewPoint, DRY_RATE, LCL_PER_DEGREE, liftMoist, mixingRatio, pressureAt, satVapour } from './humidity';

// Напречен разрез на планина: подножията са на 0 m, вятърът духа отляво надясно
const GROUND = 262;
const PX_PER_M = 200 / 3500;
const PEAK_X = 320;
const HALF = 220;
const yOf = (z: number) => GROUND - z * PX_PER_M;
const heightAt = (x: number, h: number) => (Math.abs(x - PEAK_X) >= HALF ? 0 : h * Math.cos((Math.PI * (x - PEAK_X)) / (2 * HALF)) ** 2);
/** x на наветрения склон, където височината е z. */
const xAt = (z: number, h: number) => PEAK_X - ((2 * HALF) / Math.PI) * Math.acos(Math.sqrt(Math.min(1, z / h)));

/** Фьон: въздухът се издига по наветрения склон, губи влагата си като валеж и слиза от другата страна по-топъл и по-сух. */
export default function FoehnLab() {
  const [t0, setT0] = useState(15);
  const [rh, setRh] = useState(80);
  const [h, setH] = useState(2500);

  const td = dewPoint(t0, rh);
  const lcl = LCL_PER_DEGREE * (t0 - td);
  const cloud = lcl < h;
  const tLcl = t0 - (DRY_RATE * Math.min(lcl, h)) / 1000;
  const tTop = cloud ? liftMoist(tLcl, lcl, h) : t0 - (DRY_RATE * h) / 1000;
  const tLee = tTop + (DRY_RATE * h) / 1000;
  const rBase = mixingRatio(satVapour(td), 1013.25);
  const rTop = cloud ? mixingRatio(satVapour(tTop), pressureAt(h)) : rBase;
  const eLee = (rTop * 1013.25) / (0.622 + rTop);
  const rhLee = Math.min(100, (100 * eLee) / satVapour(tLee));
  const rain = (rBase - rTop) * 1000;

  const mountain =
    Array.from({ length: 121 }, (_, i) => {
      const x = (640 * i) / 120;
      return `${i ? 'L' : 'M'}${x.toFixed(1)} ${yOf(heightAt(x, h)).toFixed(1)}`;
    }).join('') + `L640 ${GROUND + 14}L0 ${GROUND + 14}Z`;

  // Облакът лежи по наветрения склон от кондензационното ниво до билото и малко се прехвърля
  const cloudPath = (() => {
    if (!cloud) return '';
    const x0 = xAt(lcl, h);
    const pts: string[] = [];
    const n = 24;
    const x1 = PEAK_X + 24;
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      const taper = Math.min(1, (x - x0) / 25 + 0.3, (x1 - x) / 30);
      pts.push(`${x.toFixed(1)} ${(yOf(heightAt(x, h)) - (22 + 6 * Math.sin(i * 1.3)) * Math.max(0, taper)).toFixed(1)}`);
    }
    const under = Array.from({ length: n + 1 }, (_, i) => {
      const x = PEAK_X + 24 - ((PEAK_X + 24 - x0) * i) / n;
      return `${x.toFixed(1)} ${(yOf(heightAt(x, h)) + 2).toFixed(1)}`;
    });
    return `M${pts.join('L')}L${under.join('L')}Z`;
  })();
  const rainXs = cloud ? Array.from({ length: 6 }, (_, i) => xAt(lcl, h) - 10 - i * 16).filter(x => x > PEAK_X - HALF + 10) : [];

  const label = (x: number, y: number, lines: string[], anchor: 'start' | 'middle' | 'end' = 'middle', tone = 'fill-gray-800 dark:fill-gray-100') => (
    <text x={x} y={y} fontSize="11" textAnchor={anchor} className={tone}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} dy={i ? 13 : 0}>
          {l}
        </tspan>
      ))}
    </text>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 300" className="w-full h-auto block select-none text-gray-800 dark:text-gray-100">
        <rect x={0} y={0} width={640} height={GROUND} className="fill-sky-50 dark:fill-slate-900" />
        {[1000, 2000, 3000].map(z => (
          <g key={z}>
            <line x1={0} y1={yOf(z)} x2={640} y2={yOf(z)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={4} y={yOf(z) - 3} fontSize="10" className="fill-gray-500 dark:fill-gray-400">
              {fmt(z)} m
            </text>
          </g>
        ))}
        {cloud && <line x1={90} y1={yOf(lcl)} x2={PEAK_X} y2={yOf(lcl)} className="stroke-sky-500" strokeDasharray="3 4" />}
        <path d={mountain} className="fill-emerald-200 stroke-emerald-700 dark:fill-emerald-900/60 dark:stroke-emerald-500" strokeWidth="1.5" />
        {cloud && <path d={cloudPath} className="fill-gray-100 stroke-gray-400 dark:fill-gray-300 dark:stroke-gray-500" strokeWidth="1.2" />}
        {cloud &&
          rainXs.map(x => (
            <g key={x} className="stroke-sky-600 dark:stroke-sky-400" strokeWidth="1.4">
              <line x1={x} y1={yOf(Math.max(lcl, heightAt(x, h))) - 8} x2={x - 6} y2={yOf(heightAt(x, h)) - 2} strokeDasharray="4 3" />
            </g>
          ))}
        {/* Вятърът */}
        <path d={`M20 ${GROUND - 12} L70 ${GROUND - 12}`} className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2.5" markerEnd="url(#foehn-arrow)" />
        <path d={`M${PEAK_X + HALF + 20} ${GROUND - 12} L${PEAK_X + HALF + 70} ${GROUND - 12}`} className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="2.5" markerEnd="url(#foehn-arrow-r)" />
        <defs>
          <marker id="foehn-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" className="fill-blue-600 dark:fill-blue-400" />
          </marker>
          <marker id="foehn-arrow-r" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" className="fill-rose-600 dark:fill-rose-400" />
          </marker>
        </defs>
        {label(46, GROUND - 42, [`${fmt(t0, 1)} °C`, `RH ${fmt(rh)} %`], 'middle', 'fill-blue-700 dark:fill-blue-300')}
        {cloud && label(12, 22, [`основа на облака (пунктир): ${fmt(lcl)} m, ${fmt(tLcl, 1)} °C`], 'start', 'fill-sky-800 dark:fill-sky-200')}
        {label(PEAK_X, yOf(h) - (cloud ? 44 : 22), [`${fmt(h)} m: ${fmt(tTop, 1)} °C`], 'middle')}
        {label(596, GROUND - 42, [`${fmt(tLee, 1)} °C`, `RH ${fmt(rhLee)} %`], 'middle', 'fill-rose-700 dark:fill-rose-300')}
        <text x={180} y={GROUND + 30} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          наветрен склон
        </text>
        <text x={460} y={GROUND + 30} fontSize="11" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
          подветрен склон
        </text>
      </LabSvg>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Нагоре: сухоадиабатно ({fmt(DRY_RATE, 1)} °C/km) до основата на облака, после влажноадиабатно. Падналият валеж изнася водата, а надолу въздухът се
        затопля сухоадиабатно чак до подножието.
      </p>
      <Sliders>
        <Slider label="T, °C" value={t0} onChange={setT0} min={0} max={30} step={1} tone="blue" />
        <Slider label="RH, %" value={rh} onChange={setRh} min={30} max={100} step={1} tone="emerald" />
        <Slider label="H, m" value={h} onChange={setH} min={500} max={3500} step={100} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'основа на облака', value: cloud ? `${fmt(lcl)} m` : 'няма облак', tone: 'blue' },
            { label: 'на билото', value: `${fmt(tTop, 1)} °C` },
            { label: 'отвъд', value: `${fmt(tLee, 1)} °C`, tone: 'rose' },
            { label: 'по-топло с', value: `${fmt(tLee - t0, 1)} °C`, tone: 'rose' },
            { label: 'валеж', value: `${fmt(rain, 1)} g на kg въздух`, tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone={cloud ? 'rose' : 'blue'}>
        {cloud
          ? `Отвъд планината въздухът е с ${fmt(tLee - t0, 1)} °C по-топъл и много по-сух (${fmt(rhLee)} % вместо ${fmt(rh)} %) – това е фьон, а подветреният склон е в „дъждовна сянка“.`
          : 'Въздухът е твърде сух, за да образува облак под билото: нагоре и надолу се мени с еднакъв градиент и слиза със същата температура.'}
      </Note>
    </div>
  );
}
