export default function Lecture21() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 21: Бели джуджета, неутронни звезди, черни дупки
        </h1>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Бели джуджета</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Остатъци от звезди с маса под 8 слънчеви маси. Много малки (размер на
            Земята) но изключително плътни.
          </p>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Маса: до 1.4 M☉ (граница на Чандрасекар)</li>
              <li>Радиус: около 10000 km</li>
              <li>Плътност: 1 тон/cm³</li>
              <li>Температура: 100000 K (в началото)</li>
              <li>Не извършват ядрен синтез, само се охлаждат</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Неутронни звезди</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Остатъци от свръхнови на звезди с маса 8-25 M☉. Състоят се почти
            изцяло от неутрони.
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Маса: 1.4-3 M☉</li>
              <li>Радиус: около 10-20 km</li>
              <li>Плътност: 100 милиона тона/cm³</li>
              <li>Въртене: до 700 оборота в секунда</li>
              <li>Магнитно поле: трилиони пъти по-силно от земното</li>
            </ul>
          </div>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            <strong>Пулсари</strong> – бързо въртящи се неутронни звезди, които
            излъчват радиовълни като космически фарове.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Черни дупки</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Области в пространството с толкова силна гравитация, че дори светлината
            не може да избяга. Образуват се от звезди с маса над 25 M☉.
          </p>
          <div className="bg-gray-900 text-white p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Хоризонт на събитията</strong> – границата на черната дупка</li>
              <li><strong>Сингулярност</strong> – точка с безкрайна плътност в центъра</li>
              <li><strong>Радиус на Шварцшилд</strong> – радиус на хоризонта на събитията</li>
            </ul>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Видове черни дупки:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Звездни</strong> – от свръхнови (5-100 M☉)</li>
              <li><strong>Междинни</strong> – 100-100000 M☉</li>
              <li><strong>Свръхмасивни</strong> – в центрове на галактики (милиони-милиарди M☉)</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2">💡 Интересен факт</h3>
            <p>
              Първата снимка на черна дупка беше направена през 2019 г. от Event
              Horizon Telescope – свръхмасивната черна дупка в центъра на галактика
              M87, с маса 6.5 милиарда слънчеви маси!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
