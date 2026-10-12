// Прогресът на ученика се пази в браузъра (localStorage), отделно за всяка страница.
// Ключовете за задачите и текстовите задачи са от Task.tsx и WordProblems.tsx;
// тук са и общият им брой (записва се при отваряне на урока) и резултатите от тестовете.

import type { Question } from './Quiz';

const PREFIX = {
  tasks: 'libera-tasks:',
  tasksTotal: 'libera-tasks-total:',
  problems: 'libera-problems:',
  problemsTotal: 'libera-problems-total:',
  quiz: 'libera-quiz:',
};

export type QuizRecord = {
  best: number;
  last: number;
  total: number;
  attempts: number;
  /** Кога е последният опит (ms от 1970 г.). */
  at: number;
  /** Сгрешените въпроси от последния опит – за „Преговори грешките“. */
  missed: Question[];
};

export type LessonProgress = {
  tasksSolved: number;
  tasksTotal: number | null;
  problemsSolved: number;
  problemsTotal: number | null;
  quiz: QuizRecord | null;
};

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // без запомняне – няма проблем
  }
}

const countSolved = (status: Record<string, string> | null) => Object.values(status ?? {}).filter(s => s === 'solved').length;

export const currentPath = () => (typeof window === 'undefined' ? '' : window.location.pathname);

export const saveTasksTotal = (path: string, n: number) => write(PREFIX.tasksTotal + path, n);
export const saveProblemsTotal = (path: string, n: number) => write(PREFIX.problemsTotal + path, n);

export function saveQuizResult(path: string, score: number, total: number, missed: Question[]) {
  const prev = read<QuizRecord>(PREFIX.quiz + path);
  write(PREFIX.quiz + path, {
    best: Math.max(prev?.best ?? 0, score),
    last: score,
    total,
    attempts: (prev?.attempts ?? 0) + 1,
    at: Date.now(),
    missed,
  } satisfies QuizRecord);
}

/** Въпросът е отговорен вярно при преговора – махаме го от грешките на урока. */
export function removeMistake(path: string, question: string) {
  const rec = read<QuizRecord>(PREFIX.quiz + path);
  if (!rec) return;
  write(PREFIX.quiz + path, { ...rec, missed: rec.missed.filter(q => q.question !== question) });
}

export function lessonProgress(path: string): LessonProgress {
  return {
    tasksSolved: countSolved(read(PREFIX.tasks + path)),
    tasksTotal: read<number>(PREFIX.tasksTotal + path),
    problemsSolved: countSolved(read(PREFIX.problems + path)),
    problemsTotal: read<number>(PREFIX.problemsTotal + path),
    quiz: read<QuizRecord>(PREFIX.quiz + path),
  };
}

export const hasActivity = (p: LessonProgress) => p.tasksSolved > 0 || p.problemsSolved > 0 || p.quiz !== null;

/** Изтрива целия прогрес (задачи, текстови задачи, тестове). Настройките, напр. градът в „Тази вечер“, остават. */
export function clearProgress() {
  try {
    const keys = Object.keys(window.localStorage).filter(k => Object.values(PREFIX).some(p => k.startsWith(p)));
    keys.forEach(k => window.localStorage.removeItem(k));
  } catch {
    // няма какво да изтрием
  }
}
