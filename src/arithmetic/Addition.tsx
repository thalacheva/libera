import BalloonGame from './BalloonGame';
import BunnyGame from './BunnyGame';
import ColumnGame from './ColumnGame';
import { Challenge, type ChallengeItem, ForParents, GameCard, StoryHero, Tip } from './kit';
import { pick, randInt } from './kidsMath';
import TenFrameGame from './TenFrameGame';

const LEVELS = [
  { id: 'to10', label: 'до 10' },
  { id: 'to20', label: 'до 20' },
  { id: 'to100', label: 'до 100' },
  { id: 'to1000', label: 'до 1000' },
] as const;
type Level = (typeof LEVELS)[number]['id'];

function makeTask(level: Level): ChallengeItem {
  let a: number;
  let b: number;
  if (level === 'to10') {
    a = randInt(1, 9);
    b = randInt(1, 10 - a);
  } else if (level === 'to20') {
    if (randInt(0, 2) > 0) {
      // през 10: 8 + 5, 7 + 6, …
      a = randInt(3, 9);
      b = randInt(11 - a, 9);
    } else {
      a = randInt(11, 17);
      b = randInt(1, 20 - a);
    }
  } else if (level === 'to100') {
    const kind = pick(['bridge', 'tens', 'two'] as const);
    if (kind === 'bridge') {
      a = 10 * randInt(1, 8) + randInt(3, 9);
      b = randInt(11 - (a % 10), 9);
    } else if (kind === 'tens') {
      a = 10 * randInt(1, 8);
      b = 10 * randInt(1, 10 - a / 10);
    } else {
      a = randInt(12, 68);
      b = randInt(11, 99 - a);
    }
  } else {
    const kind = pick(['hundreds', 'round'] as const);
    if (kind === 'hundreds') {
      a = 100 * randInt(1, 8);
      b = 100 * randInt(1, 10 - a / 100);
    } else {
      a = 10 * randInt(11, 85);
      b = 10 * randInt(2, Math.min(60, 100 - a / 10));
    }
  }
  // по-голямото число не винаги е първо
  if (randInt(0, 1)) [a, b] = [b, a];
  return { text: `${a} + ${b}`, answer: a + b };
}

export function Addition() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white">Събиране</h1>

        <StoryHero emoji="🐿️">
          <p>Катеричката Мими събира жълъди за зимата. Вчера намери 8, а днес – още 5. Колко жълъда има вече в хралупата?</p>
          <p>Хайде да помогнем на Мими! Изиграй игрите една по една, събери звезди ⭐ и накрая опитай Предизвикателството.</p>
        </StoryHero>

        <GameCard emoji="🧺" title="Десетичната кутия" tone="amber" goal="В кутията има 10 места. Колко топчета липсват? А колко става, ако прескочим през 10?">
          <TenFrameGame />
        </GameCard>
        <Tip>
          Числата, които заедно правят 10, са <b>приятели</b>: 1 и 9, 2 и 8, 3 и 7, 4 и 6, 5 и 5. С тях смяташ бързо: 8 + 5 = 8 + <b>2</b> + 3 = 10 + 3 = 13.
        </Tip>

        <GameCard emoji="🐰" title="Зайчето скача" tone="emerald" goal="Помогни на зайчето да направи скоковете – дълги по 10 и къси по 1. Къде ще кацне?">
          <BunnyGame />
        </GameCard>
        <Tip>
          Голямото число раздели на десетици и единици: 37 + 25 = 37 + <b>20</b> + <b>5</b>. Първо два дълги скока (57), после пет къси (62).
        </Tip>

        <GameCard emoji="🎈" title="Спукай балоните" tone="sky" goal="Докосни два балона, които заедно правят числото в облачето. Всяка вярна двойка се пука!">
          <BalloonGame />
        </GameCard>
        <Tip>
          Редът няма значение: 3 + 7 = 7 + 3. Затова е по-лесно да започнеш от <b>по-голямото</b> число: за 2 + 9 мисли 9 + 2.
        </Tip>

        <GameCard emoji="✏️" title="Писмено събиране" tone="pink" goal="За по-големите числа: пиши цифрите на сбора една по една, като започнеш отдясно.">
          <ColumnGame />
        </GameCard>
        <Tip>
          Единиците са под единиците, десетиците – под десетиците. Започваме винаги <b>отдясно</b>. Ако в една колона се получи 10 или повече, пишем
          само последната цифра, а 1 „пренасяме“ в следващата колона.
        </Tip>

        <Challenge levels={LEVELS} make={makeTask} />

        <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-2xl">
          <p className="font-bold mb-2 text-lg">🤓 Знаеш ли, че…</p>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
            Разказват, че когато великият математик Карл Фридрих Гаус бил малък ученик, учителят накарал класа да събере всички числа от 1 до 100.
            Гаус отговорил след минутка: 5050! Той забелязал, че 1 + 100 = 101, 2 + 99 = 101, 3 + 98 = 101… Такива двойки има 50, а 50 пъти по 101
            прави 5050. Опитай по същия начин да събереш числата от 1 до 10: двойките са 1 + 10, 2 + 9, … Колко са и колко прави всяка?
          </p>
        </div>

        <ForParents>
          <p>
            Урокът е за 1.–4. клас. Игрите вървят от лесно към трудно, а всяка има нива – детето може да остане на „до 10“ колкото е нужно. Задачите
            са случайни, затова всяка игра може да се играе много пъти. На компютър може да се пише и с клавиатурата (цифри, Backspace, Enter).
          </p>
          <ul>
            <li>
              <b>Десетичната кутия</b> упражнява двойките до 10 и „моста през 10“ (8 + 5 = 10 + 3) – основата на бързото смятане наум до 20.
              Кутията 2 × 5 помага да се вижда числото наведнъж, без да се брои по едно.
            </li>
            <li>
              <b>Зайчето</b> свързва събирането с числовата права и с разлагането на десетици и единици (37 + 25 = 37 + 20 + 5). На ниво „до 100“
              правата показва надписи само през 5 – детето брои чертичките от най-близкото число.
            </li>
            <li>
              <b>Балоните</b> тренират бързото разпознаване на двойки със сбор 10, до 20 и до 100 (35 + 65).
            </li>
            <li>
              <b>Писменото събиране</b> е за 2.–4. клас: подреждане по разреди и пренасяне. При грешка играта подсказва какво да се събере в колоната.
            </li>
            <li>
              <b>Предизвикателството</b> дава 10 задачи наум; резултатът и сгрешените задачи се пазят в „Моят напредък“ (само в този браузър).
            </li>
          </ul>
          <p>
            Съвети: по-добре 10 минути всеки ден, отколкото час веднъж седмично. Хвалете старанието, не само верния отговор. Ако детето се затруднява,
            вземете истински предмети – копчета, бонбони, кубчета – и наредете задачата пред него.
          </p>
        </ForParents>
      </div>
    </main>
  );
}
