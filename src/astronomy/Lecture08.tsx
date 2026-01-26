export default function Lecture08() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 8: Орбити и скорости
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Орбитална скорост
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Орбиталната скорост е скоростта, с която едно тяло се движи по
            орбита около друго тяло. Тя зависи от масата на централното тяло и
            разстоянието до него.
          </p>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-3">Формула за орбитална скорост:</h3>
            <p className="text-center text-xl mb-3">v = √(G × M / r)</p>
            <ul className="list-disc list-inside space-y-2">
              <li>v – орбитална скорост</li>
              <li>G – гравитационна константа</li>
              <li>M – маса на централното тяло</li>
              <li>r – разстояние от центъра на централното тяло</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Първа космическа скорост
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Минималната скорост, необходима за влизане в орбита около Земята на
            малка височина. За Земята тя е около 7.9 km/s (28 440 km/h).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Втора космическа скорост (скорост на освобождаване)
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Минималната скорост, необходима за напускане на гравитационното поле
            на небесно тяло. За Земята тя е около 11.2 km/s (40 320 km/h).
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Втора космическа скорост за различни тела:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Луна: 2.4 km/s</li>
              <li>Земя: 11.2 km/s</li>
              <li>Юпитер: 59.5 km/s</li>
              <li>Слънце: 617.5 km/s</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Трета космическа скорост
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Минималната скорост, необходима за напускане на Слънчевата система от
            орбитата на Земята. Тя е около 16.7 km/s спрямо Земята.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Видове орбити
          </h2>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Кръгова орбита</strong> – разстоянието до централното
                тяло е постоянно
              </li>
              <li>
                <strong>Елиптична орбита</strong> – разстоянието се променя
              </li>
              <li>
                <strong>Параболична орбита</strong> – точно на границата на
                освобождаване
              </li>
              <li>
                <strong>Хиперболична орбита</strong> – обектът напуска системата
              </li>
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
              Международната космическа станция (МКС) се движи с орбитална скорост
              от около 7.66 km/s и прави пълен оборот около Земята за около 90
              минути. Астронавтите на борда виждат 16 изгрева и залеза на ден!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
