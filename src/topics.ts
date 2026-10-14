// Темите и уроците – за менюто и за началната страница.

export const mathTopics = [
  {
    name: 'Алгебра',
    path: '/algebra',
    subtopics: [
      { name: 'Дроби и проценти', path: '/fractions' },
      { name: 'Степени и корени', path: '/powers' },
      { name: 'Логаритми', path: '/logarithms' },
      { name: 'Линейни уравнения', path: '/linear' },
      { name: 'Квадратни уравнения', path: '/quadratic' },
      { name: 'Системи уравнения', path: '/systems' },
      { name: 'Матрици', path: '/matrices' },
      { name: 'Неравенства', path: '/inequalities' },
      { name: 'Олимпиадни неравенства', path: '/olympiad-inequalities' },
      { name: 'Прогресии', path: '/sequences' },
      { name: 'Комплексни числа', path: '/complex' },
    ],
  },
  {
    name: 'Теория на числата',
    path: '/numbers',
    subtopics: [
      { name: 'Делимост и прости числа', path: '/divisibility' },
      { name: 'НОД и НОК', path: '/gcd' },
      { name: 'Остатъци и сравнения', path: '/modular' },
    ],
  },
  {
    name: 'Функции',
    path: '/functions',
    subtopics: [
      { name: 'Линейни функции', path: '/linear' },
      { name: 'Квадратни функции', path: '/quadratic' },
      { name: 'Графики на функции', path: '/grapher' },
    ],
  },
  {
    name: 'Анализ',
    path: '/analysis',
    subtopics: [
      { name: 'Граници и непрекъснатост', path: '/limits' },
      { name: 'Производни', path: '/derivatives' },
      { name: 'Интеграли', path: '/integrals' },
      { name: 'Диференциални уравнения', path: '/differential-equations' },
    ],
  },
  {
    name: 'Геометрия',
    path: '/geometry',
    subtopics: [
      { name: 'Триъгълник', path: '/triangle' },
      { name: 'Подобни триъгълници', path: '/similar' },
      { name: 'Тригонометрия', path: '/trigonometry' },
      { name: 'Вектори', path: '/vectors' },
      { name: 'Четириъгълник', path: '/quadrilateral' },
      { name: 'Многоъгълници и лица', path: '/polygons' },
      { name: 'Окръжност и кръг', path: '/circle' },
      { name: 'Стереометрия', path: '/solids' },
    ],
  },
  {
    name: 'Вероятности',
    path: '/probability',
    subtopics: [
      { name: 'Комбинаторика', path: '/combinatorics' },
      { name: 'Вероятности и статистика', path: '/basics' },
    ],
  },
];

export const physicsTopics = [
  {
    name: 'Механика',
    path: '/physics/mechanics',
    subtopics: [
      { name: 'Величини, единици и оценки', path: '/units' },
      { name: 'Праволинейно движение', path: '/linear-motion' },
      { name: 'Движение в равнина', path: '/plane-motion' },
      { name: 'Закони на Нютон', path: '/newton' },
      { name: 'Работа, енергия, мощност', path: '/energy' },
      { name: 'Импулс и удари', path: '/momentum' },
      { name: 'Въртене', path: '/rotation' },
      { name: 'Статика и флуиди', path: '/statics-fluids' },
    ],
  },
  {
    name: 'Трептения и вълни',
    path: '/physics/waves',
    subtopics: [
      { name: 'Трептения', path: '/oscillations' },
      { name: 'Вълни', path: '/waves' },
      { name: 'Звук', path: '/sound' },
    ],
  },
  {
    name: 'Топлина',
    path: '/physics/heat',
    subtopics: [
      { name: 'Температура и топлина', path: '/temperature' },
      { name: 'Идеален газ', path: '/ideal-gas' },
      { name: 'Термодинамика', path: '/thermodynamics' },
    ],
  },
  {
    name: 'Електричество и магнетизъм',
    path: '/physics/electricity',
    subtopics: [
      { name: 'Електростатика', path: '/electrostatics' },
      { name: 'Кондензатори', path: '/capacitors' },
      { name: 'Постоянен ток', path: '/direct-current' },
      { name: 'Магнитно поле', path: '/magnetic-field' },
      { name: 'Електромагнитна индукция', path: '/induction' },
      { name: 'Променлив ток и ЕМ вълни', path: '/ac-em-waves' },
    ],
  },
  {
    name: 'Оптика',
    path: '/physics/optics',
    subtopics: [
      { name: 'Отражение и пречупване', path: '/reflection-refraction' },
      { name: 'Лещи и оптични уреди', path: '/lenses' },
      { name: 'Вълнова оптика', path: '/wave-optics' },
    ],
  },
  {
    name: 'Съвременна физика',
    path: '/physics/modern',
    subtopics: [
      { name: 'Фотони и фотоефект', path: '/photons' },
      { name: 'Атомът', path: '/atom' },
      { name: 'Ядро и радиоактивност', path: '/nucleus' },
      { name: 'Вълнова функция и неопределеност', path: '/uncertainty' },
      { name: 'Частица в кутия и тунелен ефект', path: '/particle-in-box' },
      { name: 'Квантовият атом', path: '/quantum-atom' },
    ],
  },
];

/** Въведението е преди лекция 1 и е без номер – номерата на лекциите (и адресите им) не се променят. */
export const astronomyIntro = { name: 'Въведение: какво изучава астрономията', path: '/astronomy/intro' };

export const astronomyTopics = [
  {
    name: 'Астрономия',
    path: '/astronomy',
    subtopics: [
      { name: 'Небесната сфера', path: '/lecture01' },
      { name: 'Небесни координати', path: '/lecture02' },
      { name: 'Движение на Земята', path: '/lecture03' },
      { name: 'Фази на Луната', path: '/lecture04' },
      { name: 'Слънчеви затъмнения', path: '/lecture05' },
      { name: 'Гравитация', path: '/lecture06' },
      { name: 'Закони на Кеплер', path: '/lecture07' },
      { name: 'Орбити и скорости', path: '/lecture08' },
      { name: 'Светлина и спектри', path: '/lecture09' },
      { name: 'Телескопи', path: '/lecture10' },
      { name: 'Слънцето', path: '/lecture11' },
      { name: 'Слънчева активност', path: '/lecture12' },
      { name: 'Планети от земен тип', path: '/lecture13' },
      { name: 'Газови гиганти', path: '/lecture14' },
      { name: 'Малки тела', path: '/lecture15' },
      { name: 'Комети и метеори', path: '/lecture16' },
      { name: 'Астероиди', path: '/lecture17' },
      { name: 'Звезди', path: '/lecture18' },
      { name: 'HR диаграма', path: '/lecture19' },
      { name: 'Еволюция на звездите', path: '/lecture20' },
      { name: 'Бели джуджета и черни дупки', path: '/lecture21' },
      { name: 'Двойни звезди', path: '/lecture22' },
      { name: 'Променливи звезди', path: '/lecture23' },
      { name: 'Разстояния', path: '/lecture24' },
      { name: 'Галактики', path: '/lecture25' },
      { name: 'Млечният път', path: '/lecture26' },
      { name: 'Големият взрив', path: '/lecture27' },
      { name: 'Разширяване на Вселената', path: '/lecture28' },
      { name: 'Тъмна материя', path: '/lecture29' },
      { name: 'Екзопланети', path: '/lecture30' },
      { name: 'Астробиология', path: '/lecture31' },
      { name: 'Методи за наблюдение', path: '/lecture32' },
      { name: 'Специална теория на относителността', path: '/lecture33' },
    ],
  },
];
