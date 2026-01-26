export default function Lecture18() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 18: Звезди – основни характеристики
        </h1>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Какво е звезда?</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Звездата е самосветещо небесно тяло, което произвежда енергия чрез
            ядрен синтез в ядрото си.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Основни параметри</h2>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Маса</strong> – от 0.08 до 200 слънчеви маси</li>
              <li><strong>Радиус</strong> – от 0.1 до 1000 слънчеви радиуса</li>
              <li><strong>Температура</strong> – от 2000 до 50000 K</li>
              <li><strong>Светимост</strong> – от 0.0001 до 1000000 слънчеви светимости</li>
              <li><strong>Цвят</strong> – червени, оранжеви, жълти, бели, сини</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Спектрална класификация</h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <p className="mb-2 font-semibold">O B A F G K M (от горещи към студени):</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>O</strong> – сини, над 30000 K</li>
              <li><strong>B</strong> – сини-бели, 10000-30000 K</li>
              <li><strong>A</strong> – бели, 7500-10000 K</li>
              <li><strong>F</strong> – жълто-бели, 6000-7500 K</li>
              <li><strong>G</strong> – жълти (като Слънцето), 5200-6000 K</li>
              <li><strong>K</strong> – оранжеви, 3700-5200 K</li>
              <li><strong>M</strong> – червени, под 3700 K</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Видима и абсолютна звездна величина</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            <strong>Видима звездна величина (m)</strong> – колко ярка изглежда
            звездата от Земята.<br/>
            <strong>Абсолютна звездна величина (M)</strong> – колко ярка би била
            звездата на разстояние 10 парсека.
          </p>
        </section>
      </div>
    </main>
  );
}
