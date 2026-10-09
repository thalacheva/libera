# Масив от низове, показван направо в страницата ([[...], ...].map(([a, b, c]) => ...)):
# формулите → $…$, а посочените полета се показват през <MathText displayStyle>.
#   python3 scripts/tex/fix-array.py <файл.tsx> "<откъс от първия ред на масива>" поле1,поле2
#   python3 scripts/tex/fix-array.py <файл.tsx> --mistakes   (картите „Чести грешки“: title, wrong, right)
import json, re, subprocess, sys

p = sys.argv[1]
s = open(p, encoding='utf-8').read()

if sys.argv[2] == '--mistakes':
    marker = '].map(([title, wrong, right]) => ('
    if marker not in s:
        print('няма карти „Чести грешки“'); sys.exit(0)
    end = s.index(marker)
    fields = ['title', 'wrong', 'right']
else:
    snippet = sys.argv[2]
    fields = sys.argv[3].split(',')
    at = s.index(snippet)
    end = s.index('].map(', at)
start = s.rindex('{[', 0, end)

block = s[start:end]
strs = re.findall(r"'((?:[^'\\]|\\.)*)'", block)
todo = [x for x in strs if '$' not in x]
out = json.loads(subprocess.run(['node', 'scripts/tex/mark.mjs'], input=json.dumps(todo), capture_output=True, text=True).stdout)
changed = 0
for a, b in zip(todo, out):
    if a != b:
        block = block.replace(f"'{a}'", "'" + b.replace('\\', '\\\\').replace("'", "\\'") + "'", 1)
        changed += 1
s = s[:start] + block + s[end:]

# JSX след .map(…): {поле} → <MathText displayStyle>{поле}</MathText>; без font-mono
end = s.index('].map(', start)
close = s.index('))}', end)
jsx = s[end:close]
for f in fields:
    # само текстово съдържание: не key={…} и не вече обвито
    jsx = re.sub(r'(?<![=\w])(?<!displayStyle>)\{' + f + r'\}', '<MathText displayStyle>{' + f + '}</MathText>', jsx)
jsx = jsx.replace('font-mono ', '').replace(' font-mono', '')
s = s[:end] + jsx + s[close:]

if re.search(r"import \{ Tex \} from '~/MathText';", s):
    s = s.replace("import { Tex } from '~/MathText';", "import { MathText, Tex } from '~/MathText';")
elif not re.search(r"import \{[^}]*\bMathText\b[^}]*\} from '~/MathText'", s):
    lines = s.split('\n')
    last = max(i for i, l in enumerate(lines) if l.startswith('import ') or l.startswith('} from '))
    lines.insert(last + 1, "import { MathText } from '~/MathText';")
    s = '\n'.join(lines)
open(p, 'w', encoding='utf-8').write(s)
print(f'масив: {changed} низа с формули')
