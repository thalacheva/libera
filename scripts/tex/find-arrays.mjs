// node scripts/tex/find-arrays.mjs <файл.tsx>…
// Намира масиви в страницата ([…].map(…)), чиито низове съдържат формули и се показват направо –
// кандидати за fix-array.py. Картите „Чести грешки“ (title, wrong, right) се пропускат.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { markMath } from './unicode2tex.mjs';

const require = createRequire(new URL('../../package.json', import.meta.url));
const ts = require('typescript');

for (const file of process.argv.slice(2)) {
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (node, inPage) => {
    if (ts.isFunctionDeclaration(node)) inPage = Boolean(node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword));
    if (inPage && ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'map') {
      let target = node.expression.expression;
      // масив, деклариран като константа извън страницата
      if (ts.isIdentifier(target)) {
        const decl = sf.statements.flatMap(s => (ts.isVariableStatement(s) ? s.declarationList.declarations : [])).find(d => d.name.getText() === target.text);
        if (decl?.initializer && ts.isArrayLiteralExpression(decl.initializer)) target = decl.initializer;
      }
      if (ts.isArrayLiteralExpression(target)) {
        const strings = [];
        const collect = n => {
          if (ts.isStringLiteral(n) && !n.text.includes('$')) strings.push(n.text);
          ts.forEachChild(n, collect);
        };
        collect(target);
        const withMath = strings.filter(s => markMath(s) !== s);
        const fn = node.arguments[0];
        const params = fn && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) ? fn.parameters.map(p => p.name.getText()).join(', ') : '?';
        if (withMath.length && !/title, wrong, right/.test(params)) {
          const line = sf.getLineAndCharacterOfPosition(target.getStart()).line + 1;
          console.log(`${file}:${line}  (${params})  ${withMath.length} низа, напр. «${withMath[0].slice(0, 50)}»`);
        }
      }
    }
    ts.forEachChild(node, n => visit(n, inPage));
  };
  visit(sf, false);
}
