import { useState } from 'react';
import { Slider, Sliders } from '~/functions/plot';
import { Buttons, DiagramButton, Note, Readout } from '~/geometry/diagram';
import { type Message, messageTokens, ROLE_MARK, usedTokens, visibleMessages } from './chatTools';

const SYSTEM: Message = { role: 'system', text: 'Ти си учтив помощник на ученици. Отговаряй кратко.' };
const START: Message[] = [
  { role: 'user', text: 'Здравей! Казвам се Мира и уча за контролно по биология.' },
  { role: 'assistant', text: 'Здравей! С какво да помогна?' },
];
const MIDDLE: Message[][] = [
  [
    { role: 'user', text: 'Какво е фотосинтеза?' },
    { role: 'assistant', text: 'Процес, при който растенията правят глюкоза от вода и въглероден диоксид с помощта на светлина.' },
  ],
  [
    { role: 'user', text: 'А къде в клетката става това?' },
    { role: 'assistant', text: 'В хлоропластите – зелените органели на растителната клетка.' },
  ],
  [
    { role: 'user', text: 'Защо листата са зелени?' },
    { role: 'assistant', text: 'Хлорофилът поглъща червената и синята светлина, а зелената отразява.' },
  ],
];
const LAST: Message = { role: 'user', text: 'Благодаря! Между другото, как се казвам?' };

/** Разговорът като балончета и като един текст с маркери за ролите; контекст с избрана дължина, от който отпадат най-старите реплики. */
export default function ChatFormatLab() {
  const [turns, setTurns] = useState(1);
  const [limit, setLimit] = useState(160);

  const messages = [SYSTEM, ...START, ...MIDDLE.slice(0, turns).flat(), LAST];
  const keep = visibleMessages(messages, limit);
  const total = 1 + messages.reduce((s, m) => s + messageTokens(m), 0);
  const used = usedTokens(messages, keep);
  // Името е казано в първата реплика на потребителя (номер 1 в списъка)
  const knowsName = keep[1];
  const seesQuestion = keep[messages.length - 1];
  const reply = !seesQuestion ? '…' : knowsName ? 'Казваш се Мира. Успех на контролното!' : 'Не знам – в този разговор не си ми казвал името си.';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-300">Както го вижда човекът</p>
          <div className="space-y-1.5">
            {messages.map((m, i) =>
              m.role === 'system' ? null : (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-2.5 py-1.5 rounded-xl text-xs sm:text-sm ${m.role === 'user' ? 'bg-fuchsia-100 dark:bg-fuchsia-900/40 text-gray-900 dark:text-gray-100' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'} ${keep[i] ? '' : 'opacity-35 line-through'}`}>{m.text}</div>
                </div>
              )
            )}
            <div className="flex justify-start">
              <div className={`max-w-[85%] px-2.5 py-1.5 rounded-xl text-xs sm:text-sm border-2 ${knowsName ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40'} text-gray-900 dark:text-gray-100`}>{reply}</div>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-300">Както го вижда моделът – един текст</p>
          <div className="font-mono text-[11px] sm:text-xs leading-relaxed p-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 break-words">
            {messages.map((m, i) => (
              <p key={i} className={keep[i] ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500 line-through'}>
                <span className={keep[i] ? 'text-fuchsia-700 dark:text-fuchsia-300 font-bold' : ''}>{ROLE_MARK[m.role]}</span> {m.text} <span className="text-gray-400 dark:text-gray-500 no-underline">[{messageTokens(m)}]</span>
              </p>
            ))}
            <p className="text-gray-800 dark:text-gray-100">
              <span className="text-fuchsia-700 dark:text-fuchsia-300 font-bold">{ROLE_MARK.assistant}</span> <span className="bg-amber-200 dark:bg-amber-700/60 px-1">▌ оттук пише моделът</span>
            </p>
          </div>
        </div>
      </div>
      <Sliders>
        <Slider label="контекст, токени" value={limit} onChange={setLimit} min={40} max={200} step={5} tone="violet" />
      </Sliders>
      <Buttons>
        <DiagramButton onClick={() => setTurns(Math.min(MIDDLE.length, turns + 1))}>добави въпрос и отговор</DiagramButton>
        <DiagramButton onClick={() => setTurns(Math.max(0, turns - 1))}>махни последните</DiagramButton>
      </Buttons>
      <div className="mt-3">
        <Readout
          items={[
            { label: 'целият разговор', value: `${total} токена` },
            { label: 'в контекста', value: `${used} от ${limit}`, tone: 'violet' },
            { label: 'отпаднали реплики', value: keep.filter(k => !k).length, tone: keep.every(Boolean) ? 'emerald' : 'rose' },
          ]}
        />
      </div>
      <Note tone={knowsName ? 'emerald' : 'rose'}>
        {knowsName
          ? 'Целият разговор се побира. Моделът „помни“ името само защото репликата с него все още е в текста, който чете.'
          : 'Разговорът не се побира и най-старите реплики са отпаднали – сред тях и тази с името. Моделът не я е „забравил“: той изобщо не я вижда.'}{' '}
        Числата в скоби са груба оценка – един токен на три знака плюс един за маркера.
      </Note>
    </div>
  );
}
