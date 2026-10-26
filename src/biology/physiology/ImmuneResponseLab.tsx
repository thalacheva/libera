import { useMemo, useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

/** Полуживот на антителата в кръвта, дни (IgM ≈ 5, IgG ≈ 21). */
const HALF_M = 5;
const HALF_G = 21;
const DAYS = 150;
const DT = 0.1;
/** Условно защитно ниво на IgG (относителни единици). */
const PROTECT = 1000;

type Second = 'same' | 'other' | 'none';

/** Импулс на синтеза на антитела: гаусова крива около center със ширина sd и височина a (единици на ден). */
const pulse = (t: number, center: number, sd: number, a: number) => a * Math.exp(-((t - center) ** 2) / (2 * sd * sd));

/**
 * Титър на антителата срещу антиген A (и срещу B при второ срещане с друг антиген).
 * Първичен отговор: IgM около 8-ия ден, малко IgG около 14-ия. Вторичен (има клетки на паметта): почти само IgG, още на 4–6-ия ден и много повече.
 */
function simulate(day2: number, second: Second) {
  const kM = Math.LN2 / HALF_M;
  const kG = Math.LN2 / HALF_G;
  const prodM = (t: number, t0: number, memory: boolean) => (t < t0 ? 0 : memory ? pulse(t, t0 + 5, 1.8, 28) : pulse(t, t0 + 8, 2.5, 64));
  const prodG = (t: number, t0: number, memory: boolean) => (t < t0 ? 0 : memory ? pulse(t, t0 + 7, 2.5, 1380) : pulse(t, t0 + 14, 4, 11));
  let mA = 0;
  let gA = 0;
  let mB = 0;
  let gB = 0;
  const out: { t: number; mA: number; gA: number; mB: number; gB: number }[] = [];
  const steps = DAYS / DT;
  for (let k = 0; k <= steps; k++) {
    const t = k * DT;
    if (k % 5 === 0) out.push({ t, mA, gA, mB, gB });
    let pM = prodM(t, 0, false);
    let pG = prodG(t, 0, false);
    if (second === 'same') {
      pM += prodM(t, day2, true);
      pG += prodG(t, day2, true);
    }
    const pMB = second === 'other' ? prodM(t, day2, false) : 0;
    const pGB = second === 'other' ? prodG(t, day2, false) : 0;
    mA += (pM - kM * mA) * DT;
    gA += (pG - kG * gA) * DT;
    mB += (pMB - kM * mB) * DT;
    gB += (pGB - kG * gB) * DT;
  }
  return out;
}

const fmt = (v: number, d = 0) => v.toFixed(d).replace('.', ',');

// графиката: логаритмична скала 10⁰ … 10⁵
const X0 = 56;
const X1 = 610;
const Y0 = 290;
const Y1 = 40;
const LMAX = 5;
const px = (t: number) => X0 + (t / DAYS) * (X1 - X0);
const py = (v: number) => Y0 - (Math.min(LMAX, Math.max(0, Math.log10(Math.max(v, 1)))) / LMAX) * (Y0 - Y1);

/** Първичен и вторичен имунен отговор: IgM и IgG в логаритмичен мащаб, памет и специфичност. */
export default function ImmuneResponseLab() {
  const [day2, setDay2] = useState(60);
  const [second, setSecond] = useState<Second>('same');

  const data = useMemo(() => simulate(day2, second), [day2, second]);
  const path = (f: (d: (typeof data)[number]) => number, from = 0) =>
    data
      .filter(d => d.t >= from)
      .map((d, k) => `${k ? 'L' : 'M'} ${px(d.t).toFixed(1)} ${py(f(d)).toFixed(1)}`)
      .join(' ');

  const before = data.filter(d => d.t < day2);
  const after = data.filter(d => d.t >= day2);
  const peak1 = Math.max(...before.map(d => d.gA));
  const peakM1 = Math.max(...before.map(d => d.mA));
  const peak2 = Math.max(...after.map(d => (second === 'other' ? d.gB : d.gA)));
  const ratio = second === 'same' ? peak2 / peak1 : 1;
  const tProtect = (() => {
    if (second === 'none') return null;
    const hit = after.find(d => (second === 'other' ? d.gB : d.gA) >= PROTECT);
    return hit ? hit.t - day2 : null;
  })();
  const atDay2 = data.find(d => d.t >= day2)?.gA ?? 0;

  let msg: string;
  if (second === 'none')
    msg = 'Първичен отговор: няколко дни нищо (B-лимфоцитите, които разпознават антигена, са малко и трябва да се размножат), после първо IgM, а по-късно и малко IgG. След това антителата бавно намаляват – но в тялото остават клетки на паметта.';
  else if (second === 'same')
    msg = `Вторичен отговор: клетките на паметта реагират след 2–3 дни и правят почти само IgG – около ${fmt(ratio)} пъти повече, отколкото при първата среща. Затова втори път човек обикновено не се разболява. На този принцип работят ваксините и реваксинациите.`;
  else
    msg = 'Друг антиген – отговорът пак е първичен, бавен и слаб. Паметта е специфична: клетките, които „помнят“ антиген A, не разпознават антиген B. Затова ваксината срещу морбили не пази от варицела.';

  const days = [0, 30, 60, 90, 120, 150];
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <LabSvg viewBox="0 0 640 330" className="w-full h-auto max-w-3xl mx-auto block select-none text-gray-800 dark:text-gray-100">
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="currentColor" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="currentColor" />
        {days.map(v => (
          <g key={v}>
            <line x1={px(v)} x2={px(v)} y1={Y0} y2={Y0 + 4} stroke="currentColor" />
            <text x={px(v)} y={Y0 + 16} fontSize="11" textAnchor="middle" fill="currentColor">{v}</text>
          </g>
        ))}
        {[0, 1, 2, 3, 4, 5].map(e => (
          <g key={e}>
            <line x1={X0 - 4} x2={X1} y1={py(10 ** e)} y2={py(10 ** e)} className="stroke-gray-200 dark:stroke-gray-700" />
            <text x={X0 - 8} y={py(10 ** e) + 4} fontSize="11" textAnchor="end" fill="currentColor">
              10<tspan dy={-5} fontSize="8">{e}</tspan>
            </text>
          </g>
        ))}
        <text x={(X0 + X1) / 2} y={Y0 + 32} fontSize="12" textAnchor="middle" fill="currentColor">време, дни</text>
        <text x={X0 + 4} y={Y1 - 14} fontSize="12" fill="currentColor">антитела в кръвта (относителни единици, лог. скала)</text>

        <line x1={X0} x2={X1} y1={py(PROTECT)} y2={py(PROTECT)} stroke="#10b981" strokeDasharray="5 4" />
        <text x={X0 + 30} y={py(PROTECT) - 5} fontSize="11" fill="#059669">защитно ниво (условно)</text>

        {/* срещите с антигена */}
        <line x1={px(0)} x2={px(0)} y1={Y0} y2={Y1} stroke="#64748b" strokeDasharray="3 3" />
        <text x={px(0) + 4} y={Y1 + 12} fontSize="11" fill="currentColor">💉 A</text>
        {second !== 'none' && (
          <>
            <line x1={px(day2)} x2={px(day2)} y1={Y0} y2={Y1} stroke="#64748b" strokeDasharray="3 3" />
            <text x={px(day2) + 4} y={Y1 + 12} fontSize="11" fill="currentColor">
              💉 {second === 'same' ? 'A' : 'B'}
            </text>
          </>
        )}

        <path d={path(d => d.mA)} fill="none" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="7 4" />
        <path d={path(d => d.gA)} fill="none" stroke="#e11d48" strokeWidth={3} />
        {second === 'other' && (
          <>
            <path d={path(d => d.mB, day2)} fill="none" stroke="#0ea5e9" strokeWidth={2.5} strokeDasharray="7 4" />
            <path d={path(d => d.gB, day2)} fill="none" stroke="#6366f1" strokeWidth={3} />
          </>
        )}

        {/* легенда */}
        <g fontSize="11" fill="currentColor">
          <line x1={X1 - 190} x2={X1 - 165} y1={Y1 + 34} y2={Y1 + 34} stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="7 4" />
          <text x={X1 - 160} y={Y1 + 38}>IgM срещу A</text>
          <line x1={X1 - 190} x2={X1 - 165} y1={Y1 + 52} y2={Y1 + 52} stroke="#e11d48" strokeWidth={3} />
          <text x={X1 - 160} y={Y1 + 56}>IgG срещу A</text>
          {second === 'other' && (
            <>
              <line x1={X1 - 190} x2={X1 - 165} y1={Y1 + 70} y2={Y1 + 70} stroke="#0ea5e9" strokeWidth={2.5} strokeDasharray="7 4" />
              <text x={X1 - 160} y={Y1 + 74}>IgM срещу B</text>
              <line x1={X1 - 190} x2={X1 - 165} y1={Y1 + 88} y2={Y1 + 88} stroke="#6366f1" strokeWidth={3} />
              <text x={X1 - 160} y={Y1 + 92}>IgG срещу B</text>
            </>
          )}
        </g>
      </LabSvg>

      <Buttons>
        <DiagramButton active={second === 'same'} onClick={() => setSecond('same')}>
          второ срещане с A
        </DiagramButton>
        <DiagramButton active={second === 'other'} onClick={() => setSecond('other')}>
          нов антиген B
        </DiagramButton>
        <DiagramButton active={second === 'none'} onClick={() => setSecond('none')}>
          само първото
        </DiagramButton>
      </Buttons>
      <Sliders>
        <Slider label="ден" value={day2} onChange={setDay2} min={25} max={110} step={1} tone="gray" />
      </Sliders>

      <Readout
        items={[
          { label: 'IgM (1-ви)', value: fmt(peakM1), tone: 'amber' },
          { label: 'IgG (1-ви)', value: fmt(peak1), tone: 'rose' },
          { label: 'IgG (2-ри)', value: second === 'none' ? '–' : fmt(peak2), tone: 'violet' },
          { label: 'до защита', value: tProtect === null ? '–' : `${fmt(tProtect, 1)} дни`, tone: 'emerald' },
        ]}
      />
      <Note tone="rose">{msg}</Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Моделът: при първа среща синтезът на IgM е най-силен около 8-ия ден, а на IgG – около 14-ия; при втора среща със същия антиген
        клетките на паметта правят IgG още на 5–7-ия ден. Антителата се разграждат с полуживот около {HALF_M} дни (IgM) и около {HALF_G} дни
        (IgG). Скалата е логаритмична: всяко деление е 10 пъти повече. В деня на второто срещане от първия отговор са останали{' '}
        {fmt(atDay2)} единици IgG. Числата са условни – при различните антигени и хора те силно се различават, но формата на кривите е
        типична.
      </p>
    </div>
  );
}
