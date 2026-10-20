// Структурирани данни (JSON-LD, schema.org) за търсачките – по една графа за всяка страница.
// Записват се в готовия HTML при build (vite.config.js) и се обновяват при навигация (Seo.tsx).

import { allPages, homePage, type PageMeta, SITE_NAME, SITE_URL } from './pages';
import { astronomyIntro, astronomyTopics, biologyTopics, chemistryTopics, mathTopics, physicsTopics } from './topics';

const SECTIONS = [
  { path: '/math', name: 'Математика', topics: mathTopics },
  { path: '/physics', name: 'Физика', topics: physicsTopics },
  { path: '/astronomy', name: 'Астрономия', topics: astronomyTopics },
  { path: '/chemistry', name: 'Химия', topics: chemistryTopics },
  { path: '/biology', name: 'Биология', topics: biologyTopics },
];

const lessonsOf = (topics: typeof mathTopics) => [
  ...(topics === astronomyTopics ? [astronomyIntro.path] : []),
  ...topics.flatMap(t => t.subtopics.map(s => t.path + s.path)),
];
const sectionOf = (path: string) => SECTIONS.find(s => lessonsOf(s.topics).includes(path));
const pageAt = (path: string) => allPages.find(p => p.path === path);
/** Заглавието без „— урок по …“. */
const shortTitle = (page: PageMeta) => page.title.split(' — ')[0];

/** Лицензът на учебното съдържание (кодът е под MIT). */
const CONTENT_LICENSE = 'https://creativecommons.org/licenses/by-nc-sa/4.0/';

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;
const courseId = (sectionPath: string) => `${SITE_URL}${sectionPath}#course`;

const organization = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/apple-touch-icon.png`,
  email: 'ninelibera@gmail.com',
};

const breadcrumbs = (items: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: SITE_URL + (it.path === '/' ? '/' : it.path),
  })),
});

const common = (page: PageMeta) => ({
  name: page.title,
  description: page.description,
  url: SITE_URL + (page.path === '/' ? '/' : page.path),
  inLanguage: 'bg',
  isPartOf: { '@id': SITE_ID },
});

export function structuredData(page: PageMeta): object {
  if (page === homePage) {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        organization,
        {
          '@type': 'WebSite',
          '@id': SITE_ID,
          name: SITE_NAME,
          alternateName: 'Libera – учи свободно',
          description: page.description,
          url: `${SITE_URL}/`,
          inLanguage: 'bg',
          publisher: { '@id': ORG_ID },
        },
      ],
    };
  }

  const home = { name: 'Начало', path: '/' };
  const section = SECTIONS.find(s => s.path === page.path);
  if (section) {
    const lessons = lessonsOf(section.topics).map(pageAt).filter((p): p is PageMeta => !!p);
    return {
      '@context': 'https://schema.org',
      '@graph': [
        organization,
        {
          '@type': 'Course',
          '@id': courseId(section.path),
          ...common(page),
          name: section.name,
          provider: { '@id': ORG_ID },
          isAccessibleForFree: true,
          hasPart: lessons.map(l => ({ '@type': 'LearningResource', name: shortTitle(l), url: SITE_URL + l.path })),
        },
        breadcrumbs([home, { name: section.name, path: section.path }]),
      ],
    };
  }

  const lessonSection = sectionOf(page.path);
  if (lessonSection) {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        organization,
        {
          '@type': 'LearningResource',
          ...common(page),
          name: shortTitle(page),
          headline: page.title,
          learningResourceType: lessonSection.path === '/astronomy' ? 'лекция' : 'урок',
          educationalLevel: 'средно образование',
          about: lessonSection.name,
          isAccessibleForFree: true,
          license: CONTENT_LICENSE,
          author: { '@id': ORG_ID },
          publisher: { '@id': ORG_ID },
          isPartOf: [{ '@id': SITE_ID }, { '@type': 'Course', '@id': courseId(lessonSection.path), name: lessonSection.name }],
        },
        breadcrumbs([home, { name: lessonSection.name, path: lessonSection.path }, { name: shortTitle(page), path: page.path }]),
      ],
    };
  }

  // Справочник, речник, „Моят напредък“, „Тази вечер“
  const parent = page.path.startsWith('/astronomy/') ? [{ name: 'Астрономия', path: '/astronomy' }] : [];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      { '@type': 'WebPage', ...common(page), publisher: { '@id': ORG_ID } },
      breadcrumbs([home, ...parent, { name: shortTitle(page), path: page.path }]),
    ],
  };
}

/** JSON за <script type="application/ld+json"> – „<“ се екранира, за да не затвори тага. */
export const structuredDataJson = (page: PageMeta) => JSON.stringify(structuredData(page)).replace(/</g, '\\u003c');
