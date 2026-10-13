import { useEffect, useRef, useState } from 'react';

// Звук за лабораториите: няколко синусоиди (тон и хармоници) през Web Audio.
// AudioContext се създава само при натискане на бутон – никога при рендериране,
// защото страниците се генерират предварително на сървъра.

/** Една синусоида: честота в Hz и относителна амплитуда (0–1). */
export type Sine = { freq: number; amp: number };

const MAX_GAIN = 0.15;
const FADE = 0.04; // s – плавно усилване и затихване, за да няма пукане

type Voice = { osc: OscillatorNode; gain: GainNode };
type Engine = { ctx: AudioContext; master: GainNode; voices: Voice[] };

function newContext(): AudioContext {
  const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  const Ctor = w.AudioContext ?? w.webkitAudioContext;
  if (!Ctor) throw new Error('Браузърът не поддържа Web Audio.');
  return new Ctor();
}

/** Амплитудите се нормират така, че сборът им да е 1 – сместа никога не е по-силна от един тон. */
const normalized = (partials: Sine[]) => {
  const sum = partials.reduce((s, p) => s + p.amp, 0) || 1;
  return partials.map(p => ({ freq: p.freq, amp: p.amp / sum }));
};

/** Свири смес от синусоиди; update() сменя честотите и силата плавно, докато звучи. */
export function useTone() {
  const engine = useRef<Engine | null>(null);
  const [playing, setPlaying] = useState(false);

  const setVoices = (e: Engine, partials: Sine[]) => {
    const now = e.ctx.currentTime;
    const parts = normalized(partials);
    // Ако броят на синусоидите се е променил, създаваме ги наново
    if (e.voices.length !== parts.length) {
      for (const v of e.voices) {
        v.gain.gain.setTargetAtTime(0, now, FADE / 3);
        v.osc.stop(now + FADE * 3);
      }
      e.voices = parts.map(p => {
        const osc = e.ctx.createOscillator();
        const gain = e.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = p.freq;
        gain.gain.value = 0;
        osc.connect(gain).connect(e.master);
        osc.start();
        return { osc, gain };
      });
    }
    e.voices.forEach((v, i) => {
      v.osc.frequency.setTargetAtTime(parts[i].freq, now, 0.02);
      v.gain.gain.setTargetAtTime(parts[i].amp, now, FADE / 3);
    });
  };

  const start = (partials: Sine[], volume = 1) => {
    if (engine.current) return update(partials, volume);
    const ctx = newContext();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    const e: Engine = { ctx, master, voices: [] };
    engine.current = e;
    setVoices(e, partials);
    master.gain.setTargetAtTime(MAX_GAIN * volume, ctx.currentTime, FADE / 3);
    setPlaying(true);
  };

  /** Сменя тона, ако звучи; иначе не прави нищо. */
  const update = (partials: Sine[], volume = 1) => {
    const e = engine.current;
    if (!e) return;
    setVoices(e, partials);
    e.master.gain.setTargetAtTime(MAX_GAIN * volume, e.ctx.currentTime, FADE / 3);
  };

  const stop = () => {
    const e = engine.current;
    if (!e) return;
    engine.current = null;
    setPlaying(false);
    e.master.gain.setTargetAtTime(0, e.ctx.currentTime, FADE / 3);
    window.setTimeout(() => {
      for (const v of e.voices) v.osc.stop();
      void e.ctx.close();
    }, FADE * 4000);
  };

  // При напускане на страницата спираме веднага
  useEffect(
    () => () => {
      const e = engine.current;
      engine.current = null;
      if (e) void e.ctx.close();
    },
    [],
  );

  return { playing, start, update, stop };
}

// ---------- Ноти ----------

const NAMES = ['до', 'до♯', 'ре', 'ре♯', 'ми', 'фа', 'фа♯', 'сол', 'сол♯', 'ла', 'ла♯', 'си'];
const LATIN = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

/**
 * Най-близката нота при равномерна темперация с ла₄ = 440 Hz и отклонението в центове
 * (1 полутон = 100 цента): 446 Hz → „ла (A4)“, +24.
 */
export function nearestNote(f: number) {
  const n = Math.round(12 * Math.log2(f / 440)); // полутонове от A4
  const midi = 69 + n;
  const name = NAMES[((midi % 12) + 12) % 12];
  const latin = `${LATIN[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
  const exact = 440 * 2 ** (n / 12);
  return { name, latin, exact, cents: Math.round(1200 * Math.log2(f / exact)) };
}
