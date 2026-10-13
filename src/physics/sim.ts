import { useRef, useState } from 'react';
import { useAnimationFrame } from '~/astronomy/components/useAnimationFrame';

// Общи помощници за лабораториите по физика: симулация с фиксирана стъпка и запис на величини.
// Бутоните за симулацията и стрелките са в SimControls.tsx.

// ---------- Симулация ----------

/**
 * Симулация с фиксирана стъпка dt (в секунди физично време): колкото и да е бърз екранът,
 * резултатът е един и същ. step(state, dt) връща новото състояние.
 * speed – колко пъти по-бързо от реалното време тече симулацията.
 * При рендериране на сървъра (prerender) винаги дава началното състояние.
 */
export function useSimulation<S>(init: () => S, step: (s: S, dt: number) => S, { dt = 1 / 240, speed = 1 } = {}) {
  const [state, setState] = useState(init);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const sim = useRef({ state, time, carry: 0 });

  useAnimationFrame(running, frame => {
    const s = sim.current;
    s.carry += frame * speed;
    // Не повече от 2000 стъпки на кадър, за да не замръзне страницата
    for (let i = 0; s.carry >= dt && i < 2000; i++) {
      s.state = step(s.state, dt);
      s.time += dt;
      s.carry -= dt;
    }
    setState(s.state);
    setTime(s.time);
  });

  const reset = (next: S = init()) => {
    sim.current = { state: next, time: 0, carry: 0 };
    setState(next);
    setTime(0);
    setRunning(false);
  };

  return { state, time, running, play: () => setRunning(true), pause: () => setRunning(false), toggle: () => setRunning(r => !r), reset };
}

// ---------- Запис на величини ----------

const SUPERSCRIPT: Record<string, string> = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };

/** Число с десетична запетая и истински минус, до digits знака след запетаята. */
export const fmtNum = (v: number, digits = 2) => {
  const s = v.toLocaleString('bg-BG', { maximumFractionDigits: digits, useGrouping: false });
  return s === '-0' ? '0' : s.replace('-', '−');
};

/** Степен на 10 с горни индекси: 10⁻¹¹. */
export const pow10 = (e: number) => `10${String(e).replace(/./g, ch => SUPERSCRIPT[ch] ?? ch)}`;

/**
 * Число с sig значещи цифри; много големите и много малките – в научен запис:
 * 1234 → „1234“, 0,000567 → „5,67 · 10⁻⁴“, 6,674e−11 → „6,67 · 10⁻¹¹“.
 */
export function sig(v: number, digits = 3) {
  if (v === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(v)));
  if (e >= -3 && e < 5) return fmtNum(Number(v.toPrecision(digits)), Math.max(0, digits - 1 - e));
  const [m, exp] = v.toExponential(digits - 1).split('e');
  const mantissa = fmtNum(Number(m), digits - 1);
  return mantissa === '1' ? pow10(Number(exp)) : `${mantissa} · ${pow10(Number(exp))}`;
}

/** Величина с мерна единица: qty(9.81, 'm/s²') → „9,81 m/s²“. */
export const qty = (v: number, unit: string, digits = 3) => `${sig(v, digits)} ${unit}`;
