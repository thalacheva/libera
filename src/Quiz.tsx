import { CheckCircle } from 'lucide-react';
import { useState } from 'react';

export type Question = {
  title: string;
  question: string;
  answers: string[];
  correctAnswer: string;
};

export default function Quiz({ questions }: { questions: Question[] }) {
  return (
    <div>
      {questions.map(question => (
        <Question key={question.question} {...question} />
      ))}
    </div>
  );
}

function Question({ title, question, answers, correctAnswer }: Question) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const checkAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setIsCorrect(answer === correctAnswer);
  };

  return (
    <div className="bg-cyan-50 dark:bg-cyan-900/30 p-6 rounded-2xl shadow-md">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="mb-3">{question}</p>
      <div className="space-y-2">
        {answers.map(ans => (
          <button
            key={ans}
            onClick={() => checkAnswer(ans)}
            className={`w-full text-left px-3 py-2 rounded-lg border transition ${
              selectedAnswer === ans
                ? isCorrect
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/40'
                  : 'border-red-500 bg-red-50 dark:bg-red-900/40'
                : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {ans}
          </button>
        ))}
      </div>
      {isCorrect !== null && (
        <div
          className={`mt-3 font-medium flex items-center gap-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
        >
          <CheckCircle size={18} />
          {isCorrect ? 'Правилнен отговор! 🎉' : 'Опитай отново! 💩'}
        </div>
      )}
    </div>
  );
}
