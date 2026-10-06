export default function Lecture29() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 29: Тъмна материя и тъмна енергия
        </h1>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Тъмна материя</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Невидима форма на материя, която не излъчва, не поглъща и не отразява
            светлина. Открива се само чрез гравитационното ѝ влияние.
          </p>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Доказателства:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Криви на въртене на галактиките</strong> – звездите се
              въртят по-бързо, отколкото би трябвало</li>
              <li><strong>Гравитационно лещиране</strong> – светлината се изкривява
              от невидима маса</li>
              <li><strong>Галактични купове</strong> – нужна е повече маса, за да
              ги държи заедно</li>
              <li><strong>CMB флуктуации</strong> – моделите изискват тъмна материя</li>
            </ul>
          </div>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Тъмната материя съставлява около 27% от Вселената.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Кандидати за тъмна материя</h2>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>WIMPs</strong> – слабо взаимодействащи масивни частици</li>
              <li><strong>Аксиони</strong> – хипотетични леки частици</li>
              <li><strong>Стерилни неутрино</strong> – вид неутрино</li>
              <li><strong>Първични черни дупки</strong> – от ранната Вселена</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Тъмна енергия</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Мистериозна форма на енергия, която причинява ускореното разширяване
            на Вселената. Съставлява около 68% от Вселената.
          </p>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Възможни обяснения:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Космологична константа</strong> – енергия на вакуума</li>
              <li><strong>Квинтесенция</strong> – динамично скаларно поле</li>
              <li><strong>Модифицирана гравитация</strong> – нова физика</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Състав на Вселената</h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Тъмна енергия: ~68%</li>
              <li>Тъмна материя: ~27%</li>
              <li>Обикновена материя (атоми): ~5%</li>
            </ul>
            <p className="mt-3 font-semibold">Познаваме само 5% от Вселената!</p>
          </div>
        </section>
        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2">💡 Интересен факт</h3>
            <p>
              Въпреки че тъмната материя и тъмната енергия съставляват 95% от
              Вселената, все още не знаем какво точно са! Това е една от
              най-големите мистерии в съвременната физика.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
