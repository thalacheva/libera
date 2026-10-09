import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { litPath } from '~/astronomy/components/earthMath';
import { julianDay } from './ephemeris';
import {
  computeNight,
  direction,
  type EclipseItem,
  formatDate,
  formatShortDate,
  formatTime,
  type Night,
  PHASE_ICONS,
  PHASE_NAMES,
  type Place,
  PLACES,
  type ShowerNight,
  todayIso,
  upcomingEclipses,
  upcomingPhases,
  upcomingShowers,
} from './night';
import { NightTimeline } from './NightTimeline';
import { SkyChart } from './SkyChart';

const num = (v: number, digits = 1) =>
  (Math.abs(v) < 0.5 * 10 ** -digits ? 0 : v)
    .toLocaleString('bg-BG', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
    .replace('-', '−');
const pct = (v: number) => `${Math.round(v * 100)}%`;

const PLACE_KEY = 'libera.tonight.place';

function loadPlace(): Place {
  try {
    const id = localStorage.getItem(PLACE_KEY);
    return PLACES.find(p => p.id === id) ?? PLACES[0];
  } catch {
    return PLACES[0];
  }
}

/** Датата на текущата нощ: след полунощ до 6 ч. още е „снощи“. */
function defaultNightDate() {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Sofia',
      hour: 'numeric',
      hourCycle: 'h23',
    }).format(new Date())
  );
  return hour < 6 ? shiftDate(todayIso(), -1) : todayIso();
}

function shiftDate(iso: string, days: number) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

const MONTHS = [
  'януари',
  'февруари',
  'март',
  'април',
  'май',
  'юни',
  'юли',
  'август',
  'септември',
  'октомври',
  'ноември',
  'декември',
];

/** „9 срещу 10 октомври“ или „31 октомври срещу 1 ноември“. */
function nightLabel(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  const nm = next.getUTCMonth();
  return nm === m - 1
    ? `${d} срещу ${next.getUTCDate()} ${MONTHS[nm]}`
    : `${d} ${MONTHS[m - 1]} срещу ${next.getUTCDate()} ${MONTHS[nm]}`;
}

/** Момент по подразбиране за картата: сега, ако е нощ, иначе краят на навигационния здрач. */
function defaultChartTime(night: Night) {
  const now = julianDay(new Date());
  const from = night.sunset ?? night.start;
  const to = night.sunrise ?? night.end;
  if (now > from && now < to) return now;
  return night.nauticalDusk ?? night.civilDusk ?? from + 1 / 24;
}

export function Tonight() {
  const [place, setPlace] = useState<Place>(loadPlace);
  const [date, setDate] = useState(defaultNightDate);
  const night = useMemo(() => computeNight(date, place), [date, place]);
  const [chartJd, setChartJd] = useState(() => defaultChartTime(night));
  const [eclipses, setEclipses] = useState<EclipseItem[] | null>(null);

  useEffect(() => {
    setChartJd(defaultChartTime(night));
  }, [night]);

  // Затъмненията за 10 години отнемат около половин секунда – смятаме ги след показването на страницата
  useEffect(() => {
    setEclipses(null);
    const id = setTimeout(
      () => setEclipses(upcomingEclipses(night.start, place, 10)),
      50
    );
    return () => clearTimeout(id);
  }, [night.start, place]);

  const showers = useMemo(() => upcomingShowers(date, place), [date, place]);
  const phases = useMemo(() => upcomingPhases(night.start), [night.start]);

  const choosePlace = (id: string) => {
    const p = PLACES.find(x => x.id === id) ?? PLACES[0];
    setPlace(p);
    try {
      localStorage.setItem(PLACE_KEY, p.id);
    } catch {
      // Без localStorage просто не запомняме избора
    }
  };

  const sliderFrom = night.sunset ?? night.start;
  const sliderTo = night.sunrise ?? night.end;
  const isTonight = date === defaultNightDate();

  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Какво да наблюдавам тази вечер
        </h1>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl mb-6 shadow-lg">
          <p className="text-lg leading-relaxed">
            🔭 Кои планети се виждат, кога става тъмно, каква е Луната и кога е
            следващото затъмнение – всичко на тази страница се изчислява направо
            в браузъра ви, със същите закони, които учим в лекциите: законите на
            Кеплер, движението на Луната и въртенето на Земята.
          </p>
        </div>

        {/* Място и дата */}
        <div className="flex flex-wrap items-end gap-3 mb-6 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Място
            <select
              value={place.id}
              onChange={e => choosePlace(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              {PLACES.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-1 text-sm font-medium">
            Вечерта на
            <div className="flex items-center gap-1">
              <button
                onClick={() => setDate(shiftDate(date, -1))}
                aria-label="Предишна нощ"
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ChevronLeft size={18} />
              </button>
              <input
                type="date"
                min="1900-01-01"
                max="2049-12-31"
                value={date}
                onChange={e => e.target.value && setDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
              <button
                onClick={() => setDate(shiftDate(date, 1))}
                aria-label="Следваща нощ"
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          {!isTonight && (
            <button
              onClick={() => setDate(defaultNightDate())}
              className="px-3 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
            >
              Тази вечер
            </button>
          )}
        </div>

        <Highlights
          night={night}
          place={place}
          showers={showers}
          eclipses={eclipses}
        />

        {/* Картата */}
        <section className="mb-10">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">
            Небето над {place.name}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Картата показва цялото небе: центърът е точката над главата ви
            (зенитът), кръгът – хоризонтът. Дръжте я над себе си с буквата „С“
            към север – тогава изтокът е отляво, както го виждате, когато
            гледате нагоре. Жълтата пунктирна линия е еклиптиката: край нея се
            движат Слънцето, Луната и планетите.
          </p>
          <div className="rounded-2xl bg-gray-950 p-3 sm:p-4">
            <SkyChart night={night} place={place} jd={chartJd} />
            <div className="mt-3 flex items-center gap-3 text-gray-200">
              <Clock size={18} className="flex-shrink-0" />
              <input
                type="range"
                min={sliderFrom}
                max={sliderTo}
                step={5 / 1440}
                value={Math.min(Math.max(chartJd, sliderFrom), sliderTo)}
                onChange={e => setChartJd(Number(e.target.value))}
                className="w-full accent-pink-400"
                aria-label="Час"
                aria-valuetext={formatTime(chartJd)}
              />
              <span className="tabular-nums font-semibold w-28 text-right">
                {formatTime(chartJd)}
                <span className="block text-xs font-normal text-gray-400">
                  {formatShortDate(chartJd)}
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* Хронология */}
        <section className="mb-10">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">
            Нощта час по час
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Кога се стъмва и кога над хоризонта има Луна и планети. Планетите са
            отбелязани, когато са поне 5° над хоризонта. Кликнете върху лентата,
            за да видите небето в този час.
          </p>
          <NightTimeline
            night={night}
            place={place}
            jd={chartJd}
            onPick={setChartJd}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
            <Fact label="Залез" value={night.sunset} />
            <Fact
              label="Пълен мрак от"
              value={night.astroDusk}
              note="Слънцето е 18° под хоризонта"
            />
            <Fact label="Пълен мрак до" value={night.astroDawn} />
            <Fact label="Изгрев" value={night.sunrise} />
          </div>
        </section>

        <MoonSection night={night} phases={phases} />
        <PlanetsSection night={night} />
        <ShowersSection showers={showers} place={place} />
        <EclipsesSection eclipses={eclipses} place={place} />

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-10 leading-relaxed">
          Как е изчислено: позицията на Луната – по теорията в „Astronomical
          Algorithms“ на Жан Миюс, планетите – по кеплеровите елементи на JPL
          (NASA). Сверени с ефемеридите DE421 на JPL, позициите на Слънцето и
          Луната са точни до около половин дъгова минута, а на планетите – до
          няколко минути. Изгревите, залезите и затъменията са точни до около
          минута. Часовете са в българско време; реалният хоризонт (планини,
          сгради) може да скрие обекти ниско над него.
        </p>
      </div>
    </main>
  );
}

function Fact({
  label,
  value,
  note,
}: {
  label: string;
  value?: number;
  note?: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-lg font-semibold tabular-nums">
        {value ? formatTime(value) : '—'}
      </div>
      {note && (
        <div className="text-xs text-gray-500 dark:text-gray-400">{note}</div>
      )}
    </div>
  );
}

// ---------- Накратко ----------

function Highlights({
  night,
  place,
  showers,
  eclipses,
}: {
  night: Night;
  place: Place;
  showers: ShowerNight[];
  eclipses: EclipseItem[] | null;
}) {
  const items: React.ReactNode[] = [];
  if (night.astroDusk && night.astroDawn) {
    items.push(
      <>
        Слънцето залязва в <b>{formatTime(night.sunset!)}</b>; истински тъмно е
        от <b>{formatTime(night.astroDusk)}</b> до{' '}
        <b>{formatTime(night.astroDawn)}</b>.
      </>
    );
  } else if (night.sunset) {
    items.push(
      <>
        Слънцето залязва в <b>{formatTime(night.sunset)}</b>. Тази нощ не става
        напълно тъмно – Слънцето не слиза на 18° под хоризонта.
      </>
    );
  }

  const moonFree = night.darkNoMoon.reduce((s, [a, b]) => s + (b - a), 0) * 24;
  const moon = night.moon;
  if (moon.illumination < 0.15) {
    items.push(
      <>
        {moon.icon} Луната е почти невидима ({pct(moon.illumination)}) – отлична
        нощ за Млечния път и слабите обекти.
      </>
    );
  } else if (moonFree >= 1) {
    items.push(
      <>
        {moon.icon} {moon.name}, {pct(moon.illumination)} осветена. Тъмно небе
        без Луна:{' '}
        {night.darkNoMoon
          .map(([a, b]) => `${formatTime(a)}–${formatTime(b)}`)
          .join(', ')}
        .
      </>
    );
  } else {
    items.push(
      <>
        {moon.icon} {moon.name}, {pct(moon.illumination)} осветена – светлината
        ѝ пречи на слабите обекти през цялата тъмна част от нощта. Добро време
        за самата Луна!
      </>
    );
  }

  const visible = night.planets.filter(p => p.visible.length > 0);
  if (visible.length) {
    items.push(
      <>
        🪐 Видими планети:{' '}
        {visible.map((p, i) => (
          <span key={p.id}>
            {i > 0 && ', '}
            <span
              className="inline-block w-2.5 h-2.5 rounded-full mr-1 border border-gray-400/50"
              style={{ background: p.color }}
            />
            <b>{p.name}</b> ({p.summary.replace(/\.$/, '').toLowerCase()})
          </span>
        ))}
        .
      </>
    );
  } else {
    items.push(<>🪐 Тази нощ ярките планети не се виждат на тъмно небе.</>);
  }

  const active = showers.filter(s => s.active);
  for (const s of active) {
    items.push(
      <>
        ☄️ Активен метеорен поток: <b>{s.name}</b> – максимум на{' '}
        {formatShortDate(s.peakJd)}
        {s.daysToPeak > 0.5 ? ` (след ${Math.round(s.daysToPeak)} дни)` : ''}.
      </>
    );
  }

  const next = eclipses?.[0];
  if (next) {
    const days = Math.round(next.jd - night.start);
    items.push(
      <>
        🌘 Следващо затъмнение, видимо от {place.name}:{' '}
        <b>{eclipseName(next).toLowerCase()}</b> на {formatDate(next.jd)}{' '}
        {days > 60
          ? `(след ${Math.round(days / 30.4)} месеца)`
          : `(след ${days} дни)`}
        .
      </>
    );
  }

  return (
    <section className="mb-10 p-5 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30">
      <h2 className="text-lg font-semibold mb-3">
        Накратко за нощта {nightLabel(night.date)}
      </h2>
      <ul className="space-y-2 text-base leading-relaxed">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

// ---------- Луната ----------

function MoonDisc({
  elongation,
  size = 120,
}: {
  elongation: number;
  size?: number;
}) {
  const r = size / 2 - 4;
  const e = (elongation * Math.PI) / 180;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="flex-shrink-0"
      aria-hidden
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="#1f2937" />
      <path
        d={litPath(size / 2, size / 2, r, Math.sin(e), 0, -Math.cos(e))}
        fill="#f3f4f6"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#6b7280"
        strokeOpacity="0.5"
      />
    </svg>
  );
}

function MoonSection({
  night,
  phases,
}: {
  night: Night;
  phases: ReturnType<typeof upcomingPhases>;
}) {
  const m = night.moon;
  return (
    <section className="mb-10">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Луната</h2>
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="rounded-full bg-gray-950 p-2">
          <MoonDisc elongation={m.elongation} />
        </div>
        <div className="flex-1 w-full">
          <div className="text-xl font-semibold">
            {m.icon} {m.name}
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Осветена част
            </span>
            <span className="font-medium">{pct(m.illumination)}</span>
            <span className="text-gray-500 dark:text-gray-400">Възраст</span>
            <span className="font-medium">
              {num(m.ageDays)} дни след новолуние
            </span>
            <span className="text-gray-500 dark:text-gray-400">Изгрев</span>
            <span className="font-medium">
              {night.moonrise
                ? `${formatTime(night.moonrise)} (${formatShortDate(night.moonrise)})`
                : 'не изгрява в тази нощ'}
            </span>
            <span className="text-gray-500 dark:text-gray-400">Залез</span>
            <span className="font-medium">
              {night.moonset
                ? `${formatTime(night.moonset)} (${formatShortDate(night.moonset)})`
                : 'не залязва в тази нощ'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            {phases.map(p => (
              <div
                key={p.jd}
                className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-center"
              >
                <div className="text-2xl">{PHASE_ICONS[p.phase]}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {PHASE_NAMES[p.phase]}
                </div>
                <div className="text-sm font-medium">
                  {formatShortDate(p.jd)}, {formatTime(p.jd)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
        💡 Най-интересна за наблюдение с бинокъл е Луната около първа и последна
        четвърт: тогава край границата между светлината и сянката (терминатора)
        кратерите хвърлят дълги сенки. При пълнолуние сенките изчезват и
        повърхността изглежда плоска.
      </p>
    </section>
  );
}

// ---------- Планети ----------

function PlanetsSection({ night }: { night: Night }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl sm:text-2xl font-semibold mb-2">Планетите</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Звездната величина показва яркостта: колкото по-малко е числото, толкова
        по-ярък е обектът. Най-ярките звезди са около 0, а най-слабите, видими с
        просто око в града – около 3–4.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {night.planets.map(p => (
          <div
            key={p.id}
            className={`p-4 rounded-xl border bg-white dark:bg-gray-900 ${p.visible.length ? 'border-gray-200 dark:border-gray-700' : 'border-gray-100 dark:border-gray-800 opacity-70'}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span
                className="w-4 h-4 rounded-full shadow-inner"
                style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }}
              />
              <span className="font-semibold text-lg">{p.name}</span>
              <span className="ml-auto text-sm text-gray-500 dark:text-gray-400 tabular-nums">
                величина {num(p.magnitude)}
              </span>
            </div>
            <p className="font-medium mb-1">{p.summary}</p>
            {p.best && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Най-високо: в {formatTime(p.best.jd)}, на{' '}
                {Math.round(p.best.alt)}° над хоризонта, в посока{' '}
                {direction(p.best.az)}.
              </p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {[
                { jd: p.rise, label: 'Изгрява' },
                { jd: p.set, label: 'Залязва' },
              ]
                .filter(
                  (x): x is { jd: number; label: string } => x.jd !== undefined
                )
                .sort((a, b) => a.jd - b.jd)
                .map(x => `${x.label} в ${formatTime(x.jd)}. `)}
              На {Math.round(p.elongation)}° от Слънцето.
            </p>
            {p.visible.length > 0 && <p className="text-sm mt-2">💡 {p.tip}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------- Метеорни потоци ----------

function moonCondition(s: ShowerNight) {
  if (s.moonFree > 0.7 || s.moonIllumination < 0.25)
    return {
      text: 'отлични условия – Луната не пречи',
      color: 'text-green-700 dark:text-green-400',
    };
  if (s.moonFree > 0.35)
    return {
      text: `Луната (${pct(s.moonIllumination)}) пречи част от нощта`,
      color: 'text-amber-700 dark:text-amber-400',
    };
  return {
    text: `Луната (${pct(s.moonIllumination)}) пречи през повечето време`,
    color: 'text-red-700 dark:text-red-400',
  };
}

function ShowersSection({
  showers,
  place,
}: {
  showers: ShowerNight[];
  place: Place;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl sm:text-2xl font-semibold mb-2">
        Метеорни потоци
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Големите потоци през следващите 12 месеца. ZHR е броят метеори в час при
        идеални условия – с радиант в зенита и много тъмно небе; в
        действителност се виждат по-малко. Условията са изчислени за нощта на
        максимума от {place.name}.
      </p>
      <div className="space-y-3">
        {showers.map(s => {
          const c = moonCondition(s);
          return (
            <div
              key={s.id}
              className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex gap-4"
            >
              <span
                className="w-1.5 rounded-full flex-shrink-0"
                style={{ background: s.color }}
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-semibold text-lg">{s.name}</span>
                  {s.active && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300">
                      активен сега
                    </span>
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    максимум: {formatDate(s.peakJd)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Активен {formatShortDate(s.activeFrom)} –{' '}
                  {formatShortDate(s.activeTo)} · до {s.zhr} метеора/час ·
                  радиант в съзвездието {s.radiant} · {s.speed} km/s
                </div>
                <div className={`text-sm font-medium mt-1 ${c.color}`}>
                  {c.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------- Затъмнения ----------

function eclipseName(e: EclipseItem) {
  if (e.type === 'lunar') {
    return {
      total: 'Пълно лунно затъмнение',
      partial: 'Частично лунно затъмнение',
      penumbral: 'Полусенчесто лунно затъмнение',
    }[e.kind];
  }
  return {
    total: 'Пълно слънчево затъмнение',
    annular: 'Пръстеновидно слънчево затъмнение',
    partial: 'Частично слънчево затъмнение',
  }[e.kind];
}

function eclipseDetails(e: EclipseItem) {
  const range = (a?: number, b?: number) =>
    a && b ? `${formatTime(a)} – ${formatTime(b)}` : '';
  if (e.type === 'lunar') {
    const parts: string[] = [];
    if (e.kind === 'penumbral') {
      parts.push(
        `Максимум в ${formatTime(e.jd)}; Луната само леко потъмнява от едната страна.`
      );
    } else {
      parts.push(
        `В сянката: ${range(e.start, e.end)}; максимум в ${formatTime(e.jd)}.`
      );
      if (e.kind === 'total')
        parts.push(`Пълна фаза: ${range(e.totalStart, e.totalEnd)}.`);
      else
        parts.push(
          `В сянката влиза ${pct(e.magnitude)} от диаметъра на Луната.`
        );
    }
    if (e.visibility === 'partial') {
      parts.push(
        e.maxVisible
          ? `Луната е над хоризонта ${range(e.visibleFrom, e.visibleTo)} – виждаме част от затъмнението, включително максимума.`
          : `Луната е над хоризонта само ${range(e.visibleFrom, e.visibleTo)} – максимумът не се вижда.`
      );
    }
    return parts.join(' ');
  }
  const parts = [
    `От ${formatTime(e.start)} до ${formatTime(e.end)}, максимум в ${formatTime(e.jd)}: Луната закрива ${pct(e.magnitude)} от диаметъра на Слънцето (${pct(e.obscuration)} от площта му).`,
  ];
  if (e.visibility === 'partial') {
    parts.push(
      e.maxVisible
        ? `Слънцето е над хоризонта ${range(e.visibleFrom, e.visibleTo)}.`
        : `Слънцето е над хоризонта само ${range(e.visibleFrom, e.visibleTo)} – виждаме фаза до ${pct(e.visibleMagnitude)}.`
    );
  }
  return parts.join(' ');
}

function EclipsesSection({
  eclipses,
  place,
}: {
  eclipses: EclipseItem[] | null;
  place: Place;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl sm:text-2xl font-semibold mb-2">
        Затъмнения през следващите 10 години
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Само тези, които се виждат от {place.name} – поне отчасти. Слънчевите
        затъмнения са изчислени точно за избраното място: фазата се променя с
        няколко процента между различните градове в България.
      </p>
      {eclipses === null ? (
        <p className="text-sm text-gray-500">Изчислявам…</p>
      ) : (
        <div className="space-y-3">
          {eclipses.map(e => (
            <div
              key={e.jd}
              className={`p-4 rounded-xl border flex gap-4 ${e.type === 'solar' ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30' : 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800'}`}
            >
              <span className="text-3xl leading-none">
                {e.type === 'solar' ? '🌞' : e.kind === 'total' ? '🔴' : '🌘'}
              </span>
              <div>
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-semibold text-lg">
                    {eclipseName(e)}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(e.jd)}
                  </span>
                </div>
                <p className="text-sm mt-1">{eclipseDetails(e)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-sm mt-4 p-3 rounded-lg bg-red-50 text-red-900 dark:bg-red-500/10 dark:text-red-200 border border-red-200 dark:border-red-500/30">
        ⚠️ Никога не гледайте Слънцето – дори частично затъмнено – без
        сертифициран слънчев филтър (ISO 12312-2). Слънчевите очила, опушеното
        стъкло и рентгеновите снимки не пазят очите. Лунните затъмнения са
        напълно безопасни.
      </p>
    </section>
  );
}
