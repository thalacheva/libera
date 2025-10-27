import Example from '~/Example';
import Quiz from '~/Quiz';

export function Quadrangle() {
  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Четириъгълник</h1>
      <h2 className="text-xl font-bold mb-3 text-blue-600 mt-6">
        Лице на правоъгълник
      </h2>
      <p className="mb-4 leading-relaxed">
        Правоъгълник е четириъгълник с четири прави ъгъла. Лицето на
        правоъгълника се изчислява по формулата <code>A = a × b</code>, където a
        и b са дължините на страните.
      </p>
      <Example
        description="Изчисляване на лицето на правоъгълник със страни a = 5 cm и b = 3 cm"
        steps={[
          'Използваме формулата: A = a × b',
          'Заместваме стойностите: A = 5 × 3',
          'Получаваме резултат: A = 15 cm²',
        ]}
      />
      <Quiz
        questions={[
          {
            title: 'Изчислете лицето',
            question:
              'Правоъгълник има страни a = 7 cm и b = 4 cm. Колко е лицето му?',
            answers: ['A = 24 cm²', 'A = 26 cm²', 'A = 28 cm²', 'A = 30 cm²'],
            correctAnswer: 'A = 28 cm²',
          },
        ]}
      />
    </main>
  );
}
