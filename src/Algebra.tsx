import Example from './Example';
import Quiz from './Quiz';

export default function Algebra() {
  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">
        Решаване на линейни уравнения
      </h1>
      <p className="mb-4 leading-relaxed">
        Линейно уравнение с една променлива е уравнение, което може да се запише
        във формат <code>ax + b = 0</code>. За да се намери решението,
        променливата трябва да се изолира от едната страна.
      </p>
      <Example
        description="Да разгледаме уравнението 2x + 4 = 10"
        steps={[
          'Изваждане на 4 от двете страни: 2x = 6',
          'Деление на двете страни на 2: x = 3',
        ]}
      />
      <Quiz
        questions={[
          {
            title: 'Решете уравнението',
            question: 'Намери x в уравнението: 3x + 5 = 14',
            answers: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
            correctAnswer: 'x = 3',
          },
        ]}
      />
    </main>
  );
}
