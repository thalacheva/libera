import { useState } from 'react';

export type WordProblem = {
  title: string;
  problem: string;
  solution: string[];
  answer: string;
};

export function WordProblems({ problems }: { problems: WordProblem[] }) {
  const [open, setOpen] = useState<{ [key: number]: boolean }>({});

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {problems.map((p, i) => (
        <div key={p.title} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex flex-col">
          <p className="font-semibold mb-2">{p.title}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 flex-1">{p.problem}</p>
          <button
            onClick={() => setOpen(prev => ({ ...prev, [i]: !prev[i] }))}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm text-left"
          >
            {open[i] ? '▼ Скрий решението' : '▶ Покажи решението'}
          </button>
          {open[i] && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
              {p.solution.map(line => (
                <p key={line} className="font-mono">{line}</p>
              ))}
              <p className="mt-2 font-semibold">Отговор: {p.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
