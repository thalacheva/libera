import { useState } from 'react';
import LabSvg from '~/LabSvg';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';

// N₂O₄ (безцветен) ⇌ 2NO₂ (кафяв), ΔH ≈ +57 kJ/mol – правата реакция е ендотермична.
// Kc(25 °C) ≈ 0,0046 mol/L; при други температури – по уравнението на Вант Хоф (ΔH приемаме за постоянна).
const DH = 57200;
const RGAS = 8.314;
const KC_298 = 0.0046;
const Kc = (T: number) => KC_298 * Math.exp((-DH / RGAS) * (1 / T - 1 / 298)) * (298 / T);

type State = { V: number; T: number; nNO2: number; nN2O4: number };

/** Равновесен състав при обем V (L), температура T (K) и общо количество азот, изразено като n мола N₂O₄. */
function equilibrium(V: number, T: number, n: number) {
  // y = n(NO₂): y² / (V·(n − y/2)) = Kc  →  y² + (Kc·V/2)·y − Kc·V·n = 0
  const kv = Kc(T) * V;
  const y = (-kv / 2 + Math.sqrt((kv * kv) / 4 + 4 * kv * n)) / 2;
  return { nNO2: y, nN2O4: n - y / 2 };
}

const N0 = 0.004; // mol N₂O₄ в началото
const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',');

/** Спринцовка: дължината е обемът, кафявият цвят – концентрацията на NO₂. */
function Syringe({ x, y, s, title }: { x: number; y: number; s: State; title: string }) {
  const len = (s.V / 0.2) * 170; // 200 mL = 170 px
  const c = s.nNO2 / s.V;
  const opacity = Math.min(1, Math.sqrt(c / 0.12));
  // Молекули като точки: по една на 0,0004 mol
  const dots = (n: number) => Math.round(n / 0.0004);
  const nA = dots(s.nNO2);
  const nB = dots(s.nN2O4);
  const cols = Math.max(1, Math.floor((len - 6) / 11));
  const placed = [...Array(nB).fill('B'), ...Array(nA).fill('A')] as ('A' | 'B')[];
  // Детерминирано „разбъркване“, за да не стоят видовете на групи
  const order = placed.map((k, i) => ({ k, r: (i * 7919) % 97 })).sort((p, q) => p.r - q.r);
  return (
    <g>
      <text x={x} y={y - 10} fontSize="12" fontWeight="600" fill="currentColor">
        {title}
      </text>
      <rect x={x} y={y} width={len} height={60} fill="#92400e" opacity={opacity * 0.85} />
      <rect x={x} y={y} width={len} height={60} fill="none" className="stroke-gray-500" strokeWidth="1" />
      {order.map((m, i) => {
        const cx = x + 8 + (i % cols) * ((len - 10) / cols);
        const cy = y + 9 + Math.floor(i / cols) * 11;
        if (cy > y + 56) return null;
        return m.k === 'A' ? (
          <circle key={i} cx={cx} cy={cy} r={3} className="fill-orange-500 stroke-white" strokeWidth="0.8" />
        ) : (
          <g key={i}>
            <circle cx={cx - 2.2} cy={cy} r={2.2} className="fill-gray-200 stroke-gray-700" strokeWidth="0.7" />
            <circle cx={cx + 2.2} cy={cy} r={2.2} className="fill-gray-200 stroke-gray-700" strokeWidth="0.7" />
          </g>
        );
      })}
      {/* стени и бутало */}
      <path d={`M ${x} ${y} L ${x + 180} ${y} M ${x} ${y + 60} L ${x + 180} ${y + 60} M ${x} ${y - 2} L ${x} ${y + 62}`} className="stroke-gray-600 dark:stroke-gray-300" strokeWidth="2" fill="none" />
      <rect x={x + len} y={y - 3} width={6} height={66} className="fill-gray-500" />
      <line x1={x + len + 6} x2={x + len + 30} y1={y + 30} y2={y + 30} className="stroke-gray-500" strokeWidth="4" />
      <text x={x} y={y + 78} fontSize="11" fill="currentColor">
        [NO₂] = {fmt(c, 3)} mol/L
      </text>
    </g>
  );
}

/** Принцип на Льо Шателие: промени обема, температурата или добави газ и виж как се измества равновесието N₂O₄ ⇌ 2NO₂. */
export default function LeChatelierLab() {
  const start = (): State => ({ V: 0.1, T: 298, ...equilibrium(0.1, 298, N0) });
  // before – съставът точно преди последната промяна; now – условията сега
  const [before, setBefore] = useState<State>(start);
  const [cond, setCond] = useState({ V: 0.1, T: 298, n: N0 });
  const [last, setLast] = useState<string | null>(null);

  const eqNow = equilibrium(cond.V, cond.T, cond.n);
  const after: State = { V: cond.V, T: cond.T, ...eqNow };

  /** Запомня текущото равновесие и прилага промяната. */
  const change = (kind: string, next: { V?: number; T?: number }, add?: { NO2?: number; N2O4?: number }) => {
    const base = { ...after };
    if (add?.NO2) base.nNO2 += add.NO2;
    if (add?.N2O4) base.nN2O4 += add.N2O4;
    setBefore({ ...base, V: next.V ?? cond.V, T: next.T ?? cond.T });
    setCond({ V: next.V ?? cond.V, T: next.T ?? cond.T, n: base.nN2O4 + base.nNO2 / 2 });
    setLast(kind);
  };

  const instant = before; // моловете още не са се променили, условията – да
  const Q = (instant.nNO2 / instant.V) ** 2 / (instant.nN2O4 / instant.V);
  const K = Kc(cond.T);
  const shift = Math.abs(Q / K - 1) < 0.01 ? 0 : Q < K ? 1 : -1;
  const pTotal = ((after.nNO2 + after.nN2O4) * 8.314 * cond.T) / cond.V; // kPa (n в mol, V в L)

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <p className="text-center font-semibold text-gray-800 dark:text-gray-100">
        N₂O₄ (безцветен) ⇌ 2NO₂ (кафяв), ΔH = +57 kJ
      </p>
      <LabSvg viewBox="0 0 480 130" className="w-full h-auto max-w-xl mx-auto block select-none text-gray-800 dark:text-gray-100 mt-2">
        <Syringe x={10} y={30} s={instant} title="веднага след промяната" />
        <text x={240} y={66} fontSize="18" textAnchor="middle" className="fill-gray-500">
          →
        </text>
        <Syringe x={256} y={30} s={after} title="новото равновесие" />
      </LabSvg>
      <div className="flex justify-center gap-4 text-xs text-gray-600 dark:text-gray-400 mt-1">
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1" />
          NO₂
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-gray-300 border border-gray-700 mr-0.5" />
          <span className="inline-block w-2 h-2 rounded-full bg-gray-300 border border-gray-700 mr-1" />
          N₂O₄
        </span>
      </div>

      <Sliders>
        <Slider label="V, mL" value={Math.round(cond.V * 1000)} onChange={v => change('V', { V: v / 1000 })} min={50} max={200} step={10} tone="blue" />
        <Slider label="t, °C" value={cond.T - 273} onChange={v => change('T', { T: v + 273 })} min={0} max={100} step={5} tone="rose" />
      </Sliders>
      <Buttons>
        <DiagramButton onClick={() => change('NO2', {}, { NO2: 0.002 })}>+ NO₂</DiagramButton>
        <DiagramButton onClick={() => change('N2O4', {}, { N2O4: 0.001 })}>+ N₂O₄</DiagramButton>
        <DiagramButton
          onClick={() => {
            setBefore(start());
            setCond({ V: 0.1, T: 298, n: N0 });
            setLast(null);
          }}
        >
          отначало
        </DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'Q =', value: fmt(Q, 4), tone: 'blue' },
            { label: 'Kc =', value: fmt(K, 4), tone: 'rose' },
            { label: 'NO₂ от азота:', value: `${fmt((100 * after.nNO2) / (2 * cond.n), 0)}%` },
            { label: 'p =', value: `${fmt(pTotal, 0)} kPa` },
          ]}
        />
      </div>
      <Note tone={shift === 0 ? 'emerald' : 'amber'}>
        {last === null
          ? 'Системата е в равновесие. Сгъсти или разшири газа, нагрей го или добави газ.'
          : shift === 0
            ? 'Промяната не измества равновесието (Q = K).'
            : `Q ${shift > 0 ? '<' : '>'} K → равновесието се измества ${shift > 0 ? 'надясно – към NO₂' : 'наляво – към N₂O₄'}. ${
                last === 'V'
                  ? shift < 0
                    ? 'При сгъстяване системата намалява броя на молекулите: от 2 NO₂ става 1 N₂O₄. Цветът първо потъмнява (газът е по-гъст), после малко изсветлява.'
                    : 'При разширяване системата увеличава броя на молекулите – повече N₂O₄ се разпада на NO₂.'
                  : last === 'T'
                    ? shift > 0
                      ? 'Нагряването подпомага ендотермичната права реакция: K расте, газът потъмнява.'
                      : 'Охлаждането подпомага екзотермичната обратна реакция: K намалява, газът изсветлява.'
                    : last === 'NO2'
                      ? 'Част от добавения NO₂ се свързва в N₂O₄ – системата „изразходва“ добавеното.'
                      : 'Част от добавения N₂O₄ се разпада на NO₂.'
              }`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Лявата спринцовка показва газа в мига на промяната – моловете са старите, а обемът и температурата са новите. Дясната показва
        състава, след като равновесието се установи отново. Обърни внимание: при промяна на обема или на количествата Kc остава същата – мени
        се само Q. Температурата е единственото, което променя самата Kc. Стойностите са приблизителни (модел с постоянно ΔH).
      </p>
    </div>
  );
}
