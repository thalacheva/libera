import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { fmt } from '../geo';
import ClimateChart from './ClimateChart';
import { classify, koppenName, STATIONS } from './koppen';

const PRESETS = ['София', 'Варна', 'Атина', 'Лондон', 'Москва', 'Кайро', 'Сингапур'].map(n => STATIONS.find(s => s.name === n)!);

/** „Направи си климат“: влачи месечните температури и валежи и гледай как се сменя типът по Кьопен. */
export default function KoppenBuilderLab() {
  const [base, setBase] = useState(PRESETS[0]);
  const [T, setT] = useState(PRESETS[0].T);
  const [P, setP] = useState(PRESETS[0].P);
  const [dT, setDT] = useState(0);
  const [kP, setKP] = useState(1);
  const [cd, setCd] = useState(0);

  const Te = T.map(t => Math.round((t + dT) * 10) / 10);
  const Pe = P.map(p => Math.round(p * kP));
  const k = classify(base.lat, Te, Pe, cd);
  const kBase = classify(base.lat, base.T, base.P, cd);

  const load = (s: (typeof PRESETS)[number]) => {
    setBase(s);
    setT(s.T);
    setP(s.P);
    setDT(0);
    setKP(1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {PRESETS.map(s => (
          <DiagramButton key={s.name} active={s === base} onClick={() => load(s)}>
            {s.name}
          </DiagramButton>
        ))}
      </Buttons>
      <div className="mt-3">
        <ClimateChart
          T={Te}
          P={Pe}
          lo={-40}
          hi={60}
          title={`климатът на ${base.name}, променен`}
          onChangeT={(m, t) => setT(a => a.map((v, i) => (i === m ? Math.max(-45, Math.min(40, t - dT)) : v)))}
          onChangeP={(m, p) => setP(a => a.map((v, i) => (i === m ? Math.min(300, p) / kP : v)))}
        />
      </div>
      <Sliders>
        <Slider label="ΔT, °C" value={dT} onChange={setDT} min={-10} max={10} step={0.5} tone="rose" />
        <Slider label="P ×" value={kP} onChange={setKP} min={0.1} max={3} step={0.05} tone="blue" />
      </Sliders>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
        ΔT затопля или охлажда всички месеци, „P ×“ умножава всички валежи. Влачи червените точки и горния край на стълбчетата, за да промениш отделен месец.
      </p>
      <Buttons>
        <DiagramButton active={cd === 0} onClick={() => setCd(0)}>
          граница C/D при 0 °C
        </DiagramButton>
        <DiagramButton active={cd === -3} onClick={() => setCd(-3)}>
          граница C/D при −3 °C
        </DiagramButton>
        <DiagramButton onClick={() => load(base)}>връщане</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'средна год. t', value: `${fmt(k.Ta, 1)} °C`, tone: 'rose' },
            { label: 'валежи', value: `${fmt(k.Pa)} mm`, tone: 'blue' },
            { label: 'праг на сухота', value: `${fmt(k.Pth)} mm`, tone: 'amber' },
            { label: 'беше', value: kBase.code, tone: 'gray' },
            { label: 'сега', value: k.code, tone: 'emerald' },
          ]}
        />
      </div>
      <Note tone={k.code === kBase.code ? 'gray' : 'emerald'}>
        {k.code} – {koppenName(k.code)}
      </Note>
      <ol className="mt-2 list-decimal ml-5 space-y-0.5 text-sm text-gray-700 dark:text-gray-300">
        {k.steps.map(st => (
          <li key={st}>{st}</li>
        ))}
      </ol>
    </div>
  );
}
