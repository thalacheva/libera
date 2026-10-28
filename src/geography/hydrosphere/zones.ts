// Природни зони по топлина и влага – опростена схема в духа на диаграмата на Уитакър.
// Влагата се оценява с прага на сухота на Кьопен (урока „Климатите на Земята“): r = P / P_праг.

export type Zone = {
  id: string;
  name: string;
  soil: string;
  veg: string;
  color: string;
};

export const ZONES: Record<string, Zone> = {
  tundra: {
    id: 'tundra',
    name: 'Тундра',
    soil: 'тундрово-глеевите почви и торф върху вечно замръзнала почва',
    veg: 'мъхове, лишеи, джуджеви върби и брези',
    color: '#9fb3c8',
  },
  coldDesert: {
    id: 'coldDesert',
    name: 'Студена пустиня',
    soil: 'слабо развитите каменисти почви',
    veg: 'много рядка – ниски храстчета и треви',
    color: '#d8cfbd',
  },
  coldSteppe: {
    id: 'coldSteppe',
    name: 'Студена степ',
    soil: 'кестенявите почви',
    veg: 'ниски треви и пелин',
    color: '#d4be78',
  },
  taiga: {
    id: 'taiga',
    name: 'Тайга',
    soil: 'подзолистите почви',
    veg: 'иглолистни гори – смърч, бор, ела, лиственица',
    color: '#3e7a5a',
  },
  desert: {
    id: 'desert',
    name: 'Пустиня',
    soil: 'пустинните почви и солончаците',
    veg: 'много рядка – солянки, пелин, кактуси',
    color: '#ead39a',
  },
  steppe: {
    id: 'steppe',
    name: 'Степ',
    soil: 'черноземите, а в по-сухата част – кестенявите почви',
    veg: 'треви – коило, власатка, житняк',
    color: '#d6b85c',
  },
  forestSteppe: {
    id: 'forestSteppe',
    name: 'Лесостеп',
    soil: 'черноземите и сивите горски почви',
    veg: 'дъбови горички сред степни треви',
    color: '#aab65a',
  },
  sclerophyll: {
    id: 'sclerophyll',
    name: 'Твърдолистни гори и храсталаци',
    soil: 'канелените (червеникави) почви',
    veg: 'вечнозелени храсти и дървета – маслина, корков дъб, макия',
    color: '#9c9442',
  },
  mixed: {
    id: 'mixed',
    name: 'Смесени гори',
    soil: 'дерново-подзолистите почви',
    veg: 'смърч, бор, дъб, липа, бреза',
    color: '#4f8c5c',
  },
  broadleaf: {
    id: 'broadleaf',
    name: 'Широколистни гори',
    soil: 'кафявите и сивите горски почви',
    veg: 'дъб, бук, габър, липа, ясен',
    color: '#62a35e',
  },
  wetSubtropical: {
    id: 'wetSubtropical',
    name: 'Влажни субтропични гори',
    soil: 'червените и жълтите почви (червеноземи и жълтоземи)',
    veg: 'вечнозелени дъбове, лавър, магнолия, бамбук',
    color: '#48a07c',
  },
  semidesert: {
    id: 'semidesert',
    name: 'Полупустиня и суха савана',
    soil: 'червено-кафявите почви',
    veg: 'треви и бодливи храсти, акации',
    color: '#dcb46c',
  },
  savanna: {
    id: 'savanna',
    name: 'Савана',
    soil: 'червените почви на саваните',
    veg: 'високи треви с отделни дървета – акации, баобаб',
    color: '#c7a43e',
  },
  seasonal: {
    id: 'seasonal',
    name: 'Сезонни (мусонни) гори',
    soil: 'червените фералитни почви',
    veg: 'гори, които губят листата си в сухия сезон – тик, сал',
    color: '#5f983e',
  },
  rainforest: {
    id: 'rainforest',
    name: 'Влажни екваториални гори',
    soil: 'червено-жълтите фералитни (латеритни) почви',
    veg: 'многоетажни вечнозелени гори – хиляди видове дървета',
    color: '#2e7a3e',
  },
};

/** Прагът на сухота на Кьопен, mm: c = 280 при летни валежи, 140 при равномерни, 0 при зимни. */
export const dryThreshold = (t: number, c: number) => Math.max(20 * t + c, 1);

/** Природната зона при средна годишна температура t (°C), годишни валежи P (mm) и сезон на валежите c. */
export function zoneOf(t: number, P: number, c: number): Zone {
  if (t < -10) return ZONES.tundra;
  const r = P / dryThreshold(t, c);
  if (t < 3) return r < 0.5 ? ZONES.coldDesert : r < 1 ? ZONES.coldSteppe : ZONES.taiga;
  if (t < 20) {
    if (r < 0.5) return ZONES.desert;
    if (r < 1) return ZONES.steppe;
    if (t >= 14) return r < 1.8 ? ZONES.sclerophyll : ZONES.wetSubtropical;
    if (r < 1.4) return ZONES.forestSteppe;
    return t < 7 ? ZONES.mixed : ZONES.broadleaf;
  }
  if (r < 0.5) return ZONES.desert;
  if (r < 1) return ZONES.semidesert;
  if (P < 1700) return ZONES.savanna;
  if (P < 2000) return ZONES.seasonal;
  return ZONES.rainforest;
}

/** Сезонът на валежите по месечните стойности: c за прага на сухота. */
export function seasonOf(lat: number, P: number[]) {
  const summer = lat >= 0 ? P.slice(3, 9) : [...P.slice(0, 3), ...P.slice(9)];
  const f = summer.reduce((a, b) => a + b, 0) / P.reduce((a, b) => a + b, 0);
  return f >= 0.7 ? 280 : f <= 0.3 ? 0 : 140;
}
