export default function Lecture23() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 23: Променливи звезди
        </h1>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Какво са променливи звезди?</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Звезди, чиято яркост се променя с времето. Промените могат да бъдат
            периодични или непериодични.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Пулсиращи променливи</h2>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-3">
              <li><strong>Цефеиди</strong> – период 1-100 дни, много важни за
              измерване на разстояния</li>
              <li><strong>RR Лиры</strong> – период 0.2-1 ден, по-слаби от цефеидите</li>
              <li><strong>Мириди</strong> – дългопериодични (100-1000 дни), червени гиганти</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Връзка период-светимост</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Откриването на Хенриета Левит (1912): колкото по-дълъг е периодът на
            цефеидата, толкова по-ярка е звездата. Това прави цефеидите "стандартни
            свещи" за измерване на космически разстояния.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Ерупти вни променливи</h2>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Нови</strong> – внезапно увеличение с 7-16 звездни величини</li>
              <li><strong>Свръхнови</strong> – катастрофични експлозии</li>
              <li><strong>Звезди тип T Тельца</strong> – млади звезди с нередовни изблици</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Катаклизмични променливи</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Двойни системи с бяло джудже, което акретира материя от спътник.
            Водят до периодични изригвания.
          </p>
        </section>
        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2">💡 Интересен факт</h3>
            <p>
              Цефеидите са били ключови за откриването, че Андромеда е отделна
              галактика, а не мъглявина в Млечния път. Това е променило изцяло
              нашето разбиране за размера на Вселената!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
