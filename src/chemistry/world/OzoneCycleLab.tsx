import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

const CHAPMAN = [
  { eq: 'O₂ + УВ лъчение → 2O', note: 'кислородът се разкъсва на атоми' },
  { eq: 'O + O₂ → O₃', note: 'образува се озон' },
  { eq: 'O₃ + УВ лъчение → O₂ + O', note: 'озонът поглъща УВ лъчение – така ни пази' },
  { eq: 'O + O₃ → 2O₂', note: 'озонът се разрушава' },
];

const CL_STEPS = [
  { eq: 'Cl + O₃ → ClO + O₂', note: 'хлорният атом откъсва кислород от озона' },
  { eq: 'ClO + O → Cl + O₂', note: 'хлорният атом се освобождава – готов за нов цикъл' },
];

const NA = 6.022e23;
const M_CFC12 = 121; // CCl₂F₂
const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');
/** Голямо число като 1,7 · 10⁵. */
function sci(v: number) {
  if (v < 1e4) return Math.round(v).toLocaleString('bg-BG');
  let e = Math.floor(Math.log10(v));
  let m = Math.round((v / 10 ** e) * 10) / 10;
  if (m >= 10) {
    m /= 10;
    e += 1;
  }
  const sup = String(e).replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]);
  return `${fmt(m)} · 10${sup}`;
}

/** Цикълът на Чапман и каталитичното разрушаване на озона от хлорни атоми. */
export default function OzoneCycleLab() {
  const [mode, setMode] = useState<'chapman' | 'cl'>('cl');
  const [step, setStep] = useState(0);
  const [destroyed, setDestroyed] = useState(0);
  const [logChain, setLogChain] = useState(5);
  const [kg, setKg] = useState(1);

  const steps = mode === 'chapman' ? CHAPMAN : CL_STEPS;
  const current = step % steps.length;

  const next = () => {
    if (mode === 'cl' && current === 0) setDestroyed(d => d + 1);
    setStep(s => s + 1);
  };
  const reset = () => {
    setStep(0);
    setDestroyed(0);
  };
  const switchMode = (m: 'chapman' | 'cl') => {
    setMode(m);
    reset();
  };

  // Колко озон може да разруши определено количество фреон
  const chain = 10 ** logChain;
  const clMol = (kg * 1000 * 2) / M_CFC12;
  const o3Tonnes = (clMol * chain * 48) / 1e6;

  const nodeCl = { x: 140, y: 104 };
  const nodeClO = { x: 340, y: 104 };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={mode === 'chapman'} onClick={() => switchMode('chapman')}>
          естествено: цикъл на Чапман
        </DiagramButton>
        <DiagramButton active={mode === 'cl'} onClick={() => switchMode('cl')}>
          с хлор от фреоните
        </DiagramButton>
      </Buttons>

      <LabSvg viewBox="0 0 480 210" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-3">
        <defs>
          <marker id="ozone-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="fill-current" />
          </marker>
        </defs>
        {mode === 'chapman' ? (
          CHAPMAN.map((s, i) => {
            const on = step > 0 && i === (step - 1) % 4;
            return (
              <g key={s.eq}>
                <rect x={30} y={6 + i * 50} width={420} height={46} rx={8} className={on ? 'fill-sky-100 dark:fill-sky-900/60 stroke-sky-500' : 'fill-gray-50 dark:fill-gray-900/40 stroke-gray-200 dark:stroke-gray-700'} />
                <text x={46} y={26 + i * 50} fontSize="14" fontWeight="700" className="fill-current">
                  {s.eq}
                </text>
                <text x={46} y={43 + i * 50} fontSize="11" className="fill-gray-500 dark:fill-gray-400">
                  {s.note}
                </text>
              </g>
            );
          })
        ) : (
          <g>
            {/* горна дъга: Cl + O₃ → ClO + O₂ */}
            <path
              d={`M ${nodeCl.x + 22} ${nodeCl.y - 26} Q 240 4 ${nodeClO.x - 22} ${nodeClO.y - 26}`}
              fill="none"
              strokeWidth={step > 0 && current === 1 ? 4 : 2}
              className={step > 0 && current === 1 ? 'stroke-rose-500 text-rose-500' : 'stroke-gray-400 text-gray-400'}
              markerEnd="url(#ozone-arrow)"
            />
            <text x={240} y={36} fontSize="13" fontWeight="600" textAnchor="middle" className="fill-rose-600 dark:fill-rose-400">
              + O₃ → + O₂
            </text>
            {/* долна дъга: ClO + O → Cl + O₂ */}
            <path
              d={`M ${nodeClO.x - 22} ${nodeClO.y + 26} Q 240 204 ${nodeCl.x + 22} ${nodeCl.y + 26}`}
              fill="none"
              strokeWidth={step > 0 && current === 0 ? 4 : 2}
              className={step > 0 && current === 0 ? 'stroke-sky-500 text-sky-500' : 'stroke-gray-400 text-gray-400'}
              markerEnd="url(#ozone-arrow)"
            />
            <text x={240} y={182} fontSize="13" fontWeight="600" textAnchor="middle" className="fill-sky-700 dark:fill-sky-400">
              + O → + O₂
            </text>
            {[
              { p: nodeCl, label: 'Cl', on: current === 0 },
              { p: nodeClO, label: 'ClO', on: current === 1 },
            ].map(n => (
              <g key={n.label}>
                <circle cx={n.p.x} cy={n.p.y} r={32} strokeWidth={n.on ? 3 : 1.5} className={n.on ? 'fill-emerald-100 dark:fill-emerald-900/60 stroke-emerald-500' : 'fill-gray-50 dark:fill-gray-900/40 stroke-gray-300 dark:stroke-gray-600'} />
                <text x={n.p.x} y={n.p.y + 6} fontSize="18" fontWeight="700" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300">
                  {n.label}
                </text>
              </g>
            ))}
            <text x={240} y={100} fontSize="12" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300">
              разрушени O₃:
            </text>
            <text x={240} y={124} fontSize="22" fontWeight="700" textAnchor="middle" className="fill-rose-600 dark:fill-rose-400">
              {destroyed}
            </text>
          </g>
        )}
      </LabSvg>

      <Buttons>
        <DiagramButton onClick={next}>следваща стъпка →</DiagramButton>
        {mode === 'cl' && (
          <DiagramButton
            onClick={() => {
              setDestroyed(d => d + 100);
              setStep(s => s + 200);
            }}
          >
            +100 цикъла
          </DiagramButton>
        )}
        <DiagramButton onClick={reset}>отначало</DiagramButton>
      </Buttons>
      {step > 0 && (
        <p className="text-center text-sm sm:text-base mt-2">
          <strong>{steps[(step - 1) % steps.length].eq}</strong> – {steps[(step - 1) % steps.length].note}
        </p>
      )}

      {mode === 'cl' ? (
        <>
          <Note tone="rose">
            Сборът на двете стъпки е O₃ + O → 2O₂ – същата реакция като последната в цикъла на Чапман, но много по-бърза. Хлорният атом не се
            изразходва – той е <strong>катализатор</strong>. Колкото и цикли да минат{destroyed > 0 ? ` (досега – ${destroyed})` : ''}, в
            стратосферата отново има само един атом Cl.
          </Note>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-3">
            <Sliders>
              <Slider label="lg N" value={logChain} onChange={setLogChain} min={2} max={5} step={0.5} tone="rose" />
              <Slider label="m, kg" value={kg} onChange={setKg} min={0.5} max={10} step={0.5} tone="emerald" />
            </Sliders>
            <div className="mt-3">
              <Readout
                items={[
                  { label: 'цикли на един атом Cl (N):', value: sci(chain), tone: 'rose' },
                  { label: `атоми Cl от ${fmt(kg)} kg CCl₂F₂:`, value: `${sci(clMol * NA)} (${fmt(clMol)} mol)`, tone: 'emerald' },
                  { label: 'разрушен озон:', value: `до ≈ ${o3Tonnes >= 10 ? Math.round(o3Tonnes).toLocaleString('bg-BG') : fmt(o3Tonnes)} t`, tone: 'blue' },
                ]}
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
              💡 Веригата не е безкрайна: рано или късно хлорът се свързва в по-стабилни „резервоари“ като HCl или ClONO₂. Често се посочва, че
              един атом хлор може да разруши до около 100 000 молекули озон (lg = 5). Сметката е горна граница – приема, че всеки хлорен атом от
              фреона стига до стратосферата.
            </p>
          </div>
        </>
      ) : (
        <Note tone="emerald">
          Без замърсяване образуването и разрушаването на озона са в равновесие: озоновият слой е динамичен – молекулите непрекъснато се
          образуват и разпадат, но концентрацията им остава почти постоянна. Самото поглъщане на УВ лъчението (третата реакция) е полезната
          работа на слоя.
        </Note>
      )}
    </div>
  );
}
