import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Formula, Note, Readout } from '~/geometry/diagram';

/** RT/V̄ на водата при 20 °C, MPa. */
const RT_V = 135;
/** Осмотичният потенциал на клетките в листа, MPa – под Ψ = Ψs листът губи тургора си. */
const PSI_S_LEAF = -2.2;
/** При този Ψ на листа устицата започват да се затварят (тургорът е почти изчерпан). */
const PSI_CLOSE = -2.0;
/** Съпротивления по пътя на течната вода (относителни единици): почва→корен, корен→връх на стъблото, стъбло→лист. */
const R_ROOT = 0.3;
const R_STEM = 0.4;
const R_LEAF = 0.3;
/** Гравитационната съставка: ρgh = 0,0098 MPa на метър. */
const GRAV = 0.0098;

const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',').replace('-', '−');

function model(psiSoil: number, rh: number, h: number) {
  const psiAir = RT_V * Math.log(rh / 100);
  // поток при отворени устица – пропорционален на сухотата на въздуха (1 при 50 %)
  const eOpen = (1 - rh / 100) / 0.5;
  const rTot = R_ROOT + R_STEM + R_LEAF;
  let s = 1; // колко отворени са устицата
  const leafAt = (k: number) => psiSoil - GRAV * h - k * eOpen * rTot;
  if (leafAt(1) < PSI_CLOSE) s = eOpen > 0 ? Math.max(0.03, (psiSoil - GRAV * h - PSI_CLOSE) / (eOpen * rTot)) : 1;
  const e = s * eOpen;
  const root = psiSoil - e * R_ROOT;
  const stem = root - e * R_STEM - GRAV * h;
  const leaf = stem - e * R_LEAF;
  return { psiAir, e, s, root, stem, leaf, turgor: Math.max(0, leaf - PSI_S_LEAF) };
}

// Чертежът: редове с ленти, скала 0 … −3 MPa
const BX = 250;
const BW = 330;
const MAX = 3;
const bx = (psi: number) => BX + (Math.min(-psi, MAX) / MAX) * BW;

/** Воден потенциал по пътя почва → корен → стъбло → лист → въздух; водата тече към по-ниския Ψ. */
export default function WaterPotentialLab() {
  const [psiSoil, setPsiSoil] = useState(-0.1);
  const [rh, setRh] = useState(60);
  const [h, setH] = useState(20);

  const m = model(psiSoil, rh, h);
  const rows = [
    { name: 'въздух', psi: m.psiAir, color: '#38bdf8' },
    { name: 'лист', psi: m.leaf, color: '#10b981' },
    { name: `стъбло (на ${h} m)`, psi: m.stem, color: '#a16207' },
    { name: 'корен', psi: m.root, color: '#d97706' },
    { name: 'почва', psi: psiSoil, color: '#78350f' },
  ];
  const wilted = m.turgor <= 0.001;
  const closing = m.s < 0.999;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 300" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        {/* растението */}
        <rect x={20} y={250} width={150} height={40} fill="#a16207" opacity={0.35} />
        <line x1={95} y1={250} x2={95} y2={60} stroke="#78350f" strokeWidth={6} />
        {[-1, 1].map(sd => (
          <g key={sd}>
            <path d={`M95 255 q ${sd * 20} 10 ${sd * 40} 30`} fill="none" stroke="#92400e" strokeWidth={3} />
            <ellipse cx={95 + sd * 30} cy={70} rx={28} ry={11} transform={`rotate(${sd * -20} ${95 + sd * 30} 70)`} fill={wilted ? '#a3a3a3' : '#34d399'} stroke="#047857" />
          </g>
        ))}
        {/* стрелки на водата */}
        {m.e > 0.01 &&
          [230, 180, 130, 90].map(y => (
            <path key={y} d={`M 105 ${y} l 0 -16 m -5 6 l 5 -6 l 5 6`} fill="none" stroke="#0284c7" strokeWidth={2} />
          ))}
        {m.e > 0.01 && <text x={135} y={34} fontSize="12" fill="#0284c7">водна пара ↑</text>}

        {/* ленти */}
        <text x={BX} y={22} fontSize="12" fontWeight="700" fill="currentColor">
          Воден потенциал Ψ, MPa
        </text>
        {[0, -1, -2, -3].map(v => (
          <g key={v}>
            <line x1={bx(v)} x2={bx(v)} y1={32} y2={280} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={bx(v)} y={294} fontSize="11" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400">
              {v === 0 ? '0' : `−${-v}`}
            </text>
          </g>
        ))}
        {rows.map((r, k) => {
          const y = 40 + k * 48;
          const off = -r.psi > MAX;
          return (
            <g key={r.name}>
              <text x={BX - 8} y={y + 20} fontSize="12" textAnchor="end" fill="currentColor">
                {r.name}
              </text>
              <rect x={BX} y={y + 6} width={bx(r.psi) - BX} height={22} fill={r.color} opacity={0.8} rx={2} />
              {off && <path d={`M ${BX + BW - 18} ${y + 2} l 8 15 l -6 0 l 8 15`} fill="none" stroke="white" strokeWidth={4} />}
              <text x={off ? BX + BW - 26 : bx(r.psi) + 6} y={y + 21} fontSize="12" fontWeight="700" textAnchor={off ? 'end' : 'start'} fill={off ? 'white' : 'currentColor'}>
                {fmt(r.psi, off ? 1 : 2)}
              </text>
            </g>
          );
        })}
      </LabSvg>

      <Sliders>
        <Slider label="Ψ почва" value={psiSoil} onChange={setPsiSoil} min={-1.5} max={-0.05} step={0.05} tone="amber" />
        <Slider label="влажн., %" value={rh} onChange={setRh} min={40} max={97} step={1} tone="blue" />
        <Slider label="h, m" value={h} onChange={setH} min={1} max={110} step={1} tone="emerald" />
      </Sliders>

      <Readout
        items={[
          { label: 'поток вода', value: `${fmt(m.e)} отн. ед.`, tone: 'blue' },
          { label: 'устица', value: wilted ? 'затворени' : closing ? `${Math.round(m.s * 100)} % отворени` : 'отворени', tone: 'emerald' },
          { label: 'Ψp на листа', value: `${fmt(m.turgor)} MPa`, tone: 'rose' },
        ]}
      />
      <Formula>
        Ψ въздух = (RT/V̄) · ln(φ) = 135 · ln {fmt(rh / 100)} ≈ {fmt(m.psiAir, 1)} MPa
      </Formula>
      <Note tone="emerald">
        {wilted
          ? 'Почвата е твърде суха (а растението – високо): дори със затворени устица листът губи тургора си и вехне.'
          : closing
            ? 'Листът наближава границата на тургора – устицата се притварят и транспирацията намалява. Растението пести вода, но поема и по-малко CO₂.'
            : rh >= 95
              ? 'Във въздух, почти наситен с пари, Ψ на въздуха е само няколко мегапаскала под нулата – водата се движи бавно.'
              : 'Ψ намалява по целия път от почвата до въздуха и водата тече „надолу“ по него. Най-големият скок е между листа и въздуха.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Моделът: потокът е пропорционален на сухотата на въздуха (1 при 50 % влажност и отворени устица); по пътя на течната вода Ψ пада с потока по съпротивленията на
        корена, стъблото и листа, а височината добавя 0,0098 MPa на метър (ρgh). Когато Ψ на листа падне до {fmt(PSI_CLOSE, 1)} MPa,
        устицата се притварят, за да не изгуби листът тургора си (Ψs на клетките му е {fmt(PSI_S_LEAF, 1)} MPa). Изсуши почвата и
        увеличи височината.
      </p>
    </div>
  );
}
