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
      id: 'matrices',
      title: 'Матрици',
      formulas: [
        {
          name: 'Умножение на матрици',
          formula: 'c_{ij} = a_{i1}b_{1j} + a_{i2}b_{2j} + \\ldots + a_{in}b_{nj}',
          note: 'ред i на A по стълб j на B; (m × n)(n × p) = m × p; в общия случай AB ≠ BA',
          lesson: '/algebra/matrices',
        },
        {
          name: 'Матрица по вектор',
          formula: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}\\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} ax + by \\\\ cx + dy \\end{pmatrix}',
          note: 'стълбовете са образите на e₁ = (1; 0) и e₂ = (0; 1)',
          lesson: '/algebra/matrices',
        },
        {
          name: 'Матрица на завъртане',
          formula: 'R_\\varphi = \\begin{pmatrix} \\cos\\varphi & -\\sin\\varphi \\\\ \\sin\\varphi & \\cos\\varphi \\end{pmatrix}',
          note: 'завъртане на ъгъл φ обратно на часовниковата стрелка около началото',
          lesson: '/algebra/matrices',
        },
        {
          name: 'Детерминанта 2 × 2',
          formula: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc \\qquad \\det(AB) = \\det A \\cdot \\det B',
          note: '|det A| – колко пъти се умножават лицата; знакът показва ориентацията',
          lesson: '/algebra/matrices',
        },
        {
          name: 'Детерминанта 3 × 3 (правило на Сарус)',
          formula: 'a_{11}a_{22}a_{33} + a_{12}a_{23}a_{31} + a_{13}a_{21}a_{32} - a_{13}a_{22}a_{31} - a_{11}a_{23}a_{32} - a_{12}a_{21}a_{33}',
          lesson: '/algebra/matrices',
        },
        {
          name: 'Обратна матрица 2 × 2',
          formula: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}^{-1} = \\frac{1}{ad - bc}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix} \\qquad (AB)^{-1} = B^{-1}A^{-1}',
          note: 'съществува точно когато ad − bc ≠ 0',
          lesson: '/algebra/matrices',
        },
        {
          name: 'Система в матричен вид',
          formula: 'AX = B \\quad\\Rightarrow\\quad X = A^{-1}B',
          note: 'при det A ≠ 0; разписано, това е правилото на Крамер',
          lesson: '/algebra/matrices',
        },
      ],
    },
    {
      id: 'olympiad-inequalities',
      title: 'Олимпиадни неравенства',
      formulas: [
        {
          name: 'Неравенство между средните',
          formula: '\\sqrt{\\frac{a^2 + b^2}{2}} \\ge \\frac{a + b}{2} \\ge \\sqrt{ab} \\ge \\frac{2ab}{a + b}',
          note: 'a, b > 0; навсякъде равенство само при a = b',
          lesson: '/algebra/olympiad-inequalities',
        },
        {
          name: 'Средно аритметично и средно геометрично на n числа',
          formula: '\\frac{a_1 + a_2 + \\ldots + a_n}{n} \\ge \\sqrt[n]{a_1 a_2 \\cdots a_n}',
          note: 'aᵢ ≥ 0; равенство при a₁ = a₂ = … = aₙ',
          lesson: '/algebra/olympiad-inequalities',
        },
        {
          name: 'Неравенство на Коши–Буняковски',
          formula: '(a_1b_1 + \\ldots + a_nb_n)^2 \\le (a_1^2 + \\ldots + a_n^2)(b_1^2 + \\ldots + b_n^2)',
          note: 'равенство при пропорционални числа; за вектори |u · v| ≤ |u| · |v|',
          lesson: '/algebra/olympiad-inequalities',
        },
        {
          name: 'Форма на Енгел (лема на Титу)',
          formula: '\\frac{a_1^2}{x_1} + \\ldots + \\frac{a_n^2}{x_n} \\ge \\frac{(a_1 + \\ldots + a_n)^2}{x_1 + \\ldots + x_n}',
          note: 'xᵢ > 0; равенство при a₁/x₁ = … = aₙ/xₙ',
          lesson: '/algebra/olympiad-inequalities',
        },
        {
          name: 'Неравенство за пренареждането',
          formula: 'a_1b_1 + \\ldots + a_nb_n \\ge a_1c_1 + \\ldots + a_nc_n \\ge a_1b_n + \\ldots + a_nb_1',
          note: 'a и b са подредени еднакво, c е пренареждане на b',
          lesson: '/algebra/olympiad-inequalities',
        },
        {
          name: 'Неравенство на Чебишов',
          formula: 'n(a_1b_1 + \\ldots + a_nb_n) \\ge (a_1 + \\ldots + a_n)(b_1 + \\ldots + b_n)',
          note: 'при еднакво подредени редици',
          lesson: '/algebra/olympiad-inequalities',
        },
        {
          name: 'Неравенство на Йенсен',
          formula: 'f(w_1x_1 + \\ldots + w_nx_n) \\le w_1f(x_1) + \\ldots + w_nf(x_n)',
          note: 'f изпъкнала, wᵢ ≥ 0, w₁ + … + wₙ = 1; за вдлъбната f – обратно',
          lesson: '/algebra/olympiad-inequalities',
        },
        {
          name: 'Неравенство на Несбит',
          formula: '\\frac{a}{b + c} + \\frac{b}{c + a} + \\frac{c}{a + b} \\ge \\frac{3}{2}',
          note: 'a, b, c > 0; равенство при a = b = c',
          lesson: '/algebra/olympiad-inequalities',
        },
      ],
    },
    {
      id: 'complex',
      title: 'Комплексни числа',
      formulas: [
        {
          name: 'Имагинерна единица',
          formula: 'i^2 = -1 \\qquad z = a + bi',
          note: 'a – реална част, b – имагинерна част',
          lesson: '/algebra/complex',
        },
        {
          name: 'Умножение',
          formula: '(a + bi)(c + di) = (ac - bd) + (ad + bc)i',
          lesson: '/algebra/complex',
        },
        {
          name: 'Спрегнато число и деление',
          formula: '\\bar{z} = a - bi \\qquad \\frac{a + bi}{c + di} = \\frac{(a + bi)(c - di)}{c^2 + d^2}',
          lesson: '/algebra/complex',
        },
        {
          name: 'Модул',
          formula: '|z| = \\sqrt{a^2 + b^2} \\qquad z\\bar{z} = |z|^2',
          lesson: '/algebra/complex',
        },
        {
          name: 'Тригонометричен вид и формула на Моавър',
          formula: 'z = r(\\cos \\varphi + i\\sin \\varphi) \\qquad z^n = r^n(\\cos n\\varphi + i\\sin n\\varphi)',
          lesson: '/algebra/complex',
        },
        {
          name: 'Корени от единицата',
          formula: 'z^n = 1 \\Rightarrow \\varepsilon_k = \\cos \\frac{2\\pi k}{n} + i\\sin \\frac{2\\pi k}{n}',
          note: 'k = 0, 1, …, n − 1',
          lesson: '/algebra/complex',
        },
      ],
    },
    {
      id: 'number-theory',
      title: 'Теория на числата',
      formulas: [
        {
          name: 'Числови множества',
          formula: '\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}',
          note: 'естествени, цели, рационални, реални',
          lesson: '/numbers/number-sets',
        },
        {
          name: 'Чиста периодична дроб',
          formula: '0{,}(a_1 a_2 \\ldots a_k) = \\frac{\\overline{a_1 a_2 \\ldots a_k}}{\\underbrace{99\\ldots9}_{k}}',
          note: 'например 0,(27) = 27/99 = 3/11',
          lesson: '/numbers/number-sets',
        },
        {
          name: 'Деление с остатък',
          formula: 'a = bq + r, \\quad 0 \\le r < b',
          lesson: '/numbers/divisibility',
        },
        {
          name: 'Каноничен вид',
          formula: 'n = p_1^{a_1} \\cdot p_2^{a_2} \\cdots p_k^{a_k}',
          note: 'p₁, …, pₖ – различни прости числа',
          lesson: '/numbers/divisibility',
        },
        {
          name: 'Брой делители',
          formula: '(a_1 + 1)(a_2 + 1) \\cdots (a_k + 1)',
          lesson: '/numbers/divisibility',
        },
        {
          name: 'НОД и НОК',
          formula: '\\text{НОД}(a,\\ b) \\cdot \\text{НОК}(a,\\ b) = a \\cdot b',
          lesson: '/numbers/gcd',
        },
        {
          name: 'Алгоритъм на Евклид',
          formula: 'a = bq + r \\Rightarrow \\text{НОД}(a,\\ b) = \\text{НОД}(b,\\ r)',
          lesson: '/numbers/gcd',
        },
        {
          name: 'Линейно диофантово уравнение',
          formula: 'ax + by = c: \\quad x = x_0 + \\frac{b}{d}t, \\quad y = y_0 - \\frac{a}{d}t',
          note: 'd = НОД(a, b); решения има точно когато d дели c',
          lesson: '/numbers/gcd',
        },
        {
          name: 'Сравнение по модул',
          formula: 'a \\equiv b \\pmod{m} \\iff m \\mid a - b',
          lesson: '/numbers/modular',
        },
        {
          name: 'Малка теорема на Ферма',
          formula: 'a^{p-1} \\equiv 1 \\pmod{p}',
          note: 'p – просто, p не дели a',
          lesson: '/numbers/modular',
        },
        {
          name: 'Нули в края на n!',
          formula: '\\left[\\frac{n}{5}\\right] + \\left[\\frac{n}{25}\\right] + \\left[\\frac{n}{125}\\right] + \\ldots',
          lesson: '/numbers/divisibility',
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
      id: 'analysis',
      title: 'Анализ',
      formulas: [
        {
          name: 'Граница на редица',
          formula: '\\lim_{n \\to \\infty} a_n = L \\iff \\forall \\varepsilon > 0\\ \\exists N:\\ |a_n - L| < \\varepsilon \\text{ при } n \\ge N',
          lesson: '/analysis/limits',
        },
        {
          name: 'Аритметика на границите',
          formula: '\\lim_{x \\to a} (f \\pm g) = A \\pm B \\qquad \\lim_{x \\to a} (f \\cdot g) = A \\cdot B \\qquad \\lim_{x \\to a} \\frac{f}{g} = \\frac{A}{B}\\ (B \\ne 0)',
          note: 'ако lim f = A и lim g = B са крайни числа',
          lesson: '/analysis/limits',
        },
        {
          name: 'Рационална функция при x → ∞',
          formula: '\\lim_{x \\to \\infty} \\frac{a_k x^k + \\ldots}{b_k x^k + \\ldots} = \\frac{a_k}{b_k}',
          note: 'при равни степени; ако степента на знаменателя е по-голяма – границата е 0',
          lesson: '/analysis/limits',
        },
        {
          name: 'Първа забележителна граница',
          formula: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1',
          note: 'x в радиани',
          lesson: '/analysis/limits',
        },
        {
          name: 'Втора забележителна граница',
          formula: '\\lim_{n \\to \\infty} \\left(1 + \\frac{1}{n}\\right)^n = e \\approx 2{,}71828 \\qquad \\lim_{n \\to \\infty} \\left(1 + \\frac{k}{n}\\right)^n = e^k',
          lesson: '/analysis/limits',
        },
        {
          name: 'Наклонена асимптота',
          formula: 'y = kx + n:\\quad k = \\lim_{x \\to \\infty} \\frac{f(x)}{x},\\quad n = \\lim_{x \\to \\infty} \\left(f(x) - kx\\right)',
          note: 'за рационална функция – цялата част при деление на многочлените',
          lesson: '/analysis/limits',
        },
        {
          name: 'Непрекъснатост в точка',
          formula: '\\lim_{x \\to a} f(x) = f(a)',
          lesson: '/analysis/limits',
        },
        {
          name: 'Теорема на Болцано',
          formula: 'f(a) \\cdot f(b) < 0 \\Rightarrow \\exists c \\in (a;\\ b):\\ f(c) = 0',
          note: 'f непрекъсната в [a; b]; разполовяване: след n стъпки интервалът е (b − a)/2ⁿ',
          lesson: '/analysis/limits',
        },
        {
          name: 'Производна',
          formula: "f'(x_0) = \\lim_{h \\to 0} \\frac{f(x_0 + h) - f(x_0)}{h}",
          lesson: '/analysis/derivatives',
        },
        {
          name: 'Допирателна',
          formula: "y = f(x_0) + f'(x_0)(x - x_0)",
          lesson: '/analysis/derivatives',
        },
        {
          name: 'Основни производни',
          formula: "(x^n)' = nx^{n-1} \\qquad (\\sin x)' = \\cos x \\qquad (\\cos x)' = -\\sin x",
          lesson: '/analysis/derivatives',
        },
        {
          name: 'Показателна и логаритмична функция',
          formula: "(e^x)' = e^x \\qquad (a^x)' = a^x \\ln a \\qquad (\\ln x)' = \\frac{1}{x}",
          lesson: '/analysis/derivatives',
        },
        {
          name: 'Произведение и частно',
          formula: "(uv)' = u'v + uv' \\qquad \\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}",
          lesson: '/analysis/derivatives',
        },
        {
          name: 'Верижно правило',
          formula: "(f(g(x)))' = f'(g(x)) \\cdot g'(x)",
          lesson: '/analysis/derivatives',
        },
        {
          name: 'Основни интеграли',
          formula: '\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C \\qquad \\int \\frac{1}{x}\\,dx = \\ln |x| + C',
          note: 'n ≠ −1',
          lesson: '/analysis/integrals',
        },
        {
          name: 'Интеграли на eˣ, синус и косинус',
          formula: '\\int e^x\\,dx = e^x + C \\qquad \\int \\sin x\\,dx = -\\cos x + C \\qquad \\int \\cos x\\,dx = \\sin x + C',
          lesson: '/analysis/integrals',
        },
        {
          name: 'Формула на Нютон–Лайбниц',
          formula: "\\int_a^b f(x)\\,dx = F(b) - F(a), \\quad F' = f",
          lesson: '/analysis/integrals',
        },
        {
          name: 'Лице между криви',
          formula: '\\int_a^b \\left(f(x) - g(x)\\right) dx',
          note: 'f(x) ≥ g(x) в [a; b]',
          lesson: '/analysis/integrals',
        },
        {
          name: 'Обем на ротационно тяло',
          formula: 'V = \\pi \\int_a^b f(x)^2\\,dx',
          lesson: '/analysis/integrals',
        },
        {
          name: 'Експоненциален растеж и разпад',
          formula: "y' = ky \\Rightarrow y = y_0 e^{kt} \\qquad T_{1/2} = \\frac{\\ln 2}{|k|}",
          lesson: '/analysis/differential-equations',
        },
        {
          name: 'Закон на Нютон за изстиването',
          formula: 'T(t) = T_s + (T_0 - T_s)e^{-kt}',
          note: 'Tₛ – температура на околната среда',
          lesson: '/analysis/differential-equations',
        },
        {
          name: 'Хармонично трептене',
          formula: "x'' = -\\omega^2 x \\Rightarrow x = A\\cos(\\omega t + \\varphi), \\quad T = \\frac{2\\pi}{\\omega}",
          lesson: '/analysis/differential-equations',
        },
        {
          name: 'Метод на Ойлер',
          formula: 'y_{n+1} = y_n + h \\cdot f(x_n, y_n)',
          lesson: '/analysis/differential-equations',
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

export const PHYSICS: Section = {
  id: 'physics',
  title: 'Физика',
  groups: [
    {
      id: 'measurement',
      title: 'Величини, единици и грешки',
      formulas: [
        {
          name: 'Научен запис',
          formula: 'x = a \\cdot 10^n, \\quad 1 \\le a < 10',
          lesson: '/physics/mechanics/units',
        },
        {
          name: 'Скорост: km/h и m/s',
          formula: '1\\ \\mathrm{m/s} = 3{,}6\\ \\mathrm{km/h}',
          lesson: '/physics/mechanics/units',
        },
        {
          name: 'Производни единици',
          formula: '1\\ \\mathrm{N} = 1\\ \\mathrm{kg \\cdot m/s^2} \\qquad 1\\ \\mathrm{J} = 1\\ \\mathrm{N \\cdot m} \\qquad 1\\ \\mathrm{W} = 1\\ \\mathrm{J/s}',
          lesson: '/physics/mechanics/units',
        },
        {
          name: 'Относителна грешка',
          formula: '\\varepsilon = \\frac{\\Delta x}{x}',
          lesson: '/physics/mechanics/units',
        },
        {
          name: 'Грешка на сбор и разлика',
          formula: '\\Delta(a \\pm b) = \\Delta a + \\Delta b',
          lesson: '/physics/mechanics/units',
        },
        {
          name: 'Грешка на произведение, частно и степен',
          formula: '\\varepsilon_{ab} = \\varepsilon_{a/b} = \\varepsilon_a + \\varepsilon_b \\qquad \\varepsilon_{a^n} = |n|\\,\\varepsilon_a',
          lesson: '/physics/mechanics/units',
        },
        {
          name: 'Период на махало (от размерностите)',
          formula: 'T = 2\\pi\\sqrt{\\frac{l}{g}}',
          note: 'анализът дава √(l/g), константата 2π – пълното решение',
          lesson: '/physics/mechanics/units',
        },
      ],
    },
    {
      id: 'kinematics',
      title: 'Праволинейно движение',
      formulas: [
        {
          name: 'Средна скорост',
          formula: 'v_{\\text{ср}} = \\frac{s}{t}',
          note: 'целият път през цялото време',
          lesson: '/physics/mechanics/linear-motion',
        },
        {
          name: 'Равномерно движение',
          formula: 'x = x_0 + vt',
          lesson: '/physics/mechanics/linear-motion',
        },
        {
          name: 'Ускорение',
          formula: 'a = \\frac{\\Delta v}{\\Delta t}',
          lesson: '/physics/mechanics/linear-motion',
        },
        {
          name: 'Равноускорително движение',
          formula: 'v = v_0 + at \\qquad x = x_0 + v_0 t + \\frac{at^2}{2}',
          lesson: '/physics/mechanics/linear-motion',
        },
        {
          name: 'Формула без времето',
          formula: 'v^2 - v_0^2 = 2a(x - x_0)',
          lesson: '/physics/mechanics/linear-motion',
        },
        {
          name: 'Спирачен път',
          formula: 's = vt_r + \\frac{v^2}{2a}',
          note: 't_r – време за реакция',
          lesson: '/physics/mechanics/linear-motion',
        },
        {
          name: 'Свободно падане',
          formula: 'h = \\frac{gt^2}{2} \\qquad v = gt \\qquad h_{\\max} = \\frac{v_0^2}{2g}',
          note: 'g ≈ 9,81 m/s²',
          lesson: '/physics/mechanics/linear-motion',
        },
      ],
    },
    {
      id: 'plane-motion',
      title: 'Движение в равнина',
      formulas: [
        {
          name: 'Компоненти на скоростта',
          formula: 'v_x = v\\cos\\alpha \\qquad v_y = v\\sin\\alpha \\qquad v = \\sqrt{v_x^2 + v_y^2}',
          lesson: '/physics/mechanics/plane-motion',
        },
        {
          name: 'Хоризонтално хвърляне',
          formula: 't = \\sqrt{\\frac{2h}{g}} \\qquad L = v_0\\sqrt{\\frac{2h}{g}}',
          lesson: '/physics/mechanics/plane-motion',
        },
        {
          name: 'Хвърляне под ъгъл: време на полета',
          formula: 'T = \\frac{2v_0\\sin\\alpha}{g}',
          lesson: '/physics/mechanics/plane-motion',
        },
        {
          name: 'Максимална височина',
          formula: 'H = \\frac{v_0^2\\sin^2\\alpha}{2g}',
          lesson: '/physics/mechanics/plane-motion',
        },
        {
          name: 'Обхват',
          formula: 'R = \\frac{v_0^2\\sin 2\\alpha}{g} \\qquad R_{\\max} = \\frac{v_0^2}{g}',
          note: 'най-далеч при α = 45°; α и 90° − α дават еднакъв обхват',
          lesson: '/physics/mechanics/plane-motion',
        },
        {
          name: 'Събиране на скоростите',
          formula: '\\vec{v} = \\vec{u} + \\vec{w}',
          note: 'скорост спрямо земята = спрямо подвижната система + на системата',
          lesson: '/physics/mechanics/plane-motion',
        },
      ],
    },
    {
      id: 'newton',
      title: 'Закони на Нютон',
      formulas: [
        {
          name: 'Втори закон на Нютон',
          formula: '\\vec{F} = m\\vec{a}',
          note: '1 N = 1 kg·m/s²',
          lesson: '/physics/mechanics/newton',
        },
        {
          name: 'Трети закон на Нютон',
          formula: '\\vec{F}_{AB} = -\\vec{F}_{BA}',
          note: 'силите действат на различни тела',
          lesson: '/physics/mechanics/newton',
        },
        {
          name: 'Закон на Хук',
          formula: 'F = kx',
          lesson: '/physics/mechanics/newton',
        },
        {
          name: 'Сила на триене',
          formula: 'F_{\\text{тр}} = \\mu N \\qquad F_{\\text{покой}} \\le \\mu_s N',
          lesson: '/physics/mechanics/newton',
        },
        {
          name: 'Наклонена равнина',
          formula: 'N = mg\\cos\\alpha \\qquad a = g(\\sin\\alpha - \\mu\\cos\\alpha)',
          note: 'плъзга се при tg α > μ',
          lesson: '/physics/mechanics/newton',
        },
        {
          name: 'Машина на Атууд',
          formula: 'a = \\frac{(m_1 - m_2)g}{m_1 + m_2} \\qquad T = \\frac{2m_1 m_2 g}{m_1 + m_2}',
          lesson: '/physics/mechanics/newton',
        },
        {
          name: 'Тегло при ускорение',
          formula: 'N = m(g + a)',
          note: 'a > 0 нагоре; при свободно падане N = 0',
          lesson: '/physics/mechanics/newton',
        },
      ],
    },
    {
      id: 'energy',
      title: 'Работа, енергия, мощност',
      formulas: [
        {
          name: 'Механична работа',
          formula: 'W = Fs\\cos\\alpha',
          note: 'α – ъгълът между силата и преместването',
          lesson: '/physics/mechanics/energy',
        },
        {
          name: 'Кинетична енергия',
          formula: 'E_k = \\frac{mv^2}{2} \\qquad W = E_{k2} - E_{k1}',
          lesson: '/physics/mechanics/energy',
        },
        {
          name: 'Потенциална енергия',
          formula: 'E_p = mgh \\qquad E_p = \\frac{kx^2}{2}',
          note: 'тежест и пружина',
          lesson: '/physics/mechanics/energy',
        },
        {
          name: 'Запазване на механичната енергия',
          formula: 'E_k + E_p = \\text{const} \\qquad v = \\sqrt{2gh}',
          note: 'без триене',
          lesson: '/physics/mechanics/energy',
        },
        {
          name: 'Топлина от триене',
          formula: 'Q = F_{\\text{тр}} \\cdot s',
          lesson: '/physics/mechanics/energy',
        },
        {
          name: 'Мощност',
          formula: 'P = \\frac{W}{t} = Fv',
          note: '1 kWh = 3,6 MJ; 1 к.с. ≈ 735,5 W',
          lesson: '/physics/mechanics/energy',
        },
        {
          name: 'Коефициент на полезно действие',
          formula: '\\eta = \\frac{P_{\\text{пол}}}{P_{\\text{изр}}}',
          lesson: '/physics/mechanics/energy',
        },
      ],
    },
    {
      id: 'momentum',
      title: 'Импулс и удари',
      formulas: [
        {
          name: 'Импулс',
          formula: '\\vec{p} = m\\vec{v}',
          lesson: '/physics/mechanics/momentum',
        },
        {
          name: 'Импулс на силата',
          formula: '\\vec{F}\\Delta t = \\Delta\\vec{p}',
          note: 'Δp е лицето под графиката F(t)',
          lesson: '/physics/mechanics/momentum',
        },
        {
          name: 'Закон за запазване на импулса',
          formula: "m_1\\vec{v}_1 + m_2\\vec{v}_2 = m_1\\vec{v}_1' + m_2\\vec{v}_2'",
          note: 'за затворена система',
          lesson: '/physics/mechanics/momentum',
        },
        {
          name: 'Напълно нееластичен удар',
          formula: 'v = \\frac{m_1 v_1 + m_2 v_2}{m_1 + m_2}',
          lesson: '/physics/mechanics/momentum',
        },
        {
          name: 'Еластичен централен удар',
          formula: "v_1' = \\frac{(m_1 - m_2)v_1 + 2m_2 v_2}{m_1 + m_2} \\qquad v_2' = \\frac{(m_2 - m_1)v_2 + 2m_1 v_1}{m_1 + m_2}",
          lesson: '/physics/mechanics/momentum',
        },
        {
          name: 'Коефициент на възстановяване',
          formula: "e = \\frac{v_2' - v_1'}{v_1 - v_2}",
          note: 'e = 1 – еластичен, e = 0 – напълно нееластичен',
          lesson: '/physics/mechanics/momentum',
        },
        {
          name: 'Формула на Циолковски',
          formula: '\\Delta v = u \\ln \\frac{m_0}{m_1}',
          note: 'u – скорост на газовете спрямо ракетата',
          lesson: '/physics/mechanics/momentum',
        },
      ],
    },
    {
      id: 'rotation',
      title: 'Въртене',
      formulas: [
        {
          name: 'Ъглова и линейна скорост',
          formula: '\\omega = \\frac{2\\pi}{T} = 2\\pi\\nu \\qquad v = \\omega r',
          lesson: '/physics/mechanics/rotation',
        },
        {
          name: 'Центростремително ускорение и сила',
          formula: 'a = \\frac{v^2}{r} = \\omega^2 r \\qquad F = \\frac{mv^2}{r}',
          note: 'F е резултантната на истинските сили, насочена към центъра',
          lesson: '/physics/mechanics/rotation',
        },
        {
          name: 'Най-малка скорост в горната точка на лупинг',
          formula: 'v = \\sqrt{gr}',
          lesson: '/physics/mechanics/rotation',
        },
        {
          name: 'Момент на сила и основен закон за въртенето',
          formula: 'M = Fd \\qquad M = I\\alpha',
          note: 'd – рамо (перпендикуляр от оста до линията на силата)',
          lesson: '/physics/mechanics/rotation',
        },
        {
          name: 'Инерчни моменти',
          formula: 'I_{\\text{обръч}} = mR^2 \\qquad I_{\\text{диск}} = \\frac{1}{2}mR^2 \\qquad I_{\\text{кълбо}} = \\frac{2}{5}mR^2',
          lesson: '/physics/mechanics/rotation',
        },
        {
          name: 'Кинетична енергия при въртене и търкаляне',
          formula: 'E = \\frac{I\\omega^2}{2} \\qquad E = \\frac{mv^2}{2} + \\frac{I\\omega^2}{2}',
          lesson: '/physics/mechanics/rotation',
        },
        {
          name: 'Скорост при търкаляне от височина h',
          formula: 'v = \\sqrt{\\frac{2gh}{1 + k}}, \\quad I = kmR^2',
          lesson: '/physics/mechanics/rotation',
        },
        {
          name: 'Момент на импулса',
          formula: 'L = I\\omega \\qquad I_1\\omega_1 = I_2\\omega_2',
          note: 'запазва се без външен момент на сила',
          lesson: '/physics/mechanics/rotation',
        },
      ],
    },
    {
      id: 'statics-fluids',
      title: 'Статика и флуиди',
      formulas: [
        {
          name: 'Момент на сила',
          formula: 'M = F \\cdot d',
          note: 'd – рамо, перпендикулярно на линията на силата',
          lesson: '/physics/mechanics/statics-fluids',
        },
        {
          name: 'Условия за равновесие',
          formula: '\\sum \\vec{F} = 0 \\qquad \\sum M = 0',
          lesson: '/physics/mechanics/statics-fluids',
        },
        {
          name: 'Правило на лоста',
          formula: 'F_1 d_1 = F_2 d_2',
          lesson: '/physics/mechanics/statics-fluids',
        },
        {
          name: 'Налягане',
          formula: 'p = \\frac{F}{S} \\qquad p = p_0 + \\rho g h',
          note: 'p₀ ≈ 101 kPa',
          lesson: '/physics/mechanics/statics-fluids',
        },
        {
          name: 'Хидравлична преса',
          formula: '\\frac{F_2}{F_1} = \\frac{S_2}{S_1} \\qquad S_1 s_1 = S_2 s_2',
          lesson: '/physics/mechanics/statics-fluids',
        },
        {
          name: 'Архимедова сила',
          formula: 'F_A = \\rho_{\\text{фл}}\\, g\\, V_{\\text{пот}}',
          lesson: '/physics/mechanics/statics-fluids',
        },
        {
          name: 'Плаване',
          formula: '\\frac{V_{\\text{пот}}}{V} = \\frac{\\rho_{\\text{т}}}{\\rho_{\\text{фл}}}',
          lesson: '/physics/mechanics/statics-fluids',
        },
        {
          name: 'Непрекъснатост и Бернули',
          formula: 'S_1 v_1 = S_2 v_2 \\qquad p + \\frac{\\rho v^2}{2} + \\rho g h = \\text{const}',
          lesson: '/physics/mechanics/statics-fluids',
        },
      ],
    },
    {
      id: 'oscillations',
      title: 'Трептения',
      formulas: [
        {
          name: 'Период, честота и ъглова честота',
          formula: 'f = \\frac{1}{T} \\qquad \\omega = \\frac{2\\pi}{T} = 2\\pi f',
          lesson: '/physics/waves/oscillations',
        },
        {
          name: 'Хармонично трептене',
          formula: 'x = A\\cos(\\omega t + \\varphi) \\qquad a = -\\omega^2 x',
          lesson: '/physics/waves/oscillations',
        },
        {
          name: 'Най-голяма скорост и ускорение',
          formula: 'v_{\\max} = A\\omega \\qquad a_{\\max} = A\\omega^2',
          note: 'скоростта – в равновесието, ускорението – в крайните положения',
          lesson: '/physics/waves/oscillations',
        },
        {
          name: 'Пружинно махало',
          formula: 'T = 2\\pi\\sqrt{\\frac{m}{k}}',
          lesson: '/physics/waves/oscillations',
        },
        {
          name: 'Математическо махало',
          formula: 'T = 2\\pi\\sqrt{\\frac{l}{g}}',
          note: 'при малки ъгли; при по-големи T ≈ T₀(1 + θ₀²/16)',
          lesson: '/physics/waves/oscillations',
        },
        {
          name: 'Енергия на трептене',
          formula: '\\frac{kx^2}{2} + \\frac{mv^2}{2} = \\frac{kA^2}{2}',
          lesson: '/physics/waves/oscillations',
        },
      ],
    },
    {
      id: 'waves',
      title: 'Вълни',
      formulas: [
        {
          name: 'Скорост на вълната',
          formula: 'v = \\lambda f = \\frac{\\lambda}{T}',
          note: 'скоростта зависи от средата, честотата – от източника',
          lesson: '/physics/waves/waves',
        },
        {
          name: 'Скорост на вълна по струна',
          formula: 'v = \\sqrt{\\frac{F}{\\mu}}',
          note: 'μ – маса на единица дължина',
          lesson: '/physics/waves/waves',
        },
        {
          name: 'Бягаща вълна',
          formula: 'y = A\\sin(\\omega t - kx) \\qquad k = \\frac{2\\pi}{\\lambda}',
          lesson: '/physics/waves/waves',
        },
        {
          name: 'Интерференция',
          formula: '\\Delta = n\\lambda \\qquad \\Delta = \\left(n + \\frac{1}{2}\\right)\\lambda',
          note: 'усилване и отслабване при източници в една фаза',
          lesson: '/physics/waves/waves',
        },
        {
          name: 'Стояща вълна по струна',
          formula: 'L = n\\frac{\\lambda_n}{2} \\qquad f_n = \\frac{nv}{2L}',
          lesson: '/physics/waves/waves',
        },
        {
          name: 'Ефект на Доплер за звук',
          formula: 'f = f_0\\,\\frac{u \\pm v_n}{u \\mp v_s}',
          note: 'u – скорост на звука; горните знаци – при сближаване',
          lesson: '/physics/waves/waves',
        },
        {
          name: 'Конус на Мах',
          formula: '\\sin\\theta = \\frac{u}{v}',
          note: 'u – скорост на звука, v – на източника',
          lesson: '/physics/waves/waves',
        },
      ],
    },
    {
      id: 'sound',
      title: 'Звук',
      formulas: [
        {
          name: 'Скорост на звука във въздуха',
          formula: 'v \\approx 331 + 0{,}6\\,t \\qquad v = \\lambda f',
          note: 'v в m/s, t в °C; при 20 °C около 343 m/s',
          lesson: '/physics/waves/sound',
        },
        {
          name: 'Ехо',
          formula: 'd = \\frac{vt}{2}',
          note: 't – времето до връщането на ехото',
          lesson: '/physics/waves/sound',
        },
        {
          name: 'Ниво на звука',
          formula: 'L = 10 \\lg \\frac{I}{I_0}, \\quad I_0 = 10^{-12}\\ \\mathrm{W/m^2}',
          note: '+10 dB = 10 пъти по-голям интензитет',
          lesson: '/physics/waves/sound',
        },
        {
          name: 'Интензитет на точков източник',
          formula: 'I = \\frac{P}{4\\pi r^2}',
          lesson: '/physics/waves/sound',
        },
        {
          name: 'Струна и отворена тръба',
          formula: 'f_n = \\frac{nv}{2L}',
          lesson: '/physics/waves/sound',
        },
        {
          name: 'Тръба, затворена в единия край',
          formula: 'f = \\frac{(2n - 1)v}{4L}',
          note: 'само нечетни хармоници',
          lesson: '/physics/waves/sound',
        },
        {
          name: 'Ноти и биене',
          formula: 'f = 440 \\cdot 2^{n/12} \\qquad f_b = |f_1 - f_2|',
          note: 'n – полутонове от ла₄ = 440 Hz',
          lesson: '/physics/waves/sound',
        },
      ],
    },
    {
      id: 'temperature',
      title: 'Температура и топлина',
      formulas: [
        {
          name: 'Температурни скали',
          formula: 'T = t + 273{,}15 \\qquad t_F = 1{,}8\\,t + 32',
          note: 'T в K, t в °C; абсолютната нула е −273,15 °C',
          lesson: '/physics/heat/temperature',
        },
        {
          name: 'Линейно разширение',
          formula: '\\Delta L = \\alpha L_0 \\Delta t',
          note: 'за стомана α ≈ 1,2 · 10⁻⁵ K⁻¹',
          lesson: '/physics/heat/temperature',
        },
        {
          name: 'Количество топлина',
          formula: 'Q = mc\\Delta t',
          note: 'за водата c ≈ 4200 J/(kg·K)',
          lesson: '/physics/heat/temperature',
        },
        {
          name: 'Топлинен баланс',
          formula: 'Q_{\\text{отд}} = Q_{\\text{пол}} \\qquad t = \\frac{m_1 t_1 + m_2 t_2}{m_1 + m_2}',
          note: 'втората формула – при смесване на еднакви вещества',
          lesson: '/physics/heat/temperature',
        },
        {
          name: 'Топене и изпарение',
          formula: 'Q = \\lambda m \\qquad Q = Lm',
          note: 'лед: λ ≈ 334 kJ/kg; вода: L ≈ 2,26 · 10⁶ J/kg',
          lesson: '/physics/heat/temperature',
        },
        {
          name: 'Топлопроводност през стена',
          formula: 'q = \\frac{kS\\Delta t}{d} \\qquad R = \\frac{d}{k}',
          note: 'съпротивленията на слоевете се събират',
          lesson: '/physics/heat/temperature',
        },
      ],
    },
    {
      id: 'ideal-gas',
      title: 'Идеален газ',
      formulas: [
        {
          name: 'Количество вещество',
          formula: 'n = \\frac{N}{N_A} = \\frac{m}{M}',
          note: 'N_A = 6,022 · 10²³ mol⁻¹',
          lesson: '/physics/heat/ideal-gas',
        },
        {
          name: 'Газови закони',
          formula: 'pV = \\text{const} \\qquad \\frac{V}{T} = \\text{const} \\qquad \\frac{p}{T} = \\text{const}',
          note: 'Бойл–Мариот (T = const), Гей-Люсак (p = const), Шарл (V = const)',
          lesson: '/physics/heat/ideal-gas',
        },
        {
          name: 'Обединен газов закон',
          formula: '\\frac{p_1 V_1}{T_1} = \\frac{p_2 V_2}{T_2}',
          note: 'T – абсолютна температура, T = t + 273,15',
          lesson: '/physics/heat/ideal-gas',
        },
        {
          name: 'Уравнение на състоянието',
          formula: 'pV = nRT = NkT',
          note: 'R = 8,314 J/(mol·K), k = 1,381 · 10⁻²³ J/K; при 0 °C и 101,3 kPa един мол заема 22,4 L',
          lesson: '/physics/heat/ideal-gas',
        },
        {
          name: 'Плътност на газ',
          formula: '\\rho = \\frac{pM}{RT}',
          lesson: '/physics/heat/ideal-gas',
        },
        {
          name: 'Основно уравнение на молекулно-кинетичната теория',
          formula: 'p = \\frac{1}{3}\\rho\\,\\overline{v^2} \\qquad \\overline{E_k} = \\frac{3}{2}kT',
          lesson: '/physics/heat/ideal-gas',
        },
        {
          name: 'Средна квадратична скорост',
          formula: 'v_{\\text{ск}} = \\sqrt{\\frac{3kT}{m_0}} = \\sqrt{\\frac{3RT}{M}}',
          note: 'M в kg/mol',
          lesson: '/physics/heat/ideal-gas',
        },
      ],
    },
    {
      id: 'thermodynamics',
      title: 'Термодинамика',
      formulas: [
        {
          name: 'Вътрешна енергия на едноатомен газ',
          formula: 'U = \\frac{3}{2}nRT = \\frac{3}{2}pV',
          note: 'за двуатомен газ около 5/2 nRT',
          lesson: '/physics/heat/thermodynamics',
        },
        {
          name: 'Работа на газа',
          formula: 'W = p\\Delta V \\qquad W = \\int_{V_1}^{V_2} p\\,dV',
          note: 'лицето под кривата в p–V диаграмата',
          lesson: '/physics/heat/thermodynamics',
        },
        {
          name: 'Първи принцип на термодинамиката',
          formula: 'Q = \\Delta U + W',
          note: 'W – работата, извършена от газа',
          lesson: '/physics/heat/thermodynamics',
        },
        {
          name: 'Изотермен и адиабатен процес',
          formula: 'W = nRT\\ln\\frac{V_2}{V_1} \\qquad pV^{\\gamma} = \\text{const}',
          note: 'γ = 5/3 за едноатомен газ, около 1,4 за въздух',
          lesson: '/physics/heat/thermodynamics',
        },
        {
          name: 'КПД на топлинен двигател',
          formula: '\\eta = \\frac{W}{Q_1} = 1 - \\frac{Q_2}{Q_1}',
          lesson: '/physics/heat/thermodynamics',
        },
        {
          name: 'КПД на Карно',
          formula: '\\eta_{\\max} = 1 - \\frac{T_2}{T_1}',
          note: 'температурите в келвини; 1 – нагревател, 2 – хладилник',
          lesson: '/physics/heat/thermodynamics',
        },
        {
          name: 'Термопомпа',
          formula: '\\mathrm{COP} = \\frac{Q_1}{W} \\le \\frac{T_1}{T_1 - T_2}',
          lesson: '/physics/heat/thermodynamics',
        },
        {
          name: 'Ентропия',
          formula: '\\Delta S = \\frac{Q}{T}',
          note: 'в изолирана система ентропията не намалява',
          lesson: '/physics/heat/thermodynamics',
        },
      ],
    },
    {
      id: 'electrostatics',
      title: 'Електростатика',
      formulas: [
        {
          name: 'Елементарен заряд',
          formula: 'q = Ne \\qquad e = 1{,}602 \\cdot 10^{-19}\\ \\mathrm{C}',
          note: 'зарядът се запазва и е кратен на e',
          lesson: '/physics/electricity/electrostatics',
        },
        {
          name: 'Закон на Кулон',
          formula: 'F = k\\frac{|q_1 q_2|}{r^2} \\qquad k = \\frac{1}{4\\pi\\varepsilon_0} \\approx 8{,}99 \\cdot 10^9\\ \\mathrm{N \\cdot m^2/C^2}',
          note: 'в диелектрик силата е ε пъти по-малка',
          lesson: '/physics/electricity/electrostatics',
        },
        {
          name: 'Интензитет на електричното поле',
          formula: '\\vec{E} = \\frac{\\vec{F}}{q} \\qquad E = k\\frac{Q}{r^2}',
          note: 'второто – за точков заряд; полетата се събират като вектори',
          lesson: '/physics/electricity/electrostatics',
        },
        {
          name: 'Напрежение и работа на полето',
          formula: 'U = \\varphi_1 - \\varphi_2 = \\frac{A}{q} \\qquad \\varphi = k\\frac{Q}{r}',
          lesson: '/physics/electricity/electrostatics',
        },
        {
          name: 'Еднородно поле',
          formula: 'E = \\frac{U}{d}',
          note: 'между успоредни заредени плочи',
          lesson: '/physics/electricity/electrostatics',
        },
        {
          name: 'Електронволт',
          formula: '1\\ \\mathrm{eV} = 1{,}602 \\cdot 10^{-19}\\ \\mathrm{J} \\qquad eU = \\frac{mv^2}{2}',
          note: 'енергия на електрон, ускорен от покой с напрежение U',
          lesson: '/physics/electricity/electrostatics',
        },
      ],
    },
    {
      id: 'capacitors',
      title: 'Кондензатори',
      formulas: [
        {
          name: 'Капацитет',
          formula: 'C = \\frac{q}{U}',
          note: '1 F = 1 C/V; на практика µF, nF, pF',
          lesson: '/physics/electricity/capacitors',
        },
        {
          name: 'Плосък кондензатор',
          formula: 'C = \\frac{\\varepsilon_0 \\varepsilon S}{d} \\qquad E = \\frac{U}{d}',
          note: 'ε₀ ≈ 8,85 · 10⁻¹² F/m',
          lesson: '/physics/electricity/capacitors',
        },
        {
          name: 'Енергия на кондензатор',
          formula: 'W = \\frac{CU^2}{2} = \\frac{qU}{2} = \\frac{q^2}{2C}',
          lesson: '/physics/electricity/capacitors',
        },
        {
          name: 'Успоредно свързване',
          formula: 'C = C_1 + C_2 + \\ldots',
          note: 'еднакво напрежение, зарядите се събират',
          lesson: '/physics/electricity/capacitors',
        },
        {
          name: 'Последователно свързване',
          formula: '\\frac{1}{C} = \\frac{1}{C_1} + \\frac{1}{C_2} + \\ldots',
          note: 'еднакъв заряд, напреженията се събират',
          lesson: '/physics/electricity/capacitors',
        },
        {
          name: 'Зареждане и разреждане през резистор',
          formula: 'U_C = \\mathcal{E}\\left(1 - e^{-t/\\tau}\\right) \\qquad U_C = U_0 e^{-t/\\tau} \\qquad \\tau = RC',
          note: 'за τ – около 63 %, за 5τ – практически напълно',
          lesson: '/physics/electricity/capacitors',
        },
      ],
    },
    {
      id: 'direct-current',
      title: 'Постоянен ток',
      formulas: [
        {
          name: 'Сила на тока',
          formula: 'I = \\frac{q}{t}',
          note: '1 A = 1 C/s; условната посока е от + към − по външната верига',
          lesson: '/physics/electricity/direct-current',
        },
        {
          name: 'Закон на Ом за участък от верига',
          formula: 'I = \\frac{U}{R}',
          lesson: '/physics/electricity/direct-current',
        },
        {
          name: 'Съпротивление на проводник',
          formula: 'R = \\rho\\frac{l}{S}',
          note: 'за мед ρ ≈ 1,7 · 10⁻⁸ Ω·m',
          lesson: '/physics/electricity/direct-current',
        },
        {
          name: 'Последователно и успоредно свързване',
          formula: 'R = R_1 + R_2 \\qquad \\frac{1}{R} = \\frac{1}{R_1} + \\frac{1}{R_2}',
          lesson: '/physics/electricity/direct-current',
        },
        {
          name: 'Правила на Кирхоф',
          formula: '\\sum I_{\\text{вх}} = \\sum I_{\\text{изх}} \\qquad \\sum \\mathcal{E} = \\sum IR',
          note: 'второто – по затворен контур',
          lesson: '/physics/electricity/direct-current',
        },
        {
          name: 'Работа и мощност на тока',
          formula: 'W = UIt \\qquad P = UI = I^2R = \\frac{U^2}{R}',
          note: '1 kWh = 3,6 MJ',
          lesson: '/physics/electricity/direct-current',
        },
        {
          name: 'Закон на Ом за цялата верига',
          formula: 'I = \\frac{\\mathcal{E}}{R + r} \\qquad U = \\mathcal{E} - Ir',
          lesson: '/physics/electricity/direct-current',
        },
        {
          name: 'Най-голяма мощност в товара',
          formula: 'P_{\\max} = \\frac{\\mathcal{E}^2}{4r} \\quad \\text{при } R = r',
          note: 'тогава КПД е 50%',
          lesson: '/physics/electricity/direct-current',
        },
      ],
    },
    {
      id: 'magnetic-field',
      title: 'Магнитно поле',
      formulas: [
        {
          name: 'Поле на прав проводник',
          formula: 'B = \\frac{\\mu_0 I}{2\\pi r}',
          note: 'μ₀ = 4π · 10⁻⁷ T·m/A; посоката – по правилото на дясната ръка',
          lesson: '/physics/electricity/magnetic-field',
        },
        {
          name: 'Поле в бобина (соленоид)',
          formula: 'B = \\mu_0 n I',
          note: 'n – брой навивки на метър',
          lesson: '/physics/electricity/magnetic-field',
        },
        {
          name: 'Сила на Ампер',
          formula: 'F = BIl\\sin\\alpha',
          note: 'посоката – по правилото на лявата ръка',
          lesson: '/physics/electricity/magnetic-field',
        },
        {
          name: 'Сила между успоредни токове',
          formula: '\\frac{F}{l} = \\frac{\\mu_0 I_1 I_2}{2\\pi d}',
          note: 'еднопосочните токове се привличат',
          lesson: '/physics/electricity/magnetic-field',
        },
        {
          name: 'Сила на Лоренц',
          formula: 'F = |q|vB\\sin\\alpha',
          note: 'перпендикулярна на скоростта, не извършва работа',
          lesson: '/physics/electricity/magnetic-field',
        },
        {
          name: 'Заряд в еднородно магнитно поле',
          formula: 'r = \\frac{mv}{|q|B} \\qquad T = \\frac{2\\pi m}{|q|B}',
          note: 'периодът не зависи от скоростта',
          lesson: '/physics/electricity/magnetic-field',
        },
        {
          name: 'Селектор на скорости',
          formula: 'v = \\frac{E}{B}',
          lesson: '/physics/electricity/magnetic-field',
        },
        {
          name: 'Въртящ момент на рамка с ток',
          formula: 'M = NBIS\\sin\\theta',
          note: 'θ – ъгълът между перпендикуляра към рамката и силовите линии',
          lesson: '/physics/electricity/magnetic-field',
        },
      ],
    },
    {
      id: 'induction',
      title: 'Електромагнитна индукция',
      formulas: [
        {
          name: 'Магнитен поток',
          formula: '\\Phi = BS\\cos\\alpha',
          note: 'α – ъгълът между B и нормалата; 1 Wb = 1 T·m²',
          lesson: '/physics/electricity/induction',
        },
        {
          name: 'Закон на Фарадей',
          formula: '\\mathcal{E} = -N\\frac{\\Delta\\Phi}{\\Delta t}',
          note: 'минусът е правилото на Ленц',
          lesson: '/physics/electricity/induction',
        },
        {
          name: 'ЕДН в движещ се проводник',
          formula: '\\mathcal{E} = Blv',
          lesson: '/physics/electricity/induction',
        },
        {
          name: 'ЕДН на генератор',
          formula: '\\mathcal{E} = NBS\\omega\\sin\\omega t \\qquad \\mathcal{E}_{\\max} = NBS\\omega',
          lesson: '/physics/electricity/induction',
        },
        {
          name: 'Самоиндукция',
          formula: '\\mathcal{E} = -L\\frac{\\Delta I}{\\Delta t} \\qquad W = \\frac{LI^2}{2}',
          note: 'L – индуктивност, единица хенри (H)',
          lesson: '/physics/electricity/induction',
        },
        {
          name: 'Трансформатор',
          formula: '\\frac{U_2}{U_1} = \\frac{N_2}{N_1} \\qquad U_1 I_1 = U_2 I_2',
          note: 'за идеален трансформатор',
          lesson: '/physics/electricity/induction',
        },
        {
          name: 'Загуби при пренос',
          formula: 'P_{\\text{заг}} = I^2 R = \\frac{P^2 R}{U^2}',
          note: 'десет пъти по-високо напрежение – сто пъти по-малки загуби',
          lesson: '/physics/electricity/induction',
        },
      ],
    },
    {
      id: 'ac-em-waves',
      title: 'Променлив ток и ЕМ вълни',
      formulas: [
        {
          name: 'Променливо напрежение',
          formula: 'u = U_m \\sin \\omega t \\qquad \\omega = 2\\pi f = \\frac{2\\pi}{T}',
          note: 'мрежата в Европа: 50 Hz',
          lesson: '/physics/electricity/ac-em-waves',
        },
        {
          name: 'Ефективни стойности',
          formula: 'U = \\frac{U_m}{\\sqrt{2}} \\qquad I = \\frac{I_m}{\\sqrt{2}}',
          note: '230 V ефективно = около 325 V максимално',
          lesson: '/physics/electricity/ac-em-waves',
        },
        {
          name: 'Средна мощност в резистор',
          formula: 'P = UI = I^2 R = \\frac{U^2}{R}',
          note: 'с ефективните стойности',
          lesson: '/physics/electricity/ac-em-waves',
        },
        {
          name: 'Капацитивно и индуктивно съпротивление',
          formula: 'X_C = \\frac{1}{\\omega C} \\qquad X_L = \\omega L',
          lesson: '/physics/electricity/ac-em-waves',
        },
        {
          name: 'Импеданс на последователна RLC верига',
          formula: 'Z = \\sqrt{R^2 + (X_L - X_C)^2}',
          note: 'при резонанс X_L = X_C и Z = R',
          lesson: '/physics/electricity/ac-em-waves',
        },
        {
          name: 'Формула на Томсън',
          formula: 'T = 2\\pi\\sqrt{LC} \\qquad f_0 = \\frac{1}{2\\pi\\sqrt{LC}}',
          lesson: '/physics/electricity/ac-em-waves',
        },
        {
          name: 'Скорост на електромагнитните вълни',
          formula: 'c = \\frac{1}{\\sqrt{\\varepsilon_0 \\mu_0}} \\approx 3{,}00 \\cdot 10^8\\ \\mathrm{m/s} \\qquad c = \\lambda f',
          lesson: '/physics/electricity/ac-em-waves',
        },
      ],
    },
    {
      id: 'reflection-refraction',
      title: 'Отражение и пречупване',
      formulas: [
        {
          name: 'Закон за отражението',
          formula: "\\alpha' = \\alpha",
          note: 'ъглите се мерят от нормалата към повърхността',
          lesson: '/physics/optics/reflection-refraction',
        },
        {
          name: 'Фокус на сферично огледало',
          formula: 'f = \\frac{R}{2}',
          note: 'вдлъбнато – действителен фокус, изпъкнало – мним',
          lesson: '/physics/optics/reflection-refraction',
        },
        {
          name: 'Показател на пречупване',
          formula: 'n = \\frac{c}{v}',
          note: 'вода 1,33; стъкло около 1,5; диамант 2,42',
          lesson: '/physics/optics/reflection-refraction',
        },
        {
          name: 'Закон на Снел',
          formula: 'n_1 \\sin\\alpha = n_2 \\sin\\beta',
          lesson: '/physics/optics/reflection-refraction',
        },
        {
          name: 'Критичен ъгъл',
          formula: '\\sin\\alpha_{\\text{кр}} = \\frac{n_2}{n_1}',
          note: 'пълно вътрешно отражение само при n₁ > n₂',
          lesson: '/physics/optics/reflection-refraction',
        },
        {
          name: 'Видима дълбочина',
          formula: "h' \\approx \\frac{h}{n}",
          note: 'при почти отвесно гледане',
          lesson: '/physics/optics/reflection-refraction',
        },
        {
          name: 'Дъга',
          formula: '\\theta \\approx 42^{\\circ} \\qquad \\theta_2 \\approx 51^{\\circ}',
          note: 'от точката срещу Слънцето; червеното е отвън при основната дъга',
          lesson: '/physics/optics/reflection-refraction',
        },
      ],
    },
    {
      id: 'lenses',
      title: 'Лещи и оптични уреди',
      formulas: [
        {
          name: 'Оптична сила',
          formula: 'D = \\frac{1}{f} \\qquad D = D_1 + D_2',
          note: 'f в метри, D в диоптри; за разсейвателна леща f < 0; второто – за долепени лещи',
          lesson: '/physics/optics/lenses',
        },
        {
          name: 'Формула на тънката леща',
          formula: "\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d'}",
          note: "d' > 0 – реален образ, d' < 0 – въображаем",
          lesson: '/physics/optics/lenses',
        },
        {
          name: 'Увеличение',
          formula: "\\Gamma = \\frac{h'}{h} = \\frac{|d'|}{d}",
          note: 'реалният образ е обърнат, въображаемият – прав',
          lesson: '/physics/optics/lenses',
        },
        {
          name: 'Очила за късоглед',
          formula: 'D = -\\frac{1}{a}',
          note: 'a – далечната точка на окото в метри',
          lesson: '/physics/optics/lenses',
        },
        {
          name: 'Лупа',
          formula: '\\Gamma \\approx \\frac{25\\ \\mathrm{cm}}{f} \\qquad \\Gamma = 1 + \\frac{25\\ \\mathrm{cm}}{f}',
          note: 'образ в безкрайност / образ на 25 cm',
          lesson: '/physics/optics/lenses',
        },
        {
          name: 'Микроскоп',
          formula: 'M \\approx \\frac{L}{f_{\\text{об}}} \\cdot \\frac{25\\ \\mathrm{cm}}{f_{\\text{ок}}}',
          note: 'L – оптична дължина на тубуса',
          lesson: '/physics/optics/lenses',
        },
      ],
    },
    {
      id: 'wave-optics',
      title: 'Вълнова оптика',
      formulas: [
        {
          name: 'Опит на Юнг',
          formula: 'd\\sin\\theta = k\\lambda \\qquad \\Delta y = \\frac{\\lambda L}{d}',
          note: 'максимуми; минимуми при d sin θ = (k + 1/2)λ',
          lesson: '/physics/optics/wave-optics',
        },
        {
          name: 'Дифракция на една цепнатина',
          formula: 'a\\sin\\theta = \\lambda',
          note: 'първият минимум; a – ширина на цепнатината',
          lesson: '/physics/optics/wave-optics',
        },
        {
          name: 'Разделителна способност',
          formula: '\\theta \\approx 1{,}22\\,\\frac{\\lambda}{D}',
          note: 'в радиани; D – диаметър на отвора',
          lesson: '/physics/optics/wave-optics',
        },
        {
          name: 'Дифракционна решетка',
          formula: 'd\\sin\\theta = k\\lambda \\qquad d = \\frac{1}{N} \\qquad |k| < \\frac{d}{\\lambda}',
          note: 'N – брой линии на единица дължина',
          lesson: '/physics/optics/wave-optics',
        },
        {
          name: 'Тънък слой във въздуха',
          formula: '2nd = \\left(k + \\frac{1}{2}\\right)\\lambda',
          note: 'усилване при едно обръщане на фазата (сапунен филм)',
          lesson: '/physics/optics/wave-optics',
        },
        {
          name: 'Антиотражателно покритие',
          formula: 'd = \\frac{\\lambda}{4n}',
          lesson: '/physics/optics/wave-optics',
        },
        {
          name: 'Закон на Малюс',
          formula: 'I = I_0\\cos^2\\varphi',
          note: 'неполяризирана светлина след поляризатор: I₀/2',
          lesson: '/physics/optics/wave-optics',
        },
        {
          name: 'Ъгъл на Брюстер',
          formula: '\\tg\\theta_B = n',
          note: 'отразената светлина е напълно поляризирана',
          lesson: '/physics/optics/wave-optics',
        },
      ],
    },
    {
      id: 'photons',
      title: 'Фотони и фотоефект',
      formulas: [
        {
          name: 'Енергия на фотона',
          formula: 'E = hf = \\frac{hc}{\\lambda} \\qquad E\\,[\\mathrm{eV}] \\approx \\frac{1240}{\\lambda\\,[\\mathrm{nm}]}',
          note: '1 eV = 1,6 · 10⁻¹⁹ J',
          lesson: '/physics/modern/photons',
        },
        {
          name: 'Уравнение на Айнщайн за фотоефекта',
          formula: 'hf = A + E_{k,\\max}',
          lesson: '/physics/modern/photons',
        },
        {
          name: 'Червена граница',
          formula: 'f_0 = \\frac{A}{h} \\qquad \\lambda_0 = \\frac{hc}{A}',
          note: 'фотоефект има при f > f₀, т.е. λ < λ₀',
          lesson: '/physics/modern/photons',
        },
        {
          name: 'Спиращо напрежение',
          formula: 'eU_s = E_{k,\\max} = hf - A \\qquad U_s = \\frac{h}{e}f - \\frac{A}{e}',
          lesson: '/physics/modern/photons',
        },
        {
          name: 'Импулс на фотона и светлинно налягане',
          formula: 'p = \\frac{E}{c} = \\frac{h}{\\lambda} \\qquad F = \\frac{P}{c}\\ \\text{(поглъщане)}, \\quad F = \\frac{2P}{c}\\ \\text{(отражение)}',
          lesson: '/physics/modern/photons',
        },
        {
          name: 'Ефект на Комптън',
          formula: '\\Delta\\lambda = \\frac{h}{mc}(1 - \\cos\\theta) \\qquad \\frac{h}{mc} \\approx 2{,}43\\ \\mathrm{pm}',
          lesson: '/physics/modern/photons',
        },
        {
          name: 'Дължина на вълната на дьо Бройл',
          formula: '\\lambda = \\frac{h}{p} = \\frac{h}{mv} \\qquad \\lambda = \\frac{h}{\\sqrt{2meU}}',
          note: 'последното – за електрон, ускорен от покой с напрежение U',
          lesson: '/physics/modern/photons',
        },
      ],
    },
    {
      id: 'atom',
      title: 'Атомът',
      formulas: [
        {
          name: 'Най-малко разстояние при челен удар (Ръдърфорд)',
          formula: 'd = \\frac{2Zke^2}{E_k} \\qquad ke^2 \\approx 1{,}44\\ \\mathrm{MeV \\cdot fm}',
          note: 'α-частица със заряд 2e към ядро със заряд Ze',
          lesson: '/physics/modern/atom',
        },
        {
          name: 'Ъгъл на разсейване',
          formula: '\\operatorname{tg}\\frac{\\theta}{2} = \\frac{d}{2b}',
          note: 'b – прицелен параметър',
          lesson: '/physics/modern/atom',
        },
        {
          name: 'Правило на Бор за орбитите',
          formula: 'mvr = n\\hbar \\qquad \\hbar = \\frac{h}{2\\pi}',
          lesson: '/physics/modern/atom',
        },
        {
          name: 'Радиуси на орбитите',
          formula: 'r_n = \\frac{n^2 a_0}{Z} \\qquad a_0 \\approx 0{,}053\\ \\mathrm{nm}',
          note: 'Z = 1 за водорода',
          lesson: '/physics/modern/atom',
        },
        {
          name: 'Енергетични нива',
          formula: 'E_n = -\\frac{13{,}6\\ \\mathrm{eV} \\cdot Z^2}{n^2}',
          note: 'атом или йон с един електрон',
          lesson: '/physics/modern/atom',
        },
        {
          name: 'Фотон при преход',
          formula: 'hf = E_m - E_n \\qquad \\lambda[\\mathrm{nm}] \\approx \\frac{1240}{\\Delta E[\\mathrm{eV}]}',
          lesson: '/physics/modern/atom',
        },
        {
          name: 'Брой спектрални линии',
          formula: 'N = \\frac{n(n - 1)}{2}',
          note: 'при връщане от ниво n в основно състояние',
          lesson: '/physics/modern/atom',
        },
      ],
    },
    {
      id: 'nucleus',
      title: 'Ядро и радиоактивност',
      formulas: [
        {
          name: 'Състав на ядрото',
          formula: '{}^{A}_{Z}\\mathrm{X} \\qquad N = A - Z \\qquad r \\approx 1{,}2\\ \\mathrm{fm} \\cdot A^{1/3}',
          note: 'Z – протони, N – неутрони, A – нуклони',
          lesson: '/physics/modern/nucleus',
        },
        {
          name: 'Дефект на масата и енергия на връзката',
          formula: '\\Delta m = Zm_p + Nm_n - m_{\\text{я}} \\qquad E_{\\text{св}} = \\Delta m\\,c^2',
          note: '1 u ↔ 931,5 MeV; с масите на атомите вместо m_p се взема масата на водородния атом',
          lesson: '/physics/modern/nucleus',
        },
        {
          name: 'α-разпадане',
          formula: '{}^{A}_{Z}\\mathrm{X} \\to {}^{A-4}_{Z-2}\\mathrm{Y} + {}^{4}_{2}\\mathrm{He}',
          lesson: '/physics/modern/nucleus',
        },
        {
          name: 'β⁻-разпадане',
          formula: '{}^{A}_{Z}\\mathrm{X} \\to {}^{A}_{Z+1}\\mathrm{Y} + e^- + \\bar{\\nu}_e',
          note: 'в ядрото неутрон става протон; при γ-лъчение A и Z не се менят',
          lesson: '/physics/modern/nucleus',
        },
        {
          name: 'Закон за радиоактивното разпадане',
          formula: 'N = N_0 \\cdot 2^{-t/T} = N_0 e^{-\\lambda t} \\qquad \\lambda = \\frac{\\ln 2}{T}',
          note: 'T – период на полуразпадане',
          lesson: '/physics/modern/nucleus',
        },
        {
          name: 'Активност',
          formula: 'A = \\lambda N \\qquad 1\\ \\mathrm{Bq} = 1\\ \\mathrm{s^{-1}}',
          lesson: '/physics/modern/nucleus',
        },
        {
          name: 'Енергия на ядрена реакция',
          formula: 'Q = \\left(\\sum m_{\\text{преди}} - \\sum m_{\\text{след}}\\right)c^2',
          note: 'делене на ²³⁵U ≈ 200 MeV; ²H + ³H → ⁴He + n: 17,6 MeV',
          lesson: '/physics/modern/nucleus',
        },
      ],
    },
    {
      id: 'uncertainty',
      title: 'Вълнова функция и неопределеност',
      formulas: [
        {
          name: 'Правило на Борн',
          formula: 'P = |\\psi(x)|^2\\,\\Delta x',
          note: 'вероятност частицата да бъде открита в малък интервал Δx около x',
          lesson: '/physics/modern/uncertainty',
        },
        {
          name: 'Суперпозиция',
          formula: 'P = |\\psi_1 + \\psi_2|^2',
          note: 'събират се амплитудите, не вероятностите',
          lesson: '/physics/modern/uncertainty',
        },
        {
          name: 'Принцип на неопределеността',
          formula: '\\Delta x \\cdot \\Delta p_x \\ge \\frac{\\hbar}{2} \\qquad \\hbar = \\frac{h}{2\\pi} \\approx 1{,}05 \\cdot 10^{-34}\\ \\mathrm{J \\cdot s}',
          lesson: '/physics/modern/uncertainty',
        },
        {
          name: 'Време на живот и ширина на нивото',
          formula: '\\Delta E \\approx \\frac{\\hbar}{\\tau} \\qquad \\Delta f \\approx \\frac{1}{2\\pi\\tau}',
          lesson: '/physics/modern/uncertainty',
        },
        {
          name: 'Енергия на затворена частица (оценка)',
          formula: 'E_k \\approx \\frac{\\hbar^2}{2mr^2}',
          note: 'p ≈ ħ/r за частица в област с размер r',
          lesson: '/physics/modern/uncertainty',
        },
        {
          name: 'Радиус на Бор и енергия на водорода от оценката',
          formula: 'a_0 = \\frac{\\hbar^2}{mke^2} \\approx 0{,}0529\\ \\mathrm{nm} \\qquad E = -\\frac{ke^2}{2a_0} \\approx -13{,}6\\ \\mathrm{eV}',
          note: 'минимумът на E(r) = ħ²/(2mr²) − ke²/r; за йон със заряд Ze: a₀/Z и −13,6·Z² eV',
          lesson: '/physics/modern/uncertainty',
        },
        {
          name: 'Гаусов вълнов пакет',
          formula: '\\Delta x \\cdot \\Delta k = \\frac{1}{2} \\qquad p = \\hbar k',
          lesson: '/physics/modern/uncertainty',
        },
      ],
    },
    {
      id: 'particle-in-box',
      title: 'Частица в кутия и тунелен ефект',
      formulas: [
        {
          name: 'Стоящи вълни в кутия',
          formula: '\\lambda_n = \\frac{2L}{n} \\qquad p_n = \\frac{nh}{2L}',
          note: 'n = 1, 2, 3, …',
          lesson: '/physics/modern/particle-in-box',
        },
        {
          name: 'Енергия на частица в кутия',
          formula: 'E_n = \\frac{n^2h^2}{8mL^2} = n^2E_1',
          note: 'за електрон h²/(8mₑ) ≈ 0,376 eV·nm²',
          lesson: '/physics/modern/particle-in-box',
        },
        {
          name: 'Вълнови функции в кутия',
          formula: '\\psi_n(x) = \\sqrt{\\frac{2}{L}}\\sin\\frac{n\\pi x}{L}',
          note: 'n − 1 възела вътре в кутията',
          lesson: '/physics/modern/particle-in-box',
        },
        {
          name: 'Преход между нивата',
          formula: 'hf = E_n - E_m = (n^2 - m^2)\\frac{h^2}{8mL^2}',
          lesson: '/physics/modern/particle-in-box',
        },
        {
          name: 'Затихване в забранената област',
          formula: '\\psi \\propto e^{-\\kappa x} \\qquad \\kappa = \\frac{\\sqrt{2m(U - E)}}{\\hbar}',
          note: 'за електрон κ [nm⁻¹] ≈ 5,12·√(U − E [eV]); дълбочина на проникване ≈ 1/κ',
          lesson: '/physics/modern/particle-in-box',
        },
        {
          name: 'Прозрачност на бариера (тунелен ефект)',
          formula: 'T \\approx e^{-2\\kappa d}',
          note: 'при κd ≫ 1; d – ширина на бариерата',
          lesson: '/physics/modern/particle-in-box',
        },
      ],
    },
    {
      id: 'quantum-atom',
      title: 'Квантовият атом',
      formulas: [
        {
          name: 'Квантови числа',
          formula: 'n = 1, 2, \\ldots \\qquad l = 0, \\ldots, n - 1 \\qquad m_l = -l, \\ldots, l \\qquad m_s = \\pm\\frac{1}{2}',
          note: 'l = 0, 1, 2, 3 → подслоеве s, p, d, f',
          lesson: '/physics/modern/quantum-atom',
        },
        {
          name: 'Брой орбитали и електрони',
          formula: '\\text{подслой: } 2l + 1 \\text{ орбитали, } 2(2l + 1)\\ e^- \\qquad \\text{слой: } n^2 \\text{ орбитали, } 2n^2\\ e^-',
          note: 'по принципа на Паули – до 2 електрона в орбитала',
          lesson: '/physics/modern/quantum-atom',
        },
        {
          name: 'Момент на импулса в атома',
          formula: 'L = \\hbar\\sqrt{l(l + 1)} \\qquad L_z = m_l\\hbar \\qquad S_z = \\pm\\frac{\\hbar}{2}',
          lesson: '/physics/modern/quantum-atom',
        },
        {
          name: 'Радиална вероятност',
          formula: 'P(r)\\,dr = r^2 R^2(r)\\,dr \\qquad r_{\\text{най-вер.}} = n^2 a_0 \\ (l = n - 1)',
          note: 'за 1s: P(r) = 4r²/a₀³ · e^(−2r/a₀), максимум при r = a₀',
          lesson: '/physics/modern/quantum-atom',
        },
        {
          name: 'Магнетон на Бор и сила в нееднородно поле',
          formula: '\\mu_B = \\frac{e\\hbar}{2m_e} \\approx 9{,}27 \\cdot 10^{-24}\\ \\mathrm{J/T} \\qquad F_z = \\mu_z \\frac{\\partial B}{\\partial z}',
          note: 'μ_B ≈ 5,79·10⁻⁵ eV/T; опитът на Щерн и Герлах',
          lesson: '/physics/modern/quantum-atom',
        },
        {
          name: 'Ефект на Зееман (нормален)',
          formula: '\\Delta E = m_l \\mu_B B \\qquad \\frac{\\Delta\\lambda}{\\lambda} = \\frac{\\Delta E}{E}',
          note: 'нивото с орбитално число l се разцепва на 2l + 1 поднива',
          lesson: '/physics/modern/quantum-atom',
        },
        {
          name: 'Последователни измервания на спина',
          formula: 'P(\\text{нагоре по нова ос}) = \\cos^2\\frac{\\theta}{2}',
          note: 'θ – ъгълът между старата и новата ос',
          lesson: '/physics/modern/quantum-atom',
        },
      ],
    },
  ],
};

export const CHEMISTRY: Section = {
  id: 'chemistry',
  title: 'Химия',
  groups: [
    {
      id: 'mixtures',
      title: 'Смеси и разделяне',
      formulas: [
        {
          name: 'Масова част',
          formula: 'w(\\mathrm{X}) = \\frac{m(\\mathrm{X})}{m_{\\text{смес}}}, \\qquad \\sum w_i = 1 = 100\\%',
          lesson: '/chemistry/structure/substances',
        },
        {
          name: 'Маса на разтвор',
          formula: 'm_{\\text{р-р}} = m_{\\text{разтворено в-во}} + m_{\\text{разтворител}}',
          lesson: '/chemistry/structure/substances',
        },
        {
          name: 'Смесване на разтвори',
          formula: 'w = \\frac{w_1 m_1 + w_2 m_2}{m_1 + m_2}',
          note: 'Събират се масите на веществото и на разтворите, не масовите части.',
          lesson: '/chemistry/structure/substances',
        },
        {
          name: 'Изпаряване и разреждане',
          formula: 'w_1 m_1 = w_2 m_2',
          note: 'Масата на разтвореното вещество не се променя.',
          lesson: '/chemistry/structure/substances',
        },
        {
          name: 'Обемна част (газове)',
          formula: '\\varphi(\\mathrm{X}) = \\frac{V(\\mathrm{X})}{V_{\\text{смес}}}',
          lesson: '/chemistry/structure/substances',
        },
        {
          name: 'Стойност Rf при хроматография',
          formula: 'R_f = \\frac{l_{\\text{петно}}}{l_{\\text{фронт}}}, \\qquad 0 \\le R_f \\le 1',
          lesson: '/chemistry/structure/substances',
        },
      ],
    },
    {
      id: 'atoms',
      title: 'Атоми, изотопи и периодичната система',
      formulas: [
        {
          name: 'Масово число',
          formula: 'A = Z + N',
          note: '$Z$ – протони, $N$ – неутрони; нуклид ${}^{A}_{Z}\\mathrm{X}$.',
          lesson: '/chemistry/structure/atoms',
        },
        {
          name: 'Електрони в йон',
          formula: 'n_e = Z - q',
          note: 'За катион $q > 0$, за анион $q < 0$; в неутралния атом $n_e = Z$.',
          lesson: '/chemistry/structure/atoms',
        },
        {
          name: 'Атомна единица за маса',
          formula: '1\\ \\mathrm{u} = \\frac{1}{12}\\,m({}^{12}\\mathrm{C}) \\approx 1{,}661 \\cdot 10^{-27}\\ \\mathrm{kg}',
          lesson: '/chemistry/structure/atoms',
        },
        {
          name: 'Относителна атомна маса',
          formula: 'A_r = \\sum_i x_i m_i, \\qquad \\sum_i x_i = 1',
          note: '$x_i$ – дял на изотопа, $m_i$ – масата му в u.',
          lesson: '/chemistry/structure/atoms',
        },
        {
          name: 'Дял на изотоп (два изотопа)',
          formula: 'x_1 = \\frac{m_2 - A_r}{m_2 - m_1}',
          lesson: '/chemistry/structure/atoms',
        },
        {
          name: 'Външни електрони (главни групи)',
          formula: 'n_{\\text{вън}} = \\text{група} \\ (1, 2), \\qquad n_{\\text{вън}} = \\text{група} - 10 \\ (13\\text{–}18)',
          note: 'Номерът на периода е равен на броя на електронните слоеве.',
          lesson: '/chemistry/structure/atoms',
        },
      ],
    },
    {
      id: 'bonding',
      title: 'Химична връзка',
      formulas: [
        {
          name: 'Заряд на йона (главни групи)',
          formula: 'q = +N_{\\text{гр}}\\ (\\text{групи 1, 2, 13}), \\qquad q = N_{\\text{гр}} - 18\\ (\\text{групи 15–17})',
          note: 'Металите отдават валентните си електрони, неметалите приемат до октет.',
          lesson: '/chemistry/structure/bonding',
        },
        {
          name: 'Електронеутралност на йонно съединение',
          formula: 'n \\cdot q_{+} + m \\cdot q_{-} = 0',
          note: 'Броят на йоните се намира от НОК на зарядите: $\\mathrm{Al^{3+}}$ и $\\mathrm{O^{2-}}$ → $\\mathrm{Al_2O_3}$.',
          lesson: '/chemistry/structure/bonding',
        },
        {
          name: 'Разлика в електроотрицателността',
          formula: '\\Delta\\chi = |\\chi_A - \\chi_B|',
          note: 'Около 0 – ковалентна неполярна, умерена – ковалентна полярна, над около 1,7 (метал и неметал) – йонна; границите са приблизителни.',
          lesson: '/chemistry/structure/bonding',
        },
        {
          name: 'Брой електронни двойки във формула на Люис',
          formula: 'N_{\\text{двойки}} = \\frac{\\sum V_i - q}{2}',
          note: '$V_i$ – валентните електрони на атомите, $q$ – зарядът на частицата.',
          lesson: '/chemistry/structure/bonding',
        },
        {
          name: 'Формален заряд',
          formula: 'Z_{\\text{ф}} = V - N - \\frac{B}{2}',
          note: '$N$ – електрони в несподелените двойки, $B$ – в общите двойки на атома.',
          lesson: '/chemistry/structure/bonding',
        },
        {
          name: 'Енергия на реакция от енергиите на връзките',
          formula: 'Q \\approx \\sum E_{\\text{образувани}} - \\sum E_{\\text{разкъсани}}',
          note: '$Q > 0$ – енергия се отделя.',
          lesson: '/chemistry/structure/bonding',
        },
      ],
    },
    {
      id: 'molecules',
      title: 'Форма на молекулите и полярност',
      formulas: [
        {
          name: 'Брой електронни области (VSEPR)',
          formula: 'n = n_{\\text{свързани атоми}} + n_{\\text{неподелени двойки}}',
          note: 'Кратната връзка се брои за една област.',
          lesson: '/chemistry/structure/molecules',
        },
        {
          name: 'Идеални ъгли',
          formula: '2: 180^\\circ \\qquad 3: 120^\\circ \\qquad 4: 109{,}5^\\circ \\qquad 5: 90^\\circ,\\ 120^\\circ \\qquad 6: 90^\\circ',
          lesson: '/chemistry/structure/molecules',
        },
        {
          name: 'Ъгъл в тетраедъра',
          formula: '\\cos\\theta = -\\tfrac{1}{3}, \\qquad \\theta \\approx 109{,}47^\\circ',
          lesson: '/chemistry/structure/molecules',
        },
        {
          name: 'Диполен момент',
          formula: '\\mu = q \\cdot d, \\qquad 1\\ \\mathrm{D} \\approx 3{,}336 \\cdot 10^{-30}\\ \\mathrm{C \\cdot m}',
          lesson: '/chemistry/structure/molecules',
        },
        {
          name: 'Диполен момент на молекулата',
          formula: '\\vec{\\mu} = \\sum \\vec{\\mu}_i, \\qquad \\text{два равни дипола под ъгъл } \\theta:\\ \\mu = 2\\mu_b \\cos\\frac{\\theta}{2}',
          lesson: '/chemistry/structure/molecules',
        },
      ],
    },
    {
      id: 'mole',
      title: 'Мол и моларна маса',
      formulas: [
        {
          name: 'Количество вещество',
          formula: 'n = \\frac{m}{M} = \\frac{N}{N_A}',
          lesson: '/chemistry/quantities/mole',
        },
        {
          name: 'Константа на Авогадро',
          formula: 'N_A = 6{,}022\\,140\\,76 \\cdot 10^{23}\\ \\mathrm{mol^{-1}}',
          note: 'Точна стойност от 2019 г.',
          lesson: '/chemistry/quantities/mole',
        },
        {
          name: 'Маса на една частица',
          formula: 'm_0 = \\frac{M}{N_A}',
          lesson: '/chemistry/quantities/mole',
        },
        {
          name: 'Относителна молекулна маса',
          formula: 'M_r = \\sum a_i A_r(\\mathrm{X}_i), \\qquad M = M_r\\ \\mathrm{g/mol}',
          lesson: '/chemistry/quantities/mole',
        },
        {
          name: 'Масова част на елемент в съединение',
          formula: 'w(\\mathrm{X}) = \\frac{a \\cdot A_r(\\mathrm{X})}{M_r}',
          lesson: '/chemistry/quantities/mole',
        },
        {
          name: 'Молекулна формула от най-простата',
          formula: 'k = \\frac{M}{M_{\\text{най-проста}}}',
          note: 'Индексите в най-простата формула се умножават по k.',
          lesson: '/chemistry/quantities/mole',
        },
      ],
    },
    {
      id: 'stoichiometry',
      title: 'Химични уравнения и стехиометрия',
      formulas: [
        {
          name: 'Закон за запазване на масата',
          formula: '\\sum m_{\\text{реагенти}} = \\sum m_{\\text{продукти}}',
          lesson: '/chemistry/quantities/stoichiometry',
        },
        {
          name: 'Стехиометрично отношение',
          formula: '\\frac{n(\\mathrm{A})}{\\nu_A} = \\frac{n(\\mathrm{B})}{\\nu_B}',
          note: '$\\nu$ – коефициентите в изравненото уравнение.',
          lesson: '/chemistry/quantities/stoichiometry',
        },
        {
          name: 'Маса по уравнение',
          formula: 'm(\\mathrm{B}) = \\frac{m(\\mathrm{A})}{M(\\mathrm{A})} \\cdot \\frac{\\nu_B}{\\nu_A} \\cdot M(\\mathrm{B})',
          lesson: '/chemistry/quantities/stoichiometry',
        },
        {
          name: 'Вещество в недостиг',
          formula: '\\text{в недостиг е реагентът с най-малко } \\frac{n}{\\nu}',
          lesson: '/chemistry/quantities/stoichiometry',
        },
        {
          name: 'Добив на реакцията',
          formula: '\\eta = \\frac{m_{\\text{практ}}}{m_{\\text{теор}}} \\cdot 100\\%',
          lesson: '/chemistry/quantities/stoichiometry',
        },
        {
          name: 'Чисто вещество в проба',
          formula: 'm_{\\text{чисто}} = w \\cdot m_{\\text{проба}}',
          lesson: '/chemistry/quantities/stoichiometry',
        },
      ],
    },
    {
      id: 'solutions',
      title: 'Разтвори и концентрации',
      formulas: [
        {
          name: 'Моларна концентрация',
          formula: 'c = \\frac{n}{V}, \\qquad [c] = \\mathrm{mol/L} = \\mathrm{mol \\cdot dm^{-3}} = \\mathrm{M}',
          lesson: '/chemistry/quantities/solutions',
        },
        {
          name: 'Маса за приготвяне на разтвор',
          formula: 'm = c \\cdot V \\cdot M',
          lesson: '/chemistry/quantities/solutions',
        },
        {
          name: 'Масова част и моларна концентрация',
          formula: 'c = \\frac{1000 \\cdot \\rho \\cdot w}{M}',
          note: 'ρ в g/mL, M в g/mol, c в mol/L.',
          lesson: '/chemistry/quantities/solutions',
        },
        {
          name: 'Разреждане',
          formula: 'c_1 V_1 = c_2 V_2',
          note: 'Количеството разтворено вещество не се променя.',
          lesson: '/chemistry/quantities/solutions',
        },
        {
          name: 'Смесване на разтвори (обемите се събират)',
          formula: 'c = \\frac{c_1 V_1 + c_2 V_2}{V_1 + V_2}',
          lesson: '/chemistry/quantities/solutions',
        },
        {
          name: 'Масова част на наситен разтвор',
          formula: 'w = \\frac{S}{100 + S}',
          note: 'S – разтворимост в грамове на 100 g вода.',
          lesson: '/chemistry/quantities/solutions',
        },
        {
          name: 'ppm и ppb',
          formula: '1\\ \\mathrm{ppm} = 1\\ \\mathrm{mg/kg} \\approx 1\\ \\mathrm{mg/L}, \\qquad 1\\ \\mathrm{ppb} = 1\\ \\mathrm{\\mu g/kg}',
          note: 'Приближението с литър е за разредени водни разтвори.',
          lesson: '/chemistry/quantities/solutions',
        },
      ],
    },
    {
      id: 'gases-chem',
      title: 'Газове в химията',
      formulas: [
        {
          name: 'Моларен обем',
          formula: 'V_m = \\frac{V}{n}, \\qquad V_m = 22{,}4\\ \\mathrm{L/mol}\\ \\text{(0 °C, 101,3 kPa)}',
          note: 'При 25 °C и 101,3 kPa – около 24,5 L/mol.',
          lesson: '/chemistry/quantities/gases',
        },
        {
          name: 'Закон на Авогадро',
          formula: '\\frac{V_1}{V_2} = \\frac{n_1}{n_2} \\quad (p, T = \\text{const})',
          lesson: '/chemistry/quantities/gases',
        },
        {
          name: 'Плътност на газ (н.у.)',
          formula: '\\rho = \\frac{M}{V_m}',
          lesson: '/chemistry/quantities/gases',
        },
        {
          name: 'Относителна плътност',
          formula: 'D_{\\mathrm{Y}}(\\mathrm{X}) = \\frac{M(\\mathrm{X})}{M(\\mathrm{Y})}, \\qquad M = 2D_{\\mathrm{H_2}} = 29D_{\\text{въздух}}',
          lesson: '/chemistry/quantities/gases',
        },
        {
          name: 'Средна моларна маса на газова смес',
          formula: '\\bar{M} = \\sum \\varphi_i M_i, \\qquad \\varphi_i = \\frac{V_i}{V} = \\frac{n_i}{n}',
          lesson: '/chemistry/quantities/gases',
        },
        {
          name: 'Закон на Далтон',
          formula: 'p = \\sum p_i, \\qquad p_i = \\varphi_i\\, p',
          lesson: '/chemistry/quantities/gases',
        },
      ],
    },
    {
      id: 'reaction-energy',
      title: 'Енергия на реакциите',
      formulas: [
        {
          name: 'Знак на енталпията',
          formula: '\\Delta H < 0\\ \\text{(екзотермична)}, \\qquad \\Delta H > 0\\ \\text{(ендотермична)}',
          note: 'Обратната реакция има $\\Delta H$ с обратен знак; при умножаване на уравнението по $k$ и $\\Delta H$ се умножава по $k$.',
          lesson: '/chemistry/reactions/energy',
        },
        {
          name: 'Калориметрия',
          formula: 'q = m c \\Delta T, \\qquad \\Delta H = -\\frac{q}{n}',
          note: 'За вода $c = 4{,}18\\ \\mathrm{J/(g \\cdot K)}$.',
          lesson: '/chemistry/reactions/energy',
        },
        {
          name: 'Закон на Хес',
          formula: '\\Delta H = \\sum_i k_i\\, \\Delta H_i',
          note: 'Ако търсеното уравнение е сбор от дадените, умножени по $k_i$.',
          lesson: '/chemistry/reactions/energy',
        },
        {
          name: 'ΔH от енталпиите на образуване',
          formula: '\\Delta H = \\sum \\nu\\, \\Delta_f H^\\circ(\\text{продукти}) - \\sum \\nu\\, \\Delta_f H^\\circ(\\text{реагенти})',
          note: 'За простите вещества в стандартно състояние $\\Delta_f H^\\circ = 0$.',
          lesson: '/chemistry/reactions/energy',
        },
        {
          name: 'ΔH от енергиите на връзките',
          formula: '\\Delta H \\approx \\sum E(\\text{скъсани}) - \\sum E(\\text{образувани})',
          note: 'Приблизително, със средни енергии на връзките; за вещества в газово състояние.',
          lesson: '/chemistry/reactions/energy',
        },
        {
          name: 'Калоричност на гориво',
          formula: 'Q_m = \\frac{|\\Delta_c H|}{M}',
          note: '$\\Delta_c H$ – енталпия на горене на мол; $1\\ \\mathrm{kcal} = 4{,}184\\ \\mathrm{kJ}$.',
          lesson: '/chemistry/reactions/energy',
        },
        {
          name: 'Енергия на Гибс',
          formula: '\\Delta G = \\Delta H - T\\Delta S',
          note: 'Реакцията може да протече самопроизволно при $\\Delta G < 0$; граничната температура е $T = \\Delta H / \\Delta S$.',
          lesson: '/chemistry/reactions/energy',
        },
      ],
    },
    {
      id: 'kinetics',
      title: 'Скорост на реакцията',
      formulas: [
        {
          name: 'Средна скорост на реакцията',
          formula: '\\bar{v} = -\\frac{\\Delta c(\\text{реагент})}{\\Delta t} = \\frac{\\Delta c(\\text{продукт})}{\\Delta t}',
          note: 'При $a\\mathrm{A} \\to \\ldots$ скоростта на реакцията е $-\\frac{1}{a}\\frac{\\Delta c(\\mathrm{A})}{\\Delta t}$.',
          lesson: '/chemistry/reactions/kinetics',
        },
        {
          name: 'Правило на Вант Хоф',
          formula: '\\frac{v_2}{v_1} = \\gamma^{\\frac{t_2 - t_1}{10}}, \\qquad \\gamma \\approx 2\\text{–}4',
          lesson: '/chemistry/reactions/kinetics',
        },
        {
          name: 'Кинетично уравнение',
          formula: 'v = k \\cdot c(\\mathrm{A})^m \\cdot c(\\mathrm{B})^n',
          note: 'Редовете $m$ и $n$ се намират от опит; общият ред е $m + n$.',
          lesson: '/chemistry/reactions/kinetics',
        },
        {
          name: 'Реакция от първи ред',
          formula: 'c = c_0 e^{-kt}, \\qquad t_{1/2} = \\frac{\\ln 2}{k}',
          note: 'След $n$ периода остава $c_0/2^n$.',
          lesson: '/chemistry/reactions/kinetics',
        },
        {
          name: 'Реакции от нулев и втори ред',
          formula: 'c = c_0 - kt,\\ t_{1/2} = \\frac{c_0}{2k}; \\qquad \\frac{1}{c} = \\frac{1}{c_0} + kt,\\ t_{1/2} = \\frac{1}{k c_0}',
          lesson: '/chemistry/reactions/kinetics',
        },
        {
          name: 'Уравнение на Арениус',
          formula: 'k = A e^{-\\frac{E_a}{RT}}, \\qquad \\ln\\frac{k_2}{k_1} = \\frac{E_a}{R}\\left(\\frac{1}{T_1} - \\frac{1}{T_2}\\right)',
          lesson: '/chemistry/reactions/kinetics',
        },
      ],
    },
    {
      id: 'equilibrium',
      title: 'Химично равновесие',
      formulas: [
        {
          name: 'Условие за равновесие',
          formula: 'v_{\\to} = v_{\\leftarrow}',
          lesson: '/chemistry/reactions/equilibrium',
        },
        {
          name: 'Константа на равновесие (закон за действие на масите)',
          formula: 'a\\mathrm{A} + b\\mathrm{B} \\rightleftharpoons c\\mathrm{C} + d\\mathrm{D}: \\qquad K_c = \\frac{[\\mathrm{C}]^c [\\mathrm{D}]^d}{[\\mathrm{A}]^a [\\mathrm{B}]^b}',
          note: 'Твърди вещества и чисти течности не влизат в израза; K зависи само от температурата.',
          lesson: '/chemistry/reactions/equilibrium',
        },
        {
          name: 'Обърнато и умножено уравнение',
          formula: "K_{\\text{обр}} = \\frac{1}{K}, \\qquad K' = K^n \\ \\text{(уравнението, умножено по } n\\text{)}",
          lesson: '/chemistry/reactions/equilibrium',
        },
        {
          name: 'Посока на реакцията',
          formula: 'Q < K \\Rightarrow \\text{надясно}, \\qquad Q > K \\Rightarrow \\text{наляво}, \\qquad Q = K \\Rightarrow \\text{равновесие}',
          note: '$Q$ се смята по израза за $K$ с текущите концентрации.',
          lesson: '/chemistry/reactions/equilibrium',
        },
        {
          name: 'Връзка между Kp и Kc',
          formula: 'K_p = K_c (RT)^{\\Delta n}, \\qquad R = 0{,}08314\\ \\mathrm{L \\cdot bar/(mol \\cdot K)}',
          note: '$\\Delta n$ – промяната на броя молове газ по уравнението.',
          lesson: '/chemistry/reactions/equilibrium',
        },
        {
          name: 'Уравнение на Вант Хоф',
          formula: '\\ln\\frac{K_2}{K_1} = -\\frac{\\Delta H}{R}\\left(\\frac{1}{T_2} - \\frac{1}{T_1}\\right)',
          lesson: '/chemistry/reactions/equilibrium',
        },
        {
          name: 'Произведение на разтворимостта',
          formula: '\\mathrm{AgCl(тв) \\rightleftharpoons Ag^+ + Cl^-}: \\qquad K_{sp} = [\\mathrm{Ag^+}][\\mathrm{Cl^-}], \\qquad s = \\sqrt{K_{sp}}',
          lesson: '/chemistry/reactions/equilibrium',
        },
      ],
    },
    {
      id: 'acids-bases',
      title: 'Киселини, основи и pH',
      formulas: [
        {
          name: 'Йонно произведение на водата',
          formula: 'K_w = [\\mathrm{H^+}][\\mathrm{OH^-}] = 1{,}0 \\cdot 10^{-14}\\ \\text{(25 °C)}',
          lesson: '/chemistry/reactions/acids-bases',
        },
        {
          name: 'pH и pOH',
          formula: '\\mathrm{pH} = -\\lg[\\mathrm{H^+}], \\qquad \\mathrm{pOH} = -\\lg[\\mathrm{OH^-}], \\qquad \\mathrm{pH} + \\mathrm{pOH} = 14',
          note: 'Сумата 14 важи при 25 °C.',
          lesson: '/chemistry/reactions/acids-bases',
        },
        {
          name: 'Константа на дисоциация на киселина',
          formula: 'K_a = \\frac{[\\mathrm{H^+}][\\mathrm{A^-}]}{[\\mathrm{HA}]}, \\qquad \\mathrm{p}K_a = -\\lg K_a',
          lesson: '/chemistry/reactions/acids-bases',
        },
        {
          name: 'Закон за разреждането на Оствалд',
          formula: '\\alpha \\approx \\sqrt{\\frac{K_a}{c}}, \\qquad [\\mathrm{H^+}] \\approx \\sqrt{K_a c}',
          note: 'За слаба киселина, когато $\\alpha$ е под около 5%.',
          lesson: '/chemistry/reactions/acids-bases',
        },
        {
          name: 'Спрегната двойка',
          formula: 'K_a \\cdot K_b = K_w, \\qquad \\mathrm{p}K_a + \\mathrm{p}K_b = 14',
          lesson: '/chemistry/reactions/acids-bases',
        },
        {
          name: 'Еквивалентна точка при титруване',
          formula: 'c_a V_a = c_b V_b',
          note: 'За едноосновна киселина и едновалентна основа.',
          lesson: '/chemistry/reactions/acids-bases',
        },
        {
          name: 'Уравнение на Хендерсън–Хаселбалх',
          formula: '\\mathrm{pH} = \\mathrm{p}K_a + \\lg\\frac{[\\mathrm{A^-}]}{[\\mathrm{HA}]}',
          note: 'pH на буферен разтвор; буферът действа в интервала $\\mathrm{p}K_a \\pm 1$.',
          lesson: '/chemistry/reactions/acids-bases',
        },
      ],
    },
    {
      id: 'redox',
      title: 'Окисление-редукция и електрохимия',
      formulas: [
        {
          name: 'Сбор на степените на окисление',
          formula: '\\sum_i n_i\\, x_i = q',
          note: '$q$ е зарядът на частицата (0 за молекула), $n_i$ – броят на атомите със степен $x_i$.',
          lesson: '/chemistry/reactions/redox',
        },
        {
          name: 'Електронен баланс',
          formula: 'k_{\\text{ред}}\\, e_{\\text{отд}} = k_{\\text{ок}}\\, e_{\\text{пр}} = \\text{НОК}(e_{\\text{отд}}, e_{\\text{пр}})',
          note: 'Отдадените електрони са равни на приетите.',
          lesson: '/chemistry/reactions/redox',
        },
        {
          name: 'Напрежение на галваничен елемент',
          formula: 'E^\\circ = E^\\circ_{\\text{катод}} - E^\\circ_{\\text{анод}}',
          note: 'Анодът е металът с по-отрицателен стандартен потенциал; напр. за елемента на Даниел $0{,}34 - (-0{,}76) = 1{,}10\\ \\mathrm{V}$.',
          lesson: '/chemistry/reactions/redox',
        },
        {
          name: 'Уравнение на Нернст (25 °C)',
          formula: 'E = E^\\circ - \\frac{0{,}0592}{n}\\lg Q',
          lesson: '/chemistry/reactions/redox',
        },
        {
          name: 'Енергия на Гибс и напрежение',
          formula: '\\Delta G^\\circ = -nFE^\\circ',
          lesson: '/chemistry/reactions/redox',
        },
        {
          name: 'Закон на Фарадей за електролизата',
          formula: 'm = \\frac{M\\,I\\,t}{z\\,F}, \\qquad Q = It, \\qquad n(e^-) = \\frac{Q}{F}',
          note: '$z$ – броят на електроните за една частица.',
          lesson: '/chemistry/reactions/redox',
        },
        {
          name: 'Константа на Фарадей',
          formula: 'F = N_A\\, e \\approx 96\\,485\\ \\mathrm{C/mol}',
          lesson: '/chemistry/reactions/redox',
        },
      ],
    },
    {
      id: 'metals',
      title: 'Метали',
      formulas: [
        {
          name: 'Метал с киселина',
          formula: '\\mathrm{M + nH^+ \\to M^{n+}} + \\tfrac{n}{2}\\mathrm{H_2}, \\qquad n(\\mathrm{H_2}) = \\frac{n}{2}\\, n(\\mathrm{M})',
          note: 'Само за металите преди водорода в реда на активност; $n$ е степента на окисление на метала в солта.',
          lesson: '/chemistry/inorganic/metals',
        },
        {
          name: 'Активен метал с вода',
          formula: '\\mathrm{2M + 2H_2O \\to 2MOH + H_2}, \\qquad \\mathrm{M + 2H_2O \\to M(OH)_2 + H_2}',
          note: 'Алкалните метали и Ca, Sr, Ba при стайна температура.',
          lesson: '/chemistry/inorganic/metals',
        },
        {
          name: 'Изместване на метал от сол',
          formula: '\\mathrm{Fe + CuSO_4 \\to FeSO_4 + Cu}, \\qquad \\Delta m = n\\,(M_{\\text{отложен}} - M_{\\text{разтворен}})',
          note: 'Промяната на масата на пластинката, ако металите са с еднаква степен на окисление.',
          lesson: '/chemistry/inorganic/metals',
        },
        {
          name: 'Метал от руда',
          formula: 'm(\\text{метал}) = m(\\text{руда}) \\cdot w(\\text{минерал}) \\cdot w(\\text{метал в минерала}) \\cdot \\eta',
          lesson: '/chemistry/inorganic/metals',
        },
        {
          name: 'Доменна пещ',
          formula: '\\mathrm{C + O_2 \\to CO_2}, \\quad \\mathrm{CO_2 + C \\to 2CO}, \\quad \\mathrm{Fe_2O_3 + 3CO \\to 2Fe + 3CO_2}',
          lesson: '/chemistry/inorganic/metals',
        },
        {
          name: 'Амфотерност на алуминия',
          formula: '\\mathrm{2Al + 2NaOH + 6H_2O \\to 2Na[Al(OH)_4] + 3H_2}',
          lesson: '/chemistry/inorganic/metals',
        },
        {
          name: 'Алуминотермия',
          formula: '\\mathrm{Fe_2O_3 + 2Al \\to Al_2O_3 + 2Fe}',
          lesson: '/chemistry/inorganic/metals',
        },
      ],
    },
    {
      id: 'nonmetals',
      title: 'Неметали',
      formulas: [
        {
          name: 'Ред на активност на халогените',
          formula: '\\mathrm{F_2 > Cl_2 > Br_2 > I_2}, \\qquad \\mathrm{Cl_2 + 2Br^- \\to 2Cl^- + Br_2}',
          note: 'По-активният халоген измества по-слабия от разтворите на солите му.',
          lesson: '/chemistry/inorganic/nonmetals',
        },
        {
          name: 'Контактен метод (сярна киселина)',
          formula: '\\mathrm{S \\xrightarrow{O_2} SO_2 \\xrightarrow{O_2,\\ V_2O_5} SO_3 \\xrightarrow{H_2SO_4,\\ H_2O} H_2SO_4}',
          note: '$\\mathrm{2SO_2 + O_2 \\rightleftharpoons 2SO_3}$ при около 450 °C; от 32 t сяра теоретично – 98 t киселина.',
          lesson: '/chemistry/inorganic/nonmetals',
        },
        {
          name: 'Метод на Оствалд (азотна киселина)',
          formula: '\\mathrm{NH_3 \\xrightarrow{O_2,\\ Pt} NO \\xrightarrow{O_2} NO_2 \\xrightarrow{O_2,\\ H_2O} HNO_3}',
          note: '$\\mathrm{4NH_3 + 5O_2 \\to 4NO + 6H_2O}$; от мол $\\mathrm{NH_3}$ теоретично – мол $\\mathrm{HNO_3}$.',
          lesson: '/chemistry/inorganic/nonmetals',
        },
        {
          name: 'Общ добив на многоетапен процес',
          formula: '\\eta = \\eta_1 \\cdot \\eta_2 \\cdot \\eta_3 \\cdots',
          lesson: '/chemistry/inorganic/nonmetals',
        },
        {
          name: 'Събиране на газ',
          formula: 'M > 29\\ \\mathrm{g/mol}:\\ \\text{съд с отвора нагоре}, \\qquad M < 29\\ \\mathrm{g/mol}:\\ \\text{обърнат съд}',
          note: 'Над вода се събират само слабо разтворимите газове ($\\mathrm{H_2}$, $\\mathrm{O_2}$, $\\mathrm{N_2}$).',
          lesson: '/chemistry/inorganic/nonmetals',
        },
        {
          name: 'Получаване на озон',
          formula: '\\mathrm{3O_2 \\to 2O_3}, \\qquad \\Delta V = -\\tfrac{1}{2} V(\\mathrm{O_3})',
          note: 'При еднакви условия обемът намалява с половината от обема на образувания озон.',
          lesson: '/chemistry/inorganic/nonmetals',
        },
      ],
    },
    {
      id: 'compound-classes',
      title: 'Класове неорганични съединения',
      formulas: [
        {
          name: 'Неутрализация',
          formula: '\\text{основа} + \\text{киселина} \\to \\text{сол} + \\mathrm{H_2O}',
          note: 'Например $\\mathrm{NaOH + HCl \\to NaCl + H_2O}$.',
          lesson: '/chemistry/inorganic/compound-classes',
        },
        {
          name: 'Оксиди и вода',
          formula: '\\text{основен оксид} + \\mathrm{H_2O} \\to \\text{основа}, \\qquad \\text{киселинен оксид} + \\mathrm{H_2O} \\to \\text{киселина}',
          note: 'С вода реагират само оксидите на алкалните и алкалоземните метали; $\\mathrm{SiO_2}$ не реагира с вода.',
          lesson: '/chemistry/inorganic/compound-classes',
        },
        {
          name: 'Оксиди с киселини и основи',
          formula: '\\text{основен оксид} + \\text{киселина} \\to \\text{сол} + \\mathrm{H_2O}, \\qquad \\text{киселинен оксид} + \\text{основа} \\to \\text{сол} + \\mathrm{H_2O}',
          lesson: '/chemistry/inorganic/compound-classes',
        },
        {
          name: 'Формула на сол',
          formula: '\\mathrm{M}_a\\mathrm{A}_b: \\quad a \\cdot z(\\mathrm{M}) = b \\cdot |z(\\mathrm{A})|',
          note: 'Сборът от зарядите на катионите и анионите е нула, например $\\mathrm{Fe_2(SO_4)_3}$: $2 \\cdot 3 = 3 \\cdot 2$.',
          lesson: '/chemistry/inorganic/compound-classes',
        },
        {
          name: 'Генетична връзка',
          formula: '\\text{метал} \\to \\text{осн. оксид} \\to \\text{основа} \\to \\text{сол} \\leftarrow \\text{киселина} \\leftarrow \\text{кис. оксид} \\leftarrow \\text{неметал}',
          lesson: '/chemistry/inorganic/compound-classes',
        },
      ],
    },
    {
      id: 'qualitative-analysis',
      title: 'Йонни реакции и качествен анализ',
      formulas: [
        {
          name: 'Концентрация на йон при пълна дисоциация',
          formula: '\\mathrm{M_aX_b \\to aM^{n+} + bX^{m-}}, \\qquad c(\\mathrm{M^{n+}}) = a\\,c, \\quad c(\\mathrm{X^{m-}}) = b\\,c',
          note: 'За силни електролити; $c$ е концентрацията на солта. Проверка: $a \\cdot n = b \\cdot m$.',
          lesson: '/chemistry/inorganic/qualitative-analysis',
        },
        {
          name: 'Маса на утайка',
          formula: 'n = c \\cdot V, \\qquad m_{\\text{утайка}} = n_{\\text{утайка}} \\cdot M_{\\text{утайка}}',
          note: 'Количеството утайка се определя от йона в недостиг според съкратеното йонно уравнение.',
          lesson: '/chemistry/inorganic/qualitative-analysis',
        },
        {
          name: 'Гравиметрично пресмятане',
          formula: 'm(\\mathrm{X}) = m_{\\text{утайка}} \\cdot \\frac{k \\cdot M(\\mathrm{X})}{M_{\\text{утайка}}}',
          note: '$k$ – броят атоми (йони) X във формулата на утайката, например $m(\\mathrm{S}) = m(\\mathrm{BaSO_4}) \\cdot \\frac{32}{233}$.',
          lesson: '/chemistry/inorganic/qualitative-analysis',
        },
        {
          name: 'Йон от два разтвора след смесване',
          formula: 'c = \\frac{c_1 V_1 + c_2 V_2}{V_1 + V_2}',
          note: 'Когато йонът не участва в реакция; $c_1, c_2$ са концентрациите на самия йон в двата разтвора.',
          lesson: '/chemistry/inorganic/qualitative-analysis',
        },
        {
          name: 'Условие за образуване на утайка',
          formula: '[\\mathrm{M}]^a [\\mathrm{X}]^b > K_{sp}\\ \\ (\\mathrm{M_aX_b})',
          lesson: '/chemistry/inorganic/qualitative-analysis',
        },
      ],
    },
    {
      id: 'hydrocarbons',
      title: 'Въглеводороди',
      formulas: [
        {
          name: 'Общи формули на хомоложните редове',
          formula: '\\text{алкани } \\mathrm{C}_n\\mathrm{H}_{2n+2}, \\quad \\text{алкени, циклоалкани } \\mathrm{C}_n\\mathrm{H}_{2n}, \\quad \\text{алкини } \\mathrm{C}_n\\mathrm{H}_{2n-2}',
          lesson: '/chemistry/organic/hydrocarbons',
        },
        {
          name: 'Моларна маса на алкан',
          formula: 'M(\\mathrm{C}_n\\mathrm{H}_{2n+2}) = 14n + 2',
          note: 'Хомоложната разлика $\\mathrm{CH_2}$ е $14\\ \\mathrm{g/mol}$; за алкените $M = 14n$, за алкините $M = 14n - 2$.',
          lesson: '/chemistry/organic/hydrocarbons',
        },
        {
          name: 'Пълно изгаряне на въглеводород',
          formula: '\\mathrm{C}_x\\mathrm{H}_y + \\left(x + \\frac{y}{4}\\right)\\mathrm{O_2} \\to x\\,\\mathrm{CO_2} + \\frac{y}{2}\\,\\mathrm{H_2O}',
          lesson: '/chemistry/organic/hydrocarbons',
        },
        {
          name: 'Степен на ненаситеност',
          formula: '\\text{пръстени} + \\pi\\text{-връзки} = \\frac{2x + 2 - y}{2} \\quad (\\mathrm{C}_x\\mathrm{H}_y)',
          lesson: '/chemistry/organic/hydrocarbons',
        },
        {
          name: 'Хибридизация на въглерода',
          formula: 'sp^3:\\ 109{,}5^\\circ, \\qquad sp^2:\\ 120^\\circ, \\qquad sp:\\ 180^\\circ',
          note: 'Дължини на връзките C–C: 154 pm, C=C: 134 pm, C≡C: 120 pm, в бензена – 139 pm.',
          lesson: '/chemistry/organic/hydrocarbons',
        },
      ],
    },
    {
      id: 'functional-groups',
      title: 'Функционални групи',
      formulas: [
        {
          name: 'Наситени едновалентни алкохоли',
          formula: '\\mathrm{C_nH_{2n+1}OH}, \\qquad M = 14n + 18',
          lesson: '/chemistry/organic/functional-groups',
        },
        {
          name: 'Наситени алдехиди и кетони',
          formula: '\\mathrm{C_nH_{2n}O}, \\qquad M = 14n + 16',
          lesson: '/chemistry/organic/functional-groups',
        },
        {
          name: 'Наситени едноосновни карбоксилни киселини',
          formula: '\\mathrm{C_nH_{2n+1}COOH} = \\mathrm{C_{n+1}H_{2n+2}O_2}',
          note: 'Естерите със същия брой въглеродни атоми са техни изомери.',
          lesson: '/chemistry/organic/functional-groups',
        },
        {
          name: 'Естерификация',
          formula: '\\mathrm{RCOOH} + \\mathrm{R\'OH} \\rightleftharpoons \\mathrm{RCOOR\'} + \\mathrm{H_2O}, \\qquad K = \\frac{[\\mathrm{RCOOR\'}][\\mathrm{H_2O}]}{[\\mathrm{RCOOH}][\\mathrm{R\'OH}]} \\approx 4',
          note: 'Стойността $K \\approx 4$ е за етилов етаноат; при 1 mol киселина и 1 mol алкохол в равновесие се получават около 2/3 mol естер.',
          lesson: '/chemistry/organic/functional-groups',
        },
        {
          name: 'Окисление на алкохолите',
          formula: '\\mathrm{RCH_2OH} \\to \\mathrm{RCHO} \\to \\mathrm{RCOOH}, \\qquad \\mathrm{R_2CHOH} \\to \\mathrm{R_2CO}',
          note: 'Първичните алкохоли дават алдехиди и киселини, вторичните – кетони, третичните не се окисляват.',
          lesson: '/chemistry/organic/functional-groups',
        },
        {
          name: 'Реакция на сребърното огледало (опростено)',
          formula: '\\mathrm{RCHO} + \\mathrm{Ag_2O} \\to \\mathrm{RCOOH} + 2\\mathrm{Ag}\\downarrow, \\qquad n(\\mathrm{Ag}) = 2n(\\mathrm{RCHO})',
          note: 'Метаналът дава 4 mol сребро на мол, защото се окислява до $\\mathrm{CO_2}$.',
          lesson: '/chemistry/organic/functional-groups',
        },
        {
          name: 'Водород от алкохол и натрий',
          formula: '\\mathrm{2ROH} + \\mathrm{2Na} \\to \\mathrm{2RONa} + \\mathrm{H_2}, \\qquad n(\\mathrm{H_2}) = \\tfrac{1}{2}\\, n(\\mathrm{OH})',
          lesson: '/chemistry/organic/functional-groups',
        },
      ],
    },
    {
      id: 'mechanisms',
      title: 'Механизми на органичните реакции',
      formulas: [
        {
          name: 'Дял на продукта при радикалово халогениране',
          formula: 'x_i = \\frac{n_i r_i}{\\sum_j n_j r_j}',
          note: '$n_i$ – брой еквивалентни H, $r_i$ – относителна реактивност; при хлориране $r_{\\text{перв}} : r_{\\text{втор}} : r_{\\text{трет}} \\approx 1 : 4 : 5$, при бромиране – около $1 : 80 : 1600$.',
          lesson: '/chemistry/organic/mechanisms',
        },
        {
          name: 'Кинетично уравнение на SN2 и E2',
          formula: 'v = k[\\mathrm{RX}][\\mathrm{Nu^-}]',
          note: 'Една стъпка, реакция от втори порядък; при SN2 конфигурацията се обръща.',
          lesson: '/chemistry/organic/mechanisms',
        },
        {
          name: 'Кинетично уравнение на SN1 и E1',
          formula: 'v = k[\\mathrm{RX}], \\qquad t_{1/2} = \\frac{\\ln 2}{k}',
          note: 'Бавната стъпка е йонизацията до карбокатион – нуклеофилът не влиза в уравнението.',
          lesson: '/chemistry/organic/mechanisms',
        },
        {
          name: 'Стабилност на карбокатионите и радикалите',
          formula: '\\text{третичен} > \\text{вторичен} > \\text{първичен} > \\text{метилов}',
          lesson: '/chemistry/organic/mechanisms',
        },
        {
          name: 'Енергия на фотон, разкъсващ връзка',
          formula: '\\lambda_{\\max} = \\frac{h c N_A}{E_{\\text{връзка}}}',
          note: 'За Cl–Cl ($242\\ \\mathrm{kJ/mol}$) – около $494\\ \\mathrm{nm}$.',
          lesson: '/chemistry/organic/mechanisms',
        },
      ],
    },
    {
      id: 'polymers',
      title: 'Полимери',
      formulas: [
        {
          name: 'Степен на полимеризация',
          formula: 'n = \\frac{M(\\text{полимер})}{M(\\text{звено})}',
          lesson: '/chemistry/organic/polymers',
        },
        {
          name: 'Присъединителна полимеризация',
          formula: 'n\\,\\mathrm{CH_2{=}CHX} \\to [\\mathrm{-CH_2{-}CHX-}]_n',
          note: 'Звеното има състава и моларната маса на мономера.',
          lesson: '/chemistry/organic/polymers',
        },
        {
          name: 'Поликондензация (два мономера)',
          formula: 'n\\,\\mathrm{A} + n\\,\\mathrm{B} \\to \\mathrm{H{-}[AB]_n{-}OH} + (2n - 1)\\,\\mathrm{H_2O}',
          note: 'Звеното е с $2\\,\\mathrm{H_2O}$ по-леко от сбора на двата мономера, напр. PET: $166 + 62 - 36 = 192\\ \\mathrm{g/mol}$.',
          lesson: '/chemistry/organic/polymers',
        },
        {
          name: 'Среднобройна моларна маса',
          formula: 'M_n = \\frac{\\sum n_i M_i}{\\sum n_i}',
          lesson: '/chemistry/organic/polymers',
        },
        {
          name: 'Средномасова моларна маса',
          formula: 'M_w = \\frac{\\sum n_i M_i^2}{\\sum n_i M_i}',
          lesson: '/chemistry/organic/polymers',
        },
        {
          name: 'Дисперсност',
          formula: '\\text{Đ} = \\frac{M_w}{M_n} \\ge 1',
          note: 'При еднакво дълги вериги $\\text{Đ} = 1$.',
          lesson: '/chemistry/organic/polymers',
        },
      ],
    },
    {
      id: 'biomolecules',
      title: 'Химия на живота',
      formulas: [
        {
          name: 'Фотосинтеза',
          formula: '\\mathrm{6CO_2 + 6H_2O \\xrightarrow{h\\nu} C_6H_{12}O_6 + 6O_2}, \\qquad \\Delta H \\approx +2800\\ \\mathrm{kJ/mol}',
          note: 'Дишането в клетките е обратният процес.',
          lesson: '/chemistry/organic/biomolecules',
        },
        {
          name: 'Алкохолна ферментация',
          formula: '\\mathrm{C_6H_{12}O_6 \\to 2C_2H_5OH + 2CO_2}',
          lesson: '/chemistry/organic/biomolecules',
        },
        {
          name: 'Хидролиза на нишесте',
          formula: '\\mathrm{(C_6H_{10}O_5)_n + nH_2O \\to nC_6H_{12}O_6}',
          lesson: '/chemistry/organic/biomolecules',
        },
        {
          name: 'Осапуняване на мазнина',
          formula: '\\text{мазнина} + 3\\mathrm{NaOH} \\to \\text{глицерол} + 3\\,\\mathrm{RCOONa}',
          lesson: '/chemistry/organic/biomolecules',
        },
        {
          name: 'Моларна маса на пептид',
          formula: 'M = \\sum_{i=1}^{n} M_i - (n - 1) \\cdot 18',
          note: 'При всяка от $n - 1$ пептидни връзки се отделя молекула вода.',
          lesson: '/chemistry/organic/biomolecules',
        },
        {
          name: 'Правило на Чаргаф',
          formula: '\\%\\mathrm{A} = \\%\\mathrm{T}, \\qquad \\%\\mathrm{G} = \\%\\mathrm{C}, \\qquad \\%\\mathrm{A} + \\%\\mathrm{G} = 50\\%',
          note: 'За двойноверижна ДНК; A–T има две, а G–C – три водородни връзки.',
          lesson: '/chemistry/organic/biomolecules',
        },
        {
          name: 'Енергийна стойност на храна',
          formula: 'E = 17\\,m_{\\text{въгл}} + 37\\,m_{\\text{мазн}} + 17\\,m_{\\text{белт}}\\ \\ (\\mathrm{kJ},\\ m\\ \\text{в грамове})',
          note: 'В kcal коефициентите са 4, 9 и 4.',
          lesson: '/chemistry/organic/biomolecules',
        },
      ],
    },
    {
      id: 'nuclear-chem',
      title: 'Ядрена химия',
      formulas: [
        {
          name: 'Изравняване на ядрено уравнение',
          formula: '\\sum A_{\\text{вляво}} = \\sum A_{\\text{вдясно}}, \\qquad \\sum Z_{\\text{вляво}} = \\sum Z_{\\text{вдясно}}',
          note: 'Елементът на неизвестното ядро се познава по $Z$.',
          lesson: '/chemistry/world/nuclear',
        },
        {
          name: 'β⁺-разпадане и електронно захващане',
          formula: '{}^{A}_{Z}\\mathrm{X} \\to {}^{A}_{Z-1}\\mathrm{Y} + {}^{\\ \\,0}_{+1}e + \\nu_e, \\qquad {}^{A}_{Z}\\mathrm{X} + {}^{\\ \\,0}_{-1}e \\to {}^{A}_{Z-1}\\mathrm{Y} + \\nu_e',
          lesson: '/chemistry/world/nuclear',
        },
        {
          name: 'Брой разпадания в радиоактивен ред',
          formula: 'x_{\\alpha} = \\frac{A_1 - A_2}{4}, \\qquad y_{\\beta^-} = Z_2 - Z_1 + 2x_{\\alpha}',
          lesson: '/chemistry/world/nuclear',
        },
        {
          name: 'Активност на дадена маса',
          formula: 'A = \\frac{\\ln 2}{T_{1/2}} \\cdot \\frac{m}{M} \\cdot N_A',
          note: '$T_{1/2}$ в секунди, $M$ ≈ масовото число в g/mol.',
          lesson: '/chemistry/world/nuclear',
        },
        {
          name: 'Възраст по разпадането (¹⁴C)',
          formula: 't = T_{1/2} \\cdot \\log_2 \\frac{N_0}{N}',
          note: 'За въглерод-14 $T_{1/2} = 5730$ години; методът е приложим до около 50 000 години.',
          lesson: '/chemistry/world/nuclear',
        },
        {
          name: 'Калий-аргоново датиране',
          formula: 't = T_{1/2} \\cdot \\log_2\\left(1 + \\frac{{}^{40}\\mathrm{Ar}/{}^{40}\\mathrm{K}}{0{,}107}\\right)',
          note: '$T_{1/2}({}^{40}\\mathrm{K}) = 1{,}25 \\cdot 10^9$ години; около 10,7% от разпаданията дават ⁴⁰Ar.',
          lesson: '/chemistry/world/nuclear',
        },
      ],
    },
    {
      id: 'environment-chem',
      title: 'Химия на околната среда',
      formulas: [
        {
          name: 'CO₂ от изгаряне на въглерод и метан',
          formula: 'm(\\mathrm{CO_2}) = \\frac{44}{12}\\, m(\\mathrm{C}), \\qquad m(\\mathrm{CO_2}) = \\frac{44}{16}\\, m(\\mathrm{CH_4})',
          lesson: '/chemistry/world/environment',
        },
        {
          name: 'ppm на CO₂ в атмосферата',
          formula: '1\\ \\mathrm{ppm\\ CO_2} \\approx 2{,}13\\ \\mathrm{Gt\\ C} \\approx 7{,}8\\ \\mathrm{Gt\\ CO_2}',
          note: 'Около половината от изхвърления $\\mathrm{CO_2}$ се поема от океаните и растенията.',
          lesson: '/chemistry/world/environment',
        },
        {
          name: 'Каталитично разрушаване на озона',
          formula: '\\mathrm{Cl + O_3 \\to ClO + O_2}, \\qquad \\mathrm{ClO + O \\to Cl + O_2}',
          note: 'Сумарно $\\mathrm{O_3 + O \\to 2O_2}$; хлорният атом е катализатор.',
          lesson: '/chemistry/world/environment',
        },
        {
          name: 'Кисел дъжд',
          formula: '\\mathrm{2SO_2 + O_2 \\to 2SO_3}, \\qquad \\mathrm{SO_3 + H_2O \\to H_2SO_4}',
          note: 'Чистият дъжд е с pH около 5,6 заради разтворения $\\mathrm{CO_2}$; кисел дъжд – под 5,6.',
          lesson: '/chemistry/world/environment',
        },
        {
          name: 'Временна твърдост на водата',
          formula: '\\mathrm{Ca(HCO_3)_2 \\xrightarrow{t} CaCO_3 \\downarrow + H_2O + CO_2 \\uparrow}',
          lesson: '/chemistry/world/environment',
        },
        {
          name: 'Атомна икономия',
          formula: '\\text{АИ} = \\frac{M(\\text{желан продукт}) \\cdot k}{\\sum k_i\\, M(\\text{реагент}_i)} \\cdot 100\\%',
          note: 'При присъединителните реакции АИ = 100%.',
          lesson: '/chemistry/world/environment',
        },
      ],
    },
    {
      id: 'spectroscopy',
      title: 'Спектроскопия и анализ',
      formulas: [
        {
          name: 'Пропускане и абсорбция',
          formula: 'T = \\frac{I}{I_0}, \\qquad A = \\lg \\frac{I_0}{I} = -\\lg T',
          note: '$A = 1$ – минава 10% от светлината, $A = 2$ – 1%.',
          lesson: '/chemistry/world/spectroscopy',
        },
        {
          name: 'Закон на Бер–Ламберт',
          formula: 'A = \\varepsilon l c',
          note: '$\\varepsilon$ – моларен коефициент на поглъщане, L/(mol·cm); $l$ – дължина на кюветата, cm; $c$ – mol/L. Важи за разредени разтвори.',
          lesson: '/chemistry/world/spectroscopy',
        },
        {
          name: 'Смес от поглъщащи вещества',
          formula: 'A = l\\,(\\varepsilon_1 c_1 + \\varepsilon_2 c_2 + \\ldots)',
          note: 'Абсорбциите на компонентите се събират; при две вещества се мери при две дължини на вълната.',
          lesson: '/chemistry/world/spectroscopy',
        },
        {
          name: 'Вълново число',
          formula: '\\tilde{\\nu} = \\frac{1}{\\lambda}, \\qquad \\tilde{\\nu}\\,[\\mathrm{cm^{-1}}] = \\frac{10^4}{\\lambda\\,[\\mathrm{\\mu m}]}',
          lesson: '/chemistry/world/spectroscopy',
        },
        {
          name: 'Изотопни пикове в масспектъра',
          formula: '\\text{1 Cl: } M : (M{+}2) \\approx 3 : 1, \\quad \\text{1 Br: } \\approx 1 : 1, \\quad \\text{2 Cl: } 9 : 6 : 1',
          note: 'Пикът M+1 е около 1,1% от M за всеки въглероден атом (изотопът ¹³C).',
          lesson: '/chemistry/world/spectroscopy',
        },
        {
          name: 'Правило n + 1 в ¹H ЯМР',
          formula: '\\text{брой линии} = n + 1',
          note: '$n$ – брой еквивалентни водородни атоми при съседния въглероден атом; височините на линиите са като в триъгълника на Паскал.',
          lesson: '/chemistry/world/spectroscopy',
        },
      ],
    },
  ],
};

export const BIOLOGY: Section = {
  id: 'biology',
  title: 'Биология',
  groups: [
    {
      id: 'microscope',
      title: 'Микроскоп',
      formulas: [
        {
          name: 'Общо увеличение',
          formula: 'M = M_{\\text{ок}} \\cdot M_{\\text{об}}',
          note: 'увеличенията на окуляра и обектива се умножават',
          lesson: '/biology/cell/life',
        },
        {
          name: 'Истински размер',
          formula: '\\text{размер} = \\frac{\\text{образ}}{M}',
          note: 'образът – размерът на снимката или рисунката, в същите единици',
          lesson: '/biology/cell/life',
        },
        {
          name: 'Увеличение по мащабна линийка',
          formula: 'M = \\frac{\\text{дължина на линийката на снимката}}{\\text{написаната дължина}}',
          lesson: '/biology/cell/life',
        },
        {
          name: 'Зрително поле',
          formula: 'D \\approx \\frac{\\text{полево число}}{M_{\\text{об}}}',
          note: 'полевото число е написано на окуляра, често 18 mm',
          lesson: '/biology/cell/life',
        },
        {
          name: 'Разделителна способност',
          formula: 'd \\approx \\frac{\\lambda}{2\\,\\mathrm{NA}}',
          note: 'NA – числова апертура на обектива; светлинният микроскоп различава до около 0,2 µm',
          lesson: '/biology/cell/life',
        },
        {
          name: 'Мерни единици',
          formula: '1\\ \\mathrm{mm} = 1000\\ \\mathrm{\\mu m}, \\qquad 1\\ \\mathrm{\\mu m} = 1000\\ \\mathrm{nm}',
          lesson: '/biology/cell/life',
        },
      ],
    },
    {
      id: 'cell-size',
      title: 'Размер на клетката',
      formulas: [
        {
          name: 'Повърхност към обем (куб)',
          formula: 'S = 6a^2, \\quad V = a^3, \\quad \\frac{S}{V} = \\frac{6}{a}',
          lesson: '/biology/cell/structure',
        },
        {
          name: 'Повърхност към обем (кълбо)',
          formula: '\\frac{S}{V} = \\frac{\\pi d^2}{\\pi d^3 / 6} = \\frac{6}{d}',
          lesson: '/biology/cell/structure',
        },
        {
          name: 'Мащабиране',
          formula: 'd \\to kd: \\quad S \\to k^2 S, \\quad V \\to k^3 V, \\quad \\frac{S}{V} \\to \\frac{1}{k}\\frac{S}{V}',
          lesson: '/biology/cell/structure',
        },
        {
          name: 'Време за дифузия',
          formula: 't \\approx \\frac{x^2}{2D}',
          note: 'D – коефициент на дифузия; за кислород във вода около 2·10⁻⁹ m²/s',
          lesson: '/biology/cell/structure',
        },
      ],
    },
    {
      id: 'membrane-transport',
      title: 'Мембрана и транспорт',
      formulas: [
        {
          name: 'Закон на Фик',
          formula: 'J \\sim \\frac{A \\cdot \\Delta c}{d}',
          note: 'A – площ, Δc – разлика в концентрациите, d – дебелина на мембраната',
          lesson: '/biology/cell/membrane',
        },
        {
          name: 'Осмоларитет',
          formula: 'c_{\\text{осм}} = i \\cdot c',
          note: 'i – на колко частици се разпада веществото: глюкоза 1, NaCl 2, CaCl₂ 3',
          lesson: '/biology/cell/membrane',
        },
        {
          name: 'Осмотично налягане (Вант Хоф)',
          formula: '\\pi = icRT',
          lesson: '/biology/cell/membrane',
        },
        {
          name: 'Воден потенциал',
          formula: '\\psi = \\psi_s + \\psi_p, \\qquad \\psi_s = -icRT',
          note: 'водата тече от по-високия към по-ниския воден потенциал',
          lesson: '/biology/cell/membrane',
        },
        {
          name: 'Промяна на масата',
          formula: '\\frac{m - m_0}{m_0} \\cdot 100\\%',
          lesson: '/biology/cell/membrane',
        },
        {
          name: 'Натриево-калиева помпа',
          formula: '3\\ \\mathrm{Na^+}\\ \\text{навън} + 2\\ \\mathrm{K^+}\\ \\text{навътре}\\ \\text{за}\\ 1\\ \\text{АТФ}',
          lesson: '/biology/cell/membrane',
        },
      ],
    },
    {
      id: 'cell-division',
      title: 'Клетъчно делене',
      formulas: [
        {
          name: 'Митотичен индекс',
          formula: '\\frac{\\text{клетки в митоза}}{\\text{всички клетки}} \\cdot 100\\%',
          lesson: '/biology/cell/division',
        },
        {
          name: 'Продължителност на фаза',
          formula: 't_{\\text{фаза}} \\approx \\frac{N_{\\text{фаза}}}{N} \\cdot T_{\\text{цикъл}}',
          note: 'когато клетките се делят несинхронно',
          lesson: '/biology/cell/division',
        },
        {
          name: 'Брой гамети от независимото разпределение',
          formula: '2^n',
          note: 'n – брой двойки хомоложни хромозоми; при човека 2²³ ≈ 8,4 милиона',
          lesson: '/biology/cell/division',
        },
        {
          name: 'Брой клетки след k деления',
          formula: 'N = 2^k',
          lesson: '/biology/cell/division',
        },
        {
          name: 'Хромозоми и ДНК',
          formula: '\\text{G1: } 2n, 2c;\\quad \\text{G2: } 2n, 4c;\\quad \\text{гамета: } n, c',
          lesson: '/biology/cell/division',
        },
      ],
    },
    {
      id: 'enzymes',
      title: 'Ензими и АТФ',
      formulas: [
        {
          name: 'Хидролиза на АТФ',
          formula: '\\text{АТФ} + \\mathrm{H_2O} \\to \\text{АДФ} + \\mathrm{P_i}, \\qquad \\Delta G^\\circ \\approx -30{,}5\\ \\mathrm{kJ/mol}',
          note: 'в клетката – около −50 kJ/mol',
          lesson: '/biology/energy/enzymes',
        },
        {
          name: 'Спрегнати реакции',
          formula: '\\Delta G_{\\text{общо}} = \\Delta G_1 + \\Delta G_2 < 0',
          note: 'неизгодна реакция протича, ако се свърже с хидролиза на АТФ',
          lesson: '/biology/energy/enzymes',
        },
        {
          name: 'Температурен коефициент',
          formula: 'Q_{10} = \\frac{v_{T+10}}{v_T}, \\qquad \\frac{v_2}{v_1} = Q_{10}^{(T_2 - T_1)/10}',
          note: 'за ензимите под оптимума обикновено 2–3',
          lesson: '/biology/energy/enzymes',
        },
        {
          name: 'Уравнение на Михаелис–Ментен',
          formula: 'v = \\frac{V_{\\max} [\\mathrm{S}]}{K_m + [\\mathrm{S}]}',
          note: 'при $[\\mathrm{S}] = K_m$ скоростта е $V_{\\max}/2$',
          lesson: '/biology/energy/enzymes',
        },
        {
          name: 'Двойно обратни координати (Лайнуийвър–Бърк)',
          formula: '\\frac{1}{v} = \\frac{K_m}{V_{\\max}} \\cdot \\frac{1}{[\\mathrm{S}]} + \\frac{1}{V_{\\max}}',
          note: 'пресечните точки с осите са $1/V_{\\max}$ и $-1/K_m$',
          lesson: '/biology/energy/enzymes',
        },
        {
          name: 'Конкурентен инхибитор',
          formula: "K_m' = K_m \\left(1 + \\frac{[\\mathrm{I}]}{K_i}\\right), \\qquad V_{\\max}' = V_{\\max}",
          lesson: '/biology/energy/enzymes',
        },
        {
          name: 'Неконкурентен инхибитор',
          formula: "V_{\\max}' = \\frac{V_{\\max}}{1 + [\\mathrm{I}]/K_i}, \\qquad K_m' = K_m",
          lesson: '/biology/energy/enzymes',
        },
      ],
    },
    {
      id: 'respiration',
      title: 'Клетъчно дишане',
      formulas: [
        {
          name: 'Аеробно дишане',
          formula: '\\mathrm{C_6H_{12}O_6 + 6O_2 \\to 6CO_2 + 6H_2O}, \\quad \\Delta G \\approx -2870\\ \\mathrm{kJ/mol}',
          lesson: '/biology/energy/respiration',
        },
        {
          name: 'Млечнокисела ферментация',
          formula: '\\mathrm{C_6H_{12}O_6 \\to 2C_3H_6O_3}',
          note: '2 АТФ на глюкоза; в мускулите и в млечнокиселите бактерии',
          lesson: '/biology/energy/respiration',
        },
        {
          name: 'Алкохолна ферментация',
          formula: '\\mathrm{C_6H_{12}O_6 \\to 2C_2H_5OH + 2CO_2}',
          note: '2 АТФ на глюкоза; в дрождите',
          lesson: '/biology/energy/respiration',
        },
        {
          name: 'Баланс на една глюкоза',
          formula: '\\text{гликолиза: } 2\\ \\text{АТФ}, 2\\ \\text{НАДН};\\ \\ \\text{пируват: } 2\\ \\text{НАДН}, 2\\ \\mathrm{CO_2};\\ \\ \\text{Кребс: } 2\\ \\text{АТФ}, 6\\ \\text{НАДН}, 2\\ \\text{ФАДН}_2, 4\\ \\mathrm{CO_2}',
          lesson: '/biology/energy/respiration',
        },
        {
          name: 'Добив на АТФ',
          formula: '4 + 10 \\cdot 2{,}5 + 2 \\cdot 1{,}5 = 32\\ \\text{АТФ на глюкоза}',
          note: 'НАДН ≈ 2,5 АТФ, ФАДН₂ ≈ 1,5 АТФ; 30 при совалка за НАДН от гликолизата; по-старите учебници – 36–38',
          lesson: '/biology/energy/respiration',
        },
        {
          name: 'Дихателен коефициент',
          formula: 'RQ = \\frac{V_{\\mathrm{CO_2}}}{V_{\\mathrm{O_2}}}',
          note: 'въглехидрати 1,0; белтъци ≈ 0,8–0,9; мазнини ≈ 0,7; над 1 – част от глюкозата ферментира',
          lesson: '/biology/energy/respiration',
        },
        {
          name: 'Респирометър',
          formula: 'V = \\pi r^2 x, \\qquad RQ = \\frac{x_1 - x_2}{x_1}',
          note: '$x_1$ – преместване на капката в тръбата с KOH (поет O₂), $x_2$ – в тръбата с вода (O₂ − CO₂)',
          lesson: '/biology/energy/respiration',
        },
        {
          name: 'Отношение P/O',
          formula: 'P/O = \\frac{n(\\text{АТФ})}{n(\\text{O атоми})}',
          note: 'около 2,5 за НАДН и 1,5 за ФАДН₂',
          lesson: '/biology/energy/respiration',
        },
      ],
    },
    {
      id: 'photosynthesis',
      title: 'Фотосинтеза',
      formulas: [
        {
          name: 'Общо уравнение',
          formula: '6\\,\\mathrm{CO_2} + 6\\,\\mathrm{H_2O} \\xrightarrow{\\text{светлина}} \\mathrm{C_6H_{12}O_6} + 6\\,\\mathrm{O_2}',
          note: 'по-точно $6\\,\\mathrm{CO_2} + 12\\,\\mathrm{H_2O} \\to \\mathrm{C_6H_{12}O_6} + 6\\,\\mathrm{O_2} + 6\\,\\mathrm{H_2O}$ – целият $\\mathrm{O_2}$ идва от водата',
          lesson: '/biology/energy/photosynthesis',
        },
        {
          name: 'Фотолиза на водата',
          formula: '2\\,\\mathrm{H_2O} \\to \\mathrm{O_2} + 4\\,\\mathrm{H^+} + 4e^-',
          note: 'във фотосистема II; най-малко 8 фотона на една $\\mathrm{O_2}$ (по 2 на електрон)',
          lesson: '/biology/energy/photosynthesis',
        },
        {
          name: 'Цикъл на Калвин – разход',
          formula: '1\\ \\mathrm{CO_2}:\\ 3\\ \\text{АТФ} + 2\\ \\text{НАДФН} \\qquad 1\\ \\text{глюкоза}:\\ 18\\ \\text{АТФ} + 12\\ \\text{НАДФН}',
          note: '3 завъртания на цикъла дават 1 G3P (3C)',
          lesson: '/biology/energy/photosynthesis',
        },
        {
          name: 'Фиксиране на CO₂',
          formula: '\\text{RuBP (5C)} + \\mathrm{CO_2} \\xrightarrow{\\text{РуБисКО}} 2\\ \\text{GP (3C)}',
          lesson: '/biology/energy/photosynthesis',
        },
        {
          name: 'Светлина и разстояние',
          formula: 'I \\propto \\frac{1}{d^2}',
          note: 'лампа на 2 пъти по-голямо разстояние дава 4 пъти по-слаба светлина',
          lesson: '/biology/energy/photosynthesis',
        },
        {
          name: 'Нетна фотосинтеза',
          formula: '\\text{нетна} = \\text{брутна} - \\text{дишане}',
          note: 'в точката на компенсация нетната е 0',
          lesson: '/biology/energy/photosynthesis',
        },
        {
          name: 'Rf на пигмент',
          formula: 'R_f = \\frac{\\text{път на петното}}{\\text{път на разтворителя}}',
          note: 'каротин > ксантофили > хлорофил a > хлорофил b',
          lesson: '/biology/energy/photosynthesis',
        },
      ],
    },
    {
      id: 'dna',
      title: 'ДНК и синтез на белтък',
      formulas: [
        {
          name: 'Правило на Чаргаф',
          formula: '\\%\\,\\text{А} = \\%\\,\\text{Т},\\quad \\%\\,\\text{Г} = \\%\\,\\text{Ц},\\quad \\%\\,\\text{А} + \\%\\,\\text{Г} = 50\\%',
          note: 'за двойноверижна ДНК, не за една верига',
          lesson: '/biology/genetics/dna',
        },
        {
          name: 'Водородни връзки между веригите',
          formula: 'H = 2\\,n_{\\text{А–Т}} + 3\\,n_{\\text{Г–Ц}}',
          lesson: '/biology/genetics/dna',
        },
        {
          name: 'Дължина на ДНК',
          formula: 'L = N \\cdot 0{,}34\\ \\mathrm{nm}, \\qquad \\text{навивки} \\approx \\frac{N}{10}',
          note: 'N – брой двойки бази',
          lesson: '/biology/genetics/dna',
        },
        {
          name: 'Брой кодони',
          formula: '4^3 = 64 = 61\\ \\text{смислови} + 3\\ \\text{стоп}',
          lesson: '/biology/genetics/dna',
        },
        {
          name: 'Нуклеотиди в кодиращата част на иРНК',
          formula: 'n_{\\text{нт}} = 3\\,(n_{\\text{ак}} + 1)',
          note: 'от стартовия кодон до стоп кодона включително; $n_{\\text{ак}}$ – брой аминокиселини',
          lesson: '/biology/genetics/dna',
        },
        {
          name: 'Опитът на Мезелсон и Стал',
          formula: '\\text{хибридни молекули: } \\frac{2}{2^g},\\qquad \\text{вериги с }^{15}\\mathrm{N}\\text{: } \\frac{1}{2^g}',
          note: 'g – брой поколения в ¹⁴N (g ≥ 1)',
          lesson: '/biology/genetics/dna',
        },
        {
          name: 'Време за репликация',
          formula: 't = \\frac{N}{2\\,v\\,k}',
          note: 'N – двойки бази, v – скорост на една вилка, k – брой начала (всяко с две вилки)',
          lesson: '/biology/genetics/dna',
        },
      ],
    },
    {
      id: 'mendel',
      title: 'Законите на Мендел',
      formulas: [
        {
          name: 'Монохибридно кръстосване, F₂',
          formula: 'Aa \\times Aa:\\quad AA : Aa : aa = 1 : 2 : 1,\\qquad A\\_ : aa = 3 : 1',
          note: 'при непълно доминиране и кодоминиране фенотиповете също са 1 : 2 : 1',
          lesson: '/biology/genetics/mendel',
        },
        {
          name: 'Анализиращо кръстосване',
          formula: 'Aa \\times aa:\\quad Aa : aa = 1 : 1',
          lesson: '/biology/genetics/mendel',
        },
        {
          name: 'Дихибридно кръстосване, F₂',
          formula: 'AaBb \\times AaBb:\\quad A\\_B\\_ : A\\_bb : aaB\\_ : aabb = 9 : 3 : 3 : 1',
          note: 'гените са в различни хромозоми; епистазата дава 9 : 3 : 4 или 9 : 7',
          lesson: '/biology/genetics/mendel',
        },
        {
          name: 'Гамети, генотипове и фенотипове при n хетерозиготни гена',
          formula: '2^n\\ \\text{гамети},\\qquad 3^n\\ \\text{генотипа и}\\ 2^n\\ \\text{фенотипа в F}_2',
          note: 'при пълно доминиране и гени в различни хромозоми',
          lesson: '/biology/genetics/mendel',
        },
        {
          name: 'Правило за умножение',
          formula: 'P(A\\_\\,bb) = P(A\\_) \\cdot P(bb) = \\tfrac{3}{4} \\cdot \\tfrac{1}{4} = \\tfrac{3}{16}',
          note: 'за независимо унаследявани гени',
          lesson: '/biology/genetics/mendel',
        },
        {
          name: 'Честота на рекомбинация',
          formula: 'RF = \\frac{\\text{рекомбинанти}}{\\text{всички потомци}} \\cdot 100\\%,\\qquad 1\\%\\ = 1\\ \\mathrm{cM}',
          note: 'при анализиращо кръстосване; RF ≤ 50%',
          lesson: '/biology/genetics/mendel',
        },
        {
          name: 'Интерференция',
          formula: 'I = 1 - \\frac{\\text{наблюдавани двойни кросинговъри}}{RF_1 \\cdot RF_2 \\cdot N}',
          note: 'дробта е коефициентът на съвпадение',
          lesson: '/biology/genetics/mendel',
        },
        {
          name: 'Тест хи-квадрат',
          formula: '\\chi^2 = \\sum \\frac{(O - E)^2}{E},\\qquad \\text{степени на свобода} = \\text{класове} - 1',
          note: 'критични стойности при 0,05: 3,84 (1), 5,99 (2), 7,81 (3), 9,49 (4)',
          lesson: '/biology/genetics/mendel',
        },
      ],
    },
    {
      id: 'human-genetics',
      title: 'Наследяване при човека',
      formulas: [
        {
          name: 'Двама носители на рецесивна болест',
          formula: 'Aa \\times Aa:\\quad P(aa) = \\tfrac{1}{4},\\quad P(Aa) = \\tfrac{1}{2}',
          note: 'за всяко дете поотделно, независимо от предишните деца',
          lesson: '/biology/genetics/human',
        },
        {
          name: 'Здрав брат или сестра на болен',
          formula: 'P(Aa \\mid \\text{здрав}) = \\tfrac{2}{3}',
          note: 'родителите са носители; случаят aa отпада',
          lesson: '/biology/genetics/human',
        },
        {
          name: 'Носителка на X-свързана рецесивна болест',
          formula: 'X^HX^h \\times X^HY:\\quad \\tfrac{1}{2}\\ \\text{от синовете болни},\\quad \\tfrac{1}{2}\\ \\text{от дъщерите носителки}',
          lesson: '/biology/genetics/human',
        },
        {
          name: 'Болен баща, X-свързана рецесивна болест',
          formula: 'X^HX^H \\times X^hY:\\quad \\text{всички дъщери носителки, всички синове здрави}',
          lesson: '/biology/genetics/human',
        },
        {
          name: 'Кръвни групи AB0',
          formula: '\\text{A: } I^AI^A, I^Ai;\\quad \\text{B: } I^BI^B, I^Bi;\\quad \\text{AB: } I^AI^B;\\quad \\text{0: } ii',
          note: 'IA и IB са кодоминантни, i е рецесивен',
          lesson: '/biology/genetics/human',
        },
        {
          name: 'Наследственост по Фалконър',
          formula: 'H^2 \\approx 2\\,(r_{\\text{ЕБ}} - r_{\\text{ДБ}})',
          note: 'r – корелация на белега при еднояйчни (ЕБ) и двуяйчни (ДБ) близнаци',
          lesson: '/biology/genetics/human',
        },
        {
          name: 'Полигенен белег с n адитивни гена',
          formula: '2n + 1\\ \\text{фенотипа};\\qquad P(\\text{краен фенотип}) = \\left(\\tfrac{1}{4}\\right)^n',
          note: 'при родители, хетерозиготни по всички гени',
          lesson: '/biology/genetics/human',
        },
        {
          name: 'Риск с допълнителна информация (Бейс)',
          formula: 'P = \\frac{p \\cdot L_1}{p \\cdot L_1 + (1 - p) \\cdot L_0}',
          note: 'p – началната вероятност (напр. за носителство); L₁, L₀ – вероятност на наблюдаваното, ако допускането е вярно или не',
          lesson: '/biology/genetics/human',
        },
        {
          name: 'Телца на Бар',
          formula: 'N_{\\text{Бар}} = N_X - 1',
          note: 'във всяка клетка остава активна само една X: 46,XY – 0, 46,XX – 1, 47,XXX – 2',
          lesson: '/biology/genetics/human',
        },
      ],
    },
    {
      id: 'biotech',
      title: 'Генни технологии',
      formulas: [
        {
          name: 'Честота на място за рязане',
          formula: '\\text{веднъж на } 4^n\\ \\mathrm{bp}',
          note: 'n – дължина на мястото; 4 bp – на 256, 6 bp – на 4096 bp (при случайна последователност)',
          lesson: '/biology/genetics/biotech',
        },
        {
          name: 'Брой фрагменти при k разреза',
          formula: '\\text{линейна ДНК: } k + 1, \\qquad \\text{кръгова (плазмид): } k',
          lesson: '/biology/genetics/biotech',
        },
        {
          name: 'Брой копия при PCR',
          formula: 'N = N_0 \\cdot 2^n, \\qquad N = N_0 (1 + E)^n',
          note: 'n – брой цикли, E – ефективност (1 при пълно удвояване)',
          lesson: '/biology/genetics/biotech',
        },
        {
          name: 'Копия с точната дължина',
          formula: '2^n - 2n',
          note: 'двойни вериги от праймер до праймер след n цикъла, започнати от една молекула',
          lesson: '/biology/genetics/biotech',
        },
        {
          name: 'Сравнение по праговия цикъл (qPCR)',
          formula: '\\frac{N_A}{N_B} = 2^{C_{t,B} - C_{t,A}}',
          note: 'при ефективност 100 %; иначе основата е 1 + E',
          lesson: '/biology/genetics/biotech',
        },
        {
          name: 'Гел-електрофореза',
          formula: 'd \\approx a - b \\lg(\\text{размер})',
          note: 'пробегът е линеен по логаритъма на размера; a и b се намират по маркера',
          lesson: '/biology/genetics/biotech',
        },
        {
          name: 'Честота на ДНК профил',
          formula: 'P = P_1 \\cdot P_2 \\cdot \\ldots \\cdot P_k',
          note: 'произведение от честотите на генотипите в независимите локуси',
          lesson: '/biology/genetics/biotech',
        },
      ],
    },
    {
      id: 'selection',
      title: 'Естествен отбор и популационна генетика',
      formulas: [
        {
          name: 'Честота на алела',
          formula: 'p = \\frac{2N_{AA} + N_{Aa}}{2N}, \\qquad p + q = 1',
          note: 'всеки диплоиден индивид носи два алела – в популация от N индивида има 2N копия на гена',
          lesson: '/biology/evolution/selection',
        },
        {
          name: 'Закон на Харди–Вайнберг',
          formula: 'AA : Aa : aa = p^2 : 2pq : q^2, \\qquad p^2 + 2pq + q^2 = 1',
          note: 'голяма популация, случайно кръстосване, без отбор, мутации и миграция; χ² при проверка – 1 степен на свобода',
          lesson: '/biology/evolution/selection',
        },
        {
          name: 'Промяна на честотата при отбор',
          formula: "q' = \\frac{q\\,(p\\, w_{Aa} + q\\, w_{aa})}{\\bar{w}}, \\qquad \\bar{w} = p^2 w_{AA} + 2pq\\, w_{Aa} + q^2 w_{aa}",
          note: 'w – относителна приспособеност на генотипа, коефициент на отбора s = 1 − w',
          lesson: '/biology/evolution/selection',
        },
        {
          name: 'Рецесивен летален алел',
          formula: 'q_n = \\frac{q_0}{1 + n q_0}, \\qquad \\frac{1}{q_n} = \\frac{1}{q_0} + n',
          note: 'n – брой поколения; колкото по-рядък е алелът, толкова по-бавно изчезва',
          lesson: '/biology/evolution/selection',
        },
        {
          name: 'Хетерозиготно предимство',
          formula: 'q^* = \\frac{s}{s + t}',
          note: 'w_AA = 1 − s, w_Aa = 1, w_aa = 1 − t; устойчиво равновесие (сърповидноклетъчна анемия и малария)',
          lesson: '/biology/evolution/selection',
        },
        {
          name: 'Равновесие мутации – отбор',
          formula: '\\text{рецесивен: } q \\approx \\sqrt{\\mu / s}, \\qquad \\text{доминантен: } p \\approx \\mu / s',
          note: 'μ – честота на мутациите на ген на поколение',
          lesson: '/biology/evolution/selection',
        },
        {
          name: 'Генетичен дрейф',
          formula: 'H_t = H_0 \\left(1 - \\frac{1}{2N}\\right)^t, \\qquad P_{\\text{фикс}} = p_0',
          note: 'H – хетерозиготност; неутрален алел се фиксира с вероятност, равна на началната му честота (нова мутация – 1/2N)',
          lesson: '/biology/evolution/selection',
        },
        {
          name: 'Ефективна численост',
          formula: 'N_e = \\frac{4 N_m N_f}{N_m + N_f}',
          note: 'N_m, N_f – брой размножаващи се мъжки и женски',
          lesson: '/biology/evolution/selection',
        },
        {
          name: 'Уравнение на селекционера',
          formula: 'R = h^2 S',
          note: 'S – диференциал на отбора, h² – наследственост, R – отговор на отбора (изместване на средното за едно поколение)',
          lesson: '/biology/evolution/selection',
        },
      ],
    },
    {
      id: 'phylogeny',
      title: 'Видообразуване и филогения',
      formulas: [
        {
          name: 'Хромозоми на хибрид и алополиплоид',
          formula: '2n_{\\text{хибрид}} = n_1 + n_2, \\qquad 2n_{\\text{алополиплоид}} = 2(n_1 + n_2)',
          note: 'n₁, n₂ – хромозомите в гаметите на двата вида; муле: 32 + 31 = 63; хлебна пшеница AABBDD = 42',
          lesson: '/biology/evolution/phylogeny',
        },
        {
          name: 'Брой двоични дървета',
          formula: 'N_{\\text{вкоренени}} = (2n - 3)!!, \\qquad N_{\\text{невкоренени}} = (2n - 5)!!',
          note: 'n – брой видове; за 4 вида – 15 и 3, за 10 вида – 34 459 425 и 2 027 025',
          lesson: '/biology/evolution/phylogeny',
        },
        {
          name: 'p-разстояние',
          formula: 'p = \\frac{\\text{брой различни позиции}}{\\text{брой сравнени позиции}}',
          lesson: '/biology/evolution/phylogeny',
        },
        {
          name: 'Поправка на Джукс–Кантор',
          formula: 'd = -\\frac{3}{4} \\ln\\left(1 - \\frac{4}{3} p\\right)',
          note: 'd – замени на позиция с отчетени многократните; p не надхвърля 0,75',
          lesson: '/biology/evolution/phylogeny',
        },
        {
          name: 'Молекулен часовник',
          formula: 'd = 2rT, \\qquad T = \\frac{d}{2r}',
          note: 'r – замени на позиция за единица време по всеки клон; калибрира се по вкаменелости',
          lesson: '/biology/evolution/phylogeny',
        },
        {
          name: 'Индекс на съгласуваност',
          formula: 'CI = \\frac{m}{s}',
          note: 'm – най-малкият възможен брой промени (брой състояния − 1 за всеки белег), s – промените по дървото; CI = 1 – без хомоплазия',
          lesson: '/biology/evolution/phylogeny',
        },
      ],
    },
    {
      id: 'microbes',
      title: 'Вируси, бактерии, протисти и гъби',
      formulas: [
        {
          name: 'Растеж на бактериите',
          formula: 'N = N_0 \\cdot 2^{t/g}, \\qquad n = \\frac{t}{g}',
          note: 'g – време на генерация, n – брой поколения; важи в логаритмичната фаза',
          lesson: '/biology/evolution/microbes',
        },
        {
          name: 'Време на генерация от два броя',
          formula: 'g = \\frac{t}{n} = \\frac{t \\lg 2}{\\lg N - \\lg N_0}',
          lesson: '/biology/evolution/microbes',
        },
        {
          name: 'Скорост на растеж',
          formula: '\\mu = \\frac{\\ln 2}{g}, \\qquad N = N_0 e^{\\mu t}',
          lesson: '/biology/evolution/microbes',
        },
        {
          name: 'Брой бактерии от брой колонии',
          formula: 'N = \\frac{C}{V \\cdot d}\\ \\ \\mathrm{CFU/ml}',
          note: 'C – колонии (броят се петрита с 30–300), V – посят обем в ml, d – разреждане (напр. 10⁻⁶)',
          lesson: '/biology/evolution/microbes',
        },
        {
          name: 'Последователно разреждане',
          formula: 'd = \\left(\\frac{v}{v + V_{\\text{вода}}}\\right)^k',
          note: '1 ml в 9 ml вода, повторено k пъти: d = 10⁻ᵏ',
          lesson: '/biology/evolution/microbes',
        },
        {
          name: 'Заразяване с фаги (Поасон)',
          formula: 'm = \\frac{N_{\\text{фаги}}}{N_{\\text{бактерии}}}, \\qquad P(k) = \\frac{m^k e^{-m}}{k!}, \\qquad P(0) = e^{-m}',
          note: 'm – множественост на заразяване (MOI); P(0) – дял на незаразените клетки',
          lesson: '/biology/evolution/microbes',
        },
        {
          name: 'Азотфиксация',
          formula: '\\mathrm{N_2 + 8H^+ + 8e^- + 16\\,АТФ \\to 2NH_3 + H_2 + 16\\,АДФ + 16\\,P_i}',
          note: 'ензим нитрогеназа; работи само без кислород',
          lesson: '/biology/evolution/microbes',
        },
      ],
    },
    {
      id: 'classification',
      title: 'Систематика',
      formulas: [
        {
          name: 'Брой тези в двувходов ключ',
          formula: 'n - 1',
          note: 'n – брой видове, всеки в отделен край на ключа; всяка теза разделя една група на две',
          lesson: '/biology/evolution/classification',
        },
        {
          name: 'Най-краткият най-дълъг път в ключа',
          formula: 'k = \\lceil \\log_2 n \\rceil',
          note: 'с k въпроса „да/не“ се различават най-много $2^k$ вида',
          lesson: '/biology/evolution/classification',
        },
        {
          name: 'Среден брой въпроси в ключа',
          formula: '\\bar{d} = \\sum p_i d_i',
          note: 'pᵢ – колко често се среща видът, dᵢ – брой въпроси до него; честите видове трябва да са близо до началото',
          lesson: '/biology/evolution/classification',
        },
        {
          name: 'Плоидност при редуване на поколенията',
          formula: '\\text{спора, гаметофит, гамета: } n, \\qquad \\text{зигота, спорофит: } 2n',
          note: 'мейозата дава спорите, митозата в гаметофита – гаметите; при мейоза от 1 клетка – 4 спори',
          lesson: '/biology/evolution/classification',
        },
        {
          name: 'Ходилни крака при членестоногите',
          formula: '\\text{насекоми } 6, \\quad \\text{паякообразни } 8, \\quad \\text{десетоноги раци } 10',
          lesson: '/biology/evolution/classification',
        },
      ],
    },
    {
      id: 'plant-transport',
      title: 'Строеж и транспорт при растенията',
      formulas: [
        {
          name: 'Воден потенциал',
          formula: '\\Psi = \\Psi_s + \\Psi_p, \\qquad \\Psi_s = -cRT',
          note: 'водата тече към по-ниския Ψ; c – осмотична концентрация, при 20 °C RT ≈ 2,44 L·MPa/mol',
          lesson: '/biology/plants/transport',
        },
        {
          name: 'Воден потенциал на въздуха',
          formula: '\\Psi = \\frac{RT}{\\bar V_w} \\ln \\varphi',
          note: 'φ – относителна влажност; при 20 °C RT/V̄ ≈ 135 MPa, при 50 % Ψ ≈ −94 MPa',
          lesson: '/biology/plants/transport',
        },
        {
          name: 'Потометър',
          formula: 'V = \\pi r^2 \\cdot \\frac{d}{t}',
          note: 'r – радиус на капиляра, d – път на мехурчето за време t; дава поетата вода за единица време',
          lesson: '/biology/plants/transport',
        },
        {
          name: 'Гъстота на устицата',
          formula: '\\rho = \\frac{N}{\\pi (D/2)^2}',
          note: 'N – устица в кръгло зрително поле с диаметър D',
          lesson: '/biology/plants/transport',
        },
        {
          name: 'Опън за воден стълб',
          formula: '\\Delta \\Psi = \\rho g h \\approx 0{,}01\\ \\mathrm{MPa/m}',
          note: 'само за да се задържи стълбът; триенето в съдовете добавя още толкова или повече',
          lesson: '/biology/plants/transport',
        },
        {
          name: 'Закон на Хаген–Поазьой',
          formula: 'Q = \\frac{\\pi r^4 \\Delta p}{8 \\eta L}',
          note: 'двойно по-широк съд пропуска 16 пъти повече вода; средната скорост расте като r²',
          lesson: '/biology/plants/transport',
        },
        {
          name: 'Капилярно издигане',
          formula: 'h = \\frac{2 \\sigma \\cos\\theta}{\\rho g r}',
          note: 'в съд с радиус 20 µm – около 0,75 m: твърде малко за дърветата',
          lesson: '/biology/plants/transport',
        },
      ],
    },
    {
      id: 'plant-growth',
      title: 'Растеж и размножаване при растенията',
      formulas: [
        {
          name: 'Двойно оплождане',
          formula: '\\text{зигота: } n + n = 2n, \\qquad \\text{ендосперм: } n + n + n = 3n',
          note: 'едната спермия + яйцеклетката; другата спермия + двете полярни ядра на централната клетка',
          lesson: '/biology/plants/growth',
        },
        {
          name: 'Хромозоми в ендосперма',
          formula: 'N_{\\text{ендосперм}} = \\frac{3}{2} \\cdot 2n',
          note: 'при царевицата 2n = 20 → 30; семенната обвивка и стената на плода са 2n (тъкани на майката)',
          lesson: '/biology/plants/growth',
        },
        {
          name: 'Генотип на ендосперма',
          formula: 'm\\,m\\,f',
          note: 'm – алелът в мегаспората (двете полярни ядра са еднакви), f – алелът на спермията',
          lesson: '/biology/plants/growth',
        },
        {
          name: 'Опит на Вент',
          formula: '\\alpha \\sim c_{\\text{ауксин}}',
          note: 'ъгълът на огъване е пропорционален на ауксина в агаровото блокче (при малки количества)',
          lesson: '/biology/plants/growth',
        },
        {
          name: 'Прекъсната нощ',
          formula: 't_{\\text{тъмно}} = \\max(t_1, t_2), \\qquad t_1 + t_2 = 24 - t_{\\text{ден}}',
          note: 'решава най-дългият непрекъснат тъмен период и последната светкавица (червена – прекъсва, далечна червена – отменя)',
          lesson: '/biology/plants/growth',
        },
        {
          name: 'Логистичен (сигмоиден) растеж',
          formula: 'h(t) = \\frac{H}{1 + e^{-r(t - t_0)}}, \\qquad h\'_{\\max} = \\frac{rH}{4}',
          note: 'H – крайна височина; най-бърз растеж при h = H/2 (t = t₀)',
          lesson: '/biology/plants/growth',
        },
      ],
    },
    {
      id: 'digestion',
      title: 'Хранене и храносмилане',
      formulas: [
        {
          name: 'Енергийна стойност на храната',
          formula: 'E = 17\\,m_{\\text{въгл}} + 37\\,m_{\\text{мазн}} + 17\\,m_{\\text{белт}}',
          note: 'E в kJ, масите в g; на грам: въглехидрати и белтъци 17 kJ (4 kcal), мазнини 37 kJ (9 kcal)',
          lesson: '/biology/physiology/digestion',
        },
        {
          name: 'Килокалории и килоджаули',
          formula: '1\\ \\mathrm{kcal} = 4{,}184\\ \\mathrm{kJ}',
          lesson: '/biology/physiology/digestion',
        },
        {
          name: 'Площ на емулгираните капчици',
          formula: 'A = \\frac{6V}{d}, \\qquad N = \\frac{6V}{\\pi d^3}',
          note: 'обем V мазнина на N еднакви капки с диаметър d; 10 пъти по-малки капки – 10 пъти по-голяма площ за липазата',
          lesson: '/biology/physiology/digestion',
        },
        {
          name: 'Хидролиза на нишестето',
          formula: '(\\mathrm{C_6H_{10}O_5})_n + n\\,\\mathrm{H_2O} \\to n\\,\\mathrm{C_6H_{12}O_6}',
          note: 'от 162 g нишесте се получават 180 g глюкоза – масата расте с присъединената вода',
          lesson: '/biology/physiology/digestion',
        },
        {
          name: 'Основна обмяна (Мифлин – Сейнт Жор)',
          formula: 'BMR = 10\\,m + 6{,}25\\,h - 5\\,a + s',
          note: 'kcal на ден; m в kg, h в cm, a – години; s = +5 за мъже, −161 за жени; за възрастни, при подрастващи – ориентир',
          lesson: '/biology/physiology/digestion',
        },
        {
          name: 'Дневен разход на енергия',
          formula: 'E_{\\text{ден}} = BMR \\cdot PAL',
          note: 'PAL – коефициент на физическа активност: около 1,4 (заседнал) до 2 и повече (спортист)',
          lesson: '/biology/physiology/digestion',
        },
        {
          name: 'Индекс на телесната маса',
          formula: '\\text{ИТМ} = \\frac{m}{h^2}',
          note: 'm в kg, h в m; при възрастни 18,5–25 – нормално тегло, 25–30 – наднормено, над 30 – затлъстяване',
          lesson: '/biology/physiology/digestion',
        },
        {
          name: 'Промяна на масата',
          formula: '\\Delta m \\approx \\frac{E_{\\text{прието}} - E_{\\text{разход}}}{32\\,000\\ \\mathrm{kJ/kg}}',
          note: '1 kg мастна тъкан – грубо 32 000 kJ (7700 kcal); тялото частично се приспособява, затова е горна граница',
          lesson: '/biology/physiology/digestion',
        },
        {
          name: 'Дихателен коефициент',
          formula: 'RQ = \\frac{V_{\\mathrm{CO_2}}}{V_{\\mathrm{O_2}}}',
          note: 'въглехидрати – 1, белтъци – около 0,8, мазнини – около 0,7',
          lesson: '/biology/physiology/digestion',
        },
      ],
    },
    {
      id: 'circulation',
      title: 'Кръв и кръвообращение',
      formulas: [
        {
          name: 'Минутен обем',
          formula: '\\text{МО} = \\text{пулс} \\cdot \\text{УО}, \\qquad \\text{УО} = \\text{EDV} - \\text{ESV}',
          note: 'в покой ≈ 70 · 70 mL ≈ 5 L/min; при трениран бегач до 25–35 L/min',
          lesson: '/biology/physiology/circulation',
        },
        {
          name: 'Фракция на изтласкване',
          formula: '\\text{ФИ} = \\frac{\\text{УО}}{\\text{EDV}}',
          note: 'нормално около 55–70 %',
          lesson: '/biology/physiology/circulation',
        },
        {
          name: 'Средно артериално налягане',
          formula: '\\bar p = \\text{МО} \\cdot R + p_{\\text{ДП}} \\approx p_{\\text{д}} + \\frac{p_{\\text{с}} - p_{\\text{д}}}{3}',
          note: 'при 120/80 mmHg – около 93 mmHg; pс − pд е пулсовото налягане',
          lesson: '/biology/physiology/circulation',
        },
        {
          name: 'Уравнение на непрекъснатостта',
          formula: 'Q = A \\cdot v',
          note: 'A – общото сечение на всички съдове от вида: аорта ≈ 2,5 cm², капиляри ≈ 2500 cm² → кръвта в капилярите е ≈ 1000 пъти по-бавна',
          lesson: '/biology/physiology/circulation',
        },
        {
          name: 'Закон на Поазьой за съдовете',
          formula: 'Q = \\frac{\\Delta p}{R}, \\qquad R = \\frac{8 \\eta L}{\\pi r^4}',
          note: 'двойно по-тесен съд има 16 пъти по-голямо съпротивление – така артериолите регулират потока',
          lesson: '/biology/physiology/circulation',
        },
        {
          name: 'Принцип на Фик',
          formula: '\\text{МО} = \\frac{\\dot V_{O_2}}{C_a - C_v}',
          note: '250 mL O₂/min : (200 − 150) mL O₂/L = 5 L/min',
          lesson: '/biology/physiology/circulation',
        },
        {
          name: 'Пулс от ЕКГ',
          formula: '\\text{пулс} = \\frac{60}{T} = \\frac{1500}{RR\\ [\\mathrm{mm}]}',
          note: 'при скорост на хартията 25 mm/s',
          lesson: '/biology/physiology/circulation',
        },
        {
          name: 'Показатели на еритроцитите',
          formula: '\\text{MCV} = \\frac{\\text{Hct}}{N_{\\text{ер}}}, \\qquad \\text{MCHC} = \\frac{\\text{Hb}}{\\text{Hct}}',
          note: '0,45 : 5 · 10¹²/L = 90 fL; 150 g/L : 0,45 ≈ 333 g/L',
          lesson: '/biology/physiology/circulation',
        },
        {
          name: 'Сили на Старлинг',
          formula: 'J \\sim (p_{\\text{к}} - p_{\\text{т}}) - (\\pi_{\\text{к}} - \\pi_{\\text{т}})',
          note: 'J > 0 – филтрация (артериален край, p ≈ 35 mmHg), J < 0 – реабсорбция (венозен край, p ≈ 15 mmHg); онкотично налягане ≈ 25 mmHg',
          lesson: '/biology/physiology/circulation',
        },
      ],
    },
    {
      id: 'breathing',
      title: 'Дишане и газообмен',
      formulas: [
        {
          name: 'Закон на Фик',
          formula: 'J \\sim \\frac{A \\, \\Delta p}{d}',
          note: 'дифузията расте с площта и разликата в парциалното налягане и пада с дебелината на преградата',
          lesson: '/biology/physiology/breathing',
        },
        {
          name: 'Белодробни капацитети',
          formula: 'ЖК = ДО + РВО + РИО, \\qquad ОБК = ЖК + ОО, \\qquad ФОК = РИО + ОО',
          note: 'при млад мъж около ДО 0,5 L, ЖК 4,6 L, ОБК 5,8 L; остатъчният обем не се мери със спирометър',
          lesson: '/biology/physiology/breathing',
        },
        {
          name: 'Белодробна и алвеоларна вентилация',
          formula: '\\dot V_E = V_T \\cdot f, \\qquad \\dot V_A = (V_T - V_D) \\cdot f',
          note: 'мъртвото пространство V_D ≈ 150 mL; в покой V̇E ≈ 6–8 L/min',
          lesson: '/biology/physiology/breathing',
        },
        {
          name: 'Парциално налягане във вдишания въздух',
          formula: 'P_{IO_2} = 0{,}21 \\cdot (p - 6{,}3\\ \\mathrm{kPa})',
          note: 'в трахеята въздухът е наситен с водни пари; на морското равнище ≈ 20 kPa',
          lesson: '/biology/physiology/breathing',
        },
        {
          name: 'Уравнение на алвеоларния газ',
          formula: 'P_{AO_2} \\approx P_{IO_2} - \\frac{P_{ACO_2}}{R}',
          note: 'R ≈ 0,8 – дихателният коефициент; на морското равнище 20 − 5,3/0,8 ≈ 13,3 kPa',
          lesson: '/biology/physiology/breathing',
        },
        {
          name: 'Уравнение на Хил',
          formula: 'S = \\frac{P_{O_2}^{\\,n}}{P_{O_2}^{\\,n} + P_{50}^{\\,n}}',
          note: 'за хемоглобин на възрастен P50 ≈ 3,5 kPa, n ≈ 2,7; за миоглобин n = 1',
          lesson: '/biology/physiology/breathing',
        },
        {
          name: 'Съдържание на кислород в кръвта',
          formula: 'C_{O_2} = 1{,}34 \\cdot [\\mathrm{Hb}] \\cdot S + 0{,}225 \\cdot P_{O_2}',
          note: 'mL/L при [Hb] в g/L и PO₂ в kPa; артериалната кръв носи ≈ 200 mL O₂ на литър',
          lesson: '/biology/physiology/breathing',
        },
        {
          name: 'Принцип на Фик за потреблението на O₂',
          formula: '\\dot V_{O_2} = Q \\cdot (C_a - C_v)',
          note: 'Q – сърдечен дебит; в покой 5 L/min · 50 mL/L = 250 mL/min',
          lesson: '/biology/physiology/breathing',
        },
        {
          name: 'Пренос на CO₂',
          formula: '\\mathrm{CO_2 + H_2O \\rightleftharpoons H_2CO_3 \\rightleftharpoons H^+ + HCO_3^-}',
          note: 'ускорява се от карбоанхидразата в еритроцитите; около 70 % от CO₂ се носи като HCO₃⁻',
          lesson: '/biology/physiology/breathing',
        },
        {
          name: 'pH на кръвта',
          formula: '\\mathrm{pH} = 6{,}1 + \\lg \\frac{[\\mathrm{HCO_3^-}]}{0{,}23 \\cdot P_{CO_2}}',
          note: '[HCO₃⁻] в mmol/L, PCO₂ в kPa; при 24 mmol/L и 5,3 kPa – pH ≈ 7,4',
          lesson: '/biology/physiology/breathing',
        },
      ],
    },
    {
      id: 'homeostasis',
      title: 'Отделяне и хомеостаза',
      formulas: [
        {
          name: 'Филтрат за денонощие',
          formula: 'V_{\\text{ден}} = GFR \\cdot 1440\\ \\mathrm{min}',
          note: 'GFR ≈ 125 mL/min → около 180 L филтрат на ден; урината е около 1,5 L – обратно се поемат около 99 % от водата',
          lesson: '/biology/physiology/homeostasis',
        },
        {
          name: 'Ефективно филтрационно налягане',
          formula: 'P_{\\text{еф}} = P_{\\text{г}} - P_{\\text{к}} - \\pi \\approx 55 - 15 - 30 = 10\\ \\mathrm{mmHg}',
          note: 'Pг – в капилярите на гломерула, Pк – в капсулата на Боуман, π – онкотичното налягане на плазмените белтъци',
          lesson: '/biology/physiology/homeostasis',
        },
        {
          name: 'Баланс на веществото в нефрона',
          formula: '\\text{отделено} = \\text{филтрирано} - \\text{поето обратно} + \\text{секретирано}',
          note: 'филтрирано = GFR · P (P – концентрацията в плазмата)',
          lesson: '/biology/physiology/homeostasis',
        },
        {
          name: 'Клирънс',
          formula: 'C = \\frac{U \\cdot V}{P}',
          note: 'U – концентрация в урината, V – урина за минута, P – концентрация в плазмата; инулин: C = GFR ≈ 125 mL/min, PAH: C ≈ плазмения ток (≈ 600–650 mL/min), глюкоза: C = 0',
          lesson: '/biology/physiology/homeostasis',
        },
        {
          name: 'Филтрационна фракция и кръвен ток',
          formula: 'FF = \\frac{GFR}{RPF} \\approx 0{,}2, \\qquad RBF = \\frac{RPF}{1 - Hct}',
          note: 'RPF – плазменият ток през бъбреците (клирънсът на PAH), Hct – хематокритът',
          lesson: '/biology/physiology/homeostasis',
        },
        {
          name: 'Бъбречен праг за глюкоза',
          formula: 'P_{\\text{праг}} = \\frac{T_m}{GFR} \\approx \\frac{375\\ \\mathrm{mg/min}}{125\\ \\mathrm{mL/min}} = 300\\ \\mathrm{mg/dL}',
          note: 'идеалният праг; реално глюкоза се появява в урината около 10 mmol/L (180 mg/dL), защото нефроните се различават',
          lesson: '/biology/physiology/homeostasis',
        },
        {
          name: 'Обем на урината',
          formula: 'V = \\frac{S}{U_{\\text{осм}}}',
          note: 'S – разтворените вещества за изхвърляне (≈ 600–900 mOsm/ден); при U от 50 до 1200 mOsm/kg – от около 0,5 до около 12 L на ден',
          lesson: '/biology/physiology/homeostasis',
        },
        {
          name: 'Изпаряване на пот',
          formula: 'Q = m L, \\qquad L \\approx 2{,}4\\ \\mathrm{kJ/g}',
          note: '1 L пот на час отнема около 670 W',
          lesson: '/biology/physiology/homeostasis',
        },
        {
          name: 'Топлинен баланс на тялото',
          formula: 'm c \\frac{\\Delta T}{\\Delta t} = M - Q_{\\text{кожа}} - Q_{\\text{изп}}',
          note: 'c ≈ 3,5 kJ/(kg·K); M – произведената топлина (≈ 80 W в покой)',
          lesson: '/biology/physiology/homeostasis',
        },
      ],
    },
    {
      id: 'nerves',
      title: 'Нервна система и сетива',
      formulas: [
        {
          name: 'Уравнение на Нернст',
          formula: 'E = \\frac{RT}{zF} \\ln \\frac{[\\mathrm{X}]_{\\text{вън}}}{[\\mathrm{X}]_{\\text{вътре}}}',
          note: 'равновесният потенциал на йона X със заряд z; R = 8,314 J/(mol·K), F = 96 485 C/mol',
          lesson: '/biology/physiology/nerves',
        },
        {
          name: 'Нернст при 37 °C',
          formula: 'E \\approx \\frac{61{,}5\\ \\mathrm{mV}}{z} \\lg \\frac{[\\mathrm{X}]_{\\text{вън}}}{[\\mathrm{X}]_{\\text{вътре}}}',
          note: 'K⁺ 5/140 mmol/L → E(K⁺) ≈ −89 mV; Na⁺ 145/15 mmol/L → E(Na⁺) ≈ +61 mV',
          lesson: '/biology/physiology/nerves',
        },
        {
          name: 'Уравнение на Голдман–Ходжкин–Кац',
          formula: 'V = 61{,}5 \\lg \\frac{P_K [K^+]_{\\text{вън}} + P_{Na} [Na^+]_{\\text{вън}} + P_{Cl} [Cl^-]_{\\text{вътре}}}{P_K [K^+]_{\\text{вътре}} + P_{Na} [Na^+]_{\\text{вътре}} + P_{Cl} [Cl^-]_{\\text{вън}}}',
          note: 'потенциалът на покой (mV, 37 °C); при P(K⁺) : P(Na⁺) : P(Cl⁻) = 1 : 0,04 : 0,45 – около −67 mV',
          lesson: '/biology/physiology/nerves',
        },
        {
          name: 'Скорост на провеждане',
          formula: 'v = \\frac{\\Delta x}{\\Delta t_2 - \\Delta t_1}',
          note: 'нервът се дразни в две точки на разстояние Δx; закъснението в синапса и мускула отпада при изваждането',
          lesson: '/biology/physiology/nerves',
        },
        {
          name: 'Скорост и диаметър на влакното',
          formula: 'v_{\\text{миелин}} \\approx 6\\ \\tfrac{\\mathrm{m/s}}{\\mathrm{\\mu m}} \\cdot d, \\qquad v_{\\text{гол}} \\propto \\sqrt{d}',
          note: 'приблизителни правила; гол аксон от 1 µm – около 1 m/s, миелинизиран от 10 µm – около 60 m/s',
          lesson: '/biology/physiology/nerves',
        },
        {
          name: 'Най-голяма честота на импулсите',
          formula: 'f_{\\max} = \\frac{1}{T_{\\text{реф}}}',
          note: 'T – абсолютният рефрактерен период (около 1 ms → до около 1000 Hz)',
          lesson: '/biology/physiology/nerves',
        },
        {
          name: 'Време на рефлекса',
          formula: 't = \\frac{L}{v} + n \\cdot t_{\\text{син}}',
          note: 'L – дължината на дъгата, n – броят на синапсите, синаптичното закъснение t ≈ 0,5 ms',
          lesson: '/biology/physiology/nerves',
        },
        {
          name: 'Йони за един импулс',
          formula: 'N = \\frac{C \\Delta V \\cdot A}{e}',
          note: 'C ≈ 1 µF/cm² – капацитетът на мембраната, ΔV ≈ 100 mV, A – площта; около 6 · 10¹¹ йона на cm²',
          lesson: '/biology/physiology/nerves',
        },
      ],
    },
    {
      id: 'hormones',
      title: 'Хормони',
      formulas: [
        {
          name: 'Полуживот на хормон',
          formula: 'C = C_0 \\cdot 2^{-t/t_{1/2}}, \\qquad k = \\frac{\\ln 2}{t_{1/2}}',
          note: 'когато отделянето спре; адреналин t½ ≈ 2–3 min, инсулин ≈ 5 min, кортизол ≈ 60–90 min, T4 ≈ 7 дни',
          lesson: '/biology/physiology/hormones',
        },
        {
          name: 'Стационарна концентрация',
          formula: 'C_{\\text{ст}} = \\frac{R}{Cl}',
          note: 'R – скорост на отделяне, Cl – клирънс (обем плазма, изчистен за единица време); при стационарно ниво отделянето е равно на разграждането',
          lesson: '/biology/physiology/hormones',
        },
        {
          name: 'Достигане на стационарното ниво',
          formula: 'C = C_{\\text{ст}} \\left(1 - 2^{-t/t_{1/2}}\\right)',
          note: '50 % за един полуживот, 90 % за $\\log_2 10 \\approx 3{,}3$ полуживота – независимо от скоростта на отделяне',
          lesson: '/biology/physiology/hormones',
        },
        {
          name: 'Натрупване при повтарящи се дози',
          formula: 'R = \\frac{1}{1 - 2^{-\\tau/t_{1/2}}}',
          note: 'τ – интервал между дозите; R – колко пъти върхът при стационарно ниво е над върха след първата доза; дъното е $R \\cdot 2^{-\\tau/t_{1/2}}$',
          lesson: '/biology/physiology/hormones',
        },
        {
          name: 'Усилване в сигналната каскада',
          formula: 'N_{\\text{изход}} = N_{\\text{хормон}} \\cdot a_1 \\cdot a_2 \\cdots a_n',
          note: 'a – колко молекули се включват на всяко стъпало; по учебниците 1 молекула адреналин → около $10^8$ молекули глюкоза-1-фосфат',
          lesson: '/biology/physiology/hormones',
        },
        {
          name: 'Йод в тироксина',
          formula: 'w(\\mathrm{I}) = \\frac{4 \\cdot 126{,}9}{776{,}9} \\approx 0{,}65',
          note: 'тироксинът C₁₅H₁₁I₄NO₄ (T4) е 65 % йод по маса; нужни са около 150 μg йод на ден',
          lesson: '/biology/physiology/hormones',
        },
      ],
    },
    {
      id: 'immunity',
      title: 'Имунитет',
      formulas: [
        {
          name: 'Ефективно репродуктивно число',
          formula: 'R = R_0 \\cdot (1 - p)',
          note: 'R₀ – колко души заразява един болен сред податливи хора, p – делът на имунните; при R < 1 епидемията угасва',
          lesson: '/biology/physiology/immunity',
        },
        {
          name: 'Праг на колективния имунитет',
          formula: 'p_c = 1 - \\frac{1}{R_0}',
          note: 'за морбили (R₀ около 12–18) – над 92–94 %, за полиомиелит (R₀ около 5–7) – 80–86 %',
          lesson: '/biology/physiology/immunity',
        },
        {
          name: 'Нужен ваксинален обхват',
          formula: 'V_c = \\frac{1 - 1/R_0}{E}',
          note: 'E – ефективността на ваксината (делът от ваксинираните, които са защитени); при V_c > 1 ваксината не стига за колективен имунитет',
          lesson: '/biology/physiology/immunity',
        },
        {
          name: 'Ефективност на ваксина',
          formula: 'E = 1 - \\frac{r_{\\text{ваксинирани}}}{r_{\\text{плацебо}}}',
          note: 'r – делът на разболелите се във всяка група на изпитанието; например 8 срещу 162 при еднакви групи → E ≈ 95 %',
          lesson: '/biology/physiology/immunity',
        },
        {
          name: 'Окончателен размер на епидемията (SIR)',
          formula: 'z = 1 - e^{-R_0 z}',
          note: 'z – делът от хората, които преболедуват без ваксинация; при R₀ = 2 → z ≈ 0,797',
          lesson: '/biology/physiology/immunity',
        },
        {
          name: 'Случаи в n-тото поколение',
          formula: 'N_n = R^n',
          note: 'от един болен; общо до n-тото поколение – 1 + R + … + Rⁿ',
          lesson: '/biology/physiology/immunity',
        },
        {
          name: 'Клонално размножаване',
          formula: 'N = N_0 \\cdot 2^{t/T}',
          note: 'T – времето за едно делене на лимфоцита; при вторичния отговор N₀ са клетките на паметта и клонът е много по-голям',
          lesson: '/biology/physiology/immunity',
        },
        {
          name: 'Разграждане на антителата',
          formula: 'C = C_0 \\cdot \\left(\\tfrac{1}{2}\\right)^{t/t_{1/2}}',
          note: 'полуживот около 21 дни за IgG и около 5 дни за IgM',
          lesson: '/biology/physiology/immunity',
        },
        {
          name: 'Разнообразие на антителата (V(D)J)',
          formula: 'N = (V \\cdot D \\cdot J)_{\\text{тежка}} \\cdot (V \\cdot J)_{\\text{лека}}',
          note: 'около 40 · 25 · 6 = 6000 тежки и около 320 леки вериги → ≈ 1,9 · 10⁶ комбинации; неточните съединения дават още много повече',
          lesson: '/biology/physiology/immunity',
        },
      ],
    },
    {
      id: 'reproduction',
      title: 'Размножаване и развитие',
      formulas: [
        {
          name: 'Брой клетки при браздяването',
          formula: 'N = 2^n',
          note: 'n – брой синхронни деления на зиготата; 5 деления → 32 клетки (морула), 7 → 128 (бластула)',
          lesson: '/biology/physiology/reproduction',
        },
        {
          name: 'Размер на бластомерите',
          formula: 'V_n = \\frac{V_0}{2^n}, \\qquad d_n = \\frac{d_0}{2^{n/3}}',
          note: 'при браздяването общият обем не расте; човешката зигота d₀ ≈ 100 µm → след 3 деления 50 µm',
          lesson: '/biology/physiology/reproduction',
        },
        {
          name: 'Гамети от една клетка',
          formula: '1\\ \\text{сперматоцит} \\to 4\\ \\text{сперматозоида}, \\qquad 1\\ \\text{ооцит} \\to 1\\ \\text{яйцеклетка}',
          note: 'при оогенезата деленията са неравни – отделят се 2 или 3 полярни телца',
          lesson: '/biology/physiology/reproduction',
        },
        {
          name: 'Ден на овулацията',
          formula: 't_{\\text{ов}} \\approx L - 14',
          note: 'L – дължина на цикъла в дни; лутеалната фаза (от овулацията до менструацията) е около 14 дни',
          lesson: '/biology/physiology/reproduction',
        },
        {
          name: 'Плодни дни',
          formula: 't_{\\text{ов}} - 5 \\le t \\le t_{\\text{ов}}',
          note: 'сперматозоидите живеят до около 5 дни, яйцеклетката може да бъде оплодена 12–24 h след овулацията',
          lesson: '/biology/physiology/reproduction',
        },
        {
          name: 'Правило на Негеле',
          formula: 't_{\\text{раждане}} = t_{\\text{ПМ}} + 280\\ \\text{дни} = t_{\\text{ПМ}} + 40\\ \\text{седмици}',
          note: 'ПМ – първият ден на последната менструация; от оплождането – около 266 дни',
          lesson: '/biology/physiology/reproduction',
        },
        {
          name: 'Нарастване на hCG',
          formula: 'N = N_0 \\cdot 2^{t/T}, \\qquad T \\approx 2\\ \\text{дни}',
          note: 'в началото на бременността; тестът за бременност открива hCG в урината',
          lesson: '/biology/physiology/reproduction',
        },
        {
          name: 'Двойна цена на половото размножаване',
          formula: 'N_{\\text{безп}}(g) = 2^g, \\qquad N_{\\text{пол}} = \\text{const}',
          note: 'безполовата женска има 2 дъщери, половата – дъщеря и син; без предимство на пола безполовите бързо биха надделели',
          lesson: '/biology/physiology/reproduction',
        },
      ],
    },
    {
      id: 'ecosystems',
      title: 'Екосистеми и потоци на енергия',
      formulas: [
        {
          name: 'Нетна първична продукция',
          formula: '\\text{НПП} = \\text{БПП} - R',
          note: 'БПП – цялата енергия, свързана при фотосинтезата; R – изразходваното от самите растения за дишане (често около половината)',
          lesson: '/biology/ecology/ecosystems',
        },
        {
          name: 'Ефективност на фотосинтезата',
          formula: '\\eta_{\\text{ф}} = \\frac{\\text{БПП}}{E_{\\text{светлина}}} \\cdot 100\\ \\%',
          note: 'обикновено около 1 %; в България на 1 m² падат около 5 · 10⁶ kJ слънчева енергия за година',
          lesson: '/biology/ecology/ecosystems',
        },
        {
          name: 'Ефективност на прехода между трофичните нива',
          formula: '\\eta = \\frac{P_{n+1}}{P_n} \\cdot 100\\ \\%',
          note: 'P – продукцията (енергията) на нивото; обикновено 5–20 %, средно около 10 %',
          lesson: '/biology/ecology/ecosystems',
        },
        {
          name: 'Правило на 10-те процента',
          formula: 'E_n \\approx E_1 \\cdot 0{,}1^{\\,n-1}',
          note: 'E₁ – нетната продукция на продуцентите; до ниво 4 стига около една хилядна',
          lesson: '/biology/ecology/ecosystems',
        },
        {
          name: 'Ефективността като произведение',
          formula: '\\eta = CE \\cdot AE \\cdot PE',
          note: 'CE – изядена част от продукцията, AE – усвоена част от изяденото, PE – част от усвоеното, превърната в прираст (при топлокръвните 1–3 %)',
          lesson: '/biology/ecology/ecosystems',
        },
        {
          name: 'Трофично ниво на всеяден организъм',
          formula: 'TL = 1 + \\sum_i p_i \\cdot TL_i',
          note: 'pᵢ – делът на храната i в менюто, TLᵢ – нейното трофично ниво; продуцентите имат TL = 1',
          lesson: '/biology/ecology/ecosystems',
        },
        {
          name: 'Биоконцентрация',
          formula: '\\text{BCF} = \\frac{C_{\\text{организъм}}}{C_{\\text{вода}}}',
          note: 'колко пъти концентрацията в организма (например планктона) е по-висока от тази във водата',
          lesson: '/biology/ecology/ecosystems',
        },
        {
          name: 'Биомагнификация',
          formula: 'C_{n+1} = C_n \\cdot \\text{BMF}, \\qquad \\text{BMF} \\approx \\frac{f}{g}',
          note: 'f – задържаната част от погълнатото вещество, g – частта от храната, която става тяло; при f = 0,8 и g = 0,1 BMF = 8',
          lesson: '/biology/ecology/ecosystems',
        },
        {
          name: 'Нетна продукция на екосистемата',
          formula: '\\text{NEP} = \\text{НПП} - R_{\\text{хет}}',
          note: 'R_хет – дишането на животните и разлагачите; ако е положителна, екосистемата натрупва въглерод',
          lesson: '/biology/ecology/ecosystems',
        },
      ],
    },
    {
      id: 'populations',
      title: 'Популации',
      formulas: [
        {
          name: 'Баланс на числеността',
          formula: 'N_{t+1} = N_t + B - D + I - E',
          note: 'B – родени, D – умрели, I – дошли (имиграция), E – тръгнали си (емиграция)',
          lesson: '/biology/ecology/populations',
        },
        {
          name: 'Маркиране и повторно улавяне (Линкълн–Петерсен)',
          formula: 'N \\approx \\frac{M \\cdot C}{R}',
          note: 'M – маркирани, C – уловени втория път, R – маркирани сред тях; популацията трябва да е затворена',
          lesson: '/biology/ecology/populations',
        },
        {
          name: 'Поправка на Чапман',
          formula: 'N \\approx \\frac{(M + 1)(C + 1)}{R + 1} - 1',
          note: 'по-точна при малко R; работи и при R = 0',
          lesson: '/biology/ecology/populations',
        },
        {
          name: 'Експоненциален растеж',
          formula: '\\frac{dN}{dt} = rN, \\qquad N = N_0 e^{rt}, \\qquad r = b - d',
          note: 'b и d – раждаемост и смъртност на индивид за единица време',
          lesson: '/biology/ecology/populations',
        },
        {
          name: 'Време за удвояване',
          formula: 't_2 = \\frac{\\ln 2}{r} \\approx \\frac{70}{r\\,[\\%]}',
          note: 'правилото на 70 е точно при малки проценти растеж',
          lesson: '/biology/ecology/populations',
        },
        {
          name: 'Логистичен растеж',
          formula: '\\frac{dN}{dt} = rN\\left(1 - \\frac{N}{K}\\right)',
          note: 'K – капацитетът на средата; S-образна крива',
          lesson: '/biology/ecology/populations',
        },
        {
          name: 'Максимален устойчив улов',
          formula: 'Y_{\\max} = \\frac{rK}{4} \\quad \\text{при} \\quad N = \\frac{K}{2}',
          note: 'най-големият приръст на логистичната популация',
          lesson: '/biology/ecology/populations',
        },
        {
          name: 'Модел на Лотка–Волтера',
          formula: '\\frac{dH}{dt} = \\alpha H - \\beta HP, \\qquad \\frac{dP}{dt} = \\delta HP - \\gamma P',
          note: 'H – жертви, P – хищници; равновесие H* = γ/δ, P* = α/β',
          lesson: '/biology/ecology/populations',
        },
        {
          name: 'Индекс на разсейване',
          formula: '\\frac{s^2}{\\bar{x}}',
          note: 'от броя в пробни площадки: ≈ 1 случайно, < 1 равномерно, > 1 групово разпределение',
          lesson: '/biology/ecology/populations',
        },
      ],
    },
    {
      id: 'biodiversity',
      title: 'Съобщества и биоразнообразие',
      formulas: [
        {
          name: 'Индекс на Симпсън',
          formula: 'D = 1 - \\sum \\frac{n_i(n_i - 1)}{N(N - 1)} \\approx 1 - \\sum p_i^2',
          note: 'вероятността две особи, взети наслуки, да са от различни видове; от 0 (един вид) до почти 1',
          lesson: '/biology/ecology/biodiversity',
        },
        {
          name: 'Индекс на Шанън',
          formula: "H' = -\\sum p_i \\ln p_i",
          note: 'pᵢ = nᵢ / N – делът на i-тия вид; при S еднакво чести вида H′ = ln S (най-голямата стойност)',
          lesson: '/biology/ecology/biodiversity',
        },
        {
          name: 'Изравненост',
          formula: "J = \\frac{H'}{\\ln S}",
          note: '1 – всички видове са еднакво чести; близо до 0 – един вид доминира',
          lesson: '/biology/ecology/biodiversity',
        },
        {
          name: 'Ефективен брой видове (обратен Симпсън)',
          formula: '\\frac{1}{\\sum p_i^2}',
          note: 'колко еднакво чести вида биха дали същото разнообразие; при S еднакво чести вида е равен на S',
          lesson: '/biology/ecology/biodiversity',
        },
        {
          name: 'Коефициент на сходство на Сьоренсен',
          formula: 'QS = \\frac{2C}{A + B}',
          note: 'A и B – видовете в двете съобщества, C – общите видове; 1 – еднакъв състав, 0 – няма общи видове',
          lesson: '/biology/ecology/biodiversity',
        },
        {
          name: 'Закон видове–площ',
          formula: 'S = c A^z',
          note: 'z обикновено е 0,15–0,35; при z ≈ 0,3 десет пъти по-голяма площ има около два пъти повече видове',
          lesson: '/biology/ecology/biodiversity',
        },
        {
          name: 'Видове след загуба на местообитание',
          formula: '\\frac{S}{S_0} = \\left(\\frac{A}{A_0}\\right)^z',
          note: 'при z = 0,25 загубата на 90 % от площта води в крайна сметка до изчезване на около 44 % от видовете',
          lesson: '/biology/ecology/biodiversity',
        },
        {
          name: 'Равновесен брой видове на остров',
          formula: 'S^* = \\frac{P \\cdot I_0}{I_0 + E_0}',
          note: 'модел на Макартър и Уилсън с линейни скорости I = I₀(1 − S/P) и E = E₀S/P; P – видовете на континента',
          lesson: '/biology/ecology/biodiversity',
        },
      ],
    },
    {
      id: 'behaviour',
      title: 'Поведение на животните',
      formulas: [
        {
          name: 'Посока в танца на пчелите',
          formula: '\\alpha = A_{\\text{храна}} - A_{\\text{слънце}}',
          note: 'α – ъгълът на вилтенето от вертикалата по часовника; A – азимутите на храната и на слънцето',
          lesson: '/biology/ecology/behaviour',
        },
        {
          name: 'Разстояние в танца на пчелите',
          formula: 'd \\approx k \\cdot t_{\\text{вилтене}}',
          note: 'k ≈ 1 km на секунда вилтене (различно при различните подвидове и колонии); под ≈ 100 m – кръгов танц',
          lesson: '/biology/ecology/behaviour',
        },
        {
          name: 'Профитабилност на плячката',
          formula: '\\frac{E}{h}',
          note: 'E – енергията от плячката, h – времето за улавяне и изяждане',
          lesson: '/biology/ecology/behaviour',
        },
        {
          name: 'Среден добив при хранене на петна',
          formula: 'R = \\frac{g(t)}{T + t}',
          note: 'g(t) – събраната в петното енергия за време t, T – пътят до петното',
          lesson: '/biology/ecology/behaviour',
        },
        {
          name: 'Теорема за пределната стойност',
          formula: "g'(t^*) = \\frac{g(t^*)}{T + t^*}",
          note: 'животното напуска петното, когато добивът в него спадне до средния; по-дълъг път → по-дълго в петното',
          lesson: '/biology/ecology/behaviour',
        },
        {
          name: 'Правило на Хамилтън',
          formula: 'r B > C',
          note: 'r – коефициентът на родство, B – ползата за роднината, C – цената за помагащия (в потомци)',
          lesson: '/biology/ecology/behaviour',
        },
        {
          name: 'Коефициент на родство',
          formula: 'r = \\sum \\left(\\frac{1}{2}\\right)^{L}',
          note: 'L – броят на поколенията (мейозите) по всеки път през общ прародител: брат 1/2, полубрат 1/4, братовчед 1/8',
          lesson: '/biology/ecology/behaviour',
        },
        {
          name: 'Сестри при хаплодиплоидните',
          formula: 'r = \\frac{1}{2} \\cdot 1 + \\frac{1}{2} \\cdot \\frac{1}{2} = \\frac{3}{4}',
          note: 'пчели, оси, мравки с един баща; при n бащи средно r = 1/4 + 1/(2n)',
          lesson: '/biology/ecology/behaviour',
        },
        {
          name: 'Ястреб–гълъб: ЕСС',
          formula: 'p^* = \\frac{V}{C}',
          note: 'дял на ястребите при цена на нараняването C > V; при V ≥ C – само ястреби',
          lesson: '/biology/ecology/behaviour',
        },
      ],
    },
  ],
};

export const GEOGRAPHY: Section = {
  id: 'geography',
  title: 'География',
  groups: [
    {
      id: 'coordinates',
      title: 'Координати и време',
      formulas: [
        {
          name: 'Градус по меридиана',
          formula: '1^\\circ \\approx 111\\ \\mathrm{km},\\quad 1\' \\approx 1\\ \\text{морска миля} = 1852\\ \\mathrm{m}',
          note: 'обиколката на Земята по меридиана е около 40 000 km',
          lesson: '/geography/maps/coordinates',
        },
        {
          name: 'Градус по паралела',
          formula: '1^\\circ \\approx 111\\ \\mathrm{km} \\cdot \\cos\\varphi',
          note: 'паралелите се скъсяват към полюсите; $\\varphi$ – географската ширина',
          lesson: '/geography/maps/coordinates',
        },
        {
          name: 'Ортодромия (най-кратък път)',
          formula: '\\cos d = \\sin\\varphi_1 \\sin\\varphi_2 + \\cos\\varphi_1 \\cos\\varphi_2 \\cos\\Delta\\lambda,\\quad s = R\\,d',
          note: '$d$ – централният ъгъл в радиани, $R \\approx 6371$ km',
          lesson: '/geography/maps/coordinates',
        },
        {
          name: 'Местно време и дължина',
          formula: '\\Delta t = 4\\ \\text{min} \\cdot \\Delta\\lambda^\\circ,\\quad 15^\\circ = 1\\ \\mathrm{h}',
          note: 'на изток местното време е напред',
          lesson: '/geography/maps/coordinates',
        },
        {
          name: 'Поясно време',
          formula: 'T = \\mathrm{UTC} + n',
          note: '$n$ – номерът на пояса; България: $n = 2$, през лятото $n = 3$',
          lesson: '/geography/maps/coordinates',
        },
        {
          name: 'Ширина по пладнешкото Слънце',
          formula: '\\varphi = 90^\\circ - h + \\delta',
          note: '$h$ – височина на Слънцето в пладне (на юг), $\\delta$ – деклинацията му; височината на Полярната звезда е $\\approx \\varphi$',
          lesson: '/geography/maps/coordinates',
        },
      ],
    },
    {
      id: 'projections',
      title: 'Мащаб и проекции',
      formulas: [
        {
          name: 'Мащаб',
          formula: 'L_{\\text{терен}} = M \\cdot L_{\\text{карта}},\\quad S_{\\text{терен}} = M^2 \\cdot S_{\\text{карта}}',
          note: 'при мащаб $1 : M$; 1 : 50 000 – „в 1 cm – 500 m“',
          lesson: '/geography/maps/projections',
        },
        {
          name: 'Изкривяване на лицата',
          formula: 'p = h \\cdot k',
          note: '$h$ – мащаб по меридиана, $k$ – по паралела (спрямо главния мащаб)',
          lesson: '/geography/maps/projections',
        },
        {
          name: 'Проекция на Меркатор',
          formula: 'x = R\\lambda,\\quad y = R \\ln \\operatorname{tg}\\left(45^\\circ + \\frac{\\varphi}{2}\\right),\\quad h = k = \\frac{1}{\\cos\\varphi}',
          note: 'равноъгълна; лицата растат $1/\\cos^2\\varphi$ пъти',
          lesson: '/geography/maps/projections',
        },
        {
          name: 'Равновелика цилиндрична (Гал–Петерс)',
          formula: 'x = R\\lambda\\cos 45^\\circ,\\quad y = \\frac{R\\sin\\varphi}{\\cos 45^\\circ},\\quad h \\cdot k = 1',
          lesson: '/geography/maps/projections',
        },
      ],
    },
    {
      id: 'topography',
      title: 'Релеф на картата',
      formulas: [
        {
          name: 'Наклон на склона',
          formula: 'i = \\frac{\\Delta h}{d} \\cdot 100\\%,\\quad \\operatorname{tg}\\alpha = \\frac{\\Delta h}{d}',
          note: '$d$ – хоризонталното разстояние; $100\\% = 45^\\circ$',
          lesson: '/geography/maps/topography',
        },
        {
          name: 'Вертикално преувеличение',
          formula: 'k = \\frac{M_{\\text{хор}}}{M_{\\text{верт}}}',
          note: '$M$ – знаменателите на мащабите; при $1 : 25\\,000$ и $1 : 5000$ $k = 5$',
          lesson: '/geography/maps/topography',
        },
        {
          name: 'Разстояние до хоризонта',
          formula: 'd \\approx \\sqrt{2Rh} \\approx 3{,}57\\sqrt{h}\\ \\mathrm{km}',
          note: '$h$ в метри, без пречупването във въздуха',
          lesson: '/geography/maps/topography',
        },
        {
          name: 'Правило на Нейсмит',
          formula: 't = \\frac{s}{5\\ \\mathrm{km/h}} + \\frac{\\Delta h_{\\uparrow}}{600\\ \\mathrm{m/h}}',
          note: 'време за пешеходен маршрут без почивките',
          lesson: '/geography/maps/topography',
        },
      ],
    },
    {
      id: 'gis',
      title: 'Спътници и GPS',
      formulas: [
        {
          name: 'Вегетационен индекс',
          formula: '\\mathrm{NDVI} = \\frac{\\text{БИЧ} - \\text{Ч}}{\\text{БИЧ} + \\text{Ч}}',
          note: 'от −1 до 1; вода < 0, гъста растителност > 0,6',
          lesson: '/geography/maps/gis',
        },
        {
          name: 'Разстояние по времето на сигнала',
          formula: 'd = c\\,\\Delta t,\\quad 1\\ \\mu\\mathrm{s} \\leftrightarrow 300\\ \\mathrm{m}',
          note: 'GPS: поне 4 спътника – три координати и грешката в часовника',
          lesson: '/geography/maps/gis',
        },
        {
          name: 'Пиксел на терена',
          formula: 'a = \\frac{H\\,p}{f}',
          note: '$H$ – височина на спътника, $p$ – пиксел на сензора, $f$ – фокусно разстояние',
          lesson: '/geography/maps/gis',
        },
      ],
    },
    {
      id: 'interior',
      title: 'Строеж на Земята',
      formulas: [
        {
          name: 'Средна плътност на Земята',
          formula: '\\bar\\rho = \\frac{M}{\\frac43 \\pi R^3} \\approx 5{,}51\\ \\mathrm{g/cm^3}',
          note: 'два пъти повече от скалите на кората (≈ 2,7) – навътре има плътно ядро',
          lesson: '/geography/lithosphere/interior',
        },
        {
          name: 'Изостазия по Ейри',
          formula: 'r = h \\cdot \\frac{\\rho_{\\text{к}}}{\\rho_{\\text{м}} - \\rho_{\\text{к}}}',
          note: '$r$ – корен на планина с височина $h$; при 2,7 и 3,3 g/cm³ $r \\approx 4{,}5\\,h$',
          lesson: '/geography/lithosphere/interior',
        },
        {
          name: 'Потъване под ледена шапка',
          formula: 'd = t \\cdot \\frac{\\rho_{\\text{л}}}{\\rho_{\\text{м}}}',
          note: '$t$ – дебелина на леда; при 0,917 и 3,3 g/cm³ $d \\approx 0{,}28\\,t$',
          lesson: '/geography/lithosphere/interior',
        },
        {
          name: 'Двуслоен модел на Земята',
          formula: '\\bar\\rho = \\rho_{\\text{м}} + (\\rho_{\\text{я}} - \\rho_{\\text{м}})\\,x^3,\\quad \\frac{I}{MR^2} = \\frac{0{,}4\\,[\\rho_{\\text{м}} + (\\rho_{\\text{я}} - \\rho_{\\text{м}})\\,x^5]}{\\bar\\rho}',
          note: '$x$ – радиусът на ядрото спрямо радиуса на Земята; за Земята $I/(MR^2) = 0{,}331$',
          lesson: '/geography/lithosphere/interior',
        },
        {
          name: 'Пречупване на сеизмична вълна',
          formula: '\\frac{\\sin\\alpha}{v_1} = \\frac{\\sin\\beta}{v_2}',
          note: 'в сферична Земя $\\frac{r \\sin i}{v}$ е едно и също по целия лъч',
          lesson: '/geography/lithosphere/interior',
        },
      ],
    },
    {
      id: 'plates',
      title: 'Тектоника на плочите',
      formulas: [
        {
          name: 'Път на плочата',
          formula: 's = v\\,t,\\quad 1\\ \\mathrm{cm/год} \\cdot 1\\ \\text{млн. г.} = 10\\ \\mathrm{km}',
          note: 'скоростите на плочите са от около 1 до над 10 cm/год',
          lesson: '/geography/lithosphere/plates',
        },
        {
          name: 'Скорост на спрединга',
          formula: 'v_{1/2} = \\frac{x}{t},\\quad v = 2v_{1/2}',
          note: '$x$ – разстояние от оста на хребета до ивица с възраст $t$',
          lesson: '/geography/lithosphere/plates',
        },
        {
          name: 'Дълбочина на океана и възраст на дъното',
          formula: 'd \\approx 2500 + 350\\sqrt{t}',
          note: '$d$ в метри, $t$ в милиони години (до около 70 млн. години)',
          lesson: '/geography/lithosphere/plates',
        },
      ],
    },
    {
      id: 'hazards',
      title: 'Земетресения и вулкани',
      formulas: [
        {
          name: 'Разстояние до огнището',
          formula: 'd = \\frac{v_P v_S}{v_P - v_S}(t_S - t_P) \\approx 8\\ \\mathrm{km/s} \\cdot (t_S - t_P)',
          note: 'при $v_P \\approx 6$ km/s и $v_S \\approx 3{,}5$ km/s в земната кора',
          lesson: '/geography/lithosphere/hazards',
        },
        {
          name: 'Магнитуд и енергия',
          formula: '\\lg E \\approx 1{,}5\\,M + 4{,}8,\\quad \\frac{E_2}{E_1} = 10^{1{,}5(M_2 - M_1)}',
          note: '$E$ в джаули; +1 магнитуд – амплитуда ×10, енергия ×≈32',
          lesson: '/geography/lithosphere/hazards',
        },
        {
          name: 'Моментен магнитуд',
          formula: 'M_w = \\frac{2}{3}(\\lg M_0 - 9{,}1),\\quad M_0 = \\mu S D',
          note: '$M_0$ в N·m; $\\mu$ – твърдост на скалите, $S$ – площ на разлома, $D$ – приплъзване',
          lesson: '/geography/lithosphere/hazards',
        },
        {
          name: 'Скорост на цунами',
          formula: 'v = \\sqrt{g h},\\quad H \\sim h^{-1/4}',
          note: '$h$ – дълбочина; в плитчините вълната се забавя и расте (закон на Грийн)',
          lesson: '/geography/lithosphere/hazards',
        },
      ],
    },
    {
      id: 'landforms',
      title: 'Външни сили и релеф',
      formulas: [
        {
          name: 'Коефициент на извитост',
          formula: 'k = \\frac{L_{\\text{корито}}}{L_{\\text{долина}}}',
          note: '$k \\geq 1{,}5$ – меандрираща река',
          lesson: '/geography/lithosphere/landforms',
        },
        {
          name: 'Разтваряне на варовика',
          formula: '\\mathrm{CaCO_3 + H_2O + CO_2 \\rightleftharpoons Ca^{2+} + 2HCO_3^-}',
          note: 'повече $\\mathrm{CO_2}$ и по-студена вода – повече разтворен варовик; отделянето на $\\mathrm{CO_2}$ в пещерата утаява сталактити',
          lesson: '/geography/lithosphere/landforms',
        },
        {
          name: 'Карстова денудация',
          formula: 'h = \\frac{R \\cdot c}{\\rho}',
          note: '$R$ – отток (m за година), $c$ – разтворен $\\mathrm{CaCO_3}$ (g/m³), $\\rho \\approx 2{,}7 \\cdot 10^6$ g/m³; $h$ – снижаване за година',
          lesson: '/geography/lithosphere/landforms',
        },
        {
          name: 'Утаяване (закон на Стокс)',
          formula: 'v = \\frac{(\\rho_{\\text{з}} - \\rho)\\,g\\,d^2}{18\\,\\eta}',
          note: 'скорост на падане на малко зърно в покойна вода; 10 пъти по-дребно зърно пада 100 пъти по-бавно',
          lesson: '/geography/lithosphere/landforms',
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
      id: 'intro',
      title: 'Въведение',
      formulas: [
        {
          name: 'Време за светлината',
          formula: 't = \\frac{d}{c}, \\qquad c \\approx 3 \\cdot 10^8\\ \\mathrm{m/s}',
          note: 'Слънце – 8,3 min, Луна – 1,3 s; виждаме обекта такъв, какъвто е бил преди t',
          lesson: '/astronomy/intro',
        },
        {
          name: 'Ъгъл при малки размери',
          formula: "\\alpha = \\frac{D}{d}\\ (\\mathrm{rad}) \\approx 57{,}3^\\circ \\cdot \\frac{D}{d} \\approx 206\\,265'' \\cdot \\frac{D}{d}",
          note: 'при d много по-голямо от D; Слънцето и Луната – около 0,5°',
          lesson: '/astronomy/intro',
        },
        {
          name: 'Единици за разстояние',
          formula: '1\\ \\mathrm{AU} \\approx 1{,}496 \\cdot 10^{8}\\ \\mathrm{km} \\qquad 1\\ \\mathrm{ly} \\approx 9{,}46 \\cdot 10^{12}\\ \\mathrm{km} \\qquad 1\\ \\mathrm{pc} \\approx 3{,}26\\ \\mathrm{ly} \\approx 206\\,265\\ \\mathrm{AU}',
          lesson: '/astronomy/intro',
        },
        {
          name: 'Ъглови единици',
          formula: "1^\\circ = 60' = 3600'' \\qquad 1\\ \\mathrm{rad} \\approx 57{,}3^\\circ \\approx 206\\,265''",
          lesson: '/astronomy/intro',
        },
      ],
    },
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
