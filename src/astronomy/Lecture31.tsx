export default function Lecture31() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 31: Астробиология
        </h1>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Какво е астробиология?</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Мултидисциплинарна наука, която изучава произхода, еволюцията,
            разпространението и бъдещето на живота във Вселената.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Условия за живот</h2>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Основни изисквания:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Течна вода (или друг разтворител)</li>
              <li>Източник на енергия</li>
              <li>Органични молекули (C, H, N, O, P, S)</li>
              <li>Подходяща температура и налягане</li>
              <li>Време за еволюция</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Потенциални места за живот</h2>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">В Слънчевата система:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Марс</strong> – следи от древна вода, подземни резервоари</li>
              <li><strong>Европа</strong> (спътник на Юпитер) – подледен океан</li>
              <li><strong>Енцелад</strong> (спътник на Сатурн) – гейзери от вода</li>
              <li><strong>Титан</strong> (спътник на Сатурн) – течни въглеводороди</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Биосигнатури</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Признаци, които биха могли да индикират наличие на живот:
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Кислород и озон в атмосферата</li>
              <li>Метан в комбинация с кислород</li>
              <li>Хлорофил или други пигменти</li>
              <li>Сезонни промени в атмосферата</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Уравнение на Дрейк</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Формула за оценка на броя на разумните цивилизации в Млечния път:
          </p>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <p className="text-center mb-2">N = R* × fp × ne × fl × fi × fc × L</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>R* – скорост на звездообразуване</li>
              <li>fp – дял на звездите с планети</li>
              <li>ne – брой планети в обитаема зона</li>
              <li>fl – дял на планетите с живот</li>
              <li>fi – дял на планетите с разумен живот</li>
              <li>fc – дял на цивилизациите, които комуникират</li>
              <li>L – продължителност на комуникацията</li>
            </ul>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">SETI</h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Search for Extraterrestrial Intelligence – програми за търсене на
            радиосигнали или други признаци на извънземни цивилизации.
          </p>
        </section>
        <section className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold mb-2">💡 Интересен факт</h3>
            <p>
              Екстремофилите на Земята (организми, живеещи в екстремни условия)
              показват, че животът може да съществува в много по-широк диапазон
              от условия, отколкото смятахме преди. Това увеличава шансовете за
              живот другаде във Вселената!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
