import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Label, Note, Readout, ZoomingSvg } from '~/geometry/diagram';
import { fmtNum } from '~/physics/sim';

const L = 0.017; // разстояние от лещата до ретината в опростеното око, m
const D_RET = 1 / L; // ≈ 58,8 dpt – нужно, за да се съберат успоредни лъчи на ретината

// Обхват на оптичната сила на окото [без напрягане, с най-силна акомодация] в диоптри
const EYES = [
  { name: 'нормално', min: D_RET, max: D_RET + 4 },
  { name: 'късогледо', min: D_RET + 2, max: D_RET + 6 },
  { name: 'далекогледо', min: D_RET - 2, max: D_RET + 2 },
  { name: 'старческо', min: D_RET, max: D_RET + 1 },
];

const AXIS = 104;
const LENS_X = 240;
const RETINA_X = 430;
const MM = (RETINA_X - LENS_X) / (L * 1000); // пиксела на милиметър в окото
const APERTURE = 30; // половината отвор на зеницата в чертежа, px
const GLASSES_X = 196;

/** Опростено око: леща с променлива сила и ретина на 17 mm; очила точно пред окото. */
export default function EyeLab() {
  const [eye, setEye] = useState(1);
  const [dCm, setDCm] = useState(200);
  const [inf, setInf] = useState(false);
  const [glasses, setGlasses] = useState(false);
  const [dg, setDg] = useState(-2);
  const E = EYES[eye];
  const Dg = glasses ? dg : 0;
  const d = dCm / 100;
  const vObj = inf ? 0 : 1 / d; // колко силно разходящи са лъчите от предмета

  // Окото се напряга (акомодира) колкото може, за да събере лъчите на ретината
  const want = D_RET + vObj - Dg;
  const Deye = Math.min(E.max, Math.max(E.min, want));
  const conv = Deye + Dg - vObj; // 1/v в диоптри
  const sharp = Math.abs(conv - D_RET) < 1e-6;
  const v = conv > 0 ? 1 / conv : Infinity; // m, разстояние до точката на събиране

  // Далечна и близка точка на окото (заедно с очилата)
  const farInv = E.min + Dg - D_RET;
  const nearInv = E.max + Dg - D_RET;
  const far = farInv <= 1e-9 ? '∞' : `${fmtNum(100 / farInv, 0)} cm`;
  const near = nearInv <= 1e-9 ? 'няма' : `${fmtNum(100 / nearInv, 0)} cm`;
  const needed = eye === 1 ? -(E.min - D_RET) : eye === 0 ? 0 : 4 - (E.max - D_RET);

  // Лъчите в окото: y(x) = h·(1 − (x − леща)/v)
  const vPx = isFinite(v) ? v * 1000 * MM : Infinity;
  const yAt = (x: number, h: number) => (isFinite(vPx) ? h * (1 - (x - LENS_X) / vPx) : h);
  // Петното не излиза извън ретината в чертежа
  const spot = Math.min(66, Math.abs(yAt(RETINA_X, APERTURE)));
  const focusX = isFinite(vPx) ? LENS_X + vPx : Infinity;
  const startX = 24;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <Buttons>
        {EYES.map((e, i) => (
          <DiagramButton key={e.name} active={i === eye} onClick={() => setEye(i)}>
            {`${e.name} око`}
          </DiagramButton>
        ))}
      </Buttons>
      <ZoomingSvg viewBox="0 0 480 214">
        {/* Очна ябълка */}
        <ellipse cx={(LENS_X + RETINA_X) / 2 + 6} cy={AXIS} rx={(RETINA_X - LENS_X) / 2 + 22} ry={88} className="fill-sky-50 stroke-gray-400 dark:fill-sky-950/30" strokeWidth="2" />
        <path d={`M ${RETINA_X - 6} ${AXIS - 70} Q ${RETINA_X + 16} ${AXIS} ${RETINA_X - 6} ${AXIS + 70}`} fill="none" className="stroke-rose-400" strokeWidth="4" />
        <Label p={{ x: RETINA_X - 6, y: AXIS + 84 }} size={11} tone="rose">
          ретина
        </Label>
        <ellipse cx={LENS_X} cy={AXIS} rx={9} ry={APERTURE + 8} className="fill-amber-200/80 stroke-amber-500" strokeWidth="1.5" />
        <Label p={{ x: LENS_X, y: AXIS - APERTURE - 28 }} size={11} tone="amber">
          леща
        </Label>
        <line x1={startX} y1={AXIS} x2={RETINA_X + 14} y2={AXIS} className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="3 4" />

        {/* Очилата */}
        {glasses && (
          <>
            {Dg < 0 ? (
              <path d={`M ${GLASSES_X - 7} ${AXIS - 44} L ${GLASSES_X + 7} ${AXIS - 44} Q ${GLASSES_X + 1} ${AXIS} ${GLASSES_X + 7} ${AXIS + 44} L ${GLASSES_X - 7} ${AXIS + 44} Q ${GLASSES_X - 1} ${AXIS} ${GLASSES_X - 7} ${AXIS - 44} Z`} className="fill-violet-200/70 stroke-violet-500" strokeWidth="1.5" />
            ) : (
              <path d={`M ${GLASSES_X} ${AXIS - 44} Q ${GLASSES_X + 12} ${AXIS} ${GLASSES_X} ${AXIS + 44} Q ${GLASSES_X - 12} ${AXIS} ${GLASSES_X} ${AXIS - 44} Z`} className="fill-violet-200/70 stroke-violet-500" strokeWidth="1.5" />
            )}
            <Label p={{ x: GLASSES_X, y: AXIS - 58 }} size={11} tone="violet">
              очила
            </Label>
          </>
        )}

        {/* Предметът – не в мащаб */}
        {inf ? (
          <Label p={{ x: startX + 10, y: AXIS - 50 }} size={12} anchor="start">
            ★ от безкрайност
          </Label>
        ) : (
          <>
            <circle cx={startX} cy={AXIS} r={4} className="fill-gray-700 dark:fill-gray-200" />
            <Label p={{ x: 8, y: 200 }} size={11} anchor="start">
              {`предмет на ${fmtNum(dCm)} cm (не в мащаб)`}
            </Label>
          </>
        )}

        {/* Два крайни лъча */}
        {[APERTURE, -APERTURE].map(h => (
          <g key={h} className="stroke-amber-500" strokeWidth="1.8" fill="none">
            <line x1={startX} y1={inf ? AXIS - h : AXIS} x2={LENS_X} y2={AXIS - h} />
            <line x1={LENS_X} y1={AXIS - h} x2={RETINA_X} y2={AXIS - yAt(RETINA_X, h)} />
          </g>
        ))}
        {/* Петното върху ретината */}
        {sharp ? (
          <circle cx={RETINA_X} cy={AXIS} r={5} className="fill-emerald-500" />
        ) : (
          <line x1={RETINA_X + 3} y1={AXIS - spot} x2={RETINA_X + 3} y2={AXIS + spot} className="stroke-rose-600" strokeWidth="5" strokeLinecap="round" />
        )}
        {!sharp && focusX < RETINA_X && <circle cx={focusX} cy={AXIS} r={3.5} className="fill-amber-600" />}
      </ZoomingSvg>

      <Buttons>
        <DiagramButton active={!inf} onClick={() => setInf(false)}>
          близък предмет
        </DiagramButton>
        <DiagramButton active={inf} onClick={() => setInf(true)}>
          звезда (∞)
        </DiagramButton>
        <DiagramButton active={glasses} onClick={() => setGlasses(!glasses)}>
          {glasses ? '👓 с очила' : 'без очила'}
        </DiagramButton>
      </Buttons>
      <Sliders>
        {!inf && <Slider label="d, cm" value={dCm} onChange={setDCm} min={10} max={500} step={5} tone="gray" />}
        {glasses && <Slider label="D, dpt" value={dg} onChange={setDg} min={-5} max={5} step={0.25} tone="violet" />}
      </Sliders>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'далечна точка', value: far },
            { label: 'близка точка', value: near },
            { label: 'нужни очила', value: needed === 0 ? 'не са нужни' : `${needed > 0 ? '+' : '−'}${fmtNum(Math.abs(needed), 1)} dpt`, tone: 'violet' },
          ]}
        />
      </div>
      <Note tone={sharp ? 'emerald' : 'rose'}>
        {sharp
          ? 'Лъчите се събират точно на ретината – виждаш рязко.'
          : focusX < RETINA_X
            ? 'Лъчите се събират пред ретината – образът е размазан. Нужна е разсейвателна леща.'
            : 'Лъчите не успяват да се съберат до ретината – образът е размазан. Нужна е събирателна леща.'}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Окото е опростено: една леща и ретина на 17 mm зад нея. То само мени силата на лещата (акомодира), но в ограничен обхват. Късогледото
        око е твърде силно и не вижда далеч; далекогледото и старческото не могат да се напрегнат достатъчно за близки предмети. Очилата
        смятаме долепени до окото. „Нужни очила“ – за ясно виждане надалеч (късоглед) или за четене от 25 cm (далекоглед, старческо око).
      </p>
    </div>
  );
}
