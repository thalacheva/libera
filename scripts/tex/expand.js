// Отваря всички решения на страницата (за проверка с check.js)
document.querySelectorAll('button').forEach(b => { if (/Цялото решение|Покажи отговора/.test(b.textContent)) b.click(); });
