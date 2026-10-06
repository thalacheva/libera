export default function Lecture25() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 25: Галактики
        </h1>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Какво е галактика?</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Огромна система от звезди, газ, прах и тъмна материя, свързани заедно
            от гравитацията. Вселената съдържа над 200 милиарда галактики.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Класификация на Хъбъл</h2>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-3">
              <li><strong>Спирални галактики (S)</strong> – с рамена и централна
              издутина. Пример: Млечният път, Андромеда</li>
              <li><strong>Пръстеновидни спирални (SB)</strong> – с централен пръстен</li>
              <li><strong>Елиптични галактики (E)</strong> – без структура, от
              сферични до елипсовидни (E0-E7)</li>
              <li><strong>Неправилни галактики (Irr)</strong> – без определена форма.
              Пример: Големите и Малките Магеланови облаци</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Активни галактични ядра</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Някои галактики имат изключително ярки центрове, захранвани от
            свръхмасивни черни дупки.
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Квазари</strong> – най-ярките обекти във Вселената</li>
              <li><strong>Сейфертови галактики</strong> – спирални с ярки ядра</li>
              <li><strong>Радиогалактики</strong> – излъчват мощни радиовълни</li>
              <li><strong>Блазари</strong> – джетове насочени към нас</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Взаимодействия между галактики</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Галактиките често си взаимодействат и се сливат. Млечният път и
            Андромеда ще се сблъскат след около 4.5 милиарда години.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Галактични купове</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Галактиките се групират в купове и свръхкупове. Нашата Местна група
            съдържа около 80 галактики и е част от свръхкупа Ланиакея.
          </p>
        </section>
        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2">💡 Интересен факт</h3>
            <p>
              Най-далечните наблюдавани галактики са на разстояние над 13 милиарда
              светлинни години. Виждаме ги такива, каквито са били само 700 милиона
              години след Големия взрив!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
