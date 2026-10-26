import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Formula, Note, Readout } from '~/geometry/diagram';

/** Слънчева енергия, която пада за година върху 1 m² в България – около 1400–1450 kWh. */
const SUN = 5_000_000;
const LEVEL_NAMES = ['продуценти', 'растителноядни', 'хищници I', 'хищници II', 'хищници III'];
const COLORS = ['#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#e11d48'];

type Mode = 'model' | 'ss-energy' | 'ss-biomass' | 'channel' | 'grass' | 'oak';
type Data = { title: string; unit: string; rows: { name: string; v: number }[]; note: string };

const DATA: Record<Exclude<Mode, 'model'>, Data> = {
  'ss-energy': {
    title: 'Силвър Спрингс (Флорида) – брутна продукция',
    unit: 'kJ/m² за година',
    rows: [
      { name: 'продуценти', v: 87069 },
      { name: 'растителноядни', v: 14092 },
      { name: 'хищници', v: 1602 },
      { name: 'върхови хищници', v: 88 },
    ],
    note: 'Измервания на Хауърд Одъм от 1957 г. (в оригинала – в kcal). Ефективността между нивата е 16 %, 11 % и 6 % – около „правилото на 10-те процента“. Пирамидата на енергията никога не е обърната.',
  },
  'ss-biomass': {
    title: 'Силвър Спрингс – биомаса (сухо вещество)',
    unit: 'g/m²',
    rows: [
      { name: 'продуценти', v: 809 },
      { name: 'растителноядни', v: 37 },
      { name: 'хищници', v: 11 },
      { name: 'върхови хищници', v: 1.5 },
    ],
    note: 'Пирамидата на биомасата в реката е права: водораслите и тревите живеят дълго и тежат много повече от животните, които ги ядат.',
  },
  channel: {
    title: 'Ламанша – биомаса (сухо вещество)',
    unit: 'g/m²',
    rows: [
      { name: 'фитопланктон', v: 4 },
      { name: 'зоопланктон и дънни животни', v: 21 },
    ],
    note: 'Обърната пирамида на биомасата (по Харви, 1950 г.). Фитопланктонът се дели всеки ден и веднага се изяжда: в даден момент го има малко, но за година произвежда много повече, отколкото тежи. Затова пирамидата на енергията и тук е права.',
  },
  grass: {
    title: 'Ливада – брой организми на 400 m²',
    unit: 'броя',
    rows: [
      { name: 'растения', v: 5842424 },
      { name: 'растителноядни', v: 708624 },
      { name: 'хищници', v: 354904 },
      { name: 'върхови хищници', v: 3 },
    ],
    note: 'Числата са от класическо преброяване, цитирано от Юджийн Одъм. Тревите са малки и много, хищниците (паяци, птици) – по-едри и малко.',
  },
  oak: {
    title: 'Дъб – брой организми (примерни числа)',
    unit: 'броя',
    rows: [
      { name: 'дъб', v: 1 },
      { name: 'насекоми', v: 5000 },
      { name: 'птици', v: 20 },
    ],
    note: 'Пирамидата на броя е обърната: едно огромно дърво храни хиляди насекоми. Броят не казва колко храна има – затова биолозите предпочитат биомасата и енергията.',
  },
};

const fmt = (v: number, d = 0) =>
  v >= 1000
    ? Math.round(v)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    : Number(v.toFixed(d)).toString().replace('.', ',');

/** Пирамиди на енергията, биомасата и броя: модел с правилото на 10-те процента и измерени примери, включително обърнати. */
export default function EnergyPyramidLab() {
  const [mode, setMode] = useState<Mode>('model');
  const [photo, setPhoto] = useState(1);
  const [resp, setResp] = useState(50);
  const [eff, setEff] = useState(10);
  const [log, setLog] = useState(false);

  const gpp = (SUN * photo) / 100;
  const npp = gpp * (1 - resp / 100);
  const model = LEVEL_NAMES.map((name, k) => ({ name, v: npp * (eff / 100) ** k }));
  const d: Data =
    mode === 'model'
      ? { title: 'Модел: нетна продукция на всяко ниво', unit: 'kJ/m² за година', rows: model, note: '' }
      : DATA[mode];

  const max = Math.max(...d.rows.map(r => r.v));
  const minLog = Math.log10(Math.min(...d.rows.map(r => r.v)) / 10 || 0.1);
  const width = (v: number) => {
    if (!log) return Math.max(2, (v / max) * 520);
    return Math.max(2, ((Math.log10(v) - minLog) / (Math.log10(max) - minLog)) * 520);
  };
  const H = 44;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 330" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <text x={320} y={22} fontSize="14" fontWeight="700" textAnchor="middle" fill="currentColor">
          {d.title}
        </text>
        <text x={320} y={40} fontSize="11" textAnchor="middle" className="fill-gray-500">
          {d.unit}
          {log ? ' · логаритмичен мащаб' : ''}
        </text>
        {d.rows.map((r, k) => {
          const y = 300 - (k + 1) * H;
          const w = width(r.v);
          const inside = w > 150;
          return (
            <g key={r.name}>
              <rect x={320 - w / 2} y={y + 4} width={w} height={H - 8} rx={4} fill={COLORS[k]} opacity={0.85} />
              <text
                x={inside ? 320 : 320 + w / 2 + 6}
                y={y + H / 2 + 4}
                fontSize="12"
                fontWeight="600"
                textAnchor={inside ? 'middle' : 'start'}
                fill={inside ? '#fff' : 'currentColor'}
              >
                {r.name}: {fmt(r.v, r.v < 10 ? 1 : 0)}
              </text>
            </g>
          );
        })}
      </LabSvg>

      <Buttons>
        {(
          [
            ['model', 'модел'],
            ['ss-energy', 'енергия: Силвър Спрингс'],
            ['ss-biomass', 'биомаса: Силвър Спрингс'],
            ['channel', 'биомаса: Ламанша'],
            ['grass', 'брой: ливада'],
            ['oak', 'брой: дъб'],
          ] as [Mode, string][]
        ).map(([m, label]) => (
          <DiagramButton key={m} active={mode === m} onClick={() => setMode(m)}>
            {label}
          </DiagramButton>
        ))}
        <DiagramButton active={log} onClick={() => setLog(l => !l)}>
          лог. мащаб
        </DiagramButton>
      </Buttons>

      {mode === 'model' ? (
        <>
          <Sliders>
            <Slider label="фото %" value={photo} onChange={setPhoto} min={0.2} max={3} step={0.1} tone="emerald" />
            <Slider label="дишане" value={resp} onChange={setResp} min={20} max={80} step={5} tone="amber" />
            <Slider label="ефект." value={eff} onChange={setEff} min={2} max={25} step={1} tone="rose" />
          </Sliders>
          <Readout
            items={[
              { label: 'БПП', value: `${fmt(gpp)} kJ/m²`, tone: 'emerald' },
              { label: 'НПП', value: `${fmt(npp)} kJ/m²`, tone: 'emerald' },
              { label: 'до хищници III', value: `${fmt((model[4].v / SUN) * 100, 5)} % от светлината`, tone: 'violet' },
            ]}
          />
          <Formula>
            НПП = БПП − дишане = {fmt(gpp)} − {fmt(gpp - npp)} = {fmt(npp)} kJ/m²; всяко следващо ниво: × {fmt(eff / 100, 2)}
          </Formula>
          <Note tone="emerald">
            От {fmt(SUN)} kJ слънчева енергия на квадратен метър за година растенията връзват около {fmt(photo, 1)} %. След {LEVEL_NAMES.length - 1} прехода до хищниците
            от трето ниво стигат само {fmt(model[4].v, 1)} kJ – затова хранителните вериги рядко имат повече от 4–5 звена, а големите хищници са малко и
            им трябва голяма територия.
          </Note>
        </>
      ) : (
        <Note tone="blue">{d.note}</Note>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 БПП – брутна първична продукция (цялата енергия, свързана при фотосинтезата); НПП – нетна първична продукция (остава след
        дишането на самите растения) – само тя е достъпна за растителноядните. Ефективността на прехода между нивата обикновено е 5–20 %,
        средно около 10 %: останалото се губи при дишането като топлина, не се изяжда или не се усвоява и отива при разлагачите. В
        линеен мащаб горните нива почти не се виждат – включи логаритмичния.
      </p>
    </div>
  );
}
