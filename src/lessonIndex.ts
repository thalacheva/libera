// Списък на всички уроци за търсачката: име, група, предмет и краткото описание от pages.ts.

import { lessonPages } from './pages';
import { aiTopics, astronomyTopics, biologyTopics, chemistryTopics, geographyTopics, mathTopics, physicsTopics } from './topics';

export type LessonEntry = {
  path: string;
  name: string;
  group: string;
  subject: string;
  /** Началната страница на предмета: /math, /physics, … */
  subjectPath: string;
  about: string;
};

const SUBJECTS: [string, string, typeof mathTopics][] = [
  ['Математика', '/math', mathTopics],
  ['Физика', '/physics', physicsTopics],
  ['Астрономия', '/astronomy', astronomyTopics],
  ['Химия', '/chemistry', chemistryTopics],
  ['Биология', '/biology', biologyTopics],
  ['География', '/geography', geographyTopics],
  ['Изкуствен интелект', '/ai', aiTopics],
];

const aboutOf = new Map(lessonPages.map(p => [p.path, p.about ?? '']));

export const LESSONS: LessonEntry[] = SUBJECTS.flatMap(([subject, subjectPath, topics]) =>
  topics.flatMap(t => t.subtopics.map(s => ({ path: t.path + s.path, name: s.name, group: t.name, subject, subjectPath, about: aboutOf.get(t.path + s.path) ?? '' })))
);

export const normalize = (s: string) => s.toLocaleLowerCase('bg').replace(/\s+/g, ' ').trim();

/**
 * Колко добре урокът отговаря на търсенето: 0 – не отговаря; по-голямо число – по-добре.
 * Всяка дума от търсенето трябва да се среща в името, групата или описанието.
 */
export function score(lesson: LessonEntry, query: string): number {
  const words = normalize(query).split(' ').filter(Boolean);
  if (!words.length) return 0;
  const name = normalize(lesson.name);
  const group = normalize(lesson.group);
  const about = normalize(lesson.about);
  let total = 0;
  for (const w of words) {
    if (name.startsWith(w)) total += 8;
    else if (name.split(' ').some(part => part.startsWith(w))) total += 6;
    else if (name.includes(w)) total += 4;
    else if (group.includes(w)) total += 2;
    else if (about.includes(w)) total += 1;
    else return 0;
  }
  return total;
}

/** Уроците, които отговарят на търсенето, най-добрите първи; с `subjectPath` – само от един предмет. */
export function searchLessons(query: string, subjectPath?: string): LessonEntry[] {
  return LESSONS.filter(l => !subjectPath || l.subjectPath === subjectPath)
    .map(l => ({ l, s: score(l, query) }))
    .filter(r => r.s > 0)
    .sort((a, b) => b.s - a.s)
    .map(r => r.l);
}
