// Проверява числовите отговори на задачите за упражнение (<Task check={[…]} ask={[…]}>).
//   node scripts/check-answers.mjs <файлове…>     (по подразбиране – всички уроци)
// За всяка задача с check: всяко число трябва да се среща в решението ѝ (дробите \frac{a}{b}
// и десетичните със запетая се пресмятат), а етикетите в ask да нямат единични „\“.
// Накрая отпечатва колко задачи имат поле за отговор и кои са без.
import fs from 'fs';
import path from 'path';

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs
      .readdirSync('src', { recursive: true })
      .map(f => path.join('src', f))
      .filter(f => f.endsWith('.tsx') && fs.readFileSync(f, 'utf8').includes('<Task'));

/** Отварящият таг <Task …> – с внимание към низове и {…}, в които може да има „>“. */
function parseOpening(src, start) {
  let i = start + '<Task'.length;
  const attrs = {};
  while (i < src.length) {
    while (/\s/.test(src[i])) i++;
    if (src[i] === '>') return { attrs, end: i + 1 };
    if (src.startsWith('/>', i)) return { attrs, end: i + 2, selfClosing: true };
    const m = /^[A-Za-z]+/.exec(src.slice(i));
    if (!m) throw new Error(`неочакван символ „${src[i]}“`);
    const name = m[0];
    i += name.length;
    if (src[i] !== '=') {
      attrs[name] = true;
      continue;
    }
    i++;
    if (src[i] === '"') {
      const j = src.indexOf('"', i + 1);
      attrs[name] = src.slice(i + 1, j);
      i = j + 1;
    } else if (src[i] === '{') {
      let depth = 0;
      let j = i;
      let quote = null;
      for (; j < src.length; j++) {
        const c = src[j];
        if (quote) {
          if (c === '\\') j++;
          else if (c === quote) quote = null;
        } else if (c === '"' || c === "'" || c === '`') quote = c;
        else if (c === '{') depth++;
        else if (c === '}' && --depth === 0) break;
      }
      attrs[name] = src.slice(i + 1, j);
      i = j + 1;
    } else throw new Error(`атрибут ${name} без стойност`);
  }
  throw new Error('незатворен <Task');
}

/** Всички числа в текста на решението, вкл. стойностите на \frac{a}{b} и a/b. */
function numbersIn(text) {
  const t = text
    .replace(/\{,\}/g, '.')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/\\+,/g, '')
    .replace(/(\d)\s(?=\d{3}\b)/g, '$1')
    .replace(/−/g, '-');
  const nums = [...t.matchAll(/\d+(?:\.\d+)?/g)].map(m => Number(m[0]));
  for (const m of t.matchAll(/\\[dt]?frac\{(-?[\d.]+)\}\{([\d.]+)\}/g)) nums.push(Number(m[1]) / Number(m[2]));
  for (const m of t.matchAll(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/g)) nums.push(Number(m[1]) / Number(m[2]));
  return nums;
}

// Същият допуск като в src/answerCheck.ts
const close = (a, b) => Math.abs(a - b) <= (b === 0 ? 0.011 : Math.max(Math.abs(b) * 0.006, Math.min(0.011, Math.abs(b) * 0.05)));

let problems = 0;
let withCheck = 0;
let total = 0;
const without = [];

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  let pos = 0;
  while ((pos = src.indexOf('<Task', pos)) >= 0) {
    if (!/\s/.test(src[pos + 5])) {
      pos += 5;
      continue;
    }
    const { attrs, end, selfClosing } = parseOpening(src, pos);
    const close_ = selfClosing ? end : src.indexOf('</Task>', end);
    const body = selfClosing ? '' : src.slice(end, close_);
    pos = close_;
    total++;
    const where = `${file} ${attrs.id}`;
    if (!attrs.check) {
      without.push(where);
      continue;
    }
    withCheck++;
    let values;
    try {
      values = Function(`return ${attrs.check}`)();
    } catch (e) {
      console.log(`✗ ${where}: check не се пресмята (${e.message})`);
      problems++;
      continue;
    }
    if (attrs.ask) {
      // В JS низ „\f“, „\t“, „\v“… стават управляващи символи – трябва „\\“
      const single = /(?<!\\)\\(?![\\'"])/.test(attrs.ask.replace(/\\\\/g, ''));
      if (single) {
        console.log(`✗ ${where}: единична „\\“ в ask: ${attrs.ask}`);
        problems++;
      }
      const labels = Function(`return ${attrs.ask}`)();
      if (labels.length !== values.length) {
        console.log(`✗ ${where}: ${values.length} отговора, а ${labels.length} етикета`);
        problems++;
      }
    }
    const nums = numbersIn(body);
    for (const v of values) {
      if (typeof v !== 'number' || !Number.isFinite(v)) {
        console.log(`✗ ${where}: ${v} не е число`);
        problems++;
      } else if (!nums.some(n => close(n, Math.abs(v)))) {
        console.log(`? ${where}: ${v} не се среща в решението`);
        problems++;
      }
    }
  }
}

console.log(`${withCheck}/${total} задачи с поле за отговор${problems ? `, ${problems} проблема` : ', без проблеми'}`);
if (process.env.LIST_WITHOUT) without.forEach(w => console.log(`  без отговор: ${w}`));
process.exitCode = problems ? 1 : 0;
