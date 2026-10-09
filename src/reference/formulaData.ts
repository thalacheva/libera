// Справочник: формулите от уроците в кратък вид и физичните константи.
// Всяка формула е записана така, както е в съответния урок (lesson – пътят до него).

export type Formula = {
  name: string;
  formula: string;
  note?: string;
  lesson?: string;
};

export type FormulaGroup = {
  id: string;
  title: string;
  formulas: Formula[];
};

export type Section = {
  id: string;
  title: string;
  groups: FormulaGroup[];
};

const A = (n: number) => `/astronomy/lecture${String(n).padStart(2, '0')}`;

export const MATH: Section = {
  id: 'math',
  title: 'Математика',
  groups: [
    {
      id: 'numbers',
      title: 'Дроби, проценти, степени и корени',
      formulas: [
        {
          name: 'Събиране на дроби',
          formula: '\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}',
          lesson: '/algebra/fractions',
        },
        {
          name: 'Умножение и деление на дроби',
          formula: '\\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{ac}{bd} \\qquad \\frac{a}{b} : \\frac{c}{d} = \\frac{a}{b} \\cdot \\frac{d}{c}',
          lesson: '/algebra/fractions',
        },
        {
          name: 'p% от числото A',
          formula: '\\frac{p}{100} \\cdot A',
          note: '1% = 1/100 = 0,01',
          lesson: '/algebra/fractions',
        },
        {
          name: 'Увеличение и намаление с p%',
          formula: 'A \\cdot \\left(1 + \\frac{p}{100}\\right) \\qquad A \\cdot \\left(1 - \\frac{p}{100}\\right)',
          note: 'при поредни промени множителите се умножават',
          lesson: '/algebra/fractions',
        },
        {
          name: 'Сложна лихва',
          formula: 'S = S_0 \\left(1 + \\frac{r}{100}\\right)^{n}',
          note: 'r% годишно, n години',
          lesson: '/algebra/fractions',
        },
        {
          name: 'Действия със степени',
          formula:
            'a^m \\cdot a^n = a^{m+n} \\qquad a^m : a^n = a^{m-n} \\qquad (a^m)^n = a^{mn} \\qquad (ab)^n = a^n b^n',
          lesson: '/algebra/powers',
        },
        {
          name: 'Нулев и отрицателен показател',
          formula: 'a^0 = 1 \\qquad a^{-n} = \\frac{1}{a^n}',
          note: 'a ≠ 0',
          lesson: '/algebra/powers',
        },
        {
          name: 'Свойства на корените',
          formula: '\\sqrt{ab} = \\sqrt{a}\\cdot\\sqrt{b} \\qquad \\sqrt{\\frac{a}{b}} = \\frac{\\sqrt{a}}{\\sqrt{b}} \\qquad \\sqrt{x^2} = |x|',
          note: '√(a + b) ≠ √a + √b',
          lesson: '/algebra/powers',
        },
        {
          name: 'Степен с дробен показател',
          formula: 'a^{\\frac{m}{n}} = \\sqrt[n]{a^m} = \\left(\\sqrt[n]{a}\\right)^m',
          note: 'a > 0',
          lesson: '/algebra/powers',
        },
        {
          name: 'Рационализиране',
          formula: '\\frac{1}{\\sqrt{a} - \\sqrt{b}} = \\frac{\\sqrt{a} + \\sqrt{b}}{a - b}',
          lesson: '/algebra/powers',
        },
        {
          name: 'Формули за съкратено умножение',
          formula: '(a \\pm b)^2 = a^2 \\pm 2ab + b^2 \\qquad a^2 - b^2 = (a - b)(a + b)',
        },
        {
          name: 'Куб на сбор и разлика',
          formula:
            '(a \\pm b)^3 = a^3 \\pm 3a^2b + 3ab^2 \\pm b^3 \\qquad a^3 \\pm b^3 = (a \\pm b)(a^2 \\mp ab + b^2)',
        },
      ],
    },
    {
      id: 'logarithms',
      title: 'Логаритми',
      formulas: [
        {
          name: 'Определение',
          formula: '\\log_a b = c \\iff a^c = b',
          note: 'a > 0, a ≠ 1, b > 0',
          lesson: '/algebra/logarithms',
        },
        {
          name: 'Основно тъждество',
          formula: 'a^{\\log_a b} = b',
          lesson: '/algebra/logarithms',
        },
        {
          name: 'Логаритъм от произведение и частно',
          formula:
            '\\log_a (xy) = \\log_a x + \\log_a y \\qquad \\log_a \\frac{x}{y} = \\log_a x - \\log_a y',
          lesson: '/algebra/logarithms',
        },
        {
          name: 'Логаритъм от степен',
          formula: '\\log_a x^n = n \\log_a x',
          lesson: '/algebra/logarithms',
        },
        {
          name: 'Смяна на основата',
          formula: '\\log_a b = \\frac{\\log_c b}{\\log_c a}',
          lesson: '/algebra/logarithms',
        },
        {
          name: 'Особени стойности',
          formula: '\\log_a 1 = 0 \\qquad \\log_a a = 1',
          lesson: '/algebra/logarithms',
        },
      ],
    },
    {
      id: 'equations',
      title: 'Уравнения, системи и неравенства',
      formulas: [
        {
          name: 'Линейно уравнение',
          formula: 'ax + b = 0 \\;\\Rightarrow\\; x = -\\frac{b}{a}',
          note: 'a ≠ 0',
          lesson: '/algebra/linear',
        },
        {
          name: 'Уравнение с модул',
          formula: '|x - a| = b \\;\\Rightarrow\\; x = a \\pm b',
          note: 'при b > 0; при b < 0 няма решение',
          lesson: '/algebra/linear',
        },
        {
          name: 'Дискриминанта',
          formula: 'D = b^2 - 4ac',
          lesson: '/algebra/quadratic',
        },
        {
          name: 'Корени на квадратно уравнение',
          formula: 'x_{1,2} = \\frac{-b \\pm \\sqrt{D}}{2a}',
          note: 'D > 0 – два корена; D = 0 – един; D < 0 – няма реални',
          lesson: '/algebra/quadratic',
        },
        {
          name: 'Съкратена формула (b = 2k)',
          formula: 'x_{1,2} = \\frac{-k \\pm \\sqrt{k^2 - ac}}{a}',
          lesson: '/algebra/quadratic',
        },
        {
          name: 'Формули на Виет',
          formula: 'x_1 + x_2 = -\\frac{b}{a} \\qquad x_1 x_2 = \\frac{c}{a}',
          lesson: '/algebra/quadratic',
        },
        {
          name: 'Разлагане на квадратния тричлен',
          formula: 'ax^2 + bx + c = a(x - x_1)(x - x_2)',
          lesson: '/algebra/quadratic',
        },
        {
          name: 'Правило на Крамер',
          formula: 'x = \\frac{D_x}{D} \\qquad y = \\frac{D_y}{D}',
          note: 'D = a₁b₂ − a₂b₁, Dₓ = c₁b₂ − c₂b₁, Dᵧ = a₁c₂ − a₂c₁',
          lesson: '/algebra/systems',
        },
        {
          name: 'Симетрични системи',
          formula: 'x + y = s,\\; xy = p \\;\\Rightarrow\\; t^2 - st + p = 0',
          note: 'x² + y² = s² − 2p;   x³ + y³ = s³ − 3ps',
          lesson: '/algebra/systems',
        },
        {
          name: 'Неравенства с модул',
          formula:
            '|x - a| < r \\iff a - r < x < a + r \\qquad |x - a| > r \\iff x < a - r \\;\\text{или}\\; x > a + r',
          note: 'r > 0',
          lesson: '/algebra/inequalities',
        },
        {
          name: 'Средно аритметично и средно геометрично',
          formula: '\\frac{a + b}{2} \\ge \\sqrt{ab}',
          note: 'a, b ≥ 0; равенство при a = b',
          lesson: '/algebra/inequalities',
        },
      ],
    },
    {
      id: 'sequences',
      title: 'Прогресии',
      formulas: [
        {
          name: 'Аритметична прогресия – общ член',
          formula: 'a_n = a_1 + (n - 1)d',
          lesson: '/algebra/sequences',
        },
        {
          name: 'Аритметична прогресия – сбор',
          formula: 'S_n = \\frac{n(a_1 + a_n)}{2} = \\frac{n\\,(2a_1 + (n - 1)d)}{2}',
          lesson: '/algebra/sequences',
        },
        {
          name: 'Сбор на първите n естествени числа',
          formula: '1 + 2 + \\dots + n = \\frac{n(n + 1)}{2}',
          lesson: '/algebra/sequences',
        },
        {
          name: 'Геометрична прогресия – общ член',
          formula: 'a_n = a_1 q^{n-1}',
          lesson: '/algebra/sequences',
        },
        {
          name: 'Геометрична прогресия – сбор',
          formula: 'S_n = \\frac{a_1(q^n - 1)}{q - 1}',
          note: 'q ≠ 1',
          lesson: '/algebra/sequences',
        },
        {
          name: 'Безкрайна намаляваща геометрична прогресия',
          formula: 'S = \\frac{a_1}{1 - q}',
          note: '|q| < 1',
          lesson: '/algebra/sequences',
        },
      ],
    },
    {
      id: 'functions',
      title: 'Функции',
      formulas: [
        {
          name: 'Линейна функция',
          formula: 'y = ax + b',
          note: 'a – наклон, b – пресечна точка с Oy',
          lesson: '/functions/linear',
        },
        {
          name: 'Права и обратна пропорционалност',
          formula: 'y = kx \\qquad y = \\frac{k}{x}',
          lesson: '/functions/linear',
        },
        {
          name: 'Връх на параболата',
          formula: 'x_0 = -\\frac{b}{2a} \\qquad y_0 = -\\frac{D}{4a}',
          lesson: '/functions/quadratic',
        },
        {
          name: 'Връхна форма',
          formula: 'y = a(x - x_0)^2 + y_0',
          lesson: '/functions/quadratic',
        },
        {
          name: 'Преместване на графика',
          formula: 'y = f(x - h) + k',
          note: 'h надясно, k нагоре',
          lesson: '/functions/grapher',
        },
        {
          name: 'Четна и нечетна функция',
          formula: 'f(-x) = f(x) \\qquad f(-x) = -f(x)',
          lesson: '/functions/grapher',
        },
        {
          name: 'Логаритмична и показателна функция',
          formula: 'y = \\log_a x \\iff x = a^y',
          note: 'графиките са симетрични спрямо y = x',
          lesson: '/algebra/logarithms',
        },
      ],
    },
    {
      id: 'triangle',
      title: 'Триъгълник и подобие',
      formulas: [
        {
          name: 'Сбор на ъглите',
          formula: '\\alpha + \\beta + \\gamma = 180^\\circ',
          lesson: '/geometry/triangle',
        },
        {
          name: 'Неравенство на триъгълника',
          formula: '|b - c| < a < b + c',
          lesson: '/geometry/triangle',
        },
        {
          name: 'Питагорова теорема',
          formula: 'c^2 = a^2 + b^2',
          lesson: '/geometry/triangle',
        },
        {
          name: 'Формула на Херон',
          formula: 'S = \\sqrt{p(p - a)(p - b)(p - c)}, \\quad p = \\frac{a + b + c}{2}',
          lesson: '/geometry/triangle',
        },
        {
          name: 'Метрични зависимости в правоъгълен триъгълник',
          formula: 'h^2 = pq \\qquad a^2 = cq \\qquad b^2 = cp \\qquad ab = ch',
          lesson: '/geometry/similar',
        },
        {
          name: 'Теорема на Талес',
          formula: 'MN \\parallel BC \\;\\Rightarrow\\; \\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{MN}{BC}',
          lesson: '/geometry/similar',
        },
        {
          name: 'Подобни фигури',
          formula: '\\frac{P_1}{P} = k \\qquad \\frac{S_1}{S} = k^2 \\qquad \\frac{V_1}{V} = k^3',
          lesson: '/geometry/similar',
        },
        {
          name: 'Пропорция',
          formula: 'a : b = c : d \\;\\Rightarrow\\; ad = bc',
          lesson: '/geometry/similar',
        },
      ],
    },
    {
      id: 'trigonometry',
      title: 'Тригонометрия',
      formulas: [
        {
          name: 'Функции на остър ъгъл',
          formula: '\\sin\\alpha = \\frac{a}{c} \\qquad \\cos\\alpha = \\frac{b}{c} \\qquad \\tg\\alpha = \\frac{a}{b} \\qquad \\cotg\\alpha = \\frac{b}{a}',
          lesson: '/geometry/trigonometry',
        },
        {
          name: 'Основно тъждество',
          formula: '\\sin^2\\alpha + \\cos^2\\alpha = 1',
          lesson: '/geometry/trigonometry',
        },
        {
          name: 'Тангенс и котангенс',
          formula: '\\tg\\alpha = \\frac{\\sin\\alpha}{\\cos\\alpha} \\qquad \\tg\\alpha \\cdot \\cotg\\alpha = 1',
          lesson: '/geometry/trigonometry',
        },
        {
          name: 'Допълнителни ъгли',
          formula: '\\sin(90^\\circ - \\alpha) = \\cos\\alpha \\qquad \\cos(90^\\circ - \\alpha) = \\sin\\alpha',
          lesson: '/geometry/trigonometry',
        },
        {
          name: 'Формули за 180° − α',
          formula: '\\sin(180^\\circ - \\alpha) = \\sin\\alpha \\qquad \\cos(180^\\circ - \\alpha) = -\\cos\\alpha',
          lesson: '/geometry/trigonometry',
        },
        {
          name: 'Синусова теорема',
          formula: '\\frac{a}{\\sin\\alpha} = \\frac{b}{\\sin\\beta} = \\frac{c}{\\sin\\gamma} = 2R',
          lesson: '/geometry/trigonometry',
        },
        {
          name: 'Косинусова теорема',
          formula: 'c^2 = a^2 + b^2 - 2ab\\cos\\gamma',
          lesson: '/geometry/trigonometry',
        },
        {
          name: 'Лице чрез синус',
          formula: 'S = \\frac{1}{2}\\,ab\\sin\\gamma = \\frac{abc}{4R}',
          lesson: '/geometry/trigonometry',
        },
      ],
    },
    {
      id: 'vectors',
      title: 'Вектори',
      formulas: [
        {
          name: 'Вектор по координати',
          formula: '\\overrightarrow{AB} = (x_2 - x_1;\\; y_2 - y_1)',
          note: '„край минус начало“',
          lesson: '/geometry/vectors',
        },
        {
          name: 'Дължина на вектор',
          formula: '|\\vec a| = \\sqrt{a_1^2 + a_2^2}',
          lesson: '/geometry/vectors',
        },
        {
          name: 'Среда на отсечка',
          formula: 'M\\left(\\frac{x_1 + x_2}{2};\\; \\frac{y_1 + y_2}{2}\\right)',
          lesson: '/geometry/vectors',
        },
        {
          name: 'Скаларно произведение',
          formula: '\\vec a \\cdot \\vec b = |\\vec a|\\,|\\vec b| \\cos\\varphi = a_1b_1 + a_2b_2',
          lesson: '/geometry/vectors',
        },
        {
          name: 'Перпендикулярност',
          formula: '\\vec a \\perp \\vec b \\iff \\vec a \\cdot \\vec b = 0',
          lesson: '/geometry/vectors',
        },
      ],
    },
    {
      id: 'polygons',
      title: 'Многоъгълници и окръжност',
      formulas: [
        {
          name: 'Сбор на ъглите на n-ъгълник',
          formula: '(n - 2) \\cdot 180^\\circ',
          note: 'сборът на външните ъгли е 360°',
          lesson: '/geometry/polygons',
        },
        {
          name: 'Брой диагонали',
          formula: '\\frac{n(n - 3)}{2}',
          lesson: '/geometry/polygons',
        },
        {
          name: 'Лице на правилен многоъгълник',
          formula: 'S = \\frac{1}{2}\\,P r',
          note: 'r – апотема',
          lesson: '/geometry/polygons',
        },
        {
          name: 'Правилен шестоъгълник',
          formula: 'S = \\frac{3\\sqrt{3}\\,a^2}{2}',
          lesson: '/geometry/polygons',
        },
        {
          name: 'Формула на Гаус',
          formula: 'S = \\frac{1}{2}\\left|x_1y_2 - x_2y_1 + x_2y_3 - x_3y_2 + \\dots + x_ny_1 - x_1y_n\\right|',
          lesson: '/geometry/polygons',
        },
        {
          name: 'Формула на Пик',
          formula: 'S = I + \\frac{B}{2} - 1',
          note: 'I – възли вътре, B – възли по контура',
          lesson: '/geometry/polygons',
        },
        {
          name: 'Дължина на окръжност и лице на кръг',
          formula: 'C = 2\\pi r \\qquad S = \\pi r^2',
          lesson: '/geometry/circle',
        },
        {
          name: 'Дъга и сектор',
          formula: 'l = \\frac{\\pi r \\alpha}{180^\\circ} \\qquad S = \\frac{\\pi r^2 \\alpha}{360^\\circ} = \\frac{l\\,r}{2}',
          lesson: '/geometry/circle',
        },
        {
          name: 'Радиан',
          formula: '1\\ \\text{rad} \\approx 57{,}3^\\circ \\qquad l = \\alpha r',
          note: 'α в радиани',
          lesson: '/geometry/circle',
        },
        {
          name: 'Допирателни от външна точка',
          formula: 'PT_1 = PT_2 = \\sqrt{OP^2 - r^2}',
          lesson: '/geometry/circle',
        },
        {
          name: 'Вписан ъгъл',
          formula: '\\text{вписан ъгъл} = \\frac{1}{2}\\cdot\\text{централен ъгъл}',
          lesson: '/geometry/circle',
        },
        {
          name: 'Вписан четириъгълник',
          formula: '\\angle A + \\angle C = 180^\\circ',
          lesson: '/geometry/circle',
        },
      ],
    },
    {
      id: 'solids',
      title: 'Стереометрия',
      formulas: [
        {
          name: 'Формула на Ойлер',
          formula: 'V - E + F = 2',
          lesson: '/geometry/solids',
        },
        {
          name: 'Правоъгълен паралелепипед',
          formula: 'V = abc \\qquad S = 2(ab + bc + ca) \\qquad d = \\sqrt{a^2 + b^2 + c^2}',
          lesson: '/geometry/solids',
        },
        {
          name: 'Куб',
          formula: 'V = a^3 \\qquad S = 6a^2 \\qquad d = a\\sqrt{3}',
          lesson: '/geometry/solids',
        },
        {
          name: 'Призма и пирамида',
          formula: 'V = B h \\qquad V = \\frac{1}{3} B h',
          lesson: '/geometry/solids',
        },
        {
          name: 'Цилиндър',
          formula: 'V = \\pi r^2 h \\qquad S = 2\\pi r^2 + 2\\pi r h',
          lesson: '/geometry/solids',
        },
        {
          name: 'Конус',
          formula: 'V = \\frac{1}{3}\\pi r^2 h \\qquad S = \\pi r^2 + \\pi r l',
          lesson: '/geometry/solids',
        },
        {
          name: 'Кълбо и сфера',
          formula: 'V = \\frac{4}{3}\\pi r^3 \\qquad S = 4\\pi r^2',
          lesson: '/geometry/solids',
        },
      ],
    },
    {
      id: 'probability',
      title: 'Комбинаторика и вероятности',
      formulas: [
        {
          name: 'Пермутации',
          formula: 'P_n = n! = 1 \\cdot 2 \\cdot \\ldots \\cdot n',
          note: '0! = 1',
          lesson: '/probability/combinatorics',
        },
        {
          name: 'Пермутации с повторение',
          formula: '\\frac{n!}{k_1!\\, k_2! \\cdots}',
          lesson: '/probability/combinatorics',
        },
        {
          name: 'Вариации',
          formula: 'V(n, k) = \\frac{n!}{(n - k)!}',
          note: 'с повторение: nᵏ',
          lesson: '/probability/combinatorics',
        },
        {
          name: 'Комбинации',
          formula: 'C(n, k) = \\frac{n!}{k!\\,(n - k)!}',
          lesson: '/probability/combinatorics',
        },
        {
          name: 'Свойства на комбинациите',
          formula:
            'C(n, k) = C(n, n - k) \\qquad C(n, k) = C(n - 1, k - 1) + C(n - 1, k)',
          lesson: '/probability/combinatorics',
        },
        {
          name: 'Бином на Нютон',
          formula: '(a + b)^n = \\sum_{k=0}^{n} C(n, k)\\, a^{n-k} b^k',
          lesson: '/probability/combinatorics',
        },
        {
          name: 'Принцип на чекмеджетата',
          formula: 'kn + 1 \\text{ предмета в } n \\text{ чекмеджета} \\;\\Rightarrow\\; \\text{в някое има поне } k + 1',
          lesson: '/probability/combinatorics',
        },
        {
          name: 'Класическа вероятност',
          formula: 'P(A) = \\frac{m}{n}',
          lesson: '/probability/basics',
        },
        {
          name: 'Противоположно събитие',
          formula: 'P(\\bar A) = 1 - P(A)',
          lesson: '/probability/basics',
        },
        {
          name: 'Несъвместими и независими събития',
          formula: 'P(A \\cup B) = P(A) + P(B) \\qquad P(A \\cap B) = P(A)\\,P(B)',
          lesson: '/probability/basics',
        },
      ],
    },
  ],
};

export const ASTRONOMY: Section = {
  id: 'astronomy',
  title: 'Астрономия',
  groups: [
    {
      id: 'sphere',
      title: 'Небесна сфера и време',
      formulas: [
        { name: 'Височина на полюса', formula: 'h_P = \\varphi', lesson: A(1) },
        { name: 'Зенитно разстояние', formula: 'z = 90^\\circ - h', lesson: A(2) },
        {
          name: 'Звездно време',
          formula: 'S = t + \\alpha',
          note: 'в горна кулминация S = α',
          lesson: A(2),
        },
        {
          name: 'Часове и градуси',
          formula: '1^{\\mathrm h} = 15^\\circ \\qquad 1^{\\mathrm m} = 15\' \\qquad 1^{\\mathrm s} = 15\'\'',
          lesson: A(2),
        },
        {
          name: 'Звездно и слънчево денонощие',
          formula: 'T_\\odot = T_\\star \\cdot \\frac{366{,}26}{365{,}26}',
          note: 'T★ = 23h 56m 04s',
          lesson: A(3),
        },
        {
          name: 'Изгрев и залез',
          formula: '\\cos t_0 = -\\tg\\varphi \\cdot \\tg\\delta',
          note: 'продължителност на деня 2t₀ / 15°',
          lesson: A(3),
        },
        {
          name: 'Линейна скорост на въртене',
          formula: 'v = \\frac{2\\pi R\\cos\\varphi}{T}',
          lesson: A(3),
        },
        {
          name: 'Синодичен месец',
          formula: '\\frac{1}{S} = \\frac{1}{T_\\star} - \\frac{1}{T_\\oplus}',
          note: 'T★ = 27,32 дни – сидеричен месец',
          lesson: A(4),
        },
        {
          name: 'Синодичен период на планета',
          formula: '\\frac{1}{S} = \\left|\\frac{1}{T} - \\frac{1}{T_\\oplus}\\right|',
          note: 'T – сидеричен период на планетата',
        },
        {
          name: 'Слънчево денонощие на планета',
          formula: '\\frac{1}{P_\\text{слънч}} = \\frac{1}{P_\\text{сид}} \\mp \\frac{1}{T}',
          note: '− при въртене в посоката на обикаляне',
          lesson: A(13),
        },
      ],
    },
    {
      id: 'gravity',
      title: 'Гравитация и орбити',
      formulas: [
        {
          name: 'Закон за всемирното привличане',
          formula: 'F = G\\,\\frac{m_1 m_2}{r^2}',
          lesson: A(6),
        },
        {
          name: 'Ускорение на свободното падане',
          formula: 'g = \\frac{GM}{R^2} \\qquad g(h) = g_0 \\left(\\frac{R}{R + h}\\right)^2',
          lesson: A(6),
        },
        { name: 'Приливно ускорение', formula: 'a \\approx \\frac{2GMR}{d^3}', lesson: A(6) },
        {
          name: 'Трети закон на Кеплер',
          formula: 'T^2 = a^3',
          note: 'T в години, a в AU, около Слънцето',
          lesson: A(7),
        },
        {
          name: 'Трети закон във формата на Нютон',
          formula: 'T^2 = \\frac{4\\pi^2 a^3}{G(M + m)}',
          lesson: A(7),
        },
        { name: 'Маса от орбита', formula: 'M = \\frac{4\\pi^2 a^3}{G T^2}', lesson: A(6) },
        {
          name: 'Перихелий и афелий',
          formula: 'r_p = a(1 - e) \\qquad r_a = a(1 + e)',
          lesson: A(7),
        },
        { name: 'Малка полуос', formula: 'b = a\\sqrt{1 - e^2}', lesson: A(7) },
        {
          name: 'Кръгова (първа космическа) скорост',
          formula: 'v_1 = \\sqrt{\\frac{GM}{r}}',
          note: 'за Земята 7,9 km/s',
          lesson: A(8),
        },
        {
          name: 'Скорост за бягство (втора космическа)',
          formula: 'v_2 = \\sqrt{\\frac{2GM}{r}} = \\sqrt{2}\\, v_1',
          note: 'за Земята 11,2 km/s',
          lesson: A(8),
        },
        {
          name: 'Уравнение vis-viva',
          formula: 'v^2 = GM\\left(\\frac{2}{r} - \\frac{1}{a}\\right)',
          lesson: A(8),
        },
        {
          name: 'Скорост около Слънцето',
          formula: 'v = 29{,}78\\ \\tfrac{\\text{km}}{\\text{s}} \\cdot \\sqrt{\\frac{2}{r} - \\frac{1}{a}}',
          note: 'r и a в AU',
          lesson: A(16),
        },
        {
          name: 'Център на масите',
          formula: 'd_1 = \\frac{a\\, m_2}{m_1 + m_2} \\qquad m_1 a_1 = m_2 a_2',
          lesson: A(15),
        },
        {
          name: 'Граница на Рош',
          formula: 'd_R \\approx 2{,}44\\, R \\left(\\frac{\\rho_\\text{пл}}{\\rho_\\text{сп}}\\right)^{1/3}',
          note: 'за твърдо тяло 1,26 вместо 2,44',
          lesson: A(14),
        },
        {
          name: 'Резонанс с Юпитер',
          formula: 'a = a_J \\left(\\frac{q}{p}\\right)^{2/3}',
          note: 'a_J = 5,20 AU',
          lesson: A(17),
        },
        {
          name: 'Параметър на Тисеран',
          formula: 'T_J = \\frac{a_J}{a} + 2\\cos i\\,\\sqrt{\\frac{a}{a_J}\\,(1 - e^2)}',
          lesson: A(16),
        },
        {
          name: 'Правило на Тициус–Боде',
          formula: 'a = 0{,}4 + 0{,}3 \\cdot 2^n\\ \\text{AU}',
          note: 'емпирично правило, не закон',
          lesson: A(17),
        },
      ],
    },
    {
      id: 'light',
      title: 'Светлина, спектри и телескопи',
      formulas: [
        {
          name: 'Вълна и фотон',
          formula: 'c = \\lambda\\nu \\qquad E = h\\nu = \\frac{hc}{\\lambda}',
          lesson: A(9),
        },
        {
          name: 'Закон на Вин',
          formula: '\\lambda_\\text{max}\\, T = b',
          note: 'b = 2,898 · 10⁻³ m·K',
          lesson: A(9),
        },
        {
          name: 'Закон на Стефан–Болцман',
          formula: 'F = \\sigma T^4 \\qquad L = 4\\pi R^2 \\sigma T^4',
          lesson: A(9),
        },
        {
          name: 'Формула на Ридберг',
          formula: '\\frac{1}{\\lambda} = R\\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right)',
          note: 'Eₙ = −13,6 eV / n²',
          lesson: A(9),
        },
        {
          name: 'Доплерово отместване',
          formula: '\\frac{\\Delta\\lambda}{\\lambda} = \\frac{v}{c}',
          note: 'v ≪ c; v > 0 – отдалечаване',
          lesson: A(9),
        },
        {
          name: 'Увеличение на телескопа',
          formula: 'M = \\frac{F}{f}',
          note: 'полезно: от ~D/7 до ~2D (D в mm)',
          lesson: A(10),
        },
        {
          name: 'Гранична звездна величина',
          formula: 'm \\approx 2{,}7 + 5\\lg D',
          note: 'D в mm',
          lesson: A(10),
        },
        {
          name: 'Разделителна способност',
          formula: '\\theta = 1{,}22\\,\\frac{\\lambda}{D} \\approx \\frac{138\'\'}{D}',
          note: 'D в mm, λ = 550 nm',
          lesson: A(10),
        },
        {
          name: 'Интерферометър',
          formula: '\\theta \\approx \\frac{\\lambda}{B}',
          note: 'B – база',
          lesson: A(10),
        },
        {
          name: 'Seeing',
          formula: '\\theta \\approx \\frac{\\lambda}{r_0}',
          note: 'r₀ – параметър на Фрийд',
          lesson: A(32),
        },
        {
          name: 'Отношение сигнал/шум',
          formula: '\\frac{S}{N} \\approx \\sqrt{N_\\star}',
          note: 'когато доминират фотоните от звездата',
          lesson: A(32),
        },
      ],
    },
    {
      id: 'sun-planets',
      title: 'Слънце и планети',
      formulas: [
        {
          name: 'Светимост от слънчевата константа',
          formula: 'L = 4\\pi d^2 S',
          note: 'S = 1361 W/m², d = 1 AU',
          lesson: A(11),
        },
        {
          name: 'Маса и енергия',
          formula: 'E = \\Delta m\\, c^2',
          note: 'при 4 ¹H → ⁴He се губи ~0,7% от масата',
          lesson: A(11),
        },
        { name: 'Число на Волф', formula: 'R = k\\,(10g + f)', lesson: A(12) },
        { name: 'Средна плътност', formula: '\\rho = \\frac{3M}{4\\pi R^3}', lesson: A(13) },
        {
          name: 'Топлинна скорост на молекулите',
          formula: 'v = \\sqrt{\\frac{3kT}{m}}',
          note: 'газът се задържа, ако v₂ ≳ 6v',
          lesson: A(13),
        },
        {
          name: 'Равновесна температура',
          formula: 'T \\approx 279\\ \\text{K} \\cdot \\frac{(1 - A)^{1/4}}{\\sqrt{d}}',
          note: 'd в AU, A – албедо',
          lesson: A(13),
        },
        {
          name: 'Налягане в центъра',
          formula: 'P_\\text{ц} = \\frac{2\\pi}{3}\\, G\\rho^2 R^2',
          lesson: A(15),
        },
        {
          name: 'Диаметър на астероид',
          formula: 'D \\approx \\frac{1329\\ \\text{km}}{\\sqrt{p}} \\cdot 10^{-H/5}',
          lesson: A(17),
        },
        {
          name: 'Видими метеори в час',
          formula: 'HR = \\frac{ZHR \\cdot \\sin h}{r^{\\,6{,}5 - LM}}',
          lesson: A(16),
        },
      ],
    },
    {
      id: 'stars',
      title: 'Звезди',
      formulas: [
        {
          name: 'Формула на Погсън',
          formula: 'm_1 - m_2 = -2{,}5 \\lg\\frac{F_1}{F_2}',
          note: '5 величини = 100 пъти',
          lesson: A(18),
        },
        {
          name: 'Модул на разстоянието',
          formula: 'm - M = 5 \\lg\\frac{d}{10\\ \\text{pc}}',
          lesson: A(18),
        },
        {
          name: 'Разстояние от звездната величина',
          formula: 'd = 10^{\\frac{m - M - A}{5} + 1}\\ \\text{pc}',
          note: 'A – поглъщане',
          lesson: A(24),
        },
        {
          name: 'Светимост от абсолютната величина',
          formula: '\\frac{L}{L_\\odot} = 10^{\\,0{,}4\\,(4{,}83 - M)}',
          lesson: A(18),
        },
        { name: 'Поток', formula: 'F = \\frac{L}{4\\pi d^2}', lesson: A(18) },
        {
          name: 'Звезди спрямо Слънцето',
          formula: '\\frac{L}{L_\\odot} = \\left(\\frac{R}{R_\\odot}\\right)^2 \\left(\\frac{T}{T_\\odot}\\right)^4',
          lesson: A(18),
        },
        {
          name: 'Маса–светимост',
          formula: 'L \\approx L_\\odot \\left(\\frac{M}{M_\\odot}\\right)^{3{,}5}',
          lesson: A(18),
        },
        {
          name: 'Време на живот',
          formula: 't \\approx 10^{10}\\ \\text{г.} \\cdot \\left(\\frac{M}{M_\\odot}\\right)^{-2{,}5}',
          lesson: A(18),
        },
        {
          name: 'Температура от показателя на цвета',
          formula:
            'T \\approx 4600\\ \\text{K} \\left(\\frac{1}{0{,}92\\,(B - V) + 1{,}7} + \\frac{1}{0{,}92\\,(B - V) + 0{,}62}\\right)',
          lesson: A(18),
        },
        { name: 'Паралакс', formula: 'd\\ (\\text{pc}) = \\frac{1}{p\\ (\'\')}', lesson: A(24) },
        {
          name: 'Двойни звезди',
          formula: 'M_1 + M_2 = \\frac{a^3}{P^2}',
          note: 'a в AU, P в години, M в M☉',
          lesson: A(22),
        },
        {
          name: 'Ъглова и линейна полуос',
          formula: 'a\\ (\\text{AU}) = \\alpha\\ (\'\') \\cdot d\\ (\\text{pc}) = \\frac{\\alpha}{p}',
          lesson: A(22),
        },
        {
          name: 'Спектрални двойни',
          formula: '\\frac{M_1}{M_2} = \\frac{K_2}{K_1} \\qquad a\\sin i = \\frac{(K_1 + K_2)\\,P}{2\\pi}',
          lesson: A(22),
        },
        {
          name: 'Период на пулсиране',
          formula: 'P \\approx \\frac{Q}{\\sqrt{\\rho / \\rho_\\odot}}',
          note: 'Q ≈ 0,04 дни',
          lesson: A(23),
        },
        {
          name: 'Цефеиди: период–светимост',
          formula: 'M_V \\approx -2{,}43\\,(\\lg P - 1) - 4{,}05',
          note: 'P в дни',
          lesson: A(23),
        },
        {
          name: 'Маса на Джинс',
          formula: 'M_J \\approx \\left(\\frac{5kT}{G\\mu m_H}\\right)^{3/2} \\left(\\frac{3}{4\\pi\\rho}\\right)^{1/2}',
          lesson: A(20),
        },
        {
          name: 'Време за свободно падане',
          formula: 't_\\text{ff} = \\sqrt{\\frac{3\\pi}{32\\,G\\rho}}',
          lesson: A(20),
        },
        {
          name: 'Време на Келвин–Хелмхолц',
          formula: 't_\\text{KH} \\approx \\frac{GM^2}{RL}',
          lesson: A(20),
        },
        {
          name: 'Граница на Чандрасекар',
          formula: 'M \\approx 1{,}44\\, M_\\odot',
          lesson: A(21),
        },
        {
          name: 'Свиване на въртящо се тяло',
          formula: 'P_2 = P_1 \\left(\\frac{R_2}{R_1}\\right)^2',
          lesson: A(21),
        },
        {
          name: 'Радиус на Шварцшилд',
          formula: 'R_s = \\frac{2GM}{c^2} \\approx 2{,}95\\ \\text{km} \\cdot \\frac{M}{M_\\odot}',
          lesson: A(21),
        },
      ],
    },
    {
      id: 'galaxies',
      title: 'Галактики и космология',
      formulas: [
        {
          name: 'Маса от кривата на въртене',
          formula: 'M(r) = \\frac{v^2 r}{G}',
          lesson: A(25),
        },
        {
          name: 'Светимост на Едингтън',
          formula: 'L_\\text{Edd} \\approx 1{,}26 \\cdot 10^{31}\\ \\text{W} \\cdot \\frac{M}{M_\\odot}',
          lesson: A(25),
        },
        {
          name: 'Акреция',
          formula: 'L = \\eta\\, \\dot M c^2',
          note: 'η ≈ 0,1',
          lesson: A(25),
        },
        {
          name: 'Тип на елиптична галактика',
          formula: 'n = 10\\left(1 - \\frac{b}{a}\\right)',
          lesson: A(25),
        },
        {
          name: 'Галактична година',
          formula: 'T = \\frac{2\\pi R}{v}',
          note: '1 km/s ≈ 1,02 pc за милион години',
          lesson: A(26),
        },
        { name: 'Вириална маса', formula: 'M \\approx \\frac{5\\sigma^2 R}{G}', lesson: A(29) },
        {
          name: 'Отклонение на светлината',
          formula: '\\alpha = \\frac{4GM}{c^2 b}',
          lesson: A(29),
        },
        {
          name: 'Червено отместване',
          formula: 'z = \\frac{\\Delta\\lambda}{\\lambda} \\qquad 1 + z = \\frac{1}{a}',
          lesson: A(28),
        },
        {
          name: 'Закон на Хъбъл–Льометр',
          formula: 'v = H_0\\, d',
          note: 'H₀ ≈ 70 km/s/Mpc',
          lesson: A(28),
        },
        {
          name: 'Време на Хъбъл',
          formula: 't_H = \\frac{1}{H_0} \\approx 14\\ \\text{млрд. години}',
          lesson: A(28),
        },
        {
          name: 'Критична плътност',
          formula: '\\rho_c = \\frac{3H_0^2}{8\\pi G}',
          lesson: A(28),
        },
        {
          name: 'Температура на реликтовото излъчване',
          formula: 'T = T_0\\,(1 + z)',
          note: 'T₀ = 2,725 K',
          lesson: A(27),
        },
        {
          name: 'Разреждане при разширение',
          formula: '\\rho_\\text{вещ} \\propto a^{-3} \\qquad \\rho_\\text{изл} \\propto a^{-4} \\qquad \\rho_\\Lambda = \\text{const}',
          lesson: A(29),
        },
      ],
    },
    {
      id: 'exoplanets',
      title: 'Екзопланети и живот',
      formulas: [
        {
          name: 'Дълбочина на транзита',
          formula: '\\delta \\approx \\left(\\frac{R_p}{R_\\star}\\right)^2',
          lesson: A(30),
        },
        { name: 'Вероятност за транзит', formula: 'p \\approx \\frac{R_\\star}{a}', lesson: A(30) },
        {
          name: 'Радиална скорост на звездата',
          formula:
            'K \\approx 28{,}4\\ \\tfrac{\\text{m}}{\\text{s}} \\cdot \\frac{m\\sin i}{M_\\text{Юп}} \\left(\\frac{M_\\star}{M_\\odot}\\right)^{-2/3} \\left(\\frac{P}{1\\ \\text{г.}}\\right)^{-1/3}',
          lesson: A(30),
        },
        {
          name: 'Обитаема зона',
          formula: 'd = \\sqrt{\\frac{L}{S}}: \\quad \\text{от} \\approx 0{,}95\\sqrt{L} \\;\\text{до} \\approx 1{,}7\\sqrt{L}\\ \\text{AU}',
          note: 'L в L☉',
          lesson: A(30),
        },
        {
          name: 'Уравнение на Дрейк',
          formula: 'N = R_\\star \\cdot f_p \\cdot n_e \\cdot f_l \\cdot f_i \\cdot f_c \\cdot L',
          lesson: A(31),
        },
      ],
    },
    {
      id: 'relativity',
      title: 'Специална теория на относителността',
      formulas: [
        {
          name: 'Лоренцов фактор',
          formula: '\\gamma = \\frac{1}{\\sqrt{1 - \\dfrac{v^2}{c^2}}}',
          lesson: A(33),
        },
        { name: 'Забавяне на времето', formula: '\\Delta t = \\gamma\\, \\Delta t_0', lesson: A(33) },
        { name: 'Свиване на дължините', formula: 'L = \\frac{L_0}{\\gamma}', lesson: A(33) },
        {
          name: 'Събиране на скоростите',
          formula: 'u = \\frac{u\' + v}{1 + \\dfrac{u\'v}{c^2}}',
          lesson: A(33),
        },
        {
          name: 'Енергия',
          formula: 'E_0 = mc^2 \\qquad E = \\gamma mc^2 \\qquad E_k = (\\gamma - 1)\\,mc^2',
          lesson: A(33),
        },
        {
          name: 'Релативистки ефект на Доплер',
          formula: '\\lambda = \\lambda_0 \\sqrt{\\frac{1 + \\beta}{1 - \\beta}}',
          note: 'β = v/c',
          lesson: A(33),
        },
      ],
    },
  ],
};

export type Constant = {
  name: string;
  symbol: string;
  value: string;
  note?: string;
};

export const CONSTANTS: { title: string; items: Constant[] }[] = [
  {
    title: 'Физични константи',
    items: [
      {
        name: 'Скорост на светлината',
        symbol: 'c',
        value: '2,998 · 10⁸ m/s',
        note: 'точно 299 792 458 m/s',
      },
      {
        name: 'Гравитационна константа',
        symbol: 'G',
        value: '6,674 · 10⁻¹¹ N·m²/kg²',
      },
      { name: 'Константа на Планк', symbol: 'h', value: '6,626 · 10⁻³⁴ J·s' },
      { name: 'Константа на Болцман', symbol: 'k', value: '1,381 · 10⁻²³ J/K' },
      {
        name: 'Константа на Стефан–Болцман',
        symbol: 'σ',
        value: '5,670 · 10⁻⁸ W/(m²·K⁴)',
      },
      { name: 'Константа на Вин', symbol: 'b', value: '2,898 · 10⁻³ m·K' },
      { name: 'Константа на Ридберг', symbol: 'R', value: '1,097 · 10⁷ m⁻¹' },
      { name: 'Маса на протона', symbol: 'mₚ', value: '1,673 · 10⁻²⁷ kg' },
      { name: 'Маса на електрона', symbol: 'mₑ', value: '9,109 · 10⁻³¹ kg' },
      {
        name: 'Елементарен заряд',
        symbol: 'e',
        value: '1,602 · 10⁻¹⁹ C',
        note: '1 eV = 1,602 · 10⁻¹⁹ J',
      },
    ],
  },
  {
    title: 'Разстояния и ъгли',
    items: [
      {
        name: 'Астрономическа единица',
        symbol: 'AU',
        value: '1,496 · 10¹¹ m',
        note: '149,6 млн. km',
      },
      {
        name: 'Парсек',
        symbol: 'pc',
        value: '3,086 · 10¹⁶ m',
        note: '= 206 265 AU = 3,26 ly',
      },
      {
        name: 'Светлинна година',
        symbol: 'ly',
        value: '9,461 · 10¹⁵ m',
        note: '≈ 63 240 AU',
      },
      { name: 'Радиан', symbol: 'rad', value: '57,30° = 206 265″' },
    ],
  },
  {
    title: 'Слънцето',
    items: [
      { name: 'Маса', symbol: 'M☉', value: '1,989 · 10³⁰ kg' },
      {
        name: 'Радиус',
        symbol: 'R☉',
        value: '6,96 · 10⁸ m',
        note: '696 000 km',
      },
      { name: 'Светимост', symbol: 'L☉', value: '3,83 · 10²⁶ W' },
      { name: 'Ефективна температура', symbol: 'T☉', value: '5772 K' },
      { name: 'Абсолютна звездна величина', symbol: 'M_V', value: '4,83' },
      { name: 'Видима звездна величина', symbol: 'm_V', value: '−26,74' },
      { name: 'Слънчева константа', symbol: 'S', value: '1361 W/m²' },
    ],
  },
  {
    title: 'Земята и Луната',
    items: [
      { name: 'Маса на Земята', symbol: 'M⊕', value: '5,972 · 10²⁴ kg' },
      {
        name: 'Екваториален радиус на Земята',
        symbol: 'R⊕',
        value: '6378 km',
        note: 'среден 6371 km',
      },
      {
        name: 'Ускорение на свободното падане',
        symbol: 'g',
        value: '9,81 m/s²',
      },
      { name: 'Наклон на земната ос', symbol: 'ε', value: '23,44°' },
      { name: 'Звездно денонощие', symbol: 'T★', value: '23h 56m 04s' },
      { name: 'Тропическа година', symbol: '', value: '365,2422 дни' },
      { name: 'Звездна (сидерична) година', symbol: '', value: '365,2564 дни' },
      {
        name: 'Орбитална скорост на Земята',
        symbol: 'v⊕',
        value: '29,78 km/s',
      },
      {
        name: 'Маса на Луната',
        symbol: 'M☾',
        value: '7,342 · 10²² kg',
        note: '≈ M⊕ / 81,3',
      },
      { name: 'Радиус на Луната', symbol: 'R☾', value: '1737 km' },
      {
        name: 'Средно разстояние до Луната',
        symbol: 'a☾',
        value: '384 400 km',
      },
      { name: 'Сидеричен месец', symbol: '', value: '27,32 дни' },
      { name: 'Синодичен месец', symbol: '', value: '29,53 дни' },
    ],
  },
  {
    title: 'Планети и Вселената',
    items: [
      {
        name: 'Маса на Юпитер',
        symbol: 'M_Юп',
        value: '1,898 · 10²⁷ kg',
        note: '= 318 M⊕ ≈ M☉ / 1047',
      },
      {
        name: 'Екваториален радиус на Юпитер',
        symbol: 'R_Юп',
        value: '71 492 km',
      },
      { name: 'Голяма полуос на Юпитер', symbol: 'a_J', value: '5,20 AU' },
      { name: 'Константа на Хъбъл', symbol: 'H₀', value: '≈ 70 km/s/Mpc' },
      {
        name: 'Температура на реликтовото излъчване',
        symbol: 'T₀',
        value: '2,725 K',
      },
      {
        name: 'Възраст на Вселената',
        symbol: '',
        value: '≈ 13,8 млрд. години',
      },
    ],
  },
];
