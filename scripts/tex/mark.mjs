// Чете JSON масив от низове от stdin и отпечатва JSON с формулите в $…$
import { markMath } from './unicode2tex.mjs';
let input = '';
process.stdin.on('data', d => (input += d));
process.stdin.on('end', () => console.log(JSON.stringify(JSON.parse(input).map(s => markMath(s)), null, 1)));
