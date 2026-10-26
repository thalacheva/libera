import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

/** Видовете на континента, които могат да заселят острова. */
const P = 100;
const AREAS = [1, 10, 100, 1000, 10000];
const DISTANCES = [10, 100, 500, 2000];

/** Скорост на заселване на празен остров (видове за година) – намалява с разстоянието. */
const immig0 = (d: number) => 10 * Math.exp(-d / 700);
/** Скорост на изчезване, ако на острова са всички P вида – по-голяма на малък остров. */
const ext0 = (a: number) => 12 * a ** -0.35;

const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');
const big = (v: number) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// графика на скоростите
const GX0 = 300;
const GX1 = 610;
const GY0 = 270;
const GY1 = 40;
const RMAX = 12;
const gx = (s: number) => GX0 + (s / P) * (GX1 - GX0);
const gy = (r: number) => GY0 - (Math.min(r, RMAX) / RMAX) * (GY0 - GY1);

// графика видове–площ
const AX0 = 70;
const AX1 = 600;
const AY0 = 270;
const AY1 = 40;
const ax = (f: number) => AX0 + f * (AX1 - AX0);
const ay = (f: number) => AY0 - f * (AY0 - AY1);

function Equilibrium() {
  const [area, setArea] = useState(100);
  const [dist, setDist] = useState(100);

  const I0 = immig0(dist);
  const E0 = ext0(area);
  const sStar = (P * I0) / (I0 + E0);
  const turnover = I0 * (1 - sStar / P);

  // карта: континентът вляво, островът на разстояние по логаритмична скала
  const ix = 95 + (Math.log10(dist) - 1) * 60;
  const ir = 6 + Math.log10(area) * 7;

  return (
    <>
      <LabSvg viewBox="0 0 640 310" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* карта */}
        <rect x={10} y={30} width={270} height={250} rx={8} className="fill-sky-100 dark:fill-sky-950" />
        <path d="M 10 30 L 45 30 Q 60 90 42 150 Q 30 210 50 280 L 10 280 Z" className="fill-lime-200 dark:fill-lime-900" />
        <text x={18} y={300} fontSize="11" fill="currentColor">континент ({P} вида)</text>
        <circle cx={ix} cy={155} r={ir} className="fill-lime-300 dark:fill-lime-800" stroke="currentColor" strokeWidth={1} />
        <line x1={50} y1={155} x2={ix - ir} y2={155} stroke="currentColor" strokeDasharray="4 3" />
        <text x={(50 + ix - ir) / 2} y={148} fontSize="11" textAnchor="middle" fill="currentColor">{big(dist)} km</text>
        <text x={ix} y={155 + ir + 16} fontSize="11" textAnchor="middle" fill="currentColor">{big(area)} km²</text>
        <text x={145} y={22} fontSize="12" fontWeight="700" textAnchor="middle" fill="currentColor">карта</text>

        {/* скорости */}
        <line x1={GX0} y1={GY0} x2={GX1} y2={GY0} stroke="currentColor" />
        <line x1={GX0} y1={GY0} x2={GX0} y2={GY1} stroke="currentColor" />
        {[0, 25, 50, 75, 100].map(v => (
          <text key={v} x={gx(v)} y={GY0 + 15} fontSize="11" textAnchor="middle" fill="currentColor">{v}</text>
        ))}
        {[0, 4, 8, 12].map(v => (
          <text key={v} x={GX0 - 6} y={gy(v) + 4} fontSize="11" textAnchor="end" fill="currentColor">{v}</text>
        ))}
        <text x={(GX0 + GX1) / 2} y={GY0 + 32} fontSize="12" textAnchor="middle" fill="currentColor">видове на острова S</text>
        <text x={GX0 + 4} y={GY1 - 14} fontSize="12" fill="currentColor">видове за година</text>
        <line x1={gx(0)} y1={gy(I0)} x2={gx(P)} y2={gy(0)} stroke="#3b82f6" strokeWidth={3} />
        <line x1={gx(0)} y1={gy(0)} x2={gx(P)} y2={gy(E0)} stroke="#e11d48" strokeWidth={3} />
        <line x1={gx(sStar)} y1={gy(turnover)} x2={gx(sStar)} y2={GY0} stroke="currentColor" strokeDasharray="4 3" />
        <circle cx={gx(sStar)} cy={gy(turnover)} r={6} fill="#10b981" stroke="white" strokeWidth={1.5} />
        <text x={gx(sStar)} y={GY0 - 6} fontSize="12" fontWeight="700" textAnchor={sStar > 80 ? 'end' : 'start'} dx={sStar > 80 ? -4 : 4} fill="#059669">S* = {fmt(sStar)}</text>
        <text x={GX1} y={GY1 + 4} fontSize="11" textAnchor="end" fill="#3b82f6">заселване I</text>
        <text x={GX1} y={GY1 + 20} fontSize="11" textAnchor="end" fill="#e11d48">изчезване E</text>
      </LabSvg>
      <Buttons>
        {AREAS.map(a => (
          <DiagramButton key={a} active={area === a} onClick={() => setArea(a)}>
            {big(a)} km²
          </DiagramButton>
        ))}
      </Buttons>
      <Buttons>
        {DISTANCES.map(d => (
          <DiagramButton key={d} active={dist === d} onClick={() => setDist(d)}>
            {big(d)} km
          </DiagramButton>
        ))}
      </Buttons>
      <Readout
        items={[
          { label: 'I₀ (празен остров)', value: fmt(I0, 2), tone: 'blue' },
          { label: 'E₀ (всички P вида)', value: fmt(E0, 2), tone: 'rose' },
          { label: 'равновесие S*', value: fmt(sStar), tone: 'emerald' },
          { label: 'смяна, видове/год.', value: fmt(turnover, 2), tone: 'amber' },
        ]}
      />
      <Formula>
        I = I₀(1 − S/P), E = E₀ · S/P → S* = P · I₀ / (I₀ + E₀) = {P} · {fmt(I0, 2)} / ({fmt(I0, 2)} + {fmt(E0, 2)}) = {fmt(sStar)}
      </Formula>
      <Note tone="emerald">
        {sStar > 75
          ? 'Голям и близък остров: много нови видове пристигат, а малко изчезват – равновесието е близо до целия континентален набор.'
          : sStar < 20
            ? 'Малък и далечен остров: рядко пристига нов вид, а малките популации лесно изчезват – видовете са малко.'
            : 'При равновесието броят на видовете не се променя, но видовете се сменят: колкото пристигат, толкова изчезват. Опитай по-голям или по-близък остров.'}
      </Note>
    </>
  );
}

function SpeciesArea() {
  const [z, setZ] = useState(0.25);
  const [loss, setLoss] = useState(90);

  const keep = 1 - loss / 100;
  const sKeep = keep ** z;
  const curve = Array.from({ length: 101 }, (_, k) => {
    const f = k / 100;
    return `${k ? 'L' : 'M'} ${ax(f).toFixed(1)} ${ay(f ** z).toFixed(1)}`;
  }).join(' ');

  return (
    <>
      <LabSvg viewBox="0 0 640 310" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <line x1={AX0} y1={AY0} x2={AX1} y2={AY0} stroke="currentColor" />
        <line x1={AX0} y1={AY0} x2={AX0} y2={AY1} stroke="currentColor" />
        {[0, 25, 50, 75, 100].map(v => (
          <g key={v}>
            <text x={ax(v / 100)} y={AY0 + 15} fontSize="11" textAnchor="middle" fill="currentColor">{v}</text>
            <line x1={AX0 - 4} x2={AX1} y1={ay(v / 100)} y2={ay(v / 100)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={AX0 - 8} y={ay(v / 100) + 4} fontSize="11" textAnchor="end" fill="currentColor">{v}</text>
          </g>
        ))}
        <text x={(AX0 + AX1) / 2} y={AY0 + 32} fontSize="12" textAnchor="middle" fill="currentColor">останала площ, % от първоначалната</text>
        <text x={AX0 + 4} y={AY1 - 14} fontSize="12" fill="currentColor">оцелели видове, %</text>
        <line x1={ax(0)} y1={ay(0)} x2={ax(1)} y2={ay(1)} stroke="#9ca3af" strokeDasharray="5 4" />
        <text x={ax(0.6)} y={ay(0.5)} fontSize="11" fill="#6b7280">ако бяха пропорционални на площта</text>
        <path d={curve} fill="none" stroke="#10b981" strokeWidth={3} />
        <line x1={ax(keep)} y1={AY0} x2={ax(keep)} y2={ay(sKeep)} stroke="#e11d48" strokeDasharray="4 3" />
        <line x1={AX0} y1={ay(sKeep)} x2={ax(keep)} y2={ay(sKeep)} stroke="#e11d48" strokeDasharray="4 3" />
        <circle cx={ax(keep)} cy={ay(sKeep)} r={6} fill="#e11d48" stroke="white" strokeWidth={1.5} />
        <text x={ax(keep) + 10} y={ay(sKeep) + 18} fontSize="12" fontWeight="700" fill="#e11d48">
          {fmt(keep * 100)} % площ → {fmt(sKeep * 100)} % видове
        </text>
      </LabSvg>
      <Sliders>
        <Slider label="z" value={z} onChange={setZ} min={0.1} max={0.4} step={0.01} tone="emerald" />
        <Slider label="загуба %" value={loss} onChange={setLoss} min={0} max={99} step={1} tone="rose" />
      </Sliders>
      <Readout
        items={[
          { label: 'остава площ', value: `${fmt(keep * 100)} %`, tone: 'blue' },
          { label: 'остават видове', value: `${fmt(sKeep * 100)} %`, tone: 'emerald' },
          { label: 'изчезват', value: `${fmt((1 - sKeep) * 100)} %`, tone: 'rose' },
          { label: 'площ за половината видове', value: `${fmt(0.5 ** (1 / z) * 100)} %`, tone: 'violet' },
        ]}
      />
      <Formula>
        S = c · Aᶻ → S / S₀ = (A / A₀)ᶻ = {fmt(keep, 2)}^{fmt(z, 2)} = {fmt(sKeep, 3)}
      </Formula>
      <Note tone="rose">
        Унищожаването на {loss} % от местообитанието не изтрива {loss} % от видовете, но и не е безобидно: по закона видове–площ с z = {fmt(z, 2)} в
        крайна сметка изчезват около {fmt((1 - sKeep) * 100, 0)} % от тях. Изчезването не е веднага – малките популации в остатъците гаснат
        с десетилетия („дълг на изчезване“).
      </Note>
    </>
  );
}

/** Островна биогеография: равновесие между заселване и изчезване; закон видове–площ и загуба на местообитания. */
export default function IslandBiogeographyLab() {
  const [mode, setMode] = useState<'eq' | 'area'>('eq');
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={mode === 'eq'} onClick={() => setMode('eq')}>
          заселване и изчезване
        </DiagramButton>
        <DiagramButton active={mode === 'area'} onClick={() => setMode('area')}>
          видове и площ
        </DiagramButton>
      </Buttons>
      {mode === 'eq' ? <Equilibrium /> : <SpeciesArea />}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Моделът на Макартър и Уилсън (1967 г.) е силно опростен: правите линии и числата за скоростите тук са примерни. Важното е
        качественото: заселването намалява с разстоянието до континента, а изчезването е по-бързо на малките острови. Показателят z в
        закона видове–площ е около 0,15–0,35 – по-голям за истински острови, по-малък за части от континент. „Острови“ са и планинските
        върхове, езерата и парчетата гора сред нивите.
      </p>
    </div>
  );
}
