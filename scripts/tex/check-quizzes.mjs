// node scripts/tex/check-quizzes.mjs <файл.tsx>…
// Проверява тестовете: верният отговор е сред вариантите и не се откроява по вид
// (единственият с формула или единственият без формула).
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../package.json', import.meta.url));
const ts = require('typescript');
let problems = 0;

for (const file of process.argv.slice(2)) {
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = node => {
    if (ts.isObjectLiteralExpression(node)) {
      const get = name => node.properties.find(p => ts.isPropertyAssignment(p) && p.name.getText() === name);
      const answers = get('answers');
      const correct = get('correctAnswer');
      if (answers && correct && ts.isArrayLiteralExpression(answers.initializer) && ts.isStringLiteral(correct.initializer)) {
        const list = answers.initializer.elements.filter(ts.isStringLiteral).map(e => e.text);
        const right = correct.initializer.text;
        const line = sf.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        if (!list.includes(right)) {
          problems++;
          console.log(`${file}:${line}  верният отговор не е сред вариантите: «${right}»`);
        } else {
          const isMath = s => s.includes('$');
          const mathCount = list.filter(isMath).length;
          if ((mathCount === 1 && isMath(right)) || (mathCount === list.length - 1 && !isMath(right))) {
            problems++;
            console.log(`${file}:${line}  верният отговор се откроява (${isMath(right) ? 'единствен с формула' : 'единствен без формула'}): ${JSON.stringify(list)}`);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}
console.log(problems ? `${problems} проблема` : 'тестовете са наред');
process.exit(problems ? 1 : 0);
