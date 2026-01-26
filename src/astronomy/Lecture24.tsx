export default function Lecture24() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 24: Разстояния в астрономията
        </h1>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Единици за разстояние</h2>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Астрономическа единица (AU)</strong> – разстоянието Земя-Слънце (149.6 млн. km)</li>
              <li><strong>Светлинна година (ly)</strong> – разстояние, което светлината изминава за 1 година (9.46 трилиона km)</li>
              <li><strong>Парсек (pc)</strong> – 3.26 светлинни години или 206265 AU</li>
              <li><strong>Килопарсек (kpc)</strong> – 1000 парсека</li>
              <li><strong>Мегапарсек (Mpc)</strong> – 1 милион парсека</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Методи за измерване</h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">1. Тригонометричен паралакс</h3>
            <p className="mb-2">За близки звезди (до 100 pc). Измерва се видимото изместване на звездата спрямо далечния фон.</p>
            <p className="text-center">d (парсеки) = 1 / p (ъглови секунди)</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">2. Стандартни свещи</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Цефеиди – до 30 Mpc</li>
              <li>Свръхнови тип Ia – до 1000 Mpc</li>
              <li>RR Лиры – за звездни купове</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">3. Червено изместване</h3>
            <p>За много далечни галактики. Използва се закона на Хъбъл: v = H₀ × d</p>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Космическа стълба на разстоянията</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Всеки метод се калибрира с предходния, създавайки "стълба" от методи
            за измерване на все по-големи разстояния.
          </p>
        </section>
        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2">💡 Интересен факт</h3>
            <p>
              Спътникът Gaia на ЕКА измерва позициите на над 1 милиард звезди с
              невероятна точност, революционизирайки нашите познания за Млечния път!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
