export default function Lecture10() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 10: Телескопи и инструменти
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Оптични телескопи
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Телескопите са основният инструмент на астрономията. Те събират много
            повече светлина от човешкото око и позволяват да видим слаби и
            далечни обекти.
          </p>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Два основни типа:</h3>
            <ul className="list-disc list-inside space-y-3">
              <li>
                <strong>Рефрактори (лещови)</strong> – използват лещи за
                събиране на светлината. Първият телескоп на Галилей е бил
                рефрактор.
              </li>
              <li>
                <strong>Рефлектори (огледални)</strong> – използват огледала.
                По-евтини и по-ефективни за големи размери.
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Характеристики на телескопите
          </h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Апертура</strong> – диаметър на главното огледало или
                леща. Колкото е по-голяма, толкова повече светлина се събира.
              </li>
              <li>
                <strong>Фокусно разстояние</strong> – разстоянието от главната
                оптика до фокуса
              </li>
              <li>
                <strong>Увеличение</strong> – колко пъти обектът изглежда
                по-голям
              </li>
              <li>
                <strong>Разделителна способност</strong> – способността да
                различава близки обекти
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Радиотелескопи
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Радиотелескопите улавят радиовълни от космоса. Те могат да работят
            денем и нощем и не се влияят от облачност. Много космически обекти
            излъчват силно в радиодиапазона.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Космически телескопи
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Телескопите в космоса избягват атмосферните смущения и могат да
            наблюдават в части на спектъра, които не достигат до земната
            повърхност.
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Известни космически телескопи:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Хъбъл</strong> – оптичен, изстрелян 1990 г.</li>
              <li><strong>Джеймс Уеб</strong> – инфрачервен, изстрелян 2021 г.</li>
              <li><strong>Чандра</strong> – рентгенов</li>
              <li><strong>Спицър</strong> – инфрачервен</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Други инструменти
          </h2>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Спектрографи</strong> – разлагат светлината на спектър</li>
              <li><strong>Фотометри</strong> – измерват яркостта</li>
              <li><strong>CCD камери</strong> – цифрови детектори за светлина</li>
              <li><strong>Адаптивна оптика</strong> – компенсира атмосферните смущения</li>
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
              Най-големият оптичен телескоп в света е Gran Telescopio Canarias с
              огледало от 10.4 метра! Телескопът Джеймс Уеб има огледало от 6.5
              метра, но е сгънато, за да се побере в ракетата при изстрелването.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
