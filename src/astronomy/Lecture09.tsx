import Example from '~/Example';
import Quiz, { type Question } from '~/Quiz';
import Theorem from '~/Theorem';
import BlackbodyLab from './components/BlackbodyLab';
import DopplerLab from './components/DopplerLab';
import EMSpectrumExplorer from './components/EMSpectrumExplorer';
import HydrogenAtom from './components/HydrogenAtom';
import KirchhoffLab from './components/KirchhoffLab';
import SpectrumDetective from './components/SpectrumDetective';
import Task, { TaskBoard, TaskLevel } from '~/Task';
import { Tex } from '~/MathText';

const QUIZ: Question[] = [
  {
    question: 'Фотоните на кое излъчване имат най-голяма енергия?',
    answers: ['Радиовълни', 'Видима светлина', 'Рентгенови лъчи', 'Гама лъчи'],
    correctAnswer: 'Гама лъчи',
  },
  {
    question: 'Звезда излъчва най-силно при $\\lambda = 1000\\ \\mathrm{nm}$, а Слънцето – при ~$500\\ \\mathrm{nm}$. Каква е звездата?',
    answers: ['Два пъти по-гореща', 'Два пъти по-студена', 'Със същата температура', 'Четири пъти по-студена'],
    correctAnswer: 'Два пъти по-студена',
  },
  {
    question: 'Ако температурата на звезда се удвои, а радиусът ѝ остане същият, светимостта ѝ нараства:',
    answers: ['2 пъти', '4 пъти', '8 пъти', '16 пъти'],
    correctAnswer: '16 пъти',
  },
  {
    question: 'Откъде идват тъмните (Фраунхоферови) линии в спектъра на Слънцето?',
    answers: [
      'От слънчевите петна',
      'От поглъщане в по-хладните външни слоеве на Слънцето',
      'От дефект на призмата',
      'От облаците в земната атмосфера',
    ],
    correctAnswer: 'От поглъщане в по-хладните външни слоеве на Слънцето',
  },
  {
    question: 'Коя серия линии на водорода попада във видимата област?',
    answers: ['Лайман', 'Балмер', 'Пашен', 'Никоя'],
    correctAnswer: 'Балмер',
  },
  {
    question: 'Линиите в спектъра на галактика са изместени към червения край. Какво означава това?',
    answers: ['Галактиката е студена', 'Галактиката се приближава', 'Галактиката се отдалечава', 'Галактиката съдържа много желязо'],
    correctAnswer: 'Галактиката се отдалечава',
  },
  {
    question: 'Защо рентгеновите телескопи се изстрелват в космоса?',
    answers: [
      'За да са по-близо до звездите',
      'Защото атмосферата не пропуска рентгеновите лъчи',
      'Защото на Земята е твърде светло',
      'Заради въртенето на Земята',
    ],
    correctAnswer: 'Защото атмосферата не пропуска рентгеновите лъчи',
  },
];

const FRAUNHOFER = [
  { letter: 'A', nm: '759,4', source: 'O₂ в земната атмосфера' },
  { letter: 'C', nm: '656,3', source: 'водород (Hα)' },
  { letter: 'D₁, D₂', nm: '589,6 и 589,0', source: 'натрий' },
  { letter: 'b', nm: '517–518', source: 'магнезий' },
  { letter: 'F', nm: '486,1', source: 'водород (Hβ)' },
  { letter: 'H, K', nm: '396,8 и 393,4', source: 'йонизиран калций' },
];

const LEARN = [
  { icon: '🧪', title: 'Химичен състав', text: 'кои елементи има – по положението на линиите' },
  { icon: '🌡️', title: 'Температура', text: 'по формата на непрекъснатия спектър (закон на Вин) и по това кои линии са силни' },
  { icon: '🚀', title: 'Радиална скорост', text: 'от доплеровото отместване на линиите' },
  { icon: '🌀', title: 'Въртене', text: 'единият ръб се приближава, другият се отдалечава – линиите се разширяват' },
  { icon: '🧲', title: 'Магнитно поле', text: 'линиите се разцепват на няколко (ефект на Зееман)' },
  { icon: '🎈', title: 'Плътност', text: 'в плътните атмосфери на джуджетата линиите са по-широки, отколкото при гигантите' },
];

export default function Lecture09() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 9: Светлина и спектри
        </h1>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <p className="text-lg sm:text-xl leading-relaxed">
            🌈 През 1835 г. философът Огюст Конт дава пример за нещо, което човечеството никога няма да узнае: от какво са направени
            звездите. Само 24 години по-късно Кирхоф и Бунзен показват, че химичният състав се чете от светлината – всеки елемент оставя
            в спектъра свой „баркод“. А през 1868 г. в спектъра на Слънцето е открит елемент, непознат на Земята. Нарекли са го хелий – от
            гръцкото „хелиос“, Слънце.
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">1. Какво е светлината</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Светлината е електромагнитна вълна – трептящи електрично и магнитно поле, които се разпространяват във вакуум с
            най-голямата възможна скорост. Същевременно тя се излъчва и поглъща на порции – <strong>фотони</strong>. Видимата светлина е
            само тясна ивица от много по-широк електромагнитен спектър.
          </p>
          <Theorem
            title="Вълна и фотон"
            description="Дължината на вълната $\lambda$ и честотата $\nu$ са свързани чрез скоростта на светлината: $c = \lambda \cdot \nu$, където $c \approx 3 \cdot 10^8\ \mathrm{m/s}$. Енергията на един фотон е $E = h \cdot \nu = h \cdot c / \lambda$, където $h = 6{,}626 \cdot 10^{-34}\ \mathrm{J\cdot s}$ е константата на Планк. Колкото по-къса е вълната, толкова по-енергичен е фотонът."
          />

          <EMSpectrumExplorer />

          <Example
            description="Каква е енергията на фотон от зелена светлина с $\lambda = 500\ \mathrm{nm}$?"
            steps={[
              '$E = h \\cdot c / \\lambda = \\frac{6{,}626 \\cdot 10^{-34} \\cdot 3 \\cdot 10^8}{5 \\cdot 10^{-7}}$',
              '$E \\approx 3{,}98 \\cdot 10^{-19}\\ \\mathrm{J}$',
              'В електронволтове ($1\\ \\mathrm{eV} = 1{,}602 \\cdot 10^{-19}\\ \\mathrm{J}$): $E \\approx 2{,}5\\ \\mathrm{eV}$.',
              'За сравнение: рентгенов фотон има хиляди eV, а радиофотон – милионни части от eV.',
            ]}
          />

          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Защо има телескопи в космоса?</h3>
            <p className="text-sm sm:text-base">
              Атмосферата пропуска добре само два „прозореца“: видимата светлина (с малко близко ултравиолетово и инфрачервено) и
              радиовълните от около 1 cm до 10 m. Гама, рентгеновите и повечето ултравиолетови лъчи се поглъщат високо в атмосферата –
              за щастие на живота на Земята. Затова „Чандра“ и „Ферми“ са в орбита, а инфрачервеният „Джеймс Уеб“ е на 1,5 милиона km,
              далеч и от топлината на Земята.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">2. Топлинно излъчване</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Всяко нагрято тяло свети. Желязото в ковачницата става първо тъмночервено, после оранжево, а накрая бяло. Звездите се
            държат почти като идеално <strong>черно тяло</strong> – тяло, което поглъща всичко, падащо върху него, и излъчва спектър,
            зависещ само от температурата му.
          </p>
          <Theorem
            title="Закон на Вин"
            description="Дължината на вълната, при която черното тяло излъчва най-силно, е обратно пропорционална на температурата: $\lambda_{\mathrm{max}} \cdot T = b$, където $b = 2{,}898 \cdot 10^{-3}\ \mathrm{m\cdot K}$. По-горещите звезди са по-сини, по-студените – по-червени."
          />
          <Theorem
            title="Закон на Стефан–Болцман"
            description="Енергията, излъчвана за секунда от $1\ \mathrm{m}^2$ от повърхността, е $F = \sigma \cdot T^4$, където $\sigma = 5{,}67 \cdot 10^{-8}\ \mathrm{W/(m^{2}\cdot K^{4})}$. Звезда с радиус $R$ има светимост $L = 4\pi R^2 \cdot \sigma T^4$. Два пъти по-гореща звезда излъчва от всеки квадратен метър 16 пъти повече."
          />

          <BlackbodyLab />

          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
            <p className="font-semibold mb-1">🤔 Защо няма зелени звезди?</p>
            <p>
              Слънцето излъчва най-силно точно в зелено-синята област, но не изглежда зелено. Кривата на Планк е широка: звездата
              излъчва едновременно и червено, и синьо почти толкова силно. Окото смесва всичко и вижда бяло. При по-ниска температура
              надделява червеното, при по-висока – синьото, но „зелен“ връх никога не е достатъчно остър, за да оцвети звездата.
            </p>
          </div>

          <Example
            description="Червеният свръхгигант Бетелгейзе излъчва най-силно при $\lambda_{\mathrm{max}} \approx 830\ \mathrm{nm}$. Каква е температурата на повърхността му?"
            steps={[
              '$T = b / \\lambda_{\\mathrm{max}} = \\frac{2{,}898 \\cdot 10^{-3}}{8{,}3 \\cdot 10^{-7}}$',
              '$T \\approx 3500\\ \\mathrm{K}$',
              'Това е 1,65 пъти по-студено от Слънцето. От $1\\ \\mathrm{m}^2$ Бетелгейзе излъчва $(1 / 1{,}65)^4 \\approx 0{,}13$ от слънчевия поток, но е огромна ($R \\approx 700\\,R_{\\odot}$), затова светимостта ѝ е десетки хиляди пъти по-голяма.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">3. Спектри и законите на Кирхоф</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Когато светлината мине през призма или дифракционна решетка, тя се разлага по дължини на вълната – получава се{' '}
            <strong>спектър</strong>. През 1814 г. Йозеф Фраунхофер забелязва в слънчевия спектър стотици тъмни линии. Смисълът им
            обясняват Кирхоф и Бунзен през 1859 г. с три прости правила.
          </p>

          <KirchhoffLab />

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 shadow-sm">
            <h3 className="font-semibold mb-2">Най-известните Фраунхоферови линии</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 dark:text-gray-400">
                    <th className="py-1 pr-4 font-medium">Линия</th>
                    <th className="py-1 pr-4 font-medium">λ, nm</th>
                    <th className="py-1 font-medium">Произход</th>
                  </tr>
                </thead>
                <tbody>
                  {FRAUNHOFER.map(row => (
                    <tr key={row.letter} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="py-1 pr-4 font-bold">{row.letter}</td>
                      <td className="py-1 pr-4 font-mono">{row.nm}</td>
                      <td className="py-1">{row.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
              Звездите дават абсорбционен спектър: горещата плътна вътрешност свети непрекъснато, а по-хладните външни слоеве поглъщат
              линиите на своите елементи. Мъглявините, осветени от горещи звезди, дават емисионен спектър.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">4. Атомът и спектралните линии</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Защо всеки елемент има свои линии? През 1913 г. Нилс Бор предлага модел, в който електронът в атома може да има само
            определени енергии – <strong>енергетични нива</strong>. Атомът излъчва или поглъща фотон само когато електронът прескача
            между две нива, а енергията на фотона е точно разликата между тях. Всеки елемент има своя „стълбица“ от нива, значи и свой
            набор от линии.
          </p>
          <Theorem
            title="Линии на водорода (формула на Ридберг)"
            description="Енергията на n-тото ниво на водорода е $E_n = -13{,}6\ \mathrm{eV} / n^2$. При преход от ниво $n_2$ към по-ниско ниво $n_1$ се излъчва фотон с дължина на вълната $\frac{1}{\lambda} = R \cdot (\frac{1}{n_1^2} - \frac{1}{n_2^2})$, където $R = 1{,}097 \cdot 10^7\ \mathrm{m^{-1}}$ е константата на Ридберг. Преходите към $n_1 = 1$ образуват серията на Лайман (ултравиолетово), към $n_1 = 2$ – серията на Балмер (видимо), а към $n_1 = 3$ – серията на Пашен (инфрачервено)."
          />

          <HydrogenAtom />

          <Example
            description="Изчисли дължината на вълната на линията Hα (преход 3 → 2)."
            steps={[
              '$\\frac{1}{\\lambda} = R \\cdot (\\frac{1}{2^2} - \\frac{1}{3^2}) = 1{,}097 \\cdot 10^7 \\cdot (\\frac{1}{4} - \\frac{1}{9})$',
              '$\\frac{1}{\\lambda} = 1{,}097 \\cdot 10^7 \\cdot \\frac{5}{36} \\approx 1{,}524 \\cdot 10^6\\ \\mathrm{m^{-1}}$',
              '$\\lambda \\approx 6{,}56 \\cdot 10^{-7}\\ \\mathrm{m} = 656\\ \\mathrm{nm}$ – червената линия, която оцветява мъглявините в розово.',
            ]}
          />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">5. Спектрален анализ</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Астрономите сравняват спектъра на звездата със спектри, получени в лаборатория. Ако всички линии на даден елемент са на
            местата си, елементът присъства. Опитайте сами:
          </p>

          <SpectrumDetective />

          <h3 className="font-semibold mb-3">Какво още научаваме от спектъра?</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {LEARN.map(item => (
              <div key={item.title} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                <p className="font-semibold">
                  {item.icon} {item.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">6. Доплеров ефект</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Сирената на линейка звучи по-високо, когато колата приближава, и по-ниско, когато се отдалечава. Със светлината се случва
            същото: ако звездата се приближава, вълните пристигат „сгъстени“ и линиите се отместват към синия край; ако се отдалечава –
            към червения.
          </p>
          <Theorem
            title="Доплерово отместване"
            description="При скорости, много по-малки от скоростта на светлината: $\Delta\lambda / \lambda = v / c$, където $\Delta\lambda = \lambda_{\text{набл}} - \lambda_{\text{лаб}}$, а $v$ е радиалната скорост (по лъча на зрението). $v > 0$ – отдалечаване, червено отместване; $v < 0$ – приближаване, синьо отместване. Величината $z = \Delta\lambda / \lambda$ се нарича червено отместване. Движението напряко на лъча на зрението не отмества линиите."
          />

          <DopplerLab />

          <Example
            description="В спектъра на звезда линията Hα (656,3 nm) е наблюдавана при 656,85 nm. С каква скорост се движи звездата?"
            steps={[
              '$\\Delta\\lambda = 656{,}85 - 656{,}3 = 0{,}55\\ \\mathrm{nm}$ (положително – червено отместване)',
              '$v = c \\cdot \\Delta\\lambda / \\lambda = 300\\,000 \\cdot 0{,}55 / 656{,}3$',
              '$v \\approx +250\\ \\mathrm{km/s}$ – звездата се отдалечава от нас.',
            ]}
          />

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Приложения</h3>
            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
              <li>
                <strong>Двойни звезди</strong> – линиите се люшкат напред-назад с периода на обикаляне (Лекция 22).
              </li>
              <li>
                <strong>Екзопланети</strong> – планетата кара звездата да се поклаща с няколко m/s (Лекция 30).
              </li>
              <li>
                <strong>Разширяване на Вселената</strong> – почти всички галактики имат червено отместване, толкова по-голямо, колкото
                по-далеч са (закон на Хъбъл, Лекция 28).
              </li>
              <li>
                <strong>Въртене</strong> на звезди, галактики и планети – например въртенето на пръстените на Сатурн.
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">7. 🎯 Бърз тест</h2>
          <Quiz questions={QUIZ} />
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">8. 📝 Задачи за упражнение</h2>
          <TaskBoard>
          <div className="mb-6">
            <TaskLevel level="A" />

            <Task id="a1" number={1} color="border-green-500" question="Подреди видовете електромагнитно излъчване от най-късите към най-дългите вълни.">
              <p>Гама лъчи → рентгенови лъчи → ултравиолетово → видима светлина → инфрачервено → микровълни → радиовълни.</p>
              <p>В същия ред намаляват честотата и енергията на фотоните.</p>
            </Task>

            <Task id="a2" number={2} color="border-green-500" question="Каква е разликата между емисионен и абсорбционен спектър? Какъв спектър дават звездите?">
              <p>
                <strong>Емисионен:</strong> ярки линии на тъмен фон – излъчва нагрят разреден газ (мъглявина, неонова лампа).
              </p>
              <p>
                <strong>Абсорбционен:</strong> тъмни линии върху непрекъсната дъга – получава се, когато светлина от горещ източник мине
                през по-хладен газ.
              </p>
              <p>Звездите дават абсорбционен спектър: външните им слоеве са по-хладни от вътрешните.</p>
            </Task>

            <Task id="a3" number={3} color="border-green-500" question="Ригел е синкав, а Антарес – червеникав. Коя от двете звезди е по-гореща и защо?">
              <p>
                Ригел. По закона на Вин по-горещото тяло излъчва най-силно при по-къси вълни, т.е. към синия край. Ригел има около 12 000 K,
                а Антарес – около 3500 K.
              </p>
            </Task>
          </div>

          <div className="mb-6">
            <TaskLevel level="B" />

            <Task id="b1" number={4} color="border-yellow-500" question="Звезда се приближава към нас със скорост $60\ \mathrm{km/s}$. С колко се отмества линия с $\lambda = 500\ \mathrm{nm}$ и накъде?">
              <p><Tex>{'\\Delta\\lambda = \\lambda \\cdot v / c = 500\\ \\mathrm{nm} \\cdot 60 / 300\\,000 = 0{,}1\\ \\mathrm{nm}'}</Tex></p>
              <p>
                Звездата се приближава, затова линията се отмества към синия край: наблюдаваме я при <strong>499,9 nm</strong>.
              </p>
            </Task>

            <Task id="b2" number={5} color="border-yellow-500" question="Звезда излъчва най-силно при $\lambda_{\mathrm{max}} = 500\ \mathrm{nm}$. Каква е температурата ѝ?">
              <p><Tex>{'T = b / \\lambda_{\\mathrm{max}} = \\frac{2{,}898 \\cdot 10^{-3}}{5 \\cdot 10^{-7}} \\approx 5800\\ \\mathrm{K}'}</Tex></p>
              <p>
                <strong>Отговор: около 5800 K</strong> – почти колкото Слънцето (5772 K).
              </p>
            </Task>

            <Task
              id="b3"
              number={6}
              color="border-yellow-500"
              question="Сириус A има температура $9940\ \mathrm{K}$ и радиус $1{,}71\,R_{\odot}$. Колко пъти светимостта му е по-голяма от слънчевата ($T_{\odot} = 5772\ \mathrm{K}$)?"
            >
              <p><Tex>{'L / L_{\\odot} = (R / R_{\\odot})^2 \\cdot (T / T_{\\odot})^4'}</Tex></p>
              <p><Tex>{'L / L_{\\odot} = 1{,}71^2 \\cdot (9940 / 5772)^4 = 2{,}92 \\cdot 1{,}722^4 \\approx 2{,}92 \\cdot 8{,}80'}</Tex></p>
              <p>
                <strong><Tex>{'L \\approx 26\\,L_{\\odot}'}</Tex></strong>
              </p>
            </Task>

            <Task
              id="b4"
              number={7}
              color="border-yellow-500"
              question="Изчисли дължината на вълната и енергията на фотона при прехода 4 → 2 във водородния атом. Как се казва тази линия?"
            >
              <p><Tex>{'\\frac{1}{\\lambda} = 1{,}097 \\cdot 10^7 \\cdot (\\frac{1}{4} - \\frac{1}{16}) = 1{,}097 \\cdot 10^7 \\cdot 0{,}1875 \\approx 2{,}057 \\cdot 10^6\\ \\mathrm{m^{-1}}'}</Tex></p>
              <p><Tex>{'\\lambda \\approx 486\\ \\mathrm{nm}'}</Tex> – синьо-зелена линия.</p>
              <p><Tex>{'E = 13{,}6 \\cdot (\\frac{1}{4} - \\frac{1}{16}) = 2{,}55\\ \\mathrm{eV}'}</Tex></p>
              <p>
                Това е <strong>Hβ</strong>, втората линия от серията на Балмер (Фраунхоферовата линия F).
              </p>
            </Task>
          </div>

          <div className="mb-6">
            <TaskLevel level="C" />

            <Task
              id="c1"
              number={8}
              color="border-red-500"
              question="Галактика има червено отместване $z = 0{,}1$. С каква скорост се отдалечава? Сравни приближената и релативистката формула."
            >
              <p>Приближено: <Tex>{'v \\approx c \\cdot z = 0{,}1 \\cdot 300\\,000 = 30\\,000\\ \\mathrm{km/s}'}</Tex>.</p>
              <p>Релативистки: <Tex>{'1 + z = \\sqrt{\\frac{1 + \\beta}{1 - \\beta}} \\Rightarrow \\beta = \\frac{(1 + z)^2 - 1}{(1 + z)^2 + 1}'}</Tex></p>
              <p><Tex>{'\\beta = \\frac{1{,}21 - 1}{1{,}21 + 1} = 0{,}21 / 2{,}21 \\approx 0{,}095 \\Rightarrow v \\approx 28\\,500\\ \\mathrm{km/s}'}</Tex>.</p>
              <p>При <Tex>{'z = 0{,}1'}</Tex> разликата е 5%. При <Tex>{'z \\gtrsim 0{,}3'}</Tex> приближената формула вече е неприложима, а при <Tex>{'z > 1'}</Tex> би дала <Tex>{'v > c'}</Tex>.</p>
            </Task>

            <Task
              id="c2"
              number={9}
              color="border-red-500"
              question="Заради Юпитер Слънцето се поклаща около общия център на масите със скорост $12{,}5\ \mathrm{m/s}$. С колко се отмества линия с $\lambda = 500\ \mathrm{nm}$? Каква разделителна способност $R = \lambda / \Delta\lambda$ е нужна?"
            >
              <p><Tex>{'\\Delta\\lambda = \\lambda \\cdot v / c = \\frac{500\\ \\mathrm{nm} \\cdot 12{,}5}{3 \\cdot 10^8} \\approx 2{,}1 \\cdot 10^{-5}\\ \\mathrm{nm} = 0{,}021\\ \\mathrm{pm}'}</Tex></p>
              <p><Tex>{'R = \\lambda / \\Delta\\lambda \\approx \\frac{500}{2{,}1 \\cdot 10^{-5}} \\approx 2{,}4 \\cdot 10^7'}</Tex></p>
              <p>
                Толкова голяма разделителна способност е недостижима за един спектрограф (най-добрите имат <Tex>{'R \\approx 10^5'}</Tex>). Затова спектрографи
                като HARPS измерват отместването едновременно на хиляди линии и го осредняват – така достигат точност под <Tex>{'1\\ \\mathrm{m/s}'}</Tex>.
              </p>
            </Task>

            <Task
              id="c3"
              number={10}
              color="border-red-500"
              question="Слънцето се върти с период 25,4 дни на екватора ($R_{\odot} = 6{,}96 \cdot 10^5\ \mathrm{km}$). Колко ще бъде разширението на линията Hα (656,3 nm), ако гледаме Слънцето отдалеч, от равнината на екватора му?"
            >
              <p><Tex>{'v = 2\\pi R / P = \\frac{2\\pi \\cdot 6{,}96 \\cdot 10^5\\ \\mathrm{km}}{25{,}4 \\cdot 86\\,400\\ \\mathrm{s}} \\approx 2{,}0\\ \\mathrm{km/s}'}</Tex></p>
              <p>Единият ръб се приближава с <Tex>{'2\\ \\mathrm{km/s}'}</Tex>, другият се отдалечава със същата скорост.</p>
              <p><Tex>{'\\Delta\\lambda = \\pm \\lambda \\cdot v / c = \\pm 656{,}3 \\cdot 2 / 300\\,000 \\approx \\pm 0{,}0044\\ \\mathrm{nm}'}</Tex></p>
              <p>
                Линията се разширява до <strong>~0,009 nm</strong>. Млади горещи звезди се въртят с <Tex>{'200\\text{–}300\\ \\mathrm{km/s}'}</Tex> и линиите им се разширяват
                100 пъти повече.
              </p>
            </Task>
          </div>
          </TaskBoard>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">9. Обобщение</h2>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2">
              <li>✓ <Tex>{'c = \\lambda\\nu'}</Tex>; енергията на фотона е <Tex>{'E = h\\nu = \\frac{hc}{\\lambda}'}</Tex></li>
              <li>✓ Видимата светлина (380–750 nm) е малка част от електромагнитния спектър; атмосферата пропуска само оптичния и радиопрозореца</li>
              <li>✓ Закон на Вин: <Tex>{'\\lambda_{\\mathrm{max}} \\cdot T = 2{,}898 \\cdot 10^{-3}\\ \\mathrm{m\\cdot K}'}</Tex>; закон на Стефан–Болцман: <Tex>{'L = 4\\pi R^2\\sigma T^4'}</Tex></li>
              <li>✓ Три вида спектри: непрекъснат, емисионен и абсорбционен (закони на Кирхоф)</li>
              <li>✓ Линиите възникват при преходи между енергетичните нива на атомите; водород: Лайман, Балмер, Пашен</li>
              <li>✓ Доплеров ефект: <Tex>{'\\frac{\\Delta\\lambda}{\\lambda} = \\frac{v}{c}'}</Tex>; червено отместване – отдалечаване, синьо – приближаване</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span>💡</span>
              <span>Интересен факт</span>
            </h3>
            <p>
              Хелият е открит в спектъра на Слънцето по време на пълното слънчево затъмнение на 18 август 1868 г. – като непозната жълта
              линия при 587,6 nm. Дълго време мнозина смятали, че такъв елемент съществува само на Слънцето. На Земята го откриват едва
              през 1895 г., в урановия минерал клевеит. Днес знаем, че хелият е вторият по разпространение елемент във Вселената – около
              една четвърт от масата на обикновеното вещество.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
