import Theorem from '~/Theorem';
import { InteractiveCircle } from './InteractiveCircle';

export function Circle() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-blue-600">
        Основни свойства на кръга
      </h1>

      <Theorem
        type="definition"
        title="Основни елементи на кръга"
        description="Кръг е множество от всички точки в равнината, които са на еднакво разстояние (радиус r) от една фиксирана точка (център O). Диаметърът d е отсечка, минаваща през центъра и свързваща две точки от кръга, като d = 2r."
        graphic={<InteractiveCircle type="basic" />}
      />

      <Theorem
        type="theorem"
        title="Лице и обиколка на кръг"
        description="Обиколката (периметърът) на кръг се изчислява с формулата C = 2πr или C = πd, където r е радиусът, а d е диаметърът. Лицето на кръг се изчислява с формулата A = πr². Числото π (пи) ≈ 3.14159 е константа, която представлява отношението между обиколката и диаметъра на всеки кръг."
        graphic={<InteractiveCircle type="area-circumference" />}
      />

      <Theorem
        type="definition"
        title="Радиан"
        description="Радианът е мерна единица за ъгли в математиката. Един радиан е централен ъгъл, чиято дъга има дължина, равна на радиуса на кръга. Пълен кръг съдържа 2π радиана, което е еквивалентно на 360°. Следователно: 1 радиан ≈ 57.3°, а 1° ≈ 0.01745 радиана. Формулата за преобразуване е: θ(рад) = θ(°) × π/180."
        graphic={<InteractiveCircle type="radian" />}
      />

      <Theorem
        type="definition"
        title="Хорда на кръг"
        description="Хорда е отсечка, която свързва две точки на кръга. Диаметърът е най-дългата хорда, която минава през центъра. Перпендикулярът от центъра към хордата я разделя на две равни части."
        graphic={<InteractiveCircle type="chord" />}
      />

      <Theorem
        type="definition"
        title="Дъга и централен ъгъл"
        description="Дъга е част от кръга между две точки. Централният ъгъл е ъгъл с връх в центъра на кръга. Дължината на дъгата L се изчислява с формулата L = (θ/360°) × 2πr, където θ е ъгълът в градуси."
        graphic={<InteractiveCircle type="arc" />}
      />

      <Theorem
        type="definition"
        title="Сектор на кръг"
        description="Секторът е част от кръга, ограничена от два радиуса и дъга между тях. Лицето на сектора A се изчислява с формулата A = (θ/360°) × πr², където θ е централният ъгъл в градуси."
        graphic={<InteractiveCircle type="sector" />}
      />
    </main>
  );
}
