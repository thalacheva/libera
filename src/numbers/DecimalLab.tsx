import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Note } from '~/geometry/diagram';
import { Tex } from '~/MathText';
import { factorize } from './numberMath';

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/**
 * Деление „на ръка“ на p на q: цифрите след запетаята и остатъците преди всяка от тях.
 * Спира, когато остатъкът стане 0 или се повтори – оттам цифрите тръгват отначало.
 */
function longDivision(p: number, q: number) {
  const digits: number[] = [];
  const remainders: number[] = [];
  let r = p % q;
  while (r !== 0 && !remainders.includes(r)) {
    remainders.push(r);
    digits.push(Math.floor((r * 10) / q));
    r = (r * 10) % q;
  }
  return { whole: Math.floor(p / q), digits, remainders, repeatAt: r === 0 ? -1 : remainders.indexOf(r) };
}

/** Деление с остатък стъпка по стъпка: кога десетичната дроб е крайна и откъде идва периодът. */
export default function DecimalLab() {
  const [p, setP] = useState(5);
  const [q, setQ] = useState(7);
  const { whole, digits, remainders, repeatAt } = longDivision(p, q);
  const g = gcd(p, q);
  const reduced = q / g;
  const other = factorize(reduced).filter(([prime]) => prime !== 2 && prime !== 5);
  const finite = repeatAt < 0;

  const pre = digits.slice(0, finite ? digits.length : repeatAt).join('');
  const period = finite ? '' : digits.slice(repeatAt).join('');
  const tex = `\\frac{${p}}{${q}} = ${whole}${digits.length ? `{,}${pre}${period ? `(${period})` : ''}` : ''}`;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="text-center text-xl sm:text-2xl my-2 text-gray-900 dark:text-gray-100 overflow-x-auto">
        <Tex>{tex}</Tex>
      </div>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-2">Остатъците при делението и цифрата, която дава всеки (следващият остатък е от деленето на предишния × 10 на {q}):</p>
      <div className="flex flex-wrap justify-center gap-1.5 font-mono text-sm max-w-xl mx-auto">
        {remainders.map((r, i) => (
          <span
            key={i}
            title={`${r} · 10 = ${r * 10} = ${q} · ${digits[i]} + ${(r * 10) % q}`}
            className={`px-2 py-1 rounded ${
              i === repeatAt
                ? 'bg-violet-600 text-white font-bold'
                : !finite && i > repeatAt
                  ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-100'
            }`}
          >
            {r}
            <span className="text-[10px] opacity-70 ml-1">→{digits[i]}</span>
          </span>
        ))}
        <span className={`px-2 py-1 rounded font-bold ${finite ? 'bg-emerald-500 text-white' : 'bg-violet-600 text-white'}`}>
          {finite ? '0 ■' : `${remainders[repeatAt]} ↺`}
        </span>
      </div>

      <Sliders>
        <Slider label="p" value={p} onChange={setP} min={1} max={60} step={1} tone="blue" />
        <Slider label="q" value={q} onChange={setQ} min={2} max={60} step={1} tone="rose" />
      </Sliders>

      <Note tone={finite ? 'emerald' : 'violet'}>
        {p % q === 0
          ? `${p} се дели на ${q} – получава се цяло число.`
          : finite
            ? `Остатъкът стана 0 – дробта е крайна. Несъкратимият знаменател ${reduced} има само прости делители 2 и 5.`
            : `Остатъкът ${remainders[repeatAt]} се повтори – оттук цифрите тръгват отначало. Периодът има ${period.length} цифри. Несъкратимият знаменател ${reduced} се дели на ${other.map(([prime]) => prime).join(' и ')}.`}
      </Note>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
        💡 Възможните ненулеви остатъци при деление на {q} са само {q - 1}: от 1 до {q - 1}. Затова най-късно след {q - 1} стъпки някой остатък се
        повтаря – и периодът никога не е по-дълъг от {q - 1} цифри. Опитай q = 7, 17 и 19: там периодът е максимално дълъг.
      </p>
    </div>
  );
}
