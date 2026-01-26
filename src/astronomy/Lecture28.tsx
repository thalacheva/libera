export default function Lecture28() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 28: Разширяване на Вселената
        </h1>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Закон на Хъбъл</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Едуин Хъбъл открива (1929), че галактиките се отдалечават от нас със
            скорост, пропорционална на разстоянието им.
          </p>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <p className="text-center text-xl mb-3">v = H₀ × d</p>
            <ul className="list-disc list-inside space-y-2">
              <li>v – скорост на отдалечаване</li>
              <li>H₀ – константа на Хъбъл (около 70 km/s/Mpc)</li>
              <li>d – разстояние</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Червено изместване</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Светлината от отдалечаващи се галактики се изместваше към червения край
            на спектъра заради доплеровия ефект. Колкото по-далеч е галактиката,
            толкова по-голямо е червеното изместване (z).
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Ускорено разширяване</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            През 1998 г. е открито, че разширяването на Вселената се ускорява!
            Това откритие е донесло Нобелова награда и е довело до концепцията за
            тъмна енергия.
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <p className="font-semibold mb-2">Наблюдения на далечни свръхнови тип Ia показват:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Разширяването се забавя в миналото</li>
              <li>Преди около 5 милиарда години започва ускорение</li>
              <li>Тъмната енергия доминира днес</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Съдба на Вселената</h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <p className="mb-2">Възможни сценарии:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Голямо замръзване</strong> – вечно разширяване (най-вероятно)</li>
              <li><strong>Голямо свиване</strong> – Вселената колапсира обратно</li>
              <li><strong>Голямо разкъсване</strong> – тъмната енергия разкъсва всичко</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2">💡 Интересен факт</h3>
            <p>
              Разширяването на Вселената не означава, че галактиките се движат
              през пространството. Самото пространство се разширява, като носи
              галактиките със себе си!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
