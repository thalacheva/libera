import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum, sig } from '~/physics/sim';

const VOLTAGES = [0.4, 10, 20, 110, 400]; // kV – напрежения на пренос

/** Навивки на бобина върху ядрото – брой линии, ограничен за чертежа. */
function Coil({ x, n, tone }: { x: number; n: number; tone: string }) {
  const lines = Math.max(2, Math.min(22, Math.round(n / 100)));
  const top = 50;
  const h = 130;
  return (
    <g>
      {Array.from({ length: lines }, (_, i) => {
        const y = top + ((i + 0.5) / lines) * h;
        return <line key={i} x1={x - 26} y1={y} x2={x + 26} y2={y + 4} className={tone} strokeWidth="3" strokeLinecap="round" />;
      })}
    </g>
  );
}

/** Трансформатор и пренос на енергия: защо далекопроводите са с високо напрежение. */
export default function TransformerLab() {
  const [mode, setMode] = useState<'transformer' | 'line'>('transformer');
  const [n1, setN1] = useState(1000);
  const [n2, setN2] = useState(50);
  const [u1, setU1] = useState(230);
  const [r, setR] = useState(10);
  const [pMW, setPMW] = useState(1);
  const [rLine, setRLine] = useState(10);
  const [kv, setKv] = useState(10);

  const u2 = (u1 * n2) / n1;
  const i2 = u2 / r;
  const i1 = (i2 * n2) / n1;
  const p = u2 * i2;

  // Далекопровод: ток I = P/U, загуби I²R
  const P = pMW * 1e6;
  const I = P / (kv * 1000);
  const loss = I * I * rLine;
  const share = loss / P;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        <DiagramButton active={mode === 'transformer'} onClick={() => setMode('transformer')}>
          трансформатор
        </DiagramButton>
        <DiagramButton active={mode === 'line'} onClick={() => setMode('line')}>
          далекопровод
        </DiagramButton>
      </Buttons>

      {mode === 'transformer' ? (
        <>
          <ZoomingSvg viewBox="0 0 480 220">
            {/* Затворено желязно ядро */}
            <path d="M 120 30 H 360 V 200 H 120 Z M 150 60 V 170 H 330 V 60 Z" fillRule="evenodd" className="fill-gray-300 dark:fill-gray-600" />
            <Coil x={135} n={n1} tone="stroke-blue-500" />
            <Coil x={345} n={n2} tone="stroke-rose-500" />
            {/* Изводи */}
            <path d="M 109 54 H 60 M 109 176 H 60" className="stroke-blue-500" strokeWidth="2" />
            <path d="M 371 54 H 420 M 371 180 H 420" className="stroke-rose-500" strokeWidth="2" />
            <text x={42} y={115} fontSize={22} textAnchor="middle" dominantBaseline="central">
              🔌
            </text>
            <text x={440} y={115} fontSize={22} textAnchor="middle" dominantBaseline="central">
              💡
            </text>
            <Label p={{ x: 60, y: 30 }} size={12} tone="blue">
              {`U₁ = ${fmtNum(u1, 0)} V`}
            </Label>
            <Label p={{ x: 420, y: 30 }} size={12} tone="rose">
              {`U₂ = ${sig(u2, 3)} V`}
            </Label>
            <Label p={{ x: 135, y: 212 }} size={11} tone="blue">
              {`N₁ = ${n1}`}
            </Label>
            <Label p={{ x: 345, y: 212 }} size={11} tone="rose">
              {`N₂ = ${n2}`}
            </Label>
            <Label p={{ x: 240, y: 115 }} size={11}>
              желязно ядро
            </Label>
          </ZoomingSvg>
          <Sliders>
            <Slider label="N₁" value={n1} onChange={setN1} min={100} max={2000} step={50} tone="blue" />
            <Slider label="N₂" value={n2} onChange={setN2} min={10} max={2000} step={10} tone="rose" />
            <Slider label="U₁, V" value={u1} onChange={setU1} min={10} max={400} step={10} tone="blue" />
            <Slider label="R, Ω" value={r} onChange={setR} min={1} max={1000} step={1} tone="gray" />
          </Sliders>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'U₂ =', value: `${sig(u2, 3)} V`, tone: 'rose' },
                { label: 'I₂ =', value: `${sig(i2, 3)} A`, tone: 'rose' },
                { label: 'I₁ =', value: `${sig(i1, 3)} A`, tone: 'blue' },
                { label: 'P =', value: `${sig(p, 3)} W` },
              ]}
            />
          </div>
          <Note tone="gray">
            {n2 > n1
              ? `Повишаващ трансформатор: напрежението расте ${sig(n2 / n1, 3)} пъти, а токът в първичната намотка е толкова пъти по-голям от този във вторичната.`
              : n2 < n1
                ? `Понижаващ трансформатор: напрежението пада ${sig(n1 / n2, 3)} пъти – като в зарядно устройство.`
                : 'При еднакъв брой навивки напрежението не се променя.'}
          </Note>
        </>
      ) : (
        <>
          <ZoomingSvg viewBox="0 0 480 200">
            <text x={40} y={92} fontSize={34} textAnchor="middle" dominantBaseline="central">
              🏭
            </text>
            <text x={440} y={92} fontSize={34} textAnchor="middle" dominantBaseline="central">
              🏘️
            </text>
            {/* Стълбове и проводник – колкото по-голям ток, толкова „по-горещ“ */}
            {[120, 200, 280, 360].map(x => (
              <path key={x} d={`M ${x} 140 L ${x} 70 M ${x - 14} 76 H ${x + 14}`} className="stroke-gray-500" strokeWidth="3" />
            ))}
            <path d="M 70 80 Q 160 100 200 76 Q 240 100 280 76 Q 320 100 360 76 Q 400 100 410 84" fill="none" className={share > 0.1 ? 'stroke-rose-500' : share > 0.01 ? 'stroke-amber-500' : 'stroke-gray-600'} strokeWidth={2 + Math.min(6, share * 20)} />
            {/* Ленти: доставено и загубено */}
            <rect x={70} y={160} width={340} height={18} className="fill-gray-100 dark:fill-gray-700" />
            <rect x={70} y={160} width={340 * Math.max(0, 1 - Math.min(1, share))} height={18} className="fill-emerald-500" />
            <rect x={70 + 340 * Math.max(0, 1 - Math.min(1, share))} y={160} width={340 * Math.min(1, share)} height={18} className="fill-rose-500" />
            <Label p={{ x: 70, y: 192 }} size={11} anchor="start" tone="emerald">
              доставено
            </Label>
            <Label p={{ x: 410, y: 192 }} size={11} anchor="end" tone="rose">
              загуби в проводниците
            </Label>
            <Label p={{ x: 240, y: 40 }} size={13}>
              {`${fmtNum(kv, 1)} kV, I = ${sig(I, 3)} A`}
            </Label>
          </ZoomingSvg>
          <Buttons>
            {VOLTAGES.map(v => (
              <DiagramButton key={v} active={v === kv} onClick={() => setKv(v)}>
                {`${fmtNum(v, 1)} kV`}
              </DiagramButton>
            ))}
          </Buttons>
          <Sliders>
            <Slider label="P, MW" value={pMW} onChange={setPMW} min={0.1} max={10} step={0.1} tone="blue" />
            <Slider label="R, Ω" value={rLine} onChange={setRLine} min={1} max={20} step={1} tone="gray" />
          </Sliders>
          <div className="mt-3">
            <Readout
              items={[
                { label: 'I = P/U =', value: `${sig(I, 3)} A` },
                { label: 'загуби I²R =', value: share >= 1 ? 'над P' : `${sig(loss / 1000, 3)} kW`, tone: 'rose' },
                { label: 'дял', value: share >= 1 ? '> 100%' : `${sig(share * 100, 3)}%`, tone: 'rose' },
              ]}
            />
          </div>
          <Note tone={share >= 1 ? 'rose' : share > 0.05 ? 'amber' : 'emerald'}>
            {share >= 1
              ? 'При толкова ниско напрежение токът е огромен – линията би погълнала повече енергия, отколкото пренася. Така не може да се пренася ток надалеч.'
              : `Десет пъти по-високо напрежение – десет пъти по-малък ток и сто пъти по-малки загуби.`}
          </Note>
        </>
      )}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Трансформаторът работи само с променлив ток: променливият ток в първичната намотка създава променлив магнитен поток в ядрото, а той
        индуцира ЕДН във вторичната. В идеалния трансформатор U₂/U₁ = N₂/N₁ и мощността не се губи: U₁I₁ = U₂I₂. Загубите по линията зависят
        от квадрата на тока, затова енергията се пренася при високо напрежение и се понижава близо до потребителите.
      </p>
    </div>
  );
}
