export default function Lecture14() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 14: Газови гиганти
        </h1>
        <section className="mb-8">
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Газовите гиганти са четирите външни планети: Юпитер, Сатурн, Уран и
            Нептун. Те са много по-големи от планетите от земен тип и се състоят
            предимно от газове.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Юпитер</h2>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Най-голямата планета (маса = 318 земни маси)</li>
              <li>Състои се предимно от водород и хелий</li>
              <li>Великото червено петно – гигантска буря</li>
              <li>Силно магнитно поле</li>
              <li>95 известни спътника, включително 4-те галилееви</li>
              <li>Тънък пръстен</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Сатурн</h2>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Известен със своите грандиозни пръстени</li>
              <li>Най-ниска плътност (по-лека от водата!)</li>
              <li>146 известни спътника</li>
              <li>Титан – най-големият спътник с плътна атмосфера</li>
              <li>Шестоъгълна буря на северния полюс</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Уран</h2>
          <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Ледения гигант (съдържа повече лед от газ)</li>
              <li>Въртене "на страни" – ос наклонена на 98°</li>
              <li>Сини-зелен цвят заради метана</li>
              <li>Много студена атмосфера (-224°C)</li>
              <li>27 известни спътника</li>
              <li>Тънки тъмни пръстени</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Нептун</h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Най-далечната планета от Слънцето</li>
              <li>Най-силните ветрове в Слънчевата система (2100 km/h)</li>
              <li>Тъмносин цвят</li>
              <li>Великото тъмно петно (буря)</li>
              <li>16 известни спътника, включително Тритон</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2">💡 Интересен факт</h3>
            <p>
              Юпитер е толкова голям, че всички останали планети могат да се
              поберат в него! Ако Юпитер беше около 80 пъти по-масивен, щеше да
              стане звезда.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
