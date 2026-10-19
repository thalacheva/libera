import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmtNum, sig } from '~/physics/sim';

const R_GAS = 8.314;
const CAT_DROP = 25; // с колко kJ/mol катализаторът понижава енергията на активиране

// Енергията (kJ/mol) от −70 до 130 → y от 220 до 30
const yAt = (E: number) => 220 - ((E + 70) / 200) * 190;

/** Енергиен профил: плато на реагентите, гърбица до активирания комплекс, плато на продуктите. */
const profile = (peak: number, prod: number) => {
  const [r, p, q] = [yAt(0), yAt(peak), yAt(prod)];
  return `M 60 ${r} L 150 ${r} C 200 ${r} 210 ${p} 250 ${p} C 290 ${p} 300 ${q} 350 ${q} L 440 ${q}`;
};

function Arrow({ x, y1, y2, className }: { x: number; y1: number; y2: number; className: string }) {
  const dir = y2 < y1 ? 1 : -1;
  return (
    <g className={className}>
      <line x1={x} x2={x} y1={y1} y2={y2 + dir * 6} strokeWidth="2" />
      <path d={`M ${x} ${y2} l -4 ${dir * 8} h 8 z`} stroke="none" className={className.replace(/stroke-/g, 'fill-')} />
    </g>
  );
}

/** Енергия на активиране: профил на реакцията, влияние на температурата (правило на Вант Хоф) и на катализатора. */
export default function ActivationEnergyLab() {
  const [Ea, setEa] = useState(60);
  const [T, setT] = useState(300);
  const [endo, setEndo] = useState(false);
  const [cat, setCat] = useState(false);
  const dH = endo ? 30 : -50;
  // Бариерата с катализатор пак трябва да е над продуктите при ендотермична реакция
  const EaCat = Math.max(Ea - CAT_DROP, dH + 10);

  const fraction = Math.exp((-Ea * 1000) / (R_GAS * T));
  const gamma = Math.exp(((Ea * 1000) / R_GAS) * (1 / T - 1 / (T + 10)));
  const boost = Math.exp(((Ea - EaCat) * 1000) / (R_GAS * T));
  const yR = yAt(0);
  const yProd = yAt(dH);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={!endo} onClick={() => setEndo(false)}>
          екзотермична (ΔH = −50 kJ/mol)
        </DiagramButton>
        <DiagramButton active={endo} onClick={() => setEndo(true)}>
          ендотермична (ΔH = +30 kJ/mol)
        </DiagramButton>
      </Buttons>

      <LabSvg viewBox="0 0 480 252" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-2">
        {/* Осите */}
        <line x1={40} x2={40} y1={234} y2={20} className="stroke-gray-400" strokeWidth="1.5" />
        <line x1={40} x2={470} y1={234} y2={234} className="stroke-gray-400" strokeWidth="1.5" />
        <text x={30} y={22} fontSize="11" fill="currentColor" transform="rotate(-90 30 22)" textAnchor="end">
          енергия
        </text>
        <text x={466} y={248} fontSize="11" textAnchor="end" fill="currentColor">
          ход на реакцията →
        </text>

        {/* Нивото на реагентите, продължено до ΔH */}
        <line x1={150} x2={440} y1={yR} y2={yR} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="4 4" />
        {/* Върхът, пренесен до стрелката Eₐ */}
        <line x1={125} x2={250} y1={yAt(Ea)} y2={yAt(Ea)} className="stroke-rose-300 dark:stroke-rose-700" strokeDasharray="4 4" />
        {cat && <line x1={85} x2={250} y1={yAt(EaCat)} y2={yAt(EaCat)} className="stroke-emerald-300 dark:stroke-emerald-700" strokeDasharray="4 4" />}

        <path d={profile(Ea, dH)} fill="none" className="stroke-rose-500" strokeWidth="3" />
        {cat && <path d={profile(EaCat, dH)} fill="none" className="stroke-emerald-500" strokeWidth="3" strokeDasharray="7 5" />}

        <Arrow x={125} y1={yR} y2={yAt(Ea)} className="stroke-rose-500" />
        <text x={131} y={(yR + yAt(Ea)) / 2 + 4} fontSize="13" fontWeight="700" className="fill-rose-600 dark:fill-rose-400">
          Eₐ
        </text>
        {cat && (
          <>
            <Arrow x={85} y1={yR} y2={yAt(EaCat)} className="stroke-emerald-500" />
            <text x={79} y={(yR + yAt(EaCat)) / 2 + 4} fontSize="13" fontWeight="700" textAnchor="end" className="fill-emerald-700 dark:fill-emerald-400">
              Eₐ′
            </text>
          </>
        )}
        <Arrow x={430} y1={yR} y2={yProd} className="stroke-blue-500" />
        <text x={437} y={(yR + yProd) / 2 + 5} fontSize="13" fontWeight="700" className="fill-blue-700 dark:fill-blue-300">
          ΔH
        </text>

        <text x={250} y={yAt(Ea) - 8} fontSize="11" textAnchor="middle" fill="currentColor">
          активиран комплекс
        </text>
        <text x={100} y={yR + 16} fontSize="11" textAnchor="middle" fill="currentColor">
          реагенти
        </text>
        <text x={385} y={endo ? yProd - 8 : yProd + 16} fontSize="11" textAnchor="middle" fill="currentColor">
          продукти
        </text>
      </LabSvg>

      <Buttons>
        <DiagramButton active={!cat} onClick={() => setCat(false)}>
          без катализатор
        </DiagramButton>
        <DiagramButton active={cat} onClick={() => setCat(true)}>
          с катализатор
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="Eₐ, kJ" value={Ea} onChange={setEa} min={40} max={120} step={5} tone="rose" />
        <Slider label="T, K" value={T} onChange={setT} min={250} max={600} step={10} tone="amber" />
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'обратна реакция Eₐ =', value: `${Ea - dH} kJ/mol` },
            { label: 'e^(−Eₐ/RT) =', value: sig(fraction, 2), tone: 'rose' },
            { label: `от ${T} до ${T + 10} K скоростта расте`, value: `${fmtNum(gamma, 2)} пъти`, tone: 'amber' },
            ...(cat ? [{ label: `Eₐ′ = ${EaCat} kJ/mol, ускорение`, value: `${sig(boost, 2)} пъти`, tone: 'emerald' as const }] : []),
          ]}
        />
      </div>
      <Note tone={gamma >= 2 && gamma <= 4 ? 'emerald' : 'gray'}>
        {gamma >= 2 && gamma <= 4
          ? `γ ≈ ${fmtNum(gamma, 1)} – в границите на правилото на Вант Хоф (2–4).`
          : `γ ≈ ${fmtNum(gamma, 1)} – извън обичайните 2–4: правилото на Вант Хоф е само грубо и важи около стайна температура при умерени Eₐ.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Червената крива е енергията по пътя от реагентите към продуктите. За да реагират, частиците трябва да „прескочат“ бариерата
        Eₐ. Множителят e^(−Eₐ/RT) показва колко малка част от ударите имат такава енергия. Промени Eₐ и T и следи колко пъти се ускорява
        реакцията при затопляне с 10 K. Включи катализатора – той дава друг път с по-ниска бариера, но ΔH остава същото, а обратната
        реакция се ускорява толкова пъти, колкото и правата.
      </p>
    </div>
  );
}
