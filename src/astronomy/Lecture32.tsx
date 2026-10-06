export default function Lecture32() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Лекция 32: Методи за наблюдение
        </h1>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Наземни обсерватории</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Телескопи, разположени на Земята, обикновено на високи планини с
            добри атмосферни условия.
          </p>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Предимства:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>По-евтини от космическите</li>
              <li>Лесна поддръжка и надстройка</li>
              <li>Могат да бъдат много големи</li>
            </ul>
            <h3 className="font-semibold mb-2 mt-3">Недостатъци:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Атмосферни смущения</li>
              <li>Светлинно замърсяване</li>
              <li>Ограничени до оптичен и радио диапазон</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Космически телескопи</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Телескопи в орбита около Земята или в дълбокия космос.
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Предимства:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Няма атмосферни смущения</li>
              <li>Достъп до всички части на спектъра</li>
              <li>Непрекъснати наблюдения</li>
            </ul>
            <h3 className="font-semibold mb-2 mt-3">Недостатъци:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Много скъпи</li>
              <li>Трудна или невъзможна поддръжка</li>
              <li>Ограничен размер</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Съвременни техники</h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-3">
              <li><strong>Адаптивна оптика</strong> – компенсира атмосферните
              смущения в реално време</li>
              <li><strong>Интерферометрия</strong> – комбинира светлината от
              няколко телескопа за по-висока разделителна способност</li>
              <li><strong>Спектроскопия</strong> – анализ на светлината за
              определяне на състав, температура, скорост</li>
              <li><strong>Фотометрия</strong> – прецизно измерване на яркостта</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Мултиспектрална астрономия</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Наблюдение на обекти в различни части на електромагнитния спектър
            разкрива различни аспекти на тяхната физика:
          </p>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Радио</strong> – студен газ, пулсари, квазари</li>
              <li><strong>Инфрачервено</strong> – прах, млади звезди</li>
              <li><strong>Видимо</strong> – звезди, галактики</li>
              <li><strong>Ултравиолетово</strong> – горещи звезди</li>
              <li><strong>Рентгеново</strong> – черни дупки, неутронни звезди</li>
              <li><strong>Гама</strong> – най-енергийни процеси</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Гравитационни вълни</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Детектори като LIGO и Virgo откриват гравитационни вълни от сливания
            на черни дупки и неутронни звезди, отваряйки нов прозорец към Вселената.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Бъдещето на астрономията</h2>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Extremely Large Telescope (ELT) – 39 метра</li>
              <li>Square Kilometre Array (SKA) – гигантски радиотелескоп</li>
              <li>Nancy Grace Roman Space Telescope – следващ голям космически телескоп</li>
              <li>Lunar telescopes – телескопи на Луната</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2">💡 Заключение</h3>
            <p>
              Астрономията продължава да се развива бързо, с нови технологии и
              открития всеки ден. Живеем в златна ера на астрономията, където
              можем да изследваме Вселената по начини, които преди бяха невъзможни!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
