export default function Lecture17() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 17: Астероиди и пояси
        </h1>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Пояс на астероидите
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Област между орбитите на Марс и Юпитер, съдържаща милиони астероиди.
            Общата им маса е по-малка от масата на Луната.
          </p>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Най-големи астероиди:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Церера</strong> – 940 km, джуджеста планета</li>
              <li><strong>Веста</strong> – 525 km</li>
              <li><strong>Палада</strong> – 512 km</li>
              <li><strong>Хигея</strong> – 434 km</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Класификация на астероидите
          </h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>C-тип</strong> – въглеродни, най-чести (75%)</li>
              <li><strong>S-тип</strong> – силикатни (17%)</li>
              <li><strong>M-тип</strong> – металични</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Потенциално опасни астероиди (PHA)
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Астероиди с орбити, които ги довеждат близо до Земята (по-малко от
            7.5 милиона km) и са достатъчно големи (над 140 м), за да причинят
            значителни щети при удар.
          </p>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
            <p className="font-semibold mb-2">Защита на планетата:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Непрекъснато наблюдение на околоземните астероиди</li>
              <li>Мисия DART (2022) – тест за отклоняване на астероид</li>
              <li>Разработка на стратегии за планетарна защита</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Троянски астероиди
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Астероиди, които споделят орбитата на планета, но се намират в
            стабилни точки (точки на Лагранж) 60° пред или зад нея. Най-много
            троянски астероиди има при Юпитер.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Астероидно минно дело
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Астероидите съдържат ценни метали и минерали. В бъдеще може да стане
            икономически изгодно да се добиват ресурси от астероиди.
          </p>
        </section>
        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2">💡 Интересен факт</h3>
            <p>
              Въпреки че поясът на астероидите съдържа милиони обекти, разстоянието
              между тях е толкова голямо, че космическите апарати могат да го
              преминат без опасност. Холивудските филми силно преувеличават
              плътността на астероидите!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
