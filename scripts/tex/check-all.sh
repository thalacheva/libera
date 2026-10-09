#!/bin/sh
# Проверява страниците в браузъра (dev сървър на :5179) при 1280 и 390 px, с отворени решения.
# sh scripts/tex/check-all.sh [страница…]   (по подразбиране – всички уроци)
cd "$(dirname "$0")/../.."
PAGES="$*"
if [ -z "$PAGES" ]; then
  PAGES="algebra/fractions algebra/powers algebra/logarithms algebra/linear algebra/quadratic algebra/systems algebra/inequalities algebra/sequences functions/linear functions/quadratic functions/grapher geometry/triangle geometry/similar geometry/trigonometry geometry/vectors geometry/quadrilateral geometry/polygons geometry/circle geometry/solids probability/combinatorics probability/basics"
  for i in $(seq -w 1 33); do PAGES="$PAGES astronomy/lecture$i"; done
fi
for page in $PAGES; do
  for w in 1280 390; do
    agent-browser set viewport $w 900 >/dev/null
    agent-browser open "http://localhost:5179/$page" >/dev/null
    agent-browser wait 1200 >/dev/null
    agent-browser eval --stdin < scripts/tex/expand.js >/dev/null
    agent-browser wait 300 >/dev/null
    r=$(agent-browser eval --stdin < scripts/tex/check.js 2>&1)
    if echo "$r" | grep -q 'errors\\":\[\],\\"rawDollar\\":\[\],\\"overflow\\":\[\]'; then
      echo "ok   $page $w $(echo "$r" | grep -o 'katex[^,]*')"
    else
      echo "FAIL $page $w $r"
    fi
  done
done
