export default function Lecture12() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 12: Слънчева активност
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Слънчеви петна
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Слънчевите петна са тъмни области на фотосферата, които са по-студени
            от заобикалящите ги области (около 3800°C спрямо 5500°C). Те са
            причинени от концентрирани магнитни полета.
          </p>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Размер: от няколко стотин до десетки хиляди километри</li>
              <li>Продължителност: от няколко дни до няколко месеца</li>
              <li>Цикъл: 11-годишен цикъл на слънчевата активност</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Слънчеви изригвания
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Внезапни освобождавания на огромни количества енергия в слънчевата
            атмосфера. Могат да продължат от минути до часове и да освободят
            енергия, еквивалентна на милиони водородни бомби.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Коронални изхвърляния на маса (CME)
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Гигантски облаци от плазма, изхвърлени от короната на Слънцето в
            космоса. Могат да съдържат милиарди тона материя и да се движат със
            скорости до 3000 km/s.
          </p>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Въздействие върху Земята:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Полярни сияния (северни и южни светлини)</li>
              <li>Смущения в радиокомуникациите</li>
              <li>Проблеми с GPS навигацията</li>
              <li>Повреди в електрическите мрежи</li>
              <li>Опасност за астронавтите в космоса</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Слънчев вятър
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Непрекъснат поток от заредени частици (предимно протони и електрони),
            излъчвани от короната на Слънцето. Достига всички планети в Слънчевата
            система и създава хелиосферата.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Космическо време
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Науката, която изучава слънчевата активност и нейното влияние върху
            Земята и технологиите. Прогнозите за космическото време са важни за
            защита на спътниците, астронавтите и земната инфраструктура.
          </p>
        </section>

        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span>💡</span>
              <span>Интересен факт</span>
            </h3>
            <p>
              През 1859 г. се е случило най-мощното регистрирано слънчево
              изригване, известно като "Събитието на Карингтън". То е причинило
              полярни сияния, видими до екватора, и е повредило телеграфните
              системи. Подобно събитие днес би могло да причини щети за трилиони
              долари!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
