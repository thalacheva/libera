export default function Lecture26() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 26: Млечният път
        </h1>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Нашата галактика</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Млечният път е спирална галактика с пръстен, съдържаща 200-400 милиарда
            звезди. Слънцето се намира на около 26000 светлинни години от центъра.
          </p>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Основни характеристики:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Диаметър: около 100000-120000 светлинни години</li>
              <li>Дебелина на диска: около 1000 светлинни години</li>
              <li>Маса: около 1 трилион слънчеви маси</li>
              <li>Възраст: около 13.6 милиарда години</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Структура</h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Централна издутина</strong> – сферична област със стари звезди</li>
              <li><strong>Диск</strong> – тънък диск със спирални рамена</li>
              <li><strong>Хало</strong> – сферична област с разсеяни звезди и кълбовидни купове</li>
              <li><strong>Пръстен</strong> – централна пръстеновидна структура</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Спиралните рамена</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Млечният път има 4 основни спирални рамена: Персей, Стрелец-Кентавър,
            Норма и Скутум-Кентавър. Слънцето се намира в малко рамо, наречено
            Орионово рамо.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Център на галактиката</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            В центъра на Млечния път се намира свръхмасивна черна дупка, наречена
            Стрелец A* (Sgr A*), с маса около 4 милиона слънчеви маси.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Въртене</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Слънцето обикаля около центъра на галактиката със скорост около 220 km/s
            и прави пълен оборот за около 225-250 милиона години (галактична година).
          </p>
        </section>
        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2">💡 Интересен факт</h3>
            <p>
              Виждаме Млечния път като светла ивица на нощното небе, защото
              гледаме диска на галактиката "отвътре". Древните гърци са мислели,
              че това е млеко, разлято от богинята Хера – оттам и името!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
