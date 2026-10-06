export default function Lecture11() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 11: Слънцето – структура и енергия
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Основни характеристики
          </h2>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Тип: жълто джудже (G2V звезда)</li>
              <li>Възраст: около 4.6 милиарда години</li>
              <li>Диаметър: 1.39 милиона km (109 пъти по-голям от Земята)</li>
              <li>Маса: 1.989 × 10³⁰ kg (333 000 пъти по-голяма от Земята)</li>
              <li>Температура на повърхността: около 5500°C</li>
              <li>Температура в ядрото: около 15 милиона °C</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Структура на Слънцето
          </h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">От вътре навън:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Ядро</strong> – тук се извършва ядрената реакция</li>
              <li><strong>Радиационна зона</strong> – енергията се пренася чрез излъчване</li>
              <li><strong>Конвективна зона</strong> – енергията се пренася чрез конвекция</li>
              <li><strong>Фотосфера</strong> – видимата повърхност на Слънцето</li>
              <li><strong>Хромосфера</strong> – долна атмосфера</li>
              <li><strong>Корона</strong> – горна атмосфера, много гореща</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Източник на енергия
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Слънцето произвежда енергия чрез ядрен синтез в ядрото си. Четири
            атома водород се сливат, за да образуват един атом хелий, като се
            освобождава огромно количество енергия.
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <p className="font-semibold mb-2">Протон-протонна верига:</p>
            <p className="text-center">4 H → He + енергия</p>
            <p className="mt-3">
              Всяка секунда Слънцето превръща около 600 милиона тона водород в
              хелий, като губи 4 милиона тона маса, която се превръща в енергия
              (E = mc²).
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Слънчева светимост
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Слънцето излъчва енергия с мощност от 3.828 × 10²⁶ вата. Земята
            получава само малка част от тази енергия – около 1361 W/m² (слънчева
            константа).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Бъдеще на Слънцето
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            След около 5 милиарда години водородът в ядрото ще се изчерпи.
            Слънцето ще се разшири и стане червен гигант, след което ще отхвърли
            външните си слоеве и ще остане бяло джудже.
          </p>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span>💡</span>
              <span>Интересен факт</span>
            </h3>
            <p>
              Светлината, която виждаме от Слънцето, всъщност е била произведена
              в ядрото преди десетки хиляди години! Енергията се движи много
              бавно от ядрото до повърхността, но след това достига Земята само
              за 8 минути.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
