// node convert-lesson.mjs <файл.tsx> [--dry]
// Намира формулите в текста на урока и ги превръща в KaTeX:
//  – текст в JSX → <Tex>{'…'}</Tex>
//  – низове (description, steps, question, answers, problem, solution, …) → $…$
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { splitMath, wholeTex } from './unicode2tex.mjs';

const require = createRequire(new URL('../../package.json', import.meta.url));
const ts = require('typescript');

const file = process.argv[2];
const dry = process.argv.includes('--dry');
const src = fs.readFileSync(file, 'utf8');
const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

const STRING_ATTRS = new Set(['description', 'question']);
const ARRAY_ATTRS = new Set(['steps']);
const PROPS = new Set(['question', 'answers', 'correctAnswer', 'problem', 'solution', 'answer', 'explanation']);

const edits = [];
let usedTex = false;
let stats = { jsx: 0, strings: 0, formulas: 0 };

const tsString = s => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const decode = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const encode = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');

function marked(text) {
  const parts = splitMath(text);
  if (!parts.some(p => p.tex !== undefined)) return null;
  stats.formulas += parts.filter(p => p.tex !== undefined).length;
  return parts.map(p => (p.tex !== undefined ? `$${p.tex}$` : p.text)).join('');
}

const NUMBER = /^[−-]?\d+(,\d+)?%?$/;

function convertStringNode(node, { numbers = false } = {}) {
  // StringLiteral или шаблон без замествания
  const value = node.text;
  if (value.includes('$')) return;
  // в отговорите на теста и чистите числа стават формули – за еднакъв вид
  const m = numbers && NUMBER.test(value) ? `$${value.replace('−', '-').replace(',', '{,}').replace('%', '\\%')}$` : marked(value);
  if (m === null) return;
  stats.strings++;
  const parent = node.parent;
  if (ts.isJsxAttribute(parent)) {
    // JSX атрибут: "…" – обратната наклонена черта е буквална
    if (m.includes('"')) edits.push([node.getStart(), node.getEnd(), `{${tsString(m)}}`]);
    else edits.push([node.getStart(), node.getEnd(), `"${m}"`]);
  } else {
    edits.push([node.getStart(), node.getEnd(), tsString(m)]);
  }
}

function convertJsxText(node) {
  const raw = node.getFullText();
  const text = decode(raw);
  if (!text.trim()) return;
  const parts = splitMath(text);
  if (!parts.some(p => p.tex !== undefined)) return;
  stats.jsx++;
  stats.formulas += parts.filter(p => p.tex !== undefined).length;
  usedTex = true;
  let out = '';
  parts.forEach((p, i) => {
    if (p.tex !== undefined) {
      out += `<Tex>{${tsString(p.tex)}}</Tex>`;
      return;
    }
    let t = p.text;
    const prevTex = i > 0 && parts[i - 1].tex !== undefined;
    const nextTex = i < parts.length - 1 && parts[i + 1].tex !== undefined;
    // интервал до формулата, който JSX би изтрил заради нов ред
    const lead = t.match(/^\s+/)?.[0] ?? '';
    const trail = t.match(/\s+$/)?.[0] ?? '';
    let prefix = '';
    let suffix = '';
    if (prevTex && lead.includes('\n')) { prefix = "{' '}"; }
    if (nextTex && trail.includes('\n') && t.trim()) { suffix = "{' '}"; }
    if (nextTex && !t.trim() && t.includes('\n') && prevTex) { prefix = "{' '}"; }
    out += prefix + encode(t) + suffix;
  });
  edits.push([node.getFullStart(), node.getEnd(), out]);
}

let inPage = false;
const ANSWERS = new Map();
const CYR = /[А-Яа-яЁё]/;

function visit(node) {
  // Текстът в JSX се обработва само в експортираната страница на урока, не в лабораториите
  if (ts.isFunctionDeclaration(node)) {
    const exported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
    const prev = inPage;
    inPage = Boolean(exported);
    ts.forEachChild(node, visit);
    inPage = prev;
    return;
  }
  if (ts.isJsxText(node)) {
    if (!inPage) return;
    // текст вътре в <style>/<svg><text> не пипаме
    const el = node.parent;
    const tag = ts.isJsxElement(el) ? el.openingElement.tagName.getText() : '';
    if (!['text', 'tspan', 'title', 'style', 'option'].includes(tag)) convertJsxText(node);
    return;
  }
  if (ts.isJsxAttribute(node) && node.initializer) {
    const name = node.name.getText();
    const init = node.initializer;
    // заглавие на теорема/дефиниция
    const tag = node.parent?.parent && ts.isJsxSelfClosingElement(node.parent.parent) ? node.parent.parent.tagName.getText() : '';
    if (STRING_ATTRS.has(name) || (name === 'title' && tag === 'Theorem')) {
      if (ts.isStringLiteral(init)) convertStringNode(init);
      else if (ts.isJsxExpression(init) && init.expression && (ts.isStringLiteral(init.expression) || ts.isNoSubstitutionTemplateLiteral(init.expression))) convertStringNode(init.expression);
      return;
    }
    if (ARRAY_ATTRS.has(name) && ts.isJsxExpression(init) && init.expression && ts.isArrayLiteralExpression(init.expression)) {
      for (const el of init.expression.elements) if (ts.isStringLiteral(el) || ts.isNoSubstitutionTemplateLiteral(el)) convertStringNode(el);
      return;
    }
  }
  // Отговорите в тест: ако някой съдържа формула, всички без кирилица стават формули (иначе верният се откроява)
  if (ts.isPropertyAssignment(node) && node.name.getText() === 'answers' && ts.isArrayLiteralExpression(node.initializer)) {
    const els = node.initializer.elements.filter(el => ts.isStringLiteral(el));
    const converted = els.map(el => (el.text.includes('$') ? el.text : marked(el.text) ?? el.text));
    const anyMath = converted.some(c => c.includes('$'));
    els.forEach((el, k) => {
      let v = converted[k];
      if (anyMath && !v.includes('$') && !CYR.test(v) && v.trim()) v = `$${wholeTex(v)}$`;
      if (v !== el.text) {
        ANSWERS.set(el.text, v);
        stats.strings++;
        edits.push([el.getStart(), el.getEnd(), tsString(v)]);
      }
    });
    return;
  }
  if (ts.isPropertyAssignment(node) && node.name.getText() === 'correctAnswer' && ts.isStringLiteral(node.initializer) && ANSWERS.has(node.initializer.text)) {
    edits.push([node.initializer.getStart(), node.initializer.getEnd(), tsString(ANSWERS.get(node.initializer.text))]);
    return;
  }
  if (ts.isPropertyAssignment(node) && PROPS.has(node.name.getText())) {
    const init = node.initializer;
    const numbers = ['answers', 'correctAnswer'].includes(node.name.getText());
    if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)) convertStringNode(init, { numbers });
    else if (ts.isArrayLiteralExpression(init)) {
      for (const el of init.elements) if (ts.isStringLiteral(el) || ts.isNoSubstitutionTemplateLiteral(el)) convertStringNode(el, { numbers });
    }
    return;
  }
  ts.forEachChild(node, visit);
}
visit(sf);

edits.sort((a, b) => b[0] - a[0]);
let out = src;
for (const [s, e, t] of edits) out = out.slice(0, s) + t + out.slice(e);

if (usedTex && !/import \{[^}]*\bTex\b[^}]*\} from '~\/MathText'/.test(out)) {
  // импортът – след последния import
  const lines = out.split('\n');
  let last = -1;
  lines.forEach((l, i) => { if (/^import /.test(l) || /^} from /.test(l)) last = i; });
  lines.splice(last + 1, 0, "import { Tex } from '~/MathText';");
  out = lines.join('\n');
}

console.log(JSON.stringify(stats));
if (!dry) fs.writeFileSync(file, out);
else process.stdout.write(out);
