import { CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

export type Question = {
  question: string;
  answers: string[];
  correctAnswer: string;
};

export default function Quiz({ questions }: { questions: Question[] }) {
  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <Question key={question.question} {...question} index={index + 1} />
      ))}
    </div>
  );
}

function Question({
  question,
  answers,
  correctAnswer,
  index,
}: Question & { index: number }) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const checkAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setIsCorrect(answer === correctAnswer);
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border border-amber-200 dark:border-amber-800 p-4 sm:p-6 rounded-2xl shadow-lg mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-amber-600 dark:bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
          {index}
        </div>
        <div className="flex-1">
          <h2 className="text-base sm:text-lg font-bold text-amber-900 dark:text-amber-200">
            {question}
          </h2>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {answers.map(ans => (
          <button
            key={ans}
            onClick={() => checkAnswer(ans)}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm sm:text-base font-medium ${
              selectedAnswer === ans
                ? isCorrect
                  ? 'border-green-500 dark:border-green-400 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200'
                  : 'border-red-500 dark:border-red-400 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-400 dark:hover:border-amber-600 text-gray-700 dark:text-gray-200'
            }`}
          >
            {ans}
          </button>
        ))}
      </div>
      {isCorrect !== null && (
        <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
          <div
            className={`flex items-center gap-2 font-semibold text-sm sm:text-base ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
          >
            {isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
            {isCorrect ? 'Правилен отговор! 🎉' : 'Опитай отново!'}
          </div>
        </div>
      )}
    </div>
  );
}
