import EggGame from './EggGame';
import { pick, randInt } from './kidsMath';
import { Challenge, type ChallengeItem, ForParents, GameCard, StoryHero, Tip } from './kit';
import LongDivisionGame from './LongDivisionGame';
import MemoryGame from './MemoryGame';
import ShareGame from './ShareGame';

const LEVELS = [
  { id: 'easy', label: ': 2, 5, 10' },
  { id: 'table', label: 'таблицата' },
  { id: 'round', label: 'с кръгли числа' },
  { id: 'mental', label: '72 : 3 наум' },
] as const;
type Level = (typeof LEVELS)[number]['id'];

function makeTask(level: Level): ChallengeItem {
  let k: number;
  let q: number;
  if (level === 'easy') {
    k = pick([2, 5, 10]);
    q = randInt(0, 9) === 0 ? 1 : randInt(2, 10);
  } else if (level === 'table') {
    k = randInt(2, 9);
    q = randInt(2, 9);
  } else if (level === 'round') {
    const kind = pick(['tens', 'hundreds', 'byTen'] as const);
    if (kind === 'tens') {
      // 80 : 4, 120 : 3
      k = randInt(2, 9);
      q = 10 * randInt(2, 9);
    } else if (kind === 'hundreds') {
      k = randInt(2, 9);
      q = 100 * randInt(1, 4);
    } else {
      k = pick([10, 100]);
      q = randInt(2, k === 10 ? 99 : 9);
    }
  } else {
    k = randInt(2, 6);
    q = randInt(11, Math.floor(99 / k));
  }
  return { text: `${k * q} : ${k}`, answer: q };
}

export function Division() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white">Деление</h1>

        <StoryHero emoji="🍒">
          <p>Трима приятели набраха 12 череши и искат да ги разделят честно – всеки да получи колкото другите. По колко череши ще получи всеки?</p>
          <p>Да делиш значи да раздаваш по равно или да подреждаш на равни групи. Хайде да опитаме!</p>
        </StoryHero>

        <GameCard emoji="🍬" title="Раздели бонбоните" tone="amber" goal="Раздай бонбоните така, че всички приятели да имат по равно. По колко получава всеки?">
          <ShareGame />
        </GameCard>
        <Tip>
          Делението е честно разпределяне: 12 : 3 = 4 – всеки от тримата получава по 4. Числото 12 е <b>делимо</b>, 3 – <b>делител</b>, а 4 –
          <b> частно</b>. Ако нещо не стига за всички, то остава – това е <b>остатъкът</b>: 14 : 4 = 3, остатък 2.
        </Tip>

        <GameCard emoji="🥚" title="Кутиите с яйца" tone="emerald" goal="Във всяка кутия влизат еднакъв брой яйца. Колко кутии ще напълним?">
          <EggGame />
        </GameCard>
        <Tip>
          Делението е обратното на умножението: 20 : 5 = 4, защото 4 · 5 = 20. Затова, ако знаеш таблицата за умножение, знаеш и делението!
        </Tip>

        <GameCard emoji="🃏" title="Мемори с делене" tone="pink" goal="Обръщай по две карти. Намери задачата и нейния отговор – например 28 : 7 и 4.">
          <MemoryGame op=":" />
        </GameCard>
        <Tip>
          Всяко число, разделено на <b>1</b>, си остава същото (7 : 1 = 7), а разделено на себе си дава <b>1</b> (7 : 7 = 1). А 0 : 5 = 0 – щом няма
          нищо за раздаване, всеки получава нула.
        </Tip>

        <GameCard emoji="✏️" title="Писмено деление" tone="violet" goal="За 3. и 4. клас: делим цифра по цифра отляво надясно – колко пъти се съдържа делителят и колко остава.">
          <LongDivisionGame />
        </GameCard>
        <Tip>
          Остатъкът винаги е <b>по-малък от делителя</b>. Ако остават 5, а делим на 4, значи можем да дадем още по едно! Провери отговора с
          умножение: 168 · 4 = 672.
        </Tip>

        <Challenge levels={LEVELS} make={makeTask} />

        <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-2xl">
          <p className="font-bold mb-2 text-lg">🤓 Знаеш ли, че…</p>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
            На нула не се дели – никога! Опитай да раздадеш 6 бонбона на 0 деца: няма на кого да ги дадеш. Или помисли така: ако 6 : 0 беше някакво
            число, то това число по 0 трябваше да дава 6. Но всяко число по 0 дава 0. Затова математиците казват, че делението на нула няма смисъл.
          </p>
        </div>

        <ForParents>
          <p>
            Урокът е за 2.–4. клас. Делението има два смисъла и децата трябва да видят и двата: <b>разделяне по равно</b> (12 бонбона на 3 деца – по
            колко?) и <b>разделяне на групи</b> (20 яйца по 5 в кутия – колко кутии?). И в двата случая отговорът се намира с таблицата за умножение.
          </p>
          <ul>
            <li>
              <b>Раздели бонбоните</b> – детето раздава с ръка, по един в чиния или „по един на всички“. На ниво „с остатък“ отговаря и колко
              остават в купата; ако даде на някого повече, играта казва, че не е честно.
            </li>
            <li>
              <b>Кутиите с яйца</b> показват делението като групиране и връзката с умножението: 20 : 5 = 4, защото 4 · 5 = 20.
            </li>
            <li>
              <b>Мемори</b> упражнява табличното деление на части: първо на 2, 5 и 10, после на 3 и 4, накрая на 6–9.
            </li>
            <li>
              <b>Писменото деление</b> е на едноцифрено число, записано както в българските учебници. На всяка стъпка детето казва цифрата на
              частното и остатъка; има задачи с нула в частното (612 : 3 = 204) и с остатък накрая.
            </li>
            <li>
              <b>Предизвикателството</b> има таблично деление, деление на кръгли числа и двуцифрено число на едноцифрено наум. Резултатът се пази в
              „Моят напредък“.
            </li>
          </ul>
          <p>
            Знакът за деление в българските учебници е двоеточие (12 : 3). Насърчавайте проверката с умножение – тя учи детето само да открива
            грешките си.
          </p>
        </ForParents>
      </div>
    </main>
  );
}
