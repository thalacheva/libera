import { useState } from 'react';

export default function Lecture01() {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [showSolutions, setShowSolutions] = useState<{
    [key: string]: boolean;
  }>({});
  const [latitude, setLatitude] = useState(42); // Географска ширина (0-90°)
  const [longitude, setLongitude] = useState(25); // Географска дължина (-180 до 180°, 25° за България)

  const toggleSolution = (taskId: string) => {
    setShowSolutions(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Изчисляване на позиции според географската ширина
  const centerX = 300;
  const centerY = 250;
  const sphereRadius = 200;

  // Правилна сферична геометрия:
  // Небесната сфера е 3D обект, проектиран в 2D

  const poleAngle = (latitude * Math.PI) / 180;

  // Зенит (Z) - винаги на върха на сферата (вертикално над наблюдателя)
  const zenithX = centerX;
  const zenithY = centerY - sphereRadius;

  // Надир (Z') - винаги на дъното, противоположен на зенита
  const nadirX = centerX;
  const nadirY = centerY + sphereRadius;

  // Северен полюс на сферата:
  // Намира се на СЕВЕР на хоризонта, на височина = φ
  // В 3D: азимут = 0° (север), altitude = φ
  // Проекция: север е "назад" (по-малко x в перспектива)

  // Използваме сферични координати:
  // x = r * cos(alt) * sin(az), y = r * sin(alt), z = r * cos(alt) * cos(az)
  // За север: az = 180° (назад)

  // Правилна сферична геометрия: точките трябва да лежат НА сферата
  // За точка на сфера: (x - cx)² + (y - cy)² = r²
  //
  // Северен полюс: азимут = 0° (север), височина = φ
  // В 3D сферични координати, проектирани в 2D:
  // x = cx + r × cos(φ) × sin(az) × depth_factor
  // y = cy - r × sin(φ)
  //
  // За север (az = 180° в нашата проекция): sin(180°) = 0, но за 3D ефект използваме перспектива

  // ПРАВИЛНА сферична геометрия:
  // P е на СЕВЕР на хоризонта, на височина h = φ
  // 
  // За точка да лежи НА кръга в 2D: (x - cx)² + (y - cy)² = R²
  // 
  // Ако y = cy - R×sin(φ), то:
  // (x - cx)² = R² - R²sin²(φ) = R²cos²(φ)
  // x - cx = ±R×cos(φ)
  //
  // За СЕВЕР (назад в 3D, ляво в 2D): x = cx - R×cos(φ)
  // За ЮГ (напред в 3D, дясно в 2D): x = cx + R×cos(φ)
  
  const poleX = centerX - sphereRadius * Math.cos(poleAngle);
  const poleY = centerY - sphereRadius * Math.sin(poleAngle);
  
  const southPoleX = centerX + sphereRadius * Math.cos(poleAngle);
  const southPoleY = centerY + sphereRadius * Math.sin(poleAngle);

  // Наклон на небесния екватор спрямо хоризонта
  const equatorTilt = 90 - latitude;

  // Небесният екватор е перпендикулярен на оста P-P'
  // 
  // Ъгъл на оста PP' в 2D проекция (от хоризонтала):
  // Вектор от P към P': (dx, dy) = (southPoleX - poleX, southPoleY - poleY)
  // atan2(dy, dx) дава ъгъл от хоризонтала
  const axisDx = southPoleX - poleX;
  const axisDy = southPoleY - poleY;
  const axisAngleFromHorizontal = Math.atan2(axisDy, axisDx) * 180 / Math.PI;
  
  // Екваторът е перпендикулярен на оста PP'
  // Перпендикулярен ъгъл = ъгъл + 90°
  const equatorAngle = axisAngleFromHorizontal + 90;

  // Специални случаи
  const isEquator = latitude === 0;
  const isPole = latitude === 90;

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Лекция 1: Какво изучава астрономията. Небесната сфера
        </h1>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Цели на лекцията
          </h2>
          <ul className="list-disc list-inside space-y-2 text-base sm:text-lg">
            <li>Да разберем какво представлява астрономията като наука</li>
            <li>
              Да въведем основните понятия, използвани при наблюдение на небето
            </li>
            <li>Да усвоим модела на небесната сфера и елементите й</li>
            <li>
              Да се подготвим за по-нататъшно изучаване на координатните системи
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Какво е астрономия?
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Астрономията е наука за небесните тела (звезди, планети, Луна,
            Слънце, галактики и др.) и законите, които управляват тяхното
            движение, строеж и еволюция.
          </p>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Основни направления:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Класическа астрономия</strong> – движения на небесните
                тела, календари, затъмнения
              </li>
              <li>
                <strong>Астрофизика</strong> – физични процеси в звездите,
                излъчване, спектри
              </li>
              <li>
                <strong>Космология</strong> – строеж и еволюция на Вселената
                като цяло
              </li>
              <li>
                <strong>Планетология</strong> – планети и техните спътници
              </li>
            </ul>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded mb-4">
            <p className="font-semibold">💡 Важна идея:</p>
            <p>
              Астрономията е наблюдателна наука – не можем да експериментираме
              със звездите, затова разчитаме на модели и измервания.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Защо ни трябват модели?
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Реалното пространство е триизмерно и изключително мащабно. За да го
            описваме по-лесно, използваме опростени модели.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Небесната сфера
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Небесната сфера е въображаема сфера с много голям радиус, в чийто
            център се намира наблюдателят.
          </p>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Приемаме, че:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Всички небесни тела са „прикрепени" към вътрешната повърхност на
                сферата
              </li>
              <li>
                Разстоянията до тях не са важни за определяне на положението им
                на небето
              </li>
              <li>
                Това ни позволява да описваме положенията им само чрез ъгли
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Интерактивна 3D визуализация
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Променете географската ширина и ротацията, за да видите как се
            променя небесната сфера:
          </p>

          {/* Контроли */}
          <div className="mb-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Географска ширина (φ): {latitude}°
                {latitude === 0 && ' (Екватор)'}
                {latitude === 42 && ' (България)'}
                {latitude === 90 && ' (Северен полюс)'}
              </label>
              <input
                type="range"
                min="0"
                max="90"
                value={latitude}
                onChange={e => setLatitude(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>Екватор (0°)</span>
                <span>България (42°)</span>
                <span>Полюс (90°)</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Географска дължина (λ): {longitude}°
                {longitude === 0 && ' (Гринуич)'}
                {longitude === 25 && ' (България)'}
                {longitude === -74 && ' (Ню Йорк)'}
                {longitude === 139 && ' (Токио)'}
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                value={longitude}
                onChange={e => setLongitude(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>-180° (Запад)</span>
                <span>0° (Гринуич)</span>
                <span>+180° (Изток)</span>
              </div>
            </div>
          </div>

          {/* Бързи бутони за известни локации */}
          <div className="mb-4 flex justify-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setLatitude(42);
                setLongitude(25);
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              🇧🇬 България (42°N, 25°E)
            </button>
            <button
              onClick={() => {
                setLatitude(0);
                setLongitude(0);
              }}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              🌍 Екватор (0°, 0°)
            </button>
            <button
              onClick={() => {
                setLatitude(90);
                setLongitude(0);
              }}
              className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
            >
              🧭 Северен полюс (90°N)
            </button>
            <button
              onClick={() => {
                setLatitude(51);
                setLongitude(0);
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              🇬🇧 Лондон (51°N, 0°)
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600">
            <svg
              viewBox="0 0 600 500"
              className="w-full h-auto"
              style={{ maxHeight: '500px' }}
            >
              {/* Небесна сфера (проектирана като кръг) */}
              <circle
                cx={centerX}
                cy={centerY}
                r={sphereRadius}
                fill="rgba(59, 130, 246, 0.05)"
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />

              {/* Небесен меридиан - вертикален кръг през Z, N' */}
              {/* Задна половина (запад, невидима, пунктирана) */}
              <path
                d={`M ${centerX},${centerY - sphereRadius}
                    A ${sphereRadius * 0.3},${sphereRadius} 0 0,1 ${centerX},${centerY + sphereRadius}`}
                fill="none"
                stroke="rgb(239, 68, 68)"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.4"
              />
              {/* Предна половина (изток, видима, непрекъсната) */}
              <path
                d={`M ${centerX},${centerY - sphereRadius}
                    A ${sphereRadius * 0.3},${sphereRadius} 0 0,0 ${centerX},${centerY + sphereRadius}`}
                fill="none"
                stroke="rgb(239, 68, 68)"
                strokeWidth="2"
                onMouseEnter={() => setHoveredElement('meridian')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              />
              <text
                x={centerX + 80}
                y={zenithY + 40}
                fontSize="12"
                fill="rgb(239, 68, 68)"
                fontWeight="bold"
              >
                Небесен меридиан
              </text>

              {/* Хоризонт - голям кръг на сферата */}
              {/* Задна половина (запад, невидима, пунктирана) */}
              <path
                d={`M ${centerX - sphereRadius},${centerY}
                    A ${sphereRadius},${sphereRadius * 0.25} 0 0,1 ${centerX + sphereRadius},${centerY}`}
                fill="none"
                stroke="rgb(34, 197, 94)"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.4"
              />
              {/* Предна половина (изток, видима, непрекъсната) */}
              <path
                d={`M ${centerX - sphereRadius},${centerY}
                    A ${sphereRadius},${sphereRadius * 0.25} 0 0,0 ${centerX + sphereRadius},${centerY}`}
                fill="none"
                stroke="rgb(34, 197, 94)"
                strokeWidth="3"
                onMouseEnter={() => setHoveredElement('horizon')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              />

              <text
                x={centerX + sphereRadius + 15}
                y={centerY + 15}
                fontSize="12"
                fill="rgb(34, 197, 94)"
                fontWeight="bold"
              >
                Хоризонт
              </text>

              {/* Небесен екватор - перпендикулярен на оста P-P' */}
              {/* Същият ексцентритет като хоризонта */}
              {/* Задна половина (невидима, пунктирана) */}
              <path
                d={`M ${centerX - sphereRadius},${centerY}
                    A ${sphereRadius},${sphereRadius * 0.25} 0 0,0 ${centerX + sphereRadius},${centerY}`}
                fill="none"
                stroke="rgb(168, 85, 247)"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.4"
                transform={`rotate(${equatorAngle} ${centerX} ${centerY})`}
              />
              {/* Предна половина (видима, непрекъсната) */}
              <path
                d={`M ${centerX - sphereRadius},${centerY}
                    A ${sphereRadius},${sphereRadius * 0.25} 0 0,1 ${centerX + sphereRadius},${centerY}`}
                fill="none"
                stroke="rgb(168, 85, 247)"
                strokeWidth="3"
                transform={`rotate(${equatorAngle} ${centerX} ${centerY})`}
                onMouseEnter={() => setHoveredElement('equator')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              />
              {/* Етикет на небесния екватор */}
              <text
                x={centerX - sphereRadius - 50}
                y={centerY + 80}
                fontSize="12"
                fill="rgb(168, 85, 247)"
                fontWeight="bold"
              >
                Небесен екватор
              </text>

              {/* Еклиптика (наклонена под 23.5° спрямо екватора) */}
              {/* Същият ексцентритет като хоризонта и екватора */}
              {/* Задна половина (невидима, пунктирана) */}
              <path
                d={`M ${centerX - sphereRadius},${centerY}
                    A ${sphereRadius},${sphereRadius * 0.25} 0 0,0 ${centerX + sphereRadius},${centerY}`}
                fill="none"
                stroke="rgb(251, 191, 36)"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.4"
                transform={`rotate(${equatorAngle - 23.5} ${centerX} ${centerY})`}
              />
              {/* Предна половина (видима, непрекъсната) */}
              <path
                d={`M ${centerX - sphereRadius},${centerY}
                    A ${sphereRadius},${sphereRadius * 0.25} 0 0,1 ${centerX + sphereRadius},${centerY}`}
                fill="none"
                stroke="rgb(251, 191, 36)"
                strokeWidth="3"
                transform={`rotate(${equatorAngle - 23.5} ${centerX} ${centerY})`}
                onMouseEnter={() => setHoveredElement('ecliptic')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              />
              {/* Етикет на еклиптиката */}
              <text
                x={centerX - sphereRadius - 80}
                y={centerY + 50}
                fontSize="12"
                fill="rgb(251, 191, 36)"
                fontWeight="bold"
              >
                Еклиптика
              </text>

              {/* Точки на хоризонта - само E (изток) и W (запад) */}
              {/* Изток (E) */}
              <circle
                cx={centerX + sphereRadius}
                cy={centerY}
                r="5"
                fill="rgb(34, 197, 94)"
                stroke="white"
                strokeWidth="1"
              />
              <text
                x={centerX + sphereRadius + 12}
                y={centerY + 5}
                fontSize="13"
                fill="rgb(34, 197, 94)"
                fontWeight="bold"
              >
                E
              </text>

              {/* Запад (W) */}
              <circle
                cx={centerX - sphereRadius}
                cy={centerY}
                r="5"
                fill="rgb(34, 197, 94)"
                stroke="white"
                strokeWidth="1"
              />
              <text
                x={centerX - sphereRadius - 20}
                y={centerY + 5}
                fontSize="13"
                fill="rgb(34, 197, 94)"
                fontWeight="bold"
              >
                W
              </text>

              {/* Пролетна точка (♈) - пресечна точка на екватора и еклиптиката */}
              {/* На изток, където екваторът и еклиптиката се пресичат */}
              <circle
                cx={centerX + sphereRadius}
                cy={centerY}
                r="7"
                fill="rgb(34, 197, 94)"
                stroke="white"
                strokeWidth="2"
                onMouseEnter={() => setHoveredElement('vernal')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              />
              <text
                x={centerX + sphereRadius + 15}
                y={centerY - 8}
                fontSize="13"
                fill="rgb(34, 197, 94)"
                fontWeight="bold"
              >
                ♈ Пролет
              </text>

              {/* Есенна точка (♎) - на запад, противоположна на пролетната */}
              <circle
                cx={centerX - sphereRadius}
                cy={centerY}
                r="7"
                fill="rgb(251, 146, 60)"
                stroke="white"
                strokeWidth="2"
                onMouseEnter={() => setHoveredElement('autumnal')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              />
              <text
                x={centerX - sphereRadius - 60}
                y={centerY - 8}
                fontSize="13"
                fill="rgb(251, 146, 60)"
                fontWeight="bold"
              >
                ♎ Есен
              </text>

              {/* Лятно слънцестоене - на еклиптиката, горе (максимална деклинация +23.5°) */}
              {/* На 90° по еклиптиката от пролетната точка */}
              <circle
                cx={centerX}
                cy={centerY - sphereRadius * 0.25}
                r="6"
                fill="rgb(255, 200, 0)"
                stroke="white"
                strokeWidth="2"
                transform={`rotate(${equatorAngle - 23.5} ${centerX} ${centerY})`}
                onMouseEnter={() => setHoveredElement('summer')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              />
              <text
                x={centerX - 50}
                y={centerY - sphereRadius * 0.35}
                fontSize="11"
                fill="rgb(255, 200, 0)"
                fontWeight="bold"
              >
                ☀️ Лято (21 юни)
              </text>

              {/* Зимно слънцестоене - долу (минимална деклинация -23.5°) */}
              <circle
                cx={centerX}
                cy={centerY + sphereRadius * 0.25}
                r="6"
                fill="rgb(150, 200, 255)"
                stroke="white"
                strokeWidth="2"
                transform={`rotate(${equatorAngle - 23.5} ${centerX} ${centerY})`}
                onMouseEnter={() => setHoveredElement('winter')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              />
              <text
                x={centerX - 60}
                y={centerY + sphereRadius * 0.4}
                fontSize="11"
                fill="rgb(150, 200, 255)"
                fontWeight="bold"
              >
                ❄️ Зима (21 дек)
              </text>

              {/* Наблюдател (център) */}
              <circle
                cx="300"
                cy="250"
                r="8"
                fill="rgb(234, 179, 8)"
                stroke="white"
                strokeWidth="2"
                onMouseEnter={() => setHoveredElement('observer')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              />
              <text
                x="315"
                y="255"
                fontSize="12"
                fill="rgb(234, 179, 8)"
                fontWeight="bold"
              >
                Наблюдател
              </text>

              {/* Зенит (Z) - винаги точно над наблюдателя (на върха на сферата) */}
              <circle
                cx={zenithX}
                cy={zenithY}
                r="8"
                fill="rgb(59, 130, 246)"
                stroke="white"
                strokeWidth="2"
                onMouseEnter={() => setHoveredElement('zenith')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              />
              <line
                x1={centerX}
                y1={centerY}
                x2={zenithX}
                y2={zenithY}
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
                strokeDasharray="3,3"
              />
              <text
                x={zenithX + 15}
                y={zenithY + 5}
                fontSize="14"
                fill="rgb(59, 130, 246)"
                fontWeight="bold"
              >
                Z
              </text>

              {/* Надир (Z') - винаги точно под наблюдателя (на дъното на сферата) */}
              <circle
                cx={nadirX}
                cy={nadirY}
                r="8"
                fill="rgb(156, 163, 175)"
                stroke="white"
                strokeWidth="2"
                onMouseEnter={() => setHoveredElement('nadir')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              />
              <line
                x1={centerX}
                y1={centerY}
                x2={nadirX}
                y2={nadirY}
                stroke="rgb(156, 163, 175)"
                strokeWidth="2"
                strokeDasharray="3,3"
              />
              <text
                x={nadirX + 15}
                y={nadirY + 5}
                fontSize="14"
                fill="rgb(156, 163, 175)"
                fontWeight="bold"
              >
                Z'
              </text>

              {/* Ос на света (линия между двата полюса) - НЕ вертикална! */}
              <line
                x1={poleX}
                y1={poleY}
                x2={southPoleX}
                y2={southPoleY}
                stroke="rgb(100, 100, 100)"
                strokeWidth="3"
                strokeDasharray="8,4"
                opacity="0.6"
              />

              {/* Северен полюс (P) - на СЕВЕР на хоризонта, на височина = φ */}
              <circle
                cx={poleX}
                cy={poleY}
                r="8"
                fill="rgb(239, 68, 68)"
                stroke="white"
                strokeWidth="2"
                onMouseEnter={() => setHoveredElement('north')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              />
              <text
                x={poleX - 35}
                y={poleY + 5}
                fontSize="14"
                fill="rgb(239, 68, 68)"
                fontWeight="bold"
              >
                P
              </text>

              {/* Южен полюс (P') - на юг, противоположна позиция */}
              <circle
                cx={southPoleX}
                cy={southPoleY}
                r="8"
                fill={
                  southPoleY > centerY
                    ? 'rgb(156, 163, 175)'
                    : 'rgb(239, 68, 68)'
                }
                stroke="white"
                strokeWidth="2"
                strokeDasharray={southPoleY > centerY ? '3,3' : 'none'}
                opacity={southPoleY > centerY ? 0.4 : 0.8}
                onMouseEnter={() => setHoveredElement('south')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              />
              <text
                x={southPoleX - 40}
                y={southPoleY + 5}
                fontSize="14"
                fill="rgb(156, 163, 175)"
                fontWeight="bold"
                opacity="0.6"
              >
                P'{' '}
                {southPoleY > centerY + sphereRadius * 0.8
                  ? '(под хоризонта)'
                  : ''}
              </text>
            </svg>

            {/* Информационен панел */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[120px]">
              {!hoveredElement && (
                <div>
                  <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">
                    Наблюдател на φ = {latitude}°
                  </h4>
                  {isEquator && (
                    <div className="text-sm space-y-1">
                      <p>
                        🌍 <strong>На екватора:</strong>
                      </p>
                      <p>• Небесните полюси са на хоризонта (север и юг)</p>
                      <p>• Небесният екватор минава през зенита</p>
                      <p>• Всички звезди изгряват и залязват вертикално</p>
                      <p>• Няма циркумполярни звезди</p>
                    </div>
                  )}
                  {isPole && (
                    <div className="text-sm space-y-1">
                      <p>
                        🧭 <strong>На Северния полюс:</strong>
                      </p>
                      <p>• Северният полюс съвпада със зенита</p>
                      <p>• Небесният екватор съвпада с хоризонта</p>
                      <p>
                        • Всички звезди се движат по кръгове, успоредни на
                        хоризонта
                      </p>
                      <p>• Всички видими звезди са циркумполярни</p>
                    </div>
                  )}
                  {!isEquator && !isPole && (
                    <div className="text-sm space-y-1">
                      <p>
                        📍 <strong>На средни ширини:</strong>
                      </p>
                      <p>
                        • Северният полюс е на височина {latitude}° над
                        хоризонта
                      </p>
                      <p>
                        • Небесният екватор е наклонен под {equatorTilt}° спрямо
                        хоризонта
                      </p>
                      <p>• Част от звездите са циркумполярни (не залязват)</p>
                      <p>
                        • Част от звездите никога не изгряват (под южния полюс)
                      </p>
                    </div>
                  )}
                  <p className="text-xs italic mt-3 text-gray-600 dark:text-gray-400">
                    Преминете с мишката над елементите, за да видите повече
                    информация.
                  </p>
                </div>
              )}
              {hoveredElement === 'horizon' && (
                <div>
                  <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">
                    Хоризонт
                  </h4>
                  <p className="text-sm">
                    Голям кръг, който разделя небето на видима и невидима част.
                    Това е границата между земята и небето от гледна точка на
                    наблюдателя.
                  </p>
                </div>
              )}
              {hoveredElement === 'equator' && (
                <div>
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 mb-2">
                    Небесен екватор
                  </h4>
                  <p className="text-sm">
                    Проекция на земния екватор върху небесната сфера. Разделя
                    небето на северно и южно полукълбо.
                  </p>
                </div>
              )}
              {hoveredElement === 'meridian' && (
                <div>
                  <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">
                    Небесен меридиан
                  </h4>
                  <p className="text-sm">
                    Вертикален голям кръг, минаващ през зенита (Z) и надира
                    (N'). Пресича хоризонта в северната (С) и южната (Ю) точка.
                  </p>
                  <p className="text-sm mt-2 font-semibold">
                    ⚠️ Важно: Небесният меридиан минава през небесните полюси (P
                    и P') САМО на географските полюси (φ = 90°). На други ширини
                    P и P' са ИЗВЪН меридиана!
                  </p>
                </div>
              )}
              {hoveredElement === 'zenith' && (
                <div>
                  <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">
                    Зенит (Z)
                  </h4>
                  <p className="text-sm">
                    Точката точно над главата на наблюдателя. Най-високата точка
                    на небесната сфера за даден наблюдател.
                  </p>
                </div>
              )}
              {hoveredElement === 'nadir' && (
                <div>
                  <h4 className="font-bold text-gray-600 dark:text-gray-400 mb-2">
                    Надир (Z')
                  </h4>
                  <p className="text-sm">
                    Точката точно под краката на наблюдателя. Противоположна на
                    зенита (Z). Невидима за наблюдателя, тъй като е под
                    хоризонта. Обозначава се със Z'.
                  </p>
                </div>
              )}
              {hoveredElement === 'north' && (
                <div>
                  <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">
                    Северен полюс на света (P)
                  </h4>
                  <p className="text-sm">
                    Проекция на северния полюс на Земята върху небесната сфера.
                    Близо до него се намира Полярната звезда. Около тази точка
                    видимо се въртят звездите.
                  </p>
                  <p className="text-sm mt-2 font-semibold">
                    За наблюдател в България (φ ≈ 42°N): Северният полюс е на
                    височина около 42° над северната точка на хоризонта.
                  </p>
                </div>
              )}
              {hoveredElement === 'south' && (
                <div>
                  <h4 className="font-bold text-gray-600 dark:text-gray-400 mb-2">
                    Южен полюс на света (P')
                  </h4>
                  <p className="text-sm">
                    Проекция на южния полюс на Земята върху небесната сфера.
                    Противоположна точка на северния полюс.
                  </p>
                  <p className="text-sm mt-2 font-semibold">
                    За наблюдател в България: Южният полюс е под хоризонта и е
                    невидим. Той е на 42° под южната точка на хоризонта.
                  </p>
                </div>
              )}
              {hoveredElement === 'observer' && (
                <div>
                  <h4 className="font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                    Наблюдател
                  </h4>
                  <p className="text-sm">
                    Центърът на небесната сфера. Всички небесни обекти изглеждат
                    еднакво далечни от наблюдателя, проектирани върху сферата.
                  </p>
                </div>
              )}
              {hoveredElement === 'ecliptic' && (
                <div>
                  <h4 className="font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                    Еклиптика
                  </h4>
                  <p className="text-sm">
                    Видимият годишен път на Слънцето по небесната сфера.
                    Всъщност това е проекция на орбитата на Земята около
                    Слънцето. Еклиптиката е наклонена под ъгъл от 23.5° спрямо
                    небесния екватор. По нея се движат и планетите (в
                    зодиакалния пояс).
                  </p>
                </div>
              )}
              {hoveredElement === 'vernal' && (
                <div>
                  <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">
                    Пролетна точка (♈)
                  </h4>
                  <p className="text-sm">
                    Точката, в която Слънцето пресича небесния екватор от юг към
                    север (около 21 март - пролетно равноденствие). Това е
                    началото на координатната система за ректасцензия (α = 0h).
                    Нарича се още "точка на пролетното равноденствие" или "първа
                    точка на Овена" (♈).
                  </p>
                </div>
              )}
              {hoveredElement === 'autumnal' && (
                <div>
                  <h4 className="font-bold text-orange-600 dark:text-orange-400 mb-2">
                    Есенна точка (♎)
                  </h4>
                  <p className="text-sm">
                    Точката, в която Слънцето пресича небесния екватор от север
                    към юг (около 23 септември - есенно равноденствие).
                    Противоположна на пролетната точка (α = 12h). Нарича се още
                    "първа точка на Везните" (♎).
                  </p>
                </div>
              )}
              {hoveredElement === 'summer' && (
                <div>
                  <h4 className="font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                    Лятно слънцестоене (☀️)
                  </h4>
                  <p className="text-sm">
                    Точката на еклиптиката, където Слънцето достига максимална
                    деклинация +23.5° (около 21 юни). Най-дългият ден в
                    Северното полукълбо. Слънцето е най-високо на небето.
                  </p>
                </div>
              )}
              {hoveredElement === 'winter' && (
                <div>
                  <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">
                    Зимно слънцестоене (❄️)
                  </h4>
                  <p className="text-sm">
                    Точката на еклиптиката, където Слънцето достига минимална
                    деклинация -23.5° (около 21 декември). Най-краткият ден в
                    Северното полукълбо. Слънцето е най-ниско на небето.
                  </p>
                </div>
              )}
              {!hoveredElement && (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  Преминете с мишката над елементите на диаграмата, за да видите
                  повече информация.
                </p>
              )}
            </div>

            {/* Допълнителна информация */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">💡 Ключови наблюдения:</h4>
              <ul className="text-sm space-y-2">
                <li>
                  <strong className="text-blue-600 dark:text-blue-400">
                    Зенит (Z) и Надир (Z'):
                  </strong>
                  Винаги на вертикалата (точно над/под наблюдателя)
                </li>
                <li>
                  <strong className="text-red-600 dark:text-red-400">
                    Северен полюс (P):
                  </strong>
                  На СЕВЕР на хоризонта, на височина h = φ = {latitude}°
                </li>
                {latitude < 90 && (
                  <li>
                    <strong className="text-gray-600 dark:text-gray-400">
                      Южен полюс (P'):
                    </strong>
                    На ЮГ на хоризонта,{' '}
                    {southPoleY > centerY
                      ? 'под хоризонта (невидим)'
                      : `на височина ${latitude}°`}
                  </li>
                )}
                <li>
                  <strong>Наклон на небесния екватор:</strong> {equatorTilt}°
                  спрямо хоризонта
                </li>
                {latitude > 0 && latitude < 90 && (
                  <li>
                    <strong>Циркумполярни звезди:</strong> Звезди с деклинация δ
                    &gt; {90 - latitude}° никога не залязват (виждат се като
                    светлосини точки около P)
                  </li>
                )}
                {latitude === 0 && (
                  <li className="text-green-600 dark:text-green-400 font-semibold">
                    ⚠️ На екватора P и P' са на хоризонта (север и юг). Всички
                    звезди изгряват и залязват!
                  </li>
                )}
                {latitude === 90 && (
                  <li className="text-blue-600 dark:text-blue-400 font-semibold">
                    ⚠️ На полюса P съвпада със Z! Всички видими звезди са
                    циркумполярни!
                  </li>
                )}
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. Основни елементи на небесната сфера
          </h2>

          <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
            4.1. Основни точки
          </h3>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <ul className="space-y-3">
              <li>
                <strong className="text-blue-600 dark:text-blue-400">
                  Зенит (Z)
                </strong>{' '}
                – точката точно над главата на наблюдателя
              </li>
              <li>
                <strong className="text-gray-600 dark:text-gray-400">
                  Надир (Z')
                </strong>{' '}
                – точката точно под краката на наблюдателя
              </li>
              <li>
                <strong className="text-red-600 dark:text-red-400">
                  Северен полюс на света (P)
                </strong>{' '}
                – посоката към Полярната звезда
              </li>
              <li>
                <strong className="text-red-600 dark:text-red-400">
                  Южен полюс на света (P')
                </strong>{' '}
                – противоположната посока
              </li>
            </ul>
          </div>

          <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
            4.2. Основни кръгове
          </h3>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <ul className="space-y-3">
              <li>
                <strong className="text-green-600 dark:text-green-400">
                  Хоризонт
                </strong>{' '}
                – голям кръг, който разделя небето на видима и невидима част
              </li>
              <li>
                <strong className="text-purple-600 dark:text-purple-400">
                  Небесен екватор
                </strong>{' '}
                – проекция на земния екватор върху небесната сфера
              </li>
              <li>
                <strong className="text-red-600 dark:text-red-400">
                  Небесен меридиан
                </strong>{' '}
                – вертикален кръг, минаващ през зенита и надира. Пресича
                хоризонта в северната и южната точка.
              </li>
              <li>
                <strong className="text-yellow-600 dark:text-yellow-400">
                  Еклиптика
                </strong>{' '}
                – видимият годишен път на Слънцето по небесната сфера
              </li>
            </ul>
          </div>

          <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
            4.3. Еклиптика и наклон на земната ос
          </h3>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
            <p className="mb-3">
              <strong>Еклиптиката</strong> е проекция на орбитата на Земята
              около Слънцето върху небесната сфера. От гледна точка на
              наблюдател на Земята, Слънцето изглежда като че се движи по
              еклиптиката в продължение на една година.
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>
                Еклиптиката е наклонена под <strong>23.5°</strong> спрямо
                небесния екватор
              </li>
              <li>Този наклон е причината за смяната на сезоните</li>
              <li>
                Планетите се движат близо до еклиптиката (в зодиакалния пояс)
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h4 className="font-semibold mb-2">Важни точки на еклиптиката:</h4>
            <ul className="space-y-2">
              <li>
                <strong className="text-green-600 dark:text-green-400">
                  Пролетна точка (♈)
                </strong>{' '}
                – Слънцето пресича екватора от юг към север (≈21 март). Начало
                на пролетта в Северното полукълбо. Ден = нощ.
              </li>
              <li>
                <strong className="text-yellow-600 dark:text-yellow-400">
                  Лятно слънцестоене
                </strong>{' '}
                – Слънцето е на максимална деклинация (+23.5°) (≈21 юни).
                Най-дългият ден в Северното полукълбо.
              </li>
              <li>
                <strong className="text-orange-600 dark:text-orange-400">
                  Есенна точка (♎)
                </strong>{' '}
                – Слънцето пресича екватора от север към юг (≈23 септември).
                Начало на есента. Ден = нощ.
              </li>
              <li>
                <strong className="text-blue-600 dark:text-blue-400">
                  Зимно слънцестоене
                </strong>{' '}
                – Слънцето е на минимална деклинация (-23.5°) (≈21 декември).
                Най-краткият ден в Северното полукълбо.
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            5. Как се изменя небето според географската ширина
          </h2>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">
                а) Наблюдател на екватора (φ = 0°)
              </h3>
              <p>
                Небесните полюси се намират на хоризонта. Звездите изгряват
                вертикално от изток и залязват вертикално на запад.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">
                б) Наблюдател в България (φ ≈ 42°)
              </h3>
              <p>
                Полярната звезда е на височина около 42° над хоризонта. Част от
                звездите са циркумполярни (не залязват никога).
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">
                в) Наблюдател на Северния полюс (φ = 90°)
              </h3>
              <p>
                Всички звезди се движат по кръгове, успоредни на хоризонта. Нито
                една звезда не изгрява и не залязва.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            6. Видимо дневно движение на небето
          </h2>
          <p className="mb-4 text-base sm:text-lg leading-relaxed">
            Поради въртенето на Земята около оста ѝ, имаме впечатление, че:
          </p>
          <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Звездите изгряват от изток</li>
              <li>Движат се по дъги</li>
              <li>Залязват на запад</li>
            </ul>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded mb-4">
            <p className="font-semibold mb-2">⚠️ В действителност:</p>
            <p>
              Земята се върти, а не небето. Това е ключова идея, която често се
              използва в олимпиадни задачи.
            </p>
          </div>

          {/* Интерактивна анимация */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 mb-6">
            <h3 className="font-semibold mb-3 text-center">
              Интерактивна анимация на звездното движение
            </h3>
            <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
              Наблюдавайте как звездите се движат по небето за наблюдател в
              България (φ ≈ 42°)
            </p>

            <svg
              viewBox="0 0 600 400"
              className="w-full h-auto"
              style={{ maxHeight: '400px' }}
            >
              {/* Хоризонт и земя */}
              <rect
                x="0"
                y="300"
                width="600"
                height="100"
                fill="rgb(34, 139, 34)"
                opacity="0.3"
              />
              <line
                x1="0"
                y1="300"
                x2="600"
                y2="300"
                stroke="rgb(34, 197, 94)"
                strokeWidth="3"
              />
              <text x="10" y="320" fontSize="12" fill="currentColor">
                Хоризонт
              </text>

              {/* Посоки */}
              <text
                x="10"
                y="295"
                fontSize="14"
                fill="currentColor"
                fontWeight="bold"
              >
                З
              </text>
              <text
                x="580"
                y="295"
                fontSize="14"
                fill="currentColor"
                fontWeight="bold"
              >
                И
              </text>
              <text
                x="295"
                y="20"
                fontSize="14"
                fill="currentColor"
                fontWeight="bold"
              >
                С
              </text>

              {/* Полярна звезда (неподвижна) */}
              <circle cx="300" cy="180" r="5" fill="gold">
                <animate
                  attributeName="opacity"
                  values="1;0.5;1"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <text x="310" y="185" fontSize="11" fill="gold" fontWeight="bold">
                Полярна звезда
              </text>

              {/* Циркумполярни звезди (не залязват) */}
              {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                const radius = 80;
                const centerX = 300;
                const centerY = 180;
                return (
                  <circle
                    key={`circum-${i}`}
                    cx={centerX + radius * Math.cos((angle * Math.PI) / 180)}
                    cy={centerY + radius * Math.sin((angle * Math.PI) / 180)}
                    r="3"
                    fill="lightblue"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from={`0 ${centerX} ${centerY}`}
                      to={`360 ${centerX} ${centerY}`}
                      dur="20s"
                      repeatCount="indefinite"
                    />
                  </circle>
                );
              })}

              {/* Дъга на циркумполярните звезди */}
              <circle
                cx="300"
                cy="180"
                r="80"
                fill="none"
                stroke="lightblue"
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.3"
              />

              {/* Звезди, които изгряват и залязват */}
              {/* Звезда 1 - изток към запад */}
              <g>
                <circle cx="0" cy="0" r="4" fill="yellow">
                  <animateMotion
                    path="M 500,300 Q 400,150 100,300"
                    dur="15s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;1;0"
                    keyTimes="0;0.1;0.5;0.9;1"
                    dur="15s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>

              {/* Звезда 2 */}
              <g>
                <circle cx="0" cy="0" r="4" fill="yellow">
                  <animateMotion
                    path="M 520,300 Q 420,180 120,300"
                    dur="15s"
                    begin="3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;1;0"
                    keyTimes="0;0.1;0.5;0.9;1"
                    dur="15s"
                    begin="3s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>

              {/* Звезда 3 */}
              <g>
                <circle cx="0" cy="0" r="4" fill="yellow">
                  <animateMotion
                    path="M 540,300 Q 440,200 140,300"
                    dur="15s"
                    begin="6s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;1;0"
                    keyTimes="0;0.1;0.5;0.9;1"
                    dur="15s"
                    begin="6s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>

              {/* Звезда на небесния екватор */}
              <g>
                <circle cx="0" cy="0" r="4" fill="orange">
                  <animateMotion
                    path="M 550,300 Q 450,220 150,300"
                    dur="15s"
                    begin="9s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;1;0"
                    keyTimes="0;0.1;0.5;0.9;1"
                    dur="15s"
                    begin="9s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>

              {/* Легенда */}
              <g transform="translate(10, 340)">
                <circle cx="5" cy="0" r="3" fill="gold" />
                <text x="15" y="4" fontSize="10" fill="currentColor">
                  Полярна звезда (неподвижна)
                </text>

                <circle cx="5" cy="20" r="3" fill="lightblue" />
                <text x="15" y="24" fontSize="10" fill="currentColor">
                  Циркумполярни звезди
                </text>

                <circle cx="5" cy="40" r="3" fill="yellow" />
                <text x="15" y="44" fontSize="10" fill="currentColor">
                  Звезди, които изгряват и залязват
                </text>
              </g>

              {/* Стрелка за посока на движение */}
              <g transform="translate(450, 100)">
                <path
                  d="M 0,0 Q 30,-20 60,0"
                  fill="none"
                  stroke="rgb(239, 68, 68)"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <text
                  x="20"
                  y="-25"
                  fontSize="11"
                  fill="rgb(239, 68, 68)"
                  fontWeight="bold"
                >
                  Посока на движение
                </text>
              </g>

              {/* Дефиниция на стрелка */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="rgb(239, 68, 68)" />
                </marker>
              </defs>
            </svg>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">Наблюдения:</h4>
              <ul className="text-sm space-y-2">
                <li>
                  🌟 <strong>Полярната звезда</strong> остава почти неподвижна
                  (близо до северния небесен полюс)
                </li>
                <li>
                  🔵 <strong>Циркумполярните звезди</strong> описват пълни
                  кръгове около полюса и никога не залязват
                </li>
                <li>
                  🟡 <strong>Другите звезди</strong> изгряват от изток, движат
                  се по дъги и залязват на запад
                </li>
                <li>
                  📐 Колкото по-близо е звездата до небесния екватор, толкова
                  по-голяма е дъгата, която описва над хоризонта
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Важни факти:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Земята се върти от запад към изток → звездите изглеждат като че
                се движат от изток към запад
              </li>
              <li>
                Една пълна обиколка = 360° за ~24 часа → звездите се движат ~15°
                на час
              </li>
              <li>Звездите близо до небесните полюси описват малки кръгове</li>
              <li>
                Звездите на небесния екватор изгряват точно на изток и залязват
                точно на запад
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            📝 Задачи за упражнение
          </h2>

          {/* Ниво А */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">
              Ниво А (Областен кръг)
            </h3>

            {/* Задача 1 */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">
                1. Дай определение за небесна сфера.
              </p>
              <button
                onClick={() => toggleSolution('a1')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a1']
                  ? '▼ Скрий решението'
                  : '▶ Покажи решението'}
              </button>
              {showSolutions['a1'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение и обяснение:</p>
                  <p className="mt-2">
                    Небесната сфера е въображаема сфера с много голям радиус, в
                    чийто център се намира наблюдателят, а всички небесни тела
                    се разглеждат като разположени върху нейната повърхност.
                    Този модел улеснява описанието на положенията чрез ъгли.
                  </p>
                </div>
              )}
            </div>

            {/* Задача 2 */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">
                2. Каква е разликата между зенит и надир?
              </p>
              <button
                onClick={() => toggleSolution('a2')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a2']
                  ? '▼ Скрий решението'
                  : '▶ Покажи решението'}
              </button>
              {showSolutions['a2'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение и обяснение:</p>
                  <p className="mt-2">
                    Зенитът е точката на небето точно над главата на
                    наблюдателя. Надирът е точката, разположена точно в
                    противоположната посока – под краката му. Те лежат на една и
                    съща права линия (вертикалата).
                  </p>
                </div>
              )}
            </div>

            {/* Задача 3 */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">
                3. Защо Полярната звезда е важна за ориентиране?
              </p>
              <button
                onClick={() => toggleSolution('a3')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a3']
                  ? '▼ Скрий решението'
                  : '▶ Покажи решението'}
              </button>
              {showSolutions['a3'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение и обяснение:</p>
                  <p className="mt-2">
                    Полярната звезда се намира много близо до северния небесен
                    полюс, затова почти не променя положението си на небето. Тя
                    показва посоката север и позволява да се ориентираме по
                    посоките на света.
                  </p>
                </div>
              )}
            </div>

            {/* Задача 4 */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">
                4. Кои от следните точки се намират на хоризонта?
              </p>
              <p className="mb-2">
                а) Зенит б) Надир в) Северна точка г) Полярна звезда
              </p>
              <button
                onClick={() => toggleSolution('a4')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a4']
                  ? '▼ Скрий решението'
                  : '▶ Покажи решението'}
              </button>
              {showSolutions['a4'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: в) Северна точка</p>
                  <p className="mt-2">
                    Обяснение: Хоризонтът е кръг, който разделя небето на видима
                    и невидима част. Северната (и южната, източната, западната)
                    точка се намират на хоризонта. Зенитът е над хоризонта,
                    надирът - под него, а Полярната звезда е над хоризонта (за
                    наблюдател в северното полукълбо).
                  </p>
                </div>
              )}
            </div>

            {/* Задача 5 */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-green-500">
              <p className="font-semibold mb-2">
                5. Каква е височината на зенита над хоризонта?
              </p>
              <button
                onClick={() => toggleSolution('a5')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['a5']
                  ? '▼ Скрий решението'
                  : '▶ Покажи решението'}
              </button>
              {showSolutions['a5'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: 90°</p>
                  <p className="mt-2">
                    Обяснение: Зенитът по дефиниция е точката точно над главата
                    на наблюдателя, което означава, че е на 90°
                    (перпендикулярно) спрямо хоризонта.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Ниво В */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-600 dark:text-yellow-400">
              Ниво В (Национален кръг)
            </h3>

            {/* Задача 3 */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">
                3. Наблюдател се намира на географска ширина 45°N. На каква
                височина над хоризонта ще види северния небесен полюс?
              </p>
              <button
                onClick={() => toggleSolution('b3')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b3']
                  ? '▼ Скрий решението'
                  : '▶ Покажи решението'}
              </button>
              {showSolutions['b3'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Отговор: 45°</p>
                  <p className="mt-2">
                    Обяснение: Височината на небесния полюс над хоризонта е
                    равна на географската ширина на наблюдателя. Това е важна
                    връзка между географските координати и небесната сфера. За
                    България (φ ≈ 42°), Полярната звезда е на около 42° над
                    хоризонта.
                  </p>
                </div>
              )}
            </div>

            {/* Задача 4 */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">
                4. Наблюдател се намира на Северния полюс. Къде ще бъде зенитът
                спрямо небесния екватор?
              </p>
              <button
                onClick={() => toggleSolution('b4')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b4']
                  ? '▼ Скрий решението'
                  : '▶ Покажи решението'}
              </button>
              {showSolutions['b4'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение и обяснение:</p>
                  <p className="mt-2">
                    На Северния полюс зенитът съвпада със северния небесен
                    полюс. Небесният екватор ще минава по хоризонта. Това
                    означава, че всички звезди ще се движат по окръжности,
                    успоредни на хоризонта.
                  </p>
                </div>
              )}
            </div>

            {/* Задача 5 */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">
                5. Опиши как ще се движат звездите по небето за наблюдател на
                екватора.
              </p>
              <button
                onClick={() => toggleSolution('b5')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b5']
                  ? '▼ Скрий решението'
                  : '▶ Покажи решението'}
              </button>
              {showSolutions['b5'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение и обяснение:</p>
                  <p className="mt-2">
                    За наблюдател на екватора небесните полюси се намират на
                    хоризонта (северният на северната точка, южният – на
                    южната). Всички звезди ще изгряват вертикално от изток и ще
                    залязват вертикално на запад, като пътят им ще бъде
                    перпендикулярен на хоризонта.
                  </p>
                </div>
              )}
            </div>

            {/* Задача 6 */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
              <p className="font-semibold mb-2">
                6. Ако една звезда никога не залязва за даден наблюдател, какво
                можем да кажем за географската му ширина?
              </p>
              <button
                onClick={() => toggleSolution('b6')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['b6']
                  ? '▼ Скрий решението'
                  : '▶ Покажи решението'}
              </button>
              {showSolutions['b6'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение и обяснение:</p>
                  <p className="mt-2">
                    Такива звезди се наричат циркумполярни. Това е възможно само
                    ако наблюдателят се намира достатъчно далеч от екватора (на
                    по-големи географски ширини). Колкото по-близо сме до
                    полюса, толкова повече звезди стават циркумполярни.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Ниво С */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">
              Ниво С (Международна олимпиада)
            </h3>

            {/* Задача 7 */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 border-red-500">
              <p className="font-semibold mb-2">
                7. Представи си, че Земята внезапно спира да се върти, но
                продължава да обикаля около Слънцето. Как ще изглежда движението
                на звездите по небето за наблюдател на Земята?
              </p>
              <button
                onClick={() => toggleSolution('c7')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {showSolutions['c7']
                  ? '▼ Скрий решението'
                  : '▶ Покажи решението'}
              </button>
              {showSolutions['c7'] && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-semibold">Решение:</p>
                  <p className="mt-2">
                    Ако Земята спре да се върти около оста си, ще изчезне
                    денонощното движение на небето. Звездите вече няма да
                    изгряват и залязват в рамките на едно денонощие.
                  </p>
                  <p className="mt-2">
                    Вместо това ще се наблюдава много бавно годишно движение на
                    звездното небе, причинено от обикалянето на Земята около
                    Слънцето. Това движение ще бъде приблизително 1° на ден
                    (360° / 365 дни).
                  </p>
                  <p className="mt-2">
                    Така една и съща част от небето ще остава почти неподвижна в
                    продължение на часове и дни – радикална промяна спрямо
                    реалната ситуация.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            9. Обобщение на лекцията
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
            <ul className="space-y-2">
              <li>✓ Астрономията работи с модели</li>
              <li>
                ✓ Небесната сфера е основният геометричен модел за описание на
                небето
              </li>
              <li>
                ✓ Зенит, надир, хоризонт, меридиан и небесен екватор са
                фундаментални понятия
              </li>
              <li>
                ✓ Пространственото мислене е ключово за решаване на силни
                олимпиадни задачи
              </li>
              <li>
                ✓ Височината на небесния полюс = географската ширина на
                наблюдателя
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
              Древните астрономи вярвали, че звездите са фиксирани на твърда
              кристална сфера, която се върти около Земята. Днес знаем, че това
              е оптична илюзия, причинена от въртенето на нашата планета.
              Въпреки това, концепцията за небесната сфера остава полезен
              инструмент за описание на положенията на небесните тела.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
