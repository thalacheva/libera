// node scripts/tex/fix-arrays.mjs <файл.tsx> [--dry]
// Масиви, показвани направо в страницата ([…].map(…) или константа.map(…)):
//  – намира кои полета се показват като текст в JSX ({name}, {row.desc});
//  – превръща формулите само в тези полета ($…$);
//  – обвива показването им в <MathText>.
// Картите „Чести грешки“ (title, wrong, right) се оставят на fix-array.py --mistakes.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { markMath } from './unicode2tex.mjs';

const require = createRequire(new URL('../../package.json', import.meta.url));
const ts = require('typescript');

const file = process.argv[2];
const dry = process.argv.includes('--dry');
const src = fs.readFileSync(file, 'utf8');
const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

const edits = [];
const done = new Set();
let wrapped = 0;
let converted = 0;

const tsString = s => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const SKIP_TAGS = new Set(['text', 'tspan', 'title', 'option', 'style']);

function tagOf(jsxExpr) {
  const el = jsxExpr.parent;
  if (ts.isJsxElement(el)) return el.openingElement.tagName.getText();
  if (ts.isJsxFragment(el)) return '';
  return null; // атрибут или друго
}

function convertString(node) {
  if (done.has(node.pos) || node.text.includes('$')) return;
  const m = markMath(node.text);
  if (m === node.text) return;
  done.add(node.pos);
  converted++;
  edits.push([node.getStart(), node.getEnd(), tsString(m)]);
}

function arrayFor(expr) {
  if (ts.isArrayLiteralExpression(expr)) return expr;
  if (ts.isIdentifier(expr)) {
    for (const st of sf.statements) {
      if (!ts.isVariableStatement(st)) continue;
      for (const d of st.declarationList.declarations) {
        if (d.name.getText() === expr.text && d.initializer) {
          let init = d.initializer;
          if (ts.isAsExpression(init) || ts.isSatisfiesExpression?.(init)) init = init.expression;
          if (ts.isArrayLiteralExpression(init)) return init;
        }
      }
    }
  }
  return null;
}

function handleMap(call) {
  const array = arrayFor(call.expression.expression);
  const fn = call.arguments[0];
  if (!array || !fn || !(ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) || !fn.parameters.length) return;
  const param = fn.parameters[0].name;
  const names = new Map(); // име на променлива → индекс в кортежа
  let objectName = null;
  if (ts.isArrayBindingPattern(param)) {
    param.elements.forEach((el, i) => {
      if (ts.isBindingElement(el) && !el.dotDotDotToken && ts.isIdentifier(el.name)) names.set(el.name.text, i);
    });
    if ([...names.keys()].join(',') === 'title,wrong,right') return;
  } else if (ts.isIdentifier(param)) {
    objectName = param.text;
  } else if (ts.isObjectBindingPattern(param)) {
    param.elements.forEach(el => {
      const prop = (el.propertyName ?? el.name).getText();
      if (ts.isIdentifier(el.name)) names.set(el.name.text, prop);
    });
  } else return;

  const shown = new Set(); // индекси или имена на свойства, които се показват като текст
  const visit = n => {
    if (ts.isJsxExpression(n) && n.expression) {
      const tag = tagOf(n);
      if (tag !== null && !SKIP_TAGS.has(tag)) {
        const e = n.expression;
        let key = null;
        if (ts.isIdentifier(e) && names.has(e.text)) key = names.get(e.text);
        else if (objectName && ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.expression) && e.expression.text === objectName) key = e.name.text;
        if (key !== null) {
          shown.add(key);
          edits.push([n.getStart(), n.getEnd(), `<MathText>${n.getText()}</MathText>`]);
          wrapped++;
        }
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(fn.body);
  if (!shown.size) return;

  for (const item of array.elements) {
    if (ts.isArrayLiteralExpression(item)) {
      item.elements.forEach((el, i) => {
        if (shown.has(i) && ts.isStringLiteral(el)) convertString(el);
      });
    } else if (ts.isObjectLiteralExpression(item)) {
      for (const p of item.properties) {
        if (ts.isPropertyAssignment(p) && shown.has(p.name.getText()) && ts.isStringLiteral(p.initializer)) convertString(p.initializer);
      }
    }
  }
}

const visit = (node, inPage) => {
  if (ts.isFunctionDeclaration(node)) inPage = Boolean(node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword));
  if (inPage && ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'map') handleMap(node);
  ts.forEachChild(node, n => visit(n, inPage));
};
visit(sf, false);

// обвиването има смисъл само ако някой от низовете съдържа формула
let out = src;
if (converted) {
  edits.sort((a, b) => b[0] - a[0]);
  for (const [s, e, t] of edits) out = out.slice(0, s) + t + out.slice(e);
  if (!/import \{[^}]*\bMathText\b[^}]*\} from '~\/MathText'/.test(out)) {
    if (/import \{ Tex \} from '~\/MathText';/.test(out)) out = out.replace("import { Tex } from '~/MathText';", "import { MathText, Tex } from '~/MathText';");
    else {
      const lines = out.split('\n');
      let last = -1;
      lines.forEach((l, i) => { if (/^import /.test(l) || /^} from /.test(l)) last = i; });
      lines.splice(last + 1, 0, "import { MathText } from '~/MathText';");
      out = lines.join('\n');
    }
  }
}
console.log(JSON.stringify({ arrays: 'ok', converted, wrapped: converted ? wrapped : 0 }));
if (!dry) fs.writeFileSync(file, out);
