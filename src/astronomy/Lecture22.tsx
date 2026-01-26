export default function Lecture22() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 22: Двойни звезди
        </h1>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Какво са двойните звезди?</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Две звезди, които обикалят около общ център на маса. Повече от
            половината от звездите във Вселената са в двойни или множествени
            системи.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Видове двойни звезди</h2>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-3">
              <li><strong>Визуални двойни</strong> – могат да се разделят с телескоп</li>
              <li><strong>Спектрални двойни</strong> – откриват се по доплеровото изместване</li>
              <li><strong>Затъмняващи двойни</strong> – звездите преминават една пред друга</li>
              <li><strong>Астрометрични двойни</strong> – откриват се по движението на видимата звезда</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Затъмняващи двойни</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Когато една звезда премине пред другата, яркостта на системата намалява.
            Анализът на кривата на светимостта дава информация за размерите,
            масите и температурите на звездите.
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <p className="font-semibold">Пример: Алгол (β Персея)</p>
            <p>Една от най-известните затъмняващи двойни, наричана "Дяволската звезда".</p>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Маса-трансферни системи</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            В тесни двойни системи материя може да преминава от едната звезда към
            другата. Това води до интересни явления:
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Нови</strong> – внезапно увеличение на яркостта</li>
              <li><strong>Свръхнови тип Ia</strong> – бяло джудже надхвърля границата на Чандрасекар</li>
              <li><strong>Рентгенови двойни</strong> – материя пада върху неутронна звезда или черна дупка</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Значение за астрономията</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Двойните звезди са изключително важни, защото позволяват директно
            измерване на звездните маси чрез третия закон на Кеплер.
          </p>
        </section>
      </div>
    </main>
  );
}
