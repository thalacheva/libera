export default function Lecture30() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 30: Екзопланети
        </h1>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Какво са екзопланети?</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Планети, които обикалят около звезди извън Слънчевата система. Първата
            потвърдена екзопланета около звезда от главната последователност е
            открита през 1995 г.
          </p>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Досега са открити над 5500 екзопланети!
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Методи за откриване</h2>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-3">
              <li><strong>Транзитен метод</strong> – планетата преминава пред
              звездата и намалява яркостта ѝ (Kepler, TESS)</li>
              <li><strong>Радиална скорост</strong> – планетата кара звездата да
              "люлее"</li>
              <li><strong>Директно изображение</strong> – снимка на планетата</li>
              <li><strong>Гравитационно микролещиране</strong> – изкривяване на
              светлината</li>
              <li><strong>Астрометрия</strong> – измерване на движението на звездата</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Типове екзопланети</h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Горещи юпитери</strong> – газови гиганти много близо до звездата</li>
              <li><strong>Супер-земи</strong> – скалисти планети по-големи от Земята</li>
              <li><strong>Мини-нептуни</strong> – по-малки газови планети</li>
              <li><strong>Земеподобни</strong> – скалисти планети с размер на Земята</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Обитаема зона</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Област около звездата, където температурите позволяват съществуването
            на течна вода на повърхността. Наричана още "зона на Златокоска".
          </p>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Интересни екзопланети:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Proxima Centauri b</strong> – най-близката екзопланета (4.2 св.г.)</li>
              <li><strong>TRAPPIST-1</strong> – система със 7 планети, 3 в обитаемата зона</li>
              <li><strong>Kepler-452b</strong> – "по-голямата братовчедка на Земята"</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Бъдещи мисии</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Телескопът Джеймс Уеб и бъдещи мисии ще изследват атмосферите на
            екзопланетите, търсейки биосигнатури – признаци на живот.
          </p>
        </section>
        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2">💡 Интересен факт</h3>
            <p>
              Статистически, почти всяка звезда в Млечния път има поне една планета!
              Това означава, че има стотици милиарди планети само в нашата галактика.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
