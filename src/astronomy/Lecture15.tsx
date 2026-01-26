export default function Lecture15() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 15: Малки тела в Слънчевата система
        </h1>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Джуджести планети
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Небесни тела, които са достатъчно масивни, за да имат сферична форма,
            но не са изчистили орбитата си от други обекти.
          </p>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Плутон</strong> – най-известната джуджеста планета</li>
              <li><strong>Ерида</strong> – по-масивна от Плутон</li>
              <li><strong>Церера</strong> – в пояса на астероидите</li>
              <li><strong>Макемаке</strong> – в пояса на Кайпер</li>
              <li><strong>Хаумеа</strong> – с необичайна елипсовидна форма</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Астероиди
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Малки скалисти тела, останки от формирането на Слънчевата система.
            Повечето се намират в пояса на астероидите между Марс и Юпитер.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Комети
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            "Мръсни снежни топки" от лед, прах и скали. Когато се приближат до
            Слънцето, развиват ярка кома (атмосфера) и опашка.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Метеороиди, метеори и метеорити
          </h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Метеороид</strong> – малък обект в космоса</li>
              <li><strong>Метеор</strong> – "падаща звезда", светещ след в атмосферата</li>
              <li><strong>Метеорит</strong> – метеороид, който е достигнал земята</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Пояс на Кайпер и облак на Оорт
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            <strong>Пояс на Кайпер</strong> – област отвъд Нептун с ледени тела.
            <br />
            <strong>Облак на Оорт</strong> – огромна сферична обвивка от комети
            на границата на Слънчевата система.
          </p>
        </section>
      </div>
    </main>
  );
}
