// node scripts/tex/validate.mjs <файл.tsx>…
// Рендира с KaTeX (строг режим) всяка формула във файловете: <Tex>{'…'}</Tex> и $…$ в низове.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import katex from 'katex';

const require = createRequire(new URL('../../package.json', import.meta.url));
const ts = require('typescript');
const macros = { '\\tg': '\\operatorname{tg}', '\\cotg': '\\operatorname{cotg}' };
let bad = 0;
let total = 0;

const check = (tex, file, node, sf) => {
  total++;
  try {
    katex.renderToString(tex, { throwOnError: true, strict: 'ignore', macros: { ...macros } });
  } catch (e) {
    bad++;
    const line = sf.getLineAndCharacterOfPosition(node.getStart()).line + 1;
    console.log(`${file}:${line}  ${e.message.split('\n')[0]}\n   ${tex}`);
  }
};

for (const file of process.argv.slice(2)) {
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = node => {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText() === 'Tex') {
      const child = node.children.find(c => ts.isJsxExpression(c));
      const e = child?.expression;
      if (e && (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e))) check(e.text, file, node, sf);
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isJsxText(node)) {
      const text = ts.isJsxText(node) ? '' : node.text;
      for (const m of text.matchAll(/\$\$([^$]+)\$\$|\$([^$]+)\$/g)) check(m[1] ?? m[2], file, node, sf);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}
console.log(`${total - bad}/${total} формули без грешка`);
process.exit(bad ? 1 : 0);
