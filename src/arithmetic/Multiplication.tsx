import ArrayGame from './ArrayGame';
import FrogGame from './FrogGame';
import { pick, randInt } from './kidsMath';
import { Challenge, type ChallengeItem, ForParents, GameCard, StoryHero, Tip } from './kit';
import MemoryGame from './MemoryGame';
import MulColumnGame from './MulColumnGame';

const LEVELS = [
  { id: 'easy', label: '· 2, 5, 10' },
  { id: 'table', label: 'таблицата' },
  { id: 'round', label: 'с кръгли числа' },
  { id: 'mental', label: '23 · 4 наум' },
] as const;
type Level = (typeof LEVELS)[number]['id'];

function makeTask(level: Level): ChallengeItem {
  let a: number;
  let b: number;
  if (level === 'easy') {
    a = pick([2, 5, 10]);
    b = randInt(0, 9) === 0 ? pick([0, 1]) : randInt(2, 10);
  } else if (level === 'table') {
    a = randInt(2, 9);
    b = randInt(2, 9);
  } else if (level === 'round') {
    const kind = pick(['tens', 'ten', 'hundred'] as const);
    if (kind === 'tens') {
      a = 10 * randInt(2, 9);
      b = randInt(2, 9);
    } else if (kind === 'ten') {
      a = randInt(2, 99);
      b = 10;
    } else {
      a = randInt(2, 9);
      b = 100;
    }
  } else {
    a = randInt(12, 49);
    b = randInt(2, 6);
    if (a % 10 === 0) a += 1;
  }
  if (randInt(0, 1)) [a, b] = [b, a];
  return { text: `${a} · ${b}`, answer: a * b };
}

export function Multiplication() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white">Умножение</h1>

        <StoryHero emoji="🥐">
          <p>Баба пече кифлички. Нарежда ги в тавата на 4 реда, по 6 във всеки ред. Колко кифлички ще извади от фурната?</p>
          <p>Може да ги преброиш една по една… но има и по-бърз начин: 6 + 6 + 6 + 6, или просто 4 · 6. Това е умножението!</p>
        </StoryHero>

        <GameCard emoji="🌷" title="Лехите" tone="emerald" goal="Цветята са засадени в редове. Колко са всичко? Докосвай редовете, за да броиш, и завърти лехата.">
          <ArrayGame />
        </GameCard>
        <Tip>
          Умножението е бързо събиране на еднакви числа: 3 · 4 = 4 + 4 + 4 = 12. Редът няма значение: 3 · 4 = 4 · 3. Числата 3 и 4 са
          <b> множители</b>, а 12 – <b>произведение</b>.
        </Tip>

        <GameCard emoji="🐸" title="Жабката" tone="sky" goal="Жабката скача все с еднакви скокове. Докосни числото, на което ще кацне. Ще откриеш шарка!">
          <FrogGame />
        </GameCard>
        <Tip>
          Шарките помагат: по 10 – всички завършват на 0; по 5 – на 0 или на 5; по 2 – само четни числа. А при 9 сборът от цифрите е 9: 18, 27,
          36, 45…
        </Tip>

        <GameCard emoji="🃏" title="Мемори с таблицата" tone="pink" goal="Обръщай по две карти. Намери задачата и нейния отговор – например 4 · 7 и 28.">
          <MemoryGame />
        </GameCard>
        <Tip>
          Таблицата се учи на части. Ако знаеш 6 · 7, знаеш и 7 · 6. Всяко число по <b>1</b> остава същото (8 · 1 = 8), а по <b>0</b> става 0 (8 · 0
          = 0). Трудно ли е 6 · 8? Мисли 5 · 8 = 40 и още едно 8: 48.
        </Tip>

        <GameCard emoji="✏️" title="Писмено умножение" tone="violet" goal="За 3. и 4. клас: умножи всяка цифра поред, като започнеш отдясно, и не забравяй пренесеното.">
          <MulColumnGame />
        </GameCard>
        <Tip>
          36 · 4 наум: 30 · 4 = 120 и 6 · 4 = 24, общо 144. Писменото умножение прави същото, само цифра по цифра: 6 · 4 = 24 – пишем 4, пренасяме
          2; 3 · 4 + 2 = 14.
        </Tip>

        <Challenge levels={LEVELS} make={makeTask} />

        <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-2xl">
          <p className="font-bold mb-2 text-lg">🤓 Знаеш ли, че…</p>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
            Таблицата за 9 е винаги в ръцете ти! Протегни десетте си пръста. За 4 · 9 свий четвъртия пръст отляво. Пред него остават 3 пръста, а
            след него – 6. Отговорът е 36! Опитай за 7 · 9: свиваш седмия пръст – 6 пръста пред него и 3 след него, значи 63.
          </p>
        </div>

        <ForParents>
          <p>
            Урокът е за 2.–4. клас. Умножението се показва като правоъгълник (лехата), като еднакви скокове (жабката) и като факти, които се помнят
            (мемори). Най-важно е детето да разбере какво значи 4 · 6, преди да учи таблицата наизуст.
          </p>
          <ul>
            <li>
              <b>Лехите</b> показват умножението като редове по равен брой. Докосването на ред брои „по 6“: 6, 12, 18…, а завъртането показва, че
              4 · 6 = 6 · 4 – това намалява наполовина фактите за запомняне.
            </li>
            <li>
              <b>Жабката</b> е броене през 2, 3, … до 10-ия скок по стотната таблица. Виждат се шарките: колони при 2, 5 и 10, диагонали при 9.
            </li>
            <li>
              <b>Мемори</b> упражнява таблицата на части: първо 2, 5 и 10, после 3 и 4, накрая 6–9. Звездите са по броя опити, така че паметта и
              знанията помагат еднакво.
            </li>
            <li>
              <b>Писменото умножение</b> е с едноцифрен множител (3.–4. клас). Пренесеното се показва над следващата колона със знак „+“.
            </li>
            <li>
              <b>Предизвикателството</b> има и задачи с 10 и 100 и умножение наум на двуцифрено число. Резултатът се пази в „Моят напредък“.
            </li>
          </ul>
          <p>
            Знакът за умножение в българските учебници е точка (4 · 6). Таблицата се запомня най-добре с кратки упражнения всеки ден, а не наведнъж.
            Ако детето бърка 7 · 8, нека го изведе от известно: 7 · 8 = 7 · 7 + 7 или 5 · 8 + 2 · 8.
          </p>
        </ForParents>
      </div>
    </main>
  );
}
