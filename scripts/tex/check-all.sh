#!/bin/sh
# Проверява страниците в браузъра (dev сървър на :5179) при 1280 и 390 px, с отворени решения.
# sh scripts/tex/check-all.sh [страница…]   (по подразбиране – всички уроци)
cd "$(dirname "$0")/../.."
PAGES="$*"
if [ -z "$PAGES" ]; then
  PAGES="algebra/fractions algebra/powers algebra/logarithms algebra/linear algebra/quadratic algebra/systems algebra/matrices algebra/inequalities algebra/olympiad-inequalities algebra/sequences algebra/complex numbers/number-sets numbers/divisibility numbers/gcd numbers/modular functions/linear functions/quadratic functions/grapher analysis/limits analysis/derivatives analysis/integrals analysis/differential-equations geometry/triangle geometry/similar geometry/trigonometry geometry/vectors geometry/quadrilateral geometry/polygons geometry/circle geometry/solids probability/combinatorics probability/basics physics/mechanics/units physics/mechanics/linear-motion physics/mechanics/plane-motion physics/mechanics/newton physics/mechanics/energy physics/mechanics/momentum physics/mechanics/rotation physics/mechanics/statics-fluids physics/waves/oscillations physics/waves/waves physics/waves/sound physics/heat/temperature physics/heat/ideal-gas physics/heat/thermodynamics physics/electricity/electrostatics physics/electricity/capacitors physics/electricity/direct-current physics/electricity/magnetic-field physics/electricity/induction physics/electricity/ac-em-waves physics/optics/reflection-refraction physics/optics/lenses physics/optics/wave-optics physics/modern/photons physics/modern/atom physics/modern/nucleus physics/modern/uncertainty physics/modern/particle-in-box physics/modern/quantum-atom chemistry/structure/substances chemistry/structure/atoms chemistry/structure/bonding chemistry/structure/molecules chemistry/quantities/mole chemistry/quantities/stoichiometry chemistry/quantities/solutions chemistry/quantities/gases chemistry/reactions/energy chemistry/reactions/kinetics chemistry/reactions/equilibrium chemistry/reactions/acids-bases chemistry/reactions/redox chemistry/inorganic/metals chemistry/inorganic/nonmetals chemistry/inorganic/compound-classes chemistry/inorganic/qualitative-analysis chemistry/organic/hydrocarbons chemistry/organic/functional-groups chemistry/organic/mechanisms chemistry/organic/polymers chemistry/organic/biomolecules chemistry/world/nuclear chemistry/world/environment chemistry/world/spectroscopy biology/cell/life biology/cell/structure biology/cell/membrane biology/cell/division"
  PAGES="$PAGES astronomy/intro"
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
