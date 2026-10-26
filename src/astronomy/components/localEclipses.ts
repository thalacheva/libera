// Слънчевите затъмнения, видими от дадено място (за LocalEclipsesLab).
import {
  type Observer,
  localSolarEclipseNear,
  moonEcliptic,
  moonPhases,
  solarMagnitudeAt,
  sunPosition,
  toHorizontal,
  topocentric,
} from '~/tonight/ephemeris';

export type VisibleEclipse = {
  kind: 'partial' | 'annular' | 'total';
  /** Най-голямата фаза, докато Слънцето е над хоризонта. */
  magnitude: number;
  /** Моментът на тази фаза (JD). */
  jd: number;
  /** Слънцето залязва или изгрява по време на затъмнението. */
  atHorizon: boolean;
};

/** Средно новолуние с номер k (Meeus, гл. 49) – истинското е до ~14 часа по-рано или по-късно. */
const meanNewMoon = (k: number) => 2451550.09766 + 29.530588861 * k;

const sunAltitude = (jd: number, obs: Observer) => toHorizontal(topocentric(sunPosition(jd), jd, obs), jd, obs).alt;

/** Затъмненията между jd0 и jd1, които се виждат от наблюдателя (поне част от тях над хоризонта). */
export function visibleSolarEclipses(jd0: number, jd1: number, obs: Observer): VisibleEclipse[] {
  const result: VisibleEclipse[] = [];
  for (let k = Math.ceil((jd0 - meanNewMoon(0)) / 29.530588861); meanNewMoon(k) < jd1; k++) {
    const mean = meanNewMoon(k);
    // Затъмнение е възможно само ако Луната е близо до еклиптиката (|β| < ~1,6° при новолуние)
    if (Math.abs(moonEcliptic(mean).lat) > 2.5) continue;
    const newMoon = moonPhases(mean - 1.5, mean + 1.5).find(e => e.phase === 0);
    const eclipse = newMoon && localSolarEclipseNear(newMoon.jd, obs);
    if (!eclipse) continue;

    let best = 0;
    let bestJd = eclipse.max;
    let hidden = false;
    for (let i = 0; i <= 60; i++) {
      const jd = eclipse.c1 + ((eclipse.c4 - eclipse.c1) * i) / 60;
      if (sunAltitude(jd, obs) < -0.833) {
        hidden = true;
        continue;
      }
      const m = solarMagnitudeAt(jd, obs);
      if (m > best) {
        best = m;
        bestJd = jd;
      }
    }
    if (best <= 0) continue;
    // Пълната или пръстеновидната фаза се брои само ако Слънцето е над хоризонта в максимума
    const centralVisible = eclipse.kind !== 'partial' && sunAltitude(eclipse.max, obs) >= -0.833;
    result.push({ kind: centralVisible ? eclipse.kind : 'partial', magnitude: best, jd: bestJd, atHorizon: hidden });
  }
  return result;
}
