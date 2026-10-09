#!/bin/sh
# ВНИМАНИЕ: след ръчните корекции на уроците (09.10.2026) този скрипт НЕ бива да се пуска –
# той започва от оригинала в git и би изтрил корекциите. Остава само за справка.
echo 'redo.sh е замразен – виж коментара в началото'; exit 1
# Преминава отново всички вече преобразувани уроци от оригинала в git (след подобрение на инструментите).
# Всеки урок: convert-lesson + картите „Чести грешки“ + ръчните стъпки за него.
set -e
cd "$(dirname "$0")/../.."
T=scripts/tex

lesson() {
  git checkout -q "$1"
  node $T/convert-lesson.mjs "$1"
  python3 $T/fix-array.py "$1" --mistakes
  node $T/fix-arrays.mjs "$1"
}

replace() { # файл, от, към
  python3 -c "import sys; p,a,b=sys.argv[1:]; s=open(p,encoding='utf-8').read(); assert a in s, a; open(p,'w',encoding='utf-8').write(s.replace(a,b,1))" "$@"
}

lesson src/algebra/QuadraticEquations.tsx
replace src/algebra/QuadraticEquations.tsx "['2a дели само корена'," "['\$2a\$ дели само корена',"

lesson src/algebra/Powers.tsx

lesson src/algebra/Logarithms.tsx

lesson src/algebra/Fractions.tsx

lesson src/algebra/LinearEquations.tsx
lesson src/algebra/SystemsOfEquations.tsx
lesson src/algebra/Inequalities.tsx
lesson src/algebra/Sequences.tsx
lesson src/functions/LinearFunctions.tsx
lesson src/functions/QuadraticFunctions.tsx
lesson src/functions/FunctionGraph.tsx
lesson src/geometry/Triangle.tsx
lesson src/geometry/Similarity.tsx
lesson src/geometry/Trigonometry.tsx
lesson src/geometry/Vectors.tsx
lesson src/geometry/Quadrangle.tsx
lesson src/geometry/Polygons.tsx
lesson src/geometry/Circle.tsx
lesson src/geometry/Solids.tsx
lesson src/probability/Combinatorics.tsx
lesson src/probability/Probability.tsx
lesson src/astronomy/Lecture01.tsx
lesson src/astronomy/Lecture02.tsx
lesson src/astronomy/Lecture03.tsx
lesson src/astronomy/Lecture04.tsx
lesson src/astronomy/Lecture05.tsx
lesson src/astronomy/Lecture06.tsx
lesson src/astronomy/Lecture07.tsx
lesson src/astronomy/Lecture08.tsx
# дългата сметка в задачата за Луната – с дроби, за да се побира на телефон
replace src/astronomy/Lecture08.tsx "'v_2 = \\\\sqrt{2GM / R} = \\\\sqrt{2 \\\\cdot 6{,}674\\\\cdot 10^{-11} \\\\cdot 7{,}35\\\\cdot 10^{22} / 1{,}737\\\\cdot 10^6}" "'v_2 = \\\\sqrt{\\\\frac{2GM}{R}} = \\\\sqrt{\\\\frac{2 \\\\cdot 6{,}674\\\\cdot 10^{-11} \\\\cdot 7{,}35\\\\cdot 10^{22}}{1{,}737\\\\cdot 10^6}}"
lesson src/astronomy/Lecture09.tsx
lesson src/astronomy/Lecture10.tsx
lesson src/astronomy/Lecture11.tsx
lesson src/astronomy/Lecture12.tsx
lesson src/astronomy/Lecture13.tsx
lesson src/astronomy/Lecture14.tsx
lesson src/astronomy/Lecture15.tsx
lesson src/astronomy/Lecture16.tsx
lesson src/astronomy/Lecture17.tsx
lesson src/astronomy/Lecture18.tsx
lesson src/astronomy/Lecture19.tsx
lesson src/astronomy/Lecture20.tsx
lesson src/astronomy/Lecture21.tsx
lesson src/astronomy/Lecture22.tsx
lesson src/astronomy/Lecture23.tsx
lesson src/astronomy/Lecture24.tsx
lesson src/astronomy/Lecture25.tsx
lesson src/astronomy/Lecture26.tsx
lesson src/astronomy/Lecture27.tsx
lesson src/astronomy/Lecture28.tsx
lesson src/astronomy/Lecture29.tsx
lesson src/astronomy/Lecture30.tsx
lesson src/astronomy/Lecture31.tsx
lesson src/astronomy/Lecture32.tsx
lesson src/astronomy/Lecture33.tsx

npx tsc --noEmit -p .
