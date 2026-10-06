import type { ReactNode } from 'react';

/** Задача със скриваемо решение. */
export default function Task({
  id,
  number,
  color,
  question,
  children,
  shown,
  onToggle,
}: {
  id: string;
  number: number;
  color: string;
  question: ReactNode;
  children: ReactNode;
  shown: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-l-4 ${color}`}
    >
      <div className="font-semibold mb-2">
        {number}. {question}
      </div>
      <button
        onClick={() => onToggle(id)}
        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
      >
        {shown ? '▼ Скрий решението' : '▶ Покажи решението'}
      </button>
      {shown && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}
